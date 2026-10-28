import type {
  CullingPos,
  CullingPieceColor,
  CullingPieceType,
  CullingBoard,
  CullingMove,
  CullingMatchState,
  CullingBoardSize,
} from '../types/cullingGame.ts';
import {
  isValidCullingPos,
} from '../types/cullingGame.ts';
import {
  getAllLegalMoves,
  applyCullingMoveToBoard,
  isCullingKingInCheck,
} from './cullingEngine.ts';

export const CULLING_PIECE_VALUES: Record<CullingPieceType, number> = {
  culling_gojo: 20000,
  culling_sukuna: 20000,
  culling_yuji: 800,
  culling_kenjaku: 800,
  culling_nanami: 450,
  culling_reggie: 450,
  culling_mechamaru: 400,
  culling_uraume: 400,
  culling_panda: 350,
  culling_yorozu: 350,
  culling_maki: 350,
  culling_naoya: 350,
  culling_hakari: 350,
  culling_kurourushi: 350,
  culling_pawn: 100,
  culling_swarm: 50,
};

// 7x7 Board Positional Table (White perspective: y=0 bottom rank, y=6 top rank)
const CENTER_CONTROL_TABLE_7X7: number[][] = [
  // y=0: Rank 1 (A1..G1)
  [ 0, -5,  0,  5,  0, -5,  0],
  // y=1: Rank 2 (A2..G2)
  [ 5,  5, 10, 15, 10,  5,  5],
  // y=2: Rank 3
  [ 5, 10, 20, 25, 20, 10,  5],
  // y=3: Rank 4 (Center clash)
  [10, 20, 30, 40, 30, 20, 10],
  // y=4: Rank 5
  [ 5, 10, 20, 25, 20, 10,  5],
  // y=5: Rank 6
  [ 5,  5, 10, 15, 10,  5,  5],
  // y=6: Rank 7 (A7..G7)
  [ 0, -5,  0,  5,  0, -5,  0],
];

// 8x8 Board Positional Table (White perspective: y=0 bottom rank, y=7 top rank)
const CENTER_CONTROL_TABLE_8X8: number[][] = [
  [ 0, -5,  0,  5,  5,  0, -5,  0],
  [ 5,  5, 10, 15, 15, 10,  5,  5],
  [ 5, 10, 20, 25, 25, 20, 10,  5],
  [10, 20, 35, 40, 40, 35, 20, 10],
  [10, 20, 35, 40, 40, 35, 20, 10],
  [ 5, 10, 20, 25, 25, 20, 10,  5],
  [ 5,  5, 10, 15, 15, 10,  5,  5],
  [ 0, -5,  0,  5,  5,  0, -5,  0],
];

/**
 * Static evaluation of a Culling Board state
 * Positive values favor White, negative values favor Black
 */
export function evaluateCullingBoard(board: CullingBoard, turnCount: number, boardSize?: CullingBoardSize): number {
  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whitePositional = 0;
  let blackPositional = 0;

  const is8x8 = boardSize === '8x8' || board.length === 8;
  const dim = is8x8 ? 8 : 7;
  const table = is8x8 ? CENTER_CONTROL_TABLE_8X8 : CENTER_CONTROL_TABLE_7X7;
  const maxIdx = dim - 1;

  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const piece = board[y][x];
      if (!piece) continue;

      const baseVal = CULLING_PIECE_VALUES[piece.type] || 100;
      const posVal = table[y][x] || 0;

      // Special state adjustments
      let bonus = 0;
      if (piece.pandaCore === 'panda') bonus += 50; // Bulwark Shell intact
      if (!piece.specialUsed) bonus += 40; // Sovereign Domain Step available

      // Pawn advancement bonus
      if (piece.type === 'culling_pawn') {
        const advancement = piece.color === 'white' ? (y - 1) * 15 : (maxIdx - 1 - y) * 15;
        bonus += advancement;
      }

      if (piece.color === 'white') {
        whiteMaterial += baseVal + bonus;
        whitePositional += posVal;
      } else {
        blackMaterial += baseVal + bonus;
        blackPositional += table[maxIdx - y][x] || 0;
      }
    }
  }

  // King check penalties
  let checkScore = 0;
  if (isCullingKingInCheck(board, 'white', turnCount)) checkScore -= 200;
  if (isCullingKingInCheck(board, 'black', turnCount)) checkScore += 200;

  return (whiteMaterial - blackMaterial) + (whitePositional - blackPositional) + checkScore;
}

/**
 * Move ordering comparator: evaluates tactical captures and checks first
 */
function compareMovesForOrdering(a: CullingMove, b: CullingMove): number {
  let scoreA = 0;
  let scoreB = 0;

  if (a.captured) {
    scoreA += (CULLING_PIECE_VALUES[a.captured.type] || 100) * 10 - (CULLING_PIECE_VALUES[a.piece.type] || 100);
  }
  if (b.captured) {
    scoreB += (CULLING_PIECE_VALUES[b.captured.type] || 100) * 10 - (CULLING_PIECE_VALUES[b.piece.type] || 100);
  }

  if (a.actionType === 'shoot' || a.actionType === 'pierce_shoot') scoreA += 500;
  if (b.actionType === 'shoot' || b.actionType === 'pierce_shoot') scoreB += 500;

  if (a.isPromotion) scoreA += 800;
  if (b.isPromotion) scoreB += 800;

  return scoreB - scoreA;
}

// Transposition Table for Minimax caching
const transpositionTable = new Map<string, { score: number; depth: number }>();
const MAX_TT_SIZE = 40000;

function computeBoardKey(board: CullingBoard, turn: CullingPieceColor, boardSize?: CullingBoardSize): string {
  let s = turn[0];
  const dim = boardSize === '8x8' || board.length === 8 ? 8 : 7;
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const p = board[y][x];
      if (p) s += `${x}${y}${p.type[8] || p.type[0]}${p.color[0]}`;
    }
  }
  return s;
}

/**
 * Minimax with Alpha-Beta pruning and Transposition Table lookup
 */
function minimax(
  match: CullingMatchState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  boardSize?: CullingBoardSize
): { score: number; bestMove: CullingMove | null } {
  const size = boardSize || match.boardSize || (match.board.length === 8 ? '8x8' : '7x7');
  if (depth === 0 || match.status === 'completed') {
    return { score: evaluateCullingBoard(match.board, match.turnCount, size), bestMove: null };
  }

  const key = computeBoardKey(match.board, match.turn, size);
  const cached = transpositionTable.get(key);
  if (cached && cached.depth >= depth) {
    return { score: cached.score, bestMove: null };
  }

  const legalMoves = getAllLegalMoves(match);
  if (legalMoves.length === 0) {
    // Current player has no legal moves (loss)
    const lossScore = isMaximizing ? -50000 : 50000;
    return { score: lossScore, bestMove: null };
  }

  // Tactical move ordering
  legalMoves.sort(compareMovesForOrdering);

  let bestMove: CullingMove | null = legalMoves[0];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const { board: nextBoard } = applyCullingMoveToBoard(match.board, move, match.turnCount);
      const nextMatch: CullingMatchState = {
        ...match,
        board: nextBoard,
        boardSize: size,
        turn: 'black',
        turnCount: match.turnCount + 1,
      };

      const { score } = minimax(nextMatch, depth - 1, alpha, beta, false, size);
      if (score > maxEval) {
        maxEval = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Pruning
    }
    if (transpositionTable.size < MAX_TT_SIZE) {
      transpositionTable.set(key, { score: maxEval, depth });
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const { board: nextBoard } = applyCullingMoveToBoard(match.board, move, match.turnCount);
      const nextMatch: CullingMatchState = {
        ...match,
        board: nextBoard,
        boardSize: size,
        turn: 'white',
        turnCount: match.turnCount + 1,
      };

      const { score } = minimax(nextMatch, depth - 1, alpha, beta, true, size);
      if (score < minEval) {
        minEval = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Pruning
    }
    if (transpositionTable.size < MAX_TT_SIZE) {
      transpositionTable.set(key, { score: minEval, depth });
    }
    return { score: minEval, bestMove };
  }
}

/**
 * Computes the optimal move for the bot
 */
export function getBestCullingBotMove(
  match: CullingMatchState,
  botColor: CullingPieceColor,
  depth: number = 2,
  size?: CullingBoardSize
): CullingMove | null {
  transpositionTable.clear();
  const boardSize = size || match.boardSize || (match.board.length === 8 ? '8x8' : '7x7');
  const isMaximizing = botColor === 'white';
  const { bestMove } = minimax(match, depth, -Infinity, Infinity, isMaximizing, boardSize);
  return bestMove;
}
