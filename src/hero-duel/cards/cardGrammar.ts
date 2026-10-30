import { HeroId } from '../types/heroDuelTypes';
import { JAPANESE_CARD_WORDS } from './cardDictionary';

const VERBS = [
  'shatters', 'claims', 'ignites', 'severs', 'commands', 'awakens', 'rends',
  'conquers', 'vanquishes', 'pierces', 'unravels', 'engulfs', 'summons',
  'banishes', 'silences', 'crushes', 'reforges', 'defies', 'binds', 'dominates',
  'ascends', 'hallows', 'pulverizes', 'unleashes', 'inscribes', 'subjugates',
  'eclipses', 'dissolves', 'reclaims', 'strikes', 'obliterates', 'transcends',
  'cleaves', 'fractures', 'annihilates', 'scatters', 'illuminates', 'manifests',
  'petrifies', 'shrouds', 'extinguishes', 'dismantles', 'overthrows', 'heralds',
  'devours', 'surpasses', 'reverberates', 'shackles', 'kindles', 'purges',
  'condemns', 'absolves', 'immortalizes', 'coronates', 'intertwines', 'detonates',
  'resonates', 'weaves', 'upholds', 'destroys', 'overcomes', 'sculpts'
];

const NOUNS = [
  'the crimson throne', 'an eternal storm', 'the iron mandate', 'the sacred seal',
  'the hollow crown', 'a cursed horizon', 'the silent boundary', 'the abyssal rift',
  'a shattered promise', 'the celestial spire', 'the ancestral blade', 'an obsidian monolith',
  'the dying sun', 'the phantom realm', 'a ruthless omen', 'the weeping heavens',
  'the sovereign decree', 'the cosmic lattice', 'the ancient bell', 'an untamed wildfire',
  'the martial truth', 'the forgotten sanctuary', 'the dormant core', 'the venomous gale',
  'the sovereign scepter', 'a spectral army', 'the judgment scale', 'the endless labyrinth',
  'the broken seal', 'an imperial herald', 'the blood covenant', 'the thunder crest',
  'the frozen citadel', 'the eternal eclipse', 'a fallen idol', 'the primordial ember',
  'the silent executioner', 'an ironclad vanguard', 'the astral tether', 'the divine wrath',
  'the obsidian gate', 'a fleeting twilight', 'the golden lineage', 'the karmic thread',
  'the roaring abyss', 'a ruthless dynasty', 'the solitary peak', 'the sacred grove',
  'the twilight veil', 'an unbroken resolve', 'the dark citadel', 'the blazing crucible',
  'the sovereign heart', 'an unyielding pillar', 'the celestial gateway', 'the shadow court',
  'the primordial tide', 'a silent altar', 'the grand horizon', 'the eternal dawn'
];

const ADJECTIVES = [
  'unforgiving', 'sacred', 'ruthless', 'eternal', 'spectral', 'shattered',
  'boundless', 'calamitous', 'hallowed', 'primordial', 'ironclad', 'radiant',
  'abyssal', 'wrathful', 'solemn', 'indomitable', 'celestial', 'venomous',
  'peerless', 'quenched', 'forsaken', 'sovereign', 'tempestuous', 'silent',
  'gilded', 'inscrutable', 'shrouded', 'blazing', 'dormant', 'unyielding',
  'monumental', 'hollow', 'imperious', 'ferocious', 'unbroken', 'immortal',
  'cataclysmic', 'resplendent', 'merciless', 'transcendent', 'glacial',
  'ominous', 'revered', 'untamed', 'phantom', 'arcane', 'dauntless',
  'serene', 'seismic', 'venerable', 'majestic', 'astral', 'shivering',
  'incandescent', 'forbidden', 'relentless', 'adamantine', 'sorrowful',
  'tyrannical', 'radiating', 'limitless', 'impervious'
];

const LOCATIONS = [
  'in the domain of thorns', 'beneath the crimson sky', 'at the gate of eternity',
  'upon the altar of bone', 'within the sunken laboratory', 'across the scorched frontier',
  'in the heart of the storm', 'beyond the mortal threshold', 'at the edge of the world',
  'within the fractured mirror', 'upon the high battlefield', 'deep in the poison marsh',
  'before the silent pagoda', 'amidst the falling stars', 'within the temple of void',
  'atop the mountain of skulls', 'where shadows dare not tread', 'under the blood moon',
  'in the garden of iron', 'at the crossroads of fate', 'inside the shattered citadel',
  'upon the frozen estuary', 'amid the celestial ruins', 'beyond the reach of gods',
  'in the cradle of thunder', 'at the imperial summit', 'within the hollow depths',
  'before the throne of kings', 'along the path of needles', 'in the twilight sanctuary',
  'beneath the roots of heaven', 'where silence reigns supreme', 'within the crucible of war',
  'at the precipice of dawn', 'across the valley of ghosts', 'inside the burning forest',
  'upon the pedestal of time', 'beneath the ancient arches', 'beyond the wall of glass',
  'within the forgotten keep', 'at the mouth of the abyss', 'across the obsidian plain',
  'amidst the weeping stones', 'before the golden gate', 'in the hall of monuments',
  'atop the spire of glass', 'beneath the howling gales', 'within the sacred perimeter',
  'at the terminal redoubt', 'along the boundary of dreams', 'under the weight of crowns',
  'in the heart of iron', 'upon the shattered dais', 'amid the dust of empires',
  'where legend meets steel', 'beneath the burning stars', 'before the mirror of ages',
  'in the theater of blood', 'at the apex of destiny', 'within the boundless dark'
];

const OMENS = [
  'and the stars bow in submission',
  'leaving only silence in its wake',
  'as ancient prophecies burn to ash',
  'where no king may ever return',
  'sealing the doom of empires',
  'awakening the gods of slaughter',
  'while the heavens tremble in awe',
  'and the bell tolls for the damned',
  'restoring balance to the shattered realm',
  'forever etched upon the scroll of fate',
  'as kingdoms crumble into memory',
  'heralded by seven crimson suns',
  'and the earth drinks deep of victory',
  'illuminating the dark path forward',
  'casting a shadow over thousand lands',
  'and the ancient pact is struck',
  'where steel outlives the soul',
  'cleansing the rot of a thousand years',
  'as destiny yields to unbending will',
  'and the throne stands solitary once more',
  'bearing witness to the end of time',
  'unshaken by the tempest of war',
  'as the final curtain falls on mortal glory',
  'and eternity itself pauses to watch',
  'in defiance of all celestial law'
];

const HERO_LEXICONS: Record<HeroId, string[]> = {
  'mugen-king': [
    'My reign knows no perimeter.',
    'A crown is not inherited; it is seized.',
    'Bowing is the only mercy granted here.',
    'The board bends to imperial will.',
    'Royal decree outranks mortal destiny.'
  ],
  'malevolent-priest': [
    'The shrine thirsts for fresh vows.',
    'Step within the domain and pay the toll.',
    'Your talisman offers no salvation.',
    'Curse energy blossoms in quiet devotion.',
    'Sacrifice is the highest form of prayer.'
  ],
  'dr-methanogenic': [
    'Breathe deeply; the formulation is complete.',
    'Combustion is merely chemistry accelerated.',
    'A toxic mist cares nothing for valor.',
    'Anaerobic silence settles over the field.',
    'Every hero decomposes into elemental ash.'
  ],
  'captain-englland': [
    'Raise the standard and hold the vanguard!',
    'No step backward while the banner flies.',
    'Avenge the fallen; advance without fear!',
    'Honor is measured in distance conquered.',
    'The field commander bows to no one.'
  ],
  'ajx-assassin': [
    'You struck the shadow; I am behind you.',
    'Phase through the veil, strike through the spine.',
    'Speed is the only true defense.',
    'A blink of an eye is all the time I need.',
    'The phase rift closes behind your demise.'
  ],
  'yjkstra-pathfinder': [
    'The shortest path to victory is paved in cold logic.',
    'Every obstacle is simply an edge weight to balance.',
    'You navigated straight into calculation.',
    'The graph is solved; your turns are expired.',
    'Optimal routes tolerate no hesitation.'
  ],
  'ironclad-warden': [
    'I am the wall that breaks the tide.',
    'None shall pass this granite threshold.',
    'Strike me and break your own fist.',
    'Bastions do not yield to mortal ambition.',
    'Immovable, unyielding, eternal.'
  ],
  'black-monkey': [
    'Did you capture me, or merely catch my shadow?',
    'A trickster never shows his true face.',
    'The tree canopy belongs to the swift.',
    'Dance upon the border while the world burns.',
    'Laughter is the sweetest battle cry.'
  ],
  'part-king-kong': [
    'The earth trembles beneath primal wrath!',
    'Pounding iron into dust!',
    'Thick hide turns your blades to splinters.',
    'Rampage begins where your courage ends.',
    'Crushing the board under bare knuckles.'
  ]
};

const TEMPLATES: ((slots: {
  v: string;
  n: string;
  a: string;
  l: string;
  o: string;
  h: string;
}) => string)[] = [
  (s) => `When ${s.a} power awakens, ${s.h} ${s.v} ${s.n} ${s.l}, ${s.o}.`,
  (s) => `Through ${s.a} steel, ${s.h} ${s.v} ${s.n} ${s.l}.`,
  (s) => `“${s.h}” — ${s.v} ${s.n} ${s.l}, ${s.o}.`,
  (s) => `In the shadow of ${s.n}, ${s.h} ${s.v} all that is ${s.a} ${s.l}.`,
  (s) => `${s.n} ${s.v} ${s.l}, ${s.o}.`,
  (s) => `Behold the ${s.a} champion: ${s.h} ${s.v} ${s.n}.`,
  (s) => `No wall could contain ${s.n} when ${s.h} ${s.v} ${s.l}.`,
  (s) => `From ${s.l}, ${s.h} rises to ${s.v} ${s.n}, ${s.o}.`,
  (s) => `As ${s.n} shatters, ${s.h} ${s.v} the ${s.a} realm.`,
  (s) => `With ${s.a} wrath, ${s.h} ${s.v} ${s.n} ${s.l}.`,
  (s) => `“${s.h}” stands alone ${s.l}, where ${s.n} ${s.v} forever.`,
  (s) => `The oracle decreed: ${s.h} shall ${s.v} ${s.n} ${s.l}.`,
  (s) => `Beyond ${s.l}, ${s.n} ${s.v} with ${s.a} vengeance.`,
  (s) => `By the sovereign oath, ${s.h} ${s.v} ${s.n}, ${s.o}.`,
  (s) => `A single strike ${s.l} ${s.v} ${s.n} into dust.`,
  (s) => `Where ${s.n} burns ${s.a}, ${s.h} ${s.v} without mercy.`,
  (s) => `“${s.h}” — neither god nor devil could stay ${s.n} ${s.l}.`,
  (s) => `The legend endures: ${s.h} ${s.v} ${s.n} ${s.l}.`,
  (s) => `Under ${s.a} omens, ${s.n} is claimed as ${s.h} ${s.v} ${s.l}.`,
  (s) => `Every empire falls when ${s.h} ${s.v} ${s.n} ${s.l}, ${s.o}.`,
  (s) => `Tempered in ${s.a} fires ${s.l}, ${s.h} ${s.v} all opposition.`,
  (s) => `“${s.h}” — ${s.l}, the blade ${s.v} ${s.n}.`,
  (s) => `When twilight breaks ${s.l}, ${s.h} ${s.v} ${s.n}, ${s.o}.`,
  (s) => `Untouched by time, ${s.h} ${s.v} ${s.n} upon ${s.a} stone.`,
  (s) => `A reign without equal: ${s.h} ${s.v} ${s.n} ${s.l}.`,
  (s) => `The final covenant: ${s.h} ${s.v} ${s.n} ${s.l}, ${s.o}.`
];

export function generateCardLine(
  heroId: HeroId,
  usedLinesSet?: Set<string>,
  maxRetries = 20
): string {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const heroLines = HERO_LEXICONS[heroId] || HERO_LEXICONS['mugen-king'];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const template = pick(TEMPLATES);
    const slots = {
      v: pick(VERBS),
      n: pick(NOUNS),
      a: pick(ADJECTIVES),
      l: pick(LOCATIONS),
      o: pick(OMENS),
      h: pick(heroLines),
    };

    const line = template(slots);
    if (!usedLinesSet || !usedLinesSet.has(line)) {
      if (usedLinesSet) usedLinesSet.add(line);
      return line;
    }
  }

  // Fallback mutation if collision occurred repeatedly
  const fallback = `${pick(heroLines)} — ${pick(VERBS)} ${pick(NOUNS)} ${pick(LOCATIONS)}.`;
  if (usedLinesSet) usedLinesSet.add(fallback);
  return fallback;
}

/**
 * Generates a 3-5 character mixed-case alphanumeric unique seed code
 * Examples: '07A', 'xT9', 'manLL', 'G6tiE'
 */
export function generateCardCode(existingCodesSet?: Set<string>): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lengths = [3, 4, 4, 5]; // weighted towards 4-5 chars
  const len = lengths[Math.floor(Math.random() * lengths.length)];

  for (let attempt = 0; attempt < 50; attempt++) {
    let result = '';
    const randomBuffer = new Uint8Array(len);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randomBuffer);
      for (let i = 0; i < len; i++) {
        result += chars[randomBuffer[i] % chars.length];
      }
    } else {
      for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    if (!existingCodesSet || !existingCodesSet.has(result)) {
      if (existingCodesSet) existingCodesSet.add(result);
      return result;
    }
  }

  // Fallback suffix
  return `HD${Math.floor(Math.random() * 900 + 100)}`;
}

export function pickJapaneseWord(category?: string): (typeof JAPANESE_CARD_WORDS)[0] {
  if (category) {
    const filtered = JAPANESE_CARD_WORDS.filter((w) => w.category === category);
    if (filtered.length > 0) {
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
  }
  return JAPANESE_CARD_WORDS[Math.floor(Math.random() * JAPANESE_CARD_WORDS.length)];
}

export const generateCardLore = generateCardLine;
