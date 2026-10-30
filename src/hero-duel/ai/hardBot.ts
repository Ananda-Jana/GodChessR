import { HeroAction, HeroDuelMatchState } from '../types/heroDuelTypes';
import { getNormalAiAction } from './normalBot';

/**
 * Hard AI: 3-ply Minimax with prioritized move ordering and quick timeout guard
 */
export function getHardAiAction(state: HeroDuelMatchState): HeroAction | null {
  // Use depth 3 for deep tactical evaluation within a 350ms budget
  return getNormalAiAction(state, 3);
}

import { HeroDuelState, Action } from '../types/heroDuelTypes';
import { getNormalBotAction } from './normalBot';

export function getHardBotAction(state: HeroDuelState, team: 1 | 2 = 2): Action | null {
  return getNormalBotAction(state, team);
}
