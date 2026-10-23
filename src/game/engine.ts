/**
 * Custom Multiplayer Dice Chess - Authoritative Game Engine
 *
 * Rules:
 * 1. 8x8 Board with custom corner piece layout:
 *    - White: Queen at a1, Prince at h1.
 *    - Black: Prince at a8, Queen at h8.
 *    - Rooks, Bishops, Knights, Kings and Pawns occupy the remaining initial squares.
 * 2. Prince Special Piece:
 *    - Standard Knight move (2x1 L-shape leap).
 *    - Bounded Diagonal move (1, 2, 3, or 4 squares unobstructed diagonal).
 *    - Extended 3x1 first move (usable once per Prince per game).
 * 3. Dice Roll System:
 *    - Rolls 1, 2, 3: Inexpensive pieces (Knight, Bishop, Pawn).
 *    - Rolls 4, 5, 6: Expensive pieces (Rook, Queen, Prince, King, Pawn).
 *    - Fallback: If no legal moves exist for the rolled group, all valid moves unlock!
 *    - Late-game bias: when active player has < 7 pieces, bias toward 4, 5, 6.
 * 4. Draw Condition:
 *    - Game immediately draws when either player gets 2 pawns to the opponent's back rank.
 */

import type {
  Piece,
  PieceColor,
  PieceType,
  Position,
  Move,
  DiceState,
  MatchState,
  MatchStatus,
  MatchResult,
  GameEndReason,
  ExpansionSide,
} from '../types/game.ts';
import {
  EXPANSION_LOST_PIECES_THRESHOLD,
  CRAFTING_LOST_EXPENSIVE_THRESHOLD,
  EXPANSION_AUTO_PICK_TIMEOUT_MS,
  CRAFTING_AUTO_PICK_TIMEOUT_MS,
} from '../types/game.ts';
import { CRAFTABLE_MAP } from './craftables.ts';

export const INEXPENSIVE_PIECES: PieceType[] = [
  'knight',
  'bishop',
  'pawn',
  'communist',
  'priest',
];
export const EXPENSIVE_PIECES: PieceType[] = [
  'rook',
  'queen',
  'prince',
  'king',
  'pawn',
  'communist',
  'supremeRook',
  'priest',
];

// Expensive pieces for the 4-expensive crafting trigger (NOT pawns, knights or bishops)
export const CRAFTING_ELIGIBLE_EXPENSIVE_TYPES: PieceType[] = [
  'rook',
  'queen',
  'prince',
  'king',
  'communist',
  'supremeRook',
  'priest',
];

export const LATE_GAME_PIECE_THRESHOLD = 7;

// Biased probability weights for late-game (when player material < 7)
export const BIASED_DICE_WEIGHTS = {
  1: 0.10,
  2: 0.10,
  3: 0.10,
  4: 0.2333,
  5: 0.2333,
  6: 0.2334,
};

/**
 * Creates the deterministic initial 8x8 board.
 * Supports 'standard' mode and 'crafted' mode:
 * In 'crafted' mode:
 * - Normal Queen remains on both sides (a1, h8)
 * - Normal Prince remains on both sides (h1, a8)
 * - Normal Bishops are replaced with Communist (c1, f1 for White; c8, f8 for Black)
 * - Normal Knights are replaced with Priest (b1 for White; g8 for Black)
 * - One normal Rook is replaced with Supreme Rook (d1 for White; d8 for Black), with remaining Rook (g1, b8) intact.
 */
export function createInitialBoard(gameMode: 'standard' | 'crafted' = 'standard'): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const isCrafted = gameMode === 'crafted';

  // Rank 1 (y=0): White pieces
  // Standard: a1: Queen, b1: Knight, c1: Bishop, d1: Rook, e1: King, f1: Bishop, g1: Rook, h1: Prince
  // Crafted: a1: Queen, b1: Priest, c1: Communist, d1: Supreme Rook, e1: King, f1: Communist, g1: Rook, h1: Prince
  board[0][0] = { id: 'w_q_a1', type: 'queen', color: 'white', hasMoved: false };
  board[0][1] = isCrafted
    ? { id: 'w_pr_b1', type: 'priest', color: 'white', hasMoved: false }
    : { id: 'w_n_b1', type: 'knight', color: 'white', hasMoved: false };
  board[0][2] = isCrafted
    ? { id: 'w_c_c1', type: 'communist', color: 'white', hasMoved: false }
    : { id: 'w_b_c1', type: 'bishop', color: 'white', hasMoved: false };
  board[0][3] = isCrafted
    ? { id: 'w_sr_d1', type: 'supremeRook', color: 'white', hasMoved: false }
    : { id: 'w_r_d1', type: 'rook', color: 'white', hasMoved: false };
  board[0][4] = { id: 'w_k_e1', type: 'king', color: 'white', hasMoved: false };
  board[0][5] = isCrafted
    ? { id: 'w_c_f1', type: 'communist', color: 'white', hasMoved: false }
    : { id: 'w_b_f1', type: 'bishop', color: 'white', hasMoved: false };
  board[0][6] = { id: 'w_r_g1', type: 'rook', color: 'white', hasMoved: false };
  board[0][7] = { id: 'w_p_h1', type: 'prince', color: 'white', hasMoved: false, princeSpecialUsed: false };

  // Rank 2 (y=1): White pawns
  for (let x = 0; x < 8; x++) {
    board[1][x] = {
      id: `w_pawn_${x}`,
      type: 'pawn',
      color: 'white',
      hasMoved: false,
    };
  }

  // Rank 7 (y=6): Black pawns
  for (let x = 0; x < 8; x++) {
    board[6][x] = {
      id: `b_pawn_${x}`,
      type: 'pawn',
      color: 'black',
      hasMoved: false,
    };
  }

  // Rank 8 (y=7): Black pieces
  // Standard: a8: Prince, b8: Rook, c8: Bishop, d8: Rook, e8: King, f8: Bishop, g8: Knight, h8: Queen
  // Crafted: a8: Prince, b8: Rook, c8: Communist, d8: Supreme Rook, e8: King, f8: Communist, g8: Priest, h8: Queen
  board[7][0] = { id: 'b_p_a8', type: 'prince', color: 'black', hasMoved: false, princeSpecialUsed: false };
  board[7][1] = { id: 'b_r_b8', type: 'rook', color: 'black', hasMoved: false };
  board[7][2] = isCrafted
    ? { id: 'b_c_c8', type: 'communist', color: 'black', hasMoved: false }
    : { id: 'b_b_c8', type: 'bishop', color: 'black', hasMoved: false };
  board[7][3] = isCrafted
    ? { id: 'b_sr_d8', type: 'supremeRook', color: 'black', hasMoved: false }
    : { id: 'b_r_d8', type: 'rook', color: 'black', hasMoved: false };
  board[7][4] = { id: 'b_k_e8', type: 'king', color: 'black', hasMoved: false };
  board[7][5] = isCrafted
    ? { id: 'b_c_f8', type: 'communist', color: 'black', hasMoved: false }
    : { id: 'b_b_f8', type: 'bishop', color: 'black', hasMoved: false };
  board[7][6] = isCrafted
    ? { id: 'b_pr_g8', type: 'priest', color: 'black', hasMoved: false }
    : { id: 'b_n_g8', type: 'knight', color: 'black', hasMoved: false };
  board[7][7] = { id: 'b_q_h8', type: 'queen', color: 'black', hasMoved: false };

  return board;
}

export function isInsideBoard(
  x: number,
  y: number,
  boardOrWidth?: (Piece | null)[][] | number,
  maybeHeight?: number
): boolean {
  let width = 8;
  let height = 8;
  if (Array.isArray(boardOrWidth)) {
    height = boardOrWidth.length;
    width = boardOrWidth[0]?.length ?? 8;
  } else if (typeof boardOrWidth === 'number') {
    width = boardOrWidth;
    height = typeof maybeHeight === 'number' ? maybeHeight : boardOrWidth;
  }
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function getFileLetter(fileIndex: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + fileIndex);
}

export function posToNotation(pos: Position): string {
  return `${getFileLetter(pos.x)}${pos.y + 1}`;
}

export function notationToPos(str: string, width = 8, height = 8): Position | null {
  if (str.length < 2) return null;
  const fileChar = str[0].toLowerCase();
  const rankStr = str.slice(1);
  const x = fileChar.charCodeAt(0) - 'a'.charCodeAt(0);
  const y = parseInt(rankStr, 10) - 1;
  if (x >= 0 && x < width && y >= 0 && y < height) {
    return { x, y };
  }
  return null;
}

/**
 * Counts the remaining pieces for a given color
 */
export function countRemainingPieces(board: (Piece | null)[][], color: PieceColor): number {
  let count = 0;
  const height = board.length;
  const width = board[0]?.length ?? 8;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const piece = board[y][x];
      if (piece && piece.color === color) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Generates an authoritative dice roll result based on piece count
 */
export function rollAuthoritativeDice(
  board: (Piece | null)[][],
  turn: PieceColor,
  forcedValue?: number
): DiceState {
  const piecesRemaining = countRemainingPieces(board, turn);
  const isBiased = piecesRemaining < LATE_GAME_PIECE_THRESHOLD;

  let rolledValue: number;

  if (forcedValue && forcedValue >= 1 && forcedValue <= 6) {
    rolledValue = forcedValue;
  } else if (!isBiased) {
    rolledValue = Math.floor(Math.random() * 6) + 1;
  } else {
    // Biased distribution
    const r = Math.random();
    let accumulated = 0;
    rolledValue = 6;
    for (const [valStr, weight] of Object.entries(BIASED_DICE_WEIGHTS)) {
      accumulated += weight;
      if (r <= accumulated) {
        rolledValue = parseInt(valStr, 10);
        break;
      }
    }
  }

  const category = rolledValue <= 3 ? 'inexpensive' : 'expensive';
  const eligiblePieceTypes = category === 'inexpensive' ? INEXPENSIVE_PIECES : EXPENSIVE_PIECES;

  return {
    rolledValue,
    category,
    eligiblePieceTypes,
    isFallbackAnyPiece: false,
    isConsumed: false,
    probabilityMode: isBiased ? 'biased_late_game' : 'uniform',
    rolledAt: Date.now(),
  };
}

/**
 * Clones a board state deeply
 */
export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) =>
    row.map((piece) => (piece ? { ...piece } : null))
  );
}

/**
 * Find King position for color
 */
export function findKingPosition(
  board: (Piece | null)[][],
  color: PieceColor
): Position | null {
  const height = board.length;
  const width = board[0]?.length ?? 8;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const piece = board[y][x];
      if (piece && piece.color === color && piece.type === 'king') {
        return { x, y };
      }
    }
  }
  return null;
}

/**
 * Computes pseudo-legal moves for a piece without king-safety checks
 */
export function getPseudoLegalMoves(
  board: (Piece | null)[][],
  from: Position
): Move[] {
  const piece = board[from.y][from.x];
  if (!piece) return [];

  const moves: Move[] = [];
  const color = piece.color;
  const enemyColor: PieceColor = color === 'white' ? 'black' : 'white';
  const boardHeight = board.length;
  const boardWidth = board[0].length;

  const addMove = (
    to: Position,
    extra: { isSpecialPrinceMove?: boolean; isPromotion?: boolean } = {}
  ) => {
    if (!isInsideBoard(to.x, to.y, boardWidth, boardHeight)) return;
    const destPiece = board[to.y][to.x];
    if (destPiece && destPiece.color === color) return; // Cannot capture own piece

    moves.push({
      from,
      to,
      piece: { ...piece },
      captured: destPiece ? { ...destPiece } : undefined,
      isSpecialPrinceMove: extra.isSpecialPrinceMove,
      isPromotion: extra.isPromotion,
      timestamp: Date.now(),
    });
  };

  // PAWN
  if (piece.type === 'pawn') {
    const forward = color === 'white' ? 1 : -1;
    const startRank = color === 'white' ? 1 : boardHeight - 2;
    const promoRank = color === 'white' ? boardHeight - 1 : 0;

    // 1 square forward
    const nextY = from.y + forward;
    if (isInsideBoard(from.x, nextY, boardWidth, boardHeight) && !board[nextY][from.x]) {
      addMove({ x: from.x, y: nextY }, { isPromotion: nextY === promoRank });

      // 2 squares forward from start rank
      const doubleY = from.y + 2 * forward;
      if (from.y === startRank && isInsideBoard(from.x, doubleY, boardWidth, boardHeight) && !board[doubleY][from.x]) {
        addMove({ x: from.x, y: doubleY });
      }
    }

    // Diagonals captures
    const captureOffsets = [-1, 1];
    for (const dx of captureOffsets) {
      const capX = from.x + dx;
      const capY = from.y + forward;
      if (isInsideBoard(capX, capY, boardWidth, boardHeight)) {
        const destPiece = board[capY][capX];
        if (destPiece && destPiece.color === enemyColor) {
          addMove({ x: capX, y: capY }, { isPromotion: capY === promoRank });
        }
      }
    }
  }

  // KNIGHT
  if (piece.type === 'knight') {
    const knightOffsets = [
      { dx: 1, dy: 2 },
      { dx: 2, dy: 1 },
      { dx: 2, dy: -1 },
      { dx: 1, dy: -2 },
      { dx: -1, dy: -2 },
      { dx: -2, dy: -1 },
      { dx: -2, dy: 1 },
      { dx: -1, dy: 2 },
    ];
    for (const off of knightOffsets) {
      addMove({ x: from.x + off.dx, y: from.y + off.dy });
    }
  }

  // BISHOP
  if (piece.type === 'bishop' || piece.type === 'queen') {
    const diagDirs = [
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 },
    ];
    for (const dir of diagDirs) {
      let step = 1;
      while (true) {
        const toX = from.x + dir.dx * step;
        const toY = from.y + dir.dy * step;
        if (!isInsideBoard(toX, toY, boardWidth, boardHeight)) break;
        const destPiece = board[toY][toX];
        if (!destPiece) {
          addMove({ x: toX, y: toY });
        } else {
          if (destPiece.color === enemyColor) {
            addMove({ x: toX, y: toY });
          }
          break; // Blocked
        }
        step++;
      }
    }
  }

  // ROOK
  if (piece.type === 'rook' || piece.type === 'queen') {
    const orthDirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];
    for (const dir of orthDirs) {
      let step = 1;
      while (true) {
        const toX = from.x + dir.dx * step;
        const toY = from.y + dir.dy * step;
        if (!isInsideBoard(toX, toY, boardWidth, boardHeight)) break;
        const destPiece = board[toY][toX];
        if (!destPiece) {
          addMove({ x: toX, y: toY });
        } else {
          if (destPiece.color === enemyColor) {
            addMove({ x: toX, y: toY });
          }
          break; // Blocked
        }
        step++;
      }
    }
  }

  // KING
  if (piece.type === 'king') {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        addMove({ x: from.x + dx, y: from.y + dy });
      }
    }
  }

  // PRINCE (Existing logic untouched)
  if (piece.type === 'prince') {
    // 1. Knight movement (standard 2x1 leap)
    const knightOffsets = [
      { dx: 1, dy: 2 },
      { dx: 2, dy: 1 },
      { dx: 2, dy: -1 },
      { dx: 1, dy: -2 },
      { dx: -1, dy: -2 },
      { dx: -2, dy: -1 },
      { dx: -2, dy: 1 },
      { dx: -1, dy: 2 },
    ];
    for (const off of knightOffsets) {
      addMove({ x: from.x + off.dx, y: from.y + off.dy });
    }

    // 2. Bounded diagonal movement (1, 2, 3, or 4 squares unobstructed diagonal)
    const diagDirs = [
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 },
    ];
    for (const dir of diagDirs) {
      for (let dist = 1; dist <= 4; dist++) {
        const toX = from.x + dir.dx * dist;
        const toY = from.y + dir.dy * dist;
        if (!isInsideBoard(toX, toY, boardWidth, boardHeight)) break;
        const destPiece = board[toY][toX];
        if (!destPiece) {
          addMove({ x: toX, y: toY });
        } else {
          if (destPiece.color === enemyColor) {
            addMove({ x: toX, y: toY });
          }
          break; // Blocked by any piece
        }
      }
    }

    // 3. Extended 3x1 knight jump on first move only
    if (!piece.princeSpecialUsed && !piece.hasMoved) {
      const extendedKnightOffsets = [
        { dx: 1, dy: 3 },
        { dx: 3, dy: 1 },
        { dx: 3, dy: -1 },
        { dx: 1, dy: -3 },
        { dx: -1, dy: -3 },
        { dx: -3, dy: -1 },
        { dx: -3, dy: 1 },
        { dx: -1, dy: 3 },
      ];
      for (const off of extendedKnightOffsets) {
        addMove(
          { x: from.x + off.dx, y: from.y + off.dy },
          { isSpecialPrinceMove: true }
        );
      }
    }
  }

  // COMMUNIST: Zigzag along 4 orthogonal lines (destinations at +-2, +-4).
  // Legal if at least ONE of the two zigzag phases has all its intermediate squares empty.
  if (piece.type === 'communist') {
    const paths = CRAFTABLE_MAP.communist?.movement?.paths ?? [];
    const addedTo = new Set<string>();
    for (const path of paths) {
      let pathClear = true;
      for (const v of path.via) {
        const vx = from.x + v.dx;
        const vy = from.y + v.dy;
        if (!isInsideBoard(vx, vy, boardWidth, boardHeight) || board[vy][vx] !== null) {
          pathClear = false;
          break;
        }
      }
      if (pathClear) {
        const tx = from.x + path.to.dx;
        const ty = from.y + path.to.dy;
        const destKey = `${tx},${ty}`;
        if (!addedTo.has(destKey)) {
          addMove({ x: tx, y: ty });
          addedTo.add(destKey);
        }
      }
    }
  }

  // SUPREME ROOK: Unlimited orthogonal slides AND diagonal leaps of distance 2
  if (piece.type === 'supremeRook') {
    const orthDirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];
    for (const dir of orthDirs) {
      let step = 1;
      while (true) {
        const toX = from.x + dir.dx * step;
        const toY = from.y + dir.dy * step;
        if (!isInsideBoard(toX, toY, boardWidth, boardHeight)) break;
        const destPiece = board[toY][toX];
        if (!destPiece) {
          addMove({ x: toX, y: toY });
        } else {
          if (destPiece.color === enemyColor) {
            addMove({ x: toX, y: toY });
          }
          break;
        }
        step++;
      }
    }
    const diagLeaps = [
      { dx: 2, dy: 2 },
      { dx: 2, dy: -2 },
      { dx: -2, dy: 2 },
      { dx: -2, dy: -2 },
    ];
    for (const leap of diagLeaps) {
      addMove({ x: from.x + leap.dx, y: from.y + leap.dy });
    }
  }

  // PRIEST: Slides 1-3 squares diagonally AND leaps 2 squares orthogonally
  if (piece.type === 'priest') {
    const diagDirs = [
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 },
    ];
    for (const dir of diagDirs) {
      for (let step = 1; step <= 3; step++) {
        const toX = from.x + dir.dx * step;
        const toY = from.y + dir.dy * step;
        if (!isInsideBoard(toX, toY, boardWidth, boardHeight)) break;
        const destPiece = board[toY][toX];
        if (!destPiece) {
          addMove({ x: toX, y: toY });
        } else {
          if (destPiece.color === enemyColor) {
            addMove({ x: toX, y: toY });
          }
          break;
        }
      }
    }
    const orthLeaps = [
      { dx: 0, dy: 2 },
      { dx: 0, dy: -2 },
      { dx: 2, dy: 0 },
      { dx: -2, dy: 0 },
    ];
    for (const leap of orthLeaps) {
      addMove({ x: from.x + leap.dx, y: from.y + leap.dy });
    }
  }

  return moves;
}

/**
 * Checks if the King of given color is currently in check
 */
export function isKingInCheck(
  board: (Piece | null)[][],
  color: PieceColor
): boolean {
  const kingPos = findKingPosition(board, color);
  if (!kingPos) return false;

  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';
  const boardHeight = board.length;
  const boardWidth = board[0].length;

  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (piece && piece.color === opponentColor) {
        const enemyMoves = getPseudoLegalMoves(board, { x, y });
        for (const m of enemyMoves) {
          if (m.to.x === kingPos.x && m.to.y === kingPos.y) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Computes all grids directly involved in delivering checkmate:
 * 1. The checkmated King's square
 * 2. The square(s) of any piece(s) delivering checkmate
 * 3. Any intermediate ray squares between sliding attackers and the checkmated King
 */
export function getCheckmateGrids(
  board: (Piece | null)[][],
  matedColor: PieceColor
): Position[] {
  const kingPos = findKingPosition(board, matedColor);
  if (!kingPos) return [];

  const grids: Position[] = [{ ...kingPos }];
  const enemyColor: PieceColor = matedColor === 'white' ? 'black' : 'white';
  const boardHeight = board.length;
  const boardWidth = board[0].length;

  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (piece && piece.color === enemyColor) {
        const enemyMoves = getPseudoLegalMoves(board, { x, y });
        const attacksKing = enemyMoves.some(
          (m) => m.to.x === kingPos.x && m.to.y === kingPos.y
        );

        if (attacksKing) {
          grids.push({ x, y });

          // If sliding piece, add line of attack squares towards king
          const dx = Math.sign(kingPos.x - x);
          const dy = Math.sign(kingPos.y - y);
          const isOrth = (x === kingPos.x && y !== kingPos.y) || (y === kingPos.y && x !== kingPos.x);
          const isDiag = Math.abs(kingPos.x - x) === Math.abs(kingPos.y - y);

          if (
            (isOrth || isDiag) &&
            (piece.type === 'queen' ||
              piece.type === 'rook' ||
              piece.type === 'bishop' ||
              piece.type === 'supremeRook' ||
              piece.type === 'priest' ||
              piece.type === 'prince')
          ) {
            let cx = x + dx;
            let cy = y + dy;
            while (cx !== kingPos.x || cy !== kingPos.y) {
              if (isInsideBoard(cx, cy, boardWidth, boardHeight)) {
                grids.push({ x: cx, y: cy });
              }
              cx += dx;
              cy += dy;
            }
          }
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return grids.filter((p) => {
    const key = `${p.x},${p.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Applies a move to a cloned board
 */
export function applyMoveToBoard(
  board: (Piece | null)[][],
  move: Move
): (Piece | null)[][] {
  const newBoard = cloneBoard(board);
  const movingPiece = { ...newBoard[move.from.y][move.from.x]! };

  movingPiece.hasMoved = true;
  if (move.isSpecialPrinceMove) {
    movingPiece.princeSpecialUsed = true;
  }

  // Pawn promotion to Queen at far edge
  const promoRank = movingPiece.color === 'white' ? newBoard.length - 1 : 0;
  if (move.isPromotion || (movingPiece.type === 'pawn' && move.to.y === promoRank)) {
    movingPiece.type = 'queen';
  }

  newBoard[move.from.y][move.from.x] = null;
  newBoard[move.to.y][move.to.x] = movingPiece;

  return newBoard;
}

/**
 * Computes strictly legal moves for a piece (excluding moves that leave King in check)
 */
export function getLegalMovesForSquare(
  board: (Piece | null)[][],
  from: Position
): Move[] {
  const piece = board[from.y][from.x];
  if (!piece) return [];

  const pseudoMoves = getPseudoLegalMoves(board, from);
  const legalMoves: Move[] = [];

  for (const move of pseudoMoves) {
    const nextBoard = applyMoveToBoard(board, move);
    if (!isKingInCheck(nextBoard, piece.color)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

/**
 * Returns all strictly legal moves for all pieces of a color
 */
export function getAllLegalMoves(
  board: (Piece | null)[][],
  color: PieceColor
): Move[] {
  const moves: Move[] = [];
  const boardHeight = board.length;
  const boardWidth = board[0].length;
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (piece && piece.color === color) {
        moves.push(...getLegalMovesForSquare(board, { x, y }));
      }
    }
  }
  return moves;
}

/**
 * Evaluates dice eligibility and handles check defense & user's fallback rule:
 * 1. If currently in check: bypass dice entirely and allow any legal check-resolving move.
 * 2. If not in check: check rolled category eligibility.
 * 3. Fallback: If 0 legal moves exist for rolled category, unlock all valid moves.
 */
export function getDiceEligibleMoves(
  board: (Piece | null)[][],
  turn: PieceColor,
  dice: DiceState | null,
  inCheck?: PieceColor | null
): {
  eligibleMoves: Move[];
  isFallback: boolean;
  isCheckDefense: boolean;
  eligiblePieceTypes: PieceType[];
} {
  const allMoves = getAllLegalMoves(board, turn);
  const allPieceTypes: PieceType[] = [
    'pawn',
    'knight',
    'bishop',
    'rook',
    'queen',
    'king',
    'prince',
    'communist',
    'supremeRook',
    'priest',
  ];

  // Fallacy fix: When in check, player can move King or any piece to escape check without dice roll!
  if (inCheck === turn) {
    return {
      eligibleMoves: allMoves,
      isFallback: false,
      isCheckDefense: true,
      eligiblePieceTypes: allPieceTypes,
    };
  }

  if (!dice) {
    return { eligibleMoves: [], isFallback: false, isCheckDefense: false, eligiblePieceTypes: [] };
  }

  // Filter moves to only pieces matching dice's eligible piece types
  const categoryMoves = allMoves.filter((m) =>
    dice.eligiblePieceTypes.includes(m.piece.type)
  );

  if (categoryMoves.length > 0) {
    return {
      eligibleMoves: categoryMoves,
      isFallback: false,
      isCheckDefense: false,
      eligiblePieceTypes: dice.eligiblePieceTypes,
    };
  }

  // Fallback: If 0 legal moves exist for rolled category, unlock ALL valid moves for this player!
  return {
    eligibleMoves: allMoves,
    isFallback: true,
    isCheckDefense: false,
    eligiblePieceTypes: allPieceTypes,
  };
}

/**
 * Executes a committed move and updates authoritative match state
 */
export function executeMove(
  currentState: MatchState,
  from: Position,
  to: Position
): { success: boolean; state: MatchState; error?: string } {
  if (currentState.status !== 'active') {
    return { success: false, state: currentState, error: 'Match is not active.' };
  }

  const isDiceActive = currentState.diceActive ?? true;
  const isPlayerInCheck = currentState.inCheck === currentState.turn;

  // Dice roll is required ONLY if dice are active AND NOT in check!
  if (isDiceActive && !isPlayerInCheck && (!currentState.dice || currentState.dice.isConsumed)) {
    return { success: false, state: currentState, error: 'Must roll dice before moving.' };
  }

  // If dice are disabled (normal chess after 3 captures) or player in check, all legal moves are eligible
  const eligibleMoves = (!isDiceActive || isPlayerInCheck)
    ? getAllLegalMoves(currentState.board, currentState.turn)
    : getDiceEligibleMoves(
        currentState.board,
        currentState.turn,
        currentState.dice,
        currentState.inCheck
      ).eligibleMoves;

  const matchedMove = eligibleMoves.find(
    (m) =>
      m.from.x === from.x &&
      m.from.y === from.y &&
      m.to.x === to.x &&
      m.to.y === to.y
  );

  if (!matchedMove) {
    return {
      success: false,
      state: currentState,
      error: isPlayerInCheck
        ? 'Illegal move: you must get out of check.'
        : !isDiceActive
        ? 'Illegal move.'
        : 'Illegal move for current dice roll.',
    };
  }

  const piece = currentState.board[from.y][from.x]!;
  const newBoard = applyMoveToBoard(currentState.board, matchedMove);

  // Check captured piece
  const capturedPiece = currentState.board[to.y][to.x];
  const capturedByWhite = [...currentState.capturedByWhite];
  const capturedByBlack = [...currentState.capturedByBlack];
  let totalCaptures = currentState.totalCaptures ?? (currentState.capturedByWhite.length + currentState.capturedByBlack.length);

  const lostPieces = {
    white: currentState.lostPieces?.white ?? currentState.capturedByBlack.length,
    black: currentState.lostPieces?.black ?? currentState.capturedByWhite.length,
  };
  const lostExpensive = {
    white: currentState.lostExpensive?.white ?? currentState.capturedByBlack.filter((p) => CRAFTING_ELIGIBLE_EXPENSIVE_TYPES.includes(p.type)).length,
    black: currentState.lostExpensive?.black ?? currentState.capturedByWhite.filter((p) => CRAFTING_ELIGIBLE_EXPENSIVE_TYPES.includes(p.type)).length,
  };
  const expansionUsed = {
    white: Boolean(currentState.expansionUsed?.white),
    black: Boolean(currentState.expansionUsed?.black),
  };
  const expansionPending = {
    white: Boolean(currentState.expansionPending?.white),
    black: Boolean(currentState.expansionPending?.black),
  };
  const craftingUsed = {
    white: Boolean(currentState.craftingUsed?.white),
    black: Boolean(currentState.craftingUsed?.black),
  };
  const craftingPending = {
    white: Boolean(currentState.craftingPending?.white),
    black: Boolean(currentState.craftingPending?.black),
  };
  const craftingLocked = {
    white: Boolean(currentState.craftingLocked?.white),
    black: Boolean(currentState.craftingLocked?.black),
  };

  let victimColor: PieceColor | null = null;

  if (capturedPiece) {
    victimColor = capturedPiece.color;
    if (currentState.turn === 'white') {
      capturedByWhite.push(capturedPiece);
    } else {
      capturedByBlack.push(capturedPiece);
    }
    totalCaptures += 1;

    // O(1) capture counter increments inside capture code
    lostPieces[victimColor] += 1;
    if (CRAFTING_ELIGIBLE_EXPENSIVE_TYPES.includes(capturedPiece.type)) {
      lostExpensive[victimColor] += 1;
    }
  }

  // EDIT 2: Dice vanish after 3 captures. Permanently disabled for this match.
  const nextDiceActive = isDiceActive && totalCaptures < 3;

  // Check Two-Pawn End Rank Draw condition
  let whitePawnsEndRank = currentState.whitePawnsReachedEndRank;
  let blackPawnsEndRank = currentState.blackPawnsReachedEndRank;

  if (piece.type === 'pawn') {
    if (currentState.turn === 'white' && to.y === (newBoard.length - 1)) {
      whitePawnsEndRank += 1;
    } else if (currentState.turn === 'black' && to.y === 0) {
      blackPawnsEndRank += 1;
    }
  }

  const nextTurn: PieceColor = currentState.turn === 'white' ? 'black' : 'white';
  const nextInCheck = isKingInCheck(newBoard, nextTurn) ? nextTurn : null;

  // Evaluate game end conditions:
  // User confirmed precedence: Checkmate victory takes priority over two-pawn end rank draw!
  let result: MatchResult | null = null;
  let nextStatus: MatchStatus = currentState.status;

  const opponentAllMoves = getAllLegalMoves(newBoard, nextTurn);
  const isOpponentCheckmate = opponentAllMoves.length === 0 && nextInCheck !== null;
  const isOpponentStalemate = opponentAllMoves.length === 0 && nextInCheck === null;

  if (isOpponentCheckmate) {
    // 1. Checkmate takes top priority!
    result = {
      winner: currentState.turn,
      reason: 'checkmate',
      winnerUserId:
        currentState.turn === 'white'
          ? currentState.whitePlayer.userId
          : currentState.blackPlayer.userId,
      completedAt: Date.now(),
    };
    nextStatus = 'completed';
  } else if (whitePawnsEndRank >= 2 || blackPawnsEndRank >= 2) {
    // 2. Two-Pawn Draw takes priority over normal play
    result = {
      winner: 'draw',
      reason: 'two_pawns_end_rank_draw',
      completedAt: Date.now(),
    };
    nextStatus = 'completed';
  } else if (isOpponentStalemate) {
    // 3. Stalemate
    result = {
      winner: 'draw',
      reason: 'stalemate',
      completedAt: Date.now(),
    };
    nextStatus = 'completed';
  }

  // Check triggers only if match has not ended
  let pausedForAction = currentState.pausedForAction ?? null;
  if (nextStatus !== 'completed' && victimColor) {
    // Check Board Expansion Trigger: 7th lost piece
    if (
      lostPieces[victimColor] >= EXPANSION_LOST_PIECES_THRESHOLD &&
      !expansionUsed[victimColor] &&
      !expansionPending[victimColor]
    ) {
      expansionPending[victimColor] = true;
    }

    // Check Crafting Trigger: 2nd expensive lost piece (if crafting is allowed in this match)
    const isCraftingAllowed = currentState.craftingAllowed !== false;
    if (
      isCraftingAllowed &&
      !craftingUsed[victimColor] &&
      lostExpensive[victimColor] >= CRAFTING_LOST_EXPENSIVE_THRESHOLD &&
      !craftingPending[victimColor]
    ) {
      craftingPending[victimColor] = true;
      // PART B: If victim is placed in check simultaneously, lock crafting until check is resolved!
      if (nextInCheck === victimColor) {
        craftingLocked[victimColor] = true;
      }
    }

    // Precedence rule: If both triggered, Board expansion prompt first, followed by crafting
    if (expansionPending[victimColor]) {
      pausedForAction = {
        type: 'expansion',
        player: victimColor,
        expiresAt: Date.now() + EXPANSION_AUTO_PICK_TIMEOUT_MS,
      };
    } else if (craftingPending[victimColor]) {
      // Only open crafting prompt immediately if player is NOT in check
      if (!craftingLocked[victimColor]) {
        pausedForAction = {
          type: 'crafting',
          player: victimColor,
          expiresAt: Date.now() + CRAFTING_AUTO_PICK_TIMEOUT_MS,
        };
      }
    }
  }

  // PART B: Check Resolution: If moving player had a locked craft and is now safely out of check
  if (
    currentState.craftingAllowed !== false &&
    craftingLocked[currentState.turn] &&
    nextStatus !== 'completed' &&
    !isKingInCheck(newBoard, currentState.turn)
  ) {
    craftingLocked[currentState.turn] = false;
    pausedForAction = {
      type: 'crafting',
      player: currentState.turn,
      expiresAt: Date.now() + CRAFTING_AUTO_PICK_TIMEOUT_MS,
    };
  }

  const recordedMove: Move = {
    ...matchedMove,
    san: `${piece.type[0].toUpperCase()}${posToNotation(from)}→${posToNotation(to)}`,
    timestamp: Date.now(),
  };

  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - (currentState.lastTurnStartTime || now)) / 1000);
  let whiteTimeRemaining = currentState.whiteTimeRemaining ?? currentState.timeControl ?? 300;
  let blackTimeRemaining = currentState.blackTimeRemaining ?? currentState.timeControl ?? 300;

  if (currentState.turn === 'white') {
    whiteTimeRemaining = Math.max(0, whiteTimeRemaining - elapsedSeconds);
  } else {
    blackTimeRemaining = Math.max(0, blackTimeRemaining - elapsedSeconds);
  }

  const updatedState: MatchState = {
    ...currentState,
    board: newBoard,
    boardWidth: newBoard[0].length,
    boardHeight: newBoard.length,
    turn: nextStatus === 'completed' ? currentState.turn : nextTurn,
    status: nextStatus,
    dice: null, // Clear dice roll for next turn
    whitePawnsReachedEndRank: whitePawnsEndRank,
    blackPawnsReachedEndRank: blackPawnsEndRank,
    capturedByWhite,
    capturedByBlack,
    totalCaptures,
    lostPieces,
    lostExpensive,
    expansionUsed,
    expansionPending,
    craftingUsed,
    craftingPending,
    craftingLocked,
    pausedForAction,
    diceActive: nextDiceActive,
    moveSuggestions: currentState.moveSuggestions ?? 'included',
    moveHistory: [...currentState.moveHistory, recordedMove],
    inCheck: nextInCheck,
    result,
    whiteTimeRemaining,
    blackTimeRemaining,
    lastTurnStartTime: now,
    updatedAt: now,
  };

  return { success: true, state: updatedState };
}

/**
 * Resign match
 */
export function resignMatch(
  currentState: MatchState,
  resigningUserId: string
): MatchState {
  if (currentState.status !== 'active') return currentState;

  const isWhite = currentState.whitePlayer.userId === resigningUserId;
  const isBlack = currentState.blackPlayer.userId === resigningUserId;
  if (!isWhite && !isBlack) return currentState;

  const winner: PieceColor = isWhite ? 'black' : 'white';
  const winnerUserId = isWhite ? currentState.blackPlayer.userId : currentState.whitePlayer.userId;

  return {
    ...currentState,
    status: 'completed',
    result: {
      winner,
      reason: 'resignation',
      winnerUserId,
      completedAt: Date.now(),
      explanation: `${isWhite ? 'White' : 'Black'} resigned.`,
    },
    updatedAt: Date.now(),
  };
}

/**
 * Count active pieces remaining on board for each player
 */
export function countBoardPieces(board: (Piece | null)[][]): { white: number; black: number } {
  let white = 0;
  let black = 0;
  const height = board.length;
  const width = board[0].length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const piece = board[y][x];
      if (piece) {
        if (piece.color === 'white') white++;
        else if (piece.color === 'black') black++;
      }
    }
  }
  return { white, black };
}

/**
 * Handle player timer expiration with custom piece-difference rule:
 * - Bot matches:
 *    - If Human timer expires: Human wins ONLY if leading by at least 3 pieces (lead >= 3; 2 is not).
 *      Otherwise Bot wins.
 *    - If Bot timer expires: Human wins.
 * - Multiplayer matches:
 *    - If piece difference > 7: player with MORE pieces is declared winner regardless of whose timer ran out!
 *    - If piece difference <= 7: player whose timer ran out loses automatically.
 */
export function handleTimeout(
  currentState: MatchState,
  timedOutColor: PieceColor,
  isBotMatch?: boolean
): MatchState {
  if (currentState.status !== 'active') return currentState;

  const isBot = Boolean(
    isBotMatch ??
    (currentState.whitePlayer.userId === 'usr_bot_gm' || currentState.blackPlayer.userId === 'usr_bot_gm')
  );

  const counts = countBoardPieces(currentState.board);

  let winner: PieceColor;
  let reason: GameEndReason;
  let explanation: string;

  if (isBot) {
    const humanColor: PieceColor =
      currentState.whitePlayer.userId === 'usr_bot_gm' ? 'black' : 'white';
    const botColor: PieceColor = humanColor === 'white' ? 'black' : 'white';

    const humanPieces = counts[humanColor];
    const botPieces = counts[botColor];
    const lead = humanPieces - botPieces;

    if (timedOutColor === humanColor) {
      // Human timer expired:
      // Greater than or equal to 3 means >= 3; 2 is not!
      if (lead >= 3) {
        winner = humanColor;
        reason = 'timeout_piece_advantage';
        explanation = `Timer expired for Human (${humanColor}), but Human has ${humanPieces} pieces vs Bot's ${botPieces} (lead of ${lead} >= 3). Human wins by piece advantage!`;
      } else {
        winner = botColor;
        reason = 'timeout';
        explanation = `Timer expired for Human (${humanColor}). Human has ${humanPieces} pieces vs Bot's ${botPieces} (lead of ${lead} < 3, required >= 3). Bot wins on time!`;
      }
    } else {
      // Bot timer expired:
      winner = humanColor;
      reason = 'timeout';
      explanation = `Timer expired for Bot (${botColor}). Human (${humanColor}) wins on time!`;
    }
  } else {
    const diff = Math.abs(counts.white - counts.black);
    if (diff > 7) {
      // When piece difference is strictly more than 7, player with more pieces is declared the winner!
      winner = counts.white > counts.black ? 'white' : 'black';
      const leaderCount = counts[winner];
      const trailerCount = counts[winner === 'white' ? 'black' : 'white'];
      reason = 'timeout_piece_advantage';
      explanation = `Timer expired for ${timedOutColor}, but piece difference is ${diff} (> 7). ${
        winner === 'white' ? 'White' : 'Black'
      } has ${leaderCount} pieces vs ${trailerCount} and wins by overwhelming piece advantage!`;
    } else {
      // Difference is <= 7: player whose timer ran out loses automatically
      winner = timedOutColor === 'white' ? 'black' : 'white';
      reason = 'timeout';
      explanation = `Timer expired for ${timedOutColor}. Piece difference is ${diff} (<= 7). ${
        winner === 'white' ? 'White' : 'Black'
      } wins on time!`;
    }
  }

  const winnerUserId =
    winner === 'white'
      ? currentState.whitePlayer.userId
      : currentState.blackPlayer.userId;

  return {
    ...currentState,
    status: 'completed',
    whiteTimeRemaining: timedOutColor === 'white' ? 0 : currentState.whiteTimeRemaining,
    blackTimeRemaining: timedOutColor === 'black' ? 0 : currentState.blackTimeRemaining,
    result: {
      winner,
      reason,
      winnerUserId,
      completedAt: Date.now(),
      explanation,
    },
    updatedAt: Date.now(),
  };
}

/**
 * MECHANIC 1: Expand board state by 1 row or column
 * Big-O: O(W * H) - Allocates new 2D array and copies piece references. Fired at most once per player.
 */
export function expandBoard(
  board: (Piece | null)[][],
  side: ExpansionSide
): (Piece | null)[][] {
  const currentHeight = board.length;
  const currentWidth = board[0].length;

  if (side === 'top') {
    const newRow: (Piece | null)[] = Array(currentWidth).fill(null);
    return [...cloneBoard(board), newRow];
  } else if (side === 'bottom') {
    const newRow: (Piece | null)[] = Array(currentWidth).fill(null);
    return [newRow, ...cloneBoard(board)];
  } else if (side === 'left') {
    return board.map((row) => [null, ...row.map((p) => (p ? { ...p } : null))]);
  } else if (side === 'right') {
    return board.map((row) => [...row.map((p) => (p ? { ...p } : null)), null]);
  }
  return cloneBoard(board);
}

/**
 * Checks if a square is attacked by any piece of the specified attacker color.
 * Big-O: O(K * attackers) - checks pseudo-legal moves of pieces of byColor.
 */
export function isSquareAttacked(
  board: (Piece | null)[][],
  pos: Position,
  byColor: PieceColor
): boolean {
  const height = board.length;
  const width = board[0].length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const piece = board[y][x];
      if (piece && piece.color === byColor) {
        const moves = getPseudoLegalMoves(board, { x, y });
        for (const m of moves) {
          if (m.to.x === pos.x && m.to.y === pos.y) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * MECHANIC 2: Computes valid candidate placement squares in the player's 2-row home zone.
 * Big-O: O(K * attackers) - computes once when modal opens for candidate home squares.
 */
export function getCandidateCraftingSquares(
  board: (Piece | null)[][],
  player: PieceColor,
  pieceType: PieceType = 'communist'
): { validSquares: Position[]; attackedSquares: Position[] } {
  const height = board.length;
  const width = board[0].length;
  const enemyColor: PieceColor = player === 'white' ? 'black' : 'white';

  // Home zone: 2 rows nearest player's own edge
  const homeRows = player === 'white' ? [0, 1] : [height - 2, height - 1];
  const validSquares: Position[] = [];
  const attackedSquares: Position[] = [];

  for (const y of homeRows) {
    for (let x = 0; x < width; x++) {
      const pos: Position = { x, y };
      if (board[y][x] !== null) continue; // 1. Must be empty

      // 2. Must not be attacked by enemy piece
      const isAttacked = isSquareAttacked(board, pos, enemyColor);
      if (isAttacked) {
        attackedSquares.push(pos);
        continue;
      }

      // 3. Placing must not leave player's own King in check
      const tempBoard = cloneBoard(board);
      tempBoard[y][x] = {
        id: `craft_${player}_${pieceType}_temp`,
        type: pieceType,
        color: player,
        hasMoved: false,
      };

      if (isKingInCheck(tempBoard, player)) {
        continue;
      }

      // 4. Must not give check to the enemy King upon placement ("It cannot be check just at once")
      if (isKingInCheck(tempBoard, enemyColor)) {
        continue;
      }

      validSquares.push(pos);
    }
  }

  return { validSquares, attackedSquares };
}

/**
 * Server-authoritative validator for craft placement.
 * Big-O: O(1) + O(K * attackers)
 */
export function validateCraftPlacement(
  board: (Piece | null)[][],
  player: PieceColor,
  pieceType: PieceType,
  pos: Position
): { valid: boolean; error?: string } {
  const height = board.length;
  const width = board[0].length;
  if (!isInsideBoard(pos.x, pos.y, width, height)) {
    return { valid: false, error: 'Square is outside board bounds.' };
  }
  if (board[pos.y][pos.x] !== null) {
    return { valid: false, error: 'Placement square must be empty.' };
  }

  const homeRows = player === 'white' ? [0, 1] : [height - 2, height - 1];
  if (!homeRows.includes(pos.y)) {
    return { valid: false, error: 'Must be placed in your home zone (2 closest rows).' };
  }

  const enemyColor: PieceColor = player === 'white' ? 'black' : 'white';
  if (isSquareAttacked(board, pos, enemyColor)) {
    return { valid: false, error: 'Square is attacked by an enemy piece.' };
  }

  const tempBoard = cloneBoard(board);
  tempBoard[pos.y][pos.x] = {
    id: `craft_${player}_${pieceType}_temp`,
    type: pieceType,
    color: player,
    hasMoved: false,
  };

  if (isKingInCheck(tempBoard, player)) {
    return { valid: false, error: 'Placing here would leave your King in check.' };
  }

  if (isKingInCheck(tempBoard, enemyColor)) {
    return { valid: false, error: 'Cannot place a crafted piece that immediately gives check to the enemy King.' };
  }

  return { valid: true };
}

/**
 * Applies board expansion to match state.
 * Big-O: O(W * H)
 */
export function applyBoardExpansion(
  currentState: MatchState,
  player: PieceColor,
  side: ExpansionSide
): MatchState {
  if (currentState.status !== 'active') return currentState;
  if (currentState.expansionUsed?.[player]) return currentState;

  const newBoard = expandBoard(currentState.board, side);
  const newWidth = newBoard[0].length;
  const newHeight = newBoard.length;

  const expansionUsed = {
    white: currentState.expansionUsed?.white ?? false,
    black: currentState.expansionUsed?.black ?? false,
    [player]: true,
  };
  const expansionPending = {
    white: currentState.expansionPending?.white ?? false,
    black: currentState.expansionPending?.black ?? false,
    [player]: false,
  };

  // Precedence rule: If crafting was also pending for this player, show crafting next unless locked by check
  let nextPaused: MatchState['pausedForAction'] = null;
  const craftingLocked = {
    white: Boolean(currentState.craftingLocked?.white),
    black: Boolean(currentState.craftingLocked?.black),
  };
  if (currentState.craftingAllowed !== false && currentState.craftingPending?.[player]) {
    if (currentState.inCheck === player) {
      craftingLocked[player] = true;
      nextPaused = null;
    } else {
      nextPaused = {
        type: 'crafting',
        player,
        expiresAt: Date.now() + CRAFTING_AUTO_PICK_TIMEOUT_MS,
      };
    }
  }

  return {
    ...currentState,
    board: newBoard,
    boardWidth: newWidth,
    boardHeight: newHeight,
    expansionUsed,
    expansionPending,
    craftingLocked,
    pausedForAction: nextPaused,
    lastTurnStartTime: nextPaused ? currentState.lastTurnStartTime : Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Applies craft placement to match state.
 * Big-O: O(1) + O(K * attackers)
 */
export function applyCraftPlacement(
  currentState: MatchState,
  player: PieceColor,
  pieceType: PieceType,
  pos: Position
): { success: boolean; state: MatchState; error?: string } {
  if (currentState.status !== 'active') {
    return { success: false, state: currentState, error: 'Match is not active.' };
  }

  const validation = validateCraftPlacement(currentState.board, player, pieceType, pos);
  if (!validation.valid) {
    return { success: false, state: currentState, error: validation.error };
  }

  const newBoard = cloneBoard(currentState.board);
  const newPiece: Piece = {
    id: `crafted_${player}_${pieceType}_${Date.now()}`,
    type: pieceType,
    color: player,
    hasMoved: false,
  };
  newBoard[pos.y][pos.x] = newPiece;

  const craftingPending = {
    white: currentState.craftingPending?.white ?? false,
    black: currentState.craftingPending?.black ?? false,
    [player]: false,
  };

  const craftingLocked = {
    white: Boolean(currentState.craftingLocked?.white),
    black: Boolean(currentState.craftingLocked?.black),
    [player]: false,
  };

  const craftingUsed = {
    white: Boolean(currentState.craftingUsed?.white),
    black: Boolean(currentState.craftingUsed?.black),
    [player]: true,
  };

  const lostExpensive = {
    white: currentState.lostExpensive?.white ?? 0,
    black: currentState.lostExpensive?.black ?? 0,
    [player]: (currentState.lostExpensive?.[player] ?? 0) - CRAFTING_LOST_EXPENSIVE_THRESHOLD,
  };

  return {
    success: true,
    state: {
      ...currentState,
      board: newBoard,
      lostExpensive,
      craftingPending,
      craftingLocked,
      craftingUsed,
      pausedForAction: null,
      lastTurnStartTime: Date.now(), // Clock resumes with zero penalty
      updatedAt: Date.now(),
    },
  };
}

/**
 * Cancels crafting action for player.
 * - Dismisses the craft perk permanently for this match
 * - Unpauses the clock so the timer resumes from where it left off
 */
export function cancelCrafting(
  currentState: MatchState,
  player: PieceColor
): MatchState {
  const craftingPending = {
    white: currentState.craftingPending?.white ?? false,
    black: currentState.craftingPending?.black ?? false,
    [player]: false,
  };

  const craftingLocked = {
    white: Boolean(currentState.craftingLocked?.white),
    black: Boolean(currentState.craftingLocked?.black),
    [player]: false,
  };

  const craftingUsed = {
    white: Boolean(currentState.craftingUsed?.white),
    black: Boolean(currentState.craftingUsed?.black),
    [player]: true,
  };

  return {
    ...currentState,
    craftingPending,
    craftingLocked,
    craftingUsed,
    pausedForAction: null,
    lastTurnStartTime: Date.now(), // Clock resumes from right where it left off
    updatedAt: Date.now(),
  };
}
