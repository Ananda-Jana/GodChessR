import { HeroDefinition } from '../types/heroDuelTypes';

export const PART_KING_KONG: HeroDefinition = {
  id: 'part-king-kong',
  name: 'Part King Kong',
  title: 'The Brute',
  role: 'Heavy Brawler / Crowd Controller',
  movementDescription: '1 square in any of the 8 directions.',
  active: {
    id: 'ground_slam',
    name: 'Ground Slam',
    description: 'All enemy heroes in the 3x3 area around Kong are pushed 1 square directly away. If blocked by a piece or board edge, that enemy is Rooted for its next turn instead. Pushes never capture.',
    baseCooldown: 5,
    rangeSquares: 1,
    requiresTarget: false,
    targetType: 'self',
  },
  passives: [
    {
      id: 'thick_hide',
      name: 'Thick Hide',
      description: 'The first capture attempt against Kong each match fails; the attacker is pushed back 1 square and the passive is expended.',
      isOneTime: true,
    },
    {
      id: 'rampage',
      name: 'Rampage',
      description: 'After Kong captures an enemy, if another enemy is adjacent to his new square, he may chain-capture that one immediately (one chain only). Internal CD 3.',
      cooldownMax: 3,
    },
  ],
  weakness: 'Extremely slow and predictable (1 square reach); Thick Hide is one-time only.',
  counterplay: 'Chip off Thick Hide with an expendable unit or strike from range where Rampage cannot chain.',
  avatarIcon: 'Flame',
};
