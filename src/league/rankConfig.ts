/**
 * rankConfig.ts - Single Source of Truth for League Ranks, Trophies & Math
 */

export interface RankRewards {
  gemsOnPromotion: number;
  unlockedTitle?: string;
  unlockedBlueprint?: string;
}

export interface RankDefinition {
  id: string;
  name: string;
  tierNumber: number; // 1 to 11
  minTrophies: number;
  maxTrophies: number; // Ceiling before next rank
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  artUrl?: string; // Empty for now, renders polished CSS/SVG crest placeholder
  animationId: 'rusted' | 'shiny' | 'metal1' | 'metal2' | 'mugen1' | 'mugen2' | 'mugen3' | 'iron' | 'conqueror' | 'dukekiller' | 'deity';
  rewards: RankRewards;
}

export const RANK_CONFIGS: RankDefinition[] = [
  {
    id: 'rusted_chrome',
    name: 'Rusted Chrome',
    tierNumber: 1,
    minTrophies: 0,
    maxTrophies: 199,
    primaryColor: '#a89a8c',
    accentColor: '#5c5247',
    glowColor: 'rgba(168, 154, 140, 0.4)',
    artUrl: '',
    animationId: 'rusted',
    rewards: { gemsOnPromotion: 0 },
  },
  {
    id: 'shiny_chrome',
    name: 'Shiny Chrome',
    tierNumber: 2,
    minTrophies: 200,
    maxTrophies: 399,
    primaryColor: '#e2e8f0',
    accentColor: '#94a3b8',
    glowColor: 'rgba(226, 232, 240, 0.6)',
    artUrl: '',
    animationId: 'shiny',
    rewards: { gemsOnPromotion: 50, unlockedTitle: 'Chrome Novice' },
  },
  {
    id: 'metal_hashira_1',
    name: 'Metal Hashira 1',
    tierNumber: 3,
    minTrophies: 400,
    maxTrophies: 649,
    primaryColor: '#38bdf8',
    accentColor: '#0284c7',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    artUrl: '',
    animationId: 'metal1',
    rewards: { gemsOnPromotion: 100, unlockedTitle: 'Iron Pillar' },
  },
  {
    id: 'metal_hashira_2',
    name: 'Metal Hashira 2',
    tierNumber: 4,
    minTrophies: 650,
    maxTrophies: 899,
    primaryColor: '#0ea5e9',
    accentColor: '#0369a1',
    glowColor: 'rgba(14, 165, 233, 0.7)',
    artUrl: '',
    animationId: 'metal2',
    rewards: { gemsOnPromotion: 150 },
  },
  {
    id: 'mugen_1',
    name: 'Mugen 1',
    tierNumber: 5,
    minTrophies: 900,
    maxTrophies: 1199,
    primaryColor: '#a855f7',
    accentColor: '#7e22ce',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    artUrl: '',
    animationId: 'mugen1',
    rewards: { gemsOnPromotion: 250, unlockedTitle: 'Domain Initiate' },
  },
  {
    id: 'mugen_2',
    name: 'Mugen 2',
    tierNumber: 6,
    minTrophies: 1200,
    maxTrophies: 1549,
    primaryColor: '#9333ea',
    accentColor: '#6b21a8',
    glowColor: 'rgba(147, 51, 234, 0.8)',
    artUrl: '',
    animationId: 'mugen2',
    rewards: { gemsOnPromotion: 350 },
  },
  {
    id: 'mugen_3',
    name: 'Mugen 3',
    tierNumber: 7,
    minTrophies: 1550,
    maxTrophies: 1949,
    primaryColor: '#c084fc',
    accentColor: '#581c87',
    glowColor: 'rgba(192, 132, 252, 0.85)',
    artUrl: '',
    animationId: 'mugen3',
    rewards: { gemsOnPromotion: 500, unlockedTitle: 'Infinity Master' },
  },
  {
    id: 'iron_regent',
    name: 'Iron Regent',
    tierNumber: 8,
    minTrophies: 1950,
    maxTrophies: 2399,
    primaryColor: '#f59e0b',
    accentColor: '#b45309',
    glowColor: 'rgba(245, 158, 11, 0.85)',
    artUrl: '',
    animationId: 'iron',
    rewards: { gemsOnPromotion: 750, unlockedBlueprint: 'Iron Regent Core' },
  },
  {
    id: 'conqueror',
    name: 'Conqueror',
    tierNumber: 9,
    minTrophies: 2400,
    maxTrophies: 2899,
    primaryColor: '#f97316',
    accentColor: '#c2410c',
    glowColor: 'rgba(249, 115, 22, 0.9)',
    artUrl: '',
    animationId: 'conqueror',
    rewards: { gemsOnPromotion: 1000, unlockedTitle: 'Warlord' },
  },
  {
    id: 'duke_killer',
    name: 'Duke Killer',
    tierNumber: 10,
    minTrophies: 2900,
    maxTrophies: 3499,
    primaryColor: '#ef4444',
    accentColor: '#991b1b',
    glowColor: 'rgba(239, 68, 68, 0.95)',
    artUrl: '',
    animationId: 'dukekiller',
    rewards: { gemsOnPromotion: 1500, unlockedTitle: 'Duke Slayer' },
  },
  {
    id: 'supreme_deity',
    name: 'Supreme Deity',
    tierNumber: 11,
    minTrophies: 3500,
    maxTrophies: 999999,
    primaryColor: '#fbbf24',
    accentColor: '#d97706',
    glowColor: 'rgba(251, 191, 36, 1.0)',
    artUrl: '',
    animationId: 'deity',
    rewards: { gemsOnPromotion: 2500, unlockedTitle: 'Supreme Deity' },
  },
];

export function getRankFromTrophies(trophies: number): RankDefinition {
  const safeTrophies = Math.max(0, trophies || 0);
  for (let i = RANK_CONFIGS.length - 1; i >= 0; i--) {
    if (safeTrophies >= RANK_CONFIGS[i].minTrophies) {
      return RANK_CONFIGS[i];
    }
  }
  return RANK_CONFIGS[0];
}

export function getNextRank(currentRankId: string): RankDefinition | null {
  const idx = RANK_CONFIGS.findIndex((r) => r.id === currentRankId);
  if (idx !== -1 && idx < RANK_CONFIGS.length - 1) {
    return RANK_CONFIGS[idx + 1];
  }
  return null;
}

export interface RankProgressInfo {
  currentTrophies: number;
  currentRank: RankDefinition;
  nextRank: RankDefinition | null;
  progressPercent: number; // 0 to 100
  trophiesRemaining: number;
}

export function getRankProgress(trophies: number): RankProgressInfo {
  const currentRank = getRankFromTrophies(trophies);
  const nextRank = getNextRank(currentRank.id);

  if (!nextRank) {
    return {
      currentTrophies: trophies,
      currentRank,
      nextRank: null,
      progressPercent: 100,
      trophiesRemaining: 0,
    };
  }

  const range = nextRank.minTrophies - currentRank.minTrophies;
  const currentInTier = Math.max(0, trophies - currentRank.minTrophies);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100)));
  const trophiesRemaining = Math.max(0, nextRank.minTrophies - trophies);

  return {
    currentTrophies: trophies,
    currentRank,
    nextRank,
    progressPercent,
    trophiesRemaining,
  };
}

// Default constants for Trophy Calculation Math
export const LEAGUE_MATH_CONSTANTS = {
  WIN_BASE: 20,
  WIN_VS_HIGHER: 25,
  WIN_VS_LOWER: 15,
  LOSS_BASE: -10,
  LOSS_VS_HIGHER: -5,
  LOSS_VS_LOWER: -12,
  DRAW_LOWER_GAIN: 2,
  DRAW_HIGHER_LOSS: -2,
  BOT_WIN_MULTIPLIER: 0.5, // 50% gain against bots
  BOT_LOSS_MULTIPLIER: 0,   // Loss to bot costs 0
  PROMOTION_SHIELD_MATCHES: 3,
};
