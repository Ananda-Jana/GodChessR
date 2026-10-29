/**
 * journeyTypes.ts - Type definitions for Journey Career Mode
 */

import type { PieceColor } from '../types/game';

export type JourneyNodeType = 'standard' | 'elite' | 'boss' | 'chest';

export interface JourneyBotConfig {
  id: string;
  name: string;
  title: string;
  rating: number; // e.g. 450 to 3000
  depth: number;
  blunderChance: number; // 0 for bosses, higher for early bots
  avatarKey: string;
  accentColor: string;
  quote: string;
  dialogueIntro: string;
  dialogueVictory: string; // when bot wins
  dialogueDefeat: string;  // when player wins
  timeControlSeconds: number; // e.g. 180, 300
  isPerfectPlayBoss?: boolean;
}

export interface JourneyNodeDef {
  id: string;
  stepIndex: number; // 1 to 21+
  chapter: number;   // 1 to 5
  chapterName: string;
  name: string;
  realm: string;
  type: JourneyNodeType;
  botConfig: JourneyBotConfig;
  rewardPoints: number;
  rewardGems: number;
  bonusChestRarity?: 'wood' | 'gold' | 'cyber';
  starCriteria: {
    threeStars: string; // e.g. "Win in under 35 moves"
    twoStars: string;   // e.g. "Win with 60s+ on clock"
    oneStar: string;    // "Achieve checkmate victory"
  };
}

export interface JourneyNodeProgress {
  nodeId: string;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0 to 3
  highScore: number;
  bestMovesCount?: number;
  clearedAt?: number;
  attemptCount: number;
}

export interface JourneyProgress {
  userId: string;
  nodes: Record<string, JourneyNodeProgress>;
  totalStars: number;
  totalJourneyPoints: number;
  customAvatarUrl?: string;
  selectedAvatarId?: string;
  lastActiveNodeId: string;
  claimedChests: Record<string, boolean>;
  updatedAt: number;
}
