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
 * Calibrated 7-tier chess engine featuring:
 * - Collision-free board state hashing (unique piece identity per type)
 * - Exact / LowerBound / UpperBound Transposition Table entries
 * - Iterative Deepening with strict completed-iteration time management
 * - Quiescence search on tactical captures and check evasions
 * - Killer moves & History heuristic move ordering
 * - Rating-calibrated depth ceilings and time budgets
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
    depth: 2,
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
    depth: 3,
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
    depth: 4,
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
    depth: 7,
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
    depth: 9,
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
    depth: 11,
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
    depth: 6,
    blunderChance: 0,
    aggression: 2.2,
    mobilityWeight: 1.2,
    centerControlWeight: 1.3,
    kingSafetyWeight: 0.9,
    openings: ['Sicilian Najdorf', 'King\'s Gambit', 'Italian Game'],
  },
};

const BOT_TIME_BUDGETS: Record<PunisherBotId, number> = {
  'joystick-wraith': 80,
  'static-jester': 150,
  'octavian-hollow': 300,
  'bangla-bot': 600,
  'iron-regent': 700,
  'cyclops-revenant': 1000,
  'chrome-reaper': 1300,
};

const BOT_MAX_DEPTHS: Record<PunisherBotId, number> = {
  'joystick-wraith': 2,
  'static-jester': 3,
  'octavian-hollow': 5,
  'bangla-bot': 8,
  'iron-regent': 8,
  'cyclops-revenant': 10,
  'chrome-reaper': 12,
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
  supremeRook: 650,
  priest: 580,
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
 * Collision-free Board Signature for Transposition Table caching.
 * Uses full piece type to prevent hash collisions between pawn, prince, priest, etc.
 */
function getFastBoardHash(board: (Piece | null)[][], turn: PieceColor): string {
  let hash = turn === 'white' ? 'w:' : 'b:';
  const height = board.length;
  const width = board[0].length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = board[y][x];
      if (p) {
        hash += `${p.color[0]}${p.type}${x}${y}${p.hasMoved ? 'm' : 'o'};`;
      }
    }
  }
  return hash;
}

/**
 * High-performance positional evaluation with PST, center control, king safety, and material balance.
 */
function evaluateBoard(
  board: (Piece | null)[][],
  config: PunisherBotConfig,
  turn: PieceColor
): number {
  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whitePst = 0;
  let blackPst = 0;
  let whiteCenter = 0;
  let blackCenter = 0;
  let whiteKingSafety = 0;
  let blackKingSafety = 0;

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
      const pieceVal = PIECE_VALUES[piece.type] || 0;

      if (isPieceWhite) {
        whiteMaterial += pieceVal;
      } else {
        blackMaterial += pieceVal;
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
          case 'priest':
            pstBonus = BISHOP_TABLE[tableRow][tableCol];
            break;
          case 'rook':
          case 'supremeRook':
            pstBonus = ROOK_TABLE[tableRow][tableCol];
            break;
          case 'queen':
          case 'prince':
          case 'communist':
            pstBonus = QUEEN_TABLE[tableRow][tableCol];
            break;
          case 'king':
            pstBonus = KING_TABLE[tableRow][tableCol];
            break;
        }
      }

      // Center control bonus
      const distFromCenter = Math.abs(x - 3.5) + Math.abs(y - 3.5);
      const centerBonus = (7 - distFromCenter) * config.centerControlWeight * 3;

      if (isPieceWhite) {
        whitePst += pstBonus;
        whiteCenter += centerBonus;
      } else {
        blackPst += pstBonus;
        blackCenter += centerBonus;
      }

      // King pawn shield evaluation
      if (piece.type === 'king') {
        let shield = 0;
        const kingRank = y;
        const kingFile = x;
        const shieldRank = isPieceWhite ? kingRank - 1 : kingRank + 1;
        if (shieldRank >= 0 && shieldRank < height) {
          for (let df = -1; df <= 1; df++) {
            const sf = kingFile + df;
            if (sf >= 0 && sf < width) {
              const neighbor = board[shieldRank][sf];
              if (neighbor && neighbor.color === piece.color && neighbor.type === 'pawn') {
                shield += 15;
              }
            }
          }
        }
        if (isPieceWhite) {
          whiteKingSafety += shield * config.kingSafetyWeight;
        } else {
          blackKingSafety += shield * config.kingSafetyWeight;
        }
      }
    }
  }

  // Check pressure bonuses
  let checkScore = 0;
  const checkAggression = isHighRated ? 1.0 : config.aggression;
  if (isKingInCheck(board, 'black')) {
    checkScore += 70 * (isWhiteBot ? checkAggression : 1);
  }
  if (isKingInCheck(board, 'white')) {
    checkScore -= 70 * (!isWhiteBot ? checkAggression : 1);
  }

  // Aggression scaling for low/mid bots
  let whiteTotal = whiteMaterial + whitePst + whiteCenter + whiteKingSafety;
  let blackTotal = blackMaterial + blackPst + blackCenter + blackKingSafety;

  if (!isHighRated) {
    if (isWhiteBot) {
      whiteTotal *= config.aggression;
    } else {
      blackTotal *= config.aggression;
    }
  }

  const evalScore = (whiteTotal - blackTotal) + checkScore;
  return isWhiteBot ? evalScore : -evalScore;
}

function isSameMove(m1: Move, m2: Move): boolean {
  return m1.from.x === m2.from.x && m1.from.y === m2.from.y && m1.to.x === m2.to.x && m1.to.y === m2.to.y;
}

/**
 * Advanced Move Ordering: TT move -> MVV-LVA Captures -> Promotions -> Killer Moves -> History -> Center Control
 */
function sortMoves(
  moves: Move[],
  ttMove: Move | undefined,
  ply: number,
  killerMoves: (Move | null)[][],
  historyTable: number[][][][]
): Move[] {
  return moves.slice().sort((a, b) => {
    // 1. TT Move
    if (ttMove) {
      if (isSameMove(a, ttMove)) return -1;
      if (isSameMove(b, ttMove)) return 1;
    }

    let scoreA = 0;
    let scoreB = 0;

    // 2. MVV-LVA Captures
    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured.type] || 100) * 10 - (PIECE_VALUES[a.piece.type] || 100) + 10000;
    }
    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured.type] || 100) * 10 - (PIECE_VALUES[b.piece.type] || 100) + 10000;
    }

    // 3. Promotions
    if (a.piece.type === 'pawn' && (a.to.y === 0 || a.to.y === 7)) scoreA += 9000;
    if (b.piece.type === 'pawn' && (b.to.y === 0 || b.to.y === 7)) scoreB += 9000;

    // 4. Killer Moves
    if (ply < 20) {
      if (killerMoves[ply]?.[0] && isSameMove(a, killerMoves[ply][0]!)) scoreA += 5000;
      if (killerMoves[ply]?.[0] && isSameMove(b, killerMoves[ply][0]!)) scoreB += 5000;
      if (killerMoves[ply]?.[1] && isSameMove(a, killerMoves[ply][1]!)) scoreA += 4000;
      if (killerMoves[ply]?.[1] && isSameMove(b, killerMoves[ply][1]!)) scoreB += 4000;
    }

    // 5. History Heuristic
    scoreA += historyTable[a.from.x]?.[a.from.y]?.[a.to.x]?.[a.to.y] || 0;
    scoreB += historyTable[b.from.x]?.[b.from.y]?.[b.to.x]?.[b.to.y] || 0;

    // 6. Center Control
    const distCenterA = Math.abs(a.to.x - 3.5) + Math.abs(a.to.y - 3.5);
    const distCenterB = Math.abs(b.to.x - 3.5) + Math.abs(b.to.y - 3.5);
    scoreA += (7 - distCenterA) * 5;
    scoreB += (7 - distCenterB) * 5;

    return scoreB - scoreA;
  });
}

function sortMovesFast(moves: Move[]): Move[] {
  return moves.slice().sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured.type] || 100) * 10 - (PIECE_VALUES[a.piece.type] || 100) + 1000;
    }
    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured.type] || 100) * 10 - (PIECE_VALUES[b.piece.type] || 100) + 1000;
    }
    const distA = Math.abs(a.to.x - 3.5) + Math.abs(a.to.y - 3.5);
    const distB = Math.abs(b.to.x - 3.5) + Math.abs(b.to.y - 3.5);
    scoreA += (7 - distA) * 5;
    scoreB += (7 - distB) * 5;
    return scoreB - scoreA;
  });
}

interface SearchContext {
  aborted: boolean;
  deadline: number;
  nodesSearched: number;
  historyTable: number[][][][];
  killerMoves: (Move | null)[][];
}

/**
 * Quiescence Search: Tactical capture resolution & forced check evasion
 */
function quiescence(
  board: (Piece | null)[][],
  alpha: number,
  beta: number,
  botColor: PieceColor,
  config: PunisherBotConfig,
  depthLeft: number,
  deadline: number,
  context: SearchContext
): number {
  if (performance.now() > deadline) {
    context.aborted = true;
    return evaluateBoard(board, config, botColor);
  }

  const inCheck = isKingInCheck(board, botColor);

  if (!inCheck) {
    const standPat = evaluateBoard(board, config, botColor);
    if (depthLeft <= 0) return standPat;
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    // Delta Pruning
    if (standPat + 950 < alpha) {
      return alpha;
    }

    const legalMoves = getAllLegalMoves(board, botColor);
    const captureMoves = legalMoves.filter(
      m => Boolean(m.captured) || (m.piece.type === 'pawn' && (m.to.y === 0 || m.to.y === 7))
    );
    if (captureMoves.length === 0) return standPat;

    const sortedCaptures = sortMovesFast(captureMoves);

    for (const move of sortedCaptures) {
      if (context.aborted || performance.now() > deadline) {
        context.aborted = true;
        return alpha;
      }
      const nextBoard = applyMoveToBoard(board, move);
      const oppColor: PieceColor = botColor === 'white' ? 'black' : 'white';
      const score = -quiescence(nextBoard, -beta, -alpha, oppColor, config, depthLeft - 1, deadline, context);
      if (context.aborted) return alpha;

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    // If in check, side to move MUST search all legal evasions!
    if (depthLeft <= -4) {
      return evaluateBoard(board, config, botColor);
    }

    const legalMoves = getAllLegalMoves(board, botColor);
    if (legalMoves.length === 0) {
      return -1000000; // Checkmated
    }

    const sortedMoves = sortMovesFast(legalMoves);
    for (const move of sortedMoves) {
      if (context.aborted || performance.now() > deadline) {
        context.aborted = true;
        return alpha;
      }
      const nextBoard = applyMoveToBoard(board, move);
      const oppColor: PieceColor = botColor === 'white' ? 'black' : 'white';
      const score = -quiescence(nextBoard, -beta, -alpha, oppColor, config, depthLeft - 1, deadline, context);
      if (context.aborted) return alpha;

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }
}

const TT_EXACT = 0;
const TT_LOWERBOUND = 1; // Beta cutoff
const TT_UPPERBOUND = 2; // Alpha fail-low

interface TTEntry {
  score: number;
  depth: number;
  flag: number;
  bestMove?: Move;
}

/**
 * Minimax Search with Alpha-Beta Pruning, Transposition Cache, and Time Budget
 */
function minimax(
  board: (Piece | null)[][],
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  config: PunisherBotConfig,
  botColor: PieceColor,
  transpositionTable: Map<string, TTEntry>,
  context: SearchContext,
  useQuiescence: boolean
): number {
  if (context.aborted || performance.now() > context.deadline) {
    context.aborted = true;
    return alpha;
  }

  context.nodesSearched++;
  const initialAlpha = alpha;
  const turn: PieceColor = isMaximizing ? botColor : (botColor === 'white' ? 'black' : 'white');
  const boardHash = getFastBoardHash(board, turn);

  // Probe Transposition Table
  const cachedVal = transpositionTable.get(boardHash);
  let ttMove: Move | undefined = undefined;
  if (cachedVal !== undefined) {
    ttMove = cachedVal.bestMove;
    if (cachedVal.depth >= depth) {
      if (cachedVal.flag === TT_EXACT) {
        return cachedVal.score;
      } else if (cachedVal.flag === TT_LOWERBOUND && cachedVal.score >= beta) {
        return cachedVal.score;
      } else if (cachedVal.flag === TT_UPPERBOUND && cachedVal.score <= alpha) {
        return cachedVal.score;
      }
    }
  }

  if (depth <= 0) {
    let evalScore: number;
    if (useQuiescence) {
      evalScore = isMaximizing
        ? quiescence(board, alpha, beta, botColor, config, 3, context.deadline, context)
        : -quiescence(board, -beta, -alpha, botColor === 'white' ? 'black' : 'white', config, 3, context.deadline, context);
    } else {
      evalScore = evaluateBoard(board, config, botColor);
    }
    return evalScore;
  }

  const allMoves = getAllLegalMoves(board, turn);

  if (allMoves.length === 0) {
    if (isKingInCheck(board, turn)) {
      // Mate score adjusted for ply distance
      return isMaximizing ? (-1000000 + ply) : (1000000 - ply);
    }
    return 0; // Stalemate
  }

  const orderedMoves = sortMoves(allMoves, ttMove, ply, context.killerMoves, context.historyTable);
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestMoveForNode: Move | undefined = undefined;

  if (isMaximizing) {
    for (const move of orderedMoves) {
      if (context.aborted || performance.now() > context.deadline) {
        context.aborted = true;
        return alpha;
      }

      const nextBoard = applyMoveToBoard(board, move);
      const score = minimax(
        nextBoard,
        depth - 1,
        ply + 1,
        alpha,
        beta,
        false,
        config,
        botColor,
        transpositionTable,
        context,
        useQuiescence
      );

      if (context.aborted) return alpha;

      if (score > bestScore) {
        bestScore = score;
        bestMoveForNode = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        // Beta Cutoff
        if (!move.captured && ply < 20) {
          context.killerMoves[ply] = context.killerMoves[ply] || [null, null];
          if (!isSameMove(move, context.killerMoves[ply][0] || { from: { x: -1, y: -1 }, to: { x: -1, y: -1 } } as any)) {
            context.killerMoves[ply][1] = context.killerMoves[ply][0];
            context.killerMoves[ply][0] = move;
          }
          const from = move.from;
          const to = move.to;
          context.historyTable[from.x][from.y][to.x][to.y] = (context.historyTable[from.x][from.y][to.x][to.y] || 0) + depth * depth;
        }
        break;
      }
    }
  } else {
    for (const move of orderedMoves) {
      if (context.aborted || performance.now() > context.deadline) {
        context.aborted = true;
        return beta;
      }

      const nextBoard = applyMoveToBoard(board, move);
      const score = minimax(
        nextBoard,
        depth - 1,
        ply + 1,
        alpha,
        beta,
        true,
        config,
        botColor,
        transpositionTable,
        context,
        useQuiescence
      );

      if (context.aborted) return beta;

      if (score < bestScore) {
        bestScore = score;
        bestMoveForNode = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) {
        // Alpha Cutoff
        if (!move.captured && ply < 20) {
          context.killerMoves[ply] = context.killerMoves[ply] || [null, null];
          if (!isSameMove(move, context.killerMoves[ply][0] || { from: { x: -1, y: -1 }, to: { x: -1, y: -1 } } as any)) {
            context.killerMoves[ply][1] = context.killerMoves[ply][0];
            context.killerMoves[ply][0] = move;
          }
          const from = move.from;
          const to = move.to;
          context.historyTable[from.x][from.y][to.x][to.y] = (context.historyTable[from.x][from.y][to.x][to.y] || 0) + depth * depth;
        }
        break;
      }
    }
  }

  // Record Transposition Entry if not aborted
  if (!context.aborted) {
    let flag = TT_EXACT;
    if (isMaximizing) {
      if (bestScore <= initialAlpha) flag = TT_UPPERBOUND;
      else if (bestScore >= beta) flag = TT_LOWERBOUND;
    } else {
      if (bestScore >= beta) flag = TT_LOWERBOUND;
      else if (bestScore <= initialAlpha) flag = TT_UPPERBOUND;
    }
    transpositionTable.set(boardHash, { score: bestScore, depth, flag, bestMove: bestMoveForNode });
  }

  return bestScore;
}

/**
 * Main move generator for Punisher Bots.
 * Uses Opening Book, Iterative Deepening with Completed Iteration Guarantee, and Quiescence search.
 */
export function getPunisherBotMove(
  match: MatchState,
  botId: PunisherBotId
): Move | null {
  const config = PUNISHER_BOTS[botId];
  const botColor = match.turn;
  const opponentColor: PieceColor = botColor === 'white' ? 'black' : 'white';

  // 1. Opening Book Lookup (0ms instant Grandmaster moves)
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
          const found = legalMoves.find(
            m => m.from.x === from.x && m.from.y === from.y && m.to.x === to.x && m.to.y === to.y
          );
          if (found) return found;
        }
      }
    }
  }

  // 2. All Legal Moves
  const allMoves = getAllLegalMoves(match.board, botColor);
  if (allMoves.length === 0) return null;

  // Single Legal Move Exemption (instant response)
  if (allMoves.length === 1) {
    return allMoves[0];
  }

  // 3. Blunder Chance for low difficulty bots (Joystick Wraith, Static Jester, Octavian Hollow)
  if (config.blunderChance > 0 && Math.random() < config.blunderChance) {
    const nonMatingBlunders = allMoves.filter(candidateMove => {
      const b2 = applyMoveToBoard(match.board, candidateMove);
      if (isKingInCheck(b2, opponentColor)) return true;
      const opps = getAllLegalMoves(b2, opponentColor);
      for (const m2 of opps) {
        const b3 = applyMoveToBoard(b2, m2);
        if (isKingInCheck(b3, botColor) && getAllLegalMoves(b3, botColor).length === 0) {
          return false; // Exclude moves that allow instant mate-in-1
        }
      }
      return true;
    });

    if (nonMatingBlunders.length > 0) {
      return nonMatingBlunders[Math.floor(Math.random() * nonMatingBlunders.length)];
    }
  }

  // 4. Instant Mate-in-1 Check (Master tactical reflex)
  for (const move of allMoves) {
    const nextBoard = applyMoveToBoard(match.board, move);
    if (isKingInCheck(nextBoard, opponentColor)) {
      const oppMoves = getAllLegalMoves(nextBoard, opponentColor);
      if (oppMoves.length === 0) {
        return move; // Checkmate found! Play immediately.
      }
    }
  }

  // 5. Iterative Deepening Engine Search
  const maxSearchDepth = BOT_MAX_DEPTHS[botId] || config.depth;
  const timeBudgetMs = BOT_TIME_BUDGETS[botId] || 250;
  const deadline = performance.now() + timeBudgetMs;

  const transpositionTable = new Map<string, TTEntry>();
  const historyTable: number[][][][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => Array(10).fill(0))
    )
  );
  const killerMoves: (Move | null)[][] = Array.from({ length: 30 }, () => [null, null]);

  let overallBestMove: Move = allMoves[0];

  for (let currentDepth = 1; currentDepth <= maxSearchDepth; currentDepth++) {
    const context: SearchContext = {
      aborted: false,
      deadline,
      nodesSearched: 0,
      historyTable,
      killerMoves,
    };

    let depthBestMove: Move | null = null;
    let depthBestScore = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    // Boundary memory cleanup
    if (transpositionTable.size > 80000) {
      transpositionTable.clear();
    }

    const ttVal = transpositionTable.get(getFastBoardHash(match.board, botColor));
    const rootOrderedMoves = sortMoves(
      allMoves,
      ttVal?.bestMove || overallBestMove,
      0,
      killerMoves,
      historyTable
    );

    for (const move of rootOrderedMoves) {
      if (performance.now() > deadline && currentDepth > 1) {
        context.aborted = true;
        break;
      }

      const nextBoard = applyMoveToBoard(match.board, move);
      const score = minimax(
        nextBoard,
        currentDepth - 1,
        1,
        alpha,
        beta,
        false,
        config,
        botColor,
        transpositionTable,
        context,
        true
      );

      if (context.aborted) break;

      if (score > depthBestScore) {
        depthBestScore = score;
        depthBestMove = move;
      }
      alpha = Math.max(alpha, score);

      if (score >= 900000) {
        return move;
      }
    }

    // Only commit move if the iteration completed fully
    if (!context.aborted && depthBestMove) {
      overallBestMove = depthBestMove;
    } else {
      break;
    }
  }

  // 6. Safety Net: Prevent candidate move from blundering mate-in-1
  const testBoard = applyMoveToBoard(match.board, overallBestMove);
  const oppResponses = getAllLegalMoves(testBoard, opponentColor);
  let allowsMateInOne = false;
  for (const oppMove of oppResponses) {
    const oppBoard = applyMoveToBoard(testBoard, oppMove);
    if (isKingInCheck(oppBoard, botColor) && getAllLegalMoves(oppBoard, botColor).length === 0) {
      allowsMateInOne = true;
      break;
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

  return overallBestMove;
}
