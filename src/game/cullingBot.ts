/**
 * Jujutsu Kaisen Culling Game AI Bot
 * 
 * Implements a high-performance two-ply Minimax engine with Alpha-Beta pruning,
 * character-specific material valuations, 10x10 cross-board piece-square tables,
 * and tactical capture/shooting evaluation.
 */

import type {
  CullingPos,
  CullingPieceColor,
  CullingPieceType,
  CullingBoard,
  CullingMove,
  CullingMatchState,
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
  culling_yuji: 950,
  culling_kenjaku: 950,
  culling_mechamaru: 650,
  culling_panda: 600,
  culling_nanami: 700,
  culling_maki: 680,
  culling_hakari: 720,
  culling_uraume: 680,
  culling_yorozu: 670,
  culling_reggie: 600,
  culling_naoya: 720,
  culling_kurourushi: 650,
  culling_pawn: 100,
  culling_swarm: 80,
};

// 10x10 Cross-Board Positional Table (White perspective: y=0 bottom arm, y=9 top arm)
const CENTER_CONTROL_TABLE_10X10: number[][] = [
  // y=0: Bottom arm (B0..G0)
  [ 0,  0,  5, 10, 10, 10, 10,  5,  0,  0],
  // y=1: Rank 1 (A1..H1)
  [ 0, -5,  0,  5,  5,  5,  5,  0, -5,  0],
  // y=2: Rank 2 (L2, A2..H2, R2)
  [ 5,  0, 10, 15, 15, 15, 15, 10,  0,  5],
  // y=3: Rank 3
  [ 5,  5, 15, 25, 25, 25, 25, 15,  5,  5],
  // y=4: Rank 4 (Center clash)
  [10, 10, 20, 35, 40, 40, 35, 20, 10, 10],
  // y=5: Rank 5 (Center clash)
  [10, 10, 20, 35, 40, 40, 35, 20, 10, 10],
  // y=6: Rank 6
  [ 5,  5, 15, 25, 25, 25, 25, 15,  5,  5],
  // y=7: Rank 7
  [ 5,  0, 10, 15, 15, 15, 15, 10,  0,  5],
  // y=8: Rank 8 (A8..H8)
  [ 0, -5,  0,  5,  5,  5,  5,  0, -5,  0],
  // y=9: Top arm (B9..G9)
  [ 0,  0,  5, 10, 10, 10, 10,  5,  0,  0],
];

/**
 * Static evaluation of a Culling Board state
 * Positive values favor White, negative values favor Black
 */
export function evaluateCullingBoard(board: CullingBoard, turnCount: number): number {
  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whitePositional = 0;
  let blackPositional = 0;

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const piece = board[y][x];
      if (!piece) continue;

      const baseVal = CULLING_PIECE_VALUES[piece.type] || 100;
      const posVal = CENTER_CONTROL_TABLE_10X10[y][x] || 0;

      // Special state adjustments
      let bonus = 0;
      if (piece.pandaCore === 'gorilla') bonus += 80;
      if (piece.contractShield) bonus += 120;
      if (!piece.specialUsed) bonus += 50; // Ability preserved
      if (piece.isRestricted) bonus -= 70; // Immobilized

      // Pawn advancement bonus
      if (piece.type === 'culling_pawn') {
        const advancement = piece.color === 'white' ? (y - 1) * 15 : (8 - y) * 15;
        bonus += advancement;
      }

      if (piece.color === 'white') {
        whiteMaterial += baseVal + bonus;
        whitePositional += posVal;
      } else {
        blackMaterial += baseVal + bonus;
        blackPositional += CENTER_CONTROL_TABLE_10X10[9 - y][x] || 0;
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

function computeBoardKey(board: CullingBoard, turn: CullingPieceColor): string {
  let s = turn[0];
  for (let y = 1; y <= 8; y++) {
    for (let x = 1; x <= 8; x++) {
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
  isMaximizing: boolean
): { score: number; bestMove: CullingMove | null } {
  if (depth === 0 || match.status === 'completed') {
    return { score: evaluateCullingBoard(match.board, match.turnCount), bestMove: null };
  }

  const key = computeBoardKey(match.board, match.turn);
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
        turn: 'black',
        turnCount: match.turnCount + 1,
      };

      const { score } = minimax(nextMatch, depth - 1, alpha, beta, false);
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
        turn: 'white',
        turnCount: match.turnCount + 1,
      };

      const { score } = minimax(nextMatch, depth - 1, alpha, beta, true);
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
  depth: number = 2
): CullingMove | null {
  transpositionTable.clear();
  const isMaximizing = botColor === 'white';
  const { bestMove } = minimax(match, depth, -Infinity, Infinity, isMaximizing);
  return bestMove;
}
