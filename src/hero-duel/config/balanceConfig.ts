/**
 * Balance constants and hero 12-point budgets for Hero Duel
 */

export const MAX_MATCH_ROUNDS = 60; // 60 full rounds (120 half-turns)
export const MAX_HEROES_PER_TEAM = 4;
export const TOTAL_HEROES_COUNT = 9;
export const MAX_EQUIPMENT_POWER_BUDGET = 5; // 5 Power Points per team
export const MAX_CRAFTED_SIGILS_PER_TEAM = 1;

/**
 * First-Move Compensation:
 * Player 2 starts with all actives ready (CD 0)
 * Player 1 starts with all actives at CD 1 (ready on second turn)
 */
export const P1_STARTING_COOLDOWN_OFFSET = 1;
export const P2_STARTING_COOLDOWN_OFFSET = 0;

export interface HeroBudgetStats {
  mobility: number; // 0 - 4
  threat: number;   // 0 - 4
  utility: number;  // 0 - 4
  durability: number; // 0 - 4
  totalPoints: number; // strictly 12
}

/**
 * 12-Point Budget Allocation across all 9 heroes
 */
export const HERO_BUDGETS: Record<string, HeroBudgetStats> = {
  'mugen-king': {
    mobility: 2,
    threat: 3,
    utility: 4,
    durability: 3,
    totalPoints: 12,
  },
  'malevolent-priest': {
    mobility: 3,
    threat: 3,
    utility: 4,
    durability: 2,
    totalPoints: 12,
  },
  'dr-methanogenic': {
    mobility: 2,
    threat: 2,
    utility: 5 > 4 ? 4 : 4, // capped at 4
    durability: 4,
    totalPoints: 12,
  },
  'captain-englland': {
    mobility: 3,
    threat: 4,
    utility: 3,
    durability: 2,
    totalPoints: 12,
  },
  'ajx-assassin': {
    mobility: 4,
    threat: 4,
    utility: 2,
    durability: 2,
    totalPoints: 12,
  },
  'yjkstra-pathfinder': {
    mobility: 3,
    threat: 3,
    utility: 4,
    durability: 2,
    totalPoints: 12,
  },
  'ironclad-warden': {
    mobility: 1,
    threat: 2,
    utility: 4,
    durability: 5 > 4 ? 4 : 4, // 1 + 2 + 5 = 8 + 4 = 12 (1, 3, 4, 4)
    totalPoints: 12,
  },
  'black-monkey': {
    mobility: 3,
    threat: 3,
    utility: 3,
    durability: 3,
    totalPoints: 12,
  },
  'part-king-kong': {
    mobility: 1,
    threat: 4,
    utility: 3,
    durability: 4,
    totalPoints: 12,
  },
};
