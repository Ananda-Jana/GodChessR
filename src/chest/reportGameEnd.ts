/**
 * Game End Reporting Hub
 * Fire-and-forget bridge called by game modes to evaluate and schedule reward chests.
 */

import { CHEST_ENABLED, MIN_MOVES, REPORT_DELAY_MS } from './chestConfig';
import { isMatchAwarded, recordAwardedMatch, addPendingChestEvent } from './chestStore';

export interface GameEndReport {
  matchId: string;
  mode: 'standard' | 'crafted' | 'classic' | 'multiplayer' | 'punisher' | 'culling' | 'rose' | string;
  result: 'win' | 'loss' | 'draw' | null | undefined;
  moves: number;
  isTraining?: boolean;
  userId?: string;
  resigned?: boolean;
}

export interface ChestTriggerEvent {
  matchId: string;
  mode: string;
  result: 'win' | 'loss';
  userId?: string;
  resigned?: boolean;
  eloBoost?: number;
}

type ChestListener = (event: ChestTriggerEvent) => void;

const listeners = new Set<ChestListener>();

export function subscribeToChestTriggers(listener: ChestListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Report a finished match. Completely safe, asynchronous, and non-blocking.
 */
export function reportGameEnd(report: GameEndReport): void {
  try {
    if (!CHEST_ENABLED) return;
    if (report.isTraining) return;

    // Only wins and losses qualify (draws, aborts, abandonments give no chest)
    if (report.result !== 'win' && report.result !== 'loss') return;

    // Anti-farming: minimum player moves required
    if (typeof report.moves !== 'number' || report.moves < MIN_MOVES) return;

    // Deduplication check
    if (isMatchAwarded(report.matchId, report.userId)) return;

    // Record match ID to prevent duplicate awards
    recordAwardedMatch(report.matchId, report.userId);

    const event: ChestTriggerEvent = {
      matchId: report.matchId,
      mode: report.mode,
      result: report.result as 'win' | 'loss',
      userId: report.userId,
      resigned: report.resigned,
    };

    // Store as pending first so unmounting or page navigation never loses the chest
    addPendingChestEvent(event, report.userId);

    // Schedule presentation with delay so player sees result screen first
    setTimeout(() => {
      try {
        listeners.forEach((listener) => {
          try {
            listener(event);
          } catch {
            // Ignore listener errors
          }
        });
      } catch {
        // Ignore dispatch errors
      }
    }, REPORT_DELAY_MS);
  } catch {
    // Fail silently, never throwing into game-over flow
  }
}
