/**
 * Types for Universal Live Skill Predictor & Mode-Specific Achievement Card Collection
 */

import type { PieceColor } from '../types/game';

export type GameModeKey = 'standard' | 'crafted' | 'culling' | 'rose';

export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface TacticalMetrics {
  materialBalance: number; // Normalized material score (-10 to +10)
  inCheckCount: number; // Checks given to opponent
  checksDefendedCount: number; // Checks survived/defended
  capturesMade: number; // Number of captures
  piecesLost: number; // Number of pieces lost
  specialActionsCount: number; // Domain steps, Prince special moves, craftings, petals, etc.
  bestTacticalSequence: number; // Highest move quality rating streak
  turnsSurvived: number; // Total valid turns played by player
  gameOutcome: 'win' | 'loss' | 'draw' | 'active';
  opponentDifficulty?: 'grandmaster' | 'master' | 'pvp_human' | 'couples_partner';
}

export interface PlayerActionObserved {
  id: string; // Unique action signature (move timestamp + from + to)
  turnIndex: number;
  playerColor: PieceColor;
  mode: GameModeKey;
  moveSan: string;
  pieceType: string;
  isCapture: boolean;
  capturedType?: string;
  isCheck: boolean;
  isSpecialAbility?: boolean;
  abilityName?: string;
  timestamp: number;
}

export interface RatingSnapshot {
  turnIndex: number;
  rating: number;
  tacticalQuality: number; // 0 to 100 move evaluation quality
  delta: number;
  timestamp: number;
}

export interface MatchSessionStats {
  matchId: string;
  mode: GameModeKey;
  playerColor: PieceColor;
  opponentName: string;
  opponentRating?: number;
  initialRating: number;
  currentRating: number;
  ratingHistory: RatingSnapshot[];
  metrics: TacticalMetrics;
  completedAt?: number;
  outcome?: 'win' | 'loss' | 'draw';
}

export interface AchievementCard {
  id: string;
  title: string;
  mode: GameModeKey;
  modeLabel: string; // e.g. "EARNED IN: CULLING GAME"
  rarity: CardRarity;
  description: string;
  highlight: string; // Key metric string, e.g. "Skill Rating: 1485 · Domain Sovereign"
  predictedRating: number;
  ratingDelta: number;
  motifSymbol: string; // Piece type or symbol key
  accentColor: string; // Hex color for theme accent
  pieceType?: string; // e.g., 'king', 'prince', 'culling_gojo', 'queen'
  pieceColor?: PieceColor;
  earnedAt: number;
  matchId: string;
  statsSummary: {
    movesCount: number;
    captures: number;
    specialActions: number;
    outcome: string;
  };
}

export interface CardDefinition {
  id: string;
  title: string;
  mode: GameModeKey;
  modeLabel: string;
  rarity: CardRarity;
  description: string;
  motifSymbol: string;
  accentColor: string;
  pieceType?: string;
  pieceColor?: PieceColor;
  condition: (stats: TacticalMetrics, matchOutcome: 'win' | 'loss' | 'draw' | 'active', ratingDelta: number) => boolean;
  getHighlight: (stats: TacticalMetrics, rating: number) => string;
}

export interface PredictorState {
  currentRating: number;
  sessionGamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  earnedCards: AchievementCard[];
  activeMatchStats: MatchSessionStats | null;
}
