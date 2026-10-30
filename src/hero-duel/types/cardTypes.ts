/**
 * Types for Card Collection System in Hero Duel
 */

import { CardRarity } from '../config/rarityConfig';
import { HeroId } from './heroDuelTypes';

export interface JapaneseCardWord {
  kanji: string;
  romaji: string;
  meaning: string;
  english?: string;
  category?: 'fate' | 'battle' | 'spirit' | 'void' | 'honor' | 'power';
}

export interface CollectibleHeroCard {
  id?: string;
  code: string; // 3-5 alphanumeric seed, e.g. "07A", "xT9", "manLL"
  heroId: HeroId;
  heroName: string;
  heroTitle?: string;
  rarity: CardRarity;
  rarityConfig?: any;
  seed?: number;
  word?: JapaneseCardWord;
  japaneseWord?: JapaneseCardWord & { english?: string };
  quoteLine?: string;
  loreSentence?: string;
  backgroundIndex: number; // 0 to 29
  frameStyleIndex?: number; // 0 to 11
  paletteIndex: number;    // 0 to 23
  textureIndex?: number;    // 0 to 15
  foilIndex?: number;       // 0 to 9
  visualSeed?: number;
  mintedAt?: number;
  unlockedAt?: number;
  defeatedBy?: string; // Player name or "Guest"
  matchId?: string;
}

export interface CardGrammarSlots {
  verb: string[];
  noun: string[];
  adjective: string[];
  location: string[];
  omen: string[];
  heroSpecific: Record<HeroId, string[]>;
}
