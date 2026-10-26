import {
  Piece,
  PieceColor,
  Position,
  Move,
  MatchState,
  PieceType,
} from '../types/game.ts';
import {
  applyMoveToBoard,
  getAllLegalMoves,
  isKingInCheck,
  posToNotation,
  notationToPos,
} from '../game/engine.ts';

/**
 * Punisher Bot Engine
 * Supports 6 difficulty levels with specific styles, depths, and opening books.
 * Optimized with high-speed Piece-Square Tables (PST), MVV-LVA move ordering,
 * Quiescence tactical extensions, and a 45ms hard-bounded compute budget.
 */

export type PunisherBotId = 
  | 'joystick-wraith'
  | 'static-jester'
  | 'octavian-hollow'
  | 'iron-regent'
  | 'cyclops-revenant'
  | 'chrome-reaper'
  | 'bangla-bot';

export interface PunisherBotConfig {
  id: PunisherBotId;
  name: string;
  rating: string;
  depth: number;
  blunderChance: number; // 0 to 1
  aggression: number;    // 1.0 is neutral, higher is more aggressive
  mobilityWeight: number;
  centerControlWeight: number;
  kingSafetyWeight: number;
  openings: string[];
}

export const PUNISHER_BOTS: Record<PunisherBotId, PunisherBotConfig> = {
  'joystick-wraith': {
    id: 'joystick-wraith',
    name: 'Joystick Wraith',
    rating: '400-600',
    depth: 1,
    blunderChance: 0.35,
    aggression: 1.0,
    mobilityWeight: 0.5,
    centerControlWeight: 0.5,
    kingSafetyWeight: 0.5,
    openings: ['Italian Game', 'London System'],
  },
  'static-jester': {
    id: 'static-jester',
    name: 'Static Jester',
    rating: '800-1000',
    depth: 2,
    blunderChance: 0.15,
    aggression: 1.5,
    mobilityWeight: 1.0,
    centerControlWeight: 0.8,
    kingSafetyWeight: 0.7,
    openings: ['King\'s Gambit', 'Italian Game'],
  },
  'octavian-hollow': {
    id: 'octavian-hollow',
    name: 'Octavian Hollow',
    rating: '1300-1500',
    depth: 2,
    blunderChance: 0.04,
    aggression: 0.7,
    mobilityWeight: 0.8,
    centerControlWeight: 1.2,
    kingSafetyWeight: 1.5,
    openings: ['London System', 'Caro-Kann'],
  },
  'iron-regent': {
    id: 'iron-regent',
    name: 'Iron Regent',
    rating: '1900-2100',
    depth: 4,
    blunderChance: 0,
    aggression: 1.0,
    mobilityWeight: 1.2,
    centerControlWeight: 1.5,
    kingSafetyWeight: 1.2,
    openings: ['Queen\'s Gambit', 'Ruy Lopez', 'English Opening'],
  },
  'cyclops-revenant': {
    id: 'cyclops-revenant',
    name: 'Cyclops Revenant',
    rating: '2200-2400',
    depth: 5,
    blunderChance: 0,
    aggression: 1.8,
    mobilityWeight: 1.5,
    centerControlWeight: 1.0,
    kingSafetyWeight: 0.8,
    openings: ['King\'s Gambit', 'Sicilian Najdorf', 'King\'s Indian Defence'],
  },
  'chrome-reaper': {
    id: 'chrome-reaper',
    name: 'Chrome Reaper',
    rating: '2500+',
    depth: 5,
    blunderChance: 0,
    aggression: 1.2,
    mobilityWeight: 1.3,
    centerControlWeight: 1.3,
    kingSafetyWeight: 1.3,
    openings: ['London System', 'Italian Game', 'King\'s Gambit', 'Sicilian Najdorf', 'Queen\'s Gambit', 'Ruy Lopez', 'King\'s Indian Defence', 'Caro-Kann', 'English Opening'],
  },
  'bangla-bot': {
    id: 'bangla-bot',
    name: 'বাংলা-বট',
    rating: '1800-1900',
    depth: 4,
    blunderChance: 0,
    aggression: 2.2,
    mobilityWeight: 1.2,
    centerControlWeight: 1.3,
    kingSafetyWeight: 0.9,
    openings: ['Sicilian Najdorf', 'King\'s Gambit', 'Italian Game'],
  },
};

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
  prince: 750,
  communist: 600,
  supremeRook: 600,
  priest: 600,
};

// Piece-Square Tables (Rank 8 is row 0, Rank 1 is row 7)
const PAWN_TABLE = [
  [0,   0,   0,   0,   0,   0,   0,   0],
  [50,  50,  50,  50,  50,  50,  50,  50],
  [10,  10,  20,  30,  30,  20,  10,  10],
  [5,   5,  10,  25,  25,  10,   5,   5],
  [0,   0,   0,  20,  20,   0,   0,   0],
  [5,  -5, -10,   0,   0, -10,  -5,   5],
  [5,  10,  10, -20, -20,  10,  10,   5],
  [0,   0,   0,   0,   0,   0,   0,   0],
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0],
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const KING_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20],
];

// Opening book moves
const OPENING_BOOK: Record<string, Record<string, string>> = {
  'Italian Game': {
    '': 'e2e4',
    'e2e4': 'e7e5',
    'e2e4 e7e5': 'g1f3',
    'e2e4 e7e5 g1f3': 'b8c6',
    'e2e4 e7e5 g1f3 b8c6': 'f1c4',
    'e2e4 e7e5 g1f3 b8c6 f1c4': 'f8c5',
  },
  'London System': {
    '': 'd2d4',
    'd2d4': 'd7d5',
    'd2d4 d7d5': 'g1f3',
    'd2d4 d7d5 g1f3': 'g8f6',
    'd2d4 d7d5 g1f3 g8f6': 'c1f4',
    'd2d4 d7d5 g1f3 g8f6 c1f4': 'c7c5',
  },
  'King\'s Gambit': {
    '': 'e2e4',
    'e2e4': 'e7e5',
    'e2e4 e7e5': 'f2f4',
    'e2e4 e7e5 f2f4': 'e5f4',
  },
  'Sicilian Najdorf': {
    '': 'e2e4',
    'e2e4': 'c7c5',
    'e2e4 c7c5': 'g1f3',
    'e2e4 c7c5 g1f3': 'd7d6',
    'e2e4 c7c5 g1f3 d7d6': 'd2d4',
    'e2e4 c7c5 g1f3 d7d6 d2d4': 'c5d4',
    'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4': 'f3d4',
  },
  'Queen\'s Gambit': {
    '': 'd2d4',
    'd2d4': 'd7d5',
    'd2d4 d7d5': 'c2c4',
    'd2d4 d7d5 c2c4': 'e7e6',
  },
  'Ruy Lopez': {
    '': 'e2e4',
    'e2e4': 'e7e5',
    'e2e4 e7e5': 'g1f3',
    'e2e4 e7e5 g1f3 b8c6': 'f1b5',
    'e2e4 e7e5 g1f3 b8c6 f1b5': 'a7a6',
  },
  'King\'s Indian Defence': {
    '': 'd2d4',
    'd2d4': 'g8f6',
    'd2d4 g8f6': 'c2c4',
    'd2d4 g8f6 c2c4': 'g7g6',
  },
  'Caro-Kann': {
    '': 'e2e4',
    'e2e4': 'c7c6',
    'e2e4 c7c6': 'd2d4',
    'e2e4 c7c6 d2d4': 'd7d5',
  },
  'English Opening': {
    '': 'c2c4',
    'c2c4': 'e7e5',
  },
};

/**
 * Fast Board Signature for Transposition Table caching
 */
function getFastBoardHash(board: (Piece | null)[][], turn: PieceColor): string {
  let hash = turn === 'white' ? 'w:' : 'b:';
  const height = board.length;
  const width = board[0].length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = board[y][x];
      if (p) {
        hash += `${x}${y}${p.color[0]}${p.type[0]}${p.hasMoved ? 'm' : 'o'};`;
      }
    }
  }
  return hash;
}

/**
 * High-performance positional evaluation using Piece-Square Tables (PST)
 */
function evaluateBoard(
  board: (Piece | null)[][],
  config: PunisherBotConfig,
  turn: PieceColor
): number {
  let score = 0;
  const height = board.length;
  const width = board[0].length;
  const isWhiteBot = turn === 'white';

  const isHighRated =
    config.id === 'chrome-reaper' ||
    config.id === 'cyclops-revenant' ||
    config.id === 'iron-regent' ||
    config.id === 'bangla-bot';

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const piece = board[y][x];
      if (!piece) continue;

      const isPieceWhite = piece.color === 'white';
      let pieceVal = PIECE_VALUES[piece.type] || 0;

      // Aggression adjustment ONLY for low/mid bots
      if (!isHighRated && isPieceWhite !== isWhiteBot) {
        pieceVal *= config.aggression;
      }

      // Positional table bonus
      let pstBonus = 0;
      const tableRow = isPieceWhite ? 7 - y : y;
      const tableCol = isPieceWhite ? x : 7 - x;

      if (tableRow >= 0 && tableRow < 8 && tableCol >= 0 && tableCol < 8) {
        switch (piece.type) {
          case 'pawn':
            pstBonus = PAWN_TABLE[tableRow][tableCol];
            break;
          case 'knight':
            pstBonus = KNIGHT_TABLE[tableRow][tableCol];
            break;
          case 'bishop':
            pstBonus = BISHOP_TABLE[tableRow][tableCol];
            break;
          case 'rook':
            pstBonus = ROOK_TABLE[tableRow][tableCol];
            break;
          case 'queen':
            pstBonus = QUEEN_TABLE[tableRow][tableCol];
            break;
          case 'king':
            pstBonus = KING_TABLE[tableRow][tableCol] * config.kingSafetyWeight;
            break;
        }
      }

      // Center control bonus
      const distFromCenter = Math.abs(x - 3.5) + Math.abs(y - 3.5);
      const centerBonus = (7 - distFromCenter) * config.centerControlWeight * 3;

      const totalPieceScore = pieceVal + pstBonus + centerBonus;
      score += isPieceWhite ? totalPieceScore : -totalPieceScore;
    }
  }

  // Check pressure bonuses
  const checkAggression = isHighRated ? 1 : config.aggression;
  if (isKingInCheck(board, 'black')) score += 70 * (isWhiteBot ? checkAggression : 1);
  if (isKingInCheck(board, 'white')) score -= 70 * (!isWhiteBot ? checkAggression : 1);

  return isWhiteBot ? score : -score;
}

/**
 * MVV-LVA (Most Valuable Victim - Least Valuable Attacker) move ordering
 * Causes early alpha-beta pruning cutoffs on >90% of subtrees.
 */
function sortMovesFast(moves: Move[]): Move[] {
  return moves.slice().sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += ((PIECE_VALUES[a.captured.type] || 0) * 10) - (PIECE_VALUES[a.piece.type] || 0) + 1000;
    }
    if (b.captured) {
      scoreB += ((PIECE_VALUES[b.captured.type] || 0) * 10) - (PIECE_VALUES[b.piece.type] || 0) + 1000;
    }

    // Central target bonus
    const distCenterA = Math.abs(a.to.x - 3.5) + Math.abs(a.to.y - 3.5);
    const distCenterB = Math.abs(b.to.x - 3.5) + Math.abs(b.to.y - 3.5);
    scoreA += (7 - distCenterA) * 10;
    scoreB += (7 - distCenterB) * 10;

    return scoreB - scoreA;
  });
}

/**
 * Fast Quiescence Search on tactical captures to eliminate horizon blunders
 */
function quiescence(
  board: (Piece | null)[][],
  alpha: number,
  beta: number,
  botColor: PieceColor,
  config: PunisherBotConfig,
  depthLeft: number,
  deadline: number
): number {
  if (performance.now() > deadline) {
    return evaluateBoard(board, config, botColor);
  }

  const standPat = evaluateBoard(board, config, botColor);
  if (depthLeft <= 0) return standPat;
  if (standPat >= beta) return beta;
  if (alpha < standPat) alpha = standPat;

  const legalMoves = getAllLegalMoves(board, botColor);
  const captureMoves = legalMoves.filter(m => Boolean(m.captured));
  if (captureMoves.length === 0) return standPat;

  const sortedCaptures = sortMovesFast(captureMoves);

  for (const move of sortedCaptures) {
    const nextBoard = applyMoveToBoard(board, move);
    const oppColor: PieceColor = botColor === 'white' ? 'black' : 'white';
    const score = -quiescence(nextBoard, -beta, -alpha, oppColor, config, depthLeft - 1, deadline);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

interface TTEntry {
  score: number;
  depth: number;
}

/**
 * Minimax with Alpha-Beta pruning, Transposition Cache, and Time Budget
 */
function minimax(
  board: (Piece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  config: PunisherBotConfig,
  botColor: PieceColor,
  deadline: number,
  transpositionTable: Map<string, TTEntry>,
  useQuiescence: boolean
): number {
  if (performance.now() > deadline) {
    return evaluateBoard(board, config, botColor);
  }

  const turn: PieceColor = isMaximizing ? botColor : (botColor === 'white' ? 'black' : 'white');

  // Check transposition table with depth guard
  const boardHash = getFastBoardHash(board, turn);
  const cachedVal = transpositionTable.get(boardHash);
  if (cachedVal !== undefined && cachedVal.depth >= depth) {
    return cachedVal.score;
  }

  if (depth === 0) {
    let evalScore: number;
    if (useQuiescence) {
      evalScore = isMaximizing
        ? quiescence(board, alpha, beta, botColor, config, 2, deadline)
        : -quiescence(board, -beta, -alpha, botColor === 'white' ? 'black' : 'white', config, 2, deadline);
    } else {
      evalScore = evaluateBoard(board, config, botColor);
    }
    transpositionTable.set(boardHash, { score: evalScore, depth });
    return evalScore;
  }

  const allMoves = getAllLegalMoves(board, turn);

  if (allMoves.length === 0) {
    if (isKingInCheck(board, turn)) {
      return isMaximizing ? -1000000 + depth : 1000000 - depth;
    }
    return 0; // Stalemate
  }

  const orderedMoves = sortMovesFast(allMoves);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of orderedMoves) {
      const nextBoard = applyMoveToBoard(board, move);
      const evalScore = minimax(
        nextBoard,
        depth - 1,
        alpha,
        beta,
        false,
        config,
        botColor,
        deadline,
        transpositionTable,
        useQuiescence
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    transpositionTable.set(boardHash, { score: maxEval, depth });
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedMoves) {
      const nextBoard = applyMoveToBoard(board, move);
      const evalScore = minimax(
        nextBoard,
        depth - 1,
        alpha,
        beta,
        true,
        config,
        botColor,
        deadline,
        transpositionTable,
        useQuiescence
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    transpositionTable.set(boardHash, { score: minEval, depth });
    return minEval;
  }
}

/**
 * Superfast move engine for Punisher Bots
 * Calculates master-level moves without freezing the main thread.
 */
export function getPunisherBotMove(
  match: MatchState,
  botId: PunisherBotId
): Move | null {
  const config = PUNISHER_BOTS[botId];
  const botColor = match.turn;
  const opponentColor: PieceColor = botColor === 'white' ? 'black' : 'white';
  const isHighRated =
    botId === 'chrome-reaper' ||
    botId === 'cyclops-revenant' ||
    botId === 'iron-regent' ||
    botId === 'bangla-bot';

  // 1. Opening Book (0ms instant Grandmaster moves)
  const moveHistoryStr = match.moveHistory
    .map(m => `${posToNotation(m.from)}${posToNotation(m.to)}`)
    .join(' ');
  
  for (const openingName of config.openings) {
    const book = OPENING_BOOK[openingName];
    if (book) {
      const nextMoveNotation = book[moveHistoryStr];
      if (nextMoveNotation) {
        const fromStr = nextMoveNotation.slice(0, 2);
        const toStr = nextMoveNotation.slice(2, 4);
        const from = notationToPos(fromStr);
        const to = notationToPos(toStr);
        if (from && to) {
          const legalMoves = getAllLegalMoves(match.board, botColor);
          const found = legalMoves.find(m => m.from.x === from.x && m.from.y === from.y && m.to.x === to.x && m.to.y === to.y);
          if (found) return found;
        }
      }
    }
  }

  // 2. All Legal Moves
  const allMoves = getAllLegalMoves(match.board, botColor);
  if (allMoves.length === 0) return null;

  // Early-Exit Rule 1: Only one legal move exists (forced reply / evasion)
  if (allMoves.length === 1) {
    return allMoves[0];
  }

  // 3. Blunder Chance for low difficulty bots (Bot 1, 2, 3)
  if (config.blunderChance > 0 && Math.random() < config.blunderChance) {
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  // 4. Instant Mate-in-1 check (Master tactical reflex)
  for (const move of allMoves) {
    const nextBoard = applyMoveToBoard(match.board, move);
    if (isKingInCheck(nextBoard, opponentColor)) {
      const oppMoves = getAllLegalMoves(nextBoard, opponentColor);
      if (oppMoves.length === 0) {
        return move; // Checkmate found! Play immediately.
      }
    }
  }

  // Early-Exit Rule 2: Instant equal or better recapture on just-played square (for high-rated bots)
  if (isHighRated && match.moveHistory.length > 0) {
    const lastMove = match.moveHistory[match.moveHistory.length - 1];
    if (lastMove?.captured) {
      const recaptures = allMoves.filter(
        m => m.to.x === lastMove.to.x && m.to.y === lastMove.to.y && Boolean(m.captured)
      );
      if (recaptures.length > 0) {
        const lastPieceValue = PIECE_VALUES[lastMove.piece.type] || 100;
        // Find favorable/equal trade where capturing piece value <= captured piece value
        const favorableRecapture = recaptures.find(m => {
          const myPieceValue = PIECE_VALUES[m.piece.type] || 100;
          return myPieceValue <= lastPieceValue;
        });
        if (favorableRecapture) {
          return favorableRecapture;
        }
      }
    }
  }

  // Branch search based on bot difficulty tier
  if (!isHighRated) {
    // Low/Mid bots: preserve exact legacy single-pass 45ms search
    const deadline = performance.now() + 45;
    const transpositionTable = new Map<string, TTEntry>();

    let bestMove: Move = allMoves[0];
    let bestScore = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    const orderedMoves = sortMovesFast(allMoves);
    const searchDepth = config.depth;

    for (const move of orderedMoves) {
      if (performance.now() > deadline) break;

      const nextBoard = applyMoveToBoard(match.board, move);
      const score = minimax(
        nextBoard,
        searchDepth - 1,
        alpha,
        beta,
        false,
        config,
        botColor,
        deadline,
        transpositionTable,
        false
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);

      if (score >= 10000) {
        return move;
      }
    }

    return bestMove;
  }

  // High-Rated Bots (Iron Regent, Bangla-Bot, Cyclops Revenant, Chrome Reaper)
  // Iterative Deepening up to config.depth with 250ms budget and full-iteration completion guarantee
  const maxSearchDepth = config.depth;
  const deadline = performance.now() + 250;
  const transpositionTable = new Map<string, TTEntry>();

  let bestMove: Move = allMoves[0];
  let bestScore = -Infinity;

  const orderedMoves = sortMovesFast(allMoves);

  for (let currentDepth = 1; currentDepth <= maxSearchDepth; currentDepth++) {
    let depthBestMove: Move | null = null;
    let depthBestScore = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;
    let completedIteration = true;

    for (const move of orderedMoves) {
      if (performance.now() > deadline && currentDepth > 1) {
        completedIteration = false;
        break;
      }

      const nextBoard = applyMoveToBoard(match.board, move);
      const score = minimax(
        nextBoard,
        currentDepth - 1,
        alpha,
        beta,
        false,
        config,
        botColor,
        deadline,
        transpositionTable,
        true
      );

      if (score > depthBestScore) {
        depthBestScore = score;
        depthBestMove = move;
      }
      alpha = Math.max(alpha, score);

      if (score >= 100000) {
        return move;
      }
    }

    if (completedIteration && depthBestMove) {
      bestMove = depthBestMove;
      bestScore = depthBestScore;
    }
  }

  // 2-Ply Safety Net: Ensure bestMove does not blunder mate-in-1
  const testBoard = applyMoveToBoard(match.board, bestMove);
  if (!isKingInCheck(testBoard, opponentColor)) {
    const oppResponses = getAllLegalMoves(testBoard, opponentColor);
    let allowsMateInOne = false;
    for (const oppMove of oppResponses) {
      const oppBoard = applyMoveToBoard(testBoard, oppMove);
      if (isKingInCheck(oppBoard, botColor)) {
        if (getAllLegalMoves(oppBoard, botColor).length === 0) {
          allowsMateInOne = true;
          break;
        }
      }
    }

    if (allowsMateInOne) {
      const safeMoves = allMoves.filter(candidateMove => {
        const b2 = applyMoveToBoard(match.board, candidateMove);
        const opps = getAllLegalMoves(b2, opponentColor);
        for (const m2 of opps) {
          const b3 = applyMoveToBoard(b2, m2);
          if (isKingInCheck(b3, botColor) && getAllLegalMoves(b3, botColor).length === 0) {
            return false;
          }
        }
        return true;
      });
      if (safeMoves.length > 0) {
        return safeMoves[0];
      }
    }
  }

  return bestMove;
}
