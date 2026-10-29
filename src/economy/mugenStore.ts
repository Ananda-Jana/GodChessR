/**
 * Mugen Gems & Mugen Crypto Economy Store
 * LocalStorage-backed wallet with robust fallback for browser restrictions.
 * Supports dual-currency economy: Mugen Gems (無限宝石) & Mugen Crypto (無限暗号).
 */

const GEMS_STORAGE_PREFIX = 'mugen_gems_v1_';
const CRYPTO_STORAGE_PREFIX = 'mugen_crypto_v1_';
const ELO_SHIELD_STORAGE_PREFIX = 'mugen_elo_shield_v1_';
const SECRET_CODES_STORAGE_PREFIX = 'mugen_secret_codes_v1_';
const CHEST_PURCHASES_PREFIX = 'mugen_chest_purchases_v1_';

// In-memory fallback maps if localStorage is disabled or fails
const gemsMemoryFallback: Record<string, number> = {};
const cryptoMemoryFallback: Record<string, number> = {};
const eloShieldMemoryFallback: Record<string, number> = {};
const secretCodesMemoryFallback: Record<string, string[]> = {};
const chestPurchasesMemoryFallback: Record<string, string[]> = {};

function getGemsKey(userId: string): string {
  return `${GEMS_STORAGE_PREFIX}${userId || 'guest'}`;
}

function getCryptoKey(userId: string): string {
  return `${CRYPTO_STORAGE_PREFIX}${userId || 'guest'}`;
}

function getEloShieldKey(userId: string): string {
  return `${ELO_SHIELD_STORAGE_PREFIX}${userId || 'guest'}`;
}

function getSecretCodesKey(userId: string): string {
  return `${SECRET_CODES_STORAGE_PREFIX}${userId || 'guest'}`;
}

function getChestPurchasesKey(userId: string): string {
  return `${CHEST_PURCHASES_PREFIX}${userId || 'guest'}`;
}

function notifyCurrencyChange(userId: string, currency: 'gems' | 'crypto' | 'shield' | 'secret') {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('mugen_economy_update', {
          detail: { userId, currency, timestamp: Date.now() },
        })
      );
    } catch {
      // Ignore
    }
  }
}

// ==========================================
// MUGEN GEMS API
// ==========================================

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

  notifyCurrencyChange(userId, 'gems');
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

  notifyCurrencyChange(userId, 'gems');
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

// ==========================================
// MUGEN CRYPTO (無限暗号) ORE ECONOMY API
// ==========================================

/**
 * Gets current Mugen Crypto balance for a given userId.
 */
export function getMugenCrypto(userId: string): number {
  const key = getCryptoKey(userId);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        return isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    }
  } catch {
    // Fall safe to memory fallback
  }

  if (typeof cryptoMemoryFallback[key] === 'number') {
    return Math.max(0, cryptoMemoryFallback[key]);
  }
  return 0;
}

/**
 * Adds Mugen Crypto to user's wallet. Returns updated total.
 */
export function addMugenCrypto(userId: string, amount: number): number {
  if (amount <= 0) return getMugenCrypto(userId);
  const current = getMugenCrypto(userId);
  const next = current + Math.floor(amount);
  const key = getCryptoKey(userId);

  cryptoMemoryFallback[key] = next;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, next.toString());
    }
  } catch {
    // Fail safe
  }

  notifyCurrencyChange(userId, 'crypto');
  return next;
}

/**
 * Spends Mugen Crypto if user has sufficient balance. Never goes below 0.
 * Returns true if deduction succeeded, false if balance is insufficient.
 */
export function spendMugenCrypto(userId: string, amount: number): boolean {
  if (amount <= 0) return true;
  const current = getMugenCrypto(userId);
  if (current < amount) return false;

  const next = current - Math.floor(amount);
  const key = getCryptoKey(userId);

  cryptoMemoryFallback[key] = next;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, next.toString());
    }
  } catch {
    // Fail safe
  }

  notifyCurrencyChange(userId, 'crypto');
  return true;
}

/**
 * Converts Mugen Gems to Mugen Crypto.
 * Fixed exchange rate: 1,000 Mugen Gems = 1 Mugen Crypto (e.g. 2,000 Gems -> 2 Crypto).
 * NOTE: Direct ELO to Crypto conversion does NOT exist and is strictly disallowed.
 */
export function convertGemsToCrypto(
  userId: string,
  amountOfGems: number = 2000
): { success: boolean; gemsSpent: number; cryptoGained: number } {
  // Enforce 1,000 gem increments
  const gemsToDeduct = Math.floor(amountOfGems / 1000) * 1000;
  if (gemsToDeduct < 1000) {
    return { success: false, gemsSpent: 0, cryptoGained: 0 };
  }

  const currentGems = getGems(userId);
  if (currentGems < gemsToDeduct) {
    return { success: false, gemsSpent: 0, cryptoGained: 0 };
  }

  const spent = spendGems(userId, gemsToDeduct);
  if (!spent) {
    return { success: false, gemsSpent: 0, cryptoGained: 0 };
  }

  const cryptoGained = Math.floor(gemsToDeduct / 1000);
  addMugenCrypto(userId, cryptoGained);

  return { success: true, gemsSpent: gemsToDeduct, cryptoGained };
}

// ==========================================
// ELO PROTECTION SHIELD API
// ==========================================

/**
 * Gets the current ELO Protection Shield status for a user.
 * Each active charge protects against 1 ELO loss in a rated match.
 */
export function getEloShieldStatus(userId: string): { active: boolean; matchesRemaining: number } {
  const key = getEloShieldKey(userId);
  let remaining = 0;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        remaining = isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    }
  } catch {
    // Fall safe
  }

  if (remaining === 0 && typeof eloShieldMemoryFallback[key] === 'number') {
    remaining = Math.max(0, eloShieldMemoryFallback[key]);
  }

  return {
    active: remaining > 0,
    matchesRemaining: remaining,
  };
}

/**
 * Activates an ELO Protection Barrier.
 * Cost: 1 Mugen Crypto per activation.
 * Adds 1 protected match charge.
 */
export function activateEloShield(userId: string): boolean {
  const spent = spendMugenCrypto(userId, 1);
  if (!spent) return false;

  const current = getEloShieldStatus(userId);
  const nextRemaining = current.matchesRemaining + 1;
  const key = getEloShieldKey(userId);

  eloShieldMemoryFallback[key] = nextRemaining;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, nextRemaining.toString());
    }
  } catch {
    // Fail safe
  }

  notifyCurrencyChange(userId, 'shield');
  return true;
}

/**
 * Consumes 1 ELO Protection Shield charge after saving rating from defeat.
 * Returns true if a shield charge was consumed, false if no shield was active.
 */
export function consumeEloShield(userId: string): boolean {
  const current = getEloShieldStatus(userId);
  if (!current.active || current.matchesRemaining <= 0) {
    return false;
  }

  const nextRemaining = Math.max(0, current.matchesRemaining - 1);
  const key = getEloShieldKey(userId);

  eloShieldMemoryFallback[key] = nextRemaining;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, nextRemaining.toString());
    }
  } catch {
    // Fail safe
  }

  notifyCurrencyChange(userId, 'shield');
  return true;
}

// ==========================================
// SECRET ARENA CODE DECRYPTION API
// ==========================================

/**
 * Gets array of decrypted secret character IDs for a user.
 */
export function getUnlockedSecretCodes(userId: string): string[] {
  const key = getSecretCodesKey(userId);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch {
    // Fall safe
  }

  if (Array.isArray(secretCodesMemoryFallback[key])) {
    return secretCodesMemoryFallback[key];
  }
  return [];
}

/**
 * Decrypts and unlocks a secret character and their engine code blueprint.
 * Cost: 1 Mugen Crypto per character.
 */
export function unlockSecretCode(userId: string, characterId: string): boolean {
  if (!characterId) return false;
  const unlocked = getUnlockedSecretCodes(userId);
  if (unlocked.includes(characterId)) {
    return true; // Already unlocked
  }

  const spent = spendMugenCrypto(userId, 1);
  if (!spent) return false;

  const nextUnlocked = [...unlocked, characterId];
  const key = getSecretCodesKey(userId);

  secretCodesMemoryFallback[key] = nextUnlocked;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(nextUnlocked));
    }
  } catch {
    // Fail safe
  }

  notifyCurrencyChange(userId, 'secret');
  return true;
}

// ==========================================
// CHEST PURCHASE RECORD API
// ==========================================

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
