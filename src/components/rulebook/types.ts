export type RulebookModeId =
  | 'standard'
  | 'crafted'
  | 'culling'
  | 'rose'
  | 'training'
  | 'multiplayer';

export type RulebookSubTab = 'overview' | 'rules' | 'strategy' | 'movement_book';

export interface DiagramPiece {
  square: string; // e.g. "e4", "d2"
  type: string;   // e.g. "pawn", "knight", "prince", "culling_gojo", "rose_queen"
  color: 'white' | 'black';
  label?: string;
}

export interface FocalSquare {
  square: string;
  label?: string;
  variant: 'attack' | 'defense' | 'key' | 'fortress';
}

export interface TacticalOpening {
  id: string;
  name: string;
  tagline: string;
  boardDimensions: { cols: number; rows: number }; // 8x8 or 10x8
  notationSteps: string[];
  description: string;
  strategicGoals: string[];
  keySquares: string[];
  diagramPieces: DiagramPiece[];
  focalSquares?: FocalSquare[];
}

export interface ModeRulebookData {
  id: RulebookModeId;
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string; // e.g. "amber", "purple", "rose", "red", "cyan"
  overview: {
    objective: string;
    boardGeometry: string;
    armySize: string;
    timeControl: string;
    winConditions: string[];
    drawConditions: string[];
    keyHighlights: { title: string; desc: string }[];
  };
  rules: {
    sections: {
      title: string;
      content: string;
      items?: { name: string; details: string; badge?: string }[];
    }[];
  };
  strategy: {
    tacticalPrinciples: string[];
    openings: TacticalOpening[];
  };
}
