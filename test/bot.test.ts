/**
 * Unit Test for Grandmaster Chess Bot Engine
 */

import { createInitialBoard, rollAuthoritativeDice, executeMove, handleTimeout, cancelCrafting } from '../src/game/engine.ts';
import { evaluateBoard, getBestBotMove } from '../src/game/bot.ts';
import { MatchState } from '../src/types/game.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`BOT TEST FAILED: ${msg}`);
  console.log(`✓ ${msg}`);
}

console.log('=== RUNNING GRANDMASTER BOT TESTS ===');

const board = createInitialBoard();

// 1. Initial board symmetry evaluation
const initialScore = evaluateBoard(board, 0, 0);
assert(Math.abs(initialScore) <= 20, `Initial board evaluation is balanced (score: ${initialScore})`);

// 2. Bot selects a valid move from initial position with Dice roll 5 (Pawns / Expensive pieces)
const matchState: MatchState = {
  id: 'test_bot_match',
  whitePlayer: { userId: 'bot', username: 'gm_bot', displayName: 'GM Bot', avatarId: 'avatar_prince' },
  blackPlayer: { userId: 'human', username: 'player', displayName: 'Player', avatarId: 'avatar_knight' },
  board: createInitialBoard(),
  turn: 'white',
  status: 'active',
  dice: rollAuthoritativeDice(board, 'white', 5),
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

const bestMove = getBestBotMove(matchState, 'white', 3);
assert(bestMove !== null, 'Bot successfully computed a best move for roll 5');
assert(bestMove?.from !== undefined && bestMove?.to !== undefined, 'Computed move has valid coordinates');

// Execute the bot move
const exec = executeMove(matchState, bestMove!.from, bestMove!.to);
assert(exec.success, 'Bot move successfully passes authoritative rules engine');

// 3. Tactical Capture Test: place free undefended Queen in front of White Knight
const tacticalBoard = createInitialBoard();
// White Knight on b1 (x=1, y=0), place Black Queen on c3 (x=2, y=2)
tacticalBoard[2][2] = { id: 'b_q_trap', type: 'queen', color: 'black', hasMoved: true };
const tacticalMatch: MatchState = {
  ...matchState,
  board: tacticalBoard,
  turn: 'white',
  dice: rollAuthoritativeDice(tacticalBoard, 'white', 1), // Roll 1 allows Knight
};

const captureMove = getBestBotMove(tacticalMatch, 'white', 3);
assert(captureMove !== null, 'Bot computes move for tactical scenario');
assert(
  captureMove?.to.x === 2 && captureMove?.to.y === 2,
  'Bot tactically prioritizes capturing the free Black Queen on c3'
);

// 4. Bot Match Timeout Tests with custom >= 3 piece advantage rule
// (Remember that greater than or equal to three means but two is not)
const emptyBoard = () => Array(8).fill(null).map(() => Array(8).fill(null));

// Case A: Human (White) has 6 pieces, Bot (Black) has 3 pieces (Lead = 3, >= 3)
const botTestBoardA = emptyBoard();
botTestBoardA[0][0] = { id: 'w1', type: 'king', color: 'white', hasMoved: false };
botTestBoardA[0][1] = { id: 'w2', type: 'rook', color: 'white', hasMoved: false };
botTestBoardA[0][2] = { id: 'w3', type: 'bishop', color: 'white', hasMoved: false };
botTestBoardA[0][3] = { id: 'w4', type: 'pawn', color: 'white', hasMoved: false };
botTestBoardA[0][4] = { id: 'w5', type: 'pawn', color: 'white', hasMoved: false };
botTestBoardA[0][5] = { id: 'w6', type: 'pawn', color: 'white', hasMoved: false };
botTestBoardA[7][0] = { id: 'b1', type: 'king', color: 'black', hasMoved: false };
botTestBoardA[7][1] = { id: 'b2', type: 'rook', color: 'black', hasMoved: false };
botTestBoardA[7][2] = { id: 'b3', type: 'pawn', color: 'black', hasMoved: false };

const matchBotA: MatchState = {
  ...matchState,
  whitePlayer: { userId: 'usr_human', username: 'human', displayName: 'Human', avatarId: 'avatar_prince' },
  blackPlayer: { userId: 'usr_bot_gm', username: 'grandmaster_bot', displayName: 'Grandmaster Bot', avatarId: 'bot' },
  board: botTestBoardA,
  turn: 'white',
};

const resA = handleTimeout(matchBotA, 'white', true);
assert(resA.result?.winner === 'white', 'Bot match: Human with 3-piece lead (6 vs 3) wins on timeout');
assert(resA.result?.reason === 'timeout_piece_advantage', 'Reason is timeout_piece_advantage');

// Case B: Human (White) has 5 pieces, Bot (Black) has 3 pieces (Lead = 2 -> 2 is NOT enough!)
const botTestBoardB = emptyBoard();
botTestBoardB[0][0] = { id: 'w1', type: 'king', color: 'white', hasMoved: false };
botTestBoardB[0][1] = { id: 'w2', type: 'rook', color: 'white', hasMoved: false };
botTestBoardB[0][2] = { id: 'w3', type: 'bishop', color: 'white', hasMoved: false };
botTestBoardB[0][3] = { id: 'w4', type: 'pawn', color: 'white', hasMoved: false };
botTestBoardB[0][4] = { id: 'w5', type: 'pawn', color: 'white', hasMoved: false };
botTestBoardB[7][0] = { id: 'b1', type: 'king', color: 'black', hasMoved: false };
botTestBoardB[7][1] = { id: 'b2', type: 'rook', color: 'black', hasMoved: false };
botTestBoardB[7][2] = { id: 'b3', type: 'pawn', color: 'black', hasMoved: false };

const matchBotB: MatchState = {
  ...matchState,
  whitePlayer: { userId: 'usr_human', username: 'human', displayName: 'Human', avatarId: 'avatar_prince' },
  blackPlayer: { userId: 'usr_bot_gm', username: 'grandmaster_bot', displayName: 'Grandmaster Bot', avatarId: 'bot' },
  board: botTestBoardB,
  turn: 'white',
};

const resB = handleTimeout(matchBotB, 'white', true);
assert(resB.result?.winner === 'black', 'Bot match: Human with only 2-piece lead (5 vs 3) loses on timeout (2 is not)');
assert(resB.result?.reason === 'timeout', 'Reason is standard timeout');

// Case C: Bot timer expires -> Human automatically wins
const resC = handleTimeout(matchBotB, 'black', true);
assert(resC.result?.winner === 'white', 'Bot match: Bot timer expired -> Human wins');
assert(resC.result?.reason === 'timeout', 'Reason is timeout');

// Case D: Multiplayer match (not bot) retains > 7 rule
const resD = handleTimeout(matchBotB, 'white', false);
assert(resD.result?.winner === 'black', 'Multiplayer match: 2-piece diff (<= 7) loses on timeout');

// 5. Crafting Cancel Test
const craftingPausedMatch: MatchState = {
  ...matchState,
  pausedForAction: {
    type: 'crafting',
    player: 'white',
    expiresAt: Date.now() + 15000,
  },
  craftingPending: { white: true, black: false },
  craftingLocked: { white: false, black: false },
  craftingUsed: { white: false, black: false },
};

const cancelledState = cancelCrafting(craftingPausedMatch, 'white');
assert(cancelledState.pausedForAction === null, 'Crafting cancel clears pausedForAction');
assert(cancelledState.craftingUsed?.white === true, 'Crafting cancel marks craftingUsed true');
assert(cancelledState.craftingPending?.white === false, 'Crafting cancel clears craftingPending');
assert(cancelledState.whiteTimeRemaining === 300, 'Crafting cancel preserves player remaining time');

console.log('=== ALL BOT TESTS PASSED! ===');
