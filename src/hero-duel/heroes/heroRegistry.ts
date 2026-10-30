import { HeroDefinition, HeroId } from '../types/heroDuelTypes';
import { MUGEN_KING } from './mugenKing';
import { MALEVOLENT_PRIEST } from './malevolentPriest';
import { DR_METHANOGENIC } from './drMethanogenic';
import { CAPTAIN_ENGLLAND } from './captainEnglland';
import { AJX_ASSASSIN } from './ajx';
import { YJKSTRA_PATHFINDER } from './yjkstra';
import { IRONCLAD_WARDEN } from './ironcladWarden';
import { BLACK_MONKEY } from './blackMonkey';
import { PART_KING_KONG } from './partKingKong';

export const ALL_HEROES: HeroDefinition[] = [
  MUGEN_KING,
  MALEVOLENT_PRIEST,
  DR_METHANOGENIC,
  CAPTAIN_ENGLLAND,
  AJX_ASSASSIN,
  YJKSTRA_PATHFINDER,
  IRONCLAD_WARDEN,
  BLACK_MONKEY,
  PART_KING_KONG,
];

export const HERO_MAP: Record<HeroId, HeroDefinition> = {
  'mugen-king': MUGEN_KING,
  'malevolent-priest': MALEVOLENT_PRIEST,
  'dr-methanogenic': DR_METHANOGENIC,
  'captain-englland': CAPTAIN_ENGLLAND,
  'ajx-assassin': AJX_ASSASSIN,
  'yjkstra-pathfinder': YJKSTRA_PATHFINDER,
  'ironclad-warden': IRONCLAD_WARDEN,
  'black-monkey': BLACK_MONKEY,
  'part-king-kong': PART_KING_KONG,
};

export const HEROES: Record<string, HeroDefinition> = {
  ...HERO_MAP,
  mugenKing: MUGEN_KING,
  malevolentPriest: MALEVOLENT_PRIEST,
  drMethanogenic: DR_METHANOGENIC,
  captainEnglland: CAPTAIN_ENGLLAND,
  ajx: AJX_ASSASSIN,
  yjkstra: YJKSTRA_PATHFINDER,
  ironcladWarden: IRONCLAD_WARDEN,
  blackMonkey: BLACK_MONKEY,
  partKingKong: PART_KING_KONG,
};

export function getHeroById(id: HeroId | string): HeroDefinition {
  return HEROES[id] || MUGEN_KING;
}

/**
 * Returns a balanced 4-hero draft with diverse roles (1 tank/anchor, 1 mobile/flanker, 1 controller, 1 wildcard)
 */
export function getRandomBalancedDraft(): { heroes: HeroId[]; captainId: HeroId } {
  const anchors: HeroId[] = ['mugen-king', 'ironclad-warden', 'part-king-kong'];
  const flankers: HeroId[] = ['captain-englland', 'ajx-assassin', 'black-monkey'];
  const controllers: HeroId[] = ['malevolent-priest', 'dr-methanogenic', 'yjkstra-pathfinder'];

  const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const a = pickRandom(anchors);
  const f = pickRandom(flankers);
  const c = pickRandom(controllers);

  const remaining = ALL_HEROES.map((h) => h.id).filter((id) => id !== a && id !== f && id !== c);
  const w = pickRandom(remaining);

  const pool = [a, f, c, w];
  // Shuffle order
  const shuffled = pool.sort(() => Math.random() - 0.5);
  // Default captain to anchor or first pick
  const captain = shuffled.includes(a) ? a : shuffled[0];

  return {
    heroes: shuffled,
    captainId: captain,
  };
}
