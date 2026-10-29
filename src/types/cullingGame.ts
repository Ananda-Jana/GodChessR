/**
 * Jujutsu Kaisen Culling Game Mode Types & Coordinate Mapping
 * 
 * Defines the 88 playable squares on the cross-shaped board,
 * character definitions, abilities, match state, and action models.
 */

export type CullingPieceColor = 'white' | 'black';

export type CullingPieceType =
  // White protagonists and allies
  | 'culling_gojo'
  | 'culling_yuji'
  | 'culling_mechamaru'
  | 'culling_panda'
  | 'culling_nanami'
  | 'culling_maki'
  | 'culling_hakari'
  // Black antagonists and hostile forces
  | 'culling_sukuna'
  | 'culling_kenjaku'
  | 'culling_uraume'
  | 'culling_yorozu'
  | 'culling_reggie'
  | 'culling_naoya'
  | 'culling_kurourushi'
  // Units & Pawns
  | 'culling_pawn'
  | 'culling_swarm';

export interface CullingPos {
  x: number; // 0 to 9: Space encompassing L, A-H, R
  y: number; // 0 to 9: Space encompassing Bottom, 1-8, Top
}

export type CullingSquare = string; // e.g., 'A1', 'L3', 'R5', 'B9'

export type CullingBoardSize = '7x7' | '8x8' | '10x10';

export interface CullingMatchConfig {
  boardSize?: CullingBoardSize;
  timeControl?: 120 | 300;
  preferredSide?: 'white' | 'black' | 'random';
}

/**
 * Returns true if (x, y) is one of the 88 playable squares on the cross-shaped board.
 * - Center 8x8: x in 1..8, y in 1..8 (64 squares)
 * - Bottom Arm: x in 2..7, y = 0 (6 squares)
 * - Top Arm: x in 2..7, y = 9 (6 squares)
 * - Left Arm: x = 0, y in 2..7 (6 squares)
 * - Right Arm: x = 9, y in 2..7 (6 squares)
 * Total: 64 + 6 + 6 + 6 + 6 = 88 squares.
 * Corners (0,0), (1,0), (0,1), etc. are void.
 */
export function isValidCullingPos(x: number, y: number, boardSize: CullingBoardSize = '10x10'): boolean {
  if (boardSize === '7x7') return x >= 0 && x <= 6 && y >= 0 && y <= 6;
  if (boardSize === '8x8') return x >= 0 && x <= 7 && y >= 0 && y <= 7;
  
  // 10x10 Cross Battlefield (Default)
  if (x < 0 || x > 9 || y < 0 || y > 9) return false;

  // Center 8x8
  if (x >= 1 && x <= 8 && y >= 1 && y <= 8) return true;

  // Bottom & Top Arms (File indices 2..7 correspond to B..G)
  if (x >= 2 && x <= 7 && (y === 0 || y === 9)) return true;

  // Left & Right Arms (Rank indices 2..7 correspond to Ranks 2..7)
  if (y >= 2 && y <= 7 && (x === 0 || x === 9)) return true;

  return false;
}

export const TOTAL_PLAYABLE_SQUARES = 88;

export const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function posToCullingSquare(pos: CullingPos, boardSize: CullingBoardSize = '10x10'): CullingSquare {
  if (!isValidCullingPos(pos.x, pos.y, boardSize)) return 'VOID';
  
  if (boardSize !== '10x10') {
    const fileLetter = FILES[pos.x];
    return `${fileLetter}${pos.y + 1}`;
  }

  // 10x10 Cross Labeling
  if (pos.x === 0) return `L${pos.y}`;
  if (pos.x === 9) return `R${pos.y}`;
  
  // y=0 is Bottom arm, y=9 is Top arm
  const fileLetter = FILES[pos.x - 1];
  return `${fileLetter}${pos.y}`;
}

export function cullingSquareToPos(sq: CullingSquare, boardSize: CullingBoardSize = '10x10'): CullingPos | null {
  if (!sq || sq.length < 2 || sq === 'VOID') return null;
  const firstChar = sq[0].toUpperCase();
  const rest = sq.slice(1);
  const rankVal = parseInt(rest, 10);

  if (boardSize !== '10x10') {
    const x = FILES.indexOf(firstChar);
    if (x === -1 || isNaN(rankVal)) return null;
    const pos = { x, y: rankVal - 1 };
    return isValidCullingPos(pos.x, pos.y, boardSize) ? pos : null;
  }

  // 10x10 Logic
  let x = -1;
  if (firstChar === 'L') x = 0;
  else if (firstChar === 'R') x = 9;
  else {
    const fileIdx = FILES.indexOf(firstChar);
    if (fileIdx !== -1) x = fileIdx + 1;
  }

  if (x === -1 || isNaN(rankVal)) return null;
  const pos = { x, y: rankVal };
  return isValidCullingPos(pos.x, pos.y, boardSize) ? pos : null;
}

export type CullingRole =
  | 'sovereign'
  | 'vanguard'
  | 'artillery'
  | 'bulwark'
  | 'warden'
  | 'skirmisher'
  | 'rusher'
  | 'pawn'
  | 'swarm';

export function getPieceRole(type: CullingPieceType): CullingRole {
  switch (type) {
    case 'culling_gojo':
    case 'culling_sukuna':
      return 'sovereign';
    case 'culling_yuji':
    case 'culling_kenjaku':
      return 'vanguard';
    case 'culling_mechamaru':
    case 'culling_uraume':
      return 'artillery';
    case 'culling_panda':
    case 'culling_yorozu':
      return 'bulwark';
    case 'culling_nanami':
    case 'culling_reggie':
      return 'warden';
    case 'culling_maki':
    case 'culling_naoya':
      return 'skirmisher';
    case 'culling_hakari':
    case 'culling_kurourushi':
      return 'rusher';
    case 'culling_pawn':
      return 'pawn';
    case 'culling_swarm':
      return 'swarm';
  }
}

export const CULLING_MATERIAL_VALUES: Record<CullingRole, number> = {
  pawn: 1,
  skirmisher: 3.5,
  rusher: 3.5,
  bulwark: 3.5,
  artillery: 4,
  warden: 4.5,
  vanguard: 8,
  sovereign: 99,
  swarm: 0.5,
};

export interface CullingPiece {
  id: string;
  type: CullingPieceType;
  color: CullingPieceColor;
  hasMoved: boolean;
  // Character specific state
  pandaCore?: 'panda' | 'gorilla'; // Reused as Shell Intact ('panda') vs Broken ('gorilla') for Bulwarks
  contractShield?: boolean;
  specialUsed?: boolean; // Domain Step used for Sovereigns (Gojo / Sukuna)
  cooldown?: number;
  isRestricted?: boolean;
  restrictedUntilTurn?: number;
}

export type CullingSpecialAction =
  | 'move'
  | 'teleport'
  | 'shoot'
  | 'black_flash'
  | 'pierce_shoot'
  | 'domain'
  | 'swap'
  | 'frost_freeze'
  | 'construct_strike'
  | 'chain_rush'
  | 'contract_shield'
  | 'spawn_swarm';

export interface CullingMove {
  from: CullingPos;
  to: CullingPos;
  piece: CullingPiece;
  captured?: CullingPiece;
  actionType?: CullingSpecialAction;
  targetPos?: CullingPos;
  secondaryFrom?: CullingPos;
  secondaryTo?: CullingPos;
  san: string;
  timestamp: number;
  isPromotion?: boolean;
  promotedTo?: CullingPieceType;
  isSpecialAbility?: boolean;
  specialAbilityName?: string;
}

export type CullingBoard = (CullingPiece | null)[][];

export interface CullingCharacterInfo {
  type: CullingPieceType;
  name: string;
  team: CullingPieceColor;
  role: string;
  mobilityDescription: string;
  passiveAbility?: string;
  activeAbility?: string;
  statusEffect?: string;
  initialPos: CullingPos;
}

export const CULLING_ROSTER: Record<CullingPieceType, CullingCharacterInfo> = {
  culling_gojo: {
    type: 'culling_gojo',
    name: 'Satoru Gojo',
    team: 'white',
    role: 'Sovereign',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions.',
    activeAbility: 'Domain Step (Once per game): Move to an empty square exactly 2 away straight or diagonally, jumping pieces. Unusable while in check; landing square must not be attacked.',
    initialPos: { x: 6, y: 0 }, // G1
  },
  culling_yuji: {
    type: 'culling_yuji',
    name: 'Yuji Itadori',
    team: 'white',
    role: 'Vanguard',
    mobilityDescription: 'Slides up to 3 squares in all 8 directions (no leaping).',
    activeAbility: 'Black Flash: A capture of an enemy at exactly distance 2 in a straight line strikes in place (Yuji does not move; target is removed). Distance-1 and 3 captures move normally.',
    initialPos: { x: 5, y: 0 }, // F1
  },
  culling_mechamaru: {
    type: 'culling_mechamaru',
    name: 'Kokichi Muta (Mechamaru)',
    team: 'white',
    role: 'Artillery',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions.',
    activeAbility: 'Ranged Strike: Removes an enemy exactly 2 squares away in 8 directions if the middle square is empty; Mechamaru does not move.',
    initialPos: { x: 4, y: 0 }, // E1
  },
  culling_panda: {
    type: 'culling_panda',
    name: 'Panda',
    team: 'white',
    role: 'Bulwark',
    mobilityDescription: 'Moves/captures as a knight (8 L-jumps, leaps freely).',
    passiveAbility: 'Shell: The first capture attempt on Panda fails; attacker stays on its square, shell breaks, and the turn is spent.',
    initialPos: { x: 3, y: 0 }, // D1
  },
  culling_nanami: {
    type: 'culling_nanami',
    name: 'Kento Nanami',
    team: 'white',
    role: 'Warden',
    mobilityDescription: 'Slides up to 3 squares orthogonally (no leaping).',
    passiveAbility: 'Ratio Field: Any enemy piece in the 8 adjacent squares is restricted to moving/capturing 1 square max, and Artillery strikes are disabled for it.',
    initialPos: { x: 2, y: 0 }, // C1
  },
  culling_maki: {
    type: 'culling_maki',
    name: 'Maki Zenin',
    team: 'white',
    role: 'Skirmisher',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions, OR hops exactly 2 squares orthogonally (leaping over anything).',
    passiveAbility: 'Heavenly Restriction: Ignores restriction from the Warden Ratio Field.',
    initialPos: { x: 1, y: 0 }, // B1
  },
  culling_hakari: {
    type: 'culling_hakari',
    name: 'Kinji Hakari',
    team: 'white',
    role: 'Rusher',
    mobilityDescription: 'Slides up to 2 squares diagonally (no leaping), or steps 1 square orthogonally.',
    passiveAbility: 'Jackpot: After capturing, earns one extra non-capturing 1-square step with this piece to an unattacked square keeping Sovereign safe.',
    initialPos: { x: 0, y: 0 }, // A1
  },
  culling_sukuna: {
    type: 'culling_sukuna',
    name: 'Ryomen Sukuna',
    team: 'black',
    role: 'Sovereign',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions.',
    activeAbility: 'Domain Step (Once per game): Move to an empty square exactly 2 away straight or diagonally, jumping pieces. Unusable while in check; landing square must not be attacked.',
    initialPos: { x: 0, y: 6 }, // A7
  },
  culling_kenjaku: {
    type: 'culling_kenjaku',
    name: 'Kenjaku',
    team: 'black',
    role: 'Vanguard',
    mobilityDescription: 'Slides up to 3 squares in all 8 directions (no leaping).',
    activeAbility: 'Black Flash: A capture of an enemy at exactly distance 2 in a straight line strikes in place (Kenjaku does not move; target is removed). Distance-1 and 3 captures move normally.',
    initialPos: { x: 1, y: 6 }, // B7
  },
  culling_uraume: {
    type: 'culling_uraume',
    name: 'Uraume',
    team: 'black',
    role: 'Artillery',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions.',
    activeAbility: 'Ranged Strike: Removes an enemy exactly 2 squares away in 8 directions if the middle square is empty; Uraume does not move.',
    initialPos: { x: 2, y: 6 }, // C7
  },
  culling_yorozu: {
    type: 'culling_yorozu',
    name: 'Yorozu',
    team: 'black',
    role: 'Bulwark',
    mobilityDescription: 'Moves/captures as a knight (8 L-jumps, leaps freely).',
    passiveAbility: 'Shell: The first capture attempt on Yorozu fails; attacker stays on its square, shell breaks, and the turn is spent.',
    initialPos: { x: 3, y: 6 }, // D7
  },
  culling_reggie: {
    type: 'culling_reggie',
    name: 'Reggie Star',
    team: 'black',
    role: 'Warden',
    mobilityDescription: 'Slides up to 3 squares orthogonally (no leaping).',
    passiveAbility: 'Ratio Field: Any enemy piece in the 8 adjacent squares is restricted to moving/capturing 1 square max, and Artillery strikes are disabled for it.',
    initialPos: { x: 4, y: 6 }, // E7
  },
  culling_naoya: {
    type: 'culling_naoya',
    name: 'Naoya Zenin',
    team: 'black',
    role: 'Skirmisher',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions, OR hops exactly 2 squares orthogonally (leaping over anything).',
    passiveAbility: 'Heavenly Restriction: Ignores restriction from the Warden Ratio Field.',
    initialPos: { x: 5, y: 6 }, // F7
  },
  culling_kurourushi: {
    type: 'culling_kurourushi',
    name: 'Kurourushi',
    team: 'black',
    role: 'Rusher',
    mobilityDescription: 'Slides up to 2 squares diagonally (no leaping), or steps 1 square orthogonally.',
    passiveAbility: 'Jackpot: After capturing, earns one extra non-capturing 1-square step with this piece to an unattacked square keeping Sovereign safe.',
    initialPos: { x: 6, y: 6 }, // G7
  },
  culling_pawn: {
    type: 'culling_pawn',
    name: 'Culling Pawn',
    team: 'white',
    role: 'Pawn',
    mobilityDescription: 'Steps 1 square forward; captures 1 square diagonally forward. Promotes to Warden (Nanami/Reggie) on the far edge.',
    initialPos: { x: 1, y: 1 },
  },
  culling_swarm: {
    type: 'culling_swarm',
    name: 'Cursed Roach Swarm',
    team: 'black',
    role: 'Spawned Unit (Deprecated)',
    mobilityDescription: 'Steps 1 square in any orthogonal or diagonal direction (kept in union, never spawned).',
    initialPos: { x: 0, y: 0 },
  },
};

export interface CullingMatchState {
  id: string;
  board: CullingBoard;
  boardSize?: CullingBoardSize;
  turn: CullingPieceColor;
  turnCount: number;
  status: 'waiting' | 'active' | 'completed';
  winner: CullingPieceColor | null;
  winReason?: string;
  inCheck?: CullingPieceColor | null;
  whitePlayer: {
    userId: string;
    username: string;
    displayName: string;
    avatarId?: string;
  };
  blackPlayer: {
    userId: string;
    username: string;
    displayName: string;
    avatarId?: string;
  };
  timeControl: 120 | 300;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  lastTurnStartTime: number;
  history: CullingMove[];
  lastMove?: CullingMove;
  hakariBonusPending?: boolean;
  jackpotPiecePos?: CullingPos;
  makiChainPending?: boolean;
  domainActiveUntilTurn?: { color: CullingPieceColor; untilTurn: number; center: CullingPos };
  rulebookPausedUntil?: number;
  halfmoveClock?: number;
  positionHistory?: string[];
  createdAt: number;
  updatedAt: number;
  whiteKingPos?: CullingPos;
  blackKingPos?: CullingPos;
  whiteMaterial?: number;
  blackMaterial?: number;
  whiteCaptureCount?: number;
  blackCaptureCount?: number;
}

