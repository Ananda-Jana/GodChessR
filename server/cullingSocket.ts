/**
 * Authoritative Server-Side Multiplayer Socket for Jujutsu Kaisen Culling Game
 * 
 * Manages isolated rooms, player queues, authoritative move validation,
 * namespaced events (culling:*), and authoritative clock timing.
 */

import { WebSocket, WebSocketServer } from 'ws';
import type {
  CullingMatchState,
  CullingPos,
  CullingPieceColor,
  CullingSpecialAction,
} from '../src/types/cullingGame.ts';
import {
  createInitialCullingMatch,
  executeCullingMove,
  resignCullingMatch,
  handleCullingTimeout,
} from '../src/game/cullingEngine.ts';
import { db } from './db.ts';

interface ExtendedSocket extends WebSocket {
  userId?: string;
  cullingMatchId?: string;
}

interface CullingRoom {
  match: CullingMatchState;
  sockets: Set<ExtendedSocket>;
}

export function initCullingSocket(io: WebSocketServer) {
  const rooms = new Map<string, CullingRoom>();
  const matchmakingQueue: { ws: ExtendedSocket; userId: string; timeControl: 120 | 300 }[] = [];
  
  // Map of Room Code -> Challenge Info
  interface DirectChallenge {
    code: string;
    hostWs: ExtendedSocket;
    hostUserId: string;
    hostDisplayName: string;
    timeControl: 120 | 300;
    preferredSide: 'white' | 'black' | 'random';
    createdAt: number;
  }
  const directChallenges = new Map<string, DirectChallenge>();

  function generateUniqueRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let attempts = 0; attempts < 100; attempts++) {
      code = 'CULL';
      for (let i = 0; i < 3; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (!directChallenges.has(code)) return code;
    }
    return `CULL${Date.now().toString(36).slice(-3).toUpperCase()}`;
  }

  function getPublicChallengesList() {
    const list: any[] = [];
    const now = Date.now();
    for (const [code, c] of directChallenges.entries()) {
      // Expire challenges older than 15 minutes or with dead sockets
      if (now - c.createdAt > 15 * 60 * 1000 || c.hostWs.readyState !== WebSocket.OPEN) {
        directChallenges.delete(code);
        continue;
      }
      list.push({
        code: c.code,
        hostDisplayName: c.hostDisplayName,
        hostUserId: c.hostUserId,
        timeControl: c.timeControl,
        preferredSide: c.preferredSide,
        createdAt: c.createdAt,
      });
    }
    return list;
  }

  function broadcastPublicChallenges() {
    const list = getPublicChallengesList();
    const payload = JSON.stringify({ type: 'culling:challenges_list', challenges: list });
    for (const client of io.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  function broadcastRoom(matchId: string, data: any) {
    const room = rooms.get(matchId);
    if (!room) return;
    const payload = JSON.stringify(data);
    for (const ws of room.sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  // Periodic clock decrement interval (1s)
  setInterval(() => {
    const now = Date.now();
    for (const [matchId, room] of rooms.entries()) {
      const match = room.match;
      if (match.status !== 'active') continue;

      // Check if paused by rulebook
      if (match.rulebookPausedUntil && now < match.rulebookPausedUntil) {
        continue;
      }

      // Decrement active player's clock
      if (match.turn === 'white') {
        match.whiteTimeRemaining = Math.max(0, match.whiteTimeRemaining - 1);
        if (match.whiteTimeRemaining <= 0) {
          const finished = handleCullingTimeout(match, 'white');
          room.match = finished;
          broadcastRoom(matchId, { type: 'culling:state', match: finished });
        } else {
          // Send lightweight clock delta
          broadcastRoom(matchId, {
            type: 'culling:clock',
            matchId,
            whiteTimeRemaining: match.whiteTimeRemaining,
            blackTimeRemaining: match.blackTimeRemaining,
          });
        }
      } else {
        match.blackTimeRemaining = Math.max(0, match.blackTimeRemaining - 1);
        if (match.blackTimeRemaining <= 0) {
          const finished = handleCullingTimeout(match, 'black');
          room.match = finished;
          broadcastRoom(matchId, { type: 'culling:state', match: finished });
        } else {
          // Send lightweight clock delta
          broadcastRoom(matchId, {
            type: 'culling:clock',
            matchId,
            whiteTimeRemaining: match.whiteTimeRemaining,
            blackTimeRemaining: match.blackTimeRemaining,
          });
        }
      }
    }
  }, 1000);

  io.on('connection', (ws: ExtendedSocket) => {
    ws.on('message', (rawData: string) => {
      try {
        const msg = JSON.parse(rawData.toString());
        if (!msg.type || !msg.type.startsWith('culling:')) return;

        // Ensure user identity is registered
        const effectiveUserId = msg.userId || ws.userId || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        if (!ws.userId) {
          ws.userId = effectiveUserId;
        }

        switch (msg.type) {
          /**
           * CULLING MATCHMAKING QUEUE
           */
          case 'culling:join_queue': {
            const timeControl = msg.timeControl === 120 ? 120 : 300;
            // Remove any stale queue entries for this user
            const existingIdx = matchmakingQueue.findIndex((q) => q.userId === effectiveUserId);
            if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

            // Check if someone is already waiting
            if (matchmakingQueue.length > 0) {
              const opponent = matchmakingQueue.shift()!;
              if (opponent.ws.readyState === WebSocket.OPEN) {
                const isUserWhite = Math.random() < 0.5;
                const whiteUser = isUserWhite ? effectiveUserId : opponent.userId;
                const blackUser = isUserWhite ? opponent.userId : effectiveUserId;

                const userRecord1 = db.findUserById(whiteUser);
                const userRecord2 = db.findUserById(blackUser);

                const matchId = `cull_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                const newMatch = createInitialCullingMatch(
                  matchId,
                  {
                    userId: whiteUser,
                    username: userRecord1?.username || (isUserWhite ? msg.displayName : 'Sorcerer White'),
                    displayName: userRecord1?.displayName || (isUserWhite ? msg.displayName : 'Sorcerer White'),
                    avatarId: userRecord1?.avatarId,
                  },
                  {
                    userId: blackUser,
                    username: userRecord2?.username || (!isUserWhite ? msg.displayName : 'Curse Black'),
                    displayName: userRecord2?.displayName || (!isUserWhite ? msg.displayName : 'Curse Black'),
                    avatarId: userRecord2?.avatarId,
                  },
                  timeControl
                );

                const room: CullingRoom = {
                  match: newMatch,
                  sockets: new Set([ws, opponent.ws]),
                };
                rooms.set(matchId, room);
                ws.cullingMatchId = matchId;
                opponent.ws.cullingMatchId = matchId;

                // Send targeted match_started with explicit yourColor
                ws.send(JSON.stringify({
                  type: 'culling:match_started',
                  matchId,
                  match: newMatch,
                  yourColor: isUserWhite ? 'white' : 'black',
                }));

                opponent.ws.send(JSON.stringify({
                  type: 'culling:match_started',
                  matchId,
                  match: newMatch,
                  yourColor: isUserWhite ? 'black' : 'white',
                }));
                return;
              }
            }

            matchmakingQueue.push({ ws, userId: effectiveUserId, timeControl });
            ws.send(JSON.stringify({ type: 'culling:queued' }));
            break;
          }

          /**
           * JOIN SPECIFIC ROOM OR RECONNECT
           */
          case 'culling:join': {
            const matchId = msg.matchId;
            let room = rooms.get(matchId);
            if (!room) {
              const timeControl = msg.timeControl === 120 ? 120 : 300;
              const newMatch = createInitialCullingMatch(
                matchId,
                {
                  userId: effectiveUserId || 'p1',
                  username: 'Sorcerer White',
                  displayName: 'Sorcerer White',
                },
                {
                  userId: 'p2',
                  username: 'Curse Black',
                  displayName: 'Curse Black',
                },
                timeControl
              );
              room = { match: newMatch, sockets: new Set() };
              rooms.set(matchId, room);
            }

            room.sockets.add(ws);
            ws.cullingMatchId = matchId;
            const yourColor =
              effectiveUserId === room.match.whitePlayer.userId
                ? 'white'
                : effectiveUserId === room.match.blackPlayer.userId
                ? 'black'
                : undefined;

            ws.send(JSON.stringify({ type: 'culling:state', match: room.match, yourColor }));
            break;
          }

          /**
           * AUTHORITATIVE MOVE / ACTION
           */
          case 'culling:move':
          case 'culling:shoot': {
            const matchId = ws.cullingMatchId || msg.matchId;
            const room = rooms.get(matchId);
            if (!room) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Match room not found.' }));
              return;
            }

            const from: CullingPos = msg.from;
            const to: CullingPos = msg.to;
            const actionType: CullingSpecialAction = msg.actionType || (msg.type === 'culling:shoot' ? 'shoot' : 'move');

            // Authoritative turn validation
            const match = room.match;
            if (match.status !== 'active') {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Match is already completed.' }));
              return;
            }

            const activeExpectedUserId = match.turn === 'white' ? match.whitePlayer.userId : match.blackPlayer.userId;
            const callingUserId = msg.userId || ws.userId;
            if (callingUserId && activeExpectedUserId && callingUserId !== activeExpectedUserId) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Not your turn.' }));
              return;
            }

            const res = executeCullingMove(match, from, to, actionType);
            if (res.success) {
              room.match = res.state;
              // Broadcast delta event + updated state
              broadcastRoom(matchId, {
                type: 'culling:moved',
                matchId,
                lastMove: res.state.lastMove,
                match: res.state,
              });

              // Clean up completed room after 60 seconds
              if (res.state.status === 'completed') {
                setTimeout(() => {
                  rooms.delete(matchId);
                }, 60000);
              }
            } else {
              ws.send(JSON.stringify({ type: 'culling:error', message: res.error || 'Illegal move.' }));
            }
            break;
          }

          /**
           * AUTHORITATIVE RESIGNATION
           */
          case 'culling:resign': {
            const matchId = ws.cullingMatchId || msg.matchId;
            const room = rooms.get(matchId);
            if (!room || room.match.status !== 'active') return;

            const callingUserId = msg.userId || ws.userId;
            const resigningColor: CullingPieceColor = msg.color ||
              (callingUserId === room.match.whitePlayer.userId ? 'white' : 'black');

            const finished = resignCullingMatch(room.match, resigningColor);
            room.match = finished;
            broadcastRoom(matchId, { type: 'culling:state', match: finished });
            break;
          }

          /**
           * CREATE DIRECT CHALLENGE ROOM
           */
          case 'culling:create_challenge': {
            const timeControl = msg.timeControl === 120 ? 120 : 300;
            const preferredSide = msg.preferredSide || 'random';
            const userRecord = db.findUserById(effectiveUserId);
            const displayName = userRecord?.displayName || userRecord?.username || msg.displayName || 'Host Sorcerer';

            // Clean up any existing challenges hosted by this socket or user
            for (const [existingCode, c] of directChallenges.entries()) {
              if (c.hostUserId === effectiveUserId || c.hostWs === ws) {
                directChallenges.delete(existingCode);
              }
            }

            const code = generateUniqueRoomCode();

            directChallenges.set(code, {
              code,
              hostWs: ws,
              hostUserId: effectiveUserId,
              hostDisplayName: displayName,
              timeControl,
              preferredSide,
              createdAt: Date.now(),
            });

            ws.send(JSON.stringify({
              type: 'culling:challenge_created',
              code,
              timeControl,
              preferredSide,
            }));

            broadcastPublicChallenges();
            break;
          }

          /**
           * JOIN DIRECT CHALLENGE BY ROOM CODE
           */
          case 'culling:join_challenge': {
            const rawCode = String(msg.code || '').trim().toUpperCase();
            if (!rawCode) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Room code cannot be empty.' }));
              return;
            }

            const challenge = directChallenges.get(rawCode);

            if (!challenge) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Room code not found or has expired.' }));
              return;
            }

            // Expiration check (15 minutes)
            if (Date.now() - challenge.createdAt > 15 * 60 * 1000) {
              directChallenges.delete(rawCode);
              ws.send(JSON.stringify({ type: 'culling:error', message: 'This room code has expired.' }));
              broadcastPublicChallenges();
              return;
            }

            // Block joining own challenge
            if (challenge.hostWs === ws || challenge.hostUserId === effectiveUserId) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Cannot join your own room code.' }));
              return;
            }

            // Host connection check
            if (challenge.hostWs.readyState !== WebSocket.OPEN) {
              directChallenges.delete(rawCode);
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Room host has disconnected.' }));
              broadcastPublicChallenges();
              return;
            }

            // Remove challenge from pending so no 3rd player can join
            directChallenges.delete(rawCode);
            broadcastPublicChallenges();

            // Determine White and Black sides
            let isHostWhite = true;
            if (challenge.preferredSide === 'black') {
              isHostWhite = false;
            } else if (challenge.preferredSide === 'white') {
              isHostWhite = true;
            } else {
              isHostWhite = Math.random() < 0.5;
            }

            const whiteUserId = isHostWhite ? challenge.hostUserId : effectiveUserId;
            const blackUserId = isHostWhite ? effectiveUserId : challenge.hostUserId;

            const userWhite = db.findUserById(whiteUserId);
            const userBlack = db.findUserById(blackUserId);

            const whiteName = userWhite?.displayName || userWhite?.username ||
              (isHostWhite ? challenge.hostDisplayName : (msg.displayName || 'Guest Player'));
            const blackName = userBlack?.displayName || userBlack?.username ||
              (!isHostWhite ? challenge.hostDisplayName : (msg.displayName || 'Guest Player'));

            const matchId = `cull_direct_${rawCode}_${Date.now()}`;
            const newMatch = createInitialCullingMatch(
              matchId,
              {
                userId: whiteUserId,
                username: whiteName,
                displayName: whiteName,
                avatarId: userWhite?.avatarId,
              },
              {
                userId: blackUserId,
                username: blackName,
                displayName: blackName,
                avatarId: userBlack?.avatarId,
              },
              challenge.timeControl
            );

            const room: CullingRoom = {
              match: newMatch,
              sockets: new Set([challenge.hostWs, ws]),
            };
            rooms.set(matchId, room);
            ws.cullingMatchId = matchId;
            challenge.hostWs.cullingMatchId = matchId;

            // Send targeted match_started to host and guest with guaranteed yourColor
            const hostColor: CullingPieceColor = isHostWhite ? 'white' : 'black';
            const guestColor: CullingPieceColor = isHostWhite ? 'black' : 'white';

            challenge.hostWs.send(JSON.stringify({
              type: 'culling:match_started',
              matchId,
              match: newMatch,
              yourColor: hostColor,
            }));

            ws.send(JSON.stringify({
              type: 'culling:match_started',
              matchId,
              match: newMatch,
              yourColor: guestColor,
            }));
            break;
          }

          /**
           * LIST OPEN DIRECT CHALLENGES
           */
          case 'culling:list_challenges': {
            ws.send(JSON.stringify({
              type: 'culling:challenges_list',
              challenges: getPublicChallengesList(),
            }));
            break;
          }

          /**
           * CANCEL DIRECT CHALLENGE
           */
          case 'culling:cancel_challenge': {
            const code = msg.code ? String(msg.code).trim().toUpperCase() : null;
            if (code && directChallenges.has(code)) {
              const c = directChallenges.get(code)!;
              if (c.hostUserId === effectiveUserId || c.hostWs === ws) {
                directChallenges.delete(code);
                broadcastPublicChallenges();
              }
            } else {
              for (const [cCode, c] of directChallenges.entries()) {
                if (c.hostUserId === effectiveUserId || c.hostWs === ws) {
                  directChallenges.delete(cCode);
                }
              }
              broadcastPublicChallenges();
            }
            ws.send(JSON.stringify({ type: 'culling:challenge_cancelled' }));
            break;
          }

          /**
           * RULEBOOK PAUSE (Exact 8 seconds pause)
           */
          case 'culling:rules_open': {
            const matchId = ws.cullingMatchId || msg.matchId;
            const room = rooms.get(matchId);
            if (!room || room.match.status !== 'active') return;

            room.match.rulebookPausedUntil = Date.now() + 8000;
            broadcastRoom(matchId, {
              type: 'culling:state',
              match: room.match,
              rulesPaused: true,
            });
            break;
          }
        }
      } catch (err) {
        console.error('Culling socket error:', err);
      }
    });

    ws.on('close', () => {
      // Clean up queue
      const qIdx = matchmakingQueue.findIndex((q) => q.ws === ws);
      if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);

      // Clean up any direct challenges hosted by this ws
      let hadChallenge = false;
      for (const [code, c] of directChallenges.entries()) {
        if (c.hostWs === ws) {
          directChallenges.delete(code);
          hadChallenge = true;
        }
      }
      if (hadChallenge) {
        broadcastPublicChallenges();
      }

      // Clean up room socket
      if (ws.cullingMatchId) {
        const room = rooms.get(ws.cullingMatchId);
        if (room) {
          room.sockets.delete(ws);
          if (room.sockets.size === 0 && room.match.status === 'completed') {
            rooms.delete(ws.cullingMatchId);
          }
        }
      }
    });
  });
}

