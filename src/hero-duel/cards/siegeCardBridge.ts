import { CollectibleHeroCard } from '../types/cardTypes';
import { HeroId, CardRarity } from '../types/heroDuelTypes';
import { generateDefeatedHeroCard } from './cardGenerator';
import { saveCardToCollection, getCardCollection } from './collectionStore';
import { SiegeState } from '../engine/siege/siegeTypes';

/**
 * Grants a collectible card when the player defeats an enemy hero in Shrine Siege.
 */
export async function grantSiegeKillCard(heroId: HeroId): Promise<CollectibleHeroCard> {
  const existingCollection = await getCardCollection();
  const existingCodes = new Set(existingCollection.map((c) => c.code));

  const card = generateDefeatedHeroCard(heroId, existingCodes);
  await saveCardToCollection(card);
  return card;
}

/**
 * Awards a victory or defeat collectible card upon match conclusion.
 * Defeat awards a Red appreciation card (Common/Uncommon), Victory awards Gold/Blue/Green appreciation cards.
 */
export function awardSiegeMatchCard(state: SiegeState, isVictory: boolean): CollectibleHeroCard | null {
  const targetHero = isVictory
    ? (state.heroes.find((h) => h.team === 2 && !h.isAlive) || state.heroes.find((h) => h.team === 2))
    : (state.heroes.find((h) => h.team === 1 && !h.isAlive) || state.heroes.find((h) => h.team === 1));

  if (!targetHero) return null;

  try {
    const existingCollection = getCardCollection();
    const existingCodes = new Set(Array.isArray(existingCollection) ? existingCollection.map((c: CollectibleHeroCard) => c.code) : []);
    
    // For defeat, force Common or Uncommon rarity with a red palette hint
    const forcedRarity: CardRarity | undefined = isVictory ? undefined : 'common';
    const card = generateDefeatedHeroCard(targetHero.heroId, existingCodes, forcedRarity);
    
    // Customize defeatedBy string to note match outcome
    card.defeatedBy = isVictory ? 'Shrine Siege Victory' : 'Shrine Siege Valor (Defeat Appreciation)';

    saveCardToCollection(card);
    return card;
  } catch (err) {
    console.warn('Failed to mint match reward card:', err);
    return null;
  }
}

/**
 * Backward compatibility alias for victory cards
 */
export function awardSiegeVictoryCard(state: SiegeState): CollectibleHeroCard | null {
  return awardSiegeMatchCard(state, true);
}
