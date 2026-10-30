import { executeHeroAction } from '../engine/heroDuelEngine';
import { getLegalAbilitiesForHero, getLegalMovesForHero } from '../engine/moveGenerator';
import { HeroAction, HeroDuelMatchState, InGameHeroState, PlayerSide } from '../types/heroDuelTypes';

export function evaluateBoard(state: HeroDuelMatchState, perspective: PlayerSide): number {
  if (state.winner) {
    if (state.winner === perspective) return 10000;
    if (state.winner === 'draw') return 0;
    return -10000;
  }

  const p1 = state.player1.heroes;
  const p2 = state.player2.heroes;

  const scoreTeam = (heroes: InGameHeroState[]): number => {
    let score = 0;
    for (const h of heroes) {
      if (!h.isAlive) continue;
      // Base value: Captain = 600, standard hero = 250
      score += h.isCaptain ? 600 : 250;

      // Cooldown readiness
      if (h.currentCooldown === 0) score += 35;

      // Center proximity (x: 2..4, y: 3..4)
      const distToCenter = Math.abs(h.position.x - 3) + Math.abs(h.position.y - 3.5);
      score += (6 - distToCenter) * 4;
    }
    return score;
  };

  const p1Score = scoreTeam(p1);
  const p2Score = scoreTeam(p2);

  return perspective === 'player1' ? p1Score - p2Score : p2Score - p1Score;
}

export function getAllLegalActions(state: HeroDuelMatchState): HeroAction[] {
  const activeSide = state.activeSide;
  const heroes = activeSide === 'player1' ? state.player1.heroes : state.player2.heroes;
  const aliveHeroes = heroes.filter((h) => h.isAlive);
  const allHeroes = [...state.player1.heroes, ...state.player2.heroes];
  const actions: HeroAction[] = [];

  for (const hero of aliveHeroes) {
    const moves = getLegalMovesForHero(hero, allHeroes, state.zones);
    for (const m of moves) {
      actions.push({
        type: 'move',
        actorInstanceId: hero.instanceId,
        from: hero.position,
        to: m.to,
      });
    }

    const abilities = getLegalAbilitiesForHero(hero, allHeroes, state.zones);
    for (const ab of abilities) {
      actions.push({
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

  // Move ordering: put captures first
  return actions.sort((a, b) => {
    const aIsCap = isActionCapture(state, a);
    const bIsCap = isActionCapture(state, b);
    if (aIsCap && !bIsCap) return -1;
    if (!aIsCap && bIsCap) return 1;
    return 0;
  });
}

function isActionCapture(state: HeroDuelMatchState, action: HeroAction): boolean {
  if (action.type !== 'move') return false;
  const enemyHeroes = state.activeSide === 'player1' ? state.player2.heroes : state.player1.heroes;
  return enemyHeroes.some((h) => h.isAlive && h.position.x === action.to.x && h.position.y === action.to.y);
}

/**
 * Normal AI: 2-ply Minimax with Alpha-Beta pruning
 */
export function getNormalAiAction(state: HeroDuelMatchState, maxDepth = 2): HeroAction | null {
  const actions = getAllLegalActions(state);
  if (actions.length === 0) return null;

  const perspective = state.activeSide;
  let bestScore = -Infinity;
  let bestAction: HeroAction = actions[0];

  for (const action of actions) {
    const res = executeHeroAction(state, action);
    if (!res.success) continue;

    const score = minimax(res.state, maxDepth - 1, -Infinity, Infinity, false, perspective);
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  return bestAction;
}

function minimax(
  state: HeroDuelMatchState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  perspective: PlayerSide
): number {
  if (depth <= 0 || state.phase === 'game_over') {
    return evaluateBoard(state, perspective);
  }

  const actions = getAllLegalActions(state);
  if (actions.length === 0) {
    return evaluateBoard(state, perspective);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const act of actions.slice(0, 14)) {
      const res = executeHeroAction(state, act);
      if (!res.success) continue;
      const evaluation = minimax(res.state, depth - 1, alpha, beta, false, perspective);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const act of actions.slice(0, 14)) {
      const res = executeHeroAction(state, act);
      if (!res.success) continue;
      const evaluation = minimax(res.state, depth - 1, alpha, beta, true, perspective);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

import { HeroDuelState, Action } from '../types/heroDuelTypes';
import { getLegalHeroMoves, getValidActiveTargets } from '../engine/heroDuelEngine';

export function getNormalBotAction(state: HeroDuelState, team: 1 | 2 = 2): Action | null {
  const activeHeroes = state.heroes.filter((h) => h.isAlive && h.team === team);
  if (activeHeroes.length === 0) return null;

  let bestAction: Action | null = null;
  let bestScore = -Infinity;

  for (const hero of activeHeroes) {
    const moves = getLegalHeroMoves(state, hero);
    for (const m of moves) {
      const targetHero = state.heroes.find(
        (other) => other.isAlive && other.team !== team && other.pos.x === m.x && other.pos.y === m.y
      );

      let score = Math.random() * 5;
      if (targetHero) {
        score += targetHero.isCaptain ? 1000 : 250;
      }
      // Proximity to center (x: 3, y: 3.5)
      const centerDist = Math.abs(m.x - 3) + Math.abs(m.y - 3.5);
      score += (6 - centerDist) * 3;

      if (score > bestScore) {
        bestScore = score;
        bestAction = {
          type: 'move',
          team,
          from: hero.pos,
          to: m,
        };
      }
    }

    if (hero.currentCooldown === 0 && !hero.isSilenced) {
      const targets = getValidActiveTargets(state, hero);
      for (const t of targets) {
        const targetHero = state.heroes.find(
          (other) => other.isAlive && other.team !== team && other.pos.x === t.x && other.pos.y === t.y
        );
        let score = 50;
        if (targetHero) {
          score += targetHero.isCaptain ? 800 : 300;
        }
        if (score > bestScore) {
          bestScore = score;
          bestAction = {
            type: 'active',
            team,
            from: hero.pos,
            target: t,
          };
        }
      }
    }
  }

  return bestAction;
}
