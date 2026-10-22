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
} from '../types/cullingGame.ts';
import {
  isValidCullingPos,
  posToCullingSquare,
  cullingSquareToPos,
  getPieceRole,
  CULLING_ROSTER,
} from '../types/cullingGame.ts';

// Precomputed set of all valid (x,y) position strings for O(1) boundary checks
const VALID_POS_SET: Set<string> = (() => {
  const s = new Set<string>();
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      let valid = false;
      if (x >= 1 && x <= 8 && y >= 1 && y <= 8) valid = true;
      else if (y === 9 && x >= 2 && x <= 7) valid = true;
      else if (y === 0 && x >= 2 && x <= 7) valid = true;
      else if (x === 0 && y >= 2 && y <= 7) valid = true;
      else if (x === 9 && y >= 2 && y <= 7) valid = true;
      if (valid) s.add(`${x},${y}`);
    }
  }
  return s;
})();

export function isValidPos(x: number, y: number): boolean {
  return VALID_POS_SET.has(`${x},${y}`);
}

/**
 * Creates an empty 10x10 cross board
 */
export function createEmptyCullingBoard(): CullingBoard {
  const board: CullingBoard = [];
  for (let y = 0; y < 10; y++) {
    const row: (CullingPiece | null)[] = [];
    for (let x = 0; x < 10; x++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
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
 * Creates the initial Culling Game board with 180° rotationally symmetric setup.
 * White protagonists on Ranks 1-2; Black antagonists on Ranks 8-7.
 * Bulwarks (Panda and Yorozu) both start with shell intact ('panda').
 */
export function createInitialCullingBoard(): CullingBoard {
  const board = createEmptyCullingBoard();

  // White team: protagonists
  // H1: Gojo (Sovereign, x=8, y=1)
  board[1][8] = { id: 'w_gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
  // G1: Yuji (Vanguard, x=7, y=1)
  board[1][7] = { id: 'w_yuji', type: 'culling_yuji', color: 'white', hasMoved: false };
  // F1: Mechamaru (Artillery, x=6, y=1)
  board[1][6] = { id: 'w_mechamaru', type: 'culling_mechamaru', color: 'white', hasMoved: false };
  // E1: Panda (Bulwark, x=5, y=1, Shell intact)
  board[1][5] = { id: 'w_panda', type: 'culling_panda', color: 'white', hasMoved: false, pandaCore: 'panda' };
  // D1: Nanami (Warden, x=4, y=1)
  board[1][4] = { id: 'w_nanami', type: 'culling_nanami', color: 'white', hasMoved: false };
  // C1: Maki (Skirmisher, x=3, y=1)
  board[1][3] = { id: 'w_maki', type: 'culling_maki', color: 'white', hasMoved: false };
  // B1: Hakari (Rusher, x=2, y=1)
  board[1][2] = { id: 'w_hakari', type: 'culling_hakari', color: 'white', hasMoved: false };
  // B2..G2: Six White Pawns
  for (let x = 2; x <= 7; x++) {
    board[2][x] = { id: `w_pawn_${x}`, type: 'culling_pawn', color: 'white', hasMoved: false };
  }

  // Black team: antagonists (Exact 180° mirror: (x,y) -> (9-x, 9-y))
  // A8: Sukuna (Sovereign, x=1, y=8)
  board[8][1] = { id: 'b_sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
  // B8: Kenjaku (Vanguard, x=2, y=8)
  board[8][2] = { id: 'b_kenjaku', type: 'culling_kenjaku', color: 'black', hasMoved: false };
  // C8: Uraume (Artillery, x=3, y=8)
  board[8][3] = { id: 'b_uraume', type: 'culling_uraume', color: 'black', hasMoved: false };
  // D8: Yorozu (Bulwark, x=4, y=8, Shell intact)
  board[8][4] = { id: 'b_yorozu', type: 'culling_yorozu', color: 'black', hasMoved: false, pandaCore: 'panda' };
  // E8: Reggie Star (Warden, x=5, y=8)
  board[8][5] = { id: 'b_reggie', type: 'culling_reggie', color: 'black', hasMoved: false };
  // F8: Naoya Zenin (Skirmisher, x=6, y=8)
  board[8][6] = { id: 'b_naoya', type: 'culling_naoya', color: 'black', hasMoved: false };
  // G8: Kurourushi (Rusher, x=7, y=8)
  board[8][7] = { id: 'b_kurourushi', type: 'culling_kurourushi', color: 'black', hasMoved: false };
  // B7..G7: Six Black Pawns
  for (let x = 2; x <= 7; x++) {
    board[7][x] = { id: `b_pawn_${x}`, type: 'culling_pawn', color: 'black', hasMoved: false };
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
  timeControl: 120 | 300 = 300
): CullingMatchState {
  const now = Date.now();
  const board = createInitialCullingBoard();
  const initialSig = generateBoardSignature(board, 'white');
  return {
    id,
    board,
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
    whiteKingPos: { x: 8, y: 1 }, // H1: Gojo
    blackKingPos: { x: 1, y: 8 }, // A8: Sukuna
    whiteCaptureCount: 0,
    blackCaptureCount: 0,
    halfmoveClock: 0,
    positionHistory: [initialSig],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Returns true if a pawn at (pos.x, pos.y) has reached the far edge of its file.
 * Symmetrical far edge by file:
 * - White (+y): L/R -> Rank 7; A/H -> Rank 8; B..G -> Rank 9
 * - Black (-y): L/R -> Rank 2; A/H -> Rank 1; B..G -> Rank 0
 */
export function isPawnPromotionSquare(color: CullingPieceColor, pos: CullingPos): boolean {
  if (color === 'white') {
    if (pos.x === 0 || pos.x === 9) return pos.y >= 7;
    if (pos.x === 1 || pos.x === 8) return pos.y >= 8;
    return pos.y >= 9;
  } else {
    if (pos.x === 0 || pos.x === 9) return pos.y <= 2;
    if (pos.x === 1 || pos.x === 8) return pos.y <= 1;
    return pos.y <= 0;
  }
}

/**
 * Dynamically computes whether a piece at pos is restricted by an enemy Warden's Ratio Field.
 * Any enemy piece in the 8 adjacent squares around a Warden is restricted to 1 square max,
 * and Artillery strikes are disabled.
 * Skirmishers (Maki, Naoya) possess Heavenly Restriction and IGNORE this restriction.
 */
export function isPieceRestrictedByWarden(
  board: CullingBoard,
  pos: CullingPos,
  piece: CullingPiece
): boolean {
  if (getPieceRole(piece.type) === 'skirmisher') {
    return false; // Heavenly Restriction: immune to Warden Ratio Field
  }

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = pos.x + dx;
      const ny = pos.y + dy;
      if (isValidPos(nx, ny)) {
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
 * Under rebalanced rules, pawn/swarm immunities and turn 1-5 immunities are removed.
 * Kept for interface backward compatibility.
 */
export function canPieceBeCaptured(
  target: CullingPiece,
  _attacker: CullingPiece,
  _turnCount?: number
): boolean {
  // All pieces can be targeted for capture.
  // Bulwark Shell breaking is handled authoritatively during move execution.
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
  const kingType: CullingPieceType = color === 'white' ? 'culling_gojo' : 'culling_sukuna';
  if (cachedPos && board[cachedPos.y]?.[cachedPos.x]) {
    const candidate = board[cachedPos.y][cachedPos.x];
    if (candidate && candidate.color === color && candidate.type === kingType) {
      return cachedPos;
    }
  }
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
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
 * Used for King check detection, Domain Step landing safety, and Rusher Jackpot safety.
 */
export function isSquareAttackedBy(
  board: CullingBoard,
  target: CullingPos,
  attackerColor: CullingPieceColor
): boolean {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const piece = board[y][x];
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
          // 1 step in 8 directions
          if (dist === 1) return true;
          break;
        }

        case 'vanguard': {
          // Slides up to 3 squares in 8 directions (capped at 1 if restricted)
          const maxSteps = restricted ? 1 : 3;
          if (dist <= maxSteps && (absDx === absDy || dx === 0 || dy === 0)) {
            // Verify ray is clear between piece and target
            const stepX = dx === 0 ? 0 : dx / absDx;
            const stepY = dy === 0 ? 0 : dy / absDy;
            let clear = true;
            for (let s = 1; s < dist; s++) {
              if (board[y + stepY * s][x + stepX * s]) {
                clear = false;
                break;
              }
            }
            if (clear) return true;
          }
          break;
        }

        case 'artillery': {
          // 1 step in 8 directions
          if (dist === 1) return true;
          // Ranged Strike at distance 2 if middle is empty and not restricted
          if (!restricted && dist === 2 && (absDx === absDy || dx === 0 || dy === 0)) {
            const midX = x + dx / 2;
            const midY = y + dy / 2;
            if (!board[midY][midX]) return true;
          }
          break;
        }

        case 'bulwark': {
          // Knight L-jumps
          if ((absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1)) {
            return true;
          }
          break;
        }

        case 'warden': {
          // Orthogonal rays up to 3 (capped at 1 if restricted)
          const maxSteps = restricted ? 1 : 3;
          if (dist <= maxSteps && (dx === 0 || dy === 0)) {
            const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
            const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
            let clear = true;
            for (let s = 1; s < dist; s++) {
              if (board[y + stepY * s][x + stepX * s]) {
                clear = false;
                break;
              }
            }
            if (clear) return true;
          }
          break;
        }

        case 'skirmisher': {
          // 1 step in 8 directions OR 2 squares orthogonally
          if (dist === 1) return true;
          if ((absDx === 2 && dy === 0) || (absDy === 2 && dx === 0)) {
            return true;
          }
          break;
        }

        case 'rusher': {
          // Diagonal rays up to 2 (capped at 1 if restricted) OR 1 step orthogonally
          if ((absDx === 1 && dy === 0) || (absDy === 1 && dx === 0)) return true;
          const maxDiag = restricted ? 1 : 2;
          if (absDx === absDy && absDx <= maxDiag) {
            const stepX = dx > 0 ? 1 : -1;
            const stepY = dy > 0 ? 1 : -1;
            let clear = true;
            for (let s = 1; s < absDx; s++) {
              if (board[y + stepY * s][x + stepX * s]) {
                clear = false;
                break;
              }
            }
            if (clear) return true;
          }
          break;
        }

        case 'pawn': {
          // Attacks 1 step diagonally forward
          const forwardY = attackerColor === 'white' ? 1 : -1;
          if (dy === forwardY && absDx === 1) return true;
          break;
        }

        case 'swarm': {
          // Deprecated unit: 1 step in 8 directions
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
  piece: CullingPiece
): CullingPos[] {
  const moves: CullingPos[] = [];
  for (let step = 1; step <= maxSteps; step++) {
    const nx = from.x + dx * step;
    const ny = from.y + dy * step;
    if (!isValidPos(nx, ny)) break;
    const occupant = board[ny][nx];
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
  const piece = board[from.y]?.[from.x];
  if (!piece) return [];

  const oppColor: CullingPieceColor = piece.color === 'white' ? 'black' : 'white';
  const role = getPieceRole(piece.type);
  const moves: CullingMove[] = [];

  const addMove = (
    to: CullingPos,
    actionType: CullingSpecialAction = 'move',
    extra?: Partial<CullingMove>
  ) => {
    if (!isValidPos(to.x, to.y)) return;
    const target = board[to.y][to.x];
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
      if (isValidPos(nx, ny) && !board[ny][nx]) {
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
        if (isValidPos(nx, ny)) {
          const occ = board[ny][nx];
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
          if (isValidPos(tx, ty) && !board[ty][tx]) {
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
          if (!isValidPos(nx, ny)) break;
          const occ = board[ny][nx];
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
        if (isValidPos(nx, ny)) {
          const occ = board[ny][nx];
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
          if (isValidPos(tx, ty) && !board[midY][midX]) {
            const target = board[ty][tx];
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
        if (isValidPos(nx, ny)) {
          const occ = board[ny][nx];
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
        for (const pos of getRayMoves(board, from, dx, dy, maxSteps, piece)) {
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
        if (isValidPos(nx, ny)) {
          const occ = board[ny][nx];
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
        if (isValidPos(nx, ny)) {
          const occ = board[ny][nx];
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
        for (const pos of getRayMoves(board, from, dx, dy, maxDiag, piece)) {
          addMove(pos, 'move');
        }
      }

      const orthoDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dx, dy] of orthoDirs) {
        const nx = from.x + dx;
        const ny = from.y + dy;
        if (isValidPos(nx, ny)) {
          const occ = board[ny][nx];
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
      if (isValidPos(from.x, fwdY) && !board[fwdY][from.x]) {
        const isPromotion = isPawnPromotionSquare(piece.color, { x: from.x, y: fwdY });
        addMove({ x: from.x, y: fwdY }, 'move', {
          isPromotion,
          promotedTo: isPromotion ? (piece.color === 'white' ? 'culling_nanami' : 'culling_reggie') : undefined,
        });
      }

      // Diagonal captures
      for (const dx of [-1, 1]) {
        const diagX = from.x + dx;
        if (isValidPos(diagX, fwdY)) {
          const occ = board[fwdY][diagX];
          if (occ && occ.color !== piece.color) {
            const isPromotion = isPawnPromotionSquare(piece.color, { x: diagX, y: fwdY });
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
        if (isValidPos(nx, ny)) {
          const occ = board[ny][nx];
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
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const piece = match.board[y][x];
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
  jackpotPos?: CullingPos
): string {
  let sig = `${turn}`;
  if (jackpotPending && jackpotPos) {
    sig += `_jp${jackpotPos.x}${jackpotPos.y}`;
  }
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const p = board[y][x];
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
  let nextWhiteKingPos = match.whiteKingPos || { x: 8, y: 1 };
  let nextBlackKingPos = match.blackKingPos || { x: 1, y: 8 };
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
