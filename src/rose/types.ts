import type { Piece, Position, PieceColor, PieceType } from '../types/game.ts';

export type RoseRole = 'boyfriend' | 'girlfriend';

export type RoseMatchStatus =
  | 'created'
  | 'waiting_guest'
  | 'roles_locked'
  | 'handshake'
  | 'countdown'
  | 'active'
  | 'completed';

export interface RoseSeat {
  userId: string;
  username: string;
  displayName: string;
  avatarId?: string;
  role: RoseRole;
  color: PieceColor;
  petals: number; // 0..3
  summonsUsed: number; // Max 2
  lastLoveLinkTurn: number;
  resumeToken: string;
  isConnected: boolean;
  lastSeen: number;
}

export interface PublicRoseRoom {
  code: string;
  hostDisplayName: string;
  hostUserId: string;
  hostRole: RoseRole;
  hostAvatarId?: string;
  createdAt: number;
}

export interface RoseMatchState {
  id: string;
  code: string;
  status: RoseMatchStatus;
  timeControl: number; // 0 for untimed couples chess, or 60/120
  moveSuggestions: boolean;
  board: (Piece | null)[][];
  turn: PieceColor;
  turnCount: number;
  winner: RoseRole | 'draw' | null;
  winReason?: string;
  inCheck: PieceColor | null;
  
  whiteSeat: RoseSeat | null;
  blackSeat: RoseSeat | null;
  
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  lastTurnStartTime: number;

  history: {
    from: Position;
    to: Position;
    piece: Piece;
    captured?: Piece;
    san: string;
    isSummon?: boolean;
    timestamp: number;
  }[];

  lastMove?: { from: Position; to: Position; piece: Piece };
  halfmoveClock: number; // 20-move rule without capture or pawn move
  positionHistory: string[];
  
  seq: number; // Monotonic sequence for never-stall protocol
  createdAt: number;
  updatedAt: number;
}

export interface RoseReaction {
  id: string;
  senderUserId: string;
  text: string; // '❤️' | '🌹' | '😉' | '😅' | '✨' | '⏳'
  timestamp: number;
}

