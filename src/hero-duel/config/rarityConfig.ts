/**
 * Card rarity tables, pity thresholds, and drop probability weights for Hero Duel
 */

export type CardRarity = 'common' | 'rare' | 'epic' | 'master' | 'mythic' | 'legendary';

export interface RarityDef {
  id: CardRarity;
  label: string;
  badgeBg: string;
  badgeText: string;
  frameGradient: string;
  glowColor: string;
  baseProbability: number; // Percentage
  weight: number;
}

export const CARD_RARITIES: Record<CardRarity, RarityDef> = {
  common: {
    id: 'common',
    label: 'COMMON',
    badgeBg: 'bg-zinc-800',
    badgeText: 'text-zinc-200',
    frameGradient: 'linear-gradient(135deg, #4b5563, #1f2937)',
    glowColor: 'rgba(156, 163, 175, 0.2)',
    baseProbability: 50.0,
    weight: 500,
  },
  rare: {
    id: 'rare',
    label: 'RARE',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    frameGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    baseProbability: 28.0,
    weight: 280,
  },
  epic: {
    id: 'epic',
    label: 'EPIC',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    frameGradient: 'linear-gradient(135deg, #a855f7, #6b21a8)',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    baseProbability: 14.0,
    weight: 140,
  },
  master: {
    id: 'master',
    label: 'MASTER',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-black',
    frameGradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    baseProbability: 6.0,
    weight: 60,
  },
  mythic: {
    id: 'mythic',
    label: 'MYTHIC',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    frameGradient: 'linear-gradient(135deg, #f43f5e, #9f1239)',
    glowColor: 'rgba(244, 63, 94, 0.8)',
    baseProbability: 1.8,
    weight: 18,
  },
  legendary: {
    id: 'legendary',
    label: 'LEGENDARY',
    badgeBg: 'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500',
    badgeText: 'text-black font-black',
    frameGradient: 'linear-gradient(135deg, #fde047, #f97316, #ec4899, #3b82f6)',
    glowColor: 'rgba(251, 191, 36, 0.95)',
    baseProbability: 0.2,
    weight: 2,
  },
};

export const PITY_TIMER_THRESHOLD = 10; // Guaranteed Epic+ after 10 non-epic pulls

export const RARITY_CONFIGS = CARD_RARITIES;

export function ROLL_CARD_RARITY(): CardRarity {
  const roll = Math.random() * 100;
  if (roll < 0.2) return 'legendary';
  if (roll < 2.0) return 'mythic';
  if (roll < 8.0) return 'master';
  if (roll < 22.0) return 'epic';
  if (roll < 50.0) return 'rare';
  return 'common';
}
