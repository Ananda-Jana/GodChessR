/**
 * Economy tiers and pricing for Hero Duel equipment and crafted sigils
 * Scaled cleanly to Mugen Gems & Mugen Crypto
 */

export type EconomyTier = 'cheap' | 'mid' | 'high' | 'luxury';

export const EQUIPMENT_TIER_PRICES: Record<EconomyTier, { gems: number; crypto: number }> = {
  cheap: { gems: 150, crypto: 0 },
  mid: { gems: 400, crypto: 0 },
  high: { gems: 850, crypto: 1 },
  luxury: { gems: 1800, crypto: 2 },
};

export const CRAFTED_SIGIL_PRICES = {
  tether: { gems: 500, crypto: 1, shards: 25 },
  veil: { gems: 500, crypto: 1, shards: 25 },
  rift: { gems: 900, crypto: 2, shards: 50 },
  tempo: { gems: 900, crypto: 2, shards: 50 },
  stillness: { gems: 2000, crypto: 4, shards: 100 },
  bastion: { gems: 500, crypto: 1, shards: 25 },
};
