import type { PieceType, Team } from './3dchesspieces';
import type { PlacedPiece, Position3D, Chess3dMatchState } from './types';
import {
  getAllLegalMoves,
  simulateMove,
  isKingInCheck,
} from './chess3dEngine';
import { PUNISHER_BOTS, type PunisherBotId, type PunisherBotConfig } from '../punisher/punisherBot';

export { PUNISHER_BOTS, type PunisherBotId, type PunisherBotConfig };

/* Piece base values in centipawns */
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

/* Positional Piece-Square Tables (PST) normalized from Orange/White perspective (r: 7=bottom, 0=top) */
const PAWN_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_PST = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

function getPstScore(type: PieceType, c: number, r: number, team: Team): number {
  const effectiveR = team === 'orange' ? r : 7 - r;
  switch (type) {
    case 'pawn': return PAWN_PST[effectiveR][c];
    case 'knight': return KNIGHT_PST[effectiveR][c];
    case 'bishop': return BISHOP_PST[effectiveR][c];
    case 'rook': return ROOK_PST[effectiveR][c];
    case 'queen': return QUEEN_PST[effectiveR][c];
    case 'king': return KING_PST[effectiveR][c];
    default: return 0;
  }
}

export function evaluateBoard(pieces: PlacedPiece[], botTeam: Team, config: PunisherBotConfig): number {
  let score = 0;
  const oppTeam: Team = botTeam === 'orange' ? 'red' : 'orange';

  for (const p of pieces) {
    const val = PIECE_VALUES[p.type] + getPstScore(p.type, p.c, p.r, p.team);
    if (p.team === botTeam) {
      score += val;
    } else {
      score -= val;
    }
  }

  // King safety
  if (isKingInCheck(pieces, oppTeam)) {
    score += 45 * config.aggression;
  }
  if (isKingInCheck(pieces, botTeam)) {
    score -= 60 * config.kingSafetyWeight;
  }

  return score;
}

export interface BotMoveChoice3D {
  from: Position3D;
  to: Position3D;
  promotion?: PieceType;
}

/**
 * Quiescence search on tactical captures to prevent horizon effect
 */
function quiescence(
  pieces: PlacedPiece[],
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  botTeam: Team,
  config: PunisherBotConfig,
  qDepth = 2
): number {
  const standPat = evaluateBoard(pieces, botTeam, config);
  if (qDepth === 0) return standPat;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    let maxEval = Math.max(standPat, alpha);

    const legalMoves = getAllLegalMoves(pieces, botTeam, null);
    const captures = legalMoves.filter((m) => pieces.some((p) => p.c === m.to.c && p.r === m.to.r));

    for (const m of captures) {
      const nextPieces = simulateMove(pieces, m.piece, m.to, m.isEnPassant, m.isCastling);
      const evalScore = quiescence(nextPieces, maxEval, beta, false, botTeam, config, qDepth - 1);
      maxEval = Math.max(maxEval, evalScore);
      if (maxEval >= beta) break;
    }
    return maxEval;
  } else {
    if (standPat <= alpha) return alpha;
    let minEval = Math.min(standPat, beta);

    const oppTeam: Team = botTeam === 'orange' ? 'red' : 'orange';
    const legalMoves = getAllLegalMoves(pieces, oppTeam, null);
    const captures = legalMoves.filter((m) => pieces.some((p) => p.c === m.to.c && p.r === m.to.r));

    for (const m of captures) {
      const nextPieces = simulateMove(pieces, m.piece, m.to, m.isEnPassant, m.isCastling);
      const evalScore = quiescence(nextPieces, alpha, minEval, true, botTeam, config, qDepth - 1);
      minEval = Math.min(minEval, evalScore);
      if (minEval <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Minimax with Alpha-Beta Pruning, Move Ordering, and Quiescence search
 */
function minimax(
  pieces: PlacedPiece[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  botTeam: Team,
  enPassantTarget: Position3D | null,
  config: PunisherBotConfig
): number {
  if (depth === 0) {
    return quiescence(pieces, alpha, beta, isMaximizing, botTeam, config, 2);
  }

  const currentTeam: Team = isMaximizing ? botTeam : botTeam === 'orange' ? 'red' : 'orange';
  const legalMoves = getAllLegalMoves(pieces, currentTeam, enPassantTarget);

  if (legalMoves.length === 0) {
    if (isKingInCheck(pieces, currentTeam)) {
      return isMaximizing ? -99999 + (5 - depth) : 99999 - (5 - depth);
    }
    return 0; // Stalemate
  }

  // Move ordering: Prioritize captures and checks
  legalMoves.sort((a, b) => {
    const targetA = pieces.find((p) => p.c === a.to.c && p.r === a.to.r);
    const targetB = pieces.find((p) => p.c === b.to.c && p.r === b.to.r);
    const valA = targetA ? PIECE_VALUES[targetA.type] * 10 - PIECE_VALUES[a.piece.type] : 0;
    const valB = targetB ? PIECE_VALUES[targetB.type] * 10 - PIECE_VALUES[b.piece.type] : 0;
    return valB - valA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of legalMoves) {
      const nextPieces = simulateMove(pieces, m.piece, m.to, m.isEnPassant, m.isCastling);
      const nextEnPassant =
        m.piece.type === 'pawn' && Math.abs(m.to.r - m.piece.r) === 2
          ? { c: m.piece.c, r: (m.piece.r + m.to.r) / 2 }
          : null;

      const evalScore = minimax(nextPieces, depth - 1, alpha, beta, false, botTeam, nextEnPassant, config);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of legalMoves) {
      const nextPieces = simulateMove(pieces, m.piece, m.to, m.isEnPassant, m.isCastling);
      const nextEnPassant =
        m.piece.type === 'pawn' && Math.abs(m.to.r - m.piece.r) === 2
          ? { c: m.piece.c, r: (m.piece.r + m.to.r) / 2 }
          : null;

      const evalScore = minimax(nextPieces, depth - 1, alpha, beta, true, botTeam, nextEnPassant, config);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return minEval;
  }
}

/**
 * Calculates best move for the Punisher Bot.
 * High-ELO bots (Chrome Reaper, Cyclops Revenant, Iron Regent) use Depth 3-4 with quiescence.
 */
export function getBest3dBotMove(
  state: Chess3dMatchState,
  botId: PunisherBotId = 'chrome-reaper'
): BotMoveChoice3D | null {
  const config = PUNISHER_BOTS[botId] || PUNISHER_BOTS['chrome-reaper'];
  const botTeam = state.turn;
  const legalMoves = getAllLegalMoves(state.pieces, botTeam, state.enPassantTarget);

  if (legalMoves.length === 0) return null;

  // Blunder simulation for lower ELO bots
  if (Math.random() < config.blunderChance && legalMoves.length > 1) {
    const nonBlunders = legalMoves.slice(1);
    const chosen = nonBlunders[Math.floor(Math.random() * nonBlunders.length)];
    return {
      from: { c: chosen.piece.c, r: chosen.piece.r },
      to: chosen.to,
      promotion: 'queen',
    };
  }

  // Search depth scaled by bot rating
  const effectiveDepth = Math.min(3, Math.max(2, config.depth));

  let bestMove: BotMoveChoice3D | null = null;
  let bestScore = -Infinity;

  // Prioritize captures and checks during root exploration
  legalMoves.sort((a, b) => {
    const targetA = state.pieces.find((p) => p.c === a.to.c && p.r === a.to.r);
    const targetB = state.pieces.find((p) => p.c === b.to.c && p.r === b.to.r);
    const valA = targetA ? PIECE_VALUES[targetA.type] * 10 - PIECE_VALUES[a.piece.type] : 0;
    const valB = targetB ? PIECE_VALUES[targetB.type] * 10 - PIECE_VALUES[b.piece.type] : 0;
    return valB - valA;
  });

  for (const m of legalMoves) {
    const nextPieces = simulateMove(state.pieces, m.piece, m.to, m.isEnPassant, m.isCastling);
    const nextEnPassant =
      m.piece.type === 'pawn' && Math.abs(m.to.r - m.piece.r) === 2
        ? { c: m.piece.c, r: (m.piece.r + m.to.r) / 2 }
        : null;

    const score = minimax(
      nextPieces,
      effectiveDepth - 1,
      -Infinity,
      Infinity,
      false,
      botTeam,
      nextEnPassant,
      config
    );

    if (score > bestScore || !bestMove) {
      bestScore = score;
      bestMove = {
        from: { c: m.piece.c, r: m.piece.r },
        to: m.to,
        promotion: 'queen',
      };
    }
  }

  return bestMove || {
    from: { c: legalMoves[0].piece.c, r: legalMoves[0].piece.r },
    to: legalMoves[0].to,
    promotion: 'queen',
  };
}
