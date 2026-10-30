/**
 * Shrine Siege Configuration Constants
 */

export const SIEGE_CONFIG = {
  COLS: 9,
  ROWS: 13,
  TICK_MS: 100, // 10 ticks per second
  MAX_MATCH_SECONDS: 300, // 5 minutes

  // Board positions
  PLAYER_THRONE: { x: 4, y: 0 }, // 0-indexed: col 5, row 1 => (4,0)
  BOT_THRONE: { x: 4, y: 12 },    // col 5, row 13 => (4,12)

  PLAYER_TOWERS: [
    { x: 2, y: 2 }, // col 3, row 3 => (2,2)
    { x: 6, y: 2 }, // col 7, row 3 => (6,2)
  ],
  BOT_TOWERS: [
    { x: 2, y: 10 }, // col 3, row 11 => (2,10)
    { x: 6, y: 10 }, // col 7, row 11 => (6,10)
  ],

  SHRINES: [
    { id: 'left', x: 1, y: 6 },   // col 2, row 7
    { id: 'center', x: 4, y: 6 }, // col 5, row 7
    { id: 'right', x: 7, y: 6 },  // col 8, row 7
  ],

  // Symmetrical obstacles forming 3 lanes (0-indexed x, y)
  OBSTACLES: [
    // Left lane blockers
    { x: 2, y: 5 }, { x: 2, y: 7 },
    // Center lane blockers
    { x: 4, y: 4 }, { x: 4, y: 8 },
    // Right lane blockers
    { x: 6, y: 5 }, { x: 6, y: 7 },
  ],

  // Stats
  THRONE_HP: 12,
  TOWER_HP: 6,
  TOWER_RANGE: 2,
  TOWER_ATTACK_SECONDS: 2.0,
  TOWER_DAMAGE: 1,

  HERO_DEFAULT_HP: 3,
  SHRINE_CAPTURE_SECONDS: 4.0, // 4s to neutralize or capture
  DOMINION_WIN_SCORE: 100,
  DOMINION_GAIN_RATE: 0.83, // per second per shrine advantage (3 shrines vs 0 = 2.5/s)
  COOLDOWN_RECHARGE_BONUS_PER_SHRINE: 0.20, // +20% per shrine held
};
