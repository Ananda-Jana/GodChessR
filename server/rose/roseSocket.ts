import { WebSocket, WebSocketServer } from 'ws';
import type { RoseSeat, RoseRole, RoseMatchState } from '../../src/rose/types.ts';
import {
  createRoseRoom,
  getRoomById,
  getRoomByCode,
  getUserActiveRoomId,
  destroyRoom,
  type RoseRoom,
} from './roseRooms.ts';
import { applyRoseMove, applyRoseSummon, getSeatByUserId, getSeatByColor } from '../../src/rose/roseRules.ts';

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
          if (ws.userId) {
            const seat = getSeatByUserId(room.match, ws.userId);
            if (seat) seat.isConnected = false;
          }
          broadcastRoom(room, { type: 'rose:roomState', match: room.match });
        }
      }
    });
  });

  function handleRoseMessage(ws: ExtendedSocket, data: any) {
    try {
      const { type, roomId, code, role, timeControl, moveSuggestions, from, to, pieceType, text } = data;

      switch (type) {
        case 'rose:create': {
          if (!ws.userId) {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Authentication required.' }));
            return;
          }
          const chosenRole: RoseRole = role === 'girlfriend' ? 'girlfriend' : 'boyfriend';
          const tc = timeControl === 120 ? 120 : 60;
          const room = createRoseRoom(
            ws.userId,
            ws.username || 'User',
            ws.displayName || ws.username || 'Gardener',
            ws.avatarId || 'avatar_prince',
            chosenRole,
            tc,
            moveSuggestions !== false
          );

          ws.roseRoomId = room.match.id;
          room.sockets.add(ws);
          room.hostWs = ws;

          ws.send(JSON.stringify({ type: 'rose:roomState', match: room.match }));
          break;
        }

        case 'rose:join': {
          if (!ws.userId) {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Authentication required.' }));
            return;
          }
          const targetCode = code?.trim();
          const room = getRoomByCode(targetCode);
          if (!room || room.match.status !== 'waiting_guest') {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Invalid or expired Rose room code.' }));
            return;
          }

          const hostSeat = room.match.whiteSeat || room.match.blackSeat;
          if (hostSeat && hostSeat.userId === ws.userId) {
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Cannot join your own room.' }));
            return;
          }

          const guestRole: RoseRole = hostSeat?.role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
          const guestColor = hostSeat?.color === 'white' ? 'black' : 'white';
          const resumeToken = Math.random().toString(36).slice(2);

          const guestSeat: RoseSeat = {
            userId: ws.userId,
            username: ws.username || 'User',
            displayName: ws.displayName || ws.username || 'Gardener',
            avatarId: ws.avatarId || 'avatar_princess',
            role: guestRole,
            color: guestColor,
            petals: 0,
            summonsUsed: 0,
            lastLoveLinkTurn: 0,
            resumeToken,
            isConnected: true,
            lastSeen: Date.now(),
          };

          if (guestColor === 'white') room.match.whiteSeat = guestSeat;
          else room.match.blackSeat = guestSeat;

          room.match.status = 'handshake';
          room.sockets.add(ws);
          room.guestWs = ws;
          ws.roseRoomId = room.match.id;

          broadcastRoom(room, { type: 'rose:roomState', match: room.match });
          break;
        }

        case 'rose:ready': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room || !ws.userId) return;

          room.readySockets.add(ws.userId);
          if (room.readySockets.size >= 2) {
            room.match.status = 'countdown';
            room.match.lastTurnStartTime = Date.now();
            broadcastRoom(room, { type: 'rose:start', match: room.match, serverTime: Date.now() });

            setTimeout(() => {
              if (room.match.status === 'countdown') {
                room.match.status = 'active';
                room.match.lastTurnStartTime = Date.now();
                broadcastRoom(room, { type: 'rose:state', match: room.match });
              }
            }, 3000);
          } else {
            broadcastRoom(room, { type: 'rose:roomState', match: room.match });
          }
          break;
        }

        case 'rose:move': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room || room.match.status !== 'active' || !ws.userId) {
            ws.send(JSON.stringify({ type: 'rose:reject', reason: 'Not active or invalid room.' }));
            return;
          }

          const seat = getSeatByUserId(room.match, ws.userId);
          if (!seat || seat.color !== room.match.turn) {
            ws.send(JSON.stringify({ type: 'rose:reject', reason: 'Not your turn.' }));
            return;
          }

          const res = applyRoseMove(room.match, from, to);
          if (!res.success || !res.state) {
            ws.send(JSON.stringify({ type: 'rose:reject', reason: res.error || 'Invalid move.' }));
            return;
          }

          room.match = res.state;
          broadcastRoom(room, { type: 'rose:state', match: room.match });
          break;
        }

        case 'rose:summon': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room || room.match.status !== 'active' || !ws.userId) {
            ws.send(JSON.stringify({ type: 'rose:reject', reason: 'Not active or invalid room.' }));
            return;
          }

          const res = applyRoseSummon(room.match, ws.userId, pieceType, to);
          if (!res.success || !res.state) {
            ws.send(JSON.stringify({ type: 'rose:reject', reason: res.error || 'Summon failed.' }));
            return;
          }

          room.match = res.state;
          broadcastRoom(room, { type: 'rose:state', match: room.match });
          break;
        }

        case 'rose:reaction': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room || !ws.userId) return;

          broadcastRoom(room, {
            type: 'rose:reaction',
            reaction: {
              id: Math.random().toString(36).slice(2),
              senderUserId: ws.userId,
              text: text || '❤️',
              timestamp: Date.now(),
            },
          });
          break;
        }

        case 'rose:resyncRequest': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (room) {
            ws.send(JSON.stringify({ type: 'rose:roomState', match: room.match }));
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Rose message handling error:', err);
      try {
        ws.send(JSON.stringify({ type: 'rose:reject', reason: 'Internal server error.' }));
      } catch {}
    }
  }
}
