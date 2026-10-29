/**
 * server/league.ts - Authoritative Server-Side League Trophy Processor
 */

import { db, UserRecord } from './db.ts';
import {
  getRankFromTrophies,
  LEAGUE_MATH_CONSTANTS,
  RankDefinition,
} from '../src/league/rankConfig.ts';

const processedLeagueMatchIds = new Set<string>();

export interface LeagueTrophyDeltaResult {
  userId: string;
  matchId: string;
  oldTrophies: number;
  newTrophies: number;
  delta: number;
  oldRank: RankDefinition;
  newRank: RankDefinition;
  promoted: boolean;
  demoted: boolean;
  gemsAwarded: number;
  shieldRemaining: number;
}

export interface ProcessLeagueMatchParams {
  matchId: string;
  mode: string;
  whiteUserId?: string;
  blackUserId?: string;
  winnerColor?: 'white' | 'black' | 'draw' | null;
  isBotMatch?: boolean;
  resignedUserId?: string;
}

export function processMatchEndLeagueTrophies(
  params: ProcessLeagueMatchParams
): { whiteResult?: LeagueTrophyDeltaResult; blackResult?: LeagueTrophyDeltaResult } {
  const { matchId, mode, whiteUserId, blackUserId, winnerColor, isBotMatch, resignedUserId } = params;

  if (!matchId || processedLeagueMatchIds.has(matchId)) {
    return {};
  }
  processedLeagueMatchIds.add(matchId);

  // Keep set memory bounded
  if (processedLeagueMatchIds.size > 20000) {
    const arr = Array.from(processedLeagueMatchIds);
    arr.slice(0, 10000).forEach((id) => processedLeagueMatchIds.delete(id));
  }

  const results: { whiteResult?: LeagueTrophyDeltaResult; blackResult?: LeagueTrophyDeltaResult } = {};

  const whiteUser = whiteUserId ? db.findUserById(whiteUserId) : undefined;
  const blackUser = blackUserId ? db.findUserById(blackUserId) : undefined;

  // Process White player
  if (whiteUser) {
    const isWinner = winnerColor === 'white' && resignedUserId !== whiteUserId;
    const isLoser = winnerColor === 'black' || resignedUserId === whiteUserId;
    const isDraw = winnerColor === 'draw' || winnerColor === null;

    const oppRank = blackUser
      ? getRankFromTrophies(blackUser.trophies || 0)
      : getRankFromTrophies(whiteUser.trophies || 0);

    results.whiteResult = updatePlayerLeagueRecord(
      whiteUser,
      matchId,
      isWinner ? 'win' : isLoser ? 'loss' : 'draw',
      oppRank,
      Boolean(isBotMatch)
    );
  }

  // Process Black player
  if (blackUser && !isBotMatch) {
    const isWinner = winnerColor === 'black' && resignedUserId !== blackUserId;
    const isLoser = winnerColor === 'white' || resignedUserId === blackUserId;
    const isDraw = winnerColor === 'draw' || winnerColor === null;

    const oppRank = whiteUser
      ? getRankFromTrophies(whiteUser.trophies || 0)
      : getRankFromTrophies(blackUser.trophies || 0);

    results.blackResult = updatePlayerLeagueRecord(
      blackUser,
      matchId,
      isWinner ? 'win' : isLoser ? 'loss' : 'draw',
      oppRank,
      false
    );
  }

  return results;
}

function updatePlayerLeagueRecord(
  user: UserRecord,
  matchId: string,
  outcome: 'win' | 'loss' | 'draw',
  oppRank: RankDefinition,
  isBotMatch: boolean
): LeagueTrophyDeltaResult {
  const oldTrophies = user.trophies || 0;
  const oldRank = getRankFromTrophies(oldTrophies);
  let shieldMatches = user.shieldMatches || 0;

  let baseDelta = 0;

  if (outcome === 'win') {
    // Win awards 90 to 120 trophies
    baseDelta = Math.floor(90 + Math.random() * 31);
  } else if (outcome === 'loss') {
    // Loss awards 20 to 30 trophies
    baseDelta = Math.floor(20 + Math.random() * 11);
  } else {
    // Draw awards 50 to 70 trophies
    baseDelta = Math.floor(50 + Math.random() * 21);
  }

  // Handle promotion shield protection
  if (baseDelta < 0 && shieldMatches > 0) {
    baseDelta = 0;
    shieldMatches--;
  }

  let newTrophies = Math.max(0, oldTrophies + baseDelta);
  const actualDelta = newTrophies - oldTrophies;
  const newRank = getRankFromTrophies(newTrophies);

  const promoted = newRank.tierNumber > oldRank.tierNumber;
  const demoted = newRank.tierNumber < oldRank.tierNumber;

  let gemsAwarded = 0;
  if (promoted) {
    shieldMatches = LEAGUE_MATH_CONSTANTS.PROMOTION_SHIELD_MATCHES;
    gemsAwarded = newRank.rewards.gemsOnPromotion || 0;
  }

  // Update user record in memory and disk
  user.trophies = newTrophies;
  user.leagueRank = newRank.id;
  user.shieldMatches = shieldMatches;

  if (!user.leagueStats) {
    user.leagueStats = { wins: 0, losses: 0, draws: 0, peakTrophies: newTrophies };
  }
  if (outcome === 'win') user.leagueStats.wins++;
  if (outcome === 'loss') user.leagueStats.losses++;
  if (outcome === 'draw') user.leagueStats.draws++;
  user.leagueStats.peakTrophies = Math.max(user.leagueStats.peakTrophies || 0, newTrophies);

  db.saveUser(user);

  return {
    userId: user.id,
    matchId,
    oldTrophies,
    newTrophies,
    delta: actualDelta,
    oldRank,
    newRank,
    promoted,
    demoted,
    gemsAwarded,
    shieldRemaining: shieldMatches,
  };
}
