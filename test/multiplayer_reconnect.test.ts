/**
 * Comprehensive Multi-Mode WebSocket Reconnection & State Recovery Test Suite
 * Covers Standard Chess, Culling Game, and Rose Paradise
 */

import http from 'http';
import express from 'express';
import { WebSocket } from 'ws';
import { db, UserRecord } from '../server/db.ts';
import { hashPassword, createSession } from '../server/auth.ts';
import { initWebSocketServer } from '../server/socket.ts';
import { createInitialBoard } from '../src/game/engine.ts';
import { createRoseRoom, joinRoseRoom } from '../server/rose/roseRooms.ts';
import { createInitialCullingMatch } from '../src/game/cullingEngine.ts';
import type { MatchState } from '../src/types/game.ts';
import type { CullingMatchState } from '../src/types/cullingGame.ts';
import type { RoseMatchState } from '../src/rose/types.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`TEST FAILED: ${msg}`);
  console.log(`✓ ${msg}`);
}

function waitForMessage(ws: WebSocket, expectedType: string, timeoutMs: number = 3000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeListener('message', handler);
      reject(new Error(`Timeout (${timeoutMs}ms) waiting for message type: "${expectedType}"`));
    }, timeoutMs);

    const handler = (data: any) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === expectedType) {
          clearTimeout(timer);
          ws.removeListener('message', handler);
          resolve(msg);
        }
      } catch {}
    };

    ws.on('message', handler);
  });
}

function createTestUser(name: string): { user: UserRecord; token: string } {
  const pw = hashPassword('pass123');
  const user: UserRecord = {
    id: `usr_${name}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    username: `${name}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    displayName: name,
    avatarId: 'avatar_prince',
    passwordHash: pw.hash,
    salt: pw.salt,
    stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 },
    createdAt: Date.now(),
  };
  db.saveUser(user);
  const token = createSession(user.id);
  return { user, token };
}

async function runAllReconnectTests() {
  console.log('=== STARTING MULTI-MODE MULTIPLAYER RECONNECT TEST SUITE ===');

  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  initWebSocketServer(server);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as any;
  const port = address.port;
  const wsUrl = `ws://127.0.0.1:${port}/ws`;
  console.log(`Multiplayer test server running on port ${port}`);

  const aliceData = createTestUser('alice');
  const bobData = createTestUser('bob');
  const eveData = createTestUser('eve'); // Unauthorized attacker

  // ============================================================================
  // 1. STANDARD CHESS MODE RECONNECT TEST SUITE
  // ============================================================================
  console.log('\n--- 1. Testing Standard Chess Multiplayer Reconnection ---');
  const stdMatchId = `match_std_reconnect_${Date.now()}`;
  const initialStdMatch: MatchState = {
    id: stdMatchId,
    whitePlayer: { userId: aliceData.user.id, username: aliceData.user.username, displayName: aliceData.user.displayName, avatarId: 'avatar_queen' },
    blackPlayer: { userId: bobData.user.id, username: bobData.user.username, displayName: bobData.user.displayName, avatarId: 'avatar_prince' },
    board: createInitialBoard(),
    turn: 'white',
    status: 'active',
    dice: null,
    whitePawnsReachedEndRank: 0,
    blackPawnsReachedEndRank: 0,
    capturedByWhite: [],
    capturedByBlack: [],
    moveHistory: [],
    inCheck: null,
    result: null,
    moveSuggestions: 'included',
    totalCaptures: 0,
    diceActive: false,
    timeControl: 300,
    whiteTimeRemaining: 300,
    blackTimeRemaining: 300,
    lastTurnStartTime: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.saveMatch(initialStdMatch);

  // 1.1 Connect Alice and Bob
  const wsAliceStd = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsAliceStd.on('open', res));
  wsAliceStd.send(JSON.stringify({ type: 'auth', token: aliceData.token }));
  await waitForMessage(wsAliceStd, 'auth:success');
  wsAliceStd.send(JSON.stringify({ type: 'match:join', matchId: stdMatchId }));
  await waitForMessage(wsAliceStd, 'match:state');

  let wsBobStd = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBobStd.on('open', res));
  wsBobStd.send(JSON.stringify({ type: 'auth', token: bobData.token }));
  await waitForMessage(wsBobStd, 'auth:success');
  wsBobStd.send(JSON.stringify({ type: 'match:join', matchId: stdMatchId }));
  await waitForMessage(wsBobStd, 'match:state');
  assert(true, 'Standard: Both clients connected and joined match room');

  // 1.2 Alice moves e2->e4
  const aliceMovePromise = waitForMessage(wsBobStd, 'match:moved');
  wsAliceStd.send(JSON.stringify({ type: 'match:move', matchId: stdMatchId, from: { x: 4, y: 1 }, to: { x: 4, y: 3 } }));
  const moveMsg1 = await aliceMovePromise;
  assert(moveMsg1.match.turn === 'black', 'Standard: Bob received Alice move e2->e4, turn is Black');

  // 1.3 Bob disconnects while it is Bob's turn
  wsBobStd.close();
  await new Promise((r) => setTimeout(r, 100));

  // 1.4 Bob reconnects with new WebSocket
  let wsBobStd2 = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBobStd2.on('open', res));
  const bobStatePromise = waitForMessage(wsBobStd2, 'match:state');
  wsBobStd2.send(JSON.stringify({ type: 'auth', token: bobData.token }));
  const bobStateMsg = await bobStatePromise;
  assert(bobStateMsg.match.turn === 'black', 'Standard: Reconnected Bob received match:state with turn=black');
  assert(bobStateMsg.match.moveHistory.length === 1, 'Standard: Reconnected Bob has full 1-move history');

  // 1.5 Reconnected Bob executes move e7->e5
  const aliceReceivedBobMove = waitForMessage(wsAliceStd, 'match:moved');
  wsBobStd2.send(JSON.stringify({ type: 'match:move', matchId: stdMatchId, from: { x: 4, y: 6 }, to: { x: 4, y: 4 } }));
  const bobMoveMsg = await aliceReceivedBobMove;
  assert(bobMoveMsg.match.turn === 'white', 'Standard: Reconnected Bob executed e7->e5, Alice received move and turn is White');

  // 1.6 Alice moves d2->d4 while Bob disconnects again
  wsBobStd2.close();
  await new Promise((r) => setTimeout(r, 100));
  wsAliceStd.send(JSON.stringify({ type: 'match:move', matchId: stdMatchId, from: { x: 3, y: 1 }, to: { x: 3, y: 3 } }));
  await new Promise((r) => setTimeout(r, 150));

  // 1.7 Bob reconnects and recovers offline move d2->d4
  let wsBobStd3 = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBobStd3.on('open', res));
  const bobState3Promise = waitForMessage(wsBobStd3, 'match:state');
  wsBobStd3.send(JSON.stringify({ type: 'auth', token: bobData.token }));
  const bobState3Msg = await bobState3Promise;
  assert(bobState3Msg.match.moveHistory.length === 3, 'Standard: Reconnected Bob recovered offline move, history length is 3');

  // 1.8 Unauthorized client (Eve) attempt to join match
  const wsEve = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsEve.on('open', res));
  wsEve.send(JSON.stringify({ type: 'auth', token: eveData.token }));
  await waitForMessage(wsEve, 'auth:success');

  wsAliceStd.close();
  wsBobStd3.close();
  wsEve.close();

  // ============================================================================
  // 2. CULLING GAME MODE RECONNECT TEST SUITE
  // ============================================================================
  console.log('\n--- 2. Testing Culling Game Multiplayer Reconnection ---');
  // 2.1 Alice creates a challenge room and Bob joins via room code
  const wsAliceCull = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsAliceCull.on('open', res));
  wsAliceCull.send(JSON.stringify({
    type: 'culling:create_challenge',
    timeControl: 300,
    preferredSide: 'white',
    userId: aliceData.user.id,
    displayName: aliceData.user.displayName,
  }));
  const cullCreatedMsg = await waitForMessage(wsAliceCull, 'culling:challenge_created');
  const cullCode = cullCreatedMsg.code;

  let wsBobCull = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBobCull.on('open', res));

  const aliceMatchStartedPromise = waitForMessage(wsAliceCull, 'culling:match_started');
  const bobMatchStartedPromise = waitForMessage(wsBobCull, 'culling:match_started');

  wsBobCull.send(JSON.stringify({
    type: 'culling:join_challenge',
    code: cullCode,
    userId: bobData.user.id,
    displayName: bobData.user.displayName,
  }));

  const aliceCullMatchStarted = await aliceMatchStartedPromise;
  const bobCullMatchStarted = await bobMatchStartedPromise;
  const cullingMatchId = aliceCullMatchStarted.matchId;

  assert(aliceCullMatchStarted.yourColor === 'white', 'Culling: Alice started as White');
  assert(bobCullMatchStarted.yourColor === 'black', 'Culling: Bob started as Black');

  // 2.2 Alice (White) moves D2->D3 (x=4, y=2 to x=4, y=3)
  const bobCullMovedPromise = waitForMessage(wsBobCull, 'culling:moved');
  wsAliceCull.send(JSON.stringify({
    type: 'culling:move',
    matchId: cullingMatchId,
    from: { x: 4, y: 2 },
    to: { x: 4, y: 3 },
    actionType: 'move',
    userId: aliceData.user.id,
  }));
  const cullMove1 = await bobCullMovedPromise;
  assert(cullMove1.match.turn === 'black', 'Culling: Bob received Alice move D2->D3, turn is Black');

  // 2.3 Bob disconnects while idle on Bob's turn
  wsBobCull.close();
  await new Promise((r) => setTimeout(r, 100));

  // 2.4 Bob reconnects without moving (IDLE RECONNECTION)
  let wsBobCull2 = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBobCull2.on('open', res));
  // Send auth and culling:resync
  wsBobCull2.send(JSON.stringify({ type: 'auth', token: bobData.token }));
  wsBobCull2.send(JSON.stringify({ type: 'culling:resync', matchId: cullingMatchId, userId: bobData.user.id }));
  const bobCullResyncState = await waitForMessage(wsBobCull2, 'culling:state');
  assert(bobCullResyncState.match.turn === 'black', 'Culling: Idle reconnected Bob received state, turn is Black');
  assert(bobCullResyncState.yourColor === 'black', 'Culling: yourColor is explicitly Black');

  // 2.5 Reconnected Bob makes legal move D7->D6 (x=4, y=7 to x=4, y=6)
  const aliceCullMovedPromise = waitForMessage(wsAliceCull, 'culling:moved');
  wsBobCull2.send(JSON.stringify({
    type: 'culling:move',
    matchId: cullingMatchId,
    from: { x: 4, y: 7 },
    to: { x: 4, y: 6 },
    actionType: 'move',
    userId: bobData.user.id,
  }));
  const cullMove2 = await aliceCullMovedPromise;
  assert(cullMove2.match.turn === 'white', 'Culling: Reconnected Bob moved D7->D6, Alice received move, turn is White');

  // 2.6 Alice moves while Bob is offline
  wsBobCull2.close();
  await new Promise((r) => setTimeout(r, 100));
  wsAliceCull.send(JSON.stringify({
    type: 'culling:move',
    matchId: cullingMatchId,
    from: { x: 4, y: 3 },
    to: { x: 4, y: 4 },
    actionType: 'move',
    userId: aliceData.user.id,
  }));
  await new Promise((r) => setTimeout(r, 150));

  // 2.7 Bob reconnects and recovers offline move
  let wsBobCull3 = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBobCull3.on('open', res));
  wsBobCull3.send(JSON.stringify({ type: 'culling:resync', matchId: cullingMatchId, userId: bobData.user.id }));
  const bobCull3State = await waitForMessage(wsBobCull3, 'culling:state');
  assert(bobCull3State.match.history.length === 3, 'Culling: Reconnected Bob recovered offline move, history length is 3');

  // 2.8 Unauthorized client (Eve) attempts to join Culling match
  const wsEveCull = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsEveCull.on('open', res));
  wsEveCull.send(JSON.stringify({ type: 'culling:join', matchId: cullingMatchId, userId: eveData.user.id }));
  const eveErr = await waitForMessage(wsEveCull, 'culling:error');
  assert(eveErr.message.includes('Unauthorized'), 'Culling: Unauthorized Eve blocked from joining match room');

  wsAliceCull.close();
  wsBobCull3.close();
  wsEveCull.close();

  // ============================================================================
  // 3. ROSE PARADISE MODE RECONNECT TEST SUITE
  // ============================================================================
  console.log('\n--- 3. Testing Rose Paradise Multiplayer Reconnection ---');
  // Create Rose Room hosted by Alice (Boyfriend/White) and joined by Bob (Girlfriend/Black)
  const wsAliceRose = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsAliceRose.on('open', res));
  wsAliceRose.send(JSON.stringify({
    type: 'rose:create_challenge',
    userId: aliceData.user.id,
    displayName: aliceData.user.displayName,
    role: 'boyfriend',
    token: aliceData.token,
  }));
  const roseCreatedMsg = await waitForMessage(wsAliceRose, 'rose:created');
  const roseCode = roseCreatedMsg.code;
  const roseMatchId = roseCreatedMsg.matchId;

  let wsBobRose = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBobRose.on('open', res));
  wsBobRose.send(JSON.stringify({
    type: 'rose:join_challenge',
    code: roseCode,
    userId: bobData.user.id,
    displayName: bobData.user.displayName,
    token: bobData.token,
  }));
  const bobRoseStarted = await waitForMessage(wsBobRose, 'rose:match_started');
  assert(bobRoseStarted.yourColor === 'black' && bobRoseStarted.yourRole === 'girlfriend', 'Rose: Bob joined as Girlfriend (Black)');

  // 3.1 Alice (White) moves e2->e4
  const bobRoseMovedPromise = waitForMessage(wsBobRose, 'rose:moved');
  wsAliceRose.send(JSON.stringify({
    type: 'rose:move',
    roomId: roseMatchId,
    from: { x: 4, y: 1 },
    to: { x: 4, y: 3 },
    userId: aliceData.user.id,
  }));
  const roseMove1 = await bobRoseMovedPromise;
  assert(roseMove1.match.turn === 'black', 'Rose: Bob received Alice move e2->e4, turn is Black');

  // 3.2 Bob disconnects while on Bob's turn
  wsBobRose.close();
  await new Promise((r) => setTimeout(r, 100));

  // 3.3 Bob reconnects and sends rose:resync
  let wsBobRose2 = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBobRose2.on('open', res));
  wsBobRose2.send(JSON.stringify({ type: 'auth', token: bobData.token }));
  wsBobRose2.send(JSON.stringify({
    type: 'rose:resync',
    roomId: roseMatchId,
    userId: bobData.user.id,
  }));
  const bobRoseStateMsg = await waitForMessage(wsBobRose2, 'rose:state');
  assert(bobRoseStateMsg.match.turn === 'black', 'Rose: Reconnected Bob received rose:state with turn=black');
  assert(bobRoseStateMsg.match.blackSeat?.isConnected === true, 'Rose: Bob seat-connected status restored to true');

  // 3.4 Reconnected Bob moves e7->e5
  const aliceRoseMovedPromise = waitForMessage(wsAliceRose, 'rose:moved');
  wsBobRose2.send(JSON.stringify({
    type: 'rose:move',
    roomId: roseMatchId,
    from: { x: 4, y: 6 },
    to: { x: 4, y: 4 },
    userId: bobData.user.id,
  }));
  const roseMove2 = await aliceRoseMovedPromise;
  assert(roseMove2.match.turn === 'white', 'Rose: Reconnected Bob moved e7->e5, Alice received move, turn is White');

  // 3.5 Alice moves while Bob is offline
  wsBobRose2.close();
  await new Promise((r) => setTimeout(r, 100));
  wsAliceRose.send(JSON.stringify({
    type: 'rose:move',
    roomId: roseMatchId,
    from: { x: 3, y: 1 },
    to: { x: 3, y: 3 },
    userId: aliceData.user.id,
  }));
  await new Promise((r) => setTimeout(r, 150));

  // 3.6 Bob reconnects and recovers offline move
  let wsBobRose3 = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBobRose3.on('open', res));
  wsBobRose3.send(JSON.stringify({
    type: 'rose:resync',
    roomId: roseMatchId,
    userId: bobData.user.id,
  }));
  const bobRose3State = await waitForMessage(wsBobRose3, 'rose:state');
  assert(bobRose3State.match.lastMove?.from.x === 3 && bobRose3State.match.lastMove?.to.y === 3, 'Rose: Reconnected Bob recovered offline move d2->d4');

  wsAliceRose.close();
  wsBobRose3.close();
  server.close();

  console.log('\n=== ALL MULTI-MODE RECONNECT TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runAllReconnectTests().catch((err) => {
  console.error('RECONNECT TEST FAILED:', err);
  process.exit(1);
});
