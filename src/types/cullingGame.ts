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
  x: number; // 0 to 9: 0 = Left arm, 1..8 = Columns A..H, 9 = Right arm
  y: number; // 0 to 9: 0 = Bottom arm (B0..G0), 1..8 = Ranks 1..8, 9 = Top arm (B9..G9)
}

export type CullingSquare = string; // e.g., 'B0', 'H1', 'A8', 'L3', 'R4'

/**
 * Returns true if (x, y) is one of the 88 valid playable squares on the cross-shaped board.
 * Four outer corners are void cells.
 */
export function isValidCullingPos(x: number, y: number): boolean {
  if (x < 0 || x > 9 || y < 0 || y > 9) return false;

  // Center 8x8 (columns A..H = 1..8, rows 1..8)
  if (x >= 1 && x <= 8 && y >= 1 && y <= 8) return true;

  // Top arm: B9..G9 (columns B..G = 2..7, row 9)
  if (y === 9 && x >= 2 && x <= 7) return true;

  // Bottom arm: B0..G0 (columns B..G = 2..7, row 0)
  if (y === 0 && x >= 2 && x <= 7) return true;

  // Left arm: L2..L7 (column 0, rows 2..7)
  if (x === 0 && y >= 2 && y <= 7) return true;

  // Right arm: R2..R7 (column 9, rows 2..7)
  if (x === 9 && y >= 2 && y <= 7) return true;

  return false;
}

export const TOTAL_PLAYABLE_SQUARES = 88;

const FILES = ['L', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'R'];

export function posToCullingSquare(pos: CullingPos): CullingSquare {
  if (!isValidCullingPos(pos.x, pos.y)) return 'VOID';
  const fileLetter = FILES[pos.x];
  return `${fileLetter}${pos.y}`;
}

export function cullingSquareToPos(sq: CullingSquare): CullingPos | null {
  if (!sq || sq.length < 2 || sq === 'VOID') return null;
  const fileChar = sq[0].toUpperCase();
  const rank = parseInt(sq.slice(1), 10);
  const x = FILES.indexOf(fileChar);
  if (x === -1 || isNaN(rank)) return null;
  const pos = { x, y: rank };
  return isValidCullingPos(pos.x, pos.y) ? pos : null;
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
  contractShield?: boolean; // Deprecated, kept for backward compatibility
  specialUsed?: boolean; // Domain Step used for Sovereigns (Gojo / Sukuna)
  cooldown?: number; // Deprecated, kept for backward compatibility
  isRestricted?: boolean; // Deprecated, kept for backward compatibility
  restrictedUntilTurn?: number; // Deprecated, kept for backward compatibility
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
    initialPos: { x: 8, y: 1 }, // H1
  },
  culling_yuji: {
    type: 'culling_yuji',
    name: 'Yuji Itadori',
    team: 'white',
    role: 'Vanguard',
    mobilityDescription: 'Slides up to 3 squares in all 8 directions (no leaping).',
    activeAbility: 'Black Flash: A capture of an enemy at exactly distance 2 in a straight line strikes in place (Yuji does not move; target is removed). Distance-1 and 3 captures move normally.',
    initialPos: { x: 7, y: 1 }, // G1
  },
  culling_mechamaru: {
    type: 'culling_mechamaru',
    name: 'Kokichi Muta (Mechamaru)',
    team: 'white',
    role: 'Artillery',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions.',
    activeAbility: 'Ranged Strike: Removes an enemy exactly 2 squares away in 8 directions if the middle square is empty; Mechamaru does not move.',
    initialPos: { x: 6, y: 1 }, // F1
  },
  culling_panda: {
    type: 'culling_panda',
    name: 'Panda',
    team: 'white',
    role: 'Bulwark',
    mobilityDescription: 'Moves/captures as a knight (8 L-jumps, leaps freely).',
    passiveAbility: 'Shell: The first capture attempt on Panda fails; attacker stays on its square, shell breaks, and the turn is spent.',
    initialPos: { x: 5, y: 1 }, // E1
  },
  culling_nanami: {
    type: 'culling_nanami',
    name: 'Kento Nanami',
    team: 'white',
    role: 'Warden',
    mobilityDescription: 'Slides up to 3 squares orthogonally (no leaping).',
    passiveAbility: 'Ratio Field: Any enemy piece in the 8 adjacent squares is restricted to moving/capturing 1 square max, and Artillery strikes are disabled for it.',
    initialPos: { x: 4, y: 1 }, // D1
  },
  culling_maki: {
    type: 'culling_maki',
    name: 'Maki Zenin',
    team: 'white',
    role: 'Skirmisher',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions, OR hops exactly 2 squares orthogonally (leaping over anything).',
    passiveAbility: 'Heavenly Restriction: Ignores restriction from the Warden Ratio Field.',
    initialPos: { x: 3, y: 1 }, // C1
  },
  culling_hakari: {
    type: 'culling_hakari',
    name: 'Kinji Hakari',
    team: 'white',
    role: 'Rusher',
    mobilityDescription: 'Slides up to 2 squares diagonally (no leaping), or steps 1 square orthogonally.',
    passiveAbility: 'Jackpot: After capturing, earns one extra non-capturing 1-square step with this piece to an unattacked square keeping Sovereign safe.',
    initialPos: { x: 2, y: 1 }, // B1
  },
  culling_sukuna: {
    type: 'culling_sukuna',
    name: 'Ryomen Sukuna',
    team: 'black',
    role: 'Sovereign',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions.',
    activeAbility: 'Domain Step (Once per game): Move to an empty square exactly 2 away straight or diagonally, jumping pieces. Unusable while in check; landing square must not be attacked.',
    initialPos: { x: 1, y: 8 }, // A8
  },
  culling_kenjaku: {
    type: 'culling_kenjaku',
    name: 'Kenjaku',
    team: 'black',
    role: 'Vanguard',
    mobilityDescription: 'Slides up to 3 squares in all 8 directions (no leaping).',
    activeAbility: 'Black Flash: A capture of an enemy at exactly distance 2 in a straight line strikes in place (Kenjaku does not move; target is removed). Distance-1 and 3 captures move normally.',
    initialPos: { x: 2, y: 8 }, // B8
  },
  culling_uraume: {
    type: 'culling_uraume',
    name: 'Uraume',
    team: 'black',
    role: 'Artillery',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions.',
    activeAbility: 'Ranged Strike: Removes an enemy exactly 2 squares away in 8 directions if the middle square is empty; Uraume does not move.',
    initialPos: { x: 3, y: 8 }, // C8
  },
  culling_yorozu: {
    type: 'culling_yorozu',
    name: 'Yorozu',
    team: 'black',
    role: 'Bulwark',
    mobilityDescription: 'Moves/captures as a knight (8 L-jumps, leaps freely).',
    passiveAbility: 'Shell: The first capture attempt on Yorozu fails; attacker stays on its square, shell breaks, and the turn is spent.',
    initialPos: { x: 4, y: 8 }, // D8
  },
  culling_reggie: {
    type: 'culling_reggie',
    name: 'Reggie Star',
    team: 'black',
    role: 'Warden',
    mobilityDescription: 'Slides up to 3 squares orthogonally (no leaping).',
    passiveAbility: 'Ratio Field: Any enemy piece in the 8 adjacent squares is restricted to moving/capturing 1 square max, and Artillery strikes are disabled for it.',
    initialPos: { x: 5, y: 8 }, // E8
  },
  culling_naoya: {
    type: 'culling_naoya',
    name: 'Naoya Zenin',
    team: 'black',
    role: 'Skirmisher',
    mobilityDescription: 'Moves/captures 1 step in all 8 directions, OR hops exactly 2 squares orthogonally (leaping over anything).',
    passiveAbility: 'Heavenly Restriction: Ignores restriction from the Warden Ratio Field.',
    initialPos: { x: 6, y: 8 }, // F8
  },
  culling_kurourushi: {
    type: 'culling_kurourushi',
    name: 'Kurourushi',
    team: 'black',
    role: 'Rusher',
    mobilityDescription: 'Slides up to 2 squares diagonally (no leaping), or steps 1 square orthogonally.',
    passiveAbility: 'Jackpot: After capturing, earns one extra non-capturing 1-square step with this piece to an unattacked square keeping Sovereign safe.',
    initialPos: { x: 7, y: 8 }, // G8
  },
  culling_pawn: {
    type: 'culling_pawn',
    name: 'Culling Pawn',
    team: 'white', // Color determined by piece instance
    role: 'Pawn',
    mobilityDescription: 'Steps 1 square forward; captures 1 square diagonally forward. Promotes to Warden (Nanami/Reggie) on the far edge of each file.',
    initialPos: { x: 2, y: 2 },
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
  hakariBonusPending?: boolean; // General Rusher Jackpot pending flag
  jackpotPiecePos?: CullingPos; // Track square of Rusher entitled to bonus step
  makiChainPending?: boolean;
  domainActiveUntilTurn?: { color: CullingPieceColor; untilTurn: number; center: CullingPos };
  rulebookPausedUntil?: number;
  halfmoveClock?: number; // 30-move rule counter (60 halfmoves without capture or pawn move)
  positionHistory?: string[]; // Board FEN-like signatures for threefold repetition detection
  createdAt: number;
  updatedAt: number;
  // Performance optimization: cached king positions (maintained incrementally)
  whiteKingPos?: CullingPos;
  blackKingPos?: CullingPos;
  // Incremental material tracking
  whiteMaterial?: number;
  blackMaterial?: number;
  whiteCaptureCount?: number; // pieces captured by white
  blackCaptureCount?: number; // pieces captured by black
}
