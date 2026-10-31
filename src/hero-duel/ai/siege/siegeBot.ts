import { SiegeState, SiegeHeroInstance, Coord, PlayerAction } from '../../engine/siege/siegeTypes';
import { getValidHeroMoves, isCoordOnShrine } from '../../engine/siege/siegeSim';

export type Difficulty = 'easy' | 'normal' | 'hard';

/**
 * Calculates bot moves fresh for the current turn based on difficulty
 * Easy: up to 1 hero move
 * Normal: up to 2 hero moves
 * Hard: moves all heroes with valid moves
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
  else if (difficulty === 'hard') maxMoves = botHeroes.length; // all living heroes

  const actions: PlayerAction[] = [];
  const claimedDestinations = new Set<string>();

  // Helper to key coordinates
  const coordKey = (c: Coord) => `${c.x},${c.y}`;

  // Priority scoring for candidate moves
  for (const hero of botHeroes) {
    if (actions.length >= maxMoves) break;

    const { moves, attacks, shrines } = getValidHeroMoves(hero, state);
    if (moves.length === 0 && attacks.length === 0 && shrines.length === 0) {
      continue; // No valid moves
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

    // 2. Attack Priority: Slay Low HP Player Hero
    if (!chosenAction && attacks.length > 0) {
      // Find lethal or lowest HP player target
      let bestAttackTarget: Coord | null = null;
      let lowestHp = Infinity;

      for (const atk of attacks) {
        const targetHero = playerHeroes.find((p) => p.pos.x === atk.x && p.pos.y === atk.y);
        if (targetHero && targetHero.hp < lowestHp) {
          lowestHp = targetHero.hp;
          bestAttackTarget = atk;
        }
      }

      if (bestAttackTarget) {
        chosenAction = { heroInstanceId: hero.instanceId, targetPos: bestAttackTarget };
      } else {
        // Attack enemy pawn
        chosenAction = { heroInstanceId: hero.instanceId, targetPos: attacks[0] };
      }
    }

    // 3. Shrine Capture / Hold Priority
    if (!chosenAction) {
      // If hero is already on a shrine, they can choose to hold position
      const isAlreadyOnShrine = isCoordOnShrine(hero.pos);
      if (isAlreadyOnShrine && (difficulty === 'normal' || difficulty === 'hard') && Math.random() < 0.6) {
        chosenAction = { heroInstanceId: hero.instanceId, targetPos: hero.pos, isHold: true };
      } else if (shrines.length > 0) {
        // Step onto an available shrine cell
        const availableShrine = shrines.find((s) => !claimedDestinations.has(coordKey(s)));
        if (availableShrine) {
          chosenAction = { heroInstanceId: hero.instanceId, targetPos: availableShrine };
        }
      }
    }

    // 4. Advance Toward Nearest Player Hero or Empty Shrine
    if (!chosenAction && moves.length > 0) {
      let closestTarget = playerHeroes[0]?.pos || { x: 3, y: 7 };
      let bestDist = Infinity;
      let bestMove: Coord | null = null;

      for (const m of moves) {
        if (claimedDestinations.has(coordKey(m))) continue;
        const dist = Math.abs(m.x - closestTarget.x) + Math.abs(m.y - closestTarget.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestMove = m;
        }
      }

      if (bestMove) {
        chosenAction = { heroInstanceId: hero.instanceId, targetPos: bestMove };
      } else if (moves.length > 0 && !claimedDestinations.has(coordKey(moves[0]))) {
        chosenAction = { heroInstanceId: hero.instanceId, targetPos: moves[0] };
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
