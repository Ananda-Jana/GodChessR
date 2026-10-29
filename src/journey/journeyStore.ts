/**
 * journeyStore.ts - LocalStorage Persistence & State Manager for Journey Mode
 *
 * Dedicated storage namespace: `journey_progress_v1_{userId}`
 * Never touches or interferes with `mugen_*` storage keys or schemas.
 * Includes in-memory fallback dictionary for private/restricted browser environments.
 */

import type { JourneyProgress, JourneyNodeProgress } from './journeyTypes';
import { JOURNEY_NODES } from './journeyNodes';
import { addGems } from '../economy/mugenStore';

const JOURNEY_STORAGE_PREFIX = 'journey_progress_v1_';

// In-memory fallback dictionary
const journeyMemoryFallback: Record<string, JourneyProgress> = {};

function getStorageKey(userId?: string): string {
  return `${JOURNEY_STORAGE_PREFIX}${userId || 'guest'}`;
}

function notifyJourneyUpdated(userId?: string) {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('journey_progress_updated', {
          detail: { userId: userId || 'guest', timestamp: Date.now() },
        })
      );
    } catch {
      // Ignore
    }
  }
}

/**
 * Creates initial clean Journey state with Node 1 unlocked
 */
export function createDefaultJourneyProgress(userId?: string): JourneyProgress {
  const nodes: Record<string, JourneyNodeProgress> = {};

  JOURNEY_NODES.forEach((node, index) => {
    nodes[node.id] = {
      nodeId: node.id,
      unlocked: index === 0, // Node 1 is unlocked by default
      completed: false,
      stars: 0,
      highScore: 0,
      attemptCount: 0,
    };
  });

  return {
    userId: userId || 'guest',
    nodes,
    totalStars: 0,
    totalJourneyPoints: 0,
    lastActiveNodeId: 'node_1',
    claimedChests: {},
    updatedAt: Date.now(),
  };
}

/**
 * Retrieves Journey progress for user with safe fallback
 */
export function getJourneyProgress(userId?: string): JourneyProgress {
  const key = getStorageKey(userId);

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed: JourneyProgress = JSON.parse(raw);
        if (parsed && parsed.nodes) {
          // Ensure all nodes from definition exist (forward compatibility)
          JOURNEY_NODES.forEach((node, index) => {
            if (!parsed.nodes[node.id]) {
              parsed.nodes[node.id] = {
                nodeId: node.id,
                unlocked: index === 0,
                completed: false,
                stars: 0,
                highScore: 0,
                attemptCount: 0,
              };
            }
          });
          return parsed;
        }
      }
    }
  } catch {
    // Fall through to memory fallback
  }

  if (journeyMemoryFallback[key]) {
    return journeyMemoryFallback[key];
  }

  const initial = createDefaultJourneyProgress(userId);
  journeyMemoryFallback[key] = initial;
  return initial;
}

/**
 * Persists Journey progress
 */
export function saveJourneyProgress(progress: JourneyProgress): void {
  const key = getStorageKey(progress.userId);
  progress.updatedAt = Date.now();
  journeyMemoryFallback[key] = progress;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(progress));
    }
  } catch {
    // Fail silently to memory fallback
  }

  notifyJourneyUpdated(progress.userId);
}

/**
 * Records a victory on a Journey node, awards stars, points, and unlocks the next node
 */
export function recordNodeVictory(
  userId: string | undefined,
  nodeId: string,
  movesCount: number,
  timeRemainingSeconds: number
): {
  starsEarned: number;
  pointsEarned: number;
  gemsEarned: number;
  nextNodeUnlocked?: string;
  isFirstClear: boolean;
} {
  const progress = getJourneyProgress(userId);
  const nodeDef = JOURNEY_NODES.find((n) => n.id === nodeId);
  if (!nodeDef) {
    return { starsEarned: 1, pointsEarned: 0, gemsEarned: 0, isFirstClear: false };
  }

  const current = progress.nodes[nodeId] || {
    nodeId,
    unlocked: true,
    completed: false,
    stars: 0,
    highScore: 0,
    attemptCount: 0,
  };

  const isFirstClear = !current.completed;

  // Calculate stars earned (1 to 3 stars)
  let starsEarned = 1; // base victory
  if (movesCount <= 40) starsEarned++;
  if (timeRemainingSeconds >= 60) starsEarned++;
  starsEarned = Math.min(3, Math.max(1, starsEarned));

  const effectiveStars = Math.max(current.stars, starsEarned);
  const pointsEarned = isFirstClear ? nodeDef.rewardPoints : Math.round(nodeDef.rewardPoints * 0.25);
  const gemsEarned = isFirstClear ? nodeDef.rewardGems : 0;

  // Update current node
  progress.nodes[nodeId] = {
    ...current,
    completed: true,
    stars: effectiveStars,
    bestMovesCount: current.bestMovesCount ? Math.min(current.bestMovesCount, movesCount) : movesCount,
    clearedAt: Date.now(),
    attemptCount: (current.attemptCount || 0) + 1,
  };

  // Find next node in sequence to unlock
  const currentIndex = JOURNEY_NODES.findIndex((n) => n.id === nodeId);
  let nextNodeUnlocked: string | undefined = undefined;

  if (currentIndex >= 0 && currentIndex < JOURNEY_NODES.length - 1) {
    const nextNode = JOURNEY_NODES[currentIndex + 1];
    if (nextNode && progress.nodes[nextNode.id]) {
      progress.nodes[nextNode.id].unlocked = true;
      progress.lastActiveNodeId = nextNode.id;
      nextNodeUnlocked = nextNode.id;
    }
  }

  // Recalculate totals
  let totalStars = 0;
  Object.values(progress.nodes).forEach((n) => {
    totalStars += n.stars || 0;
  });
  progress.totalStars = totalStars;
  progress.totalJourneyPoints += pointsEarned;

  // Award gems directly to Mugen Gem Store if first clear
  if (gemsEarned > 0) {
    addGems(userId || 'guest', gemsEarned);
  }

  saveJourneyProgress(progress);

  return {
    starsEarned,
    pointsEarned,
    gemsEarned,
    nextNodeUnlocked,
    isFirstClear,
  };
}

/**
 * Claims bonus milestone chest along the journey path
 */
export function claimMilestoneChest(
  userId: string | undefined,
  nodeId: string
): { success: boolean; gemsAwarded: number } {
  const progress = getJourneyProgress(userId);
  const nodeDef = JOURNEY_NODES.find((n) => n.id === nodeId);

  if (!nodeDef || !nodeDef.bonusChestRarity) {
    return { success: false, gemsAwarded: 0 };
  }

  // Must have completed the node to open chest
  if (!progress.nodes[nodeId]?.completed) {
    return { success: false, gemsAwarded: 0 };
  }

  // Already claimed
  if (progress.claimedChests && progress.claimedChests[nodeId]) {
    return { success: false, gemsAwarded: 0 };
  }

  const gemsAwarded =
    nodeDef.bonusChestRarity === 'cyber' ? 500 : nodeDef.bonusChestRarity === 'gold' ? 300 : 150;

  if (!progress.claimedChests) {
    progress.claimedChests = {};
  }
  progress.claimedChests[nodeId] = true;

  addGems(userId || 'guest', gemsAwarded);
  saveJourneyProgress(progress);

  return { success: true, gemsAwarded };
}

/**
 * Saves custom avatar for Journey Profile
 */
export function saveCustomAvatar(userId: string | undefined, avatarUrl: string): void {
  const progress = getJourneyProgress(userId);
  progress.customAvatarUrl = avatarUrl;
  saveJourneyProgress(progress);
}

/**
 * Resets user's Journey progress to initial state
 */
export function resetJourneyProgress(userId?: string): JourneyProgress {
  const fresh = createDefaultJourneyProgress(userId);
  saveJourneyProgress(fresh);
  return fresh;
}
