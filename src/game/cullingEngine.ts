/**
 * Jujutsu Kaisen Culling Game Engine
 * 
 * Standalone, authoritative rules engine for MugenChessX Culling Game Mode.
 * Handles:
 * - 88-square cross-shaped board
 * - JJK character moves and special abilities
 * - King-equivalents (Satoru Gojo vs Ryomen Sukuna)
 * - Check detection & King safety
 * - Turn transitions, immunity, status effects, and win conditions
 */

import {
  CullingPos,
  CullingSquare,
  CullingPiece,
  CullingPieceColor,
  CullingPieceType,
  CullingBoard,
  CullingMove,
  CullingMatchState,
  CullingSpecialAction,
  isValidCullingPos,
  posToCullingSquare,
  cullingSquareToPos,
  CULLING_ROSTER,
} from '../types/cullingGame';

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

// O(1) boundary check using precomputed set
function isValidPos(x: number, y: number): boolean {
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
 * Creates the initial Culling Game board with correct rosters
 */
export function createInitialCullingBoard(): CullingBoard {
  const board = createEmptyCullingBoard();

  // White team: protagonists & allies
  // H1: Gojo (x=8, y=1)
  board[1][8] = { id: 'w_gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
  // G1: Yuji (x=7, y=1)
  board[1][7] = { id: 'w_yuji', type: 'culling_yuji', color: 'white', hasMoved: false };
  // F1: Mechamaru (x=6, y=1)
  board[1][6] = { id: 'w_mechamaru', type: 'culling_mechamaru', color: 'white', hasMoved: false };
  // E1: Panda (x=5, y=1)
  board[1][5] = { id: 'w_panda', type: 'culling_panda', color: 'white', hasMoved: false, pandaCore: 'panda' };
  // D1: Nanami (x=4, y=1)
  board[1][4] = { id: 'w_nanami', type: 'culling_nanami', color: 'white', hasMoved: false };
  // C1: Maki (x=3, y=1)
  board[1][3] = { id: 'w_maki', type: 'culling_maki', color: 'white', hasMoved: false };
  // B1: Hakari (x=2, y=1)
  board[1][2] = { id: 'w_hakari', type: 'culling_hakari', color: 'white', hasMoved: false };
  // B2..G2: Six White Pawns in front of main characters (normal chess structure)
  for (let x = 2; x <= 7; x++) {
    board[2][x] = { id: `w_pawn_${x}`, type: 'culling_pawn', color: 'white', hasMoved: false };
  }

  // Black team: antagonists & hostile forces
  // A8: Sukuna (x=1, y=8)
  board[8][1] = { id: 'b_sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
  // B8: Kenjaku (x=2, y=8)
  board[8][2] = { id: 'b_kenjaku', type: 'culling_kenjaku', color: 'black', hasMoved: false };
  // C8: Uraume (x=3, y=8)
  board[8][3] = { id: 'b_uraume', type: 'culling_uraume', color: 'black', hasMoved: false };
  // D8: Yorozu (x=4, y=8)
  board[8][4] = { id: 'b_yorozu', type: 'culling_yorozu', color: 'black', hasMoved: false };
  // E8: Reggie Star (x=5, y=8)
  board[8][5] = { id: 'b_reggie', type: 'culling_reggie', color: 'black', hasMoved: false };
  // F8: Naoya Zenin (x=6, y=8)
  board[8][6] = { id: 'b_naoya', type: 'culling_naoya', color: 'black', hasMoved: false };
  // G8: Kurourushi (x=7, y=8)
  board[8][7] = { id: 'b_kurourushi', type: 'culling_kurourushi', color: 'black', hasMoved: false };
  // B7..G7: Six Black Pawns in front of main characters (normal chess structure)
  for (let x = 2; x <= 7; x++) {
    board[7][x] = { id: `b_pawn_${x}`, type: 'culling_pawn', color: 'black', hasMoved: false };
  }

  return board;
}

/**
 * Initializes a new Culling Match State
 */
export function createInitialCullingMatch(
  id: string,
  whitePlayer: { userId: string; username: string; displayName: string; avatarId?: string },
  blackPlayer: { userId: string; username: string; displayName: string; avatarId?: string },
  timeControl: 120 | 300 = 300
): CullingMatchState {
  const now = Date.now();
  return {
    id,
    board: createInitialCullingBoard(),
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
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Checks whether an enemy piece can be captured by an attacking piece
 */
export function canPieceBeCaptured(
  target: CullingPiece,
  attacker: CullingPiece,
  turnCount: number
): boolean {
  // Gojo and Sukuna capture immunity during the first 5 turns
  if ((target.type === 'culling_gojo' || target.type === 'culling_sukuna') && turnCount <= 5) {
    return false;
  }

  // Reggie's contract shield
  if (target.contractShield) {
    return false; // Shield absorbs the attack
  }

  // Nanami ratio passive: cannot be captured by low-value pawns or swarms
  if (target.type === 'culling_nanami') {
    if (attacker.type === 'culling_pawn' || attacker.type === 'culling_swarm') {
      return false;
    }
  }

  return true;
}

/**
 * Finds the king-equivalent for a given color (with O(1) fast check when cached pos is valid)
 */
export function findKingPos(board: CullingBoard, color: CullingPieceColor, cachedPos?: CullingPos | null): CullingPos | null {
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
 * Ray helper: returns legal landing/capturing positions along a direction vector
 */
function getRayMoves(
  board: CullingBoard,
  from: CullingPos,
  dx: number,
  dy: number,
  maxSteps: number,
  piece: CullingPiece,
  canJumpOne: boolean = false
): CullingPos[] {
  const moves: CullingPos[] = [];
  let jumped = false;

  for (let step = 1; step <= maxSteps; step++) {
    const nx = from.x + dx * step;
    const ny = from.y + dy * step;

    if (!isValidPos(nx, ny)) break;

    const occupant = board[ny][nx];
    if (!occupant) {
      moves.push({ x: nx, y: ny });
    } else {
      if (canJumpOne && !jumped) {
        jumped = true;
        continue;
      }
      if (occupant.color !== piece.color) {
        moves.push({ x: nx, y: ny });
      }
      break;
    }
  }

  return moves;
}

/**
 * Generates pseudo-legal moves and special actions for a specific square
 */
export function getPseudoLegalMovesForSquare(
  match: CullingMatchState,
  from: CullingPos
): CullingMove[] {
  const board = match.board;
  const piece = board[from.y]?.[from.x];
  if (!piece) return [];

  // Frozen / restricted pieces cannot move
  if (piece.isRestricted && piece.restrictedUntilTurn && piece.restrictedUntilTurn > match.turnCount) {
    return [];
  }

  const moves: CullingMove[] = [];

  const addMove = (
    to: CullingPos,
    actionType: CullingSpecialAction = 'move',
    extra?: Partial<CullingMove>
  ) => {
    if (!isValidPos(to.x, to.y)) return;
    const target = board[to.y][to.x];
    if (target && target.color === piece.color && actionType !== 'swap') return;

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

  // Check if Nanami ratio applies to this piece
  let nanamiRestricted = false;
  const oppColor = piece.color === 'white' ? 'black' : 'white';
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = from.x + dx;
      const ny = from.y + dy;
      if (isValidPos(nx, ny)) {
        const neighbor = board[ny][nx];
        if (neighbor && neighbor.color === oppColor && neighbor.type === 'culling_nanami') {
          nanamiRestricted = true;
        }
      }
    }
  }

  const effectiveMaxSteps = nanamiRestricted ? 1 : (piece.cooldown && piece.cooldown > 0 ? 1 : 9);

  switch (piece.type) {
    // 1. STANDARD CULLING PAWN
    case 'culling_pawn': {
      const dir = piece.color === 'white' ? 1 : -1;
      const fwdY = from.y + dir;
      // Step forward 1 square
      if (isValidPos(from.x, fwdY) && !board[fwdY][from.x]) {
        const isPromotion = (piece.color === 'white' && (fwdY === 8 || fwdY === 9)) || (piece.color === 'black' && (fwdY === 1 || fwdY === 0));
        addMove({ x: from.x, y: fwdY }, 'move', {
          isPromotion,
          promotedTo: isPromotion ? (piece.color === 'white' ? 'culling_nanami' : 'culling_naoya') : undefined,
        });
      }
      // Diagonal captures
      for (const dx of [-1, 1]) {
        const diagX = from.x + dx;
        if (isValidPos(diagX, fwdY)) {
          const occ = board[fwdY][diagX];
          if (occ && occ.color !== piece.color) {
            const isPromotion = (piece.color === 'white' && (fwdY === 8 || fwdY === 9)) || (piece.color === 'black' && (fwdY === 1 || fwdY === 0));
            addMove({ x: diagX, y: fwdY }, 'move', {
              isPromotion,
              promotedTo: isPromotion ? (piece.color === 'white' ? 'culling_nanami' : 'culling_naoya') : undefined,
            });
          }
        }
      }
      break;
    }

    // 2. SATORU GOJO (King-equivalent)
    case 'culling_gojo': {
      // Moves up to 2 squares in any direction
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      const maxSteps = nanamiRestricted ? 1 : 2;
      for (const [dx, dy] of dirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxSteps, piece)) {
          addMove(pos);
        }
      }

      // Once-per-game short-range teleport
      if (!piece.specialUsed) {
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            if (dx === 0 && dy === 0) continue;
            const tx = from.x + dx;
            const ty = from.y + dy;
            if (isValidPos(tx, ty) && !board[ty][tx]) {
              addMove({ x: tx, y: ty }, 'teleport', {
                san: `Gojo-Teleport->${posToCullingSquare({ x: tx, y: ty })}`,
              });
            }
          }
        }
      }
      break;
    }

    // 3. RYOMEN SUKUNA (King-equivalent, Symmetrical with Gojo)
    case 'culling_sukuna': {
      // Moves up to 2 squares in any direction
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      const maxSteps = nanamiRestricted ? 1 : 2;
      for (const [dx, dy] of dirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxSteps, piece)) {
          addMove(pos);
        }
      }

      // Once-per-game Dismantle Rush (leaps to any unoccupied square within range 3, symmetrical to Gojo)
      if (!piece.specialUsed) {
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            if (dx === 0 && dy === 0) continue;
            const tx = from.x + dx;
            const ty = from.y + dy;
            if (isValidPos(tx, ty) && !board[ty][tx]) {
              addMove({ x: tx, y: ty }, 'teleport', {
                san: `Sukuna-DismantleRush->${posToCullingSquare({ x: tx, y: ty })}`,
              });
            }
          }
        }
      }
      break;
    }

    // 4. YUJI ITADORI (Queen-equivalent with leap)
    case 'culling_yuji': {
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      const maxSteps = nanamiRestricted ? 1 : 9;
      for (const [dx, dy] of dirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxSteps, piece, true)) {
          addMove(pos);
        }
      }
      break;
    }

    // 5. KENJAKU (Queen-equivalent with leap, Symmetrical with Yuji)
    case 'culling_kenjaku': {
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      const maxSteps = nanamiRestricted ? 1 : 9;
      for (const [dx, dy] of dirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxSteps, piece, true)) {
          addMove(pos);
        }
      }
      break;
    }

    // 6. MAKI ZENIN (Agile Close-Combat Support)
    case 'culling_maki': {
      // Diagonal slides up to 2
      const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      const maxDiag = nanamiRestricted ? 1 : 2;
      for (const [dx, dy] of diagDirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxDiag, piece)) {
          addMove(pos);
        }
      }
      // Two-square orthogonal leaps (jumping over obstacles)
      if (!nanamiRestricted) {
        const leapOffsets = [[0, 2], [0, -2], [2, 0], [-2, 0]];
        for (const [ox, oy] of leapOffsets) {
          const nx = from.x + ox;
          const ny = from.y + oy;
          if (isValidPos(nx, ny)) {
            const occ = board[ny][nx];
            if (!occ || occ.color !== piece.color) {
              addMove({ x: nx, y: ny });
            }
          }
        }
      }
      break;
    }

    // 7. URAUME (Special Support - Ice/Control)
    case 'culling_uraume': {
      // Diagonal slides (Bishop)
      const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dx, dy] of diagDirs) {
        for (const pos of getRayMoves(board, from, dx, dy, effectiveMaxSteps, piece)) {
          addMove(pos);
        }
      }
      // 1-square orthogonal step
      const orthoDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dx, dy] of orthoDirs) {
        for (const pos of getRayMoves(board, from, dx, dy, 1, piece)) {
          addMove(pos);
        }
      }
      // Frost Calm freeze ability (if off cooldown)
      if (!piece.cooldown || piece.cooldown <= 0) {
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (dx === 0 && dy === 0) continue;
            const targetX = from.x + dx;
            const targetY = from.y + dy;
            if (isValidPos(targetX, targetY)) {
              addMove({ x: targetX, y: targetY }, 'frost_freeze', {
                san: `Frost-Freeze->${posToCullingSquare({ x: targetX, y: targetY })}`,
              });
            }
          }
        }
      }
      break;
    }

    // 8. KENTO NANAMI (Heavy Orthogonal Attacker)
    case 'culling_nanami': {
      // Orthogonal sliding (Rook)
      const orthoDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dx, dy] of orthoDirs) {
        for (const pos of getRayMoves(board, from, dx, dy, effectiveMaxSteps, piece)) {
          addMove(pos);
        }
      }
      break;
    }

    // 9. YOROZU (Heavy Support, Symmetrical with Mechamaru)
    case 'culling_yorozu': {
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      const maxSteps = nanamiRestricted ? 1 : 4;
      for (const [dx, dy] of dirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxSteps, piece)) {
          addMove(pos, 'move', {
            san: `Yorozu->${posToCullingSquare(pos)}`,
          });
        }
      }
      // Once-per-game True Sphere Rush (can leap over 1 obstacle to land or capture physically)
      if (!piece.specialUsed) {
        for (const [dx, dy] of dirs) {
          for (const pos of getRayMoves(board, from, dx, dy, 3, piece, true)) {
            addMove(pos, 'construct_strike', {
              san: `TrueSphereRush->${posToCullingSquare(pos)}`,
            });
          }
        }
      }
      break;
    }

    // 10. PANDA (Resilient Support)
    case 'culling_panda': {
      // Knight leaps
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
            addMove({ x: nx, y: ny });
          }
        }
      }
      // In Gorilla Core, can also step 1 square in any direction
      if (piece.pandaCore === 'gorilla') {
        const stepDirs = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1],
        ];
        for (const [dx, dy] of stepDirs) {
          const nx = from.x + dx;
          const ny = from.y + dy;
          if (isValidPos(nx, ny)) {
            const occ = board[ny][nx];
            if (!occ || occ.color !== piece.color) {
              addMove({ x: nx, y: ny });
            }
          }
        }
      }
      break;
    }

    // 11. REGGIE STAR (Tactical Support)
    case 'culling_reggie': {
      // Moves up to 2 squares in any direction
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dx, dy] of dirs) {
        for (const pos of getRayMoves(board, from, dx, dy, effectiveMaxSteps > 1 ? 2 : 1, piece)) {
          addMove(pos);
        }
      }
      // Once-per-game contract shield bestowal (upon self or adjacent ally)
      if (!piece.specialUsed) {
        addMove(from, 'contract_shield', {
          san: 'Reggie-ContractShield-Self',
        });
        for (const [dx, dy] of dirs) {
          const nx = from.x + dx;
          const ny = from.y + dy;
          if (isValidPos(nx, ny)) {
            const ally = board[ny][nx];
            if (ally && ally.color === piece.color && !ally.contractShield) {
              addMove({ x: nx, y: ny }, 'contract_shield', {
                san: `Reggie-ContractShield->${posToCullingSquare({ x: nx, y: ny })}`,
              });
            }
          }
        }
      }
      break;
    }

    // 12. KOKICHI MUTA / MECHAMARU (Armored Heavy Rusher, Symmetrical Physical Captures)
    case 'culling_mechamaru': {
      // Moves up to 4 squares in 8 directions (sliding). All captures are physical!
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      const maxSteps = nanamiRestricted ? 1 : 4;
      for (const [dx, dy] of dirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxSteps, piece)) {
          addMove(pos, 'move', {
            san: `Mechamaru->${posToCullingSquare(pos)}`,
          });
        }
      }
      // Once-per-game Ultra Cannon Rush (can leap over 1 obstacle to land or capture physically)
      if (!piece.specialUsed) {
        for (const [dx, dy] of dirs) {
          for (const pos of getRayMoves(board, from, dx, dy, 3, piece, true)) {
            addMove(pos, 'pierce_shoot', {
              san: `OverdriveRush->${posToCullingSquare(pos)}`,
            });
          }
        }
      }
      break;
    }

    // 13. NAOYA ZENIN (High-Mobility Support)
    case 'culling_naoya': {
      // Projection Sorcery: straight line slide up to 4 squares (or 1 if cooling down)
      const maxSprint = effectiveMaxSteps > 1 ? 4 : 1;
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dx, dy] of dirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxSprint, piece)) {
          addMove(pos);
        }
      }
      break;
    }

    // 14. KINJI HAKARI (Special Support with Jackpot)
    case 'culling_hakari': {
      // Orthogonal sliding up to 3 squares
      const orthoDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const maxSteps = effectiveMaxSteps > 1 ? 3 : 1;
      for (const [dx, dy] of orthoDirs) {
        for (const pos of getRayMoves(board, from, dx, dy, maxSteps, piece)) {
          addMove(pos);
        }
      }
      break;
    }

    // 15. KUROURUSHI (Special Support)
    case 'culling_kurourushi': {
      // Leaps 2 squares in any direction or slides diagonally up to 2
      const leapOffsets = [
        [-2, -2], [-2, 0], [-2, 2],
        [0, -2],           [0, 2],
        [2, -2],  [2, 0],  [2, 2],
      ];
      for (const [ox, oy] of leapOffsets) {
        const nx = from.x + ox;
        const ny = from.y + oy;
        if (isValidPos(nx, ny)) {
          const occ = board[ny][nx];
          if (!occ || occ.color !== piece.color) {
            addMove({ x: nx, y: ny });
          }
        }
      }
      // Diagonal step 1
      const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dx, dy] of diagDirs) {
        for (const pos of getRayMoves(board, from, dx, dy, 1, piece)) {
          addMove(pos);
        }
      }
      break;
    }

    // 16. CURSED ROACH SWARM
    case 'culling_swarm': {
      // Steps 1 square in any direction
      const stepDirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dx, dy] of stepDirs) {
        const nx = from.x + dx;
        const ny = from.y + dy;
        if (isValidPos(nx, ny)) {
          const occ = board[ny][nx];
          if (!occ || occ.color !== piece.color) {
            addMove({ x: nx, y: ny });
          }
        }
      }
      break;
    }
  }

  return moves;
}

/**
 * Checks whether the king-equivalent of given color is currently in check
 */
export function isCullingKingInCheck(
  board: CullingBoard,
  color: CullingPieceColor,
  turnCount: number,
  cachedKingPos?: CullingPos | null
): boolean {
  const kingPos = findKingPos(board, color, cachedKingPos);
  if (!kingPos) return false;

  const kingPiece = board[kingPos.y][kingPos.x];
  if (!kingPiece) return false;

  // During first 5 turns, Gojo and Sukuna have absolute capture immunity
  if (turnCount <= 5 && (kingPiece.type === 'culling_gojo' || kingPiece.type === 'culling_sukuna')) {
    return false;
  }

  const oppColor: CullingPieceColor = color === 'white' ? 'black' : 'white';

  // Check if any opponent piece can attack the king square
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const oppPiece = board[y][x];
      if (oppPiece && oppPiece.color === oppColor) {
        const oppMoves = getPseudoLegalMovesForSquare(
          { board, turnCount } as CullingMatchState,
          { x, y }
        );
        for (const m of oppMoves) {
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
 * Applies a move to a board and returns the new board state
 */
export function applyCullingMoveToBoard(
  board: CullingBoard,
  move: CullingMove,
  turnCount: number
): { board: CullingBoard; bonusTurn?: 'hakari' | 'maki'; spawnSwarm?: boolean } {
  const newBoard = cloneCullingBoard(board);
  const p = newBoard[move.from.y][move.from.x];
  if (!p) return { board: newBoard };

  let bonusTurn: 'hakari' | 'maki' | undefined = undefined;
  let spawnSwarm = false;

  // 1. Special ability flags
  if (move.actionType === 'shoot' || move.actionType === 'pierce_shoot' || move.actionType === 'construct_strike' || move.actionType === 'teleport') {
    p.specialUsed = true;
  }

  // 2. Domain expansion (Sukuna)
  if (move.actionType === 'domain') {
    p.specialUsed = true;
    // Restrict White pieces within Chebyshev radius 2 for next turn
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = move.from.x + dx;
        const ny = move.from.y + dy;
        if (isValidCullingPos(nx, ny)) {
          const target = newBoard[ny][nx];
          if (target && target.color === 'white') {
            target.isRestricted = true;
            target.restrictedUntilTurn = turnCount + 2;
          }
        }
      }
    }
    return { board: newBoard };
  }

  // 3. Kenjaku swap
  if (move.actionType === 'swap') {
    p.specialUsed = true;
    const target = newBoard[move.to.y][move.to.x];
    newBoard[move.to.y][move.to.x] = p;
    newBoard[move.from.y][move.from.x] = target;
    return { board: newBoard };
  }

  // 4. Uraume Frost Calm Freeze
  if (move.actionType === 'frost_freeze') {
    p.cooldown = 3;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = move.to.x + dx;
        const ny = move.to.y + dy;
        if (isValidCullingPos(nx, ny)) {
          const enemy = newBoard[ny][nx];
          if (enemy && enemy.color !== p.color) {
            enemy.isRestricted = true;
            enemy.restrictedUntilTurn = turnCount + 2;
          }
        }
      }
    }
    return { board: newBoard };
  }


  // 6. Reggie Star contract shield
  if (move.actionType === 'contract_shield') {
    p.specialUsed = true;
    const target = newBoard[move.to.y][move.to.x];
    if (target) {
      target.contractShield = true;
    }
    return { board: newBoard };
  }

  // 7. Regular movement & teleportation
  const target = newBoard[move.to.y][move.to.x];
  let capturedSuccess = false;

  if (target) {
    if (canPieceBeCaptured(target, p, turnCount)) {
      if (target.type === 'culling_panda' && target.pandaCore !== 'gorilla') {
        // Panda Core switch: capture rejected!
        target.pandaCore = 'gorilla';
        return { board: newBoard }; // Panda stays, attacker does not advance
      } else if (target.contractShield) {
        target.contractShield = false; // Shield breaks, piece survives
        return { board: newBoard };
      } else {
        newBoard[move.to.y][move.to.x] = null;
        capturedSuccess = true;
      }
    } else {
      // Capture immune
      return { board: newBoard };
    }
  }

  // Advance moving piece to destination
  newBoard[move.from.y][move.from.x] = null;
  p.hasMoved = true;

  // Naoya sprint cooldown
  if (p.type === 'culling_naoya') {
    const dist = Math.max(Math.abs(move.to.x - move.from.x), Math.abs(move.to.y - move.from.y));
    if (dist >= 3) {
      p.cooldown = 1;
    }
  }

  // Gojo teleport flag
  if (move.actionType === 'teleport') {
    p.specialUsed = true;
  }

  // Hakari Jackpot bonus move
  if (p.type === 'culling_hakari' && capturedSuccess) {
    bonusTurn = 'hakari';
  }

  // Kurourushi spawn roach swarm on capture
  if (p.type === 'culling_kurourushi' && capturedSuccess) {
    spawnSwarm = true;
  }

  // Pawn promotion
  if (move.isPromotion && move.promotedTo) {
    p.type = move.promotedTo;
  }

  newBoard[move.to.y][move.to.x] = p;

  // Handle Kurourushi swarm spawn on adjacent empty square if available
  if (spawnSwarm) {
    let hasExistingSwarm = false;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (newBoard[r][c]?.type === 'culling_swarm') {
          hasExistingSwarm = true;
          break;
        }
      }
    }
    if (!hasExistingSwarm) {
      const adj = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dx, dy] of adj) {
        const sx = move.to.x + dx;
        const sy = move.to.y + dy;
        if (isValidCullingPos(sx, sy) && !newBoard[sy][sx]) {
          newBoard[sy][sx] = {
            id: `b_swarm_${Date.now()}`,
            type: 'culling_swarm',
            color: 'black',
            hasMoved: true,
          };
          break;
        }
      }
    }
  }

  return { board: newBoard, bonusTurn };
}

/**
 * Returns all fully validated, strictly legal moves for a given square
 * (ensuring the player's own king is not left in check)
 */
export function getLegalMovesForSquare(match: CullingMatchState, from: CullingPos): CullingMove[] {
  const piece = match.board[from.y]?.[from.x];
  if (!piece || piece.color !== match.turn) return [];

  const pseudoMoves = getPseudoLegalMovesForSquare(match, from);
  const legalMoves: CullingMove[] = [];

  for (const move of pseudoMoves) {
    // Simulate move
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
 * Executes a move authoritatively on the match state
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

  // Detect special abilities for notification pop-ups
  if (chosenMove.actionType === 'teleport') {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = movingPiece.type === 'culling_gojo' ? 'Limitless Teleport' : 'Dismantle Rush';
  } else if (chosenMove.actionType === 'pierce_shoot') {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = 'Overdrive Cannon Rush';
  } else if (chosenMove.actionType === 'construct_strike') {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = 'True Sphere Rush';
  } else if (chosenMove.actionType === 'contract_shield') {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = 'Contract Receipt Shield';
  } else if (movingPiece.type === 'culling_yuji' && Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) > 1) {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = 'Divergent Fist Leap';
  } else if (movingPiece.type === 'culling_kenjaku' && Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) > 1) {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = 'Cursed Spirit Leap';
  }

  const { board: nextBoard, bonusTurn } = applyCullingMoveToBoard(match.board, chosenMove, match.turnCount);

  if (bonusTurn === 'hakari') {
    chosenMove.isSpecialAbility = true;
    chosenMove.specialAbilityName = movingPiece.color === 'white' ? 'Idle Death Gamble: Jackpot!' : 'Glacial Surge!';
  }

  // Check if opponent King was captured
  const oppColor: CullingPieceColor = match.turn === 'white' ? 'black' : 'white';
  const oppKing = findKingPos(nextBoard, oppColor);

  let nextStatus: 'active' | 'completed' = 'active';
  let nextWinner: CullingPieceColor | null = null;
  let winReason: string | undefined = undefined;

  if (!oppKing) {
    nextStatus = 'completed';
    nextWinner = match.turn;
    winReason = `${match.turn === 'white' ? 'Satoru Gojo' : 'Ryomen Sukuna'} conquered the Culling Game (Opposing King eliminated).`;
  }

  // Determine next turn
  let nextTurn: CullingPieceColor = oppColor;
  let nextTurnCount = match.turnCount;

  // Bonus turn mechanics (Hakari Jackpot)
  if (bonusTurn === 'hakari' && !match.hakariBonusPending) {
    nextTurn = match.turn; // Hakari gets 1 extra move!
  } else {
    nextTurnCount += 1;
  }

  // Clear expired status effects for next active player
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const p = nextBoard[r][c];
      if (p && p.color === nextTurn) {
        if (p.isRestricted && p.restrictedUntilTurn && p.restrictedUntilTurn <= nextTurnCount) {
          p.isRestricted = false;
          p.restrictedUntilTurn = undefined;
        }
        if (p.cooldown && p.cooldown > 0) {
          p.cooldown -= 1;
        }
      }
    }
  }

  // Check if opponent is in check
  const inCheck = nextStatus === 'active' ? (isCullingKingInCheck(nextBoard, nextTurn, nextTurnCount) ? nextTurn : null) : null;

  // Check for no legal moves (Checkmate / Loss - no stalemate draws)
  const tempState: CullingMatchState = {
    ...match,
    board: nextBoard,
    turn: nextTurn,
    turnCount: nextTurnCount,
  };
  const oppLegalMoves = getAllLegalMoves(tempState);

  if (nextStatus === 'active' && oppLegalMoves.length === 0) {
    nextStatus = 'completed';
    nextWinner = match.turn;
    winReason = `${nextTurn} has no legal moves remaining. ${match.turn} wins by complete tactical suppression.`;
  }

  const updatedHistory = [...match.history, chosenMove].slice(-200);

  // Maintain king positions incrementally for O(1) tracking
  let nextWhiteKingPos = match.whiteKingPos || { x: 8, y: 1 };
  let nextBlackKingPos = match.blackKingPos || { x: 1, y: 8 };
  if (chosenMove.piece.type === 'culling_gojo') {
    nextWhiteKingPos = chosenMove.to;
  } else if (chosenMove.piece.type === 'culling_sukuna') {
    nextBlackKingPos = chosenMove.to;
  }

  // Incrementally maintain capture counters
  let nextWhiteCaptures = match.whiteCaptureCount || 0;
  let nextBlackCaptures = match.blackCaptureCount || 0;
  if (chosenMove.captured) {
    if (match.turn === 'white') nextWhiteCaptures++;
    else nextBlackCaptures++;
  }

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
    hakariBonusPending: bonusTurn === 'hakari',
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
