import { WebSocket, WebSocketServer } from 'ws';
import type { RoseSeat, RoseRole, RoseMatchState } from '../../src/rose/types.ts';
import {
  createRoseRoom,
  joinRoseRoom,
  getRoomById,
  getRoomByCode,
  getPublicRoseRooms,
  getUserActiveRoomId,
  destroyRoom,
  destroyRoomByHostWs,
  destroyRoomByHostUserId,
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

const SERVER_INSTANCE_ID = process.env.INSTANCE_ID || process.env.HOSTNAME || 'srv_1';

export function registerRoseSocket(wss: WebSocketServer) {
  const matchmakingQueue: { ws: ExtendedSocket; userId: string; role?: RoseRole; displayName: string; avatarId?: string }[] = [];

  function broadcastRoom(room: RoseRoom, data: any) {
    const payload = JSON.stringify(data);
    for (const ws of room.sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(payload);
        } catch (sendErr) {
          console.error(`[WS REJECTED SEND] Instance: ${SERVER_INSTANCE_ID} | Mode: rose | Room: ${room.match.id} | Error:`, sendErr);
        }
      }
    }
  }

  function broadcastPublicRoseRooms() {
    const list = getPublicRoseRooms();
    const payload = JSON.stringify({
      type: 'rose:rooms_list',
      rooms: list,
      challenges: list,
    });
    const challengesPayload = JSON.stringify({
      type: 'rose:challenges_list',
      rooms: list,
      challenges: list,
    });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
          client.send(challengesPayload);
        } catch {}
      }
    }
  }

  wss.on('connection', (ws: ExtendedSocket) => {
    console.log(`[WS CONNECT] Instance: ${SERVER_INSTANCE_ID} | Mode: rose`);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (!data.type || !data.type.startsWith('rose:')) return;
        handleRoseMessage(ws, data);
      } catch (err) {
        console.error(`[WS UNCAUGHT ERROR] Instance: ${SERVER_INSTANCE_ID} | Mode: rose | Error:`, err);
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`[WS CLOSE] Instance: ${SERVER_INSTANCE_ID} | Mode: rose | User: ${ws.userId || 'unauth'} | Code: ${code} | Reason: ${reason}`);
      // Remove from matchmaking queue if waiting
      const qIdx = matchmakingQueue.findIndex((q) => q.ws === ws);
      if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);

      // Clean up any direct challenges hosted by this ws (exactly like Culling Game)
      const hadHosted = destroyRoomByHostWs(ws);
      if (hadHosted) {
        broadcastPublicRoseRooms();
      }

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

      // Auto-reassociate socket with active Rose room for this user
      if (!ws.roseRoomId) {
        const activeRoomId = getUserActiveRoomId(user.userId);
        if (activeRoomId) {
          const room = getRoomById(activeRoomId);
          if (room && room.match.status === 'active') {
            ws.roseRoomId = room.match.id;
            room.sockets.add(ws);
            if (room.hostUserId === user.userId) {
              room.hostWs = ws;
            } else {
              room.guestWs = ws;
            }
            const seat = getSeatByUserId(room.match, user.userId);
            if (seat) seat.isConnected = true;
            console.log(`[WS RECONNECT/AUTH] Instance: ${SERVER_INSTANCE_ID} | Mode: rose | User: ${user.userId} | MatchReassociated: ${room.match.id}`);
          }
        }
      }

      switch (type) {
        case 'rose:list_challenges':
        case 'rose:list_rooms': {
          const list = getPublicRoseRooms();
          ws.send(JSON.stringify({ type: 'rose:rooms_list', rooms: list, challenges: list }));
          ws.send(JSON.stringify({ type: 'rose:challenges_list', rooms: list, challenges: list }));
          break;
        }

        case 'rose:join_queue': {
          // Remove existing queue entries for this user
          const existingIdx = matchmakingQueue.findIndex((q) => q.userId === user.userId);
          if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

          if (matchmakingQueue.length > 0) {
            const opponent = matchmakingQueue.shift()!;
            if (opponent.ws.readyState === WebSocket.OPEN) {
              const hostRole: RoseRole = opponent.role || 'boyfriend';
              const guestRole: RoseRole = hostRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';

              const room = createRoseRoom(
                opponent.userId,
                opponent.displayName,
                opponent.displayName,
                opponent.avatarId || 'avatar_prince',
                hostRole,
                0,
                true,
                opponent.ws
              );

              const joinRes = joinRoseRoom(
                room.match.code,
                user.userId,
                user.username,
                user.displayName,
                user.avatarId || 'avatar_queen',
                ws
              );

              if (joinRes.success && joinRes.room && joinRes.hostSeat && joinRes.guestSeat) {
                opponent.ws.roseRoomId = room.match.id;
                ws.roseRoomId = room.match.id;

                opponent.ws.send(JSON.stringify({
                  type: 'rose:match_started',
                  matchId: room.match.id,
                  match: room.match,
                  yourColor: joinRes.hostSeat.color,
                  yourRole: joinRes.hostSeat.role,
                }));

                ws.send(JSON.stringify({
                  type: 'rose:match_started',
                  matchId: room.match.id,
                  match: room.match,
                  yourColor: joinRes.guestSeat.color,
                  yourRole: joinRes.guestSeat.role,
                }));

                broadcastPublicRoseRooms();
                return;
              }
            }
          }

          matchmakingQueue.push({
            ws,
            userId: user.userId,
            role: role || 'boyfriend',
            displayName: user.displayName,
            avatarId: user.avatarId,
          });
          ws.send(JSON.stringify({ type: 'rose:queued' }));
          break;
        }

        case 'rose:cancel_queue': {
          const qIdx = matchmakingQueue.findIndex((q) => q.ws === ws);
          if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);
          ws.send(JSON.stringify({ type: 'rose:cancelled' }));
          break;
        }

        case 'rose:create_challenge':
        case 'rose:create':
        case 'rose:create_room': {
          const chosenRole: RoseRole = (role === 'girlfriend' || data.preferredSide === 'black') ? 'girlfriend' : 'boyfriend';

          // Clean up any existing waiting room hosted by this user or socket (matching Culling Game)
          destroyRoomByHostWs(ws);
          if (user.userId) destroyRoomByHostUserId(user.userId);

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

          const createdPayload = {
            type: 'rose:challenge_created',
            code: room.match.code,
            matchId: room.match.id,
            match: room.match,
            yourColor: room.match.whiteSeat?.userId === user.userId ? 'white' : 'black',
            yourRole: chosenRole,
          };

          ws.send(JSON.stringify(createdPayload));
          ws.send(JSON.stringify({ ...createdPayload, type: 'rose:created' }));

          broadcastPublicRoseRooms();
          break;
        }

        case 'rose:join_challenge':
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
              matchId: room.match.id,
              match: room.match,
              yourColor: res.hostSeat.color,
              yourRole: res.hostSeat.role,
            }));
          }

          ws.send(JSON.stringify({
            type: 'rose:match_started',
            matchId: room.match.id,
            match: room.match,
            yourColor: res.guestSeat.color,
            yourRole: res.guestSeat.role,
          }));

          // Update lobby list
          broadcastPublicRoseRooms();
          break;
        }

        case 'rose:cancel_challenge':
        case 'rose:cancel':
        case 'rose:cancel_room': {
          const rId = ws.roseRoomId || roomId;
          if (rId) {
            destroyRoom(rId);
            ws.roseRoomId = undefined;
          }
          destroyRoomByHostWs(ws);
          if (user.userId) destroyRoomByHostUserId(user.userId);
          ws.send(JSON.stringify({ type: 'rose:challenge_cancelled' }));
          ws.send(JSON.stringify({ type: 'rose:cancelled' }));
          broadcastPublicRoseRooms();
          break;
        }

        case 'rose:move': {
          const rId = ws.roseRoomId || roomId;
          const room = getRoomById(rId);
          if (!room || room.match.status !== 'active') {
            console.log(`[MOVE] Instance: ${SERVER_INSTANCE_ID} | Mode: rose | Room: ${rId} | Sender: ${user.userId} | Status: rejected (Match not active)`);
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
            console.log(`[MOVE] Instance: ${SERVER_INSTANCE_ID} | Mode: rose | Room: ${room.match.id} | Sender: ${user.userId} | Turn: ${room.match.turn} | Status: rejected (Not turn)`);
            ws.send(JSON.stringify({ type: 'rose:error', message: 'Not your turn.' }));
            return;
          }

          const res = applyRoseMove(room.match, from, to);
          if (!res.success || !res.state) {
            console.log(`[MOVE] Instance: ${SERVER_INSTANCE_ID} | Mode: rose | Room: ${room.match.id} | Sender: ${user.userId} | Turn: ${room.match.turn} | Status: rejected (${res.error || 'Invalid move'})`);
            ws.send(JSON.stringify({ type: 'rose:error', message: res.error || 'Invalid move.' }));
            return;
          }

          room.match = res.state;
          console.log(`[MOVE] Instance: ${SERVER_INSTANCE_ID} | Mode: rose | Room: ${room.match.id} | Sender: ${user.userId} | Turn: ${res.state.turn} | Status: accepted`);
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
          let rId = ws.roseRoomId || roomId;
          let room = getRoomById(rId);
          if (!room && user.userId) {
            const activeRoomId = getUserActiveRoomId(user.userId);
            if (activeRoomId) room = getRoomById(activeRoomId);
          }
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
          const rId = data.matchId || ws.roseRoomId || roomId;
          let room = rId ? getRoomById(rId) : undefined;
          if (!room && user.userId) {
            const activeId = getUserActiveRoomId(user.userId);
            if (activeId) room = getRoomById(activeId);
          }
          if (room) {
            // Prune dead/closed sockets matching Culling Game
            for (const s of Array.from(room.sockets)) {
              if (s.readyState !== WebSocket.OPEN) {
                room.sockets.delete(s);
              }
            }
            room.sockets.add(ws);
            ws.roseRoomId = room.match.id;
            if (room.hostUserId === user.userId) {
              room.hostWs = ws;
            } else {
              room.guestWs = ws;
            }
            const seat = getSeatByUserId(room.match, user.userId);
            if (seat) seat.isConnected = true;
            ws.send(JSON.stringify({
              type: 'rose:state',
              match: room.match,
              yourColor: seat?.color,
              yourRole: seat?.role,
            }));
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
