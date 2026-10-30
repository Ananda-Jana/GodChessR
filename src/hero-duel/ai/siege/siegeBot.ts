import { AiDifficulty } from '../../types/heroDuelTypes';
import { SiegeState } from '../../engine/siege/siegeTypes';

export function runSiegeBotTick(state: SiegeState, difficulty: AiDifficulty): SiegeState {
  // Bot commands team 2 (top)
  if (state.winner) return state;

  const botHeroes = state.heroes.filter((h) => h.team === 2 && h.isAlive);
  if (botHeroes.length === 0) return state;

  // Simple automated bot adjustments per difficulty
  for (const h of botHeroes) {
    if (!h.order && state.tick % 50 === 0) {
      // Periodically assign objectives (e.g. nearest shrine or player throne)
      const targetShrine = state.shrines.find((s) => s.owner !== 2);
      if (targetShrine) {
        h.order = { type: 'capture_shrine', targetCoord: targetShrine.pos };
      } else {
        h.order = { type: 'move', targetCoord: state.thrones.find((th) => th.team === 1)?.pos };
      }
    }
  }

  return state;
}
