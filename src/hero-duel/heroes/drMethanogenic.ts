import { HeroDefinition } from '../types/heroDuelTypes';

export const DR_METHANOGENIC: HeroDefinition = {
  id: 'dr-methanogenic',
  name: 'Dr. Methanogenic',
  title: 'Alchemist of Gas',
  role: 'Area Denial / Debuffer',
  movementDescription: 'Orthogonal slider up to 2 squares.',
  active: {
    id: 'methane_bloom',
    name: 'Methane Bloom',
    description: 'Create a 3x3 gas cloud centered on a square within 3, lasting 2 turns. Enemy heroes inside are Disarmed (can move, cannot capture). Allies are unaffected.',
    baseCooldown: 4,
    rangeSquares: 3,
    requiresTarget: true,
    targetType: 'any_square',
  },
  passives: [
    {
      id: 'anaerobic_adaptation',
      name: 'Anaerobic Adaptation',
      description: 'Immune to all enemy zones and tile hazard effects.',
    },
    {
      id: 'spore_drift',
      name: 'Spore Drift',
      description: 'After Dr. Methanogenic moves, the vacated square becomes a spore tile for 1 turn; enemy heroes entering it are Slowed next turn.',
    },
  ],
  weakness: 'Low capture reach (max 2 orthogonal squares); gas can be stepped out of.',
  counterplay: 'Position heroes around the perimeter or disengage until the gas dissipates.',
  avatarIcon: 'Flask',
};
