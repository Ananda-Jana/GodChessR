/**
 * Jujutsu Kaisen Culling Game Engine - MugenChessX
 * 
 * Authoritative, server/client synchronized rules engine for the Culling Game mode.
 * 
 * Rebalanced Symmetrical Mirror Rules:
 * - 88-square cross-shaped board (10x10 with 12 void corner squares)
 * - 180° rotational symmetry: (x,y) <-> (9-x, 9-y)
 * - 8 Distinct Roles shared symmetrically across White & Black:
 *   1. Sovereign (Gojo <-> Sukuna): 1 step in 8 dirs; Domain Step (2-step jump, once per game, not in check, safe landing).
 *   2. Vanguard (Yuji <-> Kenjaku): Slides up to 3 in 8 dirs (no leap); Black Flash strike-in-place at dist 2.
 *   3. Artillery (Mechamaru <-> Uraume): 1 step in 8 dirs; Ranged Strike at dist 2 if middle is empty (disabled if restricted).
 *   4. Bulwark (Panda <-> Yorozu): Knight L-jumps; Shell passive (first capture fails, attacker stays, shell breaks to 'gorilla').
 *   5. Warden (Nanami <-> Reggie): Slides up to 3 orthogonally (no leap); Ratio Field restricts adjacent enemies to 1 step and disables Artillery.
 *   6. Skirmisher (Maki <-> Naoya): 1 step in 8 dirs OR hops 2 orthogonally (leaping); Heavenly Restriction ignores Warden field.
 *   7. Rusher (Hakari <-> Kurourushi): Slides up to 2 diagonally OR steps 1 orthogonally; Jackpot grants one extra non-capturing safe step.
 *   8. Pawn: 1 step forward, diagonal captures; Far-edge promotion to Warden (Nanami/Reggie).
 * - Standard chess check/checkmate from Move 1.
 * - Draw on threefold repetition or 30 full moves (60 plies) without capture or pawn move.
 */

import type {
  CullingPos,
  CullingSquare,
  CullingPiece,
  CullingPieceColor,
  CullingPieceType,
  CullingRole,
  CullingBoard,
  CullingMove,
  CullingMatchState,
  CullingSpecialAction,
  CullingBoardSize,
} from '../types/cullingGame.ts';
import {
  isValidCullingPos,
  posToCullingSquare,
  cullingSquareToPos,
  getPieceRole,
  CULLING_ROSTER,
} from '../types/cullingGame.ts';

export const CULLING_BOARD_SIZES = {
  '7x7': { rows: 7, cols: 7, maxIndex: 6 },
  '8x8': { rows: 8, cols: 8, maxIndex: 7 },
  '10x10': { rows: 10, cols: 10, maxIndex: 9 },
} as const;

// Precomputed sets of all valid (x,y) position strings for O(1) boundary checks
const VALID_POS_SET_7X7 = new Set<string>();
for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) VALID_POS_SET_7X7.add(`${x},${y}`);

const VALID_POS_SET_8X8 = new Set<string>();
for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) VALID_POS_SET_8X8.add(`${x},${y}`);

const VALID_POS_SET_10X10: Set<string> = (() => {
  const s = new Set<string>();
  // Center 8x8
  for (let y = 1; y <= 8; y++) {
    for (let x = 1; x <= 8; x++) {
      s.add(`${x},${y}`);
    }
  }
  // Bottom & Top Arms
  for (let x = 2; x <= 7; x++) {
    s.add(`${x},0`);
    s.add(`${x},9`);
  }
  // Left & Right Arms
  for (let y = 2; y <= 7; y++) {
    s.add(`${0},${y}`);
    s.add(`${9},${y}`);
  }
  return s;
})();

export function getValidPosSet(size: CullingBoardSize = '10x10'): Set<string> {
  if (size === '7x7') return VALID_POS_SET_7X7;
  if (size === '8x8') return VALID_POS_SET_8X8;
  return VALID_POS_SET_10X10;
}

export function isValidPos(
  x: number,
  y: number,
  size?: CullingBoardSize | number | CullingBoard
): boolean {
  if (x < 0 || y < 0) return false;
  if (!size) {
    return VALID_POS_SET_10X10.has(`${x},${y}`);
  }
  if (typeof size === 'string') {
    return getValidPosSet(size).has(`${x},${y}`);
  }
  if (typeof size === 'number') {
    return x >= 0 && x < size && y >= 0 && y < size;
  }
  if (Array.isArray(size)) {
    const dim = size.length;
    const bSize: CullingBoardSize = dim === 10 ? '10x10' : dim === 8 ? '8x8' : '7x7';
    return getValidPosSet(bSize).has(`${x},${y}`);
  }
  return false;
}

/**
 * Creates an empty board of specified size ('7x7' | '8x8' | '10x10')
 */
export function createEmptyBoard(size: CullingBoardSize = '10x10'): CullingBoard {
  const dim = size === '7x7' ? 7 : size === '8x8' ? 8 : 10;
  const board: CullingBoard = [];
  for (let y = 0; y < dim; y++) {
    const row: (CullingPiece | null)[] = [];
    for (let x = 0; x < dim; x++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
}

export function createEmptyCullingBoard(): CullingBoard {
  return createEmptyBoard('10x10');
}

/**
 * Clones a Culling Board deeply
 */
export function cloneCullingBoard(board: CullingBoard): CullingBoard {
  return board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  );
}

/**
 * Creates the initial Culling Game board (10x10) with 180° rotationally symmetric setup.
 */
export function createInitialCullingBoard(): CullingBoard {
  const board = createEmptyBoard('10x10');

  // White team: Rank 1 (y=1) characters
  board[1][8] = { id: 'w_gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
  board[1][7] = { id: 'w_yuji', type: 'culling_yuji', color: 'white', hasMoved: false };
  board[1][6] = { id: 'w_mechamaru', type: 'culling_mechamaru', color: 'white', hasMoved: false };
  board[1][5] = { id: 'w_panda', type: 'culling_panda', color: 'white', hasMoved: false, pandaCore: 'panda' };
  board[1][4] = { id: 'w_nanami', type: 'culling_nanami', color: 'white', hasMoved: false };
  board[1][3] = { id: 'w_maki', type: 'culling_maki', color: 'white', hasMoved: false };
  board[1][2] = { id: 'w_hakari', type: 'culling_hakari', color: 'white', hasMoved: false };
  
  // White team: Rank 2 (y=2) pawns + arms?
  // Following the common setup: center pawns on Rank 2
  for (let x = 1; x <= 8; x++) {
    board[2][x] = { id: `w_pawn_${x}`, type: 'culling_pawn', color: 'white', hasMoved: false };
  }

  // Black team: (9-x, 9-y) mirror
  board[8][1] = { id: 'b_sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
  board[8][2] = { id: 'b_kenjaku', type: 'culling_kenjaku', color: 'black', hasMoved: false };
  board[8][3] = { id: 'b_uraume', type: 'culling_uraume', color: 'black', hasMoved: false };
  board[8][4] = { id: 'b_yorozu', type: 'culling_yorozu', color: 'black', hasMoved: false, pandaCore: 'panda' };
  board[8][5] = { id: 'b_reggie', type: 'culling_reggie', color: 'black', hasMoved: false };
  board[8][6] = { id: 'b_naoya', type: 'culling_naoya', color: 'black', hasMoved: false };
  board[8][7] = { id: 'b_kurourushi', type: 'culling_kurourushi', color: 'black', hasMoved: false };
  
  for (let x = 1; x <= 8; x++) {
    board[7][x] = { id: `b_pawn_${x}`, type: 'culling_pawn', color: 'black', hasMoved: false };
  }

  return board;
}

/**
 * Creates initial board based on size ('7x7' | '8x8' | '10x10')
 */
export function createInitialBoard(size: CullingBoardSize = '10x10'): CullingBoard {
  if (size === '10x10') return createInitialCullingBoard();

  const dim = size === '7x7' ? 7 : 8;
  const board = createEmptyBoard(size);

  if (size === '7x7') {
    // 7x7 setup with ALL 14 Culling Sorcerers + Pawns
    // White team (y=0: characters, y=1: pawns)
    board[0][0] = { id: 'w_hakari', type: 'culling_hakari', color: 'white', hasMoved: false };
    board[0][1] = { id: 'w_maki', type: 'culling_maki', color: 'white', hasMoved: false };
    board[0][2] = { id: 'w_nanami', type: 'culling_nanami', color: 'white', hasMoved: false };
    board[0][3] = { id: 'w_panda', type: 'culling_panda', color: 'white', hasMoved: false, pandaCore: 'panda' };
    board[0][4] = { id: 'w_mechamaru', type: 'culling_mechamaru', color: 'white', hasMoved: false };
    board[0][5] = { id: 'w_yuji', type: 'culling_yuji', color: 'white', hasMoved: false };
    board[0][6] = { id: 'w_gojo', type: 'culling_gojo', color: 'white', hasMoved: false };

    for (let x = 0; x < 7; x++) {
      board[1][x] = { id: `w_pawn_${x}`, type: 'culling_pawn', color: 'white', hasMoved: false };
      board[5][x] = { id: `b_pawn_${x}`, type: 'culling_pawn', color: 'black', hasMoved: false };
    }

    // Black team (y=6: characters)
    board[6][0] = { id: 'b_sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
    board[6][1] = { id: 'b_kenjaku', type: 'culling_kenjaku', color: 'black', hasMoved: false };
    board[6][2] = { id: 'b_uraume', type: 'culling_uraume', color: 'black', hasMoved: false };
    board[6][3] = { id: 'b_yorozu', type: 'culling_yorozu', color: 'black', hasMoved: false, pandaCore: 'panda' };
    board[6][4] = { id: 'b_reggie', type: 'culling_reggie', color: 'black', hasMoved: false };
    board[6][5] = { id: 'b_naoya', type: 'culling_naoya', color: 'black', hasMoved: false };
    board[6][6] = { id: 'b_kurourushi', type: 'culling_kurourushi', color: 'black', hasMoved: false };

    return board;
  }

  if (size === '8x8') {
    // 8x8 setup with ALL 14 Culling Sorcerers + Pawns
    // White team (y=0: characters, y=1: pawns)
    board[0][0] = { id: 'w_hakari', type: 'culling_hakari', color: 'white', hasMoved: false };
    board[0][1] = { id: 'w_maki', type: 'culling_maki', color: 'white', hasMoved: false };
    board[0][2] = { id: 'w_nanami', type: 'culling_nanami', color: 'white', hasMoved: false };
    board[0][3] = { id: 'w_panda', type: 'culling_panda', color: 'white', hasMoved: false, pandaCore: 'panda' };
    board[0][4] = { id: 'w_mechamaru', type: 'culling_mechamaru', color: 'white', hasMoved: false };
    board[0][5] = { id: 'w_yuji', type: 'culling_yuji', color: 'white', hasMoved: false };
    board[0][6] = { id: 'w_gojo', type: 'culling_gojo', color: 'white', hasMoved: false };

    for (let x = 0; x < 8; x++) {
      board[1][x] = { id: `w_pawn_${x}`, type: 'culling_pawn', color: 'white', hasMoved: false };
      board[6][x] = { id: `b_pawn_${x}`, type: 'culling_pawn', color: 'black', hasMoved: false };
    }

    // Black team (y=7: characters)
    board[7][1] = { id: 'b_sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
    board[7][2] = { id: 'b_kenjaku', type: 'culling_kenjaku', color: 'black', hasMoved: false };
    board[7][3] = { id: 'b_uraume', type: 'culling_uraume', color: 'black', hasMoved: false };
    board[7][4] = { id: 'b_yorozu', type: 'culling_yorozu', color: 'black', hasMoved: false, pandaCore: 'panda' };
    board[7][5] = { id: 'b_reggie', type: 'culling_reggie', color: 'black', hasMoved: false };
    board[7][6] = { id: 'b_naoya', type: 'culling_naoya', color: 'black', hasMoved: false };
    board[7][7] = { id: 'b_kurourushi', type: 'culling_kurourushi', color: 'black', hasMoved: false };

    return board;
  }

  return board;
}

/**
 * Initializes a new authoritative Culling Match State
 */
export function createInitialCullingMatch(
  id: string,
  whitePlayer: { userId: string; username: string; displayName: string; avatarId?: string },
  blackPlayer: { userId: string; username: string; displayName: string; avatarId?: string },
  timeControl: 120 | 300 = 300,
  boardSize: CullingBoardSize = '10x10'
): CullingMatchState {
  const now = Date.now();
  const board = createInitialBoard(boardSize);
  const initialSig = generateBoardSignature(board, 'white', false, undefined, boardSize);
  const is10x10 = boardSize === '10x10';

  return {
    id,
    board,
    boardSize,
    turn: 'white',
    turnCount: 1,
    status: 'active',
    winner: null,
    inCheck: null,
    whitePlayer,
    blackPlayer,
    timeControl,
    whiteTimeRemaining: timeControl,
    blackTimeRemaining: timeControl,
    lastTurnStartTime: now,
    history: [],
    whiteKingPos: is10x10 ? { x: 8, y: 1 } : { x: board.length - 1, y: 0 },
    blackKingPos: is10x10 ? { x: 1, y: 8 } : { x: 0, y: board.length - 1 },
    whiteCaptureCount: 0,
    blackCaptureCount: 0,
    halfmoveClock: 0,
    positionHistory: [initialSig],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Returns true if a pawn at (pos.x, pos.y) has reached the far rank.
 * In 10x10 Cross Battlefield, promotion rank depends on the file's far edge:
 * - Files L(0), R(9): White y=7, Black y=2
 * - Files A(1), H(8): White y=8, Black y=1
 * - Files B-G (2-7): White y=9, Black y=0
 */
export function isPawnPromotionSquare(
  color: CullingPieceColor,
  pos: CullingPos,
  boardSize: CullingBoardSize = '10x10'
): boolean {
  if (boardSize !== '10x10') {
    const maxIdx = boardSize === '8x8' ? 7 : 6;
    return color === 'white' ? pos.y >= maxIdx : pos.y <= 0;
  }

  // 10x10 Cross logic
  const x = pos.x;
  if (color === 'white') {
    if (x === 0 || x === 9) return pos.y >= 7;
    if (x === 1 || x === 8) return pos.y >= 8;
    return pos.y >= 9;
  } else {
    if (x === 0 || x === 9) return pos.y <= 2;
    if (x === 1 || x === 8) return pos.y <= 1;
    return pos.y <= 0;
  }
}

/**
 * Dynamically computes whether a piece at pos is restricted by an enemy Warden's Ratio Field.
 */
export function isPieceRestrictedByWarden(
  board: CullingBoard,
  pos: CullingPos,
  piece: CullingPiece
): boolean {
  if (getPieceRole(piece.type) === 'skirmisher') {
    return false; // Heavenly Restriction: immune to Warden Ratio Field
  }

  const dim = board.length;
  const boardSize: CullingBoardSize = dim === 10 ? '10x10' : dim === 8 ? '8x8' : '7x7';

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = pos.x + dx;
      const ny = pos.y + dy;
      if (isValidPos(nx, ny, boardSize)) {
        const neighbor = board[ny][nx];
        if (neighbor && neighbor.color !== piece.color && getPieceRole(neighbor.type) === 'warden') {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Authoritative check whether target piece can be captured.
 */
export function canPieceBeCaptured(
  target: CullingPiece,
  _attacker: CullingPiece,
  _turnCount?: number
): boolean {
  return true;
}

/**
 * Finds the Sovereign (King-equivalent) for a given color.
 */
export function findKingPos(
  board: CullingBoard,
  color: CullingPieceColor,
  cachedPos?: CullingPos | null
): CullingPos | null {
  const dim = board.length;
  const kingType: CullingPieceType = color === 'white' ? 'culling_gojo' : 'culling_sukuna';
  if (cachedPos && board[cachedPos.y]?.[cachedPos.x]) {
    const candidate = board[cachedPos.y][cachedPos.x];
    if (candidate && candidate.color === color && candidate.type === kingType) {
      return cachedPos;
    }
  }
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const p = board[y][x];
      if (p && p.color === color && p.type === kingType) {
        return { x, y };
      }
    }
  }
  return null;
}

/**
 * Checks if a specific square target is under attack by any piece of attackerColor.
 */
export function isSquareAttackedBy(
  board: CullingBoard,
  target: CullingPos,
  attackerColor: CullingPieceColor
): boolean {
  const dim = board.length;
  const boardSize: CullingBoardSize = dim === 10 ? '10x10' : dim === 8 ? '8x8' : '7x7';

  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const piece = board[y]?.[x];
      if (!piece || piece.color !== attackerColor) continue;

      const role = getPieceRole(piece.type);
      const restricted = isPieceRestrictedByWarden(board, { x, y }, piece);
      const dx = target.x - x;
      const dy = target.y - y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const dist = Math.max(absDx, absDy);

      switch (role) {
        case 'sovereign': {
          if (dist === 1) return true;
          break;
        }

        case 'vanguard': {
          const maxSteps = restricted ? 1 : 3;
          if (dist <= maxSteps && (absDx === absDy || dx === 0 || dy === 0)) {
            const stepX = dx === 0 ? 0 : dx / absDx;
            const stepY = dy === 0 ? 0 : dy / absDy;
            let clear = true;
            for (let s = 1; s < dist; s++) {
              if (board[y + stepY * s]?.[x + stepX * s]) {
                clear = false;
                break;
              }
            }
            if (clear) return true;
          }
          break;
        }

        case 'artillery': {
          if (dist === 1) return true;
          if (!restricted && dist === 2 && (absDx === absDy || dx === 0 || dy === 0)) {
            const midX = x + dx / 2;
            const midY = y + dy / 2;
            if (midY >= 0 && midY < dim && midX >= 0 && midX < dim && !board[midY]?.[midX]) return true;
          }
          break;
        }

        case 'bulwark': {
          if ((absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1)) {
            return true;
          }
          break;
        }

        case 'warden': {
          const maxSteps = restricted ? 1 : 3;
          if (dist <= maxSteps && (dx === 0 || dy === 0)) {
            const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
            const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
            let clear = true;
            for (let s = 1; s < dist; s++) {
              if (board[y + stepY * s]?.[x + stepX * s]) {
                clear = false;
                break;
              }
            }
            if (clear) return true;
          }
          break;
        }

        case 'skirmisher': {
          if (dist === 1) return true;
          if ((absDx === 2 && dy === 0) || (absDy === 2 && dx === 0)) {
            return true;
          }
          break;
        }

        case 'rusher': {
          if ((absDx === 1 && dy === 0) || (absDy === 1 && dx === 0)) return true;
          const maxDiag = restricted ? 1 : 2;
          if (absDx === absDy && absDx <= maxDiag) {
            const stepX = dx > 0 ? 1 : -1;
            const stepY = dy > 0 ? 1 : -1;
            let clear = true;
            for (let s = 1; s < absDx; s++) {
              if (board[y + stepY * s]?.[x + stepX * s]) {
                clear = false;
                break;
              }
            }
            if (clear) return true;
          }
          break;
        }

        case 'pawn': {
          const forwardY = attackerColor === 'white' ? 1 : -1;
          if (dy === forwardY && absDx === 1) return true;
          break;
        }

        case 'swarm': {
          if (dist === 1) return true;
          break;
        }
      }
    }
  }

  return false;
}

/**
 * Checks whether the Sovereign of given color is currently in check.
 * Standard chess check rule applies from Move 1.
 */
export function isCullingKingInCheck(
  board: CullingBoard,
  color: CullingPieceColor,
  _turnCount?: number,
  cachedKingPos?: CullingPos | null
): boolean {
  const kingPos = findKingPos(board, color, cachedKingPos);
  if (!kingPos) return false;
  const oppColor: CullingPieceColor = color === 'white' ? 'black' : 'white';
  return isSquareAttackedBy(board, kingPos, oppColor);
}

/**
 * Sliding ray helper for unblocked directional movement.
 * Stops immediately at the first piece (friend or foe) or at any void/off-board cell.
 * Never leaps over pieces.
 */
function getRayMoves(
  board: CullingBoard,
  from: CullingPos,
  dx: number,
  dy: number,
  maxSteps: number,
  piece: CullingPiece,
  boardSize?: CullingBoardSize
): CullingPos[] {
  const moves: CullingPos[] = [];
  const dim = board.length;
  const bSize = boardSize || (dim === 10 ? '10x10' : dim === 8 ? '8x8' : '7x7');
  for (let step = 1; step <= maxSteps; step++) {
    const nx = from.x + dx * step;
    const ny = from.y + dy * step;
    if (ny < 0 || ny >= dim || nx < 0 || nx >= (board[ny]?.length ?? dim)) break;
    if (!isValidPos(nx, ny, bSize)) break;
    const occupant = board[ny]?.[nx];
    if (!occupant) {
      moves.push({ x: nx, y: ny });
    } else {
      if (occupant.color !== piece.color) {
        moves.push({ x: nx, y: ny });
      }
      break; // Sliding rays terminate at the first piece
    }
  }
  return moves;
}

/**
 * Generates pseudo-legal moves and actions for a specific square according to role rules.
 */
export function getPseudoLegalMovesForSquare(
  match: CullingMatchState,
  from: CullingPos
): CullingMove[] {
  const board = match.board;
  if (!board) return [];
  const dim = board.length;
  const boardSize: CullingBoardSize =
    match.boardSize || (dim === 10 ? '10x10' : dim === 8 ? '8x8' : '7x7');

  const piece = board[from.y]?.[from.x];
  if (!piece) return [];

  const oppColor: CullingPieceColor = piece.color === 'white' ? 'black' : 'white';
  const role = getPieceRole(piece.type);
  const moves: CullingMove[] = [];

  const isPosValid = (x: number, y: number): boolean => {
    if (y < 0 || y >= dim || x < 0 || x >= (board[y]?.length ?? dim)) return false;
    return isValidPos(x, y, boardSize);
  };

  const addMove = (
    to: CullingPos,
    actionType: CullingSpecialAction = 'move',
    extra?: Partial<CullingMove>
  ) => {
    if (!isPosValid(to.x, to.y)) return;
    const target = board[to.y]?.[to.x];
    if (target && target.color === piece.color) return;

    const moveSan = `${posToCullingSquare(from)}${target ? 'x' : '-'}${posToCullingSquare(to)}`;
    moves.push({
      from,
      to,
      piece: { ...piece },
      captured: target ? { ...target } : undefined,
      actionType,
      san: extra?.san || moveSan,
      timestamp: Date.now(),
      ...extra,
    });
  };

  // 1. RUSHER JACKPOT BONUS PENDING
  // If a Rusher just captured and earned Jackpot, the active player gets ONE extra move
  // with that SAME piece: a single 1-square step in 8 directions, no capture, to a square NOT attacked by opponent.
  if (match.hakariBonusPending) {
    const jackpotPos = match.jackpotPiecePos || match.lastMove?.to;
    if (!jackpotPos || from.x !== jackpotPos.x || from.y !== jackpotPos.y) {
      return []; // Only the eligible Rusher piece can take the bonus step
    }

    const dirs = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];

    for (const [dx, dy] of dirs) {
      const nx = from.x + dx;
      const ny = from.y + dy;
      if (isPosValid(nx, ny) && !board[ny]?.[nx]) {
        // Step must be to a square NOT attacked by the opponent
        if (!isSquareAttackedBy(board, { x: nx, y: ny }, oppColor)) {
          addMove({ x: nx, y: ny }, 'move', {
            isSpecialAbility: true,
            specialAbilityName: 'Jackpot Safe Step',
            san: `${posToCullingSquare(from)}->${posToCullingSquare({ x: nx, y: ny })} (Jackpot)`,
          });
        }
      }
    }
    return moves;
  }

  // 2. STANDARD ROLE-BASED MOVE GENERATION
  const restricted = isPieceRestrictedByWarden(board, from, piece);

  switch (role) {
    // -------------------------------------------------------------
    // 1. SOVEREIGN (Gojo, Sukuna)
    // -------------------------------------------------------------
    case 'sovereign': {
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      // 1 step in all 8 directions
      for (const [dx, dy] of dirs) {
        const nx = from.x + dx;
        const ny = from.y + dy;
        if (isPosValid(nx, ny)) {
          const occ = board[ny]?.[nx];
          if (!occ || occ.color !== piece.color) {
            addMove({ x: nx, y: ny }, 'move');
          }
        }
      }

      // Domain Step (Once per game):
      // Move to an empty square exactly 2 away along straight or diagonal line (8 targets).
      // May jump a piece. NOT allowed while in check. Landing square must not be attacked.
      if (!piece.specialUsed && !isCullingKingInCheck(board, piece.color)) {
        const step2Offsets = [
          [-2, 0], [2, 0], [0, -2], [0, 2],
          [-2, -2], [-2, 2], [2, -2], [2, 2],
        ];
        for (const [ox, oy] of step2Offsets) {
          const tx = from.x + ox;
          const ty = from.y + oy;
          if (isPosValid(tx, ty) && !board[ty]?.[tx]) {
            // Landing square must not be attacked
            if (!isSquareAttackedBy(board, { x: tx, y: ty }, oppColor)) {
              addMove({ x: tx, y: ty }, 'teleport', {
                isSpecialAbility: true,
                specialAbilityName: 'Domain Step',
                san: `DomainStep->${posToCullingSquare({ x: tx, y: ty })}`,
              });
            }
          }
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // 2. VANGUARD (Yuji, Kenjaku)
    // -------------------------------------------------------------
    case 'vanguard': {
      // Slides up to 3 squares in all 8 directions, no leaping.
      // Black Flash: capture at exactly distance 2 in a straight line strikes in place
      // (the Vanguard does NOT move; the target is removed). Distance 1 and 3 move normally.
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      const maxSteps = restricted ? 1 : 3;

      for (const [dx, dy] of dirs) {
        for (let step = 1; step <= maxSteps; step++) {
          const nx = from.x + dx * step;
          const ny = from.y + dy * step;
          if (!isPosValid(nx, ny)) break;
          const occ = board[ny]?.[nx];
          if (!occ) {
            addMove({ x: nx, y: ny }, 'move');
          } else {
            if (occ.color !== piece.color) {
              if (step === 2) {
                // Black Flash: capture at distance 2 is a strike in place!
                addMove({ x: nx, y: ny }, 'black_flash', {
                  isSpecialAbility: true,
                  specialAbilityName: 'Black Flash Strike',
                  san: `${posToCullingSquare(from)}⚡x${posToCullingSquare({ x: nx, y: ny })}`,
                });
              } else {
                addMove({ x: nx, y: ny }, 'move');
              }
            }
            break; // Ray stops at first piece
          }
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // 3. ARTILLERY (Mechamaru, Uraume)
    // -------------------------------------------------------------
    case 'artillery': {
      // Moves/captures 1 step in 8 directions
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dx, dy] of dirs) {
        const nx = from.x + dx;
        const ny = from.y + dy;
        if (isPosValid(nx, ny)) {
          const occ = board[ny]?.[nx];
          if (!occ || occ.color !== piece.color) {
            addMove({ x: nx, y: ny }, 'move');
          }
        }
      }

      // Ranged Strike: removes an enemy exactly 2 squares away along a straight or diagonal line,
      // only if the middle square is empty; the Artillery does not move.
      // Disabled if restricted by Warden's Ratio Field.
      if (!restricted) {
        const strikeOffsets = [
          [-2, 0], [2, 0], [0, -2], [0, 2],
          [-2, -2], [-2, 2], [2, -2], [2, 2],
        ];
        for (const [ox, oy] of strikeOffsets) {
          const midX = from.x + ox / 2;
          const midY = from.y + oy / 2;
          const tx = from.x + ox;
          const ty = from.y + oy;
          if (isPosValid(midX, midY) && isPosValid(tx, ty) && !board[midY]?.[midX]) {
            const target = board[ty]?.[tx];
            if (target && target.color !== piece.color) {
              addMove({ x: tx, y: ty }, 'shoot', {
                isSpecialAbility: true,
                specialAbilityName: 'Ranged Strike',
                san: `${posToCullingSquare(from)}🏹${posToCullingSquare({ x: tx, y: ty })}`,
              });
            }
          }
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // 4. BULWARK (Panda, Yorozu)
    // -------------------------------------------------------------
    case 'bulwark': {
      // Moves/captures as a Knight (8 L-jumps, leaps freely).
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2],  [1, 2],  [2, -1],  [2, 1],
      ];
      for (const [ox, oy] of knightOffsets) {
        const nx = from.x + ox;
        const ny = from.y + oy;
        if (isPosValid(nx, ny)) {
          const occ = board[ny]?.[nx];
          if (!occ || occ.color !== piece.color) {
            addMove({ x: nx, y: ny }, 'move');
          }
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // 5. WARDEN (Nanami, Reggie)
    // -------------------------------------------------------------
    case 'warden': {
      // Slides up to 3 squares orthogonally, no leaping.
      const orthoDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const maxSteps = restricted ? 1 : 3;
      for (const [dx, dy] of orthoDirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxSteps, piece, boardSize)) {
          addMove(pos, 'move');
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // 6. SKIRMISHER (Maki, Naoya)
    // -------------------------------------------------------------
    case 'skirmisher': {
      // Heavenly Restriction: ignores restriction from Warden Ratio Field.
      // Moves/captures 1 step in 8 directions, OR hops exactly 2 squares orthogonally (leaping).
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dx, dy] of dirs) {
        const nx = from.x + dx;
        const ny = from.y + dy;
        if (isPosValid(nx, ny)) {
          const occ = board[ny]?.[nx];
          if (!occ || occ.color !== piece.color) {
            addMove({ x: nx, y: ny }, 'move');
          }
        }
      }

      // Orthogonal 2-square hops (leaping over anything)
      const hopOffsets = [[0, 2], [0, -2], [2, 0], [-2, 0]];
      for (const [ox, oy] of hopOffsets) {
        const nx = from.x + ox;
        const ny = from.y + oy;
        if (isPosValid(nx, ny)) {
          const occ = board[ny]?.[nx];
          if (!occ || occ.color !== piece.color) {
            addMove({ x: nx, y: ny }, 'move');
          }
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // 7. RUSHER (Hakari, Kurourushi)
    // -------------------------------------------------------------
    case 'rusher': {
      // Slides up to 2 squares diagonally (no leaping), or steps 1 square orthogonally.
      const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      const maxDiag = restricted ? 1 : 2;
      for (const [dx, dy] of diagDirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxDiag, piece, boardSize)) {
          addMove(pos, 'move');
        }
      }

      const orthoDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dx, dy] of orthoDirs) {
        const nx = from.x + dx;
        const ny = from.y + dy;
        if (isPosValid(nx, ny)) {
          const occ = board[ny]?.[nx];
          if (!occ || occ.color !== piece.color) {
            addMove({ x: nx, y: ny }, 'move');
          }
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // 8. PAWN (Both Colors)
    // -------------------------------------------------------------
    case 'pawn': {
      const fwd = piece.color === 'white' ? 1 : -1;
      const fwdY = from.y + fwd;

      // 1 step forward (into empty square)
      if (isPosValid(from.x, fwdY) && !board[fwdY]?.[from.x]) {
        const isPromotion = isPawnPromotionSquare(piece.color, { x: from.x, y: fwdY }, boardSize);
        addMove({ x: from.x, y: fwdY }, 'move', {
          isPromotion,
          promotedTo: isPromotion ? (piece.color === 'white' ? 'culling_nanami' : 'culling_reggie') : undefined,
        });
      }

      // Diagonal captures
      for (const dx of [-1, 1]) {
        const diagX = from.x + dx;
        if (isPosValid(diagX, fwdY)) {
          const occ = board[fwdY]?.[diagX];
          if (occ && occ.color !== piece.color) {
            const isPromotion = isPawnPromotionSquare(piece.color, { x: diagX, y: fwdY }, boardSize);
            addMove({ x: diagX, y: fwdY }, 'move', {
              isPromotion,
              promotedTo: isPromotion ? (piece.color === 'white' ? 'culling_nanami' : 'culling_reggie') : undefined,
            });
          }
        }
      }
      break;
    }

    case 'swarm': {
      // Deprecated unit: 1 step in 8 directions
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dx, dy] of dirs) {
        const nx = from.x + dx;
        const ny = from.y + dy;
        if (isPosValid(nx, ny)) {
          const occ = board[ny]?.[nx];
          if (!occ || occ.color !== piece.color) {
            addMove({ x: nx, y: ny }, 'move');
          }
        }
      }
      break;
    }
  }

  return moves;
}

/**
 * Applies a move to a board and returns the new board state along with tactical flags.
 */
export function applyCullingMoveToBoard(
  board: CullingBoard,
  move: CullingMove,
  _turnCount?: number
): { board: CullingBoard; bonusTurn?: 'hakari'; shellBroken?: boolean; isCapture?: boolean } {
  const newBoard = cloneCullingBoard(board);
  const p = newBoard[move.from.y][move.from.x];
  if (!p) return { board: newBoard };

  let bonusTurn: 'hakari' | undefined = undefined;
  let shellBroken = false;
  let isCapture = false;

  // 1. SOVEREIGN DOMAIN STEP (Teleport)
  if (move.actionType === 'teleport') {
    newBoard[move.from.y][move.from.x] = null;
    p.specialUsed = true;
    p.hasMoved = true;
    newBoard[move.to.y][move.to.x] = p;
    return { board: newBoard };
  }

  // 2. VANGUARD BLACK FLASH STRIKE IN PLACE
  // Target is removed; Vanguard stays at move.from.
  if (move.actionType === 'black_flash') {
    const target = newBoard[move.to.y][move.to.x];
    p.hasMoved = true;
    if (target) {
      isCapture = true;
      if (getPieceRole(target.type) === 'bulwark' && target.pandaCore !== 'gorilla') {
        // Bulwark Shell breaks! Attacker stays at move.from; target stays at move.to.
        target.pandaCore = 'gorilla';
        shellBroken = true;
        return { board: newBoard, shellBroken: true, isCapture: true };
      }
      newBoard[move.to.y][move.to.x] = null;
    }
    return { board: newBoard, isCapture: true };
  }

  // 3. ARTILLERY RANGED STRIKE IN PLACE
  // Target is removed; Artillery stays at move.from.
  if (move.actionType === 'shoot') {
    const target = newBoard[move.to.y][move.to.x];
    p.hasMoved = true;
    if (target) {
      isCapture = true;
      if (getPieceRole(target.type) === 'bulwark' && target.pandaCore !== 'gorilla') {
        // Bulwark Shell breaks!
        target.pandaCore = 'gorilla';
        shellBroken = true;
        return { board: newBoard, shellBroken: true, isCapture: true };
      }
      newBoard[move.to.y][move.to.x] = null;
    }
    return { board: newBoard, isCapture: true };
  }

  // 4. STANDARD MOVES AND CAPTURES
  const target = newBoard[move.to.y][move.to.x];
  if (target) {
    isCapture = true;
    // Bulwark Shell: first capture attempt fails! Attacker stays on its square, shell breaks.
    if (getPieceRole(target.type) === 'bulwark' && target.pandaCore !== 'gorilla') {
      target.pandaCore = 'gorilla';
      p.hasMoved = true;
      shellBroken = true;
      return { board: newBoard, shellBroken: true, isCapture: true };
    }
    newBoard[move.to.y][move.to.x] = null;
  }

  // Move piece to destination
  newBoard[move.from.y][move.from.x] = null;
  p.hasMoved = true;

  // Pawn promotion
  if (move.isPromotion && move.promotedTo) {
    p.type = move.promotedTo;
  }

  newBoard[move.to.y][move.to.x] = p;

  // Rusher Jackpot trigger upon successful capture
  if (isCapture && !shellBroken && getPieceRole(p.type) === 'rusher') {
    bonusTurn = 'hakari';
  }

  return { board: newBoard, bonusTurn, shellBroken, isCapture };
}

/**
 * Returns all fully validated, strictly legal moves for a given square
 * (ensuring the player's own Sovereign is not left in check).
 */
export function getLegalMovesForSquare(match: CullingMatchState, from: CullingPos): CullingMove[] {
  const piece = match.board[from.y]?.[from.x];
  if (!piece || piece.color !== match.turn) return [];

  const pseudoMoves = getPseudoLegalMovesForSquare(match, from);
  const legalMoves: CullingMove[] = [];

  for (const move of pseudoMoves) {
    const { board: simulatedBoard } = applyCullingMoveToBoard(match.board, move, match.turnCount);
    // King safety check
    if (!isCullingKingInCheck(simulatedBoard, match.turn, match.turnCount)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

/**
 * Returns all legal moves for the current active player
 */
export function getAllLegalMoves(match: CullingMatchState): CullingMove[] {
  const moves: CullingMove[] = [];
  const dim = match.board.length;
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const piece = match.board[y]?.[x];
      if (piece && piece.color === match.turn) {
        moves.push(...getLegalMovesForSquare(match, { x, y }));
      }
    }
  }
  return moves;
}

/**
 * Generates a deterministic signature string of the board state for Threefold Repetition tracking.
 */
export function generateBoardSignature(
  board: CullingBoard,
  turn: CullingPieceColor,
  jackpotPending?: boolean,
  jackpotPos?: CullingPos,
  _boardSize?: CullingBoardSize
): string {
  let sig = `${turn}`;
  if (jackpotPending && jackpotPos) {
    sig += `_jp${jackpotPos.x}${jackpotPos.y}`;
  }
  const dim = board.length;
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const p = board[y]?.[x];
      if (p) {
        sig += `_${x}${y}${p.color[0]}${p.type}_${p.pandaCore || '0'}_${p.specialUsed ? '1' : '0'}`;
      }
    }
  }
  return sig;
}

/**
 * Executes a move authoritatively on the match state.
 */
export function executeCullingMove(
  match: CullingMatchState,
  from: CullingPos,
  to: CullingPos,
  actionType?: CullingSpecialAction
): { success: boolean; state: CullingMatchState; error?: string } {
  if (match.status !== 'active') {
    return { success: false, state: match, error: 'Match is not active.' };
  }

  const legalMoves = getLegalMovesForSquare(match, from);
  const chosenMove = legalMoves.find((m) => {
    if (m.to.x !== to.x || m.to.y !== to.y) return false;
    if (actionType && m.actionType !== actionType) return false;
    return true;
  });

  if (!chosenMove) {
    return { success: false, state: match, error: 'Illegal move or ability action.' };
  }

  const now = Date.now();
  const movingPiece = match.board[from.y][from.x]!;
  const capturedPiece = match.board[to.y]?.[to.x] || undefined;
  chosenMove.piece = movingPiece;
  if (capturedPiece) {
    chosenMove.captured = capturedPiece;
  }

  // Detect special abilities for UI badges/sounds
  if (chosenMove.actionType === 'teleport') {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = 'Domain Step';
  } else if (chosenMove.actionType === 'shoot') {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = 'Ranged Strike';
  } else if (chosenMove.actionType === 'black_flash') {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = 'Black Flash Strike';
  }

  const { board: nextBoard, bonusTurn, shellBroken, isCapture } = applyCullingMoveToBoard(
    match.board,
    chosenMove,
    match.turnCount
  );

  const oppColor: CullingPieceColor = match.turn === 'white' ? 'black' : 'white';
  const oppKing = findKingPos(nextBoard, oppColor);

  let nextStatus: 'active' | 'completed' = 'active';
  let nextWinner: CullingPieceColor | null = null;
  let winReason: string | undefined = undefined;

  // Sovereign elimination check
  if (!oppKing) {
    nextStatus = 'completed';
    nextWinner = match.turn;
    winReason = `${match.turn === 'white' ? 'Satoru Gojo' : 'Ryomen Sukuna'} eliminated the opposing Sovereign.`;
  }

  // Determine next turn and turn count
  let nextTurn: CullingPieceColor = oppColor;
  let nextTurnCount = match.turnCount;
  let nextHakariBonusPending = false;
  let nextJackpotPos: CullingPos | undefined = undefined;

  // RUSHER JACKPOT BONUS PROCESSING
  // If a Rusher captured, test if there is at least ONE legal non-capturing safe step.
  if (bonusTurn === 'hakari' && !match.hakariBonusPending && nextStatus === 'active') {
    const testBonusState: CullingMatchState = {
      ...match,
      board: nextBoard,
      turn: match.turn,
      turnCount: match.turnCount,
      hakariBonusPending: true,
      jackpotPiecePos: chosenMove.to,
    };
    const bonusLegalSteps = getLegalMovesForSquare(testBonusState, chosenMove.to);
    if (bonusLegalSteps.length > 0) {
      nextTurn = match.turn; // Same player gets extra step
      nextHakariBonusPending = true;
      nextJackpotPos = chosenMove.to;
      chosenMove.isSpecialAbility = true;
      chosenMove.specialAbilityName = 'Jackpot Activated!';
    } else {
      // Forfeited automatically if no safe step exists
      nextTurnCount += 1;
    }
  } else {
    // If this move completed the bonus step, advance turn
    nextTurnCount += 1;
  }

  // HALFMOVE CLOCK (30-Move Rule: 60 plies without capture or pawn move)
  let nextHalfmoveClock = (match.halfmoveClock || 0) + 1;
  if (isCapture || shellBroken || getPieceRole(movingPiece.type) === 'pawn') {
    nextHalfmoveClock = 0;
  }

  // THREEFOLD REPETITION TRACKING
  const newSig = generateBoardSignature(nextBoard, nextTurn, nextHakariBonusPending, nextJackpotPos);
  const nextPositionHistory = [...(match.positionHistory || []), newSig];
  const repetitionCount = nextPositionHistory.filter((s) => s === newSig).length;

  if (nextStatus === 'active') {
    if (repetitionCount >= 3) {
      nextStatus = 'completed';
      nextWinner = null;
      winReason = 'Draw by threefold repetition.';
    } else if (nextHalfmoveClock >= 60) {
      nextStatus = 'completed';
      nextWinner = null;
      winReason = 'Draw by 30-move rule (no capture or pawn move for 30 consecutive full moves).';
    }
  }

  // CHECK AND CHECKMATE / COMPLETE TACTICAL SUPPRESSION
  const inCheck = nextStatus === 'active'
    ? (isCullingKingInCheck(nextBoard, nextTurn, nextTurnCount) ? nextTurn : null)
    : null;

  if (nextStatus === 'active') {
    const tempState: CullingMatchState = {
      ...match,
      board: nextBoard,
      turn: nextTurn,
      turnCount: nextTurnCount,
      hakariBonusPending: nextHakariBonusPending,
      jackpotPiecePos: nextJackpotPos,
    };
    const nextPlayerLegalMoves = getAllLegalMoves(tempState);

    if (nextPlayerLegalMoves.length === 0) {
      nextStatus = 'completed';
      nextWinner = match.turn;
      if (inCheck) {
        winReason = `Checkmate! ${match.turn === 'white' ? 'White' : 'Black'} wins.`;
      } else {
        winReason = `${nextTurn} has no legal moves remaining. ${match.turn} wins by Complete Tactical Suppression.`;
      }
    }
  }

  // Cached sovereign positions
  let nextWhiteKingPos = match.whiteKingPos || { x: 6, y: 0 };
  let nextBlackKingPos = match.blackKingPos || { x: 0, y: 6 };
  if (chosenMove.piece.type === 'culling_gojo') {
    nextWhiteKingPos = chosenMove.to;
  } else if (chosenMove.piece.type === 'culling_sukuna') {
    nextBlackKingPos = chosenMove.to;
  }

  // Incremental capture counters
  let nextWhiteCaptures = match.whiteCaptureCount || 0;
  let nextBlackCaptures = match.blackCaptureCount || 0;
  if (isCapture && !shellBroken) {
    if (match.turn === 'white') nextWhiteCaptures++;
    else nextBlackCaptures++;
  }

  const updatedHistory = [...match.history, chosenMove].slice(-200);

  const updatedState: CullingMatchState = {
    ...match,
    board: nextBoard,
    turn: nextTurn,
    turnCount: nextTurnCount,
    status: nextStatus,
    winner: nextWinner,
    winReason,
    inCheck,
    history: updatedHistory,
    lastMove: chosenMove,
    hakariBonusPending: nextHakariBonusPending,
    jackpotPiecePos: nextJackpotPos,
    halfmoveClock: nextHalfmoveClock,
    positionHistory: nextPositionHistory,
    whiteKingPos: nextWhiteKingPos,
    blackKingPos: nextBlackKingPos,
    whiteCaptureCount: nextWhiteCaptures,
    blackCaptureCount: nextBlackCaptures,
    lastTurnStartTime: now,
    updatedAt: now,
  };

  return { success: true, state: updatedState };
}

/**
 * Handles match resignation
 */
export function resignCullingMatch(match: CullingMatchState, resigningColor: CullingPieceColor): CullingMatchState {
  const winner = resigningColor === 'white' ? 'black' : 'white';
  const now = Date.now();
  return {
    ...match,
    status: 'completed',
    winner,
    winReason: `${resigningColor} resigned the Culling match.`,
    updatedAt: now,
  };
}

/**
 * Handles clock timeout
 */
export function handleCullingTimeout(match: CullingMatchState, timedOutColor: CullingPieceColor): CullingMatchState {
  const winner = timedOutColor === 'white' ? 'black' : 'white';
  const now = Date.now();
  return {
    ...match,
    status: 'completed',
    winner,
    winReason: `${timedOutColor} ran out of time.`,
    updatedAt: now,
  };
}
