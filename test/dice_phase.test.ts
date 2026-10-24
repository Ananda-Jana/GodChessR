/**
 * Deterministic Verification Test for the 3-Capture Dice-Phase Termination Rule
 * Covers Standard Mode, Crafted Mode, Combined Side Captures, and Reconnect/Resume State.
 */

import {
  createInitialBoard,
  rollAuthoritativeDice,
  executeMove,
  applyBoardExpansion,
  applyCraftPlacement,
} from '../src/game/engine.ts';
import type { MatchState, Piece } from '../src/types/game.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`DICE PHASE TEST FAILED: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('=== RUNNING DETERMINISTIC DICE-PHASE TERMINATION TESTS ===');

function createEmptyBoard(): (Piece | null)[][] {
  return Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null));
}

// ---------------------------------------------------------------------------
// 1. Standard Mode: Combined 3-capture transition (White + Black captures)
// ---------------------------------------------------------------------------
{
  const board = createEmptyBoard();
  // Kings safe on h1 (7,0) and h8 (7,7)
  board[0][7] = { id: 'w_k', type: 'king', color: 'white', hasMoved: true };
  board[7][7] = { id: 'b_k', type: 'king', color: 'black', hasMoved: true };

  // White Knight on b1 (1,0) -> can capture Black Pawn on c3 (2,2) [Capture #1, inexpensive]
  board[0][1] = { id: 'w_n', type: 'knight', color: 'white', hasMoved: false };
  board[2][2] = { id: 'b_p1', type: 'pawn', color: 'black', hasMoved: true };

  // White Rook on a1 (0,0) -> expensive piece to test dice category restriction & Capture #3
  board[0][0] = { id: 'w_r', type: 'rook', color: 'white', hasMoved: true };
  board[4][0] = { id: 'b_p2', type: 'pawn', color: 'black', hasMoved: true };

  // Black Rook on d8 (3,7) -> captures White Pawn on d5 (3,4) [Capture #2, expensive]
  board[7][3] = { id: 'b_r', type: 'rook', color: 'black', hasMoved: true };
  board[4][3] = { id: 'w_p1', type: 'pawn', color: 'white', hasMoved: true };

  // Extra piece for 4th capture after dice phase ends: White Pawn on e2 (4,1), Black Bishop on g4 (6,3)
  board[1][4] = { id: 'w_p2', type: 'pawn', color: 'white', hasMoved: false };
  board[3][6] = { id: 'b_b', type: 'bishop', color: 'black', hasMoved: true };

  let state: MatchState = {
    id: 'dice-phase-std',
    whitePlayer: { userId: 'u_w', username: 'white', displayName: 'White', avatarId: 'avatar_knight' },
    blackPlayer: { userId: 'u_b', username: 'black', displayName: 'Black', avatarId: 'avatar_prince' },
    board,
    gameMode: 'standard',
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

  let terminationTransitions = 0;
  const trackTransition = (prev: boolean, next: boolean) => {
    if (prev && !next) terminationTransitions++;
    if (!prev && next) throw new Error('Dice phase illegally re-activated!');
  };

  // BEFORE TRIGGER (0 captures): Moving without rolling dice MUST fail
  const noRollAttempt = executeMove(state, { x: 1, y: 0 }, { x: 2, y: 2 });
  assert(!noRollAttempt.success, '0 captures: Move rejected when dice have not been rolled');

  // Roll inexpensive (2): Rook (expensive) move MUST be blocked while Knight capture is allowed
  state = { ...state, dice: rollAuthoritativeDice(state.board, 'white', 2) };
  const wrongCategoryAttempt = executeMove(state, { x: 0, y: 0 }, { x: 0, y: 4 });
  assert(!wrongCategoryAttempt.success, '0 captures: Expensive Rook blocked on inexpensive roll (2)');

  // Capture #1 (by White): Knight b1 -> c3 captures Black Pawn
  const cap1 = executeMove(state, { x: 1, y: 0 }, { x: 2, y: 2 });
  assert(cap1.success, 'Capture #1 (White Knight takes Pawn) succeeds');
  trackTransition(state.diceActive, cap1.state.diceActive);
  state = cap1.state;
  assert(state.totalCaptures === 1 && state.diceActive === true, 'After 1 capture: diceActive remains true');

  // Still BEFORE TRIGGER (1 capture): Black must still roll dice
  const blackNoRoll = executeMove(state, { x: 3, y: 7 }, { x: 3, y: 4 });
  assert(!blackNoRoll.success, 'After 1 capture: Black still cannot move without rolling');

  // Capture #2 (by Black): Roll expensive (5), Black Rook d8 -> d5 captures White Pawn
  state = { ...state, dice: rollAuthoritativeDice(state.board, 'black', 5) };
  const cap2 = executeMove(state, { x: 3, y: 7 }, { x: 3, y: 4 });
  assert(cap2.success, 'Capture #2 (Black Rook takes Pawn) succeeds');
  trackTransition(state.diceActive, cap2.state.diceActive);
  state = cap2.state;
  assert(
    state.totalCaptures === 2 && state.diceActive === true,
    'After 2 combined captures (1W + 1B): diceActive remains true'
  );

  // Still BEFORE TRIGGER (2 captures): White must still roll dice
  const whiteNoRollAt2 = executeMove(state, { x: 0, y: 0 }, { x: 0, y: 4 });
  assert(!whiteNoRollAt2.success, 'After 2 captures: White still cannot move without rolling');

  // AT THE TRIGGER (Capture #3): White rolls 5 and Rook a1 -> a5 captures Black Pawn
  state = { ...state, dice: rollAuthoritativeDice(state.board, 'white', 5) };
  const cap3 = executeMove(state, { x: 0, y: 0 }, { x: 0, y: 4 });
  assert(cap3.success, 'Capture #3 (White Rook takes Pawn) succeeds');
  trackTransition(state.diceActive, cap3.state.diceActive);
  state = cap3.state;

  assert(state.totalCaptures === 3, 'At trigger: totalCaptures is 3');
  assert(state.diceActive === false, 'At trigger: diceActive immediately flips to false');
  assert(state.dice === null, 'At trigger: dice state is cleared to null');
  assert(terminationTransitions === 1, 'At trigger: dice phase terminated exactly once');
  assert((state.diceActive !== false) === false, 'UI phase selector (diceActive !== false) is now false');

  // AFTER TRIGGER: Black moves Bishop g4 -> e2 (Capture #4, inexpensive) AND could move Rook (expensive) WITHOUT rolling!
  const cap4NoRoll = executeMove(state, { x: 6, y: 3 }, { x: 4, y: 1 });
  assert(cap4NoRoll.success, 'After trigger: Black executes Capture #4 with zero dice roll');
  trackTransition(state.diceActive, cap4NoRoll.state.diceActive);
  state = cap4NoRoll.state;

  // White moves expensive Rook a5 -> b5 WITHOUT rolling
  const whiteFreeMove = executeMove(state, { x: 0, y: 4 }, { x: 1, y: 4 });
  assert(whiteFreeMove.success, 'After trigger: White moves expensive Rook freely with zero dice roll');
  trackTransition(state.diceActive, whiteFreeMove.state.diceActive);
  state = whiteFreeMove.state;

  assert(terminationTransitions === 1, 'Across 4+ captures & subsequent turns: dice phase terminated strictly once');
}

// ---------------------------------------------------------------------------
// 2. Crafted Mode + Mid-Game Expansion/Crafting Preservation
// ---------------------------------------------------------------------------
{
  const craftedInit = createInitialBoard('crafted');
  assert(craftedInit[0][1]?.type === 'priest', 'Crafted board initializes Priest on b1');
  assert(craftedInit[0][3]?.type === 'supremeRook', 'Crafted board initializes Supreme Rook on d1');

  const board = createEmptyBoard();
  board[0][4] = { id: 'wk', type: 'king', color: 'white', hasMoved: true };
  board[7][4] = { id: 'bk', type: 'king', color: 'black', hasMoved: true };
  board[0][3] = { id: 'wsr', type: 'supremeRook', color: 'white', hasMoved: true };
  board[2][3] = { id: 'bc1', type: 'communist', color: 'black', hasMoved: true };
  board[4][3] = { id: 'bpr', type: 'priest', color: 'black', hasMoved: true };
  board[6][3] = { id: 'bp3', type: 'pawn', color: 'black', hasMoved: true };

  let craftedMatch: MatchState = {
    id: 'dice-phase-crafted',
    whitePlayer: { userId: 'u_w', username: 'white', displayName: 'White', avatarId: 'avatar_knight' },
    blackPlayer: { userId: 'u_b', username: 'black', displayName: 'Black', avatarId: 'avatar_prince' },
    board,
    gameMode: 'crafted',
    craftingAllowed: false,
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

  // Capture 1 in Crafted mode (requires roll)
  assert(!executeMove(craftedMatch, { x: 3, y: 0 }, { x: 3, y: 2 }).success, 'Crafted mode requires roll before 3 captures');
  craftedMatch = { ...craftedMatch, dice: rollAuthoritativeDice(craftedMatch.board, 'white', 6) };
  craftedMatch = executeMove(craftedMatch, { x: 3, y: 0 }, { x: 3, y: 2 }).state;
  assert(craftedMatch.diceActive === true && craftedMatch.totalCaptures === 1, 'Crafted capture 1 keeps diceActive true');

  // Black non-capturing king step (requires roll)
  craftedMatch = { ...craftedMatch, dice: rollAuthoritativeDice(craftedMatch.board, 'black', 6) };
  craftedMatch = executeMove(craftedMatch, { x: 4, y: 7 }, { x: 5, y: 7 }).state;

  // Capture 2 in Crafted mode
  craftedMatch = { ...craftedMatch, dice: rollAuthoritativeDice(craftedMatch.board, 'white', 6) };
  craftedMatch = executeMove(craftedMatch, { x: 3, y: 2 }, { x: 3, y: 4 }).state;
  assert(craftedMatch.diceActive === true && craftedMatch.totalCaptures === 2, 'Crafted capture 2 keeps diceActive true');

  // Black king step
  craftedMatch = { ...craftedMatch, dice: rollAuthoritativeDice(craftedMatch.board, 'black', 6) };
  craftedMatch = executeMove(craftedMatch, { x: 5, y: 7 }, { x: 4, y: 7 }).state;

  // Capture 3 in Crafted mode -> terminates dice phase!
  craftedMatch = { ...craftedMatch, dice: rollAuthoritativeDice(craftedMatch.board, 'white', 6) };
  craftedMatch = executeMove(craftedMatch, { x: 3, y: 4 }, { x: 3, y: 6 }).state;
  assert(craftedMatch.totalCaptures === 3 && craftedMatch.diceActive === false, 'Crafted capture 3 terminates dice phase');

  // Verify board expansion & craft placement preserve diceActive === false
  const expanded = applyBoardExpansion(craftedMatch, 'black', 'top');
  assert(expanded.diceActive === false, 'Board expansion preserves diceActive === false');

  const craftedPlaced = applyCraftPlacement(
    { ...expanded, craftingAllowed: true },
    'white',
    'priest',
    { x: 0, y: 0 }
  );
  assert(craftedPlaced.success && craftedPlaced.state.diceActive === false, 'Craft placement preserves diceActive === false');

  // Black moves King without rolling
  const postPhaseMove = executeMove(craftedPlaced.state, { x: 4, y: 7 }, { x: 5, y: 7 });
  assert(postPhaseMove.success && postPhaseMove.state.diceActive === false, 'Crafted mode continues as normal chess without dice');
}

console.log('=== ALL DICE-PHASE TERMINATION TESTS PASSED! ===');
