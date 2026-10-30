import { createHeroDuelMatch, executeHeroAction } from '../engine/heroDuelEngine';
import { ALL_HEROES, getRandomBalancedDraft } from '../heroes/heroRegistry';
import { HeroId, PlayerSide } from '../types/heroDuelTypes';
import { getEasyAiAction } from './easyBot';
import { getNormalAiAction } from './normalBot';

export interface BalanceSimulationResults {
  totalMatches: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  p1WinRate: number;
  p2WinRate: number;
  heroAppearances: Record<HeroId, number>;
  heroWins: Record<HeroId, number>;
  heroWinRates: Record<HeroId, number>;
}

export function runBalanceSimulation(matchCount = 100): BalanceSimulationResults {
  let p1Wins = 0;
  let p2Wins = 0;
  let draws = 0;

  const appearances: Record<HeroId, number> = {} as any;
  const wins: Record<HeroId, number> = {} as any;

  for (const h of ALL_HEROES) {
    appearances[h.id] = 0;
    wins[h.id] = 0;
  }

  for (let i = 0; i < matchCount; i++) {
    const draft1 = getRandomBalancedDraft();
    const draft2 = getRandomBalancedDraft();

    for (const hId of draft1.heroes) appearances[hId] += 1;
    for (const hId of draft2.heroes) appearances[hId] += 1;

    let match = createHeroDuelMatch(
      `sim_${i}`,
      'P1_AI',
      'P2_AI',
      true,
      'normal',
      draft1,
      draft2
    );

    let turns = 0;
    const maxSafetyTurns = 120; // 60 full rounds

    while (match.phase === 'battle' && turns < maxSafetyTurns) {
      turns += 1;
      const act =
        match.turnNumber % 2 === 0
          ? getNormalAiAction(match, 1) || getEasyAiAction(match)
          : getEasyAiAction(match);

      if (!act) break;
      const res = executeHeroAction(match, act);
      if (!res.success) break;
      match = res.state;
    }

    if (match.winner === 'player1') {
      p1Wins += 1;
      for (const hId of draft1.heroes) wins[hId] += 1;
    } else if (match.winner === 'player2') {
      p2Wins += 1;
      for (const hId of draft2.heroes) wins[hId] += 1;
    } else {
      draws += 1;
    }
  }

  const winRates: Record<HeroId, number> = {} as any;
  for (const h of ALL_HEROES) {
    const count = appearances[h.id] || 1;
    winRates[h.id] = Number(((wins[h.id] / count) * 100).toFixed(1));
  }

  return {
    totalMatches: matchCount,
    player1Wins: p1Wins,
    player2Wins: p2Wins,
    draws,
    p1WinRate: Number(((p1Wins / matchCount) * 100).toFixed(1)),
    p2WinRate: Number(((p2Wins / matchCount) * 100).toFixed(1)),
    heroAppearances: appearances,
    heroWins: wins,
    heroWinRates: winRates,
  };
}
