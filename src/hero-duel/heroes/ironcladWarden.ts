import { HeroDefinition } from '../types/heroDuelTypes';

export const IRONCLAD_WARDEN: HeroDefinition = {
  id: 'ironclad-warden',
  name: 'Ironclad Warden',
  title: 'Wall Tank',
  role: 'Heavy Tank / Bastion',
  movementDescription: 'Orthogonal slider up to 2 squares.',
  active: {
    id: 'bulwark_plant',
    name: 'Bulwark Plant',
    description: 'Create an impassable wall on an empty square within 2 for 3 turns (blocks sliders and leapers cannot land on it).',
    baseCooldown: 5,
    rangeSquares: 2,
    requiresTarget: true,
    targetType: 'empty_square',
  },
  passives: [
    {
      id: 'unmoved',
      name: 'Unmoved',
      description: 'Cannot be pushed, swapped, or teleported by enemy effects.',
    },
    {
      id: 'reprisal',
      name: 'Reprisal',
      description: 'When an adjacent ally is captured, the capturing hero is Rooted for its next turn.',
    },
  ],
  weakness: 'Low mobility (2 orthogonal) and low independent threat; heavily reliant on team positioning.',
  counterplay: 'Bypass his walls using diagonal sliders or pick off distant allies beyond his adjacent revenge radius.',
  avatarIcon: 'Box',
};
