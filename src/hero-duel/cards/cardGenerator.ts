import { HeroId, CardRarity } from '../types/heroDuelTypes';
import { CollectibleHeroCard } from '../types/cardTypes';
import { HEROES } from '../heroes/heroRegistry';
import { RARITY_CONFIGS, ROLL_CARD_RARITY } from '../config/rarityConfig';
import { pickJapaneseWord, generateCardLore, generateCardCode } from './cardGrammar';
import { CARD_BACKGROUND_IMAGES } from './cardRenderer';

let pityCounter = 0;
const sessionUsedBackgroundIndices = new Set<number>();

/**
 * Resets session background sampling tracker (e.g. on new match)
 */
export function resetSessionBackgrounds() {
  sessionUsedBackgroundIndices.clear();
}

/**
 * Generates a collectible card awarded for defeating an enemy hero.
 * Ensures sampling without replacement for background images and unique card text.
 */
export function generateDefeatedHeroCard(
  heroId: HeroId,
  existingCodes?: Set<string>,
  forceRarity?: CardRarity
): CollectibleHeroCard {
  pityCounter++;
  
  // Pity counter: guarantee Epic or better at 10 pulls
  let rarity: CardRarity;
  if (forceRarity) {
    rarity = forceRarity;
  } else if (pityCounter >= 10) {
    pityCounter = 0;
    const highRolls: CardRarity[] = ['epic', 'master', 'mythic', 'legendary'];
    rarity = highRolls[Math.floor(Math.random() * highRolls.length)];
  } else {
    rarity = ROLL_CARD_RARITY();
    if (rarity === 'epic' || rarity === 'master' || rarity === 'mythic' || rarity === 'legendary') {
      pityCounter = 0;
    }
  }

  const heroDef = HEROES[heroId];
  const japaneseWord = pickJapaneseWord();
  // Ensure completely unique lore text by adding high-entropy timestamp salt
  const loreSentence = generateCardLore(heroId) + ` [Sig:${Math.random().toString(36).substring(2, 7)}]`;
  const code = generateCardCode(existingCodes);
  const rarityConfig = RARITY_CONFIGS[rarity];

  // Visual seed based on string hash + random entropy
  let visualSeed = 0;
  for (let i = 0; i < code.length; i++) {
    visualSeed = (visualSeed << 5) - visualSeed + code.charCodeAt(i);
    visualSeed |= 0;
  }
  visualSeed = Math.abs(visualSeed) + Math.floor(Math.random() * 1000);

  // Sampling without replacement for background images (total 21 images)
  const totalBgCount = CARD_BACKGROUND_IMAGES.length;
  if (sessionUsedBackgroundIndices.size >= totalBgCount) {
    sessionUsedBackgroundIndices.clear(); // Reset if all used
  }

  let backgroundIndex = visualSeed % totalBgCount;
  let attempts = 0;
  while (sessionUsedBackgroundIndices.has(backgroundIndex) && attempts < totalBgCount) {
    backgroundIndex = (backgroundIndex + 1) % totalBgCount;
    attempts++;
  }
  sessionUsedBackgroundIndices.add(backgroundIndex);

  const paletteIndex = visualSeed % 5;

  return {
    id: `card_${Date.now()}_${code}`,
    code,
    heroId,
    heroName: heroDef.name,
    heroTitle: heroDef.title,
    rarity,
    rarityConfig,
    japaneseWord,
    loreSentence,
    backgroundIndex,
    paletteIndex,
    visualSeed,
    mintedAt: Date.now(),
  };
}
