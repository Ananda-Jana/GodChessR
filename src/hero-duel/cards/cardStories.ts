/**
 * Story & Scene Recipe System for Hero Duel Cards.
 * Each scene defines: disc type, backdrop pattern, ground type, props,
 * Japanese word, palette family hint, and tale templates with slots.
 */

export interface SceneRecipe {
  id: string;
  heroId: string;
  name: string;
  japaneseWord: { kanji: string; romaji: string; meaning: string };
  backdropPattern: 'rays' | 'ink-waves' | 'forest' | 'stripes' | 'rain' | 'grid-city';
  groundType: 'flames' | 'grass' | 'scallops' | 'rooftops' | 'bubbles';
  props: string[];
  tales: string[];
}

export const HERO_SCENE_RECIPES: Record<string, SceneRecipe[]> = {
  'mugen-king': [
    {
      id: 'mugen_king_1',
      heroId: 'mugen-king',
      name: 'The Crown That Fell',
      japaneseWord: { kanji: '王', romaji: 'Ō', meaning: 'King / Sovereign' },
      backdropPattern: 'rays',
      groundType: 'flames',
      props: ['crown', 'petals'],
      tales: [
        'At midnight, in a ruined arena, the king counted his crowns. One was missing, and the three crows knew where.',
        'He ruled without end, until ash taught him what an end was.',
      ],
    },
    {
      id: 'mugen_king_2',
      heroId: 'mugen-king',
      name: 'Endless Throne',
      japaneseWord: { kanji: '無限', romaji: 'Mugen', meaning: 'Infinity / Boundless' },
      backdropPattern: 'ink-waves',
      groundType: 'grass',
      props: ['throne', 'tiles'],
      tales: [
        'The throne waited on a shrine stair. The king sat, rose, and sat again, forever, for a cracked bell.',
      ],
    },
    {
      id: 'mugen_king_3',
      heroId: 'mugen-king',
      name: 'Second Crown',
      japaneseWord: { kanji: '再', romaji: 'Sai', meaning: 'Rebirth / Crowned Again' },
      backdropPattern: 'rain',
      groundType: 'flames',
      props: ['crown', 'shards'],
      tales: [
        'Struck down in a salt flat, he rose once more. The silent clock did not bow; it only watched.',
      ],
    },
    {
      id: 'mugen_king_4',
      heroId: 'mugen-king',
      name: 'Imperial Mandate',
      japaneseWord: { kanji: '勅', romaji: 'Choku', meaning: 'Imperial Decree' },
      backdropPattern: 'grid-city',
      groundType: 'rooftops',
      props: ['scepter'],
      tales: [
        'The decree was written in static upon a drowned library. None challenged the sovereign mandate.',
      ],
    },
  ],

  'malevolent-priest': [
    {
      id: 'malevolent_priest_1',
      heroId: 'malevolent-priest',
      name: 'The Gate That Hungers',
      japaneseWord: { kanji: '呪', romaji: 'Ju', meaning: 'Curse / Hex' },
      backdropPattern: 'forest',
      groundType: 'grass',
      props: ['torii', 'charms'],
      tales: [
        'At dawn the priest laid an offering on a bamboo road. The red tide took it, and asked for more.',
      ],
    },
    {
      id: 'malevolent_priest_2',
      heroId: 'malevolent-priest',
      name: 'Seal of Paper',
      japaneseWord: { kanji: '封', romaji: 'Fū', meaning: 'Seal / Binding' },
      backdropPattern: 'stripes',
      groundType: 'grass',
      props: ['ofuda'],
      tales: [
        'Seven paper talismans drifted through fog. The curse bound the enemy in silence.',
      ],
    },
    {
      id: 'malevolent_priest_3',
      heroId: 'malevolent-priest',
      name: 'Offering at Dusk',
      japaneseWord: { kanji: '祈', romaji: 'Inori', meaning: 'Solemn Prayer' },
      backdropPattern: 'rain',
      groundType: 'flames',
      props: ['lantern', 'fox_mask'],
      tales: [
        'At dusk, beneath embers, the priest offered his shadow to the shrine altar.',
      ],
    },
    {
      id: 'malevolent_priest_4',
      heroId: 'malevolent-priest',
      name: 'Malevolent Domain',
      japaneseWord: { kanji: '域', romaji: 'Iki', meaning: 'Sacred Realm' },
      backdropPattern: 'ink-waves',
      groundType: 'flames',
      props: ['shrine_roof'],
      tales: [
        'The domain expanded in a flash of static. Every opponent within was silenced.',
      ],
    },
  ],

  'dr-methanogenic': [
    {
      id: 'dr_methanogenic_1',
      heroId: 'dr-methanogenic',
      name: 'The Spore Bloom',
      japaneseWord: { kanji: '毒', romaji: 'Doku', meaning: 'Poison / Gas' },
      backdropPattern: 'stripes',
      groundType: 'bubbles',
      props: ['flask', 'spores'],
      tales: [
        'In a gas lab beneath a frozen harbor, one flask bloomed. Rain turned the whole city green.',
      ],
    },
    {
      id: 'dr_methanogenic_2',
      heroId: 'dr-methanogenic',
      name: 'Anaerobic Vault',
      japaneseWord: { kanji: '泡', romaji: 'Awa', meaning: 'Vapor Bubble' },
      backdropPattern: 'rain',
      groundType: 'bubbles',
      props: ['hoses', 'gauges'],
      tales: [
        'Oxygen ceased at the eighth hour. The methanogenic cloud engulfed the vanguard.',
      ],
    },
    {
      id: 'dr_methanogenic_3',
      heroId: 'dr-methanogenic',
      name: 'Last Experiment',
      japaneseWord: { kanji: '験', romaji: 'Ken', meaning: 'Trial / Test' },
      backdropPattern: 'ink-waves',
      groundType: 'bubbles',
      props: ['broken_beakers'],
      tales: [
        'The final beaker shattered in a salt flat. The resulting gas slowed all champions.',
      ],
    },
    {
      id: 'dr_methanogenic_4',
      heroId: 'dr-methanogenic',
      name: 'Chemical Genesis',
      japaneseWord: { kanji: '創', romaji: 'Sō', meaning: 'Creation' },
      backdropPattern: 'grid-city',
      groundType: 'bubbles',
      props: ['vat'],
      tales: [
        'From toxic mist arose a new compound, dissolving enemy defenses in an instant.',
      ],
    },
  ],

  'captain-englland': [
    {
      id: 'captain_englland_1',
      heroId: 'captain-englland',
      name: 'Hold the Line',
      japaneseWord: { kanji: '旗', romaji: 'Hata', meaning: 'War Banner' },
      backdropPattern: 'rays',
      groundType: 'flames',
      props: ['banner', 'chess_pieces'],
      tales: [
        'At dawn the captain planted his banner in a ruined arena. Snow came; the banner stayed.',
      ],
    },
    {
      id: 'captain_englland_2',
      heroId: 'captain-englland',
      name: 'Knight Charge',
      japaneseWord: { kanji: '突', romaji: 'Totsu', meaning: 'Vanguard Charge' },
      backdropPattern: 'ink-waves',
      groundType: 'flames',
      props: ['horse_crest'],
      tales: [
        'In an L-shaped leap across the battlefield, Captain Englland struck the enemy flank.',
      ],
    },
    {
      id: 'captain_englland_3',
      heroId: 'captain-englland',
      name: 'The Avenger',
      japaneseWord: { kanji: '仇', romaji: 'Ada', meaning: 'Avenge / Retribution' },
      backdropPattern: 'rain',
      groundType: 'grass',
      props: ['fallen_helmet'],
      tales: [
        'When an ally fell in the last minute, the Captain claimed double step momentum.',
      ],
    },
    {
      id: 'captain_englland_4',
      heroId: 'captain-englland',
      name: 'Sovereign Guard',
      japaneseWord: { kanji: '守', romaji: 'Mori', meaning: 'Shield Guard' },
      backdropPattern: 'forest',
      groundType: 'grass',
      props: ['shield_crest'],
      tales: [
        'Standing firm before the king, Englland repelled every incoming strike.',
      ],
    },
  ],

  'ajx-assassin': [
    {
      id: 'ajx_assassin_1',
      heroId: 'ajx-assassin',
      name: 'Null Jump',
      japaneseWord: { kanji: '瞬', romaji: 'Shun', meaning: 'Flash / Instant' },
      backdropPattern: 'grid-city',
      groundType: 'rooftops',
      props: ['afterimage', 'glitch_bars'],
      tales: [
        'At dusk, AJX vanished from a rooftop and arrived before the three crows could blink.',
      ],
    },
    {
      id: 'ajx_assassin_2',
      heroId: 'ajx-assassin',
      name: 'No Trace',
      japaneseWord: { kanji: '影', romaji: 'Kage', meaning: 'Shadow Silhouette' },
      backdropPattern: 'stripes',
      groundType: 'rooftops',
      props: ['twin_blades'],
      tales: [
        'A shadow flickered across static lines. The enemy captain was marked.',
      ],
    },
    {
      id: 'ajx_assassin_3',
      heroId: 'ajx-assassin',
      name: 'System Exploit',
      japaneseWord: { kanji: '隙', romaji: 'Suki', meaning: 'Vulnerability' },
      backdropPattern: 'rain',
      groundType: 'rooftops',
      props: ['crosshair'],
      tales: [
        'Slicing through defense matrices, AJX executed a critical strike without cooldown.',
      ],
    },
    {
      id: 'ajx_assassin_4',
      heroId: 'ajx-assassin',
      name: 'Phantom Blade',
      japaneseWord: { kanji: '斬', romaji: 'Zan', meaning: 'Cleave' },
      backdropPattern: 'ink-waves',
      groundType: 'flames',
      props: ['shatter_shards'],
      tales: [
        'The twin short blades severed the karmic thread before the alarm sounded.',
      ],
    },
  ],

  'yjkstra-pathfinder': [
    {
      id: 'yjkstra_pathfinder_1',
      heroId: 'yjkstra-pathfinder',
      name: 'Shortest Path',
      japaneseWord: { kanji: '道', romaji: 'Michi', meaning: 'Path / Vector' },
      backdropPattern: 'stripes',
      groundType: 'scallops',
      props: ['node_graph'],
      tales: [
        'Thousands of roads led out of a drowned library. Yjkstra walked the shortest.',
      ],
    },
    {
      id: 'yjkstra_pathfinder_2',
      heroId: 'yjkstra-pathfinder',
      name: 'Edge Relaxation',
      japaneseWord: { kanji: '緩', romaji: 'Yuru', meaning: 'Relaxation' },
      backdropPattern: 'rays',
      groundType: 'grass',
      props: ['graph_edges'],
      tales: [
        'Calculating distance vectors across 56 squares, the pathfinder bypassed all obstacles.',
      ],
    },
    {
      id: 'yjkstra_pathfinder_3',
      heroId: 'yjkstra-pathfinder',
      name: 'Greedy Step',
      japaneseWord: { kanji: '欲', romaji: 'Yoku', meaning: 'Greedy Choice' },
      backdropPattern: 'grid-city',
      groundType: 'rooftops',
      props: ['coins'],
      tales: [
        'Selecting the minimum weight edge, Yjkstra stepped directly onto the high ground.',
      ],
    },
    {
      id: 'yjkstra_pathfinder_4',
      heroId: 'yjkstra-pathfinder',
      name: 'Zone of Control',
      japaneseWord: { kanji: '網', romaji: 'Ami', meaning: 'Lattice Net' },
      backdropPattern: 'rain',
      groundType: 'scallops',
      props: ['nodes'],
      tales: [
        'An architectural graph enveloped the board, pinning enemy sliders in place.',
      ],
    },
  ],

  'ironclad-warden': [
    {
      id: 'ironclad_warden_1',
      heroId: 'ironclad-warden',
      name: 'The Wall Remembers',
      japaneseWord: { kanji: '壁', romaji: 'Kabe', meaning: 'Iron Citadel Wall' },
      backdropPattern: 'forest',
      groundType: 'grass',
      props: ['brick_wall'],
      tales: [
        'Snow broke on the wall in a shrine stair. The warden did not move.',
      ],
    },
    {
      id: 'ironclad_warden_2',
      heroId: 'ironclad-warden',
      name: 'Thick Hide',
      japaneseWord: { kanji: '剛', romaji: 'Gō', meaning: 'Indomitable' },
      backdropPattern: 'rays',
      groundType: 'flames',
      props: ['tower_shield'],
      tales: [
        'Absorbing the initial capture attempt, the Warden repelled the attacker back.',
      ],
    },
    {
      id: 'ironclad_warden_3',
      heroId: 'ironclad-warden',
      name: 'Iron Bastion',
      japaneseWord: { kanji: '城', romaji: 'Shiro', meaning: 'Fortress' },
      backdropPattern: 'rain',
      groundType: 'flames',
      props: ['cracked_shield'],
      tales: [
        'Planted firm upon the home rank, the Ironclad Warden anchored the entire roster.',
      ],
    },
    {
      id: 'ironclad_warden_4',
      heroId: 'ironclad-warden',
      name: 'Unshakable Will',
      japaneseWord: { kanji: '巌', romaji: 'Iwa', meaning: 'Solid Crag' },
      backdropPattern: 'stripes',
      groundType: 'grass',
      props: ['iron_bars'],
      tales: [
        'No slider or leaper could penetrate the Warden’s zone of protection.',
      ],
    },
  ],

  'black-monkey': [
    {
      id: 'black_monkey_1',
      heroId: 'black-monkey',
      name: 'The Stolen Moon',
      japaneseWord: { kanji: '盗', romaji: 'Nusumi', meaning: 'Stealth / Theft' },
      backdropPattern: 'forest',
      groundType: 'grass',
      props: ['mini_moon', 'rope'],
      tales: [
        'At midnight the monkey stole the moon from a bamboo road. The crows never saw him.',
      ],
    },
    {
      id: 'black_monkey_2',
      heroId: 'black-monkey',
      name: 'Mirror Decoy',
      japaneseWord: { kanji: '鏡', romaji: 'Kagami', meaning: 'Illusion Mirror' },
      backdropPattern: 'ink-waves',
      groundType: 'grass',
      props: ['decoy_mask'],
      tales: [
        'An enemy hero stepped onto the square, only to find a hollow decoy mask.',
      ],
    },
    {
      id: 'black_monkey_3',
      heroId: 'black-monkey',
      name: 'Treetop Leap',
      japaneseWord: { kanji: '跳', romaji: 'Chō', meaning: 'Agile Leap' },
      backdropPattern: 'rays',
      groundType: 'rooftops',
      props: ['branches'],
      tales: [
        'Hopping over frontline blockers, the BlackMonkey struck the backline priest.',
      ],
    },
    {
      id: 'black_monkey_4',
      heroId: 'black-monkey',
      name: 'Shadow Swarm',
      japaneseWord: { kanji: '幻', romaji: 'Gen', meaning: 'Mirage' },
      backdropPattern: 'grid-city',
      groundType: 'rooftops',
      props: ['smoke_ring'],
      tales: [
        'A swirl of illusions enveloped the flank, confusing enemy targeting.',
      ],
    },
  ],

  'part-king-kong': [
    {
      id: 'part_king_kong_1',
      heroId: 'part-king-kong',
      name: 'Roar Over the City',
      japaneseWord: { kanji: '咆', romaji: 'Hō', meaning: 'Primal Roar' },
      backdropPattern: 'grid-city',
      groundType: 'rooftops',
      props: ['shattered_tower'],
      tales: [
        'At dawn the brute stood on a rooftop and roared. The cracked bell fell silent.',
      ],
    },
    {
      id: 'part_king_kong_2',
      heroId: 'part-king-kong',
      name: 'Rampage Chain',
      japaneseWord: { kanji: '暴', romaji: 'Bō', meaning: 'Rampage' },
      backdropPattern: 'rays',
      groundType: 'flames',
      props: ['broken_chain'],
      tales: [
        'Slaying the first enemy hero, King Kong immediately chained into a second capture.',
      ],
    },
    {
      id: 'part_king_kong_3',
      heroId: 'part-king-kong',
      name: 'Earthquake Slam',
      japaneseWord: { kanji: '震', romaji: 'Shin', meaning: 'Seismic Shock' },
      backdropPattern: 'rain',
      groundType: 'flames',
      props: ['rubble'],
      tales: [
        'Enormous fists slammed into the earth, rooting adjacent units in place.',
      ],
    },
    {
      id: 'part_king_kong_4',
      heroId: 'part-king-kong',
      name: 'Colossal Apex',
      japaneseWord: { kanji: '頂', romaji: 'Itadaki', meaning: 'Apex Summit' },
      backdropPattern: 'ink-waves',
      groundType: 'flames',
      props: ['crushed_crown'],
      tales: [
        'The apex brute dominated the center squares, crushing all resistance.',
      ],
    },
  ],
};

export function getSceneRecipeForCard(heroId: string, seed: number): SceneRecipe {
  const recipes = HERO_SCENE_RECIPES[heroId] || HERO_SCENE_RECIPES['mugen-king'];
  return recipes[seed % recipes.length];
}
