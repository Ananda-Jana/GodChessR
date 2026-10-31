import { SiegeState, SiegeHeroInstance, Coord, PlayerAction } from '../../engine/siege/siegeTypes';
import { getValidHeroMoves, isCoordOnShrine } from '../../engine/siege/siegeSim';
import { SIEGE_CONFIG } from '../../config/siegeConfig';

export type Difficulty = 'easy' | 'normal' | 'hard';

/**
 * Calculates balanced bot moves for the current turn based on difficulty.
 * Features:
 * - Squad division: 2 heroes assigned to West Shrine, 2 assigned to East Shrine.
 * - Dynamic flank & threat targeting using Manhattan distance.
 * - Randomized selection among equal-tier moves to prevent left-side bias.
 */
export function calculateBotTurnMoves(
  state: SiegeState,
  difficulty: Difficulty = 'normal'
): PlayerAction[] {
  if (state.winner) return [];

  const botHeroes = state.heroes.filter((h) => h.team === 2 && h.isAlive);
  const playerHeroes = state.heroes.filter((h) => h.team === 1 && h.isAlive);

  if (botHeroes.length === 0) return [];

  // Allowed move limits according to difficulty
  let maxMoves = 2;
  if (difficulty === 'easy') maxMoves = 1;
  else if (difficulty === 'hard') maxMoves = botHeroes.length;

  const actions: PlayerAction[] = [];
  const claimedDestinations = new Set<string>();

  const coordKey = (c: Coord) => `${c.x},${c.y}`;

  // Defined shrine center positions for squad assignment
  const westShrineTarget: Coord = { x: 1, y: 3 }; // West Shrine (s-left)
  const eastShrineTarget: Coord = { x: 5, y: 3 }; // East Shrine (s-right)

  // Shuffle bot heroes order slightly per turn to avoid rigid move order bias
  const sortedBotHeroes = [...botHeroes].sort((a, b) => {
    return (a.instanceId.localeCompare(b.instanceId));
  });

  for (let idx = 0; idx < sortedBotHeroes.length; idx++) {
    if (actions.length >= maxMoves) break;

    const hero = sortedBotHeroes[idx];
    const { moves, attacks, shrines } = getValidHeroMoves(hero, state);

    if (moves.length === 0 && attacks.length === 0 && shrines.length === 0) {
      continue;
    }

    let chosenAction: PlayerAction | null = null;
    const subOptimalRoll = Math.random();

    // 1. Easy Bot Suboptimal Chance (35% to pick random valid move)
    if (difficulty === 'easy' && subOptimalRoll < 0.35) {
      const allCandidates = [...attacks, ...shrines, ...moves].filter(
        (c) => !claimedDestinations.has(coordKey(c))
      );
      if (allCandidates.length > 0) {
        const randomTarget = allCandidates[Math.floor(Math.random() * allCandidates.length)];
        chosenAction = { heroInstanceId: hero.instanceId, targetPos: randomTarget };
      }
    }

    // 2. Attack Priority: Target lowest HP adjacent enemy hero (or pawn)
    if (!chosenAction && attacks.length > 0) {
      let bestAttackTargets: Coord[] = [];
      let lowestHp = Infinity;

      for (const atk of attacks) {
        const targetHero = playerHeroes.find((p) => p.pos.x === atk.x && p.pos.y === atk.y);
        const hp = targetHero ? targetHero.hp : 999;
        if (hp < lowestHp) {
          lowestHp = hp;
          bestAttackTargets = [atk];
        } else if (hp === lowestHp) {
          bestAttackTargets.push(atk);
        }
      }

      if (bestAttackTargets.length > 0) {
        const pickedAtk = bestAttackTargets[Math.floor(Math.random() * bestAttackTargets.length)];
        chosenAction = { heroInstanceId: hero.instanceId, targetPos: pickedAtk };
      }
    }

    // 3. Shrine Capture / Hold Priority with Squad Flank Division
    if (!chosenAction) {
      const isAlreadyOnShrine = isCoordOnShrine(hero.pos);
      if (isAlreadyOnShrine && (difficulty === 'normal' || difficulty === 'hard') && Math.random() < 0.65) {
        // Hold position on shrine with 50% damage reduction Guard Stance
        chosenAction = { heroInstanceId: hero.instanceId, targetPos: hero.pos, isHold: true };
      } else if (shrines.length > 0) {
        const availableShrines = shrines.filter((s) => !claimedDestinations.has(coordKey(s)));
        if (availableShrines.length > 0) {
          // Assign squad flank: Even index -> West, Odd index -> East
          const assignedShrineCenter = idx % 2 === 0 ? westShrineTarget : eastShrineTarget;
          availableShrines.sort((a, b) => {
            const distA = Math.abs(a.x - assignedShrineCenter.x) + Math.abs(a.y - assignedShrineCenter.y);
            const distB = Math.abs(b.x - assignedShrineCenter.x) + Math.abs(b.y - assignedShrineCenter.y);
            return distA - distB;
          });
          chosenAction = { heroInstanceId: hero.instanceId, targetPos: availableShrines[0] };
        }
      }
    }

    // 4. Strategic Advance Toward Assigned Shrine or Nearest Player Threat
    if (!chosenAction && moves.length > 0) {
      // Squad division primary destination: West or East Shrine
      const primaryTarget: Coord = idx % 2 === 0 ? westShrineTarget : eastShrineTarget;

      // Find nearest player hero as secondary target
      let nearestEnemy: Coord | null = null;
      let minEnemyDist = Infinity;
      for (const ph of playerHeroes) {
        const d = Math.abs(hero.pos.x - ph.pos.x) + Math.abs(hero.pos.y - ph.pos.y);
        if (d < minEnemyDist) {
          minEnemyDist = d;
          nearestEnemy = ph.pos;
        }
      }

      // Target point: weight shrine higher early game, threat higher if near
      const targetPoint = (minEnemyDist <= 2 && nearestEnemy) ? nearestEnemy : primaryTarget;

      let bestMoves: Coord[] = [];
      let minMoveDist = Infinity;

      for (const m of moves) {
        if (claimedDestinations.has(coordKey(m))) continue;
        const dist = Math.abs(m.x - targetPoint.x) + Math.abs(m.y - targetPoint.y);
        if (dist < minMoveDist) {
          minMoveDist = dist;
          bestMoves = [m];
        } else if (dist === minMoveDist) {
          bestMoves.push(m);
        }
      }

      if (bestMoves.length > 0) {
        const pickedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        chosenAction = { heroInstanceId: hero.instanceId, targetPos: pickedMove };
      }
    }

    if (chosenAction) {
      if (!chosenAction.isHold) {
        claimedDestinations.add(coordKey(chosenAction.targetPos));
      }
      actions.push(chosenAction);
    }
  }

  return actions;
}
