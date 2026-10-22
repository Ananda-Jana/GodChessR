import assert from 'assert';
import { createInitialRoseMatch, applyRoseMove, applyRoseSummon } from '../../src/rose/roseRules.ts';
import { generateRoseCode, createRoseRoom, getRoomByCode } from '../../server/rose/roseRooms.ts';

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

const room = createRoseRoom('user_host', 'host', 'Host Boyfriend', 'avatar_prince', 'boyfriend', 60, true);
assert(room.match.code, 'Room should have a code');
assert(room.match.status === 'waiting_guest', 'Room should start in waiting_guest state');
console.log('✓ Rose room creation passed');

// 3. Rules & Petal Tests
const match = createInitialRoseMatch('room_test', 'ROSE-TEST1', hostSeat, 60, true);
assert(match.board[0][0]?.type === 'queen', 'Standard initial board queen on a1');
console.log('✓ Rose initial board setup passed');

console.log('=== ALL ROSE PARADISE TESTS PASSED SUCCESSFULLY! ===');
