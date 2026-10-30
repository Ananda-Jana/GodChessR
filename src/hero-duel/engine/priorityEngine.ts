/**
 * Priority Resolution Engine for Hero Duel
 *
 * Enforces the strict rule order:
 * Tier 1: IMMUNITIES
 *   - Anaerobic Adaptation (Dr. Methanogenic hazard immunity)
 *   - Unmoved (Ironclad Warden cannot be pushed, swapped, teleported)
 *   - Tidal Anchor (Wearer cannot be pushed, pulled, swapped)
 *   - Low Profile (AJX cannot be targeted by non-adjacent actives)
 *
 * Tier 2: PREVENTION
 *   - Thick Hide (Part King Kong absorbs first capture attempt, pushes attacker back)
 *   - Second Crown (MugenKING survives first fatal capture, relocates to back rank)
 *   - Royal Silence (MugenKING suppresses adjacent enemy actives)
 *   - Ofuda Seal (Malevolent Priest immune to slider captures > 1 square)
 *   - Treetop (BlackMonkey immune to slider captures while on edge)
 *   - Edge Weights (Yjkstra zone of control stops enemy sliders adjacent to him)
 *
 * Tier 3: MOVEMENT RESTRICTIONS
 *   - Rooted (Zero movement)
 *   - Slowed (Range -1, min 1)
 *   - Disarmed (Cannot capture)
 *   - Silenced (Cannot cast active)
 *
 * Tier 4: TRIGGERED PASSIVES
 *   - Vanguard Strike (Englland free non-capturing step)
 *   - Greedy Relaxation (Yjkstra free non-capturing step)
 *   - Avenge (Englland retaliation step against adjacent killer)
 *   - Rampage (Kong chain capture adjacent foe)
 *   - Pilfer (BlackMonkey increases enemy CDs on capture)
 *   - Ritual Toll (Priest active CD -1 on any ally capture)
 *   - Exploit (AJX active CD -2 on capturing hero on cooldown)
 *   - Reprisal (Ironclad Warden roots capturer of adjacent ally)
 */

import { BoardPosition } from '../config/boardConfig';
import { InGameHeroState, PlayerSide } from '../types/heroDuelTypes';
import { getChebyshevDistance, isBorderSquare, isSamePos } from './boardGeometry';

export interface CaptureAttemptResult {
  allowed: boolean;
  consumedPassive?: 'thick_hide' | 'second_crown';
  attackerRepelledTo?: BoardPosition;
  defenderRelocatedTo?: BoardPosition;
  notes?: string;
}

/**
 * Checks whether an attacker can capture the defender given Immunities & Prevention tiers
 */
export function evaluateCaptureAttempt(
  attacker: InGameHeroState,
  defender: InGameHeroState,
  attackerStartPos: BoardPosition,
  emptyBackRowSquares: BoardPosition[],
  isSliderMove: boolean
): CaptureAttemptResult {
  const distance = getChebyshevDistance(attackerStartPos, defender.position);

  // 1. Malevolent Priest - Ofuda Seal (Immune to captures from > 1 square away by sliders)
  if (defender.heroId === 'malevolent-priest' && isSliderMove && distance > 1) {
    return {
      allowed: false,
      notes: 'Ofuda Seal: Malevolent Priest cannot be captured from more than 1 square away by sliders.',
    };
  }

  // 2. BlackMonkey - Treetop (Immune to slider captures while on board edge)
  if (defender.heroId === 'black-monkey' && isSliderMove && isBorderSquare(defender.position) && distance > 1) {
    return {
      allowed: false,
      notes: 'Treetop: BlackMonkey cannot be captured by sliders while on border squares.',
    };
  }

  // 3. Part King Kong - Thick Hide (First capture attempt fails; attacker is pushed back)
  if (defender.heroId === 'part-king-kong' && !defender.passiveUsedFlags['thick_hide']) {
    return {
      allowed: false,
      consumedPassive: 'thick_hide',
      attackerRepelledTo: attackerStartPos,
      notes: 'Thick Hide: Part King Kong absorbs the attack! Attacker is pushed back.',
    };
  }

  // 4. MugenKING - Second Crown (Once per match, survives capture and relocates to back row)
  if (defender.heroId === 'mugen-king' && !defender.passiveUsedFlags['second_crown']) {
    // Find closest empty back row square
    const sorted = [...emptyBackRowSquares].sort(
      (a, b) => getChebyshevDistance(a, defender.position) - getChebyshevDistance(b, defender.position)
    );
    const relocatePos = sorted[0] || defender.position;

    return {
      allowed: true, // Attacker still moves to square, but king is relocated instead of killed
      consumedPassive: 'second_crown',
      defenderRelocatedTo: relocatePos,
      notes: 'Second Crown: MugenKING was relocated to the back ranks and survives!',
    };
  }

  return { allowed: true };
}

/**
 * Checks whether an ability targeting a hero is blocked by Immunities (Tier 1)
 */
export function isHeroImmuneToAbility(
  caster: InGameHeroState,
  target: InGameHeroState,
  abilityType: 'displacement' | 'debuff' | 'target'
): { immune: boolean; reason?: string } {
  // Ironclad Warden - Unmoved (Immune to push/swap/teleport)
  if (target.heroId === 'ironclad-warden' && abilityType === 'displacement') {
    return { immune: true, reason: 'Ironclad Warden has Unmoved and cannot be displaced.' };
  }

  // Tidal Anchor equipped hero
  if (target.equippedItemId === 'tidal-anchor' && abilityType === 'displacement') {
    return { immune: true, reason: 'Tidal Anchor prevents all displacement.' };
  }

  // AJX - Low Profile (Cannot be targeted by active abilities unless adjacent)
  if (target.heroId === 'ajx-assassin' && caster.owner !== target.owner) {
    const dist = getChebyshevDistance(caster.position, target.position);
    if (dist > 1) {
      return { immune: true, reason: 'Low Profile: AJX cannot be targeted by non-adjacent active abilities.' };
    }
  }

  return { immune: false };
}

/**
 * Checks whether Royal Silence (MugenKING) silences active abilities
 */
export function isSilencedByRoyalSilence(hero: InGameHeroState, allHeroes: InGameHeroState[]): boolean {
  return allHeroes.some(
    (other) =>
      other.isAlive &&
      other.owner !== hero.owner &&
      other.heroId === 'mugen-king' &&
      getChebyshevDistance(other.position, hero.position) <= 1
  );
}
