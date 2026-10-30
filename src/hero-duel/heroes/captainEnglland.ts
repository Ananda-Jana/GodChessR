import { HeroDefinition } from '../types/heroDuelTypes';

export const CAPTAIN_ENGLLAND: HeroDefinition = {
  id: 'captain-englland',
  name: 'Captain Englland',
  title: 'Field Commander',
  role: 'Vanguard / Leaper / Buffer',
  movementDescription: 'Standard Knight-jump (2-by-1 L-shape, jumping over intervening pieces).',
  active: {
    id: 'rally_standard',
    name: 'Rally Standard',
    description: 'Plant a banner on own square for 3 turns (banner stays when Englland leaves). Allies within 1 square get +1 movement range, and cannot be Slowed or Rooted.',
    baseCooldown: 5,
    rangeSquares: 0,
    requiresTarget: false,
    targetType: 'self',
  },
  passives: [
    {
      id: 'vanguard_strike',
      name: 'Vanguard Strike',
      description: 'After Englland captures an enemy hero, it may immediately take a free 1-square non-capturing step.',
    },
    {
      id: 'avenge',
      name: 'Avenge',
      description: 'When an adjacent ally is captured, Englland may use its next move to capture the capturer even if the usual move rule would not allow it (adjacent squares only). Internal CD 3.',
      cooldownMax: 3,
    },
  ],
  weakness: 'Banner is static and destroyed if an enemy captures onto it; knight hops can be restricted in open spaces.',
  counterplay: 'Trample his banner or space your pieces to deny knight fork anchors.',
  avatarIcon: 'Shield',
};
