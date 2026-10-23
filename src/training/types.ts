/**
 * Types for Chess Hashira Training Dojo
 */

import type { PieceColor, PieceType, Position, Piece } from '../types/game';
import type { GameModeKey } from '../predictor/types';

export type HashiraRankId =
  | 'mizunoto'  // Rank 1: Water Initiate (Beginner)
  | 'kanoe'     // Rank 2: Iron Blade (Apprentice)
  | 'tsuchinoe' // Rank 3: Earth Defender (Adept)
  | 'hinoe'     // Rank 4: Flame Strategist (Veteran)
  | 'kinoe'     // Rank 5: Master of Trees (Elite)
  | 'hashira';  // Rank 6: The Chess Pillar (Supreme Grandmaster)

export type TrainingToolId =
  | 'opening'   // Opening Dojo
  | 'tactics'   // Tactical Dojo
  | 'culling'   // Culling Game Training
  | 'practice'  // Practice Board Sandbox & Sparring
  | 'theory';   // Theory Library Scrolls

export type MentorExpression =
  | 'stern'       // Default watchful, exacting gaze
  | 'scowl'       // Disappointed, sharp critique upon blunders
  | 'approving'   // Respectful nod when executing the master move
  | 'analytical'; // Squinting tactical focus when giving hints

export interface HashiraRankInfo {
  id: HashiraRankId;
  tierNumber: number; // 1 to 6
  name: string;
  kanji: string;
  element: string;
  subtitle: string;
  description: string;
  accentColor: string; // Hex color
  bgGradient: string;
  badgeTitle: string;
  botDifficulty: {
    depth: number;
    blunderChance: number; // 0.0 to 1.0 (0.7 for Mizunoto = very easy wins, 0.0 for Hashira = lethal)
    label: string;
    description: string;
  };
}

import type { CullingBoard, CullingPieceColor, CullingSpecialAction } from '../types/cullingGame';

export interface KataStep {
  from: Position;
  to: Position;
  explanation: string;
  hint?: string;
  mentorReaction?: MentorExpression;
  mentorCommentary?: string;
  cullingActionType?: CullingSpecialAction;
}

export interface DojoLesson {
  id: string;
  rank: HashiraRankId;
  tool: 'opening' | 'tactics' | 'culling';
  title: string;
  subtitle: string;
  mode: GameModeKey;
  playerColor: PieceColor;
  initialBoard: (Piece | null)[][];
  cullingBoard?: CullingBoard;
  cullingPlayerColor?: CullingPieceColor;
  diceActive?: boolean;
  craftingAllowed?: boolean;
  mentorPrompt: string;
  hint: string;
  mentorFailure: string;
  mentorSuccess: string;
  correctSteps: KataStep[];
  opponentResponses?: Array<{
    triggerStepIndex: number;
    from: Position;
    to: Position;
    commentary?: string;
  }>;
  mistakeExplanations?: Record<string, string>;
}

export interface TheoryScroll {
  id: string;
  rank: HashiraRankId;
  title: string;
  category: 'Fundamentals' | 'Royal Tactics' | 'Crafted Specials' | 'Culling Mechanics' | 'Rose Domain';
  readingTimeMin: number;
  summary: string;
  sections: Array<{
    heading: string;
    body: string;
    highlightBox?: string;
  }>;
  relatedPieceType?: PieceType | string;
}

export interface HashiraUserProgress {
  selectedRank: HashiraRankId;
  completedKataIds: string[];
  practiceWinsByRank: Record<HashiraRankId, number>;
  practiceLossesByRank: Record<HashiraRankId, number>;
  unlockedScrollIds: string[];
}
