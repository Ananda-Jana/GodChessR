import { HeroDefinition } from '../types/heroDuelTypes';

export const MALEVOLENT_PRIEST: HeroDefinition = {
  id: 'malevolent-priest',
  name: 'Malevolent Shrine Priest',
  title: 'Curse Controller',
  role: 'Zone Controller / Disruptor',
  movementDescription: 'Diagonal slider up to 3 squares.',
  active: {
    id: 'desecrated_ground',
    name: 'Desecrated Ground',
    description: 'Place a shrine on an empty square within 4 for 3 turns. Enemy heroes starting their turn within 1 square of the shrine are Slowed (movement range -1, min 1).',
    baseCooldown: 5,
    rangeSquares: 4,
    requiresTarget: true,
    targetType: 'empty_square',
  },
  passives: [
    {
      id: 'ritual_toll',
      name: 'Ritual Toll',
      description: 'Whenever an enemy hero is captured by any ally, reduce the Priest’s active cooldown by 1.',
    },
    {
      id: 'ofuda_seal',
      name: 'Ofuda Seal',
      description: 'The Priest cannot be captured by enemy heroes moving from more than 1 square away (sliders cannot take it from range; knights/leapers and adjacent attackers can).',
    },
  ],
  weakness: 'Weak against short-step attackers and fast leapers; cannot move orthogonally.',
  counterplay: 'Advance leapers (Captain Englland, BlackMonkey) or close the distance before striking.',
  avatarIcon: 'Torii',
};
