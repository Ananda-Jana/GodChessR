/**
 * Bounded, Smooth Skill Rating Engine & Performance Evaluator
 */

import type { GameModeKey, PlayerActionObserved, RatingSnapshot, TacticalMetrics } from './types';

export const INITIAL_BASELINE_RATING = 500;
export const MIN_RATING = 100;
export const MAX_RATING = 3200;
const K_FACTOR = 28;
const MAX_SINGLE_MOVE_DELTA = 30;

/**
 * Calculates incremental performance rating score (0.0 to 1.0) for an observed move action.
 */
export function evaluateMoveQuality(action: PlayerActionObserved, prevMetrics: TacticalMetrics): number {
  let score = 0.5; // Neutral baseline move quality

  // Capture bonus (weighted by captured piece value if known)
  if (action.isCapture) {
    if (action.capturedType?.includes('queen') || action.capturedType?.includes('sovereign') || action.capturedType?.includes('vanguard')) {
      score += 0.35;
    } else if (action.capturedType?.includes('rook') || action.capturedType?.includes('artillery') || action.capturedType?.includes('warden')) {
      score += 0.25;
    } else if (action.capturedType?.includes('bishop') || action.capturedType?.includes('knight') || action.capturedType?.includes('bulwark')) {
      score += 0.20;
    } else {
      score += 0.15;
    }
  }

  // Check condition bonus
  if (action.isCheck) {
    score += 0.15;
  }

  // Mode special ability bonus (Domain Step, Prince move, Love Link, Crafting)
  if (action.isSpecialAbility) {
    score += 0.15;
  }

  // Defensive resilience bonus if player was previously in check
  if (prevMetrics.checksDefendedCount > 0 && !action.isCheck) {
    score += 0.10;
  }

  // Clamp performance signal to [0.0, 1.0]
  return Math.max(0.0, Math.min(1.0, score));
}

/**
 * Computes the new session rating incrementally after a single valid move.
 */
export function calculateMoveRatingUpdate(
  currentRating: number,
  movePerformanceScore: number,
  moveIndex: number
): { newRating: number; delta: number; tacticalQuality: number } {
  // Confidence factor scales with moves played so early moves don't swing violently
  const confidence = Math.min(1.0, 0.35 + moveIndex * 0.05);

  // Performance delta centered around 0.5
  let rawDelta = K_FACTOR * (movePerformanceScore - 0.5) * confidence;

  // Bound single move delta
  rawDelta = Math.max(-MAX_SINGLE_MOVE_DELTA, Math.min(MAX_SINGLE_MOVE_DELTA, rawDelta));

  // Compute and bound new rating
  const newRating = Math.max(MIN_RATING, Math.min(MAX_RATING, Math.round(currentRating + rawDelta)));
  const actualDelta = newRating - currentRating;
  const tacticalQuality = Math.round(movePerformanceScore * 100);

  return {
    newRating,
    delta: actualDelta,
    tacticalQuality,
  };
}

/**
 * Applies a performance-weighted match result adjustment upon match completion.
 * Win range: +50 to +200 | Draw range: +20 to +50 | Loss range: -50 to -200
 */
export function applyMatchResultAdjustment(
  currentRating: number,
  outcome: 'win' | 'loss' | 'draw',
  metrics: TacticalMetrics,
  opponentDifficulty?: 'grandmaster' | 'master' | 'pvp_human' | 'couples_partner'
): { finalRating: number; resultDelta: number } {
  let adjustment = 0;

  let multiplier = 1.0;
  if (opponentDifficulty === 'grandmaster') multiplier = 1.35;
  else if (opponentDifficulty === 'master') multiplier = 1.15;

  // Performance score derived from metrics (0.0 to 1.0)
  const capturesFactor = Math.min(1.0, metrics.capturesMade / 6);
  const turnsFactor = Math.min(1.0, metrics.turnsSurvived / 25);
  const specialFactor = Math.min(1.0, metrics.specialActionsCount / 3);
  const performanceBonus = capturesFactor * 0.4 + turnsFactor * 0.3 + specialFactor * 0.3;

  if (outcome === 'win') {
    // Base win bonus +75, plus up to +75 performance bonus, scaled by multiplier (+50 to +200)
    const rawWin = (75 + performanceBonus * 75) * multiplier;
    adjustment = Math.round(Math.min(200, Math.max(50, rawWin)));
  } else if (outcome === 'draw') {
    // Range: +20 to +50
    const rawDraw = (20 + performanceBonus * 25) * multiplier;
    adjustment = Math.round(Math.min(50, Math.max(20, rawDraw)));
  } else if (outcome === 'loss') {
    // Range: -50 to -200 (well-fought loss with captures/resilience reduces penalty to -50)
    const rawLoss = -180 + performanceBonus * 120;
    adjustment = Math.round(Math.max(-200, Math.min(-50, rawLoss)));
  }

  const finalRating = Math.max(MIN_RATING, Math.min(MAX_RATING, currentRating + adjustment));
  return {
    finalRating,
    resultDelta: finalRating - currentRating,
  };
}

/**
 * Determines whether a rating prediction is provisional (< 5 total moves).
 */
export function isProvisionalRating(movesCount: number): boolean {
  return movesCount < 5;
}
