/**
 * Automated Test Suite for Jujutsu Kaisen Culling Game Engine & Bot
 */

import {
  isValidCullingPos,
  posToCullingSquare,
  cullingSquareToPos,
  TOTAL_PLAYABLE_SQUARES,
} from '../src/types/cullingGame';
import {
  createInitialCullingBoard,
  createInitialCullingMatch,
  getLegalMovesForSquare,
  getAllLegalMoves,
  executeCullingMove,
  isCullingKingInCheck,
  canPieceBeCaptured,
} from '../src/game/cullingEngine';
import { getBestCullingBotMove, evaluateCullingBoard } from '../src/game/cullingBot';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('=== RUNNING CULLING GAME ENGINE & BOT TESTS ===');

// 1. Cross-board playable square verification (Exactly 88 squares)
let playableCount = 0;
let voidCount = 0;
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 10; x++) {
    if (isValidCullingPos(x, y)) {
      playableCount++;
    } else {
      voidCount++;
    }
  }
}
assert(playableCount === TOTAL_PLAYABLE_SQUARES && playableCount === 88, 'Board contains exactly 88 playable squares');
assert(voidCount === 12, 'Board contains exactly 12 void corner cells');

// Test square coordinate round-trip
assert(posToCullingSquare({ x: 8, y: 1 }) === 'H1', 'H1 maps correctly');
assert(posToCullingSquare({ x: 1, y: 8 }) === 'A8', 'A8 maps correctly');
assert(posToCullingSquare({ x: 2, y: 0 }) === 'B0', 'B0 bottom arm maps correctly');
assert(posToCullingSquare({ x: 7, y: 9 }) === 'G9', 'G9 top arm maps correctly');
assert(posToCullingSquare({ x: 0, y: 3 }) === 'L3', 'L3 left arm maps correctly');
assert(posToCullingSquare({ x: 9, y: 5 }) === 'R5', 'R5 right arm maps correctly');
assert(posToCullingSquare({ x: 0, y: 0 }) === 'VOID', '(0,0) is void cell');

const pGojo = cullingSquareToPos('H1');
assert(pGojo?.x === 8 && pGojo?.y === 1, 'cullingSquareToPos(H1) reverses accurately');

// 2. Initial Roster Setup
const board = createInitialCullingBoard();

// White protagonists
assert(board[1][8]?.type === 'culling_gojo' && board[1][8]?.color === 'white', 'Satoru Gojo is at H1');
assert(board[1][7]?.type === 'culling_yuji' && board[1][7]?.color === 'white', 'Yuji Itadori is at G1');
assert(board[1][6]?.type === 'culling_mechamaru' && board[1][6]?.color === 'white', 'Mechamaru is at F1');
assert(board[1][5]?.type === 'culling_panda' && board[1][5]?.color === 'white', 'Panda is at E1');
assert(board[1][4]?.type === 'culling_nanami' && board[1][4]?.color === 'white', 'Kento Nanami is at D1');
assert(board[1][3]?.type === 'culling_maki' && board[1][3]?.color === 'white', 'Maki Zenin is at C1');
assert(board[1][2]?.type === 'culling_hakari' && board[1][2]?.color === 'white', 'Kinji Hakari is at B1');
for (let x = 2; x <= 7; x++) {
  assert(board[2][x]?.type === 'culling_pawn' && board[2][x]?.color === 'white', `White Pawn is in front at column ${x} row 2`);
}

// Black antagonists
assert(board[8][1]?.type === 'culling_sukuna' && board[8][1]?.color === 'black', 'Ryomen Sukuna is at A8');
assert(board[8][2]?.type === 'culling_kenjaku' && board[8][2]?.color === 'black', 'Kenjaku is at B8');
assert(board[8][3]?.type === 'culling_uraume' && board[8][3]?.color === 'black', 'Uraume is at C8');
assert(board[8][4]?.type === 'culling_yorozu' && board[8][4]?.color === 'black', 'Yorozu is at D8');
assert(board[8][5]?.type === 'culling_reggie' && board[8][5]?.color === 'black', 'Reggie Star is at E8');
assert(board[8][6]?.type === 'culling_naoya' && board[8][6]?.color === 'black', 'Naoya Zenin is at F8');
assert(board[8][7]?.type === 'culling_kurourushi' && board[8][7]?.color === 'black', 'Kurourushi is at G8');
for (let x = 2; x <= 7; x++) {
  assert(board[7][x]?.type === 'culling_pawn' && board[7][x]?.color === 'black', `Black Pawn is in front at column ${x} row 7`);
}

// 3. Gojo & Sukuna 5-turn capture immunity
const gojoPiece = board[1][8]!;
const sukunaPiece = board[8][1]!;
const dummyAttacker = board[8][2]!;

assert(canPieceBeCaptured(gojoPiece, dummyAttacker, 1) === false, 'Gojo immune to capture on turn 1');
assert(canPieceBeCaptured(gojoPiece, dummyAttacker, 5) === false, 'Gojo immune to capture on turn 5');
assert(canPieceBeCaptured(gojoPiece, dummyAttacker, 6) === true, 'Gojo becomes vulnerable after turn 5');
assert(canPieceBeCaptured(sukunaPiece, dummyAttacker, 3) === false, 'Sukuna immune to capture on turn 3');
assert(canPieceBeCaptured(sukunaPiece, dummyAttacker, 6) === true, 'Sukuna becomes vulnerable after turn 5');

// 4. Nanami immunity against low-value pieces
const nanamiPiece = board[1][4]!;
const pawnAttacker = board[7][2]!;
const swarmAttacker = { id: 'sw', type: 'culling_swarm' as const, color: 'black' as const, hasMoved: true };
const queenAttacker = board[8][2]!; // Kenjaku

assert(canPieceBeCaptured(nanamiPiece, pawnAttacker, 6) === false, 'Nanami is immune to Pawn captures');
assert(canPieceBeCaptured(nanamiPiece, swarmAttacker, 6) === false, 'Nanami is immune to Roach Swarm captures');
assert(canPieceBeCaptured(nanamiPiece, queenAttacker, 6) === true, 'Nanami can be captured by higher-value pieces');

// 5. Match Initial State and Legal Moves
const match = createInitialCullingMatch(
  'test_match',
  { userId: 'u1', username: 'GojoPlayer', displayName: 'Gojo Player' },
  { userId: 'u2', username: 'SukunaPlayer', displayName: 'Sukuna Player' }
);
assert(match.turn === 'white', 'Initial turn is White');
assert(match.turnCount === 1, 'Initial turnCount is 1');
assert(match.status === 'active', 'Initial match status is active');

const allWhiteMoves = getAllLegalMoves(match);
assert(allWhiteMoves.length > 0, 'White has valid initial legal moves');

// Pawns in front can advance immediately to rank 3
const pawnMovesD2 = getLegalMovesForSquare(match, { x: 4, y: 2 });
assert(pawnMovesD2.some((m) => m.to.x === 4 && m.to.y === 3), 'White Pawn at D2 can advance to D3 like normal chess');

// Gojo teleport moves
const gojoMoves = getLegalMovesForSquare(match, { x: 8, y: 1 });
const teleportMoves = gojoMoves.filter((m) => m.actionType === 'teleport');
assert(teleportMoves.length > 0, 'Gojo has initial teleportation options within range 3');

// Mechamaru physical move check
const mechaMoves = getLegalMovesForSquare(match, { x: 6, y: 1 });
assert(mechaMoves.length > 0, 'Mechamaru has physical straight-line move and overdrive rush options');

// 6. Move Execution Test: Gojo teleport move
const executeRes = executeCullingMove(match, { x: 8, y: 1 }, teleportMoves[0].to, 'teleport');
assert(executeRes.success === true, 'Gojo teleport successfully executed');
assert(executeRes.state.turn === 'black', 'Turn switched to Black after Gojo action');
assert(executeRes.state.turnCount === 2, 'Turn count incremented');

// Verify Maki can leap over pieces
const makiMoves = getLegalMovesForSquare(match, { x: 3, y: 1 });
assert(makiMoves.length > 0, 'Maki can perform orthogonal leaps over pieces');

// 7. Culling Bot Minimax Test
const botMove = getBestCullingBotMove(executeRes.state, 'black', 2);
assert(botMove !== null, 'Culling Bot computed an authoritative move');
assert(botMove?.piece.color === 'black', 'Bot move belongs to Black');
assert(isValidCullingPos(botMove!.to.x, botMove!.to.y), 'Bot move lands on a valid 88-square cell');

console.log('=== ALL CULLING GAME TESTS PASSED! ===');
