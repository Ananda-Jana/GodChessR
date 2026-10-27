/**
 * Game End Reporting Hub
 * Fire-and-forget bridge called by game modes to evaluate and schedule reward chests.
 */

import { CHEST_ENABLED, MIN_MOVES } from './chestConfig';
import { isMatchAwarded, recordAwardedMatch, addPendingChestEvent, popPendingChestEvent } from './chestStore';

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
  directOpen?: boolean;
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
 * Instantly triggers opening of a pending chest modal for the specified user.
 */
export function triggerChestModalNow(userId?: string, directOpen = true): void {
  try {
    const pendingEvent = popPendingChestEvent(userId);
    if (pendingEvent) {
      pendingEvent.directOpen = directOpen;
      listeners.forEach((listener) => {
        try {
          listener(pendingEvent);
        } catch {
          // Ignore listener errors
        }
      });
    }
  } catch {
    // Fail safe
  }
}

/**
 * Report a finished match. Completely safe, asynchronous, and non-blocking.
 * Triggers the instant post-game chest award prompt modal.
 */
export function reportGameEnd(report: GameEndReport): void {
  try {
    if (!CHEST_ENABLED) return;
    if (report.isTraining) return;

    // Deduplication check
    if (isMatchAwarded(report.matchId, report.userId)) return;

    // Record match ID to prevent duplicate awards
    recordAwardedMatch(report.matchId, report.userId);

    const outcome: 'win' | 'loss' = report.result === 'loss' ? 'loss' : 'win';

    const event: ChestTriggerEvent = {
      matchId: report.matchId,
      mode: report.mode,
      result: outcome,
      userId: report.userId,
      resigned: report.resigned,
      directOpen: false, // Show prompt first with "Open Now" vs "Save to Inventory"
    };

    // Store in pending in case player saves or refreshes
    addPendingChestEvent(event, report.userId);

    // Instantly notify listeners to display the post-game chest award modal
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Safe fail
      }
    });
  } catch {
    // Fail silently, never throwing into game-over flow
  }
}
