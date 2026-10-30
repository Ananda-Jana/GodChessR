import { HeroDefinition } from '../types/heroDuelTypes';

export const AJX_ASSASSIN: HeroDefinition = {
  id: 'ajx-assassin',
  name: 'AJX',
  title: 'The Phase Assassin',
  role: 'Assassin / Infiltrator',
  movementDescription: 'Diagonal slider up to 2 squares, or 1 square orthogonally.',
  active: {
    id: 'null_jump',
    name: 'Null Jump',
    description: 'Teleport to any empty square within 3 squares distance (ignores intervening blockers).',
    baseCooldown: 4,
    rangeSquares: 3,
    requiresTarget: true,
    targetType: 'empty_square',
  },
  passives: [
    {
      id: 'exploit',
      name: 'Exploit',
      description: 'When AJX captures a hero whose active ability is on cooldown, AJX’s active cooldown is reduced by 2.',
    },
    {
      id: 'low_profile',
      name: 'Low Profile',
      description: 'Cannot be targeted by enemy active abilities unless the enemy hero is adjacent.',
    },
  ],
  weakness: 'Fragile against adjacent heroes; needs setup; lacks multi-target area control.',
  counterplay: 'Trap him with close-quarter tanks or force him into corners where teleport options are limited.',
  avatarIcon: 'Zap',
};
