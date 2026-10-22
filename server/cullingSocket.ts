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
  
  // Pending direct challenges (Room Code -> Challenge Info)
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

  function getPublicChallengesList() {
    const list: any[] = [];
    const now = Date.now();
    for (const [code, c] of directChallenges.entries()) {
      // Expire challenges older than 15 minutes
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

      // Check if paused by rulebook (8-second pause)
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
        }
      } else {
        match.blackTimeRemaining = Math.max(0, match.blackTimeRemaining - 1);
        if (match.blackTimeRemaining <= 0) {
          const finished = handleCullingTimeout(match, 'black');
          room.match = finished;
          broadcastRoom(matchId, { type: 'culling:state', match: finished });
        }
      }
    }
  }, 1000);

  io.on('connection', (ws: ExtendedSocket) => {
    ws.on('message', (rawData: string) => {
      try {
        const msg = JSON.parse(rawData.toString());
        if (!msg.type || !msg.type.startsWith('culling:')) return;

        const userId = ws.userId || msg.userId;

        switch (msg.type) {
          /**
           * CULLING MATCHMAKING QUEUE
           * Pairs two players and randomly assigns White and Black sides
           */
          case 'culling:join_queue': {
            if (!userId) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Authentication required' }));
              return;
            }
            const timeControl = msg.timeControl === 120 ? 120 : 300;
            // Remove any stale queue entries for this user
            const existingIdx = matchmakingQueue.findIndex((q) => q.userId === userId);
            if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

            // Check if someone is already waiting
            if (matchmakingQueue.length > 0) {
              const opponent = matchmakingQueue.shift()!;
              if (opponent.ws.readyState === WebSocket.OPEN) {
                // Randomly choose White and Black sides (50/50)
                const isUserWhite = Math.random() < 0.5;
                const whiteUser = isUserWhite ? userId : opponent.userId;
                const blackUser = isUserWhite ? opponent.userId : userId;

                const userRecord1 = db.findUserById(whiteUser);
                const userRecord2 = db.findUserById(blackUser);

                const matchId = `cull_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                const newMatch = createInitialCullingMatch(
                  matchId,
                  {
                    userId: whiteUser,
                    username: userRecord1?.username || 'Sorcerer_White',
                    displayName: userRecord1?.displayName || 'Sorcerer White',
                    avatarId: userRecord1?.avatarId,
                  },
                  {
                    userId: blackUser,
                    username: userRecord2?.username || 'Curse_Black',
                    displayName: userRecord2?.displayName || 'Curse Black',
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

                broadcastRoom(matchId, {
                  type: 'culling:match_started',
                  matchId,
                  match: newMatch,
                });
                return;
              }
            }

            // Otherwise, wait in queue
            matchmakingQueue.push({ ws, userId, timeControl });
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
              // Create room if not found
              const timeControl = msg.timeControl === 120 ? 120 : 300;
              const newMatch = createInitialCullingMatch(
                matchId,
                {
                  userId: userId || 'p1',
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
            ws.send(JSON.stringify({ type: 'culling:state', match: room.match }));
            break;
          }

          /**
           * AUTHORITATIVE MOVE / ACTION
           */
          case 'culling:move':
          case 'culling:shoot': {
            const matchId = ws.cullingMatchId || msg.matchId;
            const room = rooms.get(matchId);
            if (!room) return;

            const from: CullingPos = msg.from;
            const to: CullingPos = msg.to;
            const actionType: CullingSpecialAction = msg.actionType || (msg.type === 'culling:shoot' ? 'shoot' : 'move');

            // Authoritative turn validation
            const match = room.match;
            const expectedUser = match.turn === 'white' ? match.whitePlayer.userId : match.blackPlayer.userId;
            if (userId && expectedUser && userId !== expectedUser) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Not your turn.' }));
              return;
            }

            const res = executeCullingMove(match, from, to, actionType);
            if (res.success) {
              room.match = res.state;
              broadcastRoom(matchId, { type: 'culling:state', match: res.state });
            } else {
              ws.send(JSON.stringify({ type: 'culling:error', message: res.error }));
            }
            break;
          }

          /**
           * AUTHORITATIVE RESIGNATION
           */
          case 'culling:resign': {
            const matchId = ws.cullingMatchId || msg.matchId;
            const room = rooms.get(matchId);
            if (!room) return;

            const resigningColor: CullingPieceColor = msg.color ||
              (userId === room.match.whitePlayer.userId ? 'white' : 'black');

            const finished = resignCullingMatch(room.match, resigningColor);
            room.match = finished;
            broadcastRoom(matchId, { type: 'culling:state', match: finished });
            break;
          }

          /**
           * CREATE DIRECT CHALLENGE
           * Generates a unique room code and hosts an open challenge
           */
          case 'culling:create_challenge': {
            if (!userId) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Authentication required' }));
              return;
            }
            const timeControl = msg.timeControl === 120 ? 120 : 300;
            const preferredSide = msg.preferredSide || 'random';
            const userRecord = db.findUserById(userId);
            const displayName = userRecord?.displayName || userRecord?.username || msg.displayName || 'Sorcerer';

            // Generate short readable 6-character room code (e.g. CULL77 or random)
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const code = (msg.code ? String(msg.code).trim().toUpperCase() : randomCode).substring(0, 8);

            // Clean up any old challenges from this host
            for (const [existingCode, c] of directChallenges.entries()) {
              if (c.hostUserId === userId) {
                directChallenges.delete(existingCode);
              }
            }

            directChallenges.set(code, {
              code,
              hostWs: ws,
              hostUserId: userId,
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
            if (!userId) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Authentication required' }));
              return;
            }
            const rawCode = String(msg.code || '').trim().toUpperCase();
            const challenge = directChallenges.get(rawCode);

            if (!challenge) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Challenge code not found or expired.' }));
              return;
            }

            if (challenge.hostUserId === userId) {
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Cannot join your own challenge.' }));
              return;
            }

            if (challenge.hostWs.readyState !== WebSocket.OPEN) {
              directChallenges.delete(rawCode);
              ws.send(JSON.stringify({ type: 'culling:error', message: 'Challenger disconnected.' }));
              broadcastPublicChallenges();
              return;
            }

            // Remove challenge from pending
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

            const whiteUserId = isHostWhite ? challenge.hostUserId : userId;
            const blackUserId = isHostWhite ? userId : challenge.hostUserId;

            const userWhite = db.findUserById(whiteUserId);
            const userBlack = db.findUserById(blackUserId);

            const matchId = `cull_direct_${rawCode}_${Date.now()}`;
            const newMatch = createInitialCullingMatch(
              matchId,
              {
                userId: whiteUserId,
                username: userWhite?.username || (isHostWhite ? challenge.hostDisplayName : 'Player White'),
                displayName: userWhite?.displayName || (isHostWhite ? challenge.hostDisplayName : 'Player White'),
                avatarId: userWhite?.avatarId,
              },
              {
                userId: blackUserId,
                username: userBlack?.username || (!isHostWhite ? challenge.hostDisplayName : 'Player Black'),
                displayName: userBlack?.displayName || (!isHostWhite ? challenge.hostDisplayName : 'Player Black'),
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

            broadcastRoom(matchId, {
              type: 'culling:match_started',
              matchId,
              match: newMatch,
            });
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
              if (c.hostUserId === userId || c.hostWs === ws) {
                directChallenges.delete(code);
                broadcastPublicChallenges();
              }
            } else {
              // Cancel any hosted by this user
              for (const [cCode, c] of directChallenges.entries()) {
                if (c.hostUserId === userId || c.hostWs === ws) {
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
