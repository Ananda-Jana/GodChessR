/**
 * Reproduction Test for Multiplayer Freeze on WebSocket Reconnection
 */

import http from 'http';
import express from 'express';
import { WebSocket } from 'ws';
import { db, UserRecord } from '../server/db.ts';
import { hashPassword, createSession } from '../server/auth.ts';
import { initWebSocketServer } from '../server/socket.ts';
import { createInitialBoard } from '../src/game/engine.ts';
import type { MatchState, Challenge } from '../src/types/game.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`REPRO TEST FAILED: ${msg}`);
  console.log(`✓ ${msg}`);
}

async function runReproduction() {
  console.log('=== RUNNING MULTIPLAYER FREEZE REPRODUCTION TEST ===');

  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  initWebSocketServer(server);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as any;
  const port = address.port;
  console.log(`Test server running on port ${port}`);

  // Create Player 1 (Alice)
  const alicePw = hashPassword('pass123');
  const alice: UserRecord = {
    id: `usr_alice_${Date.now()}`,
    username: `alice_${Date.now()}`,
    displayName: 'Alice',
    avatarId: 'avatar_queen',
    passwordHash: alicePw.hash,
    salt: alicePw.salt,
    stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 },
    createdAt: Date.now(),
  };
  db.saveUser(alice);
  const aliceToken = createSession(alice.id);

  // Create Player 2 (Bob)
  const bobPw = hashPassword('pass123');
  const bob: UserRecord = {
    id: `usr_bob_${Date.now()}`,
    username: `bob_${Date.now()}`,
    displayName: 'Bob',
    avatarId: 'avatar_prince',
    passwordHash: bobPw.hash,
    salt: bobPw.salt,
    stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 },
    createdAt: Date.now(),
  };
  db.saveUser(bob);
  const bobToken = createSession(bob.id);

  // Create active match between Alice (white) and Bob (black)
  const matchId = `match_freeze_repro_${Date.now()}`;
  const initialMatch: MatchState = {
    id: matchId,
    whitePlayer: { userId: alice.id, username: alice.username, displayName: alice.displayName, avatarId: alice.avatarId },
    blackPlayer: { userId: bob.id, username: bob.username, displayName: bob.displayName, avatarId: bob.avatarId },
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
    diceActive: false, // Normal chess without dice for clean move test
    timeControl: 300,
    whiteTimeRemaining: 300,
    blackTimeRemaining: 300,
    lastTurnStartTime: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.saveMatch(initialMatch);

  // Client 1 (Alice) connects
  const wsUrl = `ws://127.0.0.1:${port}/ws`;
  const wsAlice = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsAlice.on('open', res));
  wsAlice.send(JSON.stringify({ type: 'auth', token: aliceToken }));
  await new Promise((r) => setTimeout(r, 100));
  wsAlice.send(JSON.stringify({ type: 'match:join', matchId }));

  // Client 2 (Bob) connects
  let wsBob = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBob.on('open', res));
  wsBob.send(JSON.stringify({ type: 'auth', token: bobToken }));
  await new Promise((r) => setTimeout(r, 100));
  wsBob.send(JSON.stringify({ type: 'match:join', matchId }));

  let bobReceivedMatchState: MatchState | null = null;
  wsBob.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'match:moved' || msg.type === 'match:state') {
      bobReceivedMatchState = msg.match;
    }
  });

  // Step 1: Alice (white) makes move e2->e4 (x=4, y=1 to x=4, y=3)
  wsAlice.send(JSON.stringify({ type: 'match:move', matchId, from: { x: 4, y: 1 }, to: { x: 4, y: 3 } }));
  await new Promise((r) => setTimeout(r, 200));

  assert(bobReceivedMatchState !== null, 'Bob received move e2->e4 while connected');
  assert((bobReceivedMatchState as MatchState)?.turn === 'black', 'Turn advanced to black after e2->e4');

  // Step 2: SIMULATE NETWORK DROP / SOCKET RECONNECTION FOR BOB
  console.log('--- Simulating Bob socket disconnect and reconnect ---');
  wsBob.close();
  await new Promise((r) => setTimeout(r, 200));

  // While Bob is disconnected, Alice rolls or moves or time passes
  // Reconnect Bob with a new WebSocket connection
  const wsBob2 = new WebSocket(wsUrl);
  await new Promise<void>((res) => wsBob2.on('open', res));

  let bob2StateAfterAuth: MatchState | null = null;
  wsBob2.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    console.log('[Bob2 Client Received]:', msg.type);
    if (msg.type === 'match:state' || msg.type === 'match:moved') {
      bob2StateAfterAuth = msg.match;
    }
  });

  // Bob sends auth token on new connection
  wsBob2.send(JSON.stringify({ type: 'auth', token: bobToken }));
  await new Promise((r) => setTimeout(r, 300));

  console.log('Bob2 state after auth:', bob2StateAfterAuth ? 'RECEIVED STATE' : 'NO STATE RECEIVED (POTENTIAL FREEZE)');
  assert(bob2StateAfterAuth !== null, 'Bob2 must receive authoritative match state upon reconnection / re-auth');
  assert((bob2StateAfterAuth as MatchState).turn === 'black', 'Bob2 received state shows correct active turn');

  // Close test connections
  wsAlice.close();
  wsBob2.close();
  server.close();

  console.log('=== REPRODUCTION TEST COMPLETED ===');
}

runReproduction().catch((e) => {
  console.error(e);
  process.exit(1);
});
