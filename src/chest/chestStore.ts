/**
 * Reward Chest Local Persistence & In-Memory Store
 * Completely safe against browser storage restrictions and exceptions.
 */

import { STORAGE_KEY, MAX_PENDING, SECRET_PLAYER_REWARDS, SecretPlayerRewardDef } from './chestConfig';

export interface PendingChestEvent {
  matchId: string;
  mode: string;
  result: 'win' | 'loss';
  userId?: string;
  resigned?: boolean;
  eloBoost?: number;
}

export interface ChestStoreData {
  unlocked: string[];
  pending: number;
  pendingEvents?: PendingChestEvent[];
  awardedMatchIds: string[];
  appliedBoostMatchIds?: string[];
}

const DEFAULT_STORE_DATA: ChestStoreData = {
  unlocked: [],
  pending: 0,
  pendingEvents: [],
  awardedMatchIds: [],
  appliedBoostMatchIds: [],
};

// In-memory fallback if localStorage is disabled, full, or blocked
let memoryFallback: Record<string, ChestStoreData> = {};

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
}

export function getChestStore(userId?: string): ChestStoreData {
  const key = getStorageKey(userId);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          unlocked: Array.isArray(parsed?.unlocked) ? parsed.unlocked : [],
          pending: typeof parsed?.pending === 'number' ? Math.max(0, parsed.pending) : 0,
          pendingEvents: Array.isArray(parsed?.pendingEvents) ? parsed.pendingEvents : [],
          awardedMatchIds: Array.isArray(parsed?.awardedMatchIds) ? parsed.awardedMatchIds : [],
          appliedBoostMatchIds: Array.isArray(parsed?.appliedBoostMatchIds) ? parsed.appliedBoostMatchIds : [],
        };
      }
    }
  } catch {
    // Fail silently to memory fallback
  }

  if (!memoryFallback[key]) {
    memoryFallback[key] = { ...DEFAULT_STORE_DATA };
  }
  return memoryFallback[key];
}

export function saveChestStore(data: ChestStoreData, userId?: string): void {
  const key = getStorageKey(userId);
  const sanitized: ChestStoreData = {
    unlocked: Array.from(new Set(data.unlocked || [])),
    pending: Math.max(0, Math.min(MAX_PENDING, data.pending || 0)),
    pendingEvents: Array.isArray(data.pendingEvents) ? data.pendingEvents.slice(-MAX_PENDING) : [],
    awardedMatchIds: (data.awardedMatchIds || []).slice(-50),
    appliedBoostMatchIds: (data.appliedBoostMatchIds || []).slice(-50),
  };

  memoryFallback[key] = sanitized;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(sanitized));
    }
  } catch {
    // Fail silently to memory fallback
  }
}

export function isMatchAwarded(matchId: string, userId?: string): boolean {
  try {
    const store = getChestStore(userId);
    return store.awardedMatchIds.includes(matchId);
  } catch {
    return false;
  }
}

export function recordAwardedMatch(matchId: string, userId?: string): void {
  try {
    const store = getChestStore(userId);
    if (!store.awardedMatchIds.includes(matchId)) {
      store.awardedMatchIds.push(matchId);
      saveChestStore(store, userId);
    }
  } catch {
    // Ignore error
  }
}

export function addPendingChest(userId?: string): number {
  try {
    const store = getChestStore(userId);
    store.pending = Math.min(MAX_PENDING, store.pending + 1);
    saveChestStore(store, userId);
    return store.pending;
  } catch {
    return 0;
  }
}

export function consumePendingChest(userId?: string): number {
  try {
    const store = getChestStore(userId);
    store.pending = Math.max(0, store.pending - 1);
    saveChestStore(store, userId);
    return store.pending;
  } catch {
    return 0;
  }
}

export function addPendingChestEvent(event: PendingChestEvent, userId?: string): void {
  try {
    const store = getChestStore(userId);
    if (!store.pendingEvents) {
      store.pendingEvents = [];
    }
    // Prevent duplicate entries for the exact same matchId
    const exists = store.pendingEvents.some((e) => e.matchId === event.matchId);
    if (!exists) {
      store.pendingEvents.push(event);
      if (store.pendingEvents.length > MAX_PENDING) {
        store.pendingEvents = store.pendingEvents.slice(-MAX_PENDING);
      }
      store.pending = store.pendingEvents.length;
      saveChestStore(store, userId);
    }
  } catch {
    // Fail safe
  }
}

export function popPendingChestEvent(userId?: string): PendingChestEvent | null {
  try {
    const store = getChestStore(userId);
    if (store.pendingEvents && store.pendingEvents.length > 0) {
      const event = store.pendingEvents.shift()!;
      store.pending = store.pendingEvents.length;
      saveChestStore(store, userId);
      return event;
    }
    if (store.pending > 0) {
      store.pending = Math.max(0, store.pending - 1);
      saveChestStore(store, userId);
      return {
        matchId: `pending_${Date.now()}`,
        mode: 'pending',
        result: 'win',
        userId,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function isBoostApplied(matchId: string, userId?: string): boolean {
  try {
    const store = getChestStore(userId);
    return Boolean(store.appliedBoostMatchIds?.includes(matchId));
  } catch {
    return false;
  }
}

export function recordAppliedBoost(matchId: string, userId?: string): void {
  try {
    const store = getChestStore(userId);
    if (!store.appliedBoostMatchIds) {
      store.appliedBoostMatchIds = [];
    }
    if (!store.appliedBoostMatchIds.includes(matchId)) {
      store.appliedBoostMatchIds.push(matchId);
      saveChestStore(store, userId);
    }
  } catch {
    // Fail safe
  }
}

export function unlockSecretPlayer(playerId: string, userId?: string): { isNewlyUnlocked: boolean } {
  try {
    const store = getChestStore(userId);
    const alreadyUnlocked = store.unlocked.includes(playerId);
    if (!alreadyUnlocked) {
      store.unlocked.push(playerId);
      saveChestStore(store, userId);
      return { isNewlyUnlocked: true };
    }
    return { isNewlyUnlocked: false };
  } catch {
    return { isNewlyUnlocked: false };
  }
}

export interface PickedRewardResult {
  reward: SecretPlayerRewardDef;
  isOwned: boolean;
}

/**
 * Picks one reward randomly among locked secret players.
 * If all 4 are unlocked, picks randomly among all 4 and flags as OWNED.
 */
export function pickRandomReward(userId?: string): PickedRewardResult {
  try {
    const store = getChestStore(userId);
    const lockedPool = SECRET_PLAYER_REWARDS.filter((r) => !store.unlocked.includes(r.id));

    if (lockedPool.length > 0) {
      const idx = Math.floor(Math.random() * lockedPool.length);
      return { reward: lockedPool[idx], isOwned: false };
    }

    // All unlocked: pick random among all 4, marked OWNED
    const idx = Math.floor(Math.random() * SECRET_PLAYER_REWARDS.length);
    return { reward: SECRET_PLAYER_REWARDS[idx], isOwned: true };
  } catch {
    return { reward: SECRET_PLAYER_REWARDS[0], isOwned: false };
  }
}
