/**
 * mugenPassStore.ts - Mugen Pass Economy Store
 * Manages active League Event Passes, match charge consumption, Gem purchases, and trophy multiplier math.
 */

import { getGems, spendGems } from './mugenStore';

const PASS_STORAGE_PREFIX = 'mugen_pass_v1_';

export type MugenPassId = 'nu_pass' | 'mecha_pass' | 'vip_pass';

export interface MugenPassDefinition {
  id: MugenPassId;
  name: string;
  subtitle: string;
  description: string;
  multiplier: number; // 1.2, 1.5, 2.0
  multiplierText: string; // '1.2X', '1.5X', '2.0X'
  gemCost: number; // 1200, 2000, 3000
  charges: number; // 10 matches
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  starsCount: number;
  badgeLabel: string;
}

export const MUGEN_PASS_DEFINITIONS: Record<MugenPassId, MugenPassDefinition> = {
  nu_pass: {
    id: 'nu_pass',
    name: 'Nu Pass',
    subtitle: 'Novice Multiplier Ticket',
    description: 'Boosts all League match trophy payouts by 1.2X for 10 matches.',
    multiplier: 1.2,
    multiplierText: '1.2X',
    gemCost: 1200,
    charges: 10,
    primaryColor: '#2563eb', // Navy Blue
    accentColor: '#1e3a8a',
    glowColor: 'rgba(37, 99, 235, 0.5)',
    starsCount: 1,
    badgeLabel: 'ENTRY PASS',
  },
  mecha_pass: {
    id: 'mecha_pass',
    name: 'Mecha Mugen Pass',
    subtitle: 'Enhanced Cyber Ticket',
    description: 'Boosts all League match trophy payouts by 1.5X for 10 matches.',
    multiplier: 1.5,
    multiplierText: '1.5X',
    gemCost: 2000,
    charges: 10,
    primaryColor: '#f59e0b', // Yellow / Amber
    accentColor: '#b45309',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    starsCount: 2,
    badgeLabel: 'MECHA PASS',
  },
  vip_pass: {
    id: 'vip_pass',
    name: 'VIP Pass',
    subtitle: 'Supreme Multiplier Ticket',
    description: 'Boosts all League match trophy payouts by a massive 2.0X for 10 matches.',
    multiplier: 2.0,
    multiplierText: '2.0X',
    gemCost: 3000,
    charges: 10,
    primaryColor: '#e11d48', // Red / Crimson
    accentColor: '#9f1239',
    glowColor: 'rgba(225, 29, 72, 0.6)',
    starsCount: 3,
    badgeLabel: 'VIP SUPREME',
  },
};

export interface ActiveMugenPass {
  passId: MugenPassId;
  multiplier: number;
  chargesRemaining: number;
  totalCharges: number;
  purchasedAt: number;
}

const passMemoryFallback: Record<string, ActiveMugenPass | null> = {};

function getPassKey(userId: string): string {
  return `${PASS_STORAGE_PREFIX}${userId || 'guest'}`;
}

function notifyPassChange(userId: string, pass: ActiveMugenPass | null) {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('mugen_pass_updated', {
          detail: { userId, pass, timestamp: Date.now() },
        })
      );
    } catch {}
  }
}

/**
 * Gets the current active Mugen Pass for a given user.
 */
export function getActivePass(userId: string): ActiveMugenPass | null {
  const key = getPassKey(userId);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.chargesRemaining === 'number' && parsed.chargesRemaining > 0) {
          return parsed;
        }
      }
    }
  } catch {}

  if (passMemoryFallback[key] && passMemoryFallback[key]!.chargesRemaining > 0) {
    return passMemoryFallback[key];
  }
  return null;
}

/**
 * Purchases or upgrades a Mugen Pass using Mugen Gems.
 */
export function purchasePass(
  userId: string,
  passId: MugenPassId
): { success: boolean; error?: string; pass?: ActiveMugenPass } {
  const def = MUGEN_PASS_DEFINITIONS[passId];
  if (!def) {
    return { success: false, error: 'Invalid pass selected.' };
  }

  const currentGems = getGems(userId);
  if (currentGems < def.gemCost) {
    return {
      success: false,
      error: `Insufficient Mugen Gems! Need ${def.gemCost.toLocaleString()} Gems (Current: ${currentGems.toLocaleString()}).`,
    };
  }

  const spent = spendGems(userId, def.gemCost);
  if (!spent) {
    return { success: false, error: 'Transaction failed. Please check your Gem balance.' };
  }

  const newPass: ActiveMugenPass = {
    passId: def.id,
    multiplier: def.multiplier,
    chargesRemaining: def.charges,
    totalCharges: def.charges,
    purchasedAt: Date.now(),
  };

  const key = getPassKey(userId);
  passMemoryFallback[key] = newPass;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(newPass));
    }
  } catch {}

  notifyPassChange(userId, newPass);
  return { success: true, pass: newPass };
}

/**
 * Consumes 1 match charge after a completed League match.
 */
export function consumePassCharge(
  userId: string
): { consumed: boolean; remainingCharges: number; pass: ActiveMugenPass | null } {
  const active = getActivePass(userId);
  if (!active || active.chargesRemaining <= 0) {
    return { consumed: false, remainingCharges: 0, pass: null };
  }

  const nextCharges = Math.max(0, active.chargesRemaining - 1);
  const key = getPassKey(userId);

  let updatedPass: ActiveMugenPass | null = null;
  if (nextCharges > 0) {
    updatedPass = {
      ...active,
      chargesRemaining: nextCharges,
    };
    passMemoryFallback[key] = updatedPass;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(updatedPass));
      }
    } catch {}
  } else {
    passMemoryFallback[key] = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  }

  notifyPassChange(userId, updatedPass);
  return {
    consumed: true,
    remainingCharges: nextCharges,
    pass: updatedPass,
  };
}
