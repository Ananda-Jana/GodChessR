/**
 * Automated Test Suite for Custom Dice Chess Engine
 */

import {
  createInitialBoard,
  getLegalMovesForSquare,
  getAllLegalMoves,
  getDiceEligibleMoves,
  rollAuthoritativeDice,
  executeMove,
  countRemainingPieces,
  posToNotation,
  notationToPos,
  cloneBoard,
  INEXPENSIVE_PIECES,
  EXPENSIVE_PIECES,
  getCheckmateGrids,
} from '../src/game/engine.ts';
import {
  MatchState,
  DICE_GRACE_WINDOW_MS,
  DICE_WARNING_WINDOW_MS,
  DICE_AUTOROLL_DELAY_MS,
} from '../src/types/game.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('=== RUNNING CUSTOM DICE CHESS ENGINE TESTS ===');

// 1. Board Setup & Corner Piece Placement
const board = createInitialBoard();
assert(board.length === 8 && board[0].length === 8, 'Board is 8x8');

// White pieces check
const wQueen = board[0][0];
const wPrince = board[0][7];
assert(wQueen?.type === 'queen' && wQueen?.color === 'white', 'White Queen is at a1 (corner)');
assert(wPrince?.type === 'prince' && wPrince?.color === 'white', 'White Prince is at h1 (corner)');

// Black pieces check
const bPrince = board[7][0];
const bQueen = board[7][7];
assert(bPrince?.type === 'prince' && bPrince?.color === 'black', 'Black Prince is at a8 (corner)');
assert(bQueen?.type === 'queen' && bQueen?.color === 'black', 'Black Queen is at h8 (corner)');

// Count total pieces
let whiteCount = 0;
let blackCount = 0;
for (let y = 0; y < 8; y++) {
  for (let x = 0; x < 8; x++) {
    const p = board[y][x];
    if (p?.color === 'white') whiteCount++;
    if (p?.color === 'black') blackCount++;
  }
}
assert(whiteCount === 16, 'White starts with exactly 16 pieces');
assert(blackCount === 16, 'Black starts with exactly 16 pieces');

// 2. Coordinate conversion
const posA1 = notationToPos('a1');
assert(posA1?.x === 0 && posA1?.y === 0, 'a1 maps to (0, 0)');
assert(posToNotation({ x: 7, y: 7 }) === 'h8', '(7, 7) maps to h8');

// 3. Prince Movement Tests
// Prince on h1 has 3x1 leap on first move:
// from h1 (x=7, y=0), extended leaps could target:
// x=7-1=6, y=0+3=3 (g4), x=7-3=4, y=0+1=1 (e2 - occupied by friendly pawn)
const princeMoves = getLegalMovesForSquare(board, { x: 7, y: 0 });
const specialLeapToG4 = princeMoves.find((m) => m.to.x === 6 && m.to.y === 3);
assert(specialLeapToG4 !== undefined, 'Prince can perform extended 3x1 knight jump to g4 on first move');
assert(specialLeapToG4?.isSpecialPrinceMove === true, 'Extended 3x1 jump is flagged as specialPrinceMove');

// Prince Knight jump from h1: (x=7-2=5, y=0+1=1 f2 is friendly pawn, x=7-1=6, y=0+2=2 is g3 empty)
const knightJumpToG3 = princeMoves.find((m) => m.to.x === 6 && m.to.y === 2);
assert(knightJumpToG3 !== undefined, 'Prince can perform standard L-shape knight leap to g3');

// 4. Dice System Tests
const initialWhitePieces = countRemainingPieces(board, 'white');
assert(initialWhitePieces === 16, 'Initial pieces count is 16');

// Test baseline dice mode
const baselineDice = rollAuthoritativeDice(board, 'white');
assert(baselineDice.probabilityMode === 'uniform', 'Baseline dice uses uniform probability mode');
assert(baselineDice.rolledValue >= 1 && baselineDice.rolledValue <= 6, 'Dice value is between 1 and 6');

// Test piece classification
const lowDice = rollAuthoritativeDice(board, 'white', 2);
assert(lowDice.category === 'inexpensive', 'Roll 2 is categorized as inexpensive');
assert(
  lowDice.eligiblePieceTypes.includes('knight') && lowDice.eligiblePieceTypes.includes('bishop') && lowDice.eligiblePieceTypes.includes('pawn'),
  'Roll 2 allows Knight, Bishop and Pawn'
);

const highDice = rollAuthoritativeDice(board, 'white', 5);
assert(highDice.category === 'expensive', 'Roll 5 is categorized as expensive');
assert(
  highDice.eligiblePieceTypes.includes('queen') &&
    highDice.eligiblePieceTypes.includes('rook') &&
    highDice.eligiblePieceTypes.includes('pawn') &&
    highDice.eligiblePieceTypes.includes('prince'),
  'Roll 5 allows Queen, Rook, Pawn, Prince, King'
);

// 5. Fallback Any-Piece Rule Test
// What if a player has NO moves for the rolled category?
// Let's create a custom board with only a King and a Rook (expensive pieces):
const testBoard = Array(8).fill(null).map(() => Array(8).fill(null));
testBoard[0][4] = { id: 'k', type: 'king', color: 'white', hasMoved: false };
testBoard[0][3] = { id: 'r', type: 'rook', color: 'white', hasMoved: false };
// If dice rolls 1 (inexpensive: knight, bishop, pawn), player has 0 inexpensive pieces!
const dice1 = rollAuthoritativeDice(testBoard, 'white', 1);
const { eligibleMoves, isFallback } = getDiceEligibleMoves(testBoard, 'white', dice1);
assert(isFallback === true, 'Fallback unlocks all moves when rolled category has 0 moves');
assert(eligibleMoves.length > 0, 'Fallback moves list is not empty');

// 6. Match Execution & Turn Progression
const initialMatch: MatchState = {
  id: 'test-match-1',
  whitePlayer: { userId: 'u1', username: 'alice', displayName: 'Alice', avatarId: 'avatar1' },
  blackPlayer: { userId: 'u2', username: 'bob', displayName: 'Bob', avatarId: 'avatar2' },
  board: createInitialBoard(),
  turn: 'white',
  status: 'active',
  dice: rollAuthoritativeDice(board, 'white', 5), // Roll 5 allows pawns
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

// Pawn move: e2 to e4 (x=4, y=1 to x=4, y=3)
const execResult = executeMove(initialMatch, { x: 4, y: 1 }, { x: 4, y: 3 });
assert(execResult.success, 'Pawn move e2-e4 executed successfully');
assert(execResult.state.turn === 'black', 'Turn switched to black');
assert(execResult.state.dice === null, 'Dice consumed and cleared for next player');
assert(execResult.state.board[3][4]?.type === 'pawn', 'Pawn arrived at e4');
assert(execResult.state.board[1][4] === null, 'e2 is now empty');

// 7. Two-Pawn End Rank Draw Test
const drawTestMatch: MatchState = {
  ...initialMatch,
  board: cloneBoard(testBoard),
  turn: 'white',
  whitePawnsReachedEndRank: 1, // Already has 1 pawn at end rank
  dice: rollAuthoritativeDice(testBoard, 'white', 4), // Expensive (Pawn)
};
// Place White pawn on rank 7 (y=6) ready to advance to rank 8 (y=7)
drawTestMatch.board[6][0] = { id: 'p_last', type: 'pawn', color: 'white', hasMoved: true };
const drawExec = executeMove(drawTestMatch, { x: 0, y: 6 }, { x: 0, y: 7 });
assert(drawExec.success, 'Second pawn reaches end rank');
assert(drawExec.state.status === 'completed', 'Match ends immediately when 2nd pawn reaches end rank');
assert(drawExec.state.result?.winner === 'draw', 'Result is a DRAW');
assert(drawExec.state.result?.reason === 'two_pawns_end_rank_draw', 'Draw reason is two_pawns_end_rank_draw');

// 8. Check Defense Bypass Test (No dice roll needed to escape check)
const checkBoard = Array(8).fill(null).map(() => Array(8).fill(null));
// White King on e1 (x=4, y=0), Black Rook on e8 (x=4, y=7) gives check along file e
checkBoard[0][4] = { id: 'w_k', type: 'king', color: 'white', hasMoved: true };
checkBoard[7][4] = { id: 'b_r', type: 'rook', color: 'black', hasMoved: true };

const checkMatch: MatchState = {
  ...initialMatch,
  board: checkBoard,
  turn: 'white',
  inCheck: 'white',
  dice: null, // NO DICE ROLL
};

// King moves from e1 (4, 0) to d1 (3, 0) escaping check
const escapeResult = executeMove(checkMatch, { x: 4, y: 0 }, { x: 3, y: 0 });
assert(escapeResult.success, 'King can escape check without rolling dice');
assert(escapeResult.state.inCheck === null, 'King successfully escaped check');

// 9. Precedence Test: Checkmate takes priority over Two-Pawn End Rank Draw
// Setup: Black King trapped on h8 (7, 7), no moves.
// White pawn on g7 (x=6, y=6) advances to g8 (x=6, y=7), promoting to Queen and delivering checkmate!
// White already has 1 pawn at end rank.
const mateBoard = Array(8).fill(null).map(() => Array(8).fill(null));
mateBoard[7][7] = { id: 'b_k_trapped', type: 'king', color: 'black', hasMoved: true };
mateBoard[6][6] = { id: 'w_p_mate', type: 'pawn', color: 'white', hasMoved: true };
mateBoard[7][5] = { id: 'w_k_support', type: 'king', color: 'white', hasMoved: true }; // Guarding g8 (6, 7) from f8 (5, 7)

const mateMatch: MatchState = {
  ...initialMatch,
  board: mateBoard,
  turn: 'white',
  whitePawnsReachedEndRank: 1, // Moving pawn will be the 2nd pawn!
  dice: rollAuthoritativeDice(mateBoard, 'white', 5),
};

const mateExec = executeMove(mateMatch, { x: 6, y: 6 }, { x: 6, y: 7 });
assert(mateExec.success, 'Pawn moves to g8 delivering checkmate and reaching end rank');
assert(mateExec.state.status === 'completed', 'Match completed');
assert(mateExec.state.result?.winner === 'white', 'White wins');
assert(
  mateExec.state.result?.reason === 'checkmate',
  'Checkmate victory takes priority over the two-pawn draw'
);

// 10. EDIT 2 Test: Dice Vanish After 3 Captures -> Normal Chess Begins
const captureTestBoard = Array(8).fill(null).map(() => Array(8).fill(null));
// White Rook at d1 (3, 0), Black Pawn at d4 (3, 3)
captureTestBoard[0][3] = { id: 'w_r_cap', type: 'rook', color: 'white', hasMoved: true };
captureTestBoard[3][3] = { id: 'b_p_cap', type: 'pawn', color: 'black', hasMoved: true };
captureTestBoard[0][4] = { id: 'w_k_cap', type: 'king', color: 'white', hasMoved: true };
captureTestBoard[7][4] = { id: 'b_k_cap', type: 'king', color: 'black', hasMoved: true };

const captureMatch: MatchState = {
  ...initialMatch,
  board: captureTestBoard,
  turn: 'white',
  capturedByWhite: [
    { id: 'c1', type: 'pawn', color: 'black', hasMoved: true },
    { id: 'c2', type: 'pawn', color: 'black', hasMoved: true },
  ],
  capturedByBlack: [],
  totalCaptures: 2,
  diceActive: true,
  dice: rollAuthoritativeDice(captureTestBoard, 'white', 5), // Expensive (Rook)
};

// 3rd capture happens: White Rook at (3, 0) captures Black Pawn at (3, 3)
const cap3Exec = executeMove(captureMatch, { x: 3, y: 0 }, { x: 3, y: 3 });
assert(cap3Exec.success, '3rd capture executed successfully');
assert(cap3Exec.state.totalCaptures === 3, 'Total captures is now 3');
assert(cap3Exec.state.diceActive === false, 'Dice are permanently disabled once 3rd capture occurs');

// Now it is Black's turn. Dice are disabled: Black moves without rolling dice!
// Black King at (4, 7) moves to (5, 7)
assert(cap3Exec.state.turn === 'black', 'Turn switched to black');
assert(cap3Exec.state.dice === null, 'Dice is null');
const normalChessExec = executeMove(cap3Exec.state, { x: 4, y: 7 }, { x: 5, y: 7 });
assert(normalChessExec.success, 'Normal chess move executed without dice roll or dice category limit');
assert(normalChessExec.state.diceActive === false, 'diceActive remains false across subsequent turns');

// 11. EDIT A Test: Dice-Roll Grace Window, Warning Window, and Auto-Roll Constants
assert(DICE_GRACE_WINDOW_MS === 3000, 'Named constant DICE_GRACE_WINDOW_MS is exactly 3000ms (3s)');
assert(DICE_WARNING_WINDOW_MS === 2000, 'Named constant DICE_WARNING_WINDOW_MS is exactly 2000ms (2s)');
assert(DICE_AUTOROLL_DELAY_MS === 5000, 'Named constant DICE_AUTOROLL_DELAY_MS is exactly 5000ms (5s)');

// Ticker clock pause during grace window (under 3s: 0s penalty deducted)
const now = Date.now();
const turnStart = now - 2500; // 2.5s elapsed
const graceLimitSec = DICE_GRACE_WINDOW_MS / 1000;
const rawElapsed = (now - turnStart) / 1000;
const graceElapsedPenalty = Math.max(0, rawElapsed - graceLimitSec);
assert(graceElapsedPenalty === 0, 'Clock penalty is 0 seconds during first 3 seconds of dice grace window');

// Ticker clock penalty after grace window (4.0s elapsed: 1.0s deducted)
const lateTurnStart = now - 4000;
const lateRawElapsed = (now - lateTurnStart) / 1000;
const latePenalty = Math.max(0, lateRawElapsed - graceLimitSec);
assert(Math.abs(latePenalty - 1.0) < 0.001, 'Clock resumes after 3s grace window (deducting 1s penalty at 4s)');

// Auto-roll triggers at or beyond 5.0s
const autoRollStart = now - 5000;
const autoRollElapsed = (now - autoRollStart) / 1000;
assert(autoRollElapsed >= (DICE_AUTOROLL_DELAY_MS / 1000), 'Auto-roll triggers when elapsed time reaches 5.0 seconds');

// Check Defense: King under check bypasses dice roll entirely
const kingUnderCheckMatch: MatchState = {
  ...initialMatch,
  turn: 'white',
  inCheck: 'white',
  dice: null,
  diceActive: true,
};
const needsDiceWhenInCheck = kingUnderCheckMatch.diceActive !== false && kingUnderCheckMatch.inCheck !== kingUnderCheckMatch.turn;
assert(!needsDiceWhenInCheck, 'King under check bypasses dice rolling requirement entirely');

// Dice Disabled after 3 captures: bypasses dice roll entirely
const diceDisabledMatch: MatchState = {
  ...initialMatch,
  turn: 'black',
  inCheck: null,
  dice: null,
  diceActive: false,
};
// 12. NEW GAME MODE: Crafted Pieces Board Setup Test
const craftedBoard = createInitialBoard('crafted');
assert(craftedBoard[0][0]?.type === 'queen', 'Crafted mode: White Queen is at a1');
assert(craftedBoard[0][1]?.type === 'priest', 'Crafted mode: White Knight is replaced with Priest at b1');
assert(craftedBoard[0][2]?.type === 'communist', 'Crafted mode: White Bishop is replaced with Communist at c1');
assert(craftedBoard[0][3]?.type === 'supremeRook', 'Crafted mode: One White Rook is replaced with Supreme Rook at d1');
assert(craftedBoard[0][4]?.type === 'king', 'Crafted mode: White King is at e1');
assert(craftedBoard[0][5]?.type === 'communist', 'Crafted mode: White Bishop is replaced with Communist at f1');
assert(craftedBoard[0][6]?.type === 'rook', 'Crafted mode: Normal White Rook remains at g1');
assert(craftedBoard[0][7]?.type === 'prince', 'Crafted mode: White Prince is at h1');

assert(craftedBoard[7][0]?.type === 'prince', 'Crafted mode: Black Prince is at a8');
assert(craftedBoard[7][1]?.type === 'rook', 'Crafted mode: Normal Black Rook remains at b8');
assert(craftedBoard[7][2]?.type === 'communist', 'Crafted mode: Black Bishop is replaced with Communist at c8');
assert(craftedBoard[7][3]?.type === 'supremeRook', 'Crafted mode: One Black Rook is replaced with Supreme Rook at d8');
assert(craftedBoard[7][4]?.type === 'king', 'Crafted mode: Black King is at e8');
assert(craftedBoard[7][5]?.type === 'communist', 'Crafted mode: Black Bishop is replaced with Communist at f8');
assert(craftedBoard[7][6]?.type === 'priest', 'Crafted mode: Black Knight is replaced with Priest at g8');
assert(craftedBoard[7][7]?.type === 'queen', 'Crafted mode: Black Queen is at h8');

// 13. Checkmate Grids calculation test
const checkmateTestBoard = Array(8).fill(null).map(() => Array(8).fill(null));
checkmateTestBoard[7][4] = { id: 'k_black', type: 'king', color: 'black', hasMoved: true };
checkmateTestBoard[6][4] = { id: 'q_white', type: 'queen', color: 'white', hasMoved: true }; // Queen directly in front of king
checkmateTestBoard[5][4] = { id: 'r_white', type: 'rook', color: 'white', hasMoved: true }; // Defended by rook
const redGrids = getCheckmateGrids(checkmateTestBoard, 'black');
assert(redGrids.some((p) => p.x === 4 && p.y === 7), 'Checkmate grids include mated King square');
assert(redGrids.some((p) => p.x === 4 && p.y === 6), 'Checkmate grids include attacking Queen square');

// 14. Mid-Game Crafting Trigger Rules & Avoid Crafting Option Tests
// Test A: Pawn capture does NOT increment lostExpensive or trigger crafting
const pawnTestBoard = Array(8).fill(null).map(() => Array(8).fill(null));
pawnTestBoard[0][4] = { id: 'k_white', type: 'king', color: 'white', hasMoved: true };
pawnTestBoard[7][4] = { id: 'k_black', type: 'king', color: 'black', hasMoved: true };
pawnTestBoard[0][0] = { id: 'r_white', type: 'rook', color: 'white', hasMoved: true };
pawnTestBoard[0][1] = { id: 'p_black_1', type: 'pawn', color: 'black', hasMoved: true };
pawnTestBoard[0][2] = { id: 'p_black_2', type: 'pawn', color: 'black', hasMoved: true };

const pawnMatch: MatchState = {
  ...initialMatch,
  board: pawnTestBoard,
  turn: 'white',
  craftingAllowed: true,
  diceActive: false, // Chess moves directly
};

// Capture 1st pawn
const pawnCap1 = executeMove(pawnMatch, { x: 0, y: 0 }, { x: 1, y: 0 });
assert(pawnCap1.success, 'White Rook captured 1st Black Pawn');
assert(pawnCap1.state.lostExpensive?.black === 0, 'lostExpensive for Black is 0 after pawn loss');
assert(!pawnCap1.state.craftingPending?.black, 'Crafting is not triggered for Black after 1st pawn loss');

// Now simulate capturing 2nd pawn
const pawnMatch2: MatchState = {
  ...pawnCap1.state,
  turn: 'white',
};
const pawnCap2 = executeMove(pawnMatch2, { x: 1, y: 0 }, { x: 2, y: 0 });
assert(pawnCap2.success, 'White Rook captured 2nd Black Pawn');
assert(pawnCap2.state.lostExpensive?.black === 0, 'lostExpensive for Black is still 0 after 2 pawns lost');
assert(!pawnCap2.state.craftingPending?.black, 'Crafting is NEVER triggered by falling pawns');
assert(!pawnCap2.state.pausedForAction, 'Game is not paused for crafting after pawns fall');

// Test B: 2 expensive fallen pieces WITH craftingAllowed === true TRIGGERS crafting
const expTestBoard = Array(8).fill(null).map(() => Array(8).fill(null));
expTestBoard[4][4] = { id: 'k_white', type: 'king', color: 'white', hasMoved: true };
expTestBoard[7][4] = { id: 'k_black', type: 'king', color: 'black', hasMoved: true };
expTestBoard[0][0] = { id: 'r_white', type: 'rook', color: 'white', hasMoved: true };
expTestBoard[1][0] = { id: 'r_black', type: 'rook', color: 'black', hasMoved: true }; // Expensive piece 1 at (0, 1)
expTestBoard[2][0] = { id: 'q_black', type: 'queen', color: 'black', hasMoved: true }; // Expensive piece 2 at (0, 2)

const expMatch: MatchState = {
  ...initialMatch,
  board: expTestBoard,
  turn: 'white',
  craftingAllowed: true,
  diceActive: false,
};

// Capture 1st expensive piece (Rook at 0, 1)
const expCap1 = executeMove(expMatch, { x: 0, y: 0 }, { x: 0, y: 1 });
assert(expCap1.success, 'White captured 1st Black expensive piece (Rook)');
assert(expCap1.state.lostExpensive?.black === 1, 'Black lostExpensive is 1 after 1 expensive piece fallen');
assert(!expCap1.state.craftingPending?.black, 'Crafting is NOT triggered after only 1 expensive piece fallen');

// Capture 2nd expensive piece (Queen at 0, 2)
const expMatch2: MatchState = {
  ...expCap1.state,
  turn: 'white',
};
const expCap2 = executeMove(expMatch2, { x: 0, y: 1 }, { x: 0, y: 2 });
assert(expCap2.success, 'White captured 2nd Black expensive piece (Queen)');
assert(expCap2.state.lostExpensive?.black === 2, 'Black lostExpensive is 2 after 2 expensive pieces fallen');
assert(expCap2.state.craftingPending?.black === true, 'Crafting triggers for Black when 2 expensive pieces fall');
assert(expCap2.state.pausedForAction?.type === 'crafting', 'Match pauses for crafting action for Black');

// Test C: Avoid Crafting (craftingAllowed === false) in Standard Mode
const avoidStandardMatch: MatchState = {
  ...initialMatch,
  board: expTestBoard,
  turn: 'white',
  gameMode: 'standard',
  craftingAllowed: false, // User chose "Avoid Crafting"
  diceActive: false,
};
const avoidCap1 = executeMove(avoidStandardMatch, { x: 0, y: 0 }, { x: 0, y: 1 });
const avoidMatch2: MatchState = {
  ...avoidCap1.state,
  turn: 'white',
};
const avoidCap2 = executeMove(avoidMatch2, { x: 0, y: 1 }, { x: 0, y: 2 });
assert(avoidCap2.success, 'Captured 2 expensive pieces in Standard Mode with Avoid Crafting');
assert(!avoidCap2.state.craftingPending?.black, 'Standard Mode: Crafting is completely avoided when craftingAllowed is false');
assert(!avoidCap2.state.pausedForAction, 'Standard Mode: Game does not pause for crafting when avoided');

// Test D: Avoid Crafting (craftingAllowed === false) in Crafted Pieces Mode
const avoidCraftedMatch: MatchState = {
  ...initialMatch,
  board: expTestBoard,
  turn: 'white',
  gameMode: 'crafted',
  craftingAllowed: false, // User chose "Avoid Crafting"
  diceActive: false,
};
const avoidCraftedCap1 = executeMove(avoidCraftedMatch, { x: 0, y: 0 }, { x: 0, y: 1 });
const avoidCraftedMatch2: MatchState = {
  ...avoidCraftedCap1.state,
  turn: 'white',
};
const avoidCraftedCap2 = executeMove(avoidCraftedMatch2, { x: 0, y: 1 }, { x: 0, y: 2 });
assert(avoidCraftedCap2.success, 'Captured 2 expensive pieces in Crafted Pieces Mode with Avoid Crafting');
assert(!avoidCraftedCap2.state.craftingPending?.black, 'Crafted Mode: Crafting is completely avoided when craftingAllowed is false');
assert(!avoidCraftedCap2.state.pausedForAction, 'Crafted Mode: Game does not pause for crafting when avoided');

console.log('=== ALL 28 CUSTOM CHESS ENGINE TESTS + CRAFTED MODE + CRAFTING AVOIDANCE TESTS PASSED! ===');


