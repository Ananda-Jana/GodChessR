export type CraftBoardWidth = number;
export type CraftBoardHeight = number;

export type CraftPieceColor = 'white' | 'black';

export type CraftPieceType =
  | 'pawn'
  | 'knight'
  | 'bishop'
  | 'rook'
  | 'queen'
  | 'king'
  | 'prince'
  | 'communist'
  | 'priest'
  | 'supremeRook';

export interface CraftPiece {
  id: string;
  type: CraftPieceType;
  color: CraftPieceColor;
  hasMoved?: boolean;
}

export interface CraftPosition {
  x: number; // 0 to width - 1
  y: number; // 0 to height - 1
}

export interface CraftMove {
  from: CraftPosition;
  to: CraftPosition;
  piece: CraftPiece;
  captured?: CraftPiece;
  isPromotion?: boolean;
  promotionType?: CraftPieceType;
  isEnPassant?: boolean;
  isCastling?: boolean;
}

export type CraftWinCondition =
  | 'checkmate'
  | 'capture-king'
  | 'reach-end'
  | 'elimination';

export type CraftBotLevel = 'rookie' | 'tactician' | 'punisher';

export type CraftVariantId =
  | 'micro-chess'
  | 'speed-chess'
  | 'rank-war'
  | 'one-lane'
  | 'open-canvas';

export interface CraftVariantConfig {
  id: CraftVariantId;
  name: string;
  subtitle: string;
  description: string;
  width: number;
  height: number;
  winCondition: CraftWinCondition;
  allowCustomSetup: boolean;
  rules: string[];
  badge: string;
  avatar: string;
  initialBoard: () => (CraftPiece | null)[][];
}

export type CraftMatchStatus =
  | 'setup'
  | 'playing'
  | 'checkmate'
  | 'win-capture'
  | 'win-reach'
  | 'draw'
  | 'resigned';

export interface CraftMatchState {
  id: string;
  variant: CraftVariantConfig;
  board: (CraftPiece | null)[][];
  turn: CraftPieceColor;
  playerColor: CraftPieceColor;
  botLevel: CraftBotLevel;
  moveHistory: CraftMove[];
  capturedWhite: CraftPiece[];
  capturedBlack: CraftPiece[];
  status: CraftMatchStatus;
  winner: CraftPieceColor | 'draw' | null;
  winReason: string | null;
  inCheck: CraftPieceColor | null;
  lastMove?: CraftMove;
  isBotThinking?: boolean;
}
