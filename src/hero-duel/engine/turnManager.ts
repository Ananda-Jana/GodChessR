import { HeroDuelMatchState, InGameHeroState, PlayerSide } from '../types/heroDuelTypes';
import { tickHeroStatuses } from './statusManager';
import { tickZonesForSide } from './zoneManager';

export function endTurnAndAdvance(state: HeroDuelMatchState): HeroDuelMatchState {
  const endingSide = state.activeSide;
  const nextSide: PlayerSide = endingSide === 'player1' ? 'player2' : 'player1';

  // Tick cooldowns and statuses for heroes of the ending side
  const updateHeroes = (heroes: InGameHeroState[]): InGameHeroState[] => {
    return heroes.map((hero) => {
      if (hero.owner !== endingSide) return hero;

      // Decrement active cooldown
      const nextCd = Math.max(0, hero.currentCooldown - 1);

      // Decrement internal passive cooldowns
      const nextPassiveCds: Record<string, number> = {};
      for (const [k, v] of Object.entries(hero.passiveCooldowns)) {
        nextPassiveCds[k] = Math.max(0, v - 1);
      }

      // Tick statuses
      const ticked = tickHeroStatuses(hero);

      return {
        ...ticked,
        currentCooldown: nextCd,
        passiveCooldowns: nextPassiveCds,
      };
    });
  };

  const nextP1Heroes = updateHeroes(state.player1.heroes);
  const nextP2Heroes = updateHeroes(state.player2.heroes);

  // Tick zones owned by the ending side
  const nextZones = tickZonesForSide(state.zones, endingSide);

  // Advance turn round counter after Player 2 finishes their turn
  const nextTurnNumber = endingSide === 'player2' ? state.turnNumber + 1 : state.turnNumber;

  return {
    ...state,
    turnNumber: nextTurnNumber,
    activeSide: nextSide,
    player1: {
      ...state.player1,
      heroes: nextP1Heroes,
    },
    player2: {
      ...state.player2,
      heroes: nextP2Heroes,
    },
    zones: nextZones,
    pendingChainHeroInstanceId: undefined,
    pendingFreeStepHeroInstanceId: undefined,
  };
}
