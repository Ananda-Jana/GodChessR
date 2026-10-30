import { getLegalAbilitiesForHero, getLegalMovesForHero } from '../engine/moveGenerator';
import { HeroAction, HeroDuelMatchState } from '../types/heroDuelTypes';

/**
 * Easy AI: Random legal move with 1-ply capture heuristic
 */
export function getEasyAiAction(state: HeroDuelMatchState): HeroAction | null {
  const activeSide = state.activeSide;
  const heroes = activeSide === 'player1' ? state.player1.heroes : state.player2.heroes;
  const aliveHeroes = heroes.filter((h) => h.isAlive);
  if (aliveHeroes.length === 0) return null;

  const allHeroes = [...state.player1.heroes, ...state.player2.heroes];
  const allActions: HeroAction[] = [];
  const captureActions: HeroAction[] = [];

  for (const hero of aliveHeroes) {
    const moves = getLegalMovesForHero(hero, allHeroes, state.zones);
    for (const m of moves) {
      const act: HeroAction = {
        type: 'move',
        actorInstanceId: hero.instanceId,
        from: hero.position,
        to: m.to,
      };
      allActions.push(act);
      if (m.isCapture) {
        captureActions.push(act);
      }
    }

    const abilities = getLegalAbilitiesForHero(hero, allHeroes, state.zones);
    for (const ab of abilities) {
      allActions.push({
        type: 'ability',
        actorInstanceId: hero.instanceId,
        from: hero.position,
        to: ab.targetPos,
        abilityId: ab.abilityId,
        targetInstanceId: ab.targetHeroInstanceId,
        path: ab.path,
      });
    }
  }

  // If there are capture opportunities, pick one with 75% probability
  if (captureActions.length > 0 && Math.random() < 0.75) {
    return captureActions[Math.floor(Math.random() * captureActions.length)];
  }

  if (allActions.length === 0) return null;
  return allActions[Math.floor(Math.random() * allActions.length)];
}

import { HeroDuelState, Action } from '../types/heroDuelTypes';
import { getLegalHeroMoves, getValidActiveTargets } from '../engine/heroDuelEngine';

export function getEasyBotAction(state: HeroDuelState, team: 1 | 2 = 2): Action | null {
  const activeHeroes = state.heroes.filter((h) => h.isAlive && h.team === team);
  if (activeHeroes.length === 0) return null;

  const candidateActions: Action[] = [];
  const captureActions: Action[] = [];

  for (const hero of activeHeroes) {
    const moves = getLegalHeroMoves(state, hero);
    for (const m of moves) {
      const isCap = state.heroes.some(
        (other) => other.isAlive && other.team !== team && other.pos.x === m.x && other.pos.y === m.y
      );
      const act: Action = {
        type: 'move',
        team,
        from: hero.pos,
        to: m,
      };
      candidateActions.push(act);
      if (isCap) captureActions.push(act);
    }

    if (hero.currentCooldown === 0 && !hero.isSilenced) {
      const targets = getValidActiveTargets(state, hero);
      if (targets.length > 0) {
        candidateActions.push({
          type: 'active',
          team,
          from: hero.pos,
          target: targets[0],
        });
      }
    }
  }

  if (captureActions.length > 0 && Math.random() < 0.75) {
    return captureActions[Math.floor(Math.random() * captureActions.length)];
  }

  if (candidateActions.length === 0) return null;
  return candidateActions[Math.floor(Math.random() * candidateActions.length)];
}
