/**
 * Comprehensive Automated Test Suite for GodChess Board Expansion and Crafting Mechanics
 */

import {
  createInitialBoard,
  getLegalMovesForSquare,
  getAllLegalMoves,
  executeMove,
  isInsideBoard,
  posToNotation,
  notationToPos,
  expandBoard,
  applyBoardExpansion,
  getCandidateCraftingSquares,
  validateCraftPlacement,
  applyCraftPlacement,
  isSquareAttacked,
} from '../src/game/engine.ts';
import {
  CRAFTABLE_PIECES,
  CRAFTABLE_MAP,
  getCraftablePreviewOffsets,
} from '../src/game/craftables.ts';
import {
  getBotExpansionChoice,
  getBotCraftingChoice,
} from '../src/game/bot.ts';
import {
  MatchState,
  Piece,
  Position,
  EXPANSION_LOST_PIECES_THRESHOLD,
  CRAFTING_LOST_EXPENSIVE_THRESHOLD,
} from '../src/types/game.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('=== RUNNING GODCHESS BOARD EXPANSION & CRAFTING TESTS ===');

// --- TEST 1: Board Expansion Dynamics ---
const baseBoard = createInitialBoard();
assert(baseBoard.length === 8 && baseBoard[0].length === 8, 'Initial board is 8x8');

const topExpanded = expandBoard(baseBoard, 'top');
assert(topExpanded.length === 9 && topExpanded[0].length === 8, 'Expand top creates 9x8 board');
assert(topExpanded[8].every((sq) => sq === null), 'New top row (rank 9) is completely empty');

const bottomExpanded = expandBoard(baseBoard, 'bottom');
assert(bottomExpanded.length === 9 && bottomExpanded[0].length === 8, 'Expand bottom creates 9x8 board');
assert(bottomExpanded[0].every((sq) => sq === null), 'New bottom row (rank 1) is completely empty');

const leftExpanded = expandBoard(baseBoard, 'left');
assert(leftExpanded.length === 8 && leftExpanded[0].length === 9, 'Expand left creates 8x9 board');
assert(leftExpanded.every((row) => row[0] === null), 'New left column is completely empty');

const rightExpanded = expandBoard(baseBoard, 'right');
assert(rightExpanded.length === 8 && rightExpanded[0].length === 9, 'Expand right creates 8x9 board');
assert(rightExpanded.every((row) => row[8] === null), 'New right column (file i) is completely empty');

// Notation tests for expanded coordinates
assert(posToNotation({ x: 8, y: 8 }) === 'i9', '(8, 8) maps to i9');
assert(posToNotation({ x: 9, y: 9 }) === 'j10', '(9, 9) maps to j10');

// Dynamic bounds test
assert(isInsideBoard(8, 7, 9, 8) === true, 'i8 is inside 9x8 board');
assert(isInsideBoard(8, 7, 8, 8) === false, 'i8 is outside standard 8x8 board');

// --- TEST 2: Communist Movement Engine ---
// Communist from (4, 4):
// Up (+2, +4): (4, 6) via (3, 5) or (5, 5); (4, 8) via (3, 5),(4, 6),(3, 7) or (5, 5),(4, 6),(5, 7)
const empty9x9: (Piece | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
empty9x9[4][4] = { id: 'c1', type: 'communist', color: 'white', hasMoved: false };

const communistMoves = getLegalMovesForSquare(empty9x9, { x: 4, y: 4 });
assert(communistMoves.length > 0, 'Communist generates moves in open board');

const hasUp2 = communistMoves.some((m) => m.to.x === 4 && m.to.y === 6);
const hasUp4 = communistMoves.some((m) => m.to.x === 4 && m.to.y === 8);
const hasDown2 = communistMoves.some((m) => m.to.x === 4 && m.to.y === 2);
const hasDown4 = communistMoves.some((m) => m.to.x === 4 && m.to.y === 0);
const hasRight2 = communistMoves.some((m) => m.to.x === 6 && m.to.y === 4);
const hasRight4 = communistMoves.some((m) => m.to.x === 8 && m.to.y === 4);
const hasLeft2 = communistMoves.some((m) => m.to.x === 2 && m.to.y === 4);
const hasLeft4 = communistMoves.some((m) => m.to.x === 0 && m.to.y === 4);

assert(hasUp2 && hasUp4, 'Communist can move up 2 and 4 in zigzag');
assert(hasDown2 && hasDown4, 'Communist can move down 2 and 4 in zigzag');
assert(hasRight2 && hasRight4, 'Communist can move right 2 and 4 in zigzag');
assert(hasLeft2 && hasLeft4, 'Communist can move left 2 and 4 in zigzag');

// Test zigzag blockage: if BOTH phase A and phase B are blocked, move is illegal
const blockedBoard: (Piece | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
blockedBoard[4][4] = { id: 'c1', type: 'communist', color: 'white', hasMoved: false };
// Block both vias for up 2: (-1, 1) -> (3, 5) and (1, 1) -> (5, 5)
blockedBoard[5][3] = { id: 'obs1', type: 'pawn', color: 'white', hasMoved: false };
blockedBoard[5][5] = { id: 'obs2', type: 'pawn', color: 'white', hasMoved: false };
const blockedMoves = getLegalMovesForSquare(blockedBoard, { x: 4, y: 4 });
assert(!blockedMoves.some((m) => m.to.x === 4 && m.to.y === 6), 'Communist cannot move to (4, 6) when both intermediate zigzag paths are blocked');

// If only ONE via is blocked, the alternate via allows the move!
blockedBoard[5][3] = null; // Unblock left via
const halfBlockedMoves = getLegalMovesForSquare(blockedBoard, { x: 4, y: 4 });
assert(halfBlockedMoves.some((m) => m.to.x === 4 && m.to.y === 6), 'Communist CAN move to (4, 6) if at least ONE zigzag via is open');

// --- TEST 3: Supreme Rook Movement Engine ---
const srBoard: (Piece | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
srBoard[4][4] = { id: 'sr1', type: 'supremeRook', color: 'white', hasMoved: false };
const srMoves = getLegalMovesForSquare(srBoard, { x: 4, y: 4 });

// Slides orthogonally
assert(srMoves.some((m) => m.to.x === 4 && m.to.y === 8), 'Supreme Rook slides full orthogonal distance to (4, 8)');
// Diagonal leap of distance 2 jumps over pieces
srBoard[5][5] = { id: 'obs_diag', type: 'pawn', color: 'black', hasMoved: false };
const srMovesWithObs = getLegalMovesForSquare(srBoard, { x: 4, y: 4 });
assert(srMovesWithObs.some((m) => m.to.x === 6 && m.to.y === 6), 'Supreme Rook leaps diagonally over intervening piece to (6, 6)');

// --- TEST 4: Priest Movement Engine ---
const priestBoard: (Piece | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
priestBoard[4][4] = { id: 'p1', type: 'priest', color: 'white', hasMoved: false };
const priestMoves = getLegalMovesForSquare(priestBoard, { x: 4, y: 4 });

// Slides 1-3 diagonally
assert(priestMoves.some((m) => m.to.x === 7 && m.to.y === 7), 'Priest slides 3 squares diagonally to (7, 7)');
assert(!priestMoves.some((m) => m.to.x === 8 && m.to.y === 8), 'Priest cannot slide 4 squares diagonally (capped at 3)');
// Leaps 2 squares orthogonally
priestBoard[4][5] = { id: 'obs_orth', type: 'pawn', color: 'white', hasMoved: false };
const priestMovesWithObs = getLegalMovesForSquare(priestBoard, { x: 4, y: 4 });
assert(priestMovesWithObs.some((m) => m.to.x === 4 && m.to.y === 6), 'Priest leaps 2 squares orthogonally over intervening piece to (4, 6)');

// --- TEST 5: Preview Grid Consistency ---
for (const craftable of CRAFTABLE_PIECES) {
  const previewOffsets = getCraftablePreviewOffsets(craftable);
  assert(previewOffsets.length > 0, `Preview offsets generated for ${craftable.name}`);
  // Verify preview offsets do not exceed radius 4
  const withinRadius = previewOffsets.every((o) => Math.abs(o.dx) <= 4 && Math.abs(o.dy) <= 4);
  assert(withinRadius, `All preview offsets for ${craftable.name} are within 9x9 preview bounds`);
}

// --- TEST 6: Candidate Placement Validation ---
const testMatchBoard: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
// Place kings so check detection works
testMatchBoard[0][4] = { id: 'wk', type: 'king', color: 'white', hasMoved: false };
testMatchBoard[7][4] = { id: 'bk', type: 'king', color: 'black', hasMoved: false };

// Enemy rook attacking row 1 column 0
testMatchBoard[6][0] = { id: 'br', type: 'rook', color: 'black', hasMoved: false };

const candidates = getCandidateCraftingSquares(testMatchBoard, 'white', 'communist');
// Row 0 and Row 1 are home zone
assert(candidates.validSquares.length > 0, 'Candidate valid home zone squares computed');
assert(candidates.attackedSquares.some((p) => p.x === 0 && (p.y === 0 || p.y === 1)), 'Squares in column 0 attacked by Black Rook are marked attacked');

// Test validateCraftPlacement
const validPos = candidates.validSquares[0];
const validationResult = validateCraftPlacement(testMatchBoard, 'white', 'communist', validPos);
assert(validationResult.valid === true, 'Safe home square passes craft validation');

const invalidAttackedPos: Position = { x: 0, y: 1 };
const attackedValidation = validateCraftPlacement(testMatchBoard, 'white', 'communist', invalidAttackedPos);
assert(attackedValidation.valid === false, 'Attacked square is rejected by authoritative validator');

// Non-home square rejected
const midBoardValidation = validateCraftPlacement(testMatchBoard, 'white', 'communist', { x: 4, y: 4 });
assert(midBoardValidation.valid === false, 'Mid-board square rejected by validator');

// --- TEST 7: Bot Expansion and Crafting Decisions ---
const botExpWhite = getBotExpansionChoice('white');
assert(botExpWhite === 'bottom', 'Bot picks bottom row for White expansion (O(1))');
const botExpBlack = getBotExpansionChoice('black');
assert(botExpBlack === 'top', 'Bot picks top row for Black expansion (O(1))');

const botCraft = getBotCraftingChoice(testMatchBoard, 'white');
assert(botCraft !== null, 'Bot picks first valid craft square in O(k)');
assert(botCraft?.pieceType === 'communist', 'Bot selects first craftable');

// --- TEST 8: Trigger Integration & Precedence ---
const initialMatch: MatchState = {
  id: 'test_match_precedence',
  whitePlayer: { userId: 'u1', username: 'w', displayName: 'White', avatarId: '1' },
  blackPlayer: { userId: 'u2', username: 'b', displayName: 'Black', avatarId: '2' },
  board: Array.from({ length: 8 }, () => Array(8).fill(null)),
  turn: 'white',
  status: 'active',
  dice: null,
  diceActive: false,
  whitePawnsReachedEndRank: 0,
  blackPawnsReachedEndRank: 0,
  capturedByWhite: [],
  capturedByBlack: [],
  totalCaptures: 0,
  lostPieces: { white: 6, black: 6 }, // 1 away from 7th lost piece
  lostExpensive: { white: 1, black: 1 }, // Need 1 more to trigger crafting
  expansionUsed: { white: false, black: false },
  expansionPending: { white: false, black: false },
  craftingUsed: { white: false, black: false },
  craftingPending: { white: false, black: false },
  pausedForAction: null,
  moveSuggestions: 'included',
  moveHistory: [],
  inCheck: null,
  result: null,
  whiteTimeRemaining: 300,
  blackTimeRemaining: 300,
  timeControl: 300,
  lastTurnStartTime: Date.now(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Place Kings safely away from queens
initialMatch.board[0][0] = { id: 'wk', type: 'king', color: 'white', hasMoved: false };
initialMatch.board[7][7] = { id: 'bk', type: 'king', color: 'black', hasMoved: false };
initialMatch.board[3][3] = { id: 'wq', type: 'queen', color: 'white', hasMoved: true };
initialMatch.board[4][3] = { id: 'bq', type: 'queen', color: 'black', hasMoved: true };

// Move White Queen from (x=3, y=3) to (x=3, y=4) capturing Black Queen
const moveRes = executeMove(initialMatch, { x: 3, y: 3 }, { x: 3, y: 4 });
if (!moveRes.success) {
  console.error('ExecuteMove error:', moveRes.error);
}
assert(moveRes.success === true, 'Capture move executed successfully');

const nextState = moveRes.state;
assert(nextState.lostPieces.black === 7, 'Black lost pieces counter incremented to 7 (O(1))');
assert(nextState.lostExpensive.black === 2, 'Black lost expensive counter incremented to 2 (O(1))');
assert(nextState.expansionPending.black === true, 'Black expansion flagged pending');
assert(nextState.craftingPending.black === true, 'Black crafting flagged pending');

// Precedence test: Expansion prompt first, followed by crafting!
assert(nextState.pausedForAction !== null, 'Game paused for action');
assert(nextState.pausedForAction?.type === 'expansion', 'Precedence rule: Expansion prompt appears first!');
assert(nextState.pausedForAction?.player === 'black', 'Paused for victim Black player');

// Apply expansion: Crafting prompt should follow immediately!
const expandedState = applyBoardExpansion(nextState, 'black', 'top');
assert(expandedState.board.length === 9, 'Board expanded to 9 rows');
assert(expandedState.expansionUsed.black === true, 'Expansion marked used for Black');
assert(expandedState.expansionPending.black === false, 'Expansion pending cleared');
assert(expandedState.pausedForAction?.type === 'crafting', 'Precedence rule: Crafting prompt appears immediately after expansion!');
assert(expandedState.pausedForAction?.player === 'black', 'Crafting paused for Black');

// --- TEST 9: Crafting While In Check (Locked craft banner & resolution unlock) ---
const inCheckMatch: MatchState = {
  id: 'test_match_craft_in_check',
  whitePlayer: { userId: 'u1', username: 'w', displayName: 'White', avatarId: '1' },
  blackPlayer: { userId: 'u2', username: 'b', displayName: 'Black', avatarId: '2' },
  board: Array.from({ length: 8 }, () => Array(8).fill(null)),
  turn: 'white',
  status: 'active',
  dice: null,
  diceActive: false,
  whitePawnsReachedEndRank: 0,
  blackPawnsReachedEndRank: 0,
  capturedByWhite: [],
  capturedByBlack: [],
  totalCaptures: 0,
  lostPieces: { white: 0, black: 2 },
  lostExpensive: { white: 0, black: 1 }, // 1 away from 2nd expensive lost piece
  expansionUsed: { white: false, black: false },
  expansionPending: { white: false, black: false },
  craftingUsed: { white: false, black: false },
  craftingPending: { white: false, black: false },
  craftingLocked: { white: false, black: false },
  pausedForAction: null,
  moveSuggestions: 'included',
  moveHistory: [],
  inCheck: null,
  result: null,
  whiteTimeRemaining: 300,
  blackTimeRemaining: 300,
  timeControl: 300,
  lastTurnStartTime: Date.now(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Setup:
// White King at (0, 0)
// White Queen at (3, 3)
// Black Rook (expensive) at (3, 7)
// Black King at (4, 7)
inCheckMatch.board[0][0] = { id: 'wk', type: 'king', color: 'white', hasMoved: false };
inCheckMatch.board[7][4] = { id: 'bk', type: 'king', color: 'black', hasMoved: false };
inCheckMatch.board[3][3] = { id: 'wq', type: 'queen', color: 'white', hasMoved: true };
inCheckMatch.board[7][3] = { id: 'br', type: 'rook', color: 'black', hasMoved: true };

// White Queen captures Black Rook at (3, 7):
// 1. Black loses 2nd expensive piece -> triggers crafting
// 2. White Queen at (3, 7) directly attacks Black King at (4, 7) horizontally -> puts Black in check!
const capCheckRes = executeMove(inCheckMatch, { x: 3, y: 3 }, { x: 3, y: 7 });
assert(capCheckRes.success === true, 'Capture move delivering check executed successfully');
const capCheckState = capCheckRes.state;
assert(capCheckState.inCheck === 'black', 'Black King is now authoritatively in check');
assert(capCheckState.lostExpensive.black === 2, 'Black lost expensive pieces counter reaches 2');
assert(capCheckState.craftingPending.black === true, 'Crafting is flagged pending for Black');
assert(capCheckState.craftingLocked?.black === true, 'Crafting is locked for Black because Black is in check');
assert(capCheckState.pausedForAction === null, 'No action pause: clocks run normally and board remains interactive');

// Black King legally captures the checking Queen from (4, 7) to (3, 7)
const escapeMoveRes = executeMove(capCheckState, { x: 4, y: 7 }, { x: 3, y: 7 });
if (!escapeMoveRes.success) {
  console.error('Escape move error:', escapeMoveRes.error);
}
assert(escapeMoveRes.success === true, 'Black King successfully makes legal move escaping check');
const postEscapeState = escapeMoveRes.state;
assert(postEscapeState.craftingLocked?.black === false, 'craftingLocked cleared after resolving check');
assert(postEscapeState.pausedForAction !== null, 'Game now pauses authoritatively for crafting');
assert(postEscapeState.pausedForAction?.type === 'crafting', 'Crafting prompt opens for Black');
assert(postEscapeState.pausedForAction?.player === 'black', 'Paused for Black player');

// --- TEST 10: Checkmate Precedence over Crafting ---
const mateMatch: MatchState = {
  ...inCheckMatch,
  id: 'test_mate_forfeits_craft',
  board: Array.from({ length: 8 }, () => Array(8).fill(null)),
};
// Cornered Black King at (0, 7)
mateMatch.board[7][0] = { id: 'bk', type: 'king', color: 'black', hasMoved: true };
mateMatch.board[0][7] = { id: 'wk', type: 'king', color: 'white', hasMoved: true };
mateMatch.board[7][1] = { id: 'br', type: 'rook', color: 'black', hasMoved: true }; // Expensive piece adjacent to King
mateMatch.board[5][1] = { id: 'wq', type: 'queen', color: 'white', hasMoved: true };
mateMatch.board[0][1] = { id: 'wr_supp', type: 'rook', color: 'white', hasMoved: true }; // Supporting column 1 defending Queen at (1, 7)
mateMatch.board[6][7] = { id: 'wr', type: 'rook', color: 'white', hasMoved: true }; // Guarding rank 6 so King cannot step to (0, 6)

// White Queen at (1, 5) moves to (1, 7) capturing Black Rook delivering back-rank checkmate
const mateRes = executeMove(mateMatch, { x: 1, y: 5 }, { x: 1, y: 7 });
if (!mateRes.success) {
  console.error('Mate move error:', mateRes.error);
}
assert(mateRes.success === true, 'White Queen captures Rook delivering checkmate');
assert(mateRes.state.status === 'completed', 'Match ends immediately with status completed');
assert(mateRes.state.result?.reason === 'checkmate', 'Result reason is checkmate');
assert(mateRes.state.pausedForAction === null, 'Crafting is forfeited upon checkmate');

console.log('=== ALL GODCHESS EXPANSION & CRAFTING TESTS PASSED! ===');

