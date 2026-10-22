import { WebSocket, WebSocketServer } from 'ws';
import type { RoseSeat, RoseRole, RoseMatchState } from '../../src/rose/types.ts';
import {
  createRoseRoom,
  joinRoseRoom,
  getRoomById,
  getRoomByCode,
  getPublicRoseRooms,
  destroyRoom,
  type RoseRoom,
} from './roseRooms.ts';
import { applyRoseMove, applyRoseSummon, getSeatByUserId } from '../../src/rose/roseRules.ts';
import { isKingInCheck } from '../../src/game/engine.ts';
import { getUserIdFromSession } from '../auth.ts';
import { db } from '../db.ts';

interface ExtendedSocket extends WebSocket {
  userId?: string;
  username?: string;
  displayName?: string;
  avatarId?: string;
  roseRoomId?: string;
  isAlive?: boolean;
}

export function registerRoseSocket(wss: WebSocketServer) {
  function broadcastRoom(room: RoseRoom, data: any) {
    const payload = JSON.stringify(data);
    for (const ws of room.sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  function broadcastPublicRoseRooms() {
    const list = getPublicRoseRooms();
    const payload = JSON.stringify({ type: 'rose:rooms_list', rooms: list });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  wss.on('connection', (ws: ExtendedSocket) => {
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (!data.type || !data.type.startsWith('rose:')) return;
        handleRoseMessage(ws, data);
      } catch (err) {
        console.error('Rose socket message error:', err);
      }
    });

    ws.on('close', () => {
      if (ws.roseRoomId) {
        const room = getRoomById(ws.roseRoomId);
        if (room) {
          room.sockets.delete(ws);
          if (room.match.status === 'waiting_guest' && room.hostWs === ws) {
            destroyRoom(room.match.id);
            broadcastPublicRoseRooms();
          } else if (room.match.status === 'active' && ws.userId) {
            const seat = getSeatByUserId(room.match, ws.userId);
            if (seat) seat.isConnected = false;
            broadcastRoom(room, { type: 'rose:state', match: room.match });
          }
        }
      }
    });
  });

  function resolveUser(ws: ExtendedSocket, data: any): { userId: string; username: string; displayName: string; avatarId?: string } {
    let userId = ws.userId || data.userId;
    if (!userId && data.token) {
      userId = getUserIdFromSession(data.token);
    }
    if (!userId) {
      userId = `guest_${Math.random().toString(36).substring(2, 7)}`;
    }

    const userRecord = db.findUserById(userId);
    const username = userRecord?.username || ws.username || data.username || 'Gardener';
    const displayName = userRecord?.displayName || ws.displayName || data.displayName || username;
    const avatarId = userRecord?.avatarId || ws.avatarId || data.avatarId;

    return { userId, username, displayName, avatarId };
  }

  function handleRoseMessage(ws: ExtendedSocket, data: any) {
    try {
      const { type, roomId, code, role, from, to, pieceType, text } = data;
      const user = resolveUser(ws, data);
      ws.userId = user.userId;

      switch (type) {
        case 'rose:list_rooms': {
          ws.send(JSON.stringify({ type: 'rose:rooms_list', rooms: getPublicRoseRooms() }));
          break;
        }

        case 'rose:create':
        case 'rose:create_room': {
          const chosenRole: RoseRole = role === 'girlfriend' ? 'girlfriend' : 'boyfriend';
          // Untimed couples chess by default (timeControl = 0)
          const room = createRoseRoom(
            user.userId,
            user.username,
            user.displayName,
            user.avatarId || (chosenRole === 'boyfriend' ? 'avatar_prince' : 'avatar_queen'),
            chosenRole,
            0, // Untimed
            true,
            ws
          );

          ws.roseRoomId = room.match.id;

          ws.send(JSON.stringify({
            type: 'rose:created',
            code: room.match.code,
            match: room.match,
            yourColor: room.match.whiteSeat?.userId === user.userId ? 'white' : 'black',
            yourRole: chosenRole,
          }));

          broadcastPublicRoseRooms();
          break;
        }

        case 'rose:join':
        case 'rose:join_room': {
          const targetCode = String(code || '').trim().toUpperCase();
          if (!targetCode) {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Room code cannot be empty.' }));
            return;
          }

          const res = joinRoseRoom(
            targetCode,
            user.userId,
            user.username,
            user.displayName,
            user.avatarId || 'avatar_queen',
            ws
          );

          if (!res.success || !res.room || !res.hostSeat || !res.guestSeat) {
            ws.send(JSON.stringify({ type: 'rose:error', message: res.error || 'Failed to join Rose room.' }));
            return;
          }

          const room = res.room;
          ws.roseRoomId = room.match.id;

          // INSTANTANEOUS START: Notify both Host and Guest with zero lag!
          if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
            room.hostWs.send(JSON.stringify({
              type: 'rose:match_started',
              match: room.match,
              yourColor: res.hostSeat.color,
              yourRole: res.hostSeat.role,
            }));
          }

          ws.send(JSON.stringify({
            type: 'rose:match_started',
            match: room.match,
            yourColor: res.guestSeat.color,
            yourRole: res.guestSeat.role,
          }));

          // Broadcast state to all sockets in room
          broadcastRoom(room, { type: 'rose:state', match: room.match });

          // Update lobby list
          broadcastPublicRoseRooms();
          break;
        }

        case 'rose:cancel':
        case 'rose:cancel_room': {
          const rId = ws.roseRoomId || roomId;
          if (rId) {
            destroyRoom(rId);
            ws.roseRoomId = undefined;
          }
          ws.send(JSON.stringify({ type: 'rose:cancelled' }));
          broadcastPublicRoseRooms();
          break;
        }

        case 'rose:move': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room || room.match.status !== 'active') {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Match is not active.' }));
            return;
          }

          let seat = getSeatByUserId(room.match, user.userId);
          if (!seat) {
            if (ws === room.hostWs) {
              seat = room.match.whiteSeat?.userId === room.hostUserId ? room.match.whiteSeat : room.match.blackSeat;
            } else if (ws === room.guestWs) {
              seat = room.match.whiteSeat?.userId === room.hostUserId ? room.match.blackSeat : room.match.whiteSeat;
            }
          }
          if (!seat && room.match.status === 'active') {
            seat = room.match.turn === 'white' ? room.match.whiteSeat : room.match.blackSeat;
          }

          if (!seat || seat.color !== room.match.turn) {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Not your turn.' }));
            return;
          }

          const res = applyRoseMove(room.match, from, to);
          if (!res.success || !res.state) {
            ws.send(JSON.stringify({ type: 'rose:error', message: res.error || 'Invalid move.' }));
            return;
          }

          room.match = res.state;
          broadcastRoom(room, {
            type: 'rose:moved',
            match: room.match,
            lastMove: res.state.lastMove,
          });
          break;
        }

        case 'rose:summon': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room || room.match.status !== 'active') {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Match is not active.' }));
            return;
          }

          let seat = getSeatByUserId(room.match, user.userId);
          if (!seat) {
            if (ws === room.hostWs) {
              seat = room.match.whiteSeat?.userId === room.hostUserId ? room.match.whiteSeat : room.match.blackSeat;
            } else if (ws === room.guestWs) {
              seat = room.match.whiteSeat?.userId === room.hostUserId ? room.match.blackSeat : room.match.whiteSeat;
            }
          }
          if (!seat && room.match.status === 'active') {
            seat = room.match.turn === 'white' ? room.match.whiteSeat : room.match.blackSeat;
          }

          if (!seat || seat.color !== room.match.turn) {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Not your turn.' }));
            return;
          }

          if (room.match.inCheck === seat.color || isKingInCheck(room.match.board, seat.color)) {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Cannot summon while King is in check. Escape check first!' }));
            return;
          }

          const res = applyRoseSummon(room.match, seat.color, pieceType, to);
          if (!res.success || !res.state) {
            ws.send(JSON.stringify({ type: 'rose:error', message: res.error || 'Summon failed.' }));
            return;
          }

          room.match = res.state;
          broadcastRoom(room, { type: 'rose:state', match: room.match });
          break;
        }

        case 'rose:reaction': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room) return;

          broadcastRoom(room, {
            type: 'rose:reaction',
            reaction: {
              id: `rx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              senderUserId: user.userId,
              text: text || '❤️',
              timestamp: Date.now(),
            },
          });
          break;
        }

        case 'rose:chat': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room || !text) return;

          broadcastRoom(room, {
            type: 'rose:chat',
            message: {
              id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              senderUserId: user.userId,
              senderDisplayName: user.displayName,
              text: String(text).slice(0, 150),
              timestamp: Date.now(),
            },
          });
          break;
        }

        case 'rose:resign': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room || room.match.status !== 'active') return;

          const seat = getSeatByUserId(room.match, user.userId);
          const opponentSeat = room.match.whiteSeat?.userId === user.userId ? room.match.blackSeat : room.match.whiteSeat;
          
          room.match.status = 'completed';
          room.match.winner = opponentSeat?.role || (seat?.role === 'boyfriend' ? 'girlfriend' : 'boyfriend');
          room.match.winReason = `${seat?.displayName || 'Player'} resigned with loving grace.`;
          room.match.updatedAt = Date.now();

          broadcastRoom(room, { type: 'rose:state', match: room.match });
          break;
        }

        case 'rose:resync':
        case 'rose:resyncRequest': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (room) {
            ws.send(JSON.stringify({ type: 'rose:state', match: room.match }));
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Rose message handling error:', err);
      try {
        ws.send(JSON.stringify({ type: 'rose:error', message: 'Internal server error.' }));
      } catch {}
    }
  }
}
