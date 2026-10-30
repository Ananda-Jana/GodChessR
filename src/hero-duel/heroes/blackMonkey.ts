import { HeroDefinition } from '../types/heroDuelTypes';

export const BLACK_MONKEY: HeroDefinition = {
  id: 'black-monkey',
  name: 'BlackMonkey',
  title: 'The Trickster',
  role: 'Trickster / Flanker / Decoy',
  movementDescription: '1 square diagonally, or a 2-square straight orthogonal leap that can jump over any one piece.',
  active: {
    id: 'mirror_troupe',
    name: 'Mirror Troupe',
    description: 'Leave a decoy on the square just vacated (or on current square, stepping 1 square). The decoy blocks like a piece, cannot capture, and vanishes after 2 turns or when captured (wasting the attacker’s action).',
    baseCooldown: 5,
    rangeSquares: 1,
    requiresTarget: false,
    targetType: 'self',
  },
  passives: [
    {
      id: 'treetop',
      name: 'Treetop',
      description: 'When standing on any border square, BlackMonkey cannot be captured by sliders (leapers and adjacent steppers still can).',
    },
    {
      id: 'pilfer',
      name: 'Pilfer',
      description: 'When BlackMonkey captures an enemy hero, all enemy active ability cooldowns increase by +1.',
    },
  ],
  weakness: 'Needs board edges for safety; decoys do not deal damage and can be sidestepped by experienced players.',
  counterplay: 'Flush him into the interior 5x6 squares where Treetop protection is inactive.',
  avatarIcon: 'Sparkles',
};
