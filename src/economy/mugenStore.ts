/**
 * Mugen Gems Economy Store
 * LocalStorage-backed gem wallet with robust fallback for browser restrictions.
 */

const GEMS_STORAGE_PREFIX = 'mugen_gems_v1_';
const CHEST_PURCHASES_PREFIX = 'mugen_chest_purchases_v1_';

// In-memory fallback maps if localStorage is disabled or fails
const gemsMemoryFallback: Record<string, number> = {};
const chestPurchasesMemoryFallback: Record<string, string[]> = {};

function getGemsKey(userId: string): string {
  return `${GEMS_STORAGE_PREFIX}${userId || 'guest'}`;
}

function getChestPurchasesKey(userId: string): string {
  return `${CHEST_PURCHASES_PREFIX}${userId || 'guest'}`;
}

/**
 * Gets current gem balance for a given userId.
 */
export function getGems(userId: string): number {
  const key = getGemsKey(userId);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        return isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    }
  } catch {
    // Silently fall through to memory fallback
  }

  if (typeof gemsMemoryFallback[key] === 'number') {
    return Math.max(0, gemsMemoryFallback[key]);
  }
  return 0;
}

/**
 * Adds gems to user's wallet. Returns updated gem total.
 */
export function addGems(userId: string, amount: number): number {
  if (amount <= 0) return getGems(userId);
  const current = getGems(userId);
  const next = current + Math.floor(amount);
  const key = getGemsKey(userId);

  gemsMemoryFallback[key] = next;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, next.toString());
    }
  } catch {
    // Fail silently to memory fallback
  }

  return next;
}

/**
 * Spends gems if user has sufficient balance. Never goes below 0.
 * Returns true if deduction succeeded, false if balance is insufficient.
 */
export function spendGems(userId: string, amount: number): boolean {
  if (amount <= 0) return true;
  const current = getGems(userId);
  if (current < amount) return false;

  const next = current - Math.floor(amount);
  const key = getGemsKey(userId);

  gemsMemoryFallback[key] = next;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, next.toString());
    }
  } catch {
    // Fail silently to memory fallback
  }

  return true;
}

/**
 * Deducts ELO in exchange for gems.
 * Conversion rate: 50 ELO = 500 gems. Minimum 50 ELO must remain after deduction.
 */
export function deductEloForGems(
  userId: string,
  currentElo: number,
  eloToSpend: number
): { newElo: number; gemsAwarded: number } {
  const safeCurrentElo = Math.max(50, Math.round(currentElo));
  const maxSpendableElo = Math.max(0, safeCurrentElo - 50);

  // Spend in 50 ELO increments
  const actualEloToDeduct = Math.min(
    Math.floor(eloToSpend / 50) * 50,
    Math.floor(maxSpendableElo / 50) * 50
  );

  if (actualEloToDeduct < 50) {
    return { newElo: safeCurrentElo, gemsAwarded: 0 };
  }

  const gemsAwarded = (actualEloToDeduct / 50) * 500;
  const newElo = safeCurrentElo - actualEloToDeduct;

  addGems(userId, gemsAwarded);

  return { newElo, gemsAwarded };
}

/**
 * Checks if a specific chest category/item has been purchased by the user.
 */
export function hasBoughtChest(userId: string, chestId: string): boolean {
  const key = getChestPurchasesKey(userId);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.includes(chestId);
        }
      }
    }
  } catch {
    // Fall safe to memory fallback
  }

  if (Array.isArray(chestPurchasesMemoryFallback[key])) {
    return chestPurchasesMemoryFallback[key].includes(chestId);
  }
  return false;
}

/**
 * Records a chest purchase into history.
 */
export function recordChestPurchase(userId: string, chestId: string): void {
  const key = getChestPurchasesKey(userId);
  let purchases: string[] = [];

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          purchases = parsed;
        }
      }
    }
  } catch {
    purchases = chestPurchasesMemoryFallback[key] || [];
  }

  if (!purchases.includes(chestId)) {
    purchases.push(chestId);
    chestPurchasesMemoryFallback[key] = purchases;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(purchases));
      }
    } catch {
      // Ignore
    }
  }
}
