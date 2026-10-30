import { HeroDefinition } from '../types/heroDuelTypes';

export const MUGEN_KING: HeroDefinition = {
  id: 'mugen-king',
  name: 'MugenKING',
  title: 'The Sovereign',
  role: 'Captain / Commander',
  movementDescription: '1 square any direction, or 2 squares in a straight orthogonal line if the path is empty.',
  active: {
    id: 'boundless_decree',
    name: 'Boundless Decree',
    description: 'Swap places with any friendly hero within 3 squares (line of sight not required).',
    baseCooldown: 4,
    rangeSquares: 3,
    requiresTarget: true,
    targetType: 'ally_hero',
  },
  passives: [
    {
      id: 'second_crown',
      name: 'Second Crown',
      description: 'Once per match, if captured, MugenKING is not removed; it is relocated to the nearest empty square in its own back two rows. The capturer remains on the capture square.',
      isOneTime: true,
    },
    {
      id: 'royal_silence',
      name: 'Royal Silence',
      description: 'Enemy heroes adjacent to MugenKING cannot use active abilities.',
    },
  ],
  weakness: 'Short combat reach, becomes a prime target; Second Crown triggers once only.',
  counterplay: 'Bait Second Crown early with long-range sliders or sacrifice plays, then corner him.',
  avatarIcon: 'Crown',
};
