import type { PieceType, Team } from './3dchesspieces';

export type { PieceType, Team };

export interface Position3D {
  c: number; // 0..7 (a..h)
  r: number; // 0..7 (8..1)
}

export interface PlacedPiece {
  id: string;
  type: PieceType;
  team: Team; // 'orange' = white, 'red' = black
  c: number;
  r: number;
  hasMoved?: boolean;
}

export interface Move3D {
  from: Position3D;
  to: Position3D;
  piece: PlacedPiece;
  captured?: PlacedPiece;
  promotion?: PieceType;
  isEnPassant?: boolean;
  isCastling?: 'kingside' | 'queenside';
  san: string;
}

export type GameStatus3D = 'active' | 'checkmate' | 'stalemate' | 'draw' | 'resigned' | 'timeout';

export type TimeControl3D = '3m' | '5m' | 'untimed';

export interface Player3DInfo {
  userId: string;
  displayName: string;
  avatarId?: string;
  team: Team;
  isBot?: boolean;
  botId?: string;
  elo?: number;
}

export interface Chess3dMatchState {
  id: string;
  pieces: PlacedPiece[];
  turn: Team;
  status: GameStatus3D;
  winner?: Team | 'draw';
  winReason?: string;
  inCheck: Team | null;
  moveHistory: Move3D[];
  lastMove?: Move3D;
  capturedOrange: PieceType[]; // pieces captured by red (white casualties)
  capturedRed: PieceType[];    // pieces captured by orange (black casualties)
  timeControl: TimeControl3D;
  whiteTimeRemainingMs: number;
  blackTimeRemainingMs: number;
  lastMoveTime: number;
  enPassantTarget: Position3D | null;
  mode: 'bot' | 'multiplayer';
  whitePlayer: Player3DInfo;
  blackPlayer: Player3DInfo;
  roomCode?: string;
}
