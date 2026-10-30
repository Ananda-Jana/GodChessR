import { CollectibleHeroCard } from '../types/cardTypes';
import { HeroId } from '../types/heroDuelTypes';
import { generateDefeatedHeroCard } from './cardGenerator';
import { saveCardToCollection, getCardCollection } from './collectionStore';

/**
 * Grants a collectible card when the player defeats an enemy hero in Shrine Siege.
 * Preserves the exact behavior of card generation, rarity table, and storage.
 */
export async function grantSiegeKillCard(heroId: HeroId): Promise<CollectibleHeroCard> {
  const existingCollection = await getCardCollection();
  const existingCodes = new Set(existingCollection.map((c) => c.code));

  const card = generateDefeatedHeroCard(heroId, existingCodes);
  await saveCardToCollection(card);
  return card;
}
