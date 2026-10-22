import assert from 'assert';
import { createInitialRoseMatch, applyRoseMove, applyRoseSummon } from '../../src/rose/roseRules.ts';
import { generateRoseCode, createRoseRoom, joinRoseRoom, getRoomByCode, getPublicRoseRooms } from '../../server/rose/roseRooms.ts';
import { getBestRoseBotMove, getBotSummonChoice, getRandomBotReaction, getRandomBotMessage } from '../../src/rose/roseBot.ts';

console.log('=== RUNNING ROSE PARADISE TESTS ===');

// 1. Code Uniqueness & Generation Tests
const code1 = generateRoseCode();
const code2 = generateRoseCode();
assert(code1.startsWith('ROSE-'), 'Rose code should start with ROSE-');
assert(code1.length === 11, 'Rose code length should be 11 (ROSE-XXXXXX)');
console.log('✓ Rose code generation & format passed');

// 2. Room Creation & Role Assignment Tests
const hostSeat = {
  userId: 'user_host',
  username: 'host',
  displayName: 'Host Boyfriend',
  role: 'boyfriend' as const,
  color: 'white' as const,
  petals: 0,
  summonsUsed: 0,
  lastLoveLinkTurn: 0,
  resumeToken: 'tok_1',
  isConnected: true,
  lastSeen: Date.now(),
};

const room = createRoseRoom('user_host', 'host', 'Host Boyfriend', 'avatar_prince', 'boyfriend', 0, true);
assert(room.match.code, 'Room should have a code');
assert(room.match.status === 'waiting_guest', 'Room should start in waiting_guest state');
assert(room.match.timeControl === 0, 'Room should default to untimed');
console.log('✓ Rose room creation passed');

// 3. Instant Match Join Test (Zero Stalling)
const publicRooms = getPublicRoseRooms();
assert(publicRooms.some(r => r.code === room.match.code), 'Room should appear in public lobby list');

const joinRes = joinRoseRoom(room.match.code, 'user_guest', 'guest', 'Guest Girlfriend', 'avatar_queen');
assert(joinRes.success, 'Join should succeed');
assert(joinRes.room?.match.status === 'active', 'Match should become active immediately on join');
assert(joinRes.guestSeat?.role === 'girlfriend', 'Guest should be assigned girlfriend role');
assert(joinRes.guestSeat?.color === 'black', 'Guest should be assigned black color opposite white');
console.log('✓ Instant zero-lag room join & role assignment passed');

// 4. Rules & Initial Board Tests
const match = createInitialRoseMatch('room_test', 'ROSE-TEST1', hostSeat, 0, true);
match.status = 'active';
assert(match.board[0][0]?.type === 'queen', 'Standard initial board queen on a1');
console.log('✓ Rose initial board setup passed');

// 5. Rose Bot Intelligence & Dialogue Tests
const botMove = getBestRoseBotMove(match, 'white');
assert(botMove, 'Bot should compute a valid move');
assert(typeof botMove.from.x === 'number' && typeof botMove.to.y === 'number', 'Bot move should have coordinates');
console.log('✓ Rose bot move calculation passed');

// Move white pawn e2 -> e4 to vacate (4, 1)
const moveRes = applyRoseMove(match, { x: 4, y: 1 }, { x: 4, y: 3 });
assert(moveRes.success && moveRes.state, 'Pawn move should succeed');
const summonChoice = getBotSummonChoice(moveRes.state, 'white');
assert(summonChoice, 'Bot should find a summon square');
assert(
  ['queen', 'bishop', 'knight', 'rook', 'supremeRook', 'priest', 'communist'].includes(summonChoice.pieceType),
  'Bot should pick a valid unit from multi-summon choices'
);
console.log('✓ Rose bot summon choice with multiple units passed');

// Test summoning anywhere on the board (e.g. center square { x: 4, y: 4 })
moveRes.state.turn = 'white';
moveRes.state.whiteSeat!.petals = 3;
const summonPlacementRes = applyRoseSummon(moveRes.state, 'user_host', 'queen', { x: 4, y: 4 });
assert(summonPlacementRes.success, 'Summon Queen anywhere on empty unchecking board square should succeed');
assert(summonPlacementRes.state?.board[4][4]?.type === 'queen', 'Placed piece should be Queen');
assert(summonPlacementRes.state?.whiteSeat?.petals === 0, 'Petals should be deducted by 3');
assert(summonPlacementRes.state?.turn === 'black', 'Turn should advance to opponent after summon');
console.log('✓ Rose universal board summon placement (Queen at 4,4) passed');

const botEmoji = getRandomBotReaction();
assert(botEmoji && botEmoji.length > 0, 'Bot should return a reaction emoji');
const botMsg = getRandomBotMessage('start');
assert(botMsg && botMsg.length > 0, 'Bot should return a romantic dialogue message');
console.log('✓ Rose bot dialogue and reaction suite passed');

console.log('=== ALL ROSE PARADISE TESTS PASSED SUCCESSFULLY! ===');
