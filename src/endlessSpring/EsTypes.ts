export type EsSide = 'A' | 'B' | 'neutral';

export type EsPieceType =
  | 'dreamer'
  | 'keeper'
  | 'guide'
  | 'footman'
  | 'shade'
  | 'wind'
  | 'beam'
  | 'scarecrow'
  | 'echo'
  | 'angel'
  | 'investigator'
  | 'observer'
  | 'boat'
  | 'guest'
  | 'undertow'
  | 'rescuer'
  | 'banded'
  | 'crowd'
  | 'torchbearer'
  | 'kin'
  | 'watcher'
  | 'yjkstra';

export interface EsPosition {
  x: number;
  y: number; // 0 at the bottom
}

export interface EsPiece {
  id: string;
  type: EsPieceType;
  side: EsSide;
  pos: EsPosition;
  isRealFootman?: boolean; // For echoes turned real
  kinRevealed?: boolean;   // For Game 5 kin
  frozenRounds?: number;   // Torchbearer stillness
}

export type EsGameId = 1 | 2 | 3 | 4 | 5;

export interface EsBoardConfig {
  width: number;
  height: number;
  voidSquares: EsPosition[]; // squares that are '#'
  wrapTorus?: boolean;       // For Game 3 Stage 1
}

export type EsTileType = 'normal' | 'notebook' | 'slip' | 'exit' | 'passage' | 'red_door' | 'shrine' | 'paper' | 'stair';

export interface EsSpecialTile {
  pos: EsPosition;
  type: EsTileType;
  collected?: boolean;
}

export type EsOutcome = 'ongoing' | 'win' | 'loss' | 'draw';

export interface EsGameState {
  version: 1;
  gameId: EsGameId;
  stageOrAct: number; // 1-indexed (e.g. stage 1..3, act 1..3, phase 1..3)
  round: number; // current round (1-indexed)
  turn: 'A' | 'B'; // whose turn it is
  board: EsBoardConfig;
  pieces: EsPiece[];
  specialTiles: EsSpecialTile[];
  outcome: EsOutcome;
  outcomeReason?: string;
  outcomeTextVariant?: string; // e.g. for Game 4 ending text variants
  
  // Game 1 specific
  shadowLineS: number; // starts at 4
  hasRyoshinBlessing?: 'A' | 'B' | null;
  blessingTurnMovesLeft?: number;
  blessingMovedPieceId?: string | null;
  fireSquares: EsPosition[];
  smokeSquares: EsPosition[];
  isStorm?: boolean;

  // Game 2 specific
  itemsCollected: { notebook: boolean; slip: boolean };
  questionsCount: number; // max 3
  imagineCooldown: number; // rounds until usable
  angelInterceptUsed: boolean;
  pendingIntercept?: {
    capturer: EsPiece;
    target: EsPiece;
    from: EsPosition;
    to: EsPosition;
  } | null;

  // Game 3 specific
  loopsCount: number; // for stage 1 wrap-around
  liftCooldown: number; // for rescuer
  floodedRows: number[]; // row y indices

  // Game 4 specific
  crowdTokens: EsPosition[];
  casualtyCount: number;

  // Game 5 specific
  seed: number;
  kinAllies: string[]; // piece IDs that are allies
  kinEnemies: string[]; // piece IDs that are enemies
  carriedAllies: EsPieceType[]; // allies who survived
  papersCollected: number; // 0..5

  updatedAt: number;
}

export interface EsMove {
  pieceId: string;
  from: EsPosition;
  to: EsPosition;
  capturedPieceId?: string;
}

export interface EsSpecialAction {
  type: 'imagine' | 'lift' | 'part_crowd' | 'intercept';
  targetPos?: EsPosition;
}

export interface EsGameMeta {
  id: EsGameId;
  title: string;
  arcName: string;
  chapterRange: string;
  durationEstimate: string;
  spoilerWarning: string;
  boardDescription: string;
}
