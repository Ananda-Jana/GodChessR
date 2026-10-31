/**
 * Single source of truth for Hero Duel rules and equipment ability descriptions.
 * Shared between pre-game setup, rulebook modal, and in-game combat simulation.
 */

import { HeroId } from '../types/heroDuelTypes';
import { AbilityId, Rarity } from '../ui/AbilityTiles';

export interface AbilitySummary {
  id: AbilityId;
  heroId: HeroId;
  heroName: string;
  name: string;
  cooldownSec: number;
  rarity: Rarity;
  description: string;
}

export const HERO_DUEL_CORE_RULES: string[] = [
  'Every champion has 35 HP and high resilience for strategic tactical battles.',
  'AUTOMATIC ORTHOGONAL ATTACKS: Champions automatically attack every 1.5 seconds whenever directly adjacent (horizontally or vertically) to an enemy. No diagonal attacks can occur, and no attack across a gap.',
  'DEFENSIVE GUARD STANCE: Holding position on any square automatically activates Guard Stance, reducing incoming attack damage by 50%.',
  'SHRINE HEALING: Champions standing on a shrine automatically heal at 1 HP per second (capped at 35 max HP).',
  'SHRINE 60-SECOND COUNTDOWN: Once both teams contest or occupy a shrine, a continuous countdown timer starts for 60 seconds. When 10 seconds or fewer remain, the timer turns glowing RED with an urgent warning tick.',
  'SHRINE VICTORY & HP COMPARISON: When 60 seconds are reached, if the occupier holds the shrine and the opponent has no piece on any shrine at that final second, the occupier wins immediately.',
  'CONTESTED TIE-BREAK: If both teams occupy shrines at the 60-second mark (or contest the same shrine), the average HP of pieces of each team standing on the shrine(s) is compared. The team with higher average HP wins.',
  'REPEATABLE EQUIPMENT ABILITIES: Abilities have a 7-second cooldown and can be used repeatedly throughout the battle once unlocked.',
  'Whichever champion reaches a shrine first automatically unlocks their personal equipment ability.',
];

export const HERO_DUEL_ABILITY_MAP: Record<HeroId, AbilitySummary> = {
  'mugen-king': {
    id: 'royalMeteor',
    heroId: 'mugen-king',
    heroName: 'MugenKING',
    name: 'Royal Meteor',
    cooldownSec: 7,
    rarity: 'legendary',
    description: 'Calls down a celestial blazing meteor from the sky dealing 8 DMG to the nearest enemy champion.',
  },
  'malevolent-priest': {
    id: 'curseSeal',
    heroId: 'malevolent-priest',
    heroName: 'Malevolent Shrine Priest',
    name: 'Curse Seal',
    cooldownSec: 7,
    rarity: 'legendary',
    description: 'Inscribes a demonic crimson magic seal beneath all active enemy champions dealing 5 DMG.',
  },
  'dr-methanogenic': {
    id: 'toxicFlask',
    heroId: 'dr-methanogenic',
    heroName: 'Dr. Methanogenic',
    name: 'Toxic Flask',
    cooldownSec: 7,
    rarity: 'epic',
    description: 'Hurls an acidic poison flask dealing 5 AoE damage and corroding enemy defenses in a 2x2 area.',
  },
  'captain-englland': {
    id: 'rallyBanner',
    heroId: 'captain-englland',
    heroName: 'Captain Englland',
    name: 'Rally Banner',
    cooldownSec: 7,
    rarity: 'epic',
    description: 'Plants a royal war banner that instantly restores 6 HP to all allied champions on the board.',
  },
  'ajx-assassin': {
    id: 'phaseDaggers',
    heroId: 'ajx-assassin',
    heroName: 'AJX',
    name: 'Phase Daggers',
    cooldownSec: 7,
    rarity: 'epic',
    description: 'Shadow dashes across the board to strike the lowest HP enemy champion for 8 armor-piercing DMG.',
  },
  'yjkstra-pathfinder': {
    id: 'jetBoots',
    heroId: 'yjkstra-pathfinder',
    heroName: 'Yjkstra',
    name: 'Rocket Jet Pack',
    cooldownSec: 7,
    rarity: 'epic',
    description: 'Flies linearly across the board, dealing 6 DMG to every enemy passed with speed blur impact.',
  },
  'ironclad-warden': {
    id: 'bastionShield',
    heroId: 'ironclad-warden',
    heroName: 'Ironclad Warden',
    name: 'Bastion Barrier',
    cooldownSec: 7,
    rarity: 'legendary',
    description: 'Deploys a golden energy barrier granting +8 Shield HP to all squad members on shrines.',
  },
  'black-monkey': {
    id: 'spikyBall',
    heroId: 'black-monkey',
    heroName: 'BlackMonkey',
    name: 'Spiky Ball',
    cooldownSec: 7,
    rarity: 'epic',
    description: 'Launches a heavy steel spiked orb that ricochets across the board hitting every enemy hero for 5 HP.',
  },
  'part-king-kong': {
    id: 'seismicSlam',
    heroId: 'part-king-kong',
    heroName: 'Party King Kong',
    name: 'Seismic Slam',
    cooldownSec: 7,
    rarity: 'epic',
    description: 'Slams the earth creating shockwaves dealing 6 AoE damage to all surrounding enemies in 3x3 radius.',
  },
};

export const HERO_DUEL_ABILITY_SUMMARIES: AbilitySummary[] = Object.values(HERO_DUEL_ABILITY_MAP);

export function getHeroEquipmentAbility(heroId: HeroId): AbilitySummary {
  return HERO_DUEL_ABILITY_MAP[heroId] || HERO_DUEL_ABILITY_MAP['mugen-king'];
}
