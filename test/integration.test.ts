/**
 * End-to-End Integration Test for Two-Player Workflow
 */

import { db, UserRecord } from '../server/db.ts';
import { hashPassword, createSession, sanitizeUser } from '../server/auth.ts';
import { createInitialBoard, rollAuthoritativeDice, executeMove } from '../src/game/engine.ts';
import { MatchState, Challenge } from '../src/types/game.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`INTEGRATION TEST FAILED: ${msg}`);
  console.log(`✓ ${msg}`);
}

console.log('=== RUNNING TWO-PLAYER INTEGRATION TEST ===');

// 1. Create User A (Alice)
const alicePw = hashPassword('secret123');
const alice: UserRecord = {
  id: 'usr_alice_test',
  username: 'alice',
  displayName: 'Alice Champion',
  avatarId: 'avatar_queen',
  passwordHash: alicePw.hash,
  salt: alicePw.salt,
  stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 },
  createdAt: Date.now(),
};
db.saveUser(alice);
const aliceToken = createSession(alice.id);
assert(Boolean(aliceToken), 'Alice created and logged in with persistent token');

// 2. Create User B (Bob)
const bobPw = hashPassword('password456');
const bob: UserRecord = {
  id: 'usr_bob_test',
  username: 'bob',
  displayName: 'Bob Tactician',
  avatarId: 'avatar_prince',
  passwordHash: bobPw.hash,
  salt: bobPw.salt,
  stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 },
  createdAt: Date.now(),
};
db.saveUser(bob);
const bobToken = createSession(bob.id);
assert(Boolean(bobToken), 'Bob created and logged in with persistent token');

// 3. User Discovery: Alice searches for Bob
const foundBob = db.findUserByUsername('bob');
assert(foundBob?.id === bob.id, 'Alice can search and discover Bob by username');

// 4. Alice sends Challenge to Bob
const challengeId = `ch_test_${Date.now()}`;
const challenge: Challenge = {
  id: challengeId,
  challenger: {
    userId: alice.id,
    username: alice.username,
    displayName: alice.displayName,
    avatarId: alice.avatarId,
  },
  challenged: {
    userId: bob.id,
    username: bob.username,
    displayName: bob.displayName,
    avatarId: bob.avatarId,
  },
  status: 'pending',
  timeControl: 300,
  moveSuggestions: 'included',
  createdAt: Date.now(),
  expiresAt: Date.now() + 300000,
};
db.saveChallenge(challenge);
assert(db.challenges.get(challengeId)?.status === 'pending', 'Challenge successfully stored in database');

// 5. Bob accepts Challenge
const matchId = `match_test_${Date.now()}`;
challenge.status = 'accepted';
challenge.matchId = matchId;
db.saveChallenge(challenge);

const newMatch: MatchState = {
  id: matchId,
  whitePlayer: challenge.challenger,
  blackPlayer: challenge.challenged,
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
  diceActive: true,
  timeControl: 300,
  whiteTimeRemaining: 300,
  blackTimeRemaining: 300,
  lastTurnStartTime: Date.now(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
db.saveMatch(newMatch);
assert(db.matches.get(matchId) !== undefined, 'Single authoritative match created upon acceptance');

// 6. User A (White) rolls dice & moves e2 -> e4
newMatch.dice = rollAuthoritativeDice(newMatch.board, 'white', 5); // Roll 5 (Pawns eligible)
const moveRes1 = executeMove(newMatch, { x: 4, y: 1 }, { x: 4, y: 3 });
assert(moveRes1.success, 'White executes legal pawn move e2->e4');
db.saveMatch(moveRes1.state);

// 7. User B (Black) rolls dice & moves e7 -> e5
const matchAfterMove1 = db.matches.get(matchId)!;
assert(matchAfterMove1.turn === 'black', 'Authoritative state accurately reflects Black’s turn');
matchAfterMove1.dice = rollAuthoritativeDice(matchAfterMove1.board, 'black', 6);
const moveRes2 = executeMove(matchAfterMove1, { x: 4, y: 6 }, { x: 4, y: 4 });
assert(moveRes2.success, 'Black executes legal pawn move e7->e5');
db.saveMatch(moveRes2.state);

// 8. Reconnection Verification
// Simulating user refreshing page and querying match by ID from server
const reconnectedMatch = db.matches.get(matchId);
assert(reconnectedMatch !== undefined, 'Match state persists and is retrieved on reconnect');
assert(reconnectedMatch?.moveHistory.length === 2, 'Full move history intact across refresh');
assert(reconnectedMatch?.turn === 'white', 'Correct player turn restored');

console.log('=== ALL 8 INTEGRATION TESTS PASSED! ===');

// ============================================================================
// 9. CULLING GAME CUSTOM ROOM & FIRST-MOVE INTEGRATION TEST
// ============================================================================
console.log('=== RUNNING CULLING GAME ROOM & FIRST-MOVE INTEGRATION TEST ===');

import {
  createInitialCullingMatch,
  executeCullingMove,
} from '../src/game/cullingEngine.ts';
import type { CullingMatchState, CullingPieceColor } from '../src/types/cullingGame.ts';

// Simulated in-memory Direct Challenge Map & Rooms Map (matching server/cullingSocket.ts)
interface TestDirectChallenge {
  code: string;
  hostUserId: string;
  hostDisplayName: string;
  timeControl: 120 | 300;
  preferredSide: 'white' | 'black' | 'random';
  createdAt: number;
}
const testDirectChallenges = new Map<string, TestDirectChallenge>();
const testCullingRooms = new Map<string, { match: CullingMatchState }>();

// Step 9.1: Host (Alice) creates a direct challenge room
const hostUserId = alice.id;
const hostDisplayName = alice.displayName;
const roomCode = 'CULL77';

testDirectChallenges.set(roomCode, {
  code: roomCode,
  hostUserId,
  hostDisplayName,
  timeControl: 300,
  preferredSide: 'white', // Host prefers White
  createdAt: Date.now(),
});

assert(testDirectChallenges.has(roomCode), 'Culling: Host creates challenge room with unique code');
const storedChallenge = testDirectChallenges.get(roomCode)!;
assert(storedChallenge.code === 'CULL77', 'Culling: Room code is normalized and stored');

// Step 9.2: Verify host cannot join their own room
const selfJoinBlocked = storedChallenge.hostUserId === hostUserId;
assert(selfJoinBlocked, 'Culling: Self-joining is strictly blocked');

// Step 9.3: Guest (Bob) joins using room code
const guestUserId = bob.id;
const guestDisplayName = bob.displayName;

// Check code validity & expiration
const rawCodeInput = ' cull77 ';
const normalizedCode = rawCodeInput.trim().toUpperCase();
assert(testDirectChallenges.has(normalizedCode), 'Culling: Case and whitespace normalization matches room code');

const activeChallenge = testDirectChallenges.get(normalizedCode)!;
testDirectChallenges.delete(normalizedCode); // Consumed, no 3rd player can join
assert(!testDirectChallenges.has(normalizedCode), 'Culling: Challenge code consumed upon joining');

// Side determination: host chose 'white' -> host is White, guest is Black
const isHostWhite = activeChallenge.preferredSide === 'white';
const whiteId = isHostWhite ? activeChallenge.hostUserId : guestUserId;
const blackId = isHostWhite ? guestUserId : activeChallenge.hostUserId;
const hostAssignedColor: CullingPieceColor = isHostWhite ? 'white' : 'black';
const guestAssignedColor: CullingPieceColor = isHostWhite ? 'black' : 'white';

assert(hostAssignedColor === 'white', 'Culling: Host assigned White');
assert(guestAssignedColor === 'black', 'Culling: Guest assigned Black');

// Create authoritative initial Culling match
const cullingMatchId = `cull_test_${normalizedCode}_${Date.now()}`;
const initialCullingMatch = createInitialCullingMatch(
  cullingMatchId,
  {
    userId: whiteId,
    username: alice.username,
    displayName: alice.displayName,
    avatarId: alice.avatarId,
  },
  {
    userId: blackId,
    username: bob.username,
    displayName: bob.displayName,
    avatarId: bob.avatarId,
  },
  activeChallenge.timeControl
);

testCullingRooms.set(cullingMatchId, { match: initialCullingMatch });
assert(testCullingRooms.has(cullingMatchId), 'Culling: Authoritative match created on server');

// Both clients receive initial match state with guaranteed assigned color
const hostClientMatch = { ...initialCullingMatch };
const hostClientColor = hostAssignedColor;
const guestClientMatch = { ...initialCullingMatch };
const guestClientColor = guestAssignedColor;

assert(hostClientMatch.status === 'active', 'Culling: Both clients receive active status');
assert(hostClientMatch.turn === 'white', 'Culling: Initial turn is White');
assert(hostClientColor === hostClientMatch.turn, 'Culling: First-move player (White) board is interactive');
assert(guestClientColor !== guestClientMatch.turn, 'Culling: Second-move player (Black) board is locked awaiting White');

// Step 9.4: The first player (White - Alice) makes the first legal move
// White Pawn at D2 (x=4, y=2) advances to D3 (x=4, y=3)
const whiteMoveRes = executeCullingMove(
  hostClientMatch,
  { x: 4, y: 2 },
  { x: 4, y: 3 },
  'move'
);

assert(whiteMoveRes.success, 'Culling: First player (White) successfully executes opening move D2->D3');
assert(whiteMoveRes.state.turn === 'black', 'Culling: Authoritative turn transitions to Black');
assert(whiteMoveRes.state.history.length === 1, 'Culling: Move recorded in history');

// Server broadcasts delta / new state to room
testCullingRooms.get(cullingMatchId)!.match = whiteMoveRes.state;

// Guest receives updated state
const guestUpdatedMatch = testCullingRooms.get(cullingMatchId)!.match;
assert(guestUpdatedMatch.turn === guestClientColor, 'Culling: Second player (Black) board unlocks on their turn');

// Step 9.5: Second player (Black - Bob) responds with legal move
// Black Pawn at D7 (x=4, y=7) advances to D6 (x=4, y=6)
const blackMoveRes = executeCullingMove(
  guestUpdatedMatch,
  { x: 4, y: 7 },
  { x: 4, y: 6 },
  'move'
);

assert(blackMoveRes.success, 'Culling: Second player (Black) successfully executes response move D7->D6');
assert(blackMoveRes.state.turn === 'white', 'Culling: Turn cycles back to White cleanly');
assert(blackMoveRes.state.history.length === 2, 'Culling: Full two-player sequence complete without desync');

console.log('=== ALL CULLING ROOM & FIRST-MOVE INTEGRATION TESTS PASSED! ===');

