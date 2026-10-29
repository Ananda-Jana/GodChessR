/**
 * Types for Custom Multiplayer Dice Chess
 */
import { BoardThemeId } from '../game/boardThemes';
export type { BoardThemeId };

export type PieceColor = 'white' | 'black';

export type PieceType =
  | 'pawn'
  | 'knight'
  | 'bishop'
  | 'rook'
  | 'queen'
  | 'king'
  | 'prince'
  | 'communist'
  | 'supremeRook'
  | 'priest';

// Jujutsu Kaisen Culling Game piece identifiers registered in the type system
export type CullingPieceType =
  | 'culling_gojo'
  | 'culling_sukuna'
  | 'culling_yuji'
  | 'culling_kenjaku'
  | 'culling_mechamaru'
  | 'culling_panda'
  | 'culling_nanami'
  | 'culling_maki'
  | 'culling_hakari'
  | 'culling_uraume'
  | 'culling_yorozu'
  | 'culling_reggie'
  | 'culling_naoya'
  | 'culling_kurourushi'
  | 'culling_pawn'
  | 'culling_swarm';

export type AnyPieceType = PieceType | CullingPieceType;

export type ExpansionSide = 'top' | 'bottom' | 'left' | 'right';

export const EXPANSION_LOST_PIECES_THRESHOLD = 7;
export const CRAFTING_LOST_EXPENSIVE_THRESHOLD = 2;
export const EXPANSION_AUTO_PICK_TIMEOUT_MS = 15000;
export const CRAFTING_AUTO_PICK_TIMEOUT_MS = 20000;
export const CRAFTED_PIECE_BOT_EVAL_VALUE = 600;

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
  // Specific to Prince: whether the extended 3x1 first move has been consumed
  princeSpecialUsed?: boolean;
}

export interface Position {
  x: number; // 0 (file a) to 7 (file h)
  y: number; // 0 (rank 1) to 7 (rank 8)
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isSpecialPrinceMove?: boolean;
  isPromotion?: boolean;
  promotedTo?: PieceType;
  isCastling?: boolean;
  castlingSide?: 'kingside' | 'queenside';
  castlingRookFrom?: Position;
  castlingRookTo?: Position;
  san?: string; // Standard algebraic notation
  timestamp: number;
}

export type DiceCategory = 'inexpensive' | 'expensive';

// Named constants for Dice-Roll Grace Window and Auto-Roll
export const DICE_GRACE_WINDOW_MS = 3000;
export const DICE_WARNING_WINDOW_MS = 2000;
export const DICE_AUTOROLL_DELAY_MS = DICE_GRACE_WINDOW_MS + DICE_WARNING_WINDOW_MS; // 5000ms

export interface DiceState {
  rolledValue: number; // 1 to 6
  category: DiceCategory;
  eligiblePieceTypes: PieceType[];
  isFallbackAnyPiece: boolean; // True if rolled category had 0 valid moves and unlocked all pieces
  isConsumed: boolean;
  probabilityMode: 'uniform' | 'biased_late_game';
  rolledAt: number;
}

export type MatchStatus = 'waiting' | 'active' | 'completed' | 'abandoned';

export type GameEndReason = 
  | 'checkmate' 
  | 'two_pawns_end_rank_draw' 
  | 'resignation' 
  | 'stalemate' 
  | 'timeout' 
  | 'timeout_piece_advantage'
  | 'agreement_draw';

export interface MatchResult {
  winner: PieceColor | 'draw' | null;
  reason: GameEndReason | null;
  winnerUserId?: string;
  completedAt?: number;
  explanation?: string;
}

export interface MatchState {
  id: string;
  whitePlayer: {
    userId: string;
    username: string;
    displayName: string;
    avatarId: string;
  };
  blackPlayer: {
    userId: string;
    username: string;
    displayName: string;
    avatarId: string;
  };
  board: (Piece | null)[][]; // 8x8 grid [y][x], where y=0 is rank 1, y=7 is rank 8
  turn: PieceColor;
  status: MatchStatus;
  dice: DiceState | null;
  whitePawnsReachedEndRank: number;
  blackPawnsReachedEndRank: number;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  moveHistory: Move[];
  inCheck: PieceColor | null;
  result: MatchResult | null;
  // Move hints setting: 'included' (show valid move dots/tints) or 'excluded' (hide move hints)
  moveSuggestions: 'included' | 'excluded';
  // Dice removal rule: dice stay active until a combined total of 3 captures, then diceActive becomes false (normal chess)
  totalCaptures: number;
  diceActive: boolean;
  // Timer fields: 120 seconds (2 mins) or 300 seconds (5 mins)
  timeControl: 120 | 300;
  whiteTimeRemaining: number; // in seconds
  blackTimeRemaining: number; // in seconds
  lastTurnStartTime: number; // timestamp ms
  createdAt: number;
  updatedAt: number;
  // Board Expansion & Crafting Mechanics
  boardWidth?: number;
  boardHeight?: number;
  lostPieces?: { white: number; black: number };
  lostExpensive?: { white: number; black: number };
  expansionUsed?: { white: boolean; black: boolean };
  expansionPending?: { white: boolean; black: boolean };
  craftingUsed?: { white: boolean; black: boolean };
  craftingPending?: { white: boolean; black: boolean };
  craftingLocked?: { white: boolean; black: boolean };
  pausedForAction?: {
    type: 'expansion' | 'crafting';
    player: PieceColor;
    expiresAt: number;
    selectedPiece?: PieceType;
  } | null;
  gameMode?: 'standard' | 'crafted' | 'classic';
  // Mid-game crafting rule: true = allowed (default), false = avoid crafting (normal chess flow without mid-game piece summons)
  craftingAllowed?: boolean;
  expansionDisabled?: boolean;
  pieceTheme?: PieceTheme;
  boardTheme?: BoardThemeId;
}

export type PieceTheme = 'classic' | 'retro';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarId: string;
  bio?: string;
  stats: {
    wins: number;
    losses: number;
    draws: number;
    totalGames: number;
  };
  createdAt: number;
}

export type ChallengeStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';

export interface Challenge {
  id: string;
  challenger: {
    userId: string;
    username: string;
    displayName: string;
    avatarId: string;
  };
  challenged: {
    userId: string;
    username: string;
    displayName: string;
    avatarId: string;
  };
  status: ChallengeStatus;
  gameMode?: 'standard' | 'crafted' | 'classic';
  timeControl: 120 | 300; // 2 minutes or 5 minutes
  moveSuggestions?: 'included' | 'excluded';
  craftingAllowed?: boolean;
  expansionDisabled?: boolean;
  pieceTheme?: PieceTheme;
  matchId?: string;
  createdAt: number;
  expiresAt: number;
}
