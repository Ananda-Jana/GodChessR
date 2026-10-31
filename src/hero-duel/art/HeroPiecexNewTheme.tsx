import React from 'react';
export type PieceColor = 'white' | 'black' | 'w' | 'b';

export type HeroPieceType =
  | 'mugenKing'
  | 'shrinePriest'
  | 'methanogenic'
  | 'englland'
  | 'ajx'
  | 'yjkstra'
  | 'ironcladWarden'
  | 'blackMonkey'
  | 'partyKingKong';

export interface HeroPieceProps {
  type: HeroPieceType;
  color: PieceColor;
  className?: string;
}

/** Display metadata for menus, tooltips and the hero select screen. */
export const HERO_INFO: Record<HeroPieceType, { name: string; title: string }> = {
  mugenKing: { name: 'MugenKING', title: 'The Sovereign' },
  shrinePriest: { name: 'Malevolent Shrine Priest', title: 'Curse Controller' },
  methanogenic: { name: 'Dr. Methanogenic', title: 'Alchemist of Gas' },
  englland: { name: 'Captain Englland', title: 'Field Commander' },
  ajx: { name: 'AJX', title: 'The Phase Assassin' },
  yjkstra: { name: 'Yjkstra', title: 'The Pathfinder' },
  ironcladWarden: { name: 'Ironclad Warden', title: 'Wall Tank' },
  blackMonkey: { name: 'BlackMonkey', title: 'The Trickster' },
  partyKingKong: { name: 'Party King Kong', title: 'The Brute' },
};

export const HERO_TYPES = Object.keys(HERO_INFO) as HeroPieceType[];

/**
 * ============================================================================
 * HERO PIECES - close-up character busts, drawn with real bezier curves
 * ============================================================================
 * Every hero is a hand-drawn illustration in a 24x24 box (feet / base line on
 * y = 19). The head fills roughly half the height so the FACE reads first.
 * All shapes are smooth cubic-bezier paths (no straight-line polygons), with
 * soft shadow + light overlays and a few linear gradients for cloth, skin,
 * fur and metal so the pieces feel like finished illustrations.
 *
 *   mugenKing       front, chin up    - horned + spiked-crown barbarian king, braided beard, scar, scepter
 *   shrinePriest    head tilted       - tall bent hat + talisman, long dark hair, FOUR slit eyes, curse marks
 *   methanogenic    side PROFILE      - plague-doctor beak mask, goggle lens, gas tank, flask bandolier
 *   englland        front, square     - peaked cap + badge, square stubbled jaw, epaulettes, battle standard
 *   ajx             tilted + ghosted  - deep hood, glowing slit eyes, vented mask, curved blades, glowing core
 *   yjkstra         3/4 look-up       - wide-brim hat + feather + goggles, bandana mask, compass, kite cloak
 *   ironcladWarden  low, squared      - closed great helm with cross visor, rivets, stacked plate pauldrons
 *   blackMonkey     cocked, grinning  - feather fan, single horn, raised brow, big grin, trick card in hand
 *   partyKingKong   hunched, huge     - hooded gorilla, brow ridge, tusks, party cone hat, confetti
 *
 * Team colours (NO yellow anywhere)
 * - White side: mostly WHITE / pale steel, with a minority of BLUE accents.
 * - Black side: mostly BLACK / charcoal, with a minority of RED accents.
 *   (Different bases - chevron vs shield - keep it colour-blind friendly.)
 *
 * Gradients use fixed ids per team colour (hp-white-*, hp-black-*). Every
 * instance defines identical gradients, so any number of pieces can share a
 * page or one <svg> safely.
 *
 * Exports: HeroPiece (drop-in, same props as before), HeroArt (bare <g> for
 * embedding inside your own <svg>), HeroPieceSheet (one unified SVG with
 * every hero in both colours, for visual verification).
 */
interface Palette {
  pid: string; // id prefix for gradients / clip paths
  edge: string; // outline colour
  ink: string; // facial detail ink (brows, pupils, mouths)
  shade: string; // colour of soft shadow overlays
  light: string; // colour of soft light overlays
  body: string; // main clothing / armour (gradient)
  bodyShade: string;
  bodyHi: string;
  skin: string; // gradient
  skinShade: string;
  hair: string; // light hair (king) - gradient
  hairDark: string; // dark hair (priest) - gradient
  fur: string; // monkey fur - gradient
  steel: string; // metal - gradient
  steelHi: string;
  acc: string; // minority accent: blue (white team) / red (black team) - gradient
  accHi: string;
  accDeep: string;
  void: string; // dark hollow (hood interior, visor slits)
  paper: string; // eye whites, teeth, talisman, card
}

type GradName = 'body' | 'skin' | 'hair' | 'hairDark' | 'fur' | 'steel' | 'acc';
type GradSet = Record<GradName, [string, string]>;

const GRADS: Record<'white' | 'black', GradSet> = {
  white: {
    body: ['#ffffff', '#cdd7e8'],
    skin: ['#f6f9fd', '#cbd6e9'],
    hair: ['#eef2f9', '#a9b8d3'],
    hairDark: ['#4d63ad', '#212d5c'],
    fur: ['#b9c6df', '#7889ad'],
    steel: ['#f3f6fb', '#9aabc8'],
    acc: ['#5b95ff', '#1d4ed8'],
  },
  black: {
    body: ['#2c3445', '#0a0c12'],
    skin: ['#76829c', '#3b4458'],
    hair: ['#262b38', '#06070b'],
    hairDark: ['#1b202c', '#04050a'],
    fur: ['#242a37', '#06070a'],
    steel: ['#929db3', '#424b5e'],
    acc: ['#ff5566', '#a30f20'],
  },
};

const GRAD_NAMES = Object.keys(GRADS.white) as GradName[];

const buildPalette = (c: 'white' | 'black'): Palette => {
  const pid = `hp-${c}`;
  const u = (n: GradName) => `url(#${pid}-${n})`;
  return c === 'white'
    ? {
        pid,
        edge: '#1b2747',
        ink: '#18213f',
        shade: '#1b2747',
        light: '#ffffff',
        body: u('body'),
        bodyShade: '#d3dbe9',
        bodyHi: '#ffffff',
        skin: u('skin'),
        skinShade: '#bfcbe0',
        hair: u('hair'),
        hairDark: u('hairDark'),
        fur: u('fur'),
        steel: u('steel'),
        steelHi: '#eef3fb',
        acc: u('acc'),
        accHi: '#9cc3ff',
        accDeep: '#1e3a8a',
        void: '#1b2747',
        paper: '#ffffff',
      }
    : {
        pid,
        edge: '#8d98b0',
        ink: '#04060a',
        shade: '#000000',
        light: '#b8c4e0',
        body: u('body'),
        bodyShade: '#0d1017',
        bodyHi: '#2a3140',
        skin: u('skin'),
        skinShade: '#343c4e',
        hair: u('hair'),
        hairDark: u('hairDark'),
        fur: u('fur'),
        steel: u('steel'),
        steelHi: '#b3bdd0',
        acc: u('acc'),
        accHi: '#ff7a88',
        accDeep: '#7d0c1a',
        void: '#020305',
        paper: '#d6dce8',
      };
};
const PAL = { white: buildPalette('white'), black: buildPalette('black') };

type Draw = (p: Palette) => React.ReactNode;

/* ----------------------------- drawing helpers ---------------------------- */
/** Filled + outlined bezier path. */
const pa = (p: Palette, d: string, fill: string, w = 0.32, opacity?: number) => (
  <path d={d} fill={fill} stroke={p.edge} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" opacity={opacity} />
);
/** Soft shadow overlay (no outline). */
const sd = (p: Palette, d: string, o = 0.16) => <path d={d} fill={p.shade} opacity={o} />;
/** Soft light overlay (no outline). */
const lt = (p: Palette, d: string, o = 0.35) => <path d={d} fill={p.light} opacity={o} />;
/** Open stroked curve. */
const st = (d: string, stroke: string, w = 0.3, opacity?: number) => (
  <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
);
/** Round dot with outline. */
const dot = (p: Palette, cx: number, cy: number, r: number, fill: string, w = 0.2) => (
  <circle cx={cx} cy={cy} r={r} fill={fill} stroke={p.edge} strokeWidth={w} />
);
/** Mirror children across the centre line x = 12. */
const Mir: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g transform="translate(24 0) scale(-1 1)">{children}</g>
);
/** Rotate children (head tilts). */
const Tilt: React.FC<{ a: number; cx: number; cy: number; children?: React.ReactNode }> = ({ a, cx, cy, children }) => (
  <g transform={`rotate(${a} ${cx} ${cy})`}>{children}</g>
);
/** Leaf / feather shape pointing up from (x,y), rotated by `a` degrees. */
const leaf = (p: Palette, x: number, y: number, a: number, len: number, wid: number, fill: string, quill?: string) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <path
      d={`M0 0 C${wid} ${-len * 0.25} ${wid * 1.05} ${-len * 0.75} 0 ${-len} C${-wid * 1.05} ${-len * 0.75} ${-wid} ${-len * 0.25} 0 0 Z`}
      fill={fill}
      stroke={p.edge}
      strokeWidth="0.26"
      strokeLinejoin="round"
    />
    <path d={`M0 ${-len * 0.05} L0 ${-len * 0.92}`} stroke={quill || p.edge} strokeWidth="0.16" opacity="0.7" strokeLinecap="round" />
  </g>
);
/** Small curved fang / tooth hanging from (x,y). */
const tooth = (p: Palette, x: number, y: number, len: number, fill: string) =>
  pa(p, `M${x - 0.5} ${y} Q${x - 0.25} ${y + len * 0.7} ${x} ${y + len} Q${x + 0.25} ${y + len * 0.7} ${x + 0.5} ${y} Q${x} ${y - 0.15} ${x - 0.5} ${y} Z`, fill, 0.2);

/** Standard almond eye (left side, centred ~ (10.1, 8.5)). Mirror for the right eye. */
const eyeStd = (p: Palette, iris: string, irisR = 0.5) => (
  <>
    <path d="M8.8 8.6 C9.4 7.8 10.8 7.7 11.4 8.5 C10.8 9.2 9.4 9.3 8.8 8.6 Z" fill={p.paper} stroke={p.edge} strokeWidth="0.18" />
    <circle cx="10.2" cy="8.5" r={irisR} fill={iris} />
    <circle cx="10.2" cy="8.5" r={irisR * 0.45} fill={p.ink} />
    <circle cx="10" cy="8.28" r="0.14" fill="#ffffff" />
    {st('M8.7 8.7 C9.4 7.7 10.8 7.6 11.5 8.5', p.ink, 0.34)}
  </>
);
/** Human head silhouette. */
const HEAD =
  'M8.1 7.6 C8.1 4.9 9.8 3.8 12 3.8 C14.2 3.8 15.9 4.9 15.9 7.6 C15.9 9.4 15.5 10.7 14.7 11.8 C14 12.8 13.1 13.5 12 13.5 C10.9 13.5 10 12.8 9.3 11.8 C8.5 10.7 8.1 9.4 8.1 7.6 Z';
/** Soft shadow crescent along the right side of a face. */
const FACE_SHADE =
  'M13.4 4.4 C15.2 5.2 16 6.2 15.9 7.8 C15.9 9.4 15.5 10.7 14.7 11.8 C14 12.8 13.1 13.5 12 13.5 C13.7 11.8 14.3 8 13.4 4.4 Z';

/* ---------------------------------------------------------------------------
 * 1. MUGEN KING - barbarian king: horned, spiked iron crown, braided beard
 * ------------------------------------------------------------------------- */
const HORN = 'M8.8 6.6 C6.8 7 4.9 5.8 4.4 3.7 C4.2 2.9 4.3 2.2 4.7 1.6 C4.9 3.2 6.2 4.3 8.3 4.7 Z';
const crownSpike = (x: number, h: number, w: number) => {
  const by = 4.9 + Math.pow((x - 12) / 4, 2) * 0.7 + 0.15;
  return `M${x - w} ${by} C${x - w * 0.5} ${by - h * 0.45} ${x - 0.1} ${by - h * 0.78} ${x} ${by - h} C${x + 0.1} ${by - h * 0.78} ${x + w * 0.5} ${by - h * 0.45} ${x + w} ${by} Z`;
};
const drawKing: Draw = (p) => (
  <>
    {/* scepter */}
    {st('M21.2 6.4 L21.2 19', p.edge, 1.5)}
    {st('M21.2 6.4 L21.2 19', p.steel, 0.8)}
    {st('M20.9 7 L20.9 18.6', p.light, 0.18, 0.6)}
    <ellipse cx="21.2" cy="10" rx="0.9" ry="0.38" fill={p.steelHi} stroke={p.edge} strokeWidth="0.2" />
    <ellipse cx="21.2" cy="13.5" rx="0.9" ry="0.38" fill={p.steelHi} stroke={p.edge} strokeWidth="0.2" />
    {pa(p, 'M19.3 3.4 C19.3 5.6 20.3 6.7 21.2 6.7 C22.1 6.7 23.1 5.6 23.1 3.4 C22.5 4.8 21.9 5.2 21.2 5.2 C20.5 5.2 19.9 4.8 19.3 3.4 Z', p.steel)}
    {dot(p, 21.2, 3.3, 1.2, p.acc, 0.3)}
    <circle cx="20.75" cy="2.85" r="0.38" fill="#ffffff" opacity="0.75" />
    {/* horns */}
    {pa(p, HORN, p.steel)}
    {st('M7.9 5.6 C6.3 5.4 5.3 4.4 5 3', p.light, 0.2, 0.7)}
    {st('M6.1 5.5 C6.2 5 6.6 4.7 7 4.6', p.edge, 0.2)}
    <Mir>
      {pa(p, HORN, p.steel)}
      {st('M7.9 5.6 C6.3 5.4 5.3 4.4 5 3', p.light, 0.2, 0.7)}
      {st('M6.1 5.5 C6.2 5 6.6 4.7 7 4.6', p.edge, 0.2)}
    </Mir>
    {/* wild mane */}
    {pa(
      p,
      'M12 2.9 C9.4 2.5 7 3.8 6.3 6 C5.2 6.5 4.7 7.8 4.9 9.2 C4.4 10.6 4.6 12 5.6 13.2 C6.1 12.7 6.8 12.5 7.6 12.5 L16.4 12.5 C17.2 12.5 17.9 12.7 18.4 13.2 C19.4 12 19.6 10.6 19.1 9.2 C19.3 7.8 18.8 6.5 17.7 6 C17 3.8 14.6 2.5 12 2.9 Z',
      p.hair,
    )}
    {st('M7.2 6.6 C6.4 8.6 6.4 10.6 7 12.2', p.edge, 0.18, 0.55)}
    {st('M9 4.8 C8 6.8 7.9 9 8.2 11', p.edge, 0.16, 0.45)}
    <Mir>
      {st('M7.2 6.6 C6.4 8.6 6.4 10.6 7 12.2', p.edge, 0.18, 0.55)}
      {st('M9 4.8 C8 6.8 7.9 9 8.2 11', p.edge, 0.16, 0.45)}
    </Mir>
    {/* neck */}
    {pa(p, 'M10.1 11.4 L9.9 14.8 C11.2 15.6 12.8 15.6 14.1 14.8 L13.9 11.4 Z', p.skin)}
    {sd(p, 'M10.1 11.4 L9.9 14.8 C11.2 15.6 12.8 15.6 14.1 14.8 L13.9 11.4 C12.6 12.6 11.4 12.6 10.1 11.4 Z', 0.22)}
    {/* fur mantle with scalloped edge */}
    {pa(
      p,
      'M2.8 19 C2.6 16.8 3.2 15.2 4.4 14.3 C4.5 13.2 5.4 12.6 6.5 12.8 C7.2 12.2 8.4 12.4 9 13.2 C10 13.6 11 14.2 12 14.8 C13 14.2 14 13.6 15 13.2 C15.6 12.4 16.8 12.2 17.5 12.8 C18.6 12.6 19.5 13.2 19.6 14.3 C20.8 15.2 21.4 16.8 21.2 19 Z',
      p.bodyShade,
    )}
    {lt(p, 'M4.4 14.3 C5 13.4 5.8 13 6.5 12.8 C5.8 14 5.4 15.4 5.4 17 C4.2 16.4 3.9 15.4 4.4 14.3 Z', 0.4)}
    {st('M5.6 15 C6 16.4 5.8 17.8 5.2 19', p.edge, 0.18, 0.6)}
    {st('M8 14.2 C8.4 16 8 17.6 7.4 19', p.edge, 0.18, 0.6)}
    <Mir>
      {st('M5.6 15 C6 16.4 5.8 17.8 5.2 19', p.edge, 0.18, 0.6)}
      {st('M8 14.2 C8.4 16 8 17.6 7.4 19', p.edge, 0.18, 0.6)}
    </Mir>
    {/* tunic + banner stripe */}
    {pa(p, 'M7.8 19 C8 16.8 8.6 15.2 9.6 14.2 C10.4 14.9 11.2 15.3 12 15.3 C12.8 15.3 13.6 14.9 14.4 14.2 C15.4 15.2 16 16.8 16.2 19 Z', p.body)}
    {pa(p, 'M11.3 15.3 C11.6 15.4 12.4 15.4 12.7 15.3 L13 19 L11 19 Z', p.acc, 0.2)}
    {/* tooth necklace */}
    {st('M8.8 14.3 Q12 16.8 15.2 14.3', p.edge, 0.25)}
    {tooth(p, 9.5, 14.75, 1.1, p.paper)}
    {tooth(p, 10.7, 15.3, 1.2, p.paper)}
    {tooth(p, 12, 15.55, 1.5, p.paper)}
    {tooth(p, 13.3, 15.3, 1.2, p.paper)}
    {tooth(p, 14.5, 14.75, 1.1, p.paper)}
    {/* face */}
    {pa(p, HEAD, p.skin)}
    {sd(p, FACE_SHADE, 0.16)}
    {lt(p, 'M9 6 C9.4 5 10.4 4.6 11.4 4.5 C10.4 5.2 9.8 6.4 9.6 8 C9.2 7.6 9 6.8 9 6 Z', 0.4)}
    {st('M11.3 8.4 C11.2 9.4 10.9 10 10.7 10.4 C11.2 10.9 12.8 10.9 13.3 10.4', p.ink, 0.22, 0.7)}
    {/* eyes: heavy brow, team-colour irises */}
    {eyeStd(p, p.acc)}
    <Mir>{eyeStd(p, p.acc)}</Mir>
    {pa(p, 'M8.2 8 C9.2 6.9 10.8 6.9 11.8 8 C10.8 7.5 9.2 7.5 8.2 8 Z', p.ink, 0.2)}
    <Mir>{pa(p, 'M8.2 8 C9.2 6.9 10.8 6.9 11.8 8 C10.8 7.5 9.2 7.5 8.2 8 Z', p.ink, 0.2)}</Mir>
    {/* glowing battle scar */}
    {st('M13.4 5.9 C14.3 7.4 14.9 8.8 14.6 10.4', p.acc, 0.42)}
    {st('M13.1 7.2 C13.6 7.1 14 7.2 14.4 7.4', p.acc, 0.22)}
    {st('M13.6 8.8 C14.1 8.7 14.5 8.8 14.9 9', p.acc, 0.22)}
    {/* flowing beard + braided plaits */}
    {pa(
      p,
      'M8.1 8.6 C7.9 10.8 8.3 12.8 9.2 14.2 C10 15.6 11 16.2 12 16.7 C13 16.2 14 15.6 14.8 14.2 C15.7 12.8 16.1 10.8 15.9 8.6 C15.4 10.2 14.2 11.2 12 11.2 C9.8 11.2 8.6 10.2 8.1 8.6 Z',
      p.hair,
    )}
    {sd(p, 'M12 11.2 C14.2 11.2 15.4 10.2 15.9 8.6 C16.1 10.8 15.7 12.8 14.8 14.2 C14 15.6 13 16.2 12 16.7 C13 14.6 12.8 12.8 12 11.2 Z', 0.14)}
    {st('M10.4 12 C10.2 13.4 10.6 14.6 11.2 15.6', p.edge, 0.18, 0.55)}
    {st('M13.6 12 C13.8 13.4 13.4 14.6 12.8 15.6', p.edge, 0.18, 0.55)}
    {[0, 1, 2, 3].map((i) => (
      <React.Fragment key={i}>
        <ellipse cx={9.45 + (i % 2 ? 0.22 : -0.22)} cy={14.5 + i * 0.75} rx="0.6" ry="0.42" fill={p.hair} stroke={p.edge} strokeWidth="0.18" />
        <ellipse cx={14.55 + (i % 2 ? -0.22 : 0.22)} cy={14.5 + i * 0.75} rx="0.6" ry="0.42" fill={p.hair} stroke={p.edge} strokeWidth="0.18" />
      </React.Fragment>
    ))}
    {dot(p, 9.45, 17.2, 0.34, p.acc, 0.15)}
    {dot(p, 14.55, 17.2, 0.34, p.acc, 0.15)}
    {/* moustache + roaring mouth */}
    {pa(p, 'M9 10.7 C10 9.9 11.2 10.1 12 10.9 C12.8 10.1 14 9.9 15 10.7 C14.2 11.7 13 11.8 12 11.3 C11 11.8 9.8 11.7 9 10.7 Z', p.hair, 0.22)}
    {pa(p, 'M10.9 11.8 C11.4 11.5 12.6 11.5 13.1 11.8 C13 12.8 12.5 13.3 12 13.3 C11.5 13.3 11 12.8 10.9 11.8 Z', p.ink, 0.12)}
    {pa(p, 'M11.2 11.8 C11.6 11.65 12.4 11.65 12.8 11.8 C12.7 12.2 12.4 12.3 12 12.3 C11.6 12.3 11.3 12.2 11.2 11.8 Z', p.paper, 0.05)}
    {/* spiked iron crown */}
    {pa(p, 'M7.9 5.7 C9.6 4.6 14.4 4.6 16.1 5.7 L16.1 6.9 C14.4 5.8 9.6 5.8 7.9 6.9 Z', p.steel)}
    {lt(p, 'M8.4 5.6 C9.8 4.9 12 4.8 13 4.85 C11.6 5.1 9.8 5.5 8.4 6.1 Z', 0.5)}
    {pa(p, crownSpike(8.5, 2.5, 0.75), p.steel, 0.24)}
    {pa(p, crownSpike(10.2, 3.1, 0.8), p.steel, 0.24)}
    {pa(p, crownSpike(12, 3.8, 0.9), p.steel, 0.24)}
    {pa(p, crownSpike(13.8, 3.1, 0.8), p.steel, 0.24)}
    {pa(p, crownSpike(15.5, 2.5, 0.75), p.steel, 0.24)}
    {dot(p, 12, 5.35, 0.55, p.acc, 0.2)}
    <circle cx="11.82" cy="5.15" r="0.16" fill="#ffffff" opacity="0.85" />
  </>
);

/* ---------------------------------------------------------------------------
 * 2. SHRINE PRIEST - tall bent hat, long dark hair, four slit eyes, curse marks
 * ------------------------------------------------------------------------- */
const PRIEST_HAIR = 'M8.4 5.8 C6.4 7.4 6 10.4 6.4 13 C6.6 15 6 16.6 5.2 18 C7 17.4 8.4 16.2 9 14.4 C9.2 12 9 9 9.4 7 Z';
const PRIEST_EYE_UP = 'M9 8.2 C9.8 7.9 10.9 8.2 11.5 8.9 C10.7 9.2 9.6 9.1 9 8.2 Z';
const PRIEST_EYE_LO = 'M9.4 9.9 C10 9.75 10.7 9.95 11.1 10.4 C10.6 10.55 9.9 10.5 9.4 9.9 Z';
const drawPriest: Draw = (p) => (
  <>
    {/* robe */}
    {pa(p, 'M4.4 19 C4.6 16.6 5.8 14.8 8 13.6 C9.4 13 10.8 13.4 12 15 C13.2 13.4 14.6 13 16 13.6 C18.2 14.8 19.4 16.6 19.6 19 Z', p.body)}
    {sd(p, 'M12 15 C13.2 13.4 14.6 13 16 13.6 C18.2 14.8 19.4 16.6 19.6 19 L14.6 19 C14.6 17.4 13.8 16 12 15 Z', 0.12)}
    {st('M8.4 13.9 C9.6 15.4 10.8 16.8 12 17.6 C13.2 16.8 14.4 15.4 15.6 13.9', p.acc, 0.6)}
    {/* sleeve + two-finger curse seal */}
    {pa(p, 'M15.6 19 C15.8 16.8 16.6 15 18 13.8 C19 13.4 20 13.8 20.2 14.8 C20.4 16.2 19.8 17.8 19.4 19 Z', p.body)}
    {pa(p, 'M17.3 14.2 C17.2 12.6 17.3 11.6 17.5 10.8 C17.8 10.4 18.3 10.5 18.4 11 C18.5 11.8 18.5 13 18.5 14.2 Z', p.skin, 0.22)}
    {pa(p, 'M18.5 14.2 C18.6 12.8 18.9 11.8 19.3 11.2 C19.6 10.9 20 11 20 11.5 C19.9 12.3 19.8 13.2 19.6 14.3 Z', p.skin, 0.22)}
    <circle cx="18.8" cy="9.9" r="1.1" fill={p.accHi} opacity="0.3" />
    {dot(p, 18.8, 9.9, 0.55, p.acc, 0.12)}
    {/* long dark hair curtains */}
    {pa(p, PRIEST_HAIR, p.hairDark)}
    {st('M7.6 7.4 C7 10 7.2 13 6.6 16', p.light, 0.16, 0.4)}
    <Mir>
      {pa(p, PRIEST_HAIR, p.hairDark)}
      {st('M7.6 7.4 C7 10 7.2 13 6.6 16', p.light, 0.16, 0.4)}
    </Mir>
    {/* scarf with trailing tail */}
    {pa(p, 'M8 13 C9.6 14.4 14.4 14.4 16 13 C16.8 14.4 16.4 15.8 15.2 16.4 C13.8 17 10.2 17 8.8 16.4 C7.6 15.8 7.2 14.4 8 13 Z', p.acc, 0.26)}
    {pa(p, 'M8.8 15.8 C7.4 16.8 6.4 17.9 6.2 19.2 C7.4 18.6 8.4 18.4 9.2 18.8 C9.2 17.8 9.4 16.8 9.9 16 Z', p.acc, 0.26)}
    <Tilt a={-5} cx={12} cy={10}>
      {/* narrow, pointed face */}
      {pa(p, 'M8.9 6.9 C8.9 5.8 10.2 5.4 12 5.4 C13.8 5.4 15.1 5.8 15.1 6.9 C15.2 8.8 15 10.4 14.2 11.8 C13.6 12.9 12.8 13.6 12 14 C11.2 13.6 10.4 12.9 9.8 11.8 C9 10.4 8.8 8.8 8.9 6.9 Z', p.skin)}
      {sd(p, 'M13.4 5.6 C14.6 5.9 15.1 6.3 15.1 6.9 C15.2 8.8 15 10.4 14.2 11.8 C13.6 12.9 12.8 13.6 12 14 C13.4 12 14 8 13.4 5.6 Z', 0.15)}
      {/* four glowing eyes */}
      {pa(p, PRIEST_EYE_UP, p.acc, 0.2)}
      {pa(p, PRIEST_EYE_LO, p.acc, 0.16)}
      <Mir>
        {pa(p, PRIEST_EYE_UP, p.acc, 0.2)}
        {pa(p, PRIEST_EYE_LO, p.acc, 0.16)}
      </Mir>
      {st('M8.9 8.3 C9.8 7.7 10.9 8 11.6 8.9', p.ink, 0.28)}
      <Mir>{st('M8.9 8.3 C9.8 7.7 10.9 8 11.6 8.9', p.ink, 0.28)}</Mir>
      {/* nose, mouth, curse marks */}
      {st('M12 8.8 C11.9 9.6 11.7 10.2 11.5 10.7 C11.9 10.9 12.3 10.9 12.6 10.7', p.ink, 0.2, 0.7)}
      {st('M10.7 12.1 C11.4 12.6 12.6 12.6 13.3 12.1', p.ink, 0.26)}
      {st('M8.9 10.6 C9.5 11.1 10 11.5 10.6 11.7', p.ink, 0.26)}
      {st('M8.9 11.4 C9.4 11.8 9.8 12 10.2 12.2', p.ink, 0.26)}
      <Mir>
        {st('M8.9 10.6 C9.5 11.1 10 11.5 10.6 11.7', p.ink, 0.26)}
        {st('M8.9 11.4 C9.4 11.8 9.8 12 10.2 12.2', p.ink, 0.26)}
      </Mir>
      {st('M12 6.6 C12 7.2 12 7.8 12 8.2', p.ink, 0.26)}
      {st('M12 12.9 L12 13.7', p.ink, 0.26)}
      {/* tall bent hat */}
      {pa(p, 'M8.6 6 C9.6 4.6 10.6 3.2 11.8 1.6 C12.6 0.6 13.6 0.2 14.4 0.4 C13.8 1 13.6 1.8 13.8 2.8 C14 3.8 14.6 4.8 15.4 6 Z', p.body)}
      {sd(p, 'M13.8 2.8 C14 3.8 14.6 4.8 15.4 6 L13 6 C13.6 4.8 13.8 3.8 13.8 2.8 Z', 0.16)}
      {pa(p, 'M5.6 6.8 C7.4 6 9.4 5.7 12 5.7 C14.6 5.7 16.6 6 18.4 6.8 C16.8 7.6 14.6 7.9 12 7.9 C9.4 7.9 7.2 7.6 5.6 6.8 Z', p.bodyShade)}
      {pa(p, 'M9 5.1 C10.2 5.5 13.8 5.5 15 5.1 L15.4 6.1 C14 6.5 10 6.5 8.6 6.1 Z', p.acc, 0.24)}
      {/* hanging talisman */}
      {pa(p, 'M14.6 7.5 C15.2 7.7 15.9 7.7 16.4 7.5 L16.2 10.6 C15.8 10.95 15 10.95 14.8 10.6 Z', p.paper, 0.2)}
      {st('M15 8.2 C15.3 8.1 15.7 8.1 16 8.2', p.acc, 0.22)}
      {st('M15 8.9 C15.3 8.8 15.7 8.8 16 8.9', p.acc, 0.22)}
      {st('M15.2 9.6 C15.4 9.5 15.6 9.5 15.8 9.6', p.acc, 0.22)}
    </Tilt>
  </>
);

/* ---------------------------------------------------------------------------
 * 3. METHANOGENIC - side profile plague doctor: swept beak, goggle lens
 * ------------------------------------------------------------------------- */
const flask = (p: Palette, cx: number, cy: number) => (
  <>
    {pa(
      p,
      `M${cx - 0.3} ${cy - 1} L${cx - 0.3} ${cy - 0.45} C${cx - 1.1} ${cy - 0.05} ${cx - 1.1} ${cy + 0.95} ${cx} ${cy + 0.95} C${cx + 1.1} ${cy + 0.95} ${cx + 1.1} ${cy - 0.05} ${cx + 0.3} ${cy - 0.45} L${cx + 0.3} ${cy - 1} Z`,
      p.accHi,
      0.2,
    )}
    <rect x={cx - 0.38} y={cy - 1.28} width="0.76" height="0.42" rx="0.15" fill={p.steel} stroke={p.edge} strokeWidth="0.16" />
    <ellipse cx={cx - 0.3} cy={cy + 0.25} rx="0.2" ry="0.34" fill="#ffffff" opacity="0.6" />
  </>
);
const drawMethanogenic: Draw = (p) => (
  <>
    {/* gas tank on the back */}
    <rect x="16.1" y="10.6" width="3.1" height="5.3" rx="1.2" fill={p.steel} stroke={p.edge} strokeWidth="0.3" />
    {st('M16.2 12.3 C17.2 12.6 18.2 12.6 19.1 12.3', p.acc, 0.5)}
    {st('M16.2 14.1 C17.2 14.4 18.2 14.4 19.1 14.1', p.acc, 0.5)}
    {st('M16.7 11.2 C16.5 12.8 16.5 14.4 16.7 15.4', p.light, 0.2, 0.6)}
    {/* coat + high collar */}
    {pa(p, 'M6.4 19 C6.6 16.4 8 14.4 10.4 13.4 L15.8 12.6 C18 13 19.2 15.4 19.6 19 Z', p.body)}
    {sd(p, 'M15.8 12.6 C18 13 19.2 15.4 19.6 19 L15.6 19 C16.4 16.6 16.6 14.4 15.8 12.6 Z', 0.14)}
    {pa(p, 'M9.8 13.4 C10.2 12 11.4 11.2 12.6 11.4 C14.6 11 16.4 11.6 17.4 13 C15.6 14.2 12.2 14.6 9.8 13.4 Z', p.bodyShade)}
    {/* hose from mask to tank */}
    {st('M11.8 11.9 C12 13.6 14.4 14.4 16.2 12.6', p.edge, 1)}
    {st('M11.8 11.9 C12 13.6 14.4 14.4 16.2 12.6', p.steel, 0.5)}
    {/* flask bandolier */}
    {pa(p, 'M7.2 14.2 C10 14.4 14.4 16 18.6 19 L16.8 19.4 C13.4 17.4 10.4 16 7.6 15.6 Z', p.accDeep, 0.24)}
    {flask(p, 10.2, 16.2)}
    {flask(p, 12.9, 17.1)}
    {flask(p, 15.6, 18.2)}
    {/* hooded head */}
    {pa(p, 'M10 7.2 C10.8 5.8 12.6 5.6 14.4 5.8 C16.6 6.2 18.2 8 18.2 10.6 C18.2 12.2 17.4 13.4 16.4 14 L11.6 14 C10.6 13 10.2 11.6 10.2 10 Z', p.body)}
    {sd(p, 'M16.2 6.4 C17.6 7.4 18.2 9 18.2 10.6 C18.2 12.2 17.4 13.4 16.4 14 C17 12 17.2 9 16.2 6.4 Z', 0.16)}
    {/* long swept beak */}
    {pa(p, 'M11.8 7.7 C9 8.2 5.6 9.6 2.6 12.8 C2.4 13.1 2.7 13.35 3 13.25 C6 12.6 9.2 12.7 11.9 12.4 Z', p.bodyHi)}
    {sd(p, 'M11.9 10.8 C9.4 11 5.4 12 2.9 13 C2.7 13.3 2.8 13.4 3 13.25 C6 12.6 9.2 12.7 11.9 12.4 Z', 0.18)}
    {st('M11.7 7.9 C9 8.4 5.8 9.8 3 12.7', p.light, 0.2, 0.7)}
    {dot(p, 9, 11.7, 0.2, p.ink, 0.04)}
    {dot(p, 7.7, 12.1, 0.2, p.ink, 0.04)}
    {dot(p, 6.4, 12.4, 0.2, p.ink, 0.04)}
    {/* escaping gas */}
    <circle cx="1.8" cy="11.2" r="0.5" fill={p.accHi} stroke={p.edge} strokeWidth="0.12" />
    <circle cx="1.3" cy="9.6" r="0.32" fill={p.accHi} stroke={p.edge} strokeWidth="0.1" />
    <circle cx="2.7" cy="9.8" r="0.26" fill={p.accHi} stroke={p.edge} strokeWidth="0.1" />
    {/* round goggle lens */}
    {dot(p, 11, 9.3, 2, p.steel, 0.3)}
    <circle cx="11" cy="9.3" r="1.5" fill={p.accHi} stroke={p.edge} strokeWidth="0.15" />
    <circle cx="11" cy="9.3" r="0.95" fill={p.acc} />
    <circle cx="11" cy="9.3" r="0.45" fill={p.ink} />
    {st('M9.9 8.2 C10.3 7.8 10.8 7.7 11.3 7.8', '#ffffff', 0.25)}
    {/* wide-brim doctor hat */}
    {pa(p, 'M9.6 6.4 C9.6 4.4 10 3 11 2.6 C12.4 2.2 14.6 2.2 15.6 2.8 C16.4 3.6 16.6 5 16.6 6.2 Z', p.body)}
    {sd(p, 'M15.2 2.7 C16.2 3.5 16.6 5 16.6 6.2 L14.8 6.2 C15.2 5 15.4 3.8 15.2 2.7 Z', 0.16)}
    {pa(p, 'M5.8 7.2 C8 6 11 5.8 14 5.8 C17 5.8 19.4 6.4 20.6 7.4 C18.6 8.2 14 8.4 11 8.2 C8.6 8 6.8 7.8 5.8 7.2 Z', p.bodyShade)}
    {pa(p, 'M9.7 5 C11.4 5.4 14.8 5.3 16.5 4.8 L16.6 6 C14.8 6.5 11.4 6.5 9.6 6.1 Z', p.acc, 0.24)}
  </>
);

/* ---------------------------------------------------------------------------
 * 4. CAPTAIN ENGLLAND - peaked cap, square stubbled jaw, standard bearer
 * ------------------------------------------------------------------------- */
const ENG_HEAD =
  'M7.9 7.4 C7.9 5.8 9.6 5.2 12 5.2 C14.4 5.2 16.1 5.8 16.1 7.4 C16.3 9 16.4 10.6 15.8 12 C15.3 13.2 14.2 14.1 12 14.2 C9.8 14.1 8.7 13.2 8.2 12 C7.6 10.6 7.7 9 7.9 7.4 Z';
const ENG_EAR = 'M7.9 8.6 C6.8 8.3 6.3 9.1 6.5 10.1 C6.7 10.9 7.3 11.3 7.9 11.1 Z';
const drawEnglland: Draw = (p) => (
  <>
    {/* battle standard */}
    {st('M21.4 1.6 L21.4 19', p.edge, 1.4)}
    {st('M21.4 1.6 L21.4 19', p.steel, 0.6)}
    {dot(p, 21.4, 1.2, 0.65, p.steelHi, 0.2)}
    {pa(p, 'M21.8 2 C22.6 1.5 23.3 2 23.9 2.2 C23.4 3 23.4 3.9 23.9 4.9 C23.2 5.5 22.4 5.2 21.8 5.7 Z', p.acc, 0.24)}
    {/* neck */}
    {pa(p, 'M10.2 13.6 L10.1 15 C10.8 15.6 11.4 15.9 12 15.9 C12.6 15.9 13.2 15.6 13.9 15 L13.8 13.6 Z', p.skin)}
    {sd(p, 'M10.2 13.6 L10.1 15 C10.8 15.6 11.4 15.9 12 15.9 L12 14.4 C11.3 14.4 10.7 14.1 10.2 13.6 Z', 0.2)}
    {/* broad jacket */}
    {pa(p, 'M3 19 C3 16.6 4 14.8 6.4 14 C8.2 13.5 9.4 13.8 10.2 14.2 C10.8 15.2 11.4 15.6 12 15.8 C12.6 15.6 13.2 15.2 13.8 14.2 C14.6 13.8 15.8 13.5 17.6 14 C20 14.8 21 16.6 21 19 Z', p.body)}
    {sd(p, 'M13.8 14.2 C14.6 13.8 15.8 13.5 17.6 14 C20 14.8 21 16.6 21 19 L16.4 19 C16.4 17 15.4 15.2 13.8 14.2 Z', 0.13)}
    {pa(p, 'M9.4 14.1 C10.2 15.8 11 17.2 12 18.4 C13 17.2 13.8 15.8 14.6 14.1 C14.4 14 14 14 13.8 14.2 C13.4 15.2 12.8 16 12 16.6 C11.2 16 10.6 15.2 10.2 14.2 C10 14 9.6 14 9.4 14.1 Z', p.bodyShade, 0.2)}
    {pa(p, 'M11.4 15.8 L12.6 15.8 C12.8 16.8 12.9 17.8 12.8 18.6 L12 19 L11.2 18.6 C11.1 17.8 11.2 16.8 11.4 15.8 Z', p.acc, 0.2)}
    {/* epaulettes + medals */}
    {pa(p, 'M3.4 16 C3.4 15 4 14.5 5 14.2 C6 13.9 7 13.6 8 13.8 C8 14.6 7.6 15.2 7 15.6 C5.8 16 4.6 16.3 3.4 16 Z', p.steel, 0.24)}
    <Mir>{pa(p, 'M3.4 16 C3.4 15 4 14.5 5 14.2 C6 13.9 7 13.6 8 13.8 C8 14.6 7.6 15.2 7 15.6 C5.8 16 4.6 16.3 3.4 16 Z', p.steel, 0.24)}</Mir>
    {pa(p, 'M5.5 16.9 L6.6 16.9 L6.6 18.4 L5.5 18.4 Z', p.acc, 0.15)}
    {pa(p, 'M6.8 16.9 L7.9 16.9 L7.9 18.4 L6.8 18.4 Z', p.steelHi, 0.15)}
    {/* square jaw face + ears */}
    {pa(p, ENG_EAR, p.skinShade, 0.2)}
    <Mir>{pa(p, ENG_EAR, p.skinShade, 0.2)}</Mir>
    {pa(p, ENG_HEAD, p.skin)}
    {sd(p, 'M13.6 5.4 C15.2 5.8 16.1 6.4 16.1 7.4 C16.3 9 16.4 10.6 15.8 12 C15.3 13.2 14.2 14.1 12 14.2 C13.8 12.6 14.4 8.4 13.6 5.4 Z', 0.16)}
    {st('M11.3 9.7 C11.2 10.6 10.9 11.2 10.8 11.6 C11.2 11.9 12.8 11.9 13.2 11.6', p.ink, 0.22, 0.7)}
    {/* stern eyes */}
    <g transform="translate(0 0.9)">{eyeStd(p, p.ink, 0.45)}</g>
    <Mir>
      <g transform="translate(0 0.9)">{eyeStd(p, p.ink, 0.45)}</g>
    </Mir>
    {pa(p, 'M8.4 8.7 C9.2 8.3 10.6 8.2 11.7 8.7 C10.6 8.6 9.2 8.7 8.4 9.1 Z', p.ink, 0.2)}
    <Mir>{pa(p, 'M8.4 8.7 C9.2 8.3 10.6 8.2 11.7 8.7 C10.6 8.6 9.2 8.7 8.4 9.1 Z', p.ink, 0.2)}</Mir>
    {st('M10.5 12.9 C11.4 13.1 12.6 13.1 13.5 12.9', p.ink, 0.34)}
    {st('M12 13.5 L12 14', p.ink, 0.2, 0.6)}
    {[
      [9.2, 12], [9.8, 12.8], [10.5, 13.4], [14.8, 12], [14.2, 12.8], [13.5, 13.4], [8.6, 11], [15.4, 11],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="0.13" fill={p.ink} opacity="0.5" />
    ))}
    {/* peaked cap */}
    {pa(p, 'M7.6 6.6 C7.4 4.6 9 2.8 12 2.6 C15 2.8 16.6 4.6 16.4 6.6 C14.6 6 9.4 6 7.6 6.6 Z', p.body)}
    {lt(p, 'M8.4 5 C8.9 3.8 10 3.1 11.4 2.9 C10.2 3.6 9.4 4.6 9.2 5.8 C8.8 5.7 8.5 5.5 8.4 5 Z', 0.5)}
    {pa(p, 'M7.5 5.6 C9.4 5.1 14.6 5.1 16.5 5.6 L16.5 6.7 C14.6 6.2 9.4 6.2 7.5 6.7 Z', p.acc, 0.24)}
    {pa(p, 'M6.6 6.9 C9 6.3 15 6.3 17.4 6.9 C17.6 7.7 17 8.3 16 8.5 C13.4 8.1 10.6 8.1 8 8.5 C7 8.3 6.4 7.7 6.6 6.9 Z', p.bodyShade)}
    {dot(p, 12, 4.3, 1.05, p.steel, 0.2)}
    {pa(p, 'M12 3.6 L12.28 4.1 L12.84 4.15 L12.42 4.5 L12.55 5.05 L12 4.75 L11.45 5.05 L11.58 4.5 L11.16 4.15 L11.72 4.1 Z', p.steelHi, 0.1)}
  </>
);

/* ---------------------------------------------------------------------------
 * 5. AJX - hooded phase assassin: ghosted, glowing slit eyes, curved blades
 * ------------------------------------------------------------------------- */
const AJX_HOOD =
  'M8.2 6.4 C8.4 3.8 10.4 1.8 13 1.8 C15.4 1.8 17.2 3.2 17.8 5.2 C18.8 4.6 20 4.2 21.2 4.4 C20 5.4 19.2 6.6 18.6 8 C18.4 10.4 17.6 12.4 16.2 13.2 C14.8 13.8 11.4 13.8 9.8 12.8 C8.6 11.8 8 9.4 8.2 6.4 Z';
const AJX_BLADE = 'M6.2 19 C8 16.8 11 14.8 14.8 13.6 C12.4 15.6 9.8 17.6 7.2 19.4 Z';
const drawAjx: Draw = (p) => (
  <Tilt a={-7} cx={12} cy={12}>
    {/* trailing scarf */}
    {pa(p, 'M13 13 C15 12.2 17.6 12.6 19.4 13.6 C20.4 14 21.6 13.4 22.6 12.2 C22.2 14 21.4 15.6 19.8 16 C18 16.2 16 15.6 14.2 14.8 Z', p.acc, 0.26)}
    {/* spindly torso + sharp shoulders */}
    {pa(p, 'M9.2 13.6 C10.6 14 13.4 14 14.8 13.6 C15.6 15.4 16 17.2 16.2 19 L7.8 19 C8 17.2 8.5 15.4 9.2 13.6 Z', p.body)}
    {pa(p, 'M5.8 15.8 C7 14.6 8.2 13.8 9.2 13.2 C10.4 14 13.6 14 14.8 13.2 C15.8 13.8 17 14.6 18.2 15.8 C16.8 15.4 15.8 15.2 14.4 14.8 C12.8 15.2 11.2 15.2 9.6 14.8 C8.2 15.2 7.2 15.4 5.8 15.8 Z', p.bodyShade)}
    {/* crossed curved blades */}
    {pa(p, AJX_BLADE, p.steel, 0.24)}
    <Mir>{pa(p, AJX_BLADE, p.steel, 0.24)}</Mir>
    {/* glowing core */}
    <circle cx="12" cy="16" r="2.3" fill="none" stroke={p.acc} strokeWidth="0.25" opacity="0.7" />
    <circle cx="12" cy="16" r="1.9" fill={p.accHi} opacity="0.25" />
    {dot(p, 12, 16, 1.3, p.acc, 0.25)}
    <circle cx="12" cy="16" r="0.75" fill={p.accHi} />
    <circle cx="11.75" cy="15.75" r="0.28" fill="#ffffff" />
    {/* phase ghost (offset copy) */}
    <g transform="translate(-1.5 0.6)" opacity="0.4">{pa(p, AJX_HOOD, p.acc, 0.2)}</g>
    {/* hood + hollow */}
    {pa(p, AJX_HOOD, p.body)}
    {sd(p, 'M17.8 5.2 C18.4 7.4 18.4 10 16.2 13.2 C14.8 13.8 11.4 13.8 9.8 12.8 C12.8 12.8 16.6 10.4 17.8 5.2 Z', 0.16)}
    {lt(p, 'M9 6.2 C9.4 4.2 10.8 2.9 12.6 2.6 C11 3.6 10 5 9.8 7 C9.4 7 9.1 6.7 9 6.2 Z', 0.45)}
    {pa(p, 'M9.6 7.2 C9.6 5.8 10.8 4.8 12.6 4.8 C14.4 4.8 15.6 5.8 15.6 7.4 C15.8 9.4 15.4 11 14.4 12 C13.6 12.6 11.8 12.6 10.8 11.8 C9.8 10.8 9.4 9 9.6 7.2 Z', p.void, 0.2)}
    {/* glowing slit eyes (one bigger: phase glitch) */}
    <ellipse cx="10.9" cy="8.4" rx="1.6" ry="0.9" fill={p.accHi} opacity="0.3" transform="rotate(10 10.9 8.4)" />
    <path d="M9.8 8.2 C10.5 7.7 11.5 7.8 12.2 8.5 C11.4 8.9 10.5 8.8 9.8 8.2 Z" fill={p.accHi} />
    <ellipse cx="14" cy="8.1" rx="1.8" ry="1" fill={p.accHi} opacity="0.3" transform="rotate(-14 14 8.1)" />
    <path d="M12.7 8.6 C13.4 7.7 14.5 7.3 15.3 7.4 C15.1 8.3 14 9 12.7 8.6 Z" fill={p.accHi} />
    {pa(p, 'M12.4 5.2 C12.8 5.6 12.9 6 12.4 6.6 C11.9 6 12 5.6 12.4 5.2 Z', p.acc, 0.14)}
    {/* vented mask */}
    {pa(p, 'M10.2 10.2 C11.4 9.8 13.6 9.8 14.8 10.2 C14.8 11.2 14.4 12 13.4 12.4 C12.6 12.7 11.8 12.7 11 12.4 C10.4 12 10.2 11.2 10.2 10.2 Z', p.steel, 0.24)}
    {st('M11.1 10.4 C11 11.2 11.1 11.8 11.4 12.2', p.ink, 0.2)}
    {st('M12.2 10.3 C12.1 11.1 12.2 11.9 12.4 12.4', p.ink, 0.2)}
    {st('M13.3 10.3 C13.3 11 13.3 11.6 13.1 12.1', p.ink, 0.2)}
  </Tilt>
);

/* ---------------------------------------------------------------------------
 * 6. YJKSTRA - wide-brim hat + feather, bandana, goggles, compass, kite cloak
 * ------------------------------------------------------------------------- */
const YJK_EYE = (
  <>
    <path d="M8.8 8.6 C9.4 7.8 10.8 7.7 11.4 8.5 C10.8 9.2 9.4 9.3 8.8 8.6 Z" fill="#ffffff" stroke="#000" strokeOpacity="0.5" strokeWidth="0.16" />
  </>
);
void YJK_EYE;
const yjkEye = (p: Palette, tx: number) => (
  <g transform={`translate(${tx} 1.2) scale(0.95)`}>
    <path d="M8.8 8.6 C9.4 7.8 10.8 7.7 11.4 8.5 C10.8 9.2 9.4 9.3 8.8 8.6 Z" fill={p.paper} stroke={p.edge} strokeWidth="0.18" />
    <circle cx="10.6" cy="8.3" r="0.5" fill={p.acc} />
    <circle cx="10.6" cy="8.3" r="0.24" fill={p.ink} />
    <circle cx="10.4" cy="8.1" r="0.12" fill="#ffffff" />
    {st('M8.7 8.7 C9.4 7.7 10.8 7.6 11.5 8.5', p.ink, 0.34)}
  </g>
);
const drawYjkstra: Draw = (p) => (
  <>
    {/* bowed kite-shaped cloak */}
    {pa(p, 'M12 12.6 C14.6 13.6 17.6 14.6 19.4 16 C17.2 17.4 14.2 18.8 12 20 C9.8 18.8 6.8 17.4 4.6 16 C6.4 14.6 9.4 13.6 12 12.6 Z', p.body)}
    {pa(p, 'M12 14.6 C13.6 15.2 15.2 15.7 16 16.1 C14.8 16.9 13.4 17.8 12 18.6 C10.6 17.8 9.2 16.9 8 16.1 C8.8 15.7 10.4 15.2 12 14.6 Z', p.bodyShade, 0.2)}
    {st('M4.9 16 C7.2 17.6 9.8 18.9 12 19.8 C14.2 18.9 16.8 17.6 19.1 16', p.acc, 0.5)}
    {pa(p, 'M6.6 14.2 C8 13.2 9.6 12.6 11.2 12.4 L12.8 12.4 C14.4 12.6 16 13.2 17.4 14.2 C15.4 15.2 13.6 15.4 12 15.4 C10.4 15.4 8.6 15.2 6.6 14.2 Z', p.bodyShade)}
    {/* compass pendant */}
    {st('M9.6 13.6 C10.4 14.6 11.2 15.2 12 15.5 C12.8 15.2 13.6 14.6 14.4 13.6', p.steel, 0.3)}
    {dot(p, 12, 16.7, 1.2, p.steel, 0.25)}
    <circle cx="12" cy="16.7" r="0.82" fill={p.paper} />
    {pa(p, 'M12 15.9 C12.35 16.3 12.4 16.5 12 17.5 C11.6 16.5 11.65 16.3 12 15.9 Z', p.acc, 0.1)}
    <Tilt a={7} cx={12} cy={11}>
      {/* three-quarter face */}
      {pa(p, 'M8.6 7.8 C8.6 5.8 10.2 5.2 12.2 5.2 C14.4 5.2 15.9 6.2 16 8 C16.1 9.6 15.7 11.2 14.8 12.4 C14 13.4 13 14 11.8 14 C10.6 13.8 9.6 12.8 9.1 11.6 C8.7 10.6 8.5 9.2 8.6 7.8 Z', p.skin)}
      {sd(p, 'M14 5.6 C15.2 6.2 16 7 16 8 C16.1 9.6 15.7 11.2 14.8 12.4 C14 13.4 13 14 11.8 14 C13.8 12.4 14.6 8 14 5.6 Z', 0.16)}
      {/* alert eyes looking up-right */}
      {yjkEye(p, 0.5)}
      {yjkEye(p, 5.1)}
      {/* bandana over nose and mouth */}
      {pa(p, 'M8.5 10.8 C10.4 11.6 14 11.4 15.9 10.2 C15.8 11.6 15.4 12.6 14.6 13.4 C13.8 14.2 12.8 14.5 11.8 14.3 C10.6 14.1 9.6 13 9 12 C8.7 11.6 8.5 11.2 8.5 10.8 Z', p.acc, 0.26)}
      {sd(p, 'M12 12.4 C13.4 12.4 14.8 11.8 15.9 10.2 C15.8 11.6 15.4 12.6 14.6 13.4 C13.8 14.2 12.8 14.5 11.8 14.3 C12.2 13.6 12.2 13 12 12.4 Z', 0.16)}
      <circle cx="10.5" cy="12" r="0.18" fill={p.accHi} />
      <circle cx="12" cy="12.8" r="0.18" fill={p.accHi} />
      <circle cx="13.5" cy="12" r="0.18" fill={p.accHi} />
      <circle cx="12.1" cy="11.6" r="0.18" fill={p.accHi} />
      {pa(p, 'M8.7 11.4 C7.6 11.2 6.8 11.6 6.4 12.4 C6.8 12.8 7.2 13.2 7.2 13.6 C7.8 13.2 8.4 12.8 8.9 12.4 Z', p.acc, 0.24)}
      {pa(p, 'M7.2 13.5 C6.5 14.2 5.9 14.9 5.7 15.6 C6.7 15.4 7.4 15.1 8 14.6 Z', p.accDeep, 0.2)}
      {/* feather */}
      {leaf(p, 8.9, 4.7, -42, 5.2, 0.8, p.acc, p.accHi)}
      {/* wide-brim hat with band + pushed-up goggles */}
      {pa(p, 'M8.4 6.2 C8.2 3.6 9.8 1.8 12.4 1.8 C15 1.8 16.6 3.6 16.2 6 C14.4 5.4 10.4 5.4 8.4 6.2 Z', p.body)}
      {st('M10.2 2.3 C11.4 3 13.4 3 14.8 2.3', p.edge, 0.18, 0.5)}
      {lt(p, 'M9.2 4.4 C9.4 3.2 10.4 2.4 11.6 2.2 C10.6 3 10 4 10 5.2 C9.6 5.2 9.3 4.9 9.2 4.4 Z', 0.5)}
      {pa(p, 'M8.5 4.7 C10.4 5.2 14.2 5.2 16.1 4.5 L16.2 5.9 C14.4 5.4 10.4 5.4 8.4 6.1 Z', p.acc, 0.24)}
      {pa(p, 'M3.4 7.8 C5.8 6.2 9.4 5.6 12.6 5.6 C16 5.6 19 6.2 20.8 7.8 C19 8.6 15.4 8.8 12 8.8 C8 8.8 5 8.6 3.4 7.8 Z', p.bodyShade)}
      {sd(p, 'M8.8 8.6 C10.4 8.9 14.2 8.9 16.2 8.5 C14.4 9.2 10.6 9.4 8.8 8.6 Z', 0.3)}
      {dot(p, 10.3, 3.9, 0.85, p.steel, 0.2)}
      <circle cx="10.3" cy="3.9" r="0.5" fill={p.accHi} />
      {dot(p, 13.7, 3.9, 0.85, p.steel, 0.2)}
      <circle cx="13.7" cy="3.9" r="0.5" fill={p.accHi} />
    </Tilt>
  </>
);

/* ---------------------------------------------------------------------------
 * 7. IRONCLAD WARDEN - closed great helm, cross visor, stacked pauldrons
 * ------------------------------------------------------------------------- */
const PAULD_A = 'M2.6 14.8 C3 12.8 5 11.8 8.4 12.2 L8.4 15.2 C5.6 15.2 3.8 15.5 2.6 14.8 Z';
const PAULD_B = 'M2.4 17.2 C2.4 16.3 2.8 15.6 3.4 15.2 C5.2 15.5 7 15.5 8.4 15.3 L8.4 17.5 C6 17.8 4 17.8 2.4 17.2 Z';
const PAULD_C = 'M2.6 19 C2.4 18.4 2.4 17.9 2.6 17.5 C4.2 18 6.2 18 8.4 17.6 L8.4 19 Z';
const drawWarden: Draw = (p) => {
  const Pauld = (
    <>
      {pa(p, PAULD_C, p.bodyShade)}
      {pa(p, PAULD_B, p.body)}
      {pa(p, PAULD_A, p.bodyHi)}
      {st('M3.2 13.8 C4.8 13.2 6.6 13.1 8.4 13.4', p.acc, 0.55)}
      {lt(p, 'M3.4 14 C4 13 5.2 12.5 6.4 12.4 C5.2 13 4.4 13.8 4.2 14.8 C3.8 14.7 3.5 14.4 3.4 14 Z', 0.5)}
      {dot(p, 4.4, 16.4, 0.22, p.steelHi, 0.08)}
      {dot(p, 4.4, 18.3, 0.22, p.steelHi, 0.08)}
    </>
  );
  return (
    <>
      {Pauld}
      <Mir>{Pauld}</Mir>
      {/* breastplate + emblem */}
      {pa(p, 'M7.6 19 C7.8 17 7.8 15.2 8.2 14 L15.8 14 C16.2 15.2 16.2 17 16.4 19 Z', p.body)}
      {sd(p, 'M12 14 L15.8 14 C16.2 15.2 16.2 17 16.4 19 L12 19 Z', 0.14)}
      {st('M12 14 L12 19', p.edge, 0.2)}
      {pa(p, 'M12 15.2 C13.2 15.6 13.8 16.4 13.6 17.4 C13.4 18.2 12.6 18.8 12 19 C11.4 18.8 10.6 18.2 10.4 17.4 C10.2 16.4 10.8 15.6 12 15.2 Z', p.acc, 0.2)}
      {/* gorget */}
      {pa(p, 'M8.2 12.8 C10.4 13.4 13.6 13.4 15.8 12.8 C16.4 13.2 16.6 13.6 16.6 14 C14 14.6 10 14.6 7.4 14 C7.4 13.6 7.6 13.2 8.2 12.8 Z', p.steel)}
      {/* closed great helm */}
      {pa(p, 'M7.6 5.2 C7.6 3.2 9.2 2.2 12 2.2 C14.8 2.2 16.4 3.2 16.4 5.2 L16.6 11 C16.6 12.6 15.4 13.4 12 13.4 C8.6 13.4 7.4 12.6 7.4 11 Z', p.body)}
      {lt(p, 'M7.8 5.4 C7.8 3.8 9 2.8 10.6 2.5 C9.6 3.4 9.2 5 9.2 7 L9.4 12.8 C8.4 12.4 7.6 11.8 7.6 11 Z', 0.55)}
      {sd(p, 'M14 2.4 C15.4 2.8 16.4 3.7 16.4 5.2 L16.6 11 C16.6 12.6 15.4 13.4 12 13.4 C14.2 12.6 14.4 6 14 2.4 Z', 0.2)}
      {pa(p, 'M10.4 2.6 C10.4 1.2 11.8 0.4 13.8 0.8 C13 1.2 12.8 1.8 13.4 2.5 Z', p.acc, 0.22)}
      {sd(p, 'M10.8 2.3 C11.6 2.5 12.4 2.5 13.2 2.3 L13.2 6 L10.8 6 Z', 0.18)}
      {/* cross-shaped visor */}
      {pa(p, 'M8.2 6.3 C10.6 5.8 13.4 5.8 15.8 6.3 L15.8 7.7 C14.6 7.5 13.6 7.6 12.8 7.6 L12.8 12.2 C12.4 12.3 11.6 12.3 11.2 12.2 L11.2 7.6 C10.4 7.6 9.4 7.5 8.2 7.7 Z', p.void, 0.25)}
      <circle cx="10.3" cy="6.95" r="0.55" fill={p.accHi} opacity="0.35" />
      <circle cx="10.3" cy="6.95" r="0.3" fill={p.accHi} />
      <circle cx="13.7" cy="6.95" r="0.55" fill={p.accHi} opacity="0.35" />
      <circle cx="13.7" cy="6.95" r="0.3" fill={p.accHi} />
      {/* breath holes + rivets */}
      {[9.3, 10.4, 11.5].map((y) => (
        <React.Fragment key={y}>
          <circle cx="9.8" cy={y} r="0.26" fill={p.void} />
          <circle cx="14.2" cy={y} r="0.26" fill={p.void} />
        </React.Fragment>
      ))}
      {dot(p, 8.7, 4.5, 0.24, p.steelHi, 0.08)}
      {dot(p, 15.3, 4.5, 0.24, p.steelHi, 0.08)}
      {dot(p, 8.7, 12, 0.24, p.steelHi, 0.08)}
      {dot(p, 15.3, 12, 0.24, p.steelHi, 0.08)}
    </>
  );
};

/* ---------------------------------------------------------------------------
 * 8. BLACK MONKEY - feather fan, single horn, raised brow, grin, trick card
 * ------------------------------------------------------------------------- */
const drawMonkey: Draw = (p) => (
  <>
    {/* curly tail */}
    {st('M7 19 C4 18 3 15.6 3.8 13.8 C4.4 12.6 6 12.6 6.5 13.8', p.edge, 1.7)}
    {st('M7 19 C4 18 3 15.6 3.8 13.8 C4.4 12.6 6 12.6 6.5 13.8', p.fur, 1.1)}
    {/* jacket body + feather collar */}
    {pa(p, 'M5.6 19 C5.8 16.8 6.8 14.8 9 13.8 C10.6 13.4 13.4 13.4 15 13.8 C17.2 14.8 18.2 16.8 18.4 19 Z', p.body)}
    {sd(p, 'M15 13.8 C17.2 14.8 18.2 16.8 18.4 19 L15.8 19 C16 17 15.8 15.2 15 13.8 Z', 0.14)}
    {pa(p, 'M7.6 14.4 C8 15.4 8.4 16 8.7 16.4 C9.2 15.8 9.6 15.2 9.8 14.8 C10.1 15.6 10.6 16.2 10.9 16.7 C11.3 16.1 11.7 15.6 12 15.2 C12.3 15.6 12.7 16.1 13.1 16.7 C13.4 16.2 13.9 15.6 14.2 14.8 C14.4 15.2 14.8 15.8 15.3 16.4 C15.6 16 16 15.4 16.4 14.4 C14.2 13.4 9.8 13.4 7.6 14.4 Z', p.acc, 0.22)}
    {/* trick card + raised hand */}
    <g transform="rotate(14 19.8 10.8)">
      {pa(p, 'M18.4 8.4 C19.4 8 20.4 8 21.2 8.4 L21.2 13 C20.4 13.4 19.4 13.4 18.4 13 Z', p.paper, 0.22)}
      {pa(p, 'M19.8 9.4 C20.3 10.1 20.4 10.6 19.8 11.4 C19.2 10.6 19.3 10.1 19.8 9.4 Z', p.acc, 0.14)}
    </g>
    {pa(p, 'M16 19 C16.2 16.8 16.8 15.2 18 14 C19 13.6 20 14 20.4 15 C20.6 16.4 20 17.8 19.6 19 Z', p.body)}
    {pa(p, 'M17.9 14.8 C17.7 13.6 18 12.8 18.7 12.5 C19.2 12.3 19.6 12.6 19.7 13.1 C20.2 12.7 20.9 12.9 21 13.5 C21.1 14.4 20.6 15.2 19.8 15.5 C19 15.7 18.3 15.4 17.9 14.8 Z', p.fur, 0.22)}
    <Tilt a={9} cx={12} cy={11}>
      {/* feather fan behind head */}
      {leaf(p, 8.2, 5.8, -62, 4.6, 0.95, p.acc, p.accHi)}
      {leaf(p, 9.7, 5.2, -30, 5, 0.95, p.steelHi)}
      {leaf(p, 14.3, 5.2, 30, 5, 0.95, p.steelHi)}
      {leaf(p, 15.8, 5.8, 62, 4.6, 0.95, p.acc, p.accHi)}
      {/* ears */}
      <ellipse cx="6.7" cy="9.4" rx="1.6" ry="1.9" fill={p.fur} stroke={p.edge} strokeWidth="0.3" />
      <ellipse cx="6.8" cy="9.5" rx="0.85" ry="1.15" fill={p.skinShade} />
      <ellipse cx="17.3" cy="9.4" rx="1.6" ry="1.9" fill={p.fur} stroke={p.edge} strokeWidth="0.3" />
      <ellipse cx="17.2" cy="9.5" rx="0.85" ry="1.15" fill={p.skinShade} />
      {/* head fur + heart-shaped face mask */}
      {pa(p, 'M7.8 8.4 C7.6 5.8 9.4 4.4 12 4.4 C14.6 4.4 16.4 5.8 16.2 8.4 C16.4 10.6 15.4 12.6 13.8 13.4 C13 13.8 11 13.8 10.2 13.4 C8.6 12.6 7.6 10.6 7.8 8.4 Z', p.fur)}
      {lt(p, 'M9 5.6 C9.8 4.9 10.8 4.6 11.8 4.5 C10.6 5 9.8 5.8 9.4 6.8 C9.1 6.5 9 6.1 9 5.6 Z', 0.35)}
      {pa(p, 'M12 8 C12.8 7 14 6.8 15 7.4 C15.8 8 15.6 9.4 15 10.6 C14.4 11.8 13.2 12.8 12 13.4 C10.8 12.8 9.6 11.8 9 10.6 C8.4 9.4 8.2 8 9 7.4 C10 6.8 11.2 7 12 8 Z', p.skin, 0.22)}
      {sd(p, 'M13.6 7.2 C14.8 7 15.8 7.6 15.6 8.8 C15.4 10.4 14.6 11.8 12 13.4 C13.6 11.6 14.2 9.4 13.6 7.2 Z', 0.14)}
      {/* sly eyes: one brow raised */}
      <g transform="translate(0.15 0.55)">{eyeStd(p, p.ink, 0.45)}</g>
      <g transform="translate(24.15 0.7) scale(-1 1)">{eyeStd(p, p.ink, 0.45)}</g>
      {st('M8.9 8.8 C9.5 8.5 10.7 8.6 11.4 9.1', p.ink, 0.4)}
      {st('M12.6 9.1 C13.3 8.6 14.5 8.5 15.1 8.9', p.ink, 0.4)}
      {pa(p, 'M8.6 7.5 C9.4 6.4 10.8 6.1 11.7 6.7 C10.7 6.6 9.4 7 8.6 7.5 Z', p.ink, 0.18)}
      {pa(p, 'M12.4 7.5 C13.2 7.9 14.6 8 15.5 8.5 C14.6 7.7 13.4 7.2 12.4 7.5 Z', p.ink, 0.18)}
      <ellipse cx="11.4" cy="10.7" rx="0.2" ry="0.25" fill={p.ink} />
      <ellipse cx="12.6" cy="10.7" rx="0.2" ry="0.25" fill={p.ink} />
      {/* wide grin with teeth */}
      {pa(p, 'M9.4 11.3 C10.4 12.6 13.6 12.6 14.6 11.3 C14.2 12.9 13.2 13.5 12 13.5 C10.8 13.5 9.8 12.9 9.4 11.3 Z', p.ink, 0.14)}
      {pa(p, 'M10 11.8 C11.2 12.3 12.8 12.3 14 11.8 C13.6 12.4 13 12.7 12 12.7 C11 12.7 10.4 12.4 10 11.8 Z', p.paper, 0.05)}
      {/* single horn */}
      {pa(p, 'M11 5.5 C11.2 4 11.5 2.8 12.3 1.4 C12.7 2.8 12.9 4.2 13.1 5.5 C12.4 5.2 11.7 5.2 11 5.5 Z', p.steel, 0.24)}
      {st('M11.7 4.8 C11.8 3.9 12 3.2 12.2 2.6', p.light, 0.16, 0.7)}
      {pa(p, 'M11.9 2.8 C12 2.3 12.2 1.9 12.3 1.4 C12.5 2 12.6 2.5 12.7 2.9 C12.4 2.7 12.1 2.7 11.9 2.8 Z', p.acc, 0.12)}
    </Tilt>
  </>
);

/* ---------------------------------------------------------------------------
 * 9. PARTY KING KONG - hooded gorilla brute, tusks, party cone hat, confetti
 * ------------------------------------------------------------------------- */
const KONG_CONE = 'M9.4 5.3 C10.8 3.6 12 1.8 13.2 0.3 C13.8 1.9 15 3.4 15.6 4.9 C13.4 5.7 11.4 5.7 9.4 5.3 Z';
const KONG_TUSK = 'M9.5 14.6 C9.5 13.6 9.8 12.9 10.2 12.5 C10.6 13 10.9 13.8 10.8 14.7 Z';
const drawKong: Draw = (p) => (
  <>
    <defs>
      <clipPath id={`${p.pid}-cone`}>
        <path d={KONG_CONE} />
      </clipPath>
    </defs>
    {/* huge hunched hoodie */}
    {pa(p, 'M1.6 19 C1.4 16 2.6 13.4 5.4 12 C7.2 11.4 8.6 12.2 9.6 13.4 L14.4 13.4 C15.4 12.2 16.8 11.4 18.6 12 C21.4 13.4 22.6 16 22.4 19 Z', p.body)}
    {sd(p, 'M18.6 12 C21.4 13.4 22.6 16 22.4 19 L19.4 19 C20 16.6 19.8 14 18.6 12 Z', 0.15)}
    {lt(p, 'M5.4 12 C6.8 11.5 8 11.9 9 12.8 C7.4 13 6 14 5.2 15.6 C4.4 14.4 4.6 13 5.4 12 Z', 0.4)}
    {/* knuckle-walking fists */}
    <ellipse cx="2.7" cy="17.6" rx="1.9" ry="1.6" fill={p.skin} stroke={p.edge} strokeWidth="0.3" />
    {st('M1.8 16.4 C2 17 2 17.5 1.9 18', p.edge, 0.16, 0.7)}
    {st('M2.8 16.1 C3 16.8 3 17.4 2.9 18.1', p.edge, 0.16, 0.7)}
    <Mir>
      <ellipse cx="2.7" cy="17.6" rx="1.9" ry="1.6" fill={p.skin} stroke={p.edge} strokeWidth="0.3" />
      {st('M1.8 16.4 C2 17 2 17.5 1.9 18', p.edge, 0.16, 0.7)}
      {st('M2.8 16.1 C3 16.8 3 17.4 2.9 18.1', p.edge, 0.16, 0.7)}
    </Mir>
    {/* hood */}
    {pa(p, 'M5.8 13 C4.8 9.2 5.8 6 8.4 4.6 C10 3.8 14 3.8 15.6 4.6 C18.2 6 19.2 9.2 18.2 13 C16.4 14.6 14.4 15.2 12 15.4 C9.6 15.2 7.6 14.6 5.8 13 Z', p.bodyShade)}
    {lt(p, 'M7.4 6.6 C8.2 5.4 9.4 4.8 10.8 4.6 C9.4 5.4 8.4 6.8 8.2 8.6 C7.6 8 7.3 7.4 7.4 6.6 Z', 0.4)}
    {/* gorilla face */}
    {pa(p, 'M7.6 9.2 C7.6 7 9.4 5.8 12 5.8 C14.6 5.8 16.4 7 16.4 9.2 C16.6 11.4 16.2 13.2 15.2 14.4 C14.4 15.2 13.2 15.6 12 15.6 C10.8 15.6 9.6 15.2 8.8 14.4 C7.8 13.2 7.4 11.4 7.6 9.2 Z', p.skin)}
    {sd(p, 'M14 6 C15.6 6.6 16.4 7.8 16.4 9.2 C16.6 11.4 16.2 13.2 15.2 14.4 C14.4 15.2 13.2 15.6 12 15.6 C14 13.6 14.8 9 14 6 Z', 0.16)}
    {pa(p, 'M7.8 8.7 C9 7.4 10.8 7.2 12 7.8 C13.2 7.2 15 7.4 16.2 8.7 C16.2 9.7 15.4 10.1 14.6 9.9 C13.6 9.5 13 9.7 12 9.7 C11 9.7 10.4 9.5 9.4 9.9 C8.6 10.1 7.8 9.7 7.8 8.7 Z', p.skinShade, 0.22)}
    {/* deep-set glowing eyes */}
    <ellipse cx="10.3" cy="10" rx="0.85" ry="0.5" fill={p.paper} stroke={p.edge} strokeWidth="0.16" />
    <circle cx="10.4" cy="10" r="0.36" fill={p.acc} />
    <circle cx="10.4" cy="10" r="0.16" fill={p.ink} />
    <ellipse cx="13.7" cy="10" rx="0.85" ry="0.5" fill={p.paper} stroke={p.edge} strokeWidth="0.16" />
    <circle cx="13.6" cy="10" r="0.36" fill={p.acc} />
    <circle cx="13.6" cy="10" r="0.16" fill={p.ink} />
    {/* broad flat nose */}
    {pa(p, 'M10.4 10.9 C10.8 10.4 13.2 10.4 13.6 10.9 C14.2 11.6 14.2 12.4 13.4 12.8 C12.8 13.1 11.2 13.1 10.6 12.8 C9.8 12.4 9.8 11.6 10.4 10.9 Z', p.skinShade, 0.2)}
    <ellipse cx="11.1" cy="11.9" rx="0.42" ry="0.3" fill={p.ink} />
    <ellipse cx="12.9" cy="11.9" rx="0.42" ry="0.3" fill={p.ink} />
    {/* roaring jaw with tusks */}
    {pa(p, 'M8.8 13.4 C10 13 14 13 15.2 13.4 C15 14.6 14 15.3 12 15.5 C10 15.3 9 14.6 8.8 13.4 Z', p.ink, 0.16)}
    {pa(p, KONG_TUSK, p.paper, 0.16)}
    <Mir>{pa(p, KONG_TUSK, p.paper, 0.16)}</Mir>
    {/* hoodie strings */}
    {st('M9.6 15.2 C9.2 16.4 9.4 17.2 9.5 17.8', p.acc, 0.42)}
    {st('M14.4 15.2 C14.8 16.4 14.6 17.2 14.5 17.8', p.acc, 0.42)}
    {dot(p, 9.5, 18, 0.42, p.accHi, 0.12)}
    {dot(p, 14.5, 18, 0.42, p.accHi, 0.12)}
    {/* party cone hat */}
    {pa(p, KONG_CONE, p.acc, 0.26)}
    <g clipPath={`url(#${p.pid}-cone)`}>
      <path d="M8.8 3.9 C10.8 4.6 13.8 4.6 16.2 3.6 L16.2 2.7 C13.8 3.7 10.8 3.7 8.8 3 Z" fill={p.paper} />
      <path d="M10.6 2.2 C12 2.7 13.8 2.7 15 2.1 L15 1.4 C13.8 2 12 2 10.6 1.5 Z" fill={p.paper} />
    </g>
    {sd(p, 'M13.6 2 C14.4 3.2 15.2 4.2 15.6 4.9 C14.4 5.4 13.2 5.6 12.2 5.6 C13.4 4.6 13.8 3.4 13.6 2 Z', 0.16)}
    {dot(p, 13.2, 0.55, 0.75, p.accHi, 0.2)}
    {/* confetti */}
    <circle cx="7.4" cy="2.4" r="0.45" fill={p.acc} />
    <circle cx="18.6" cy="2" r="0.4" fill={p.accHi} />
    <circle cx="21" cy="8" r="0.4" fill={p.accHi} />
    <circle cx="3.2" cy="9.4" r="0.4" fill={p.acc} />
    <ellipse cx="5.4" cy="5.8" rx="0.55" ry="0.28" fill={p.steelHi} transform="rotate(30 5.4 5.8)" />
    <ellipse cx="19.4" cy="5.8" rx="0.55" ry="0.28" fill={p.acc} transform="rotate(-20 19.4 5.8)" />
  </>
);

const DRAW: Record<HeroPieceType, Draw> = {
  mugenKing: drawKing,
  shrinePriest: drawPriest,
  methanogenic: drawMethanogenic,
  englland: drawEnglland,
  ajx: drawAjx,
  yjkstra: drawYjkstra,
  ironcladWarden: drawWarden,
  blackMonkey: drawMonkey,
  partyKingKong: drawKong,
};

/** Shared gradient definitions for one team colour. */
const HeroDefs: React.FC<{ color: 'white' | 'black' }> = ({ color }) => (
  <defs>
    {GRAD_NAMES.map((n) => (
      <linearGradient key={n} id={`hp-${color}-${n}`} x1="0" y1="0" x2="0.55" y2="1">
        <stop offset="0" stopColor={GRADS[color][n][0]} />
        <stop offset="1" stopColor={GRADS[color][n][1]} />
      </linearGradient>
    ))}
  </defs>
);

/** Team base: chevron (white side, blue trim) or rounded shield (black side, red trim). */
const renderBase = (isWhite: boolean) =>
  isWhite ? (
    <>
      <path
        d="M2.4 22.6 L21.6 22.6 L21.6 20.6 C17.6 19.4 14.4 18.5 12 17.8 C9.6 18.5 6.4 19.4 2.4 20.6 Z"
        fill="url(#hp-white-body)"
        stroke="#1b2747"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
      <path d="M2.9 20.9 C6.6 19.8 9.6 18.9 12 18.3 C14.4 18.9 17.4 19.8 21.1 20.9" fill="none" stroke="#2563eb" strokeWidth="0.5" strokeLinecap="round" />
      <path d="M5 22 H19" fill="none" stroke="#1b2747" strokeWidth="0.3" strokeLinecap="round" />
    </>
  ) : (
    <>
      <path
        d="M3.4 19 H20.6 V20.4 C20.6 22.2 16.6 23.2 12 23.2 C7.4 23.2 3.4 22.2 3.4 20.4 Z"
        fill="#090d16"
        stroke="rgba(241, 245, 249, 0.75)"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
      <path d="M4.6 20.5 C7.4 21.6 16.6 21.6 19.4 20.5" fill="none" stroke="#d3142b" strokeWidth="0.5" strokeLinecap="round" />
    </>
  );

/** Bare artwork for one hero (a <g>), safe to nest inside any 24x24 <svg>. */
export const HeroArt: React.FC<{ type: HeroPieceType; color: PieceColor }> = ({ type, color }) => {
  const isWhite = color === 'white';
  const draw = DRAW[type];
  if (!draw) return null;
  const c = isWhite ? 'white' : 'black';
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <HeroDefs color={c} />
      {renderBase(isWhite)}
      {draw(PAL[c])}
    </g>
  );
};

export const HeroPiece: React.FC<HeroPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'white';
  return (
    <svg
      viewBox="0 0 24 24"
      strokeLinejoin="round"
      strokeLinecap="round"
      overflow="visible"
      style={
        !isWhite
          ? { filter: 'drop-shadow(0px 1.5px 3px rgba(0, 0, 0, 0.6))' }
          : { filter: 'drop-shadow(0px 1.5px 3px rgba(0, 0, 0, 0.35))' }
      }
      className={`${className} select-none pointer-events-none transition-transform duration-150`}
    >
      <HeroArt type={type} color={color} />
    </svg>
  );
};

/**
 * ============================================================================
 * UNIFIED VERIFICATION SHEET - one <svg> with every hero
 * ============================================================================
 * Row 1: white set, Row 2: black set, Row 3: both colours at in-game size.
 * Drop <HeroPieceSheet /> on any page (or render it to a string and save it
 * as .svg) to eyeball every hero at once.
 */
export const HeroPieceSheet: React.FC<{ className?: string }> = ({ className }) => {
  const COLS = HERO_TYPES.length;
  const CELL = 104;
  const PAD = 16;
  const W = PAD * 2 + COLS * CELL;
  const splitName = (name: string): string[] => {
    if (name.length <= 14 || !name.includes(' ')) return [name];
    const words = name.split(' ');
    let best = 1;
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    }
    return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
  };
  const rowA = 40;
  const rowB = rowA + 104;
  const labelY = rowB + 96 + 14;
  const rowC = labelY + 40;
  const H = rowC + 44 + 18;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className={className}
      fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
    >
      <rect width={W} height={H} fill="#0f1626" />
      <text x={PAD} y="24" fontSize="13" fontWeight="600" fill="#e8edf5">
        Hero pieces - white / black / in-game size
      </text>
      {HERO_TYPES.map((type, i) => {
        const x = PAD + i * CELL;
        const lines = splitName(HERO_INFO[type].name);
        return (
          <g key={type}>
            <rect x={x + 2} y={rowA} width="96" height="96" rx="8" fill="#c9d4e6" />
            <svg x={x + 6} y={rowA + 4} width="88" height="88" viewBox="0 0 24 24" overflow="visible">
              <HeroArt type={type} color="white" />
            </svg>
            <rect x={x + 2} y={rowB} width="96" height="96" rx="8" fill="#56657f" />
            <svg x={x + 6} y={rowB + 4} width="88" height="88" viewBox="0 0 24 24" overflow="visible">
              <HeroArt type={type} color="black" />
            </svg>
            {lines.map((ln2, li) => (
              <text key={li} x={x + 50} y={labelY + li * 10} fontSize="9" fontWeight="600" fill="#e8edf5" textAnchor="middle">
                {ln2}
              </text>
            ))}
            <text x={x + 50} y={labelY + 10 * lines.length + 1} fontSize="7.5" fill="#9aa8c2" textAnchor="middle">
              {HERO_INFO[type].title}
            </text>
            <rect x={x + 2} y={rowC} width="46" height="44" rx="6" fill="#c9d4e6" />
            <svg x={x + 4} y={rowC + 2} width="42" height="40" viewBox="0 0 24 24" overflow="visible">
              <HeroArt type={type} color="white" />
            </svg>
            <rect x={x + 52} y={rowC} width="46" height="44" rx="6" fill="#56657f" />
            <svg x={x + 54} y={rowC + 2} width="42" height="40" viewBox="0 0 24 24" overflow="visible">
              <HeroArt type={type} color="black" />
            </svg>
          </g>
        );
      })}
    </svg>
  );
};