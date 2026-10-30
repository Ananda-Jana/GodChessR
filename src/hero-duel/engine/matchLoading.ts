/**
 * Match loading and room generation logic for Hero Duel,
 * borrowing the deterministic bot-match setup from the Culling Game.
 */

import { HeroDuelMatchState, MatchPhase, HeroId } from '../types/heroDuelTypes';
import { getRandomBalancedDraft } from '../heroes/heroRegistry';
import { BoardPosition } from '../config/boardConfig';

export function createBotMatch(matchId: string, aiDifficulty: 'easy' | 'normal' | 'hard'): HeroDuelMatchState {
  const player1Draft = getRandomBalancedDraft();
  const player2Draft = getRandomBalancedDraft();

  // Similar to Culling Game's symmetric board setup
  const player1Positions: BoardPosition[] = [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
  ];
  const player2Positions: BoardPosition[] = [
    { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 },
  ];

  return {
    id: matchId,
    phase: 'battle',
    turnNumber: 1,
    activeSide: 'player1',
    player1: {
      name: 'Player',
      isAi: false,
      heroes: player1Draft.heroes.map((hId, idx) => ({
        instanceId: `p1_${hId}_${idx}`,
        heroId: hId as HeroId,
        owner: 'player1',
        position: player1Positions[idx] || { x: idx, y: 0 },
        isCaptain: hId === player1Draft.captainId,
        isAlive: true,
        currentCooldown: 0,
        passiveCooldowns: {},
        passiveUsedFlags: {},
        statuses: [],
      })),
      equipmentPowerSpent: 0,
    },
    player2: {
      name: `AI (${aiDifficulty})`,
      isAi: true,
      aiLevel: aiDifficulty,
      heroes: player2Draft.heroes.map((hId, idx) => ({
        instanceId: `p2_${hId}_${idx}`,
        heroId: hId as HeroId,
        owner: 'player2',
        position: player2Positions[idx] || { x: idx, y: 8 },
        isCaptain: hId === player2Draft.captainId,
        isAlive: true,
        currentCooldown: 0,
        passiveCooldowns: {},
        passiveUsedFlags: {},
        statuses: [],
      })),
      equipmentPowerSpent: 0,
    },
    zones: [],
    history: [],
    boardPositionsHistory: [],
    killsThisMatch: [],
  };
}
