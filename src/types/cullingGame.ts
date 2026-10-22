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

export interface CullingPiece {
  id: string;
  type: CullingPieceType;
  color: CullingPieceColor;
  hasMoved: boolean;
  // Character specific state
  pandaCore?: 'panda' | 'gorilla';
  contractShield?: boolean;
  specialUsed?: boolean; // For Gojo teleport, Sukuna domain, Kenjaku swap, Yorozu construct, Mechamaru pierce, Maki rush
  cooldown?: number; // Turns remaining on sprint cooldown (Naoya) or ability cooldown
  isRestricted?: boolean; // Frozen by Uraume or restricted by Nanami/Domain
  restrictedUntilTurn?: number;
}

export type CullingSpecialAction =
  | 'move'
  | 'teleport'
  | 'shoot'
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
    role: 'Protected King-equivalent',
    mobilityDescription: 'Moves up to 2 squares in any direction (orthogonal or diagonal).',
    passiveAbility: 'Infinity: Immune to all enemy captures during the first 5 turns.',
    activeAbility: 'Short-range Teleport (Once per game): Instantly translocate to any unoccupied square within range 3, bypassing obstacles.',
    initialPos: { x: 8, y: 1 }, // H1
  },
  culling_yuji: {
    type: 'culling_yuji',
    name: 'Yuji Itadori',
    team: 'white',
    role: 'Queen-equivalent',
    mobilityDescription: 'Slides orthogonally and diagonally like a Queen.',
    activeAbility: 'Divergent Fist Leap: Can jump over at most one blocking piece along its movement path to capture or land.',
    initialPos: { x: 7, y: 1 }, // G1
  },
  culling_mechamaru: {
    type: 'culling_mechamaru',
    name: 'Kokichi Muta (Mechamaru)',
    team: 'white',
    role: 'Stationary Ranged Attacker',
    mobilityDescription: 'Stationary position (cannot move across the board).',
    activeAbility: 'Puppet Cannon: Direct line-of-sight orthogonal/diagonal shooting at any enemy piece without leaving square.',
    passiveAbility: 'Ultra Cannon (Once per game): Pierces through exactly one blocker to hit the target behind it.',
    initialPos: { x: 6, y: 1 }, // F1
  },
  culling_panda: {
    type: 'culling_panda',
    name: 'Panda',
    team: 'white',
    role: 'Resilient Support',
    mobilityDescription: 'Standard Knight L-shape leaps. Expands to orthogonal/diagonal steps in Gorilla Core.',
    passiveAbility: 'Core Switch: First capture attempt is rejected and transforms Panda to Gorilla Core. Only the second capture removes him.',
    initialPos: { x: 5, y: 1 }, // E1
  },
  culling_nanami: {
    type: 'culling_nanami',
    name: 'Kento Nanami',
    team: 'white',
    role: 'Heavy Orthogonal Attacker',
    mobilityDescription: 'Slides orthogonally any distance like a Rook.',
    passiveAbility: '7:3 Ratio Technique: Adjacent enemies suffer restricted movement (1 square max). Immune to captures by low-value pawns and swarms.',
    initialPos: { x: 4, y: 1 }, // D1
  },
  culling_maki: {
    type: 'culling_maki',
    name: 'Maki Zenin',
    team: 'white',
    role: 'Agile Close-Combat Support',
    mobilityDescription: 'Slides up to 2 squares diagonally; leaps 2 squares orthogonally over obstacles.',
    activeAbility: 'Heavenly Restriction Rush (Once per game): Can perform an immediate bonus move or strike in the same turn.',
    initialPos: { x: 3, y: 1 }, // C1
  },
  culling_hakari: {
    type: 'culling_hakari',
    name: 'Kinji Hakari',
    team: 'white',
    role: 'Special Support with Jackpot',
    mobilityDescription: 'Slides up to 3 squares orthogonally.',
    passiveAbility: 'Idle Death Gamble: Upon any successful capture, hits Jackpot to earn a 1-turn bonus move (non-recursive).',
    initialPos: { x: 2, y: 1 }, // B1
  },
  culling_sukuna: {
    type: 'culling_sukuna',
    name: 'Ryomen Sukuna',
    team: 'black',
    role: 'Protected King-equivalent',
    mobilityDescription: 'Moves up to 2 squares in any direction.',
    passiveAbility: 'King of Curses: Immune to all enemy captures during the first 5 turns.',
    activeAbility: 'Malevolent Shrine (Once per game): Activates domain restricting all White pieces within radius 2 for their next turn.',
    initialPos: { x: 1, y: 8 }, // A8
  },
  culling_kenjaku: {
    type: 'culling_kenjaku',
    name: 'Kenjaku',
    team: 'black',
    role: 'Queen-equivalent',
    mobilityDescription: 'Slides orthogonally and diagonally like a Queen.',
    activeAbility: 'Curse Manipulation (Once per game): Repositions or swaps places with any friendly piece (excluding Sukuna) within range 3.',
    initialPos: { x: 2, y: 8 }, // B8
  },
  culling_uraume: {
    type: 'culling_uraume',
    name: 'Uraume',
    team: 'black',
    role: 'Special Support',
    mobilityDescription: 'Slides diagonally like a Bishop, plus steps 1 square orthogonally.',
    activeAbility: 'Frost Calm: Targets a 3x3 sector within line of sight, immobilizing enemies inside for 1 turn (3 turn cooldown).',
    initialPos: { x: 3, y: 8 }, // C8
  },
  culling_yorozu: {
    type: 'culling_yorozu',
    name: 'Yorozu',
    team: 'black',
    role: 'Special Support',
    mobilityDescription: 'Slides orthogonally like a Rook, plus steps 1 square diagonally.',
    activeAbility: 'Liquid Metal Strike (Once per game): Creates and hurls constructed insect armor/spear to capture an enemy up to 3 squares away.',
    initialPos: { x: 4, y: 8 }, // D8
  },
  culling_reggie: {
    type: 'culling_reggie',
    name: 'Reggie Star',
    team: 'black',
    role: 'Special Support',
    mobilityDescription: 'Moves up to 2 squares in any direction.',
    activeAbility: 'Receipt Contract (Once per game): Burns a contract to bestow an impenetrable 1-hit shield upon self or an adjacent ally.',
    initialPos: { x: 5, y: 8 }, // E8
  },
  culling_naoya: {
    type: 'culling_naoya',
    name: 'Naoya Zenin (Cursed Spirit)',
    team: 'black',
    role: 'Special Support',
    mobilityDescription: 'Projection Sorcery: High-speed sprint up to 4 squares in any straight line.',
    statusEffect: 'Subsonic Cooldown: After a sprint of 3+ squares, must rest with 1-square movement on the following turn.',
    initialPos: { x: 6, y: 8 }, // F8
  },
  culling_kurourushi: {
    type: 'culling_kurourushi',
    name: 'Kurourushi',
    team: 'black',
    role: 'Special Support',
    mobilityDescription: 'Leaps 2 squares in any direction or slides diagonally up to 2 squares.',
    activeAbility: 'Parthenogenesis / Roach Swarm: Upon capture or activation, spawns 1 Cursed Swarm unit (maximum 1 active swarm).',
    initialPos: { x: 7, y: 8 }, // G8
  },
  culling_pawn: {
    type: 'culling_pawn',
    name: 'Culling Pawn',
    team: 'white', // Color determined by piece instance
    role: 'Standard Culling Pawn',
    mobilityDescription: 'Steps 1 square forward; captures 1 square diagonally forward. Promotes upon reaching opponent end rank.',
    initialPos: { x: 2, y: 2 },
  },
  culling_swarm: {
    type: 'culling_swarm',
    name: 'Cursed Roach Swarm',
    team: 'black',
    role: 'Spawned Unit',
    mobilityDescription: 'Steps 1 square in any orthogonal or diagonal direction.',
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
  hakariBonusPending?: boolean;
  makiChainPending?: boolean;
  domainActiveUntilTurn?: { color: CullingPieceColor; untilTurn: number; center: CullingPos };
  rulebookPausedUntil?: number;
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
