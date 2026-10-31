import React from 'react';
import { PieceColor } from '../types/game';

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
 * HERO PIECES - close-up character busts
 * ============================================================================
 * Every hero is a hand-built, faceted (angular polygon) bust in a 24x24 box
 * with the head taking roughly half of the height, so the FACE is what you
 * read first. Feet / base line sits on y = 19.
 *
 *   mugenKing       front, chin up    - horned + spiked-crown barbarian king, braided beard, scar, scepter
 *   shrinePriest    head tilted       - tall hat + talisman, long dark hair, FOUR slit eyes, curse marks, 2-finger seal
 *   methanogenic    side PROFILE      - plague-doctor beak mask, round goggle lens, gas tank, pod bandolier
 *   englland        front, square     - peaked cap + star, square stubbled jaw, epaulettes, battle standard
 *   ajx             tilted + ghosted  - deep hood, glowing slit eyes, vented mask, crossed blades, glowing core
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
 * No gradients / ids / filters inside the art, so any number of pieces can
 * share one page or one <svg>.
 *
 * Exports: HeroPiece (drop-in, same props as before), HeroArt (bare <g> for
 * embedding inside your own <svg>), HeroPieceSheet (one unified SVG with
 * every hero in both colours, for visual verification).
 */
interface Palette {
  edge: string; // outline of every shape
  ink: string; // facial detail ink (brows, pupils, mouths)
  body: string; // main clothing / armour colour (the "team" colour)
  bodyShade: string;
  bodyHi: string;
  skin: string;
  skinShade: string;
  hair: string; // light hair (king)
  hairDark: string; // dark hair (priest)
  fur: string; // monkey fur
  steel: string;
  steelHi: string;
  acc: string; // minority accent: blue (white team) / red (black team)
  accHi: string;
  accDeep: string;
  void: string; // dark hollow (hood interior, visor slits)
  paper: string; // eye whites, teeth, talisman, card
}

const WHITE: Palette = {
  edge: '#1b2747',
  ink: '#1b2747',
  body: '#f7f9fc',
  bodyShade: '#d3dbe9',
  bodyHi: '#ffffff',
  skin: '#ecf0f7',
  skinShade: '#c3cee1',
  hair: '#cdd6e6',
  hairDark: '#33437a',
  fur: '#9aa9c8',
  steel: '#a9b7d0',
  steelHi: '#e6edf8',
  acc: '#2563eb',
  accHi: '#8cb8ff',
  accDeep: '#1e3a8a',
  void: '#1b2747',
  paper: '#ffffff',
};

const BLACK: Palette = {
  edge: '#8e99b0',
  ink: '#04060a',
  body: '#161a23',
  bodyShade: '#0a0c11',
  bodyHi: '#2a3140',
  skin: '#556078',
  skinShade: '#394155',
  hair: '#0c0e14',
  hairDark: '#07080c',
  fur: '#0b0d12',
  steel: '#6b7589',
  steelHi: '#a7b1c5',
  acc: '#d3142b',
  accHi: '#ff6b7c',
  accDeep: '#7d0c1a',
  void: '#020305',
  paper: '#d3dae6',
};

type Draw = (p: Palette) => React.ReactNode;

/** Faceted polygon with the team outline. */
const pg = (p: Palette, pts: string, fill: string, w = 0.3, opacity?: number) => (
  <polygon points={pts} fill={fill} stroke={p.edge} strokeWidth={w} strokeLinejoin="round" opacity={opacity} />
);
/** Open stroke line. */
const ln = (pts: string, stroke: string, w = 0.3) => (
  <polyline points={pts} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
);
/** Round dot / pupil / rivet. */
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

/* ---------------------------------------------------------------------------
 * 1. MUGEN KING - barbarian king: horned, spiked iron crown, braided beard
 * ------------------------------------------------------------------------- */
const HORN = '8.9,6.2 6.7,6 5.2,4.4 4.8,2.2 6.5,3.2 8.2,4.6';
const KING_EYE = '9,8.6 10.9,8.9 10.7,9.8 9.3,9.7';
const drawKing: Draw = (p) => (
  <>
    {/* scepter */}
    <line x1="21.2" y1="6.4" x2="21.2" y2="19" stroke={p.edge} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="21.2" y1="6.4" x2="21.2" y2="19" stroke={p.steel} strokeWidth="0.8" strokeLinecap="round" />
    {pg(p, '21.2,2.4 22.6,4.4 21.2,6.4 19.8,4.4', p.acc)}
    {pg(p, '19.7,6.6 22.7,6.6 21.2,7.8', p.steelHi)}
    {/* horns */}
    {pg(p, HORN, p.steelHi)}
    <Mir>{pg(p, HORN, p.steelHi)}</Mir>
    {/* wild mane */}
    {pg(
      p,
      '6.6,12.6 5.6,8.8 6.6,9.2 6,6 7.4,6.8 7.4,4 9,5.4 10,3.4 12,4.8 14,3.4 15,5.4 16.6,4 16.6,6.8 18,6 17.4,9.2 18.4,8.8 17.4,12.6',
      p.hair,
    )}
    {/* neck */}
    {pg(p, '10.2,11 13.8,11 14.2,14.6 9.8,14.6', p.skinShade)}
    {/* fur mantle with jagged collar */}
    {pg(
      p,
      '3,19 3.4,15.2 4.6,15.9 5,13.9 6.2,14.7 6.8,12.9 8.4,14 12,14.6 15.6,14 17.2,12.9 17.8,14.7 19,13.9 19.4,15.9 20.6,15.2 21,19',
      p.bodyShade,
    )}
    {/* tunic + banner stripe */}
    {pg(p, '7.6,19 8.6,14.2 12,15.4 15.4,14.2 16.4,19', p.body)}
    {pg(p, '11.2,15.6 12.8,15.6 13,19 11,19', p.acc, 0.2)}
    {/* tooth necklace */}
    {ln('8.6,14.4 12,15.4 15.4,14.4', p.edge, 0.25)}
    {pg(p, '8.5,14.5 9.5,14.8 8.9,16.2', p.paper, 0.2)}
    {pg(p, '10,14.9 11,15.2 10.4,16.8', p.paper, 0.2)}
    {pg(p, '11.4,15.3 12.6,15.3 12,17.3', p.paper, 0.2)}
    {pg(p, '13,15.2 14,14.9 13.6,16.8', p.paper, 0.2)}
    {pg(p, '14.5,14.8 15.5,14.5 15.1,16.2', p.paper, 0.2)}
    {/* face */}
    {pg(p, '8.2,5.4 9.6,4.4 14.4,4.4 15.8,5.4 16.1,8.8 15.2,10.8 13.8,12.1 10.2,12.1 8.8,10.8 7.9,8.8', p.skin)}
    {pg(p, '11.2,8.2 12.8,8.2 13.2,10.4 12,10.9 10.8,10.4', p.skinShade, 0.2)}
    {/* eyes: heavy brow, team-colour pupils */}
    {pg(p, KING_EYE, p.paper, 0.2)}
    {dot(p, 10.2, 9.3, 0.4, p.acc, 0.1)}
    <Mir>
      {pg(p, KING_EYE, p.paper, 0.2)}
      {dot(p, 10.2, 9.3, 0.4, p.acc, 0.1)}
    </Mir>
    {pg(p, '8.3,7.2 11.3,8.2 11.2,8.9 8.6,8.1', p.ink, 0.1)}
    <Mir>{pg(p, '8.3,7.2 11.3,8.2 11.2,8.9 8.6,8.1', p.ink, 0.1)}</Mir>
    {/* glowing battle scar */}
    {ln('13.4,6.2 14.9,10.6', p.acc, 0.45)}
    {ln('13.1,7.4 14.5,7', p.acc, 0.25)}
    {ln('13.8,9 15.2,8.6', p.acc, 0.25)}
    {/* braided beard */}
    {pg(
      p,
      '7.8,8.6 8.6,10.6 8,13 9.4,15.8 10.6,14 12,16.8 13.4,14 14.6,15.8 16,13 15.4,10.6 16.2,8.6 15,10.2 12,11.4 9,10.2',
      p.hair,
    )}
    {ln('10,12.8 10.6,14.4', p.edge, 0.2)}
    {ln('14,12.8 13.4,14.4', p.edge, 0.2)}
    {ln('8.9,12 9.6,14.4', p.edge, 0.2)}
    {ln('15.1,12 14.4,14.4', p.edge, 0.2)}
    {dot(p, 9.4, 15.2, 0.4, p.acc, 0.15)}
    {dot(p, 14.6, 15.2, 0.4, p.acc, 0.15)}
    {/* moustache + roaring mouth */}
    {pg(p, '9.2,10.8 11.2,10.2 12,10.9 12.8,10.2 14.8,10.8 13.6,12 12,11.5 10.4,12', p.hair, 0.25)}
    {pg(p, '10.8,12.2 13.2,12.2 12.7,13.4 11.3,13.4', p.ink, 0.15)}
    {pg(p, '11.2,12.2 12.8,12.2 12.6,12.7 11.4,12.7', p.paper, 0.1)}
    {/* spiked iron crown */}
    {pg(p, '8.2,6.1 8.4,4.7 15.6,4.7 15.8,6.1', p.steel)}
    {pg(p, '8.4,4.7 8.8,2.4 9.7,4.7', p.steelHi, 0.25)}
    {pg(p, '9.9,4.7 10.6,2.6 11.4,4.7', p.steelHi, 0.25)}
    {pg(p, '11.2,4.7 12,1.2 12.8,4.7', p.steelHi, 0.25)}
    {pg(p, '12.6,4.7 13.4,2.6 14.1,4.7', p.steelHi, 0.25)}
    {pg(p, '14.3,4.7 15.2,2.4 15.6,4.7', p.steelHi, 0.25)}
    {pg(p, '12,4.7 12.7,5.4 12,6.1 11.3,5.4', p.acc, 0.2)}
  </>
);

/* ---------------------------------------------------------------------------
 * 2. SHRINE PRIEST - tall hat, long dark hair, four slit eyes, curse marks
 * ------------------------------------------------------------------------- */
const PRIEST_EYE_UP = '9.1,8.2 11.3,8.9 11,9.5 9.3,9';
const PRIEST_EYE_LO = '9.5,10 11.1,10.3 10.9,10.8 9.7,10.6';
const drawPriest: Draw = (p) => (
  <>
    {/* robe */}
    {pg(p, '4.6,19 5.6,15 8.8,13.2 12,15 15.2,13.2 18.4,15 19.4,19', p.body)}
    {pg(p, '8.8,13.2 12,17.4 15.2,13.2 14,13 12,15.4 10,13', p.bodyShade, 0.2)}
    {ln('8.8,13.5 12,17.2 15.2,13.5', p.acc, 0.55)}
    {/* sleeve + two-finger curse seal */}
    {pg(p, '15.8,19 16.6,15.2 18.6,13.8 19.8,15 19,19', p.body)}
    {pg(p, '17.4,14.2 17.5,10.8 18.4,10.8 18.5,14.2', p.skin, 0.2)}
    {pg(p, '18.6,14.2 19.1,11.4 19.9,11.6 19.7,14.4', p.skin, 0.2)}
    {dot(p, 18.4, 10.2, 0.55, p.acc, 0.12)}
    {dot(p, 19.6, 10.7, 0.4, p.accHi, 0.1)}
    {/* long dark hair curtains */}
    {pg(p, '7.8,6.6 7.2,12 6,17.6 8.8,14.8 9.2,9', p.hairDark)}
    <Mir>{pg(p, '7.8,6.6 7.2,12 6,17.6 8.8,14.8 9.2,9', p.hairDark)}</Mir>
    {/* scarf with trailing tail */}
    {pg(p, '8.4,13.2 15.6,13.2 16.6,15.4 12,16.6 7.4,15.4', p.acc, 0.25)}
    {pg(p, '8,14.8 6.4,19 8.6,17.8 9.8,19.2 10.2,16.2', p.acc, 0.25)}
    <Tilt a={-5} cx={12} cy={10}>
      {/* narrow, pointed face */}
      {pg(p, '9,7.2 15,7.2 15.2,9.8 13.8,12.8 12,14 10.2,12.8 8.8,9.8', p.skin)}
      {/* four glowing eyes */}
      {pg(p, PRIEST_EYE_UP, p.acc, 0.2)}
      {pg(p, PRIEST_EYE_LO, p.acc, 0.18)}
      <Mir>
        {pg(p, PRIEST_EYE_UP, p.acc, 0.2)}
        {pg(p, PRIEST_EYE_LO, p.acc, 0.18)}
      </Mir>
      {/* curse marks */}
      {ln('8.9,11.1 10.3,11.7', p.ink, 0.28)}
      {ln('8.9,11.8 10,12.3', p.ink, 0.28)}
      {ln('15.1,11.1 13.7,11.7', p.ink, 0.28)}
      {ln('15.1,11.8 14,12.3', p.ink, 0.28)}
      {ln('12,7.5 12,9', p.ink, 0.28)}
      {ln('12,12.8 12,13.6', p.ink, 0.28)}
      {ln('10.8,12.1 12,12.5 13.2,12.1', p.ink, 0.25)}
      {/* tall pointed hat */}
      {pg(p, '9,5.8 10.6,3.4 12.8,0.2 13.6,2.6 15,5.8', p.body)}
      {pg(p, '6.2,6.8 9,5.5 15,5.5 17.8,6.8 15,7.4 9,7.4', p.bodyShade)}
      {pg(p, '9.3,4.5 14.8,4.5 15,5.6 9,5.6', p.acc, 0.25)}
      {/* hanging talisman */}
      {pg(p, '14.8,7.2 16.2,7 16,10.2 15.2,10.6 14.8,10', p.paper, 0.2)}
      {ln('15.2,8 15.8,8', p.acc, 0.25)}
      {ln('15.2,8.8 15.8,8.8', p.acc, 0.25)}
      {ln('15.4,9.5 15.7,9.5', p.acc, 0.25)}
    </Tilt>
  </>
);

/* ---------------------------------------------------------------------------
 * 3. METHANOGENIC - side profile plague doctor with long beak + goggle lens
 * ------------------------------------------------------------------------- */
const drawMethanogenic: Draw = (p) => (
  <>
    {/* gas tank on the back */}
    {pg(p, '16.2,10.6 19,10.6 19.2,15.8 16,15.8', p.steel)}
    {ln('16.1,12.2 19.1,12.2', p.acc, 0.5)}
    {ln('16.1,14 19.1,14', p.acc, 0.5)}
    {/* coat + high collar */}
    {pg(p, '6.6,19 7.4,15.4 10.2,13.6 14,12.8 17.4,13.6 19.4,19', p.body)}
    {pg(p, '9.6,13.4 10.4,11.6 15.6,11.2 17.6,13.2 14,14.2', p.bodyShade)}
    {/* hose from mask to tank */}
    {ln('11.8,11.8 12.6,13.4 15,13.8 16.2,12.6', p.edge, 1)}
    {ln('11.8,11.8 12.6,13.4 15,13.8 16.2,12.6', p.steel, 0.5)}
    {/* pod bandolier */}
    {pg(p, '7.4,14.6 8.8,13.8 19.2,18.4 18,19', p.accDeep, 0.25)}
    {pg(p, '9.4,14.8 10.6,14.4 11.4,15.4 10.8,16.4 9.6,16.4 9,15.4', p.accHi, 0.22)}
    {pg(p, '12,15.9 13.2,15.5 14,16.5 13.4,17.5 12.2,17.5 11.6,16.5', p.accHi, 0.22)}
    {pg(p, '14.6,17 15.8,16.6 16.6,17.6 16,18.6 14.8,18.6 14.2,17.6', p.accHi, 0.22)}
    {/* hooded head */}
    {pg(p, '10,7 13.6,5.6 17,7 18,11 16.8,13.4 11.4,13.4 10.2,11', p.body)}
    {/* long beak */}
    {pg(p, '11.6,7.6 2.4,12.8 11.6,10.6', p.bodyHi)}
    {pg(p, '11.6,10.6 2.4,12.8 7.4,13.3 11.8,12.6', p.bodyShade)}
    {ln('11.6,7.8 2.6,12.7', p.edge, 0.25)}
    {dot(p, 8.8, 11.9, 0.22, p.ink, 0.05)}
    {dot(p, 7.6, 12.3, 0.22, p.ink, 0.05)}
    {dot(p, 6.4, 12.6, 0.22, p.ink, 0.05)}
    {/* escaping gas */}
    {dot(p, 1.8, 11.2, 0.5, p.accHi, 0.12)}
    {dot(p, 1.3, 9.6, 0.32, p.accHi, 0.1)}
    {dot(p, 2.7, 9.8, 0.26, p.acc, 0.1)}
    {/* round goggle lens */}
    {pg(p, '9.1,8.3 10.2,7.1 11.8,7.1 12.9,8.3 12.9,10.1 11.8,11.3 10.2,11.3 9.1,10.1', p.steel, 0.3)}
    {pg(p, '9.7,8.6 10.4,7.8 11.6,7.8 12.3,8.6 12.3,9.9 11.6,10.7 10.4,10.7 9.7,9.9', p.accHi, 0.15)}
    {dot(p, 10.9, 9.3, 0.45, p.ink, 0.05)}
    {ln('10.1,8.5 10.7,8.1', '#ffffff', 0.25)}
    {/* wide-brim doctor hat */}
    {pg(p, '9.8,6.4 10.4,2.8 15.2,2.2 16.6,6.2', p.body)}
    {pg(p, '6.4,7 9.6,5.8 16.8,5.4 20,7 16,8 9,8.2', p.bodyShade)}
    {pg(p, '9.9,5 16.4,4.6 16.6,5.9 9.8,6.2', p.acc, 0.25)}
  </>
);

/* ---------------------------------------------------------------------------
 * 4. CAPTAIN ENGLLAND - peaked cap, square stubbled jaw, standard bearer
 * ------------------------------------------------------------------------- */
const ENG_EYE = '9,9.3 11.2,9.3 11.1,10.3 9.3,10.3';
const drawEnglland: Draw = (p) => (
  <>
    {/* battle standard */}
    <line x1="21.4" y1="1.4" x2="21.4" y2="19" stroke={p.edge} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="21.4" y1="1.4" x2="21.4" y2="19" stroke={p.steel} strokeWidth="0.6" strokeLinecap="round" />
    {pg(p, '21.7,1.6 23.8,2.4 22.8,3.8 23.8,5.2 21.7,6', p.acc, 0.25)}
    {dot(p, 21.4, 1, 0.6, p.steelHi, 0.2)}
    {/* neck */}
    {pg(p, '10.2,13.6 13.8,13.6 13.8,14.8 12,15.8 10.2,14.8', p.skinShade)}
    {/* broad jacket */}
    {pg(p, '3.2,19 3.6,15.6 7.4,13.8 10.2,14 12,15.6 13.8,14 16.6,13.8 20.4,15.6 20.8,19', p.body)}
    {pg(p, '9.4,14 12,18.2 14.6,14 13.8,14 12,16.6 10.2,14', p.bodyShade, 0.2)}
    {pg(p, '11.4,15.8 12.6,15.8 12.9,18 12,19 11.1,18', p.acc, 0.2)}
    {/* epaulettes + medals */}
    {pg(p, '3.4,15.8 3.6,14.8 7.6,13.6 8,14.8 4,16.4', p.steel, 0.25)}
    <Mir>{pg(p, '3.4,15.8 3.6,14.8 7.6,13.6 8,14.8 4,16.4', p.steel, 0.25)}</Mir>
    {pg(p, '5.6,16.9 6.6,16.9 6.6,18.4 5.6,18.4', p.acc, 0.15)}
    {pg(p, '6.8,16.9 7.8,16.9 7.8,18.4 6.8,18.4', p.steelHi, 0.15)}
    {/* square jaw face + ears */}
    {pg(p, '7.4,8.2 6.4,8.8 6.4,10.6 7.6,10.8', p.skinShade, 0.2)}
    <Mir>{pg(p, '7.4,8.2 6.4,8.8 6.4,10.6 7.6,10.8', p.skinShade, 0.2)}</Mir>
    {pg(p, '7.8,6.6 16.2,6.6 16.6,10.6 15.4,12.8 13.8,14 10.2,14 8.6,12.8 7.4,10.6', p.skin)}
    {pg(p, '11.3,9.6 12.7,9.6 13,11.6 12,12 11,11.6', p.skinShade, 0.2)}
    {/* stern eyes */}
    {pg(p, ENG_EYE, p.paper, 0.15)}
    {dot(p, 10.2, 9.8, 0.4, p.ink, 0.05)}
    <Mir>
      {pg(p, ENG_EYE, p.paper, 0.15)}
      {dot(p, 10.2, 9.8, 0.4, p.ink, 0.05)}
    </Mir>
    {pg(p, '8.6,8.5 11.6,8.4 11.6,9 8.8,9.1', p.ink, 0.1)}
    <Mir>{pg(p, '8.6,8.5 11.6,8.4 11.6,9 8.8,9.1', p.ink, 0.1)}</Mir>
    {ln('10.4,12.9 13.6,12.9', p.ink, 0.35)}
    {ln('12,13.5 12,14', p.ink, 0.2)}
    {/* stubble */}
    {[
      [9.2, 12], [9.8, 12.8], [10.4, 13.4], [14.8, 12], [14.2, 12.8], [13.6, 13.4], [8.6, 11.2], [15.4, 11.2],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="0.14" fill={p.ink} opacity="0.55" />
    ))}
    {/* peaked cap */}
    {pg(p, '7.4,6.6 8.2,3.8 12,2.6 15.8,3.8 16.6,6.6', p.body)}
    {pg(p, '7.4,5.4 16.6,5.4 16.7,6.7 7.3,6.7', p.acc, 0.25)}
    {pg(p, '6.8,6.8 17.2,6.8 18,8 6,8', p.bodyShade)}
    {pg(
      p,
      '12,3.5 12.35,4.35 13.25,4.4 12.55,4.95 12.8,5.8 12,5.3 11.2,5.8 11.45,4.95 10.75,4.4 11.65,4.35',
      p.steelHi,
      0.15,
    )}
  </>
);

/* ---------------------------------------------------------------------------
 * 5. AJX - hooded phase assassin: ghosted, glowing slit eyes, crossed blades
 * ------------------------------------------------------------------------- */
const AJX_HOOD = '8,5.4 10,2.6 12.4,1.4 15.8,2.2 17.6,4.6 20.8,3.4 18.2,8.6 16.4,12.6 13,13.6 10.2,13 8.2,10';
const drawAjx: Draw = (p) => (
  <Tilt a={-7} cx={12} cy={12}>
    {/* trailing scarf */}
    {pg(p, '13,13 16,12.6 20.6,14 22.6,12.4 21,15.8 17,15.2 14,14.6', p.acc, 0.25)}
    {/* spindly torso + sharp shoulders */}
    {pg(p, '9.2,13.6 14.8,13.6 16.2,19 7.8,19', p.body)}
    {pg(p, '5.8,15.8 9.2,13.2 12,14.2 14.8,13.2 18.2,15.8 15.6,15.4 14.2,14.8 9.8,14.8 8.4,15.4', p.bodyShade)}
    {/* crossed blades */}
    {pg(p, '6.4,18.6 14.4,13.8 15.2,14.6 7.4,19.2', p.steelHi, 0.25)}
    <Mir>{pg(p, '6.4,18.6 14.4,13.8 15.2,14.6 7.4,19.2', p.steelHi, 0.25)}</Mir>
    {/* glowing core */}
    <circle cx="12" cy="16" r="2.1" fill="none" stroke={p.acc} strokeWidth="0.25" opacity="0.7" />
    {dot(p, 12, 16, 1.4, p.accHi, 0.25)}
    <circle cx="12" cy="16" r="0.6" fill="#ffffff" />
    {/* phase ghost (offset copy) */}
    <g transform="translate(-1.5 0.6)" opacity="0.4">
      {pg(p, AJX_HOOD, p.acc, 0.2)}
    </g>
    {/* hood + void */}
    {pg(p, AJX_HOOD, p.body)}
    {pg(p, '9.4,6 12,4.8 14.8,5.6 15.6,9 14.2,12 12,12.8 10.2,11.8 9.2,9', p.void, 0.2)}
    {/* glowing slit eyes (one bigger: phase glitch) */}
    {pg(p, '9.2,7.4 12.2,8.4 11.8,9.6 9.5,9', p.accHi, 0.08, 0.35)}
    {pg(p, '9.6,7.8 11.8,8.4 11.4,9 9.8,8.6', p.accHi, 0.1)}
    {pg(p, '12.6,8.2 15.2,7.2 15.4,8.6 12.9,9.2', p.accHi, 0.08, 0.35)}
    {pg(p, '12.9,8.4 15,7.7 15.1,8.4 13.1,9', p.accHi, 0.1)}
    {pg(p, '12.4,5.2 12.9,5.9 12.4,6.6 11.9,5.9', p.acc, 0.15)}
    {/* vented mask */}
    {pg(p, '10,10.2 14.8,10 14.4,12.2 12.2,13 10.4,12', p.steel, 0.25)}
    {ln('11,10.5 11,12', p.ink, 0.22)}
    {ln('12,10.4 12,12.6', p.ink, 0.22)}
    {ln('13,10.4 13,12.2', p.ink, 0.22)}
  </Tilt>
);

/* ---------------------------------------------------------------------------
 * 6. YJKSTRA - wide-brim hat + feather, bandana, goggles, compass, kite cloak
 * ------------------------------------------------------------------------- */
const drawYjkstra: Draw = (p) => (
  <>
    {/* kite-shaped cloak */}
    {pg(p, '12,12.8 19,15.8 12,19.8 5,15.8', p.body)}
    {pg(p, '12,14.6 15.6,16 12,18.6 8.4,16', p.bodyShade, 0.2)}
    {ln('5.2,15.9 12,19.6 18.8,15.9', p.acc, 0.5)}
    {pg(p, '6.8,14 9.6,12.6 14.4,12.6 17.2,14 12,15', p.bodyShade)}
    {/* compass pendant */}
    {ln('9.6,13.4 12,15.4 14.4,13.4', p.steel, 0.3)}
    {dot(p, 12, 16.6, 1.2, p.steel, 0.25)}
    {dot(p, 12, 16.6, 0.8, p.paper, 0.1)}
    {pg(p, '12,15.8 12.4,16.6 12,17.4 11.6,16.6', p.acc, 0.1)}
    <Tilt a={7} cx={12} cy={11}>
      {/* face (3/4) */}
      {pg(p, '8.8,7.6 15.2,7.6 15.8,10.6 14.4,13.2 11.6,13.8 9.6,12.2 8.4,9.8', p.skin)}
      {/* alert eyes looking up-right */}
      {pg(p, '9.6,8.8 11.6,8.7 11.6,9.7 9.8,9.8', p.paper, 0.15)}
      {dot(p, 11.1, 9.1, 0.42, p.ink, 0.05)}
      {pg(p, '12.8,8.7 14.8,8.8 14.7,9.8 13,9.7', p.paper, 0.15)}
      {dot(p, 14.2, 9.1, 0.42, p.ink, 0.05)}
      {/* bandana over nose and mouth */}
      {pg(p, '8.5,10.6 15.9,10.2 14.6,13.2 11.8,13.9 9.6,12.4', p.acc, 0.25)}
      {dot(p, 10.5, 11.6, 0.2, p.accHi, 0)}
      {dot(p, 12, 12.4, 0.2, p.accHi, 0)}
      {dot(p, 13.6, 11.6, 0.2, p.accHi, 0)}
      {dot(p, 12, 11.2, 0.2, p.accHi, 0)}
      {pg(p, '8.6,11 6.6,11.4 7,13.4 8.8,12.4', p.acc, 0.25)}
      {pg(p, '7,13.4 5.8,14.8 7.8,14.4', p.accDeep, 0.2)}
      {/* wide-brim hat with feather + pushed-up goggles */}
      {pg(p, '8.8,4.6 6,2 5,0.6 7,1.2 9.4,3.6', p.acc, 0.25)}
      {ln('8.6,4.2 5.6,1.2', p.accHi, 0.2)}
      {pg(p, '8.4,6.2 8.8,2.4 12.4,1.2 15.8,2.4 16.2,5.8', p.body)}
      {pg(p, '8.5,4.6 16.1,4.4 16.2,5.8 8.4,6', p.acc, 0.22)}
      {pg(p, '3.6,8 8,6 16.4,5.6 20.4,7 17,7.8 7,8.4', p.bodyShade)}
      {pg(p, '9.4,3.7 10.2,3 11.2,3 11.8,3.7 11.2,4.4 10,4.4', p.steel, 0.2)}
      {pg(p, '12.6,3.7 13.4,3 14.4,3 15,3.7 14.4,4.4 13.2,4.4', p.steel, 0.2)}
    </Tilt>
  </>
);

/* ---------------------------------------------------------------------------
 * 7. IRONCLAD WARDEN - closed great helm, cross visor, stacked pauldrons
 * ------------------------------------------------------------------------- */
const PAULD_A = '2.8,15 4.2,12.6 8.4,12.4 8.4,15.2';
const PAULD_B = '2.6,17.2 3.2,15.2 8.4,15.2 8.4,17.4';
const PAULD_C = '2.8,19 2.8,17.4 8.4,17.4 8.4,19';
const drawWarden: Draw = (p) => (
  <>
    {/* stacked plate pauldrons */}
    {pg(p, PAULD_C, p.bodyShade)}
    {pg(p, PAULD_B, p.body)}
    {pg(p, PAULD_A, p.bodyHi)}
    {ln('3.6,13.8 8.4,13.6', p.acc, 0.5)}
    {dot(p, 4.4, 16.2, 0.22, p.steelHi, 0.08)}
    {dot(p, 4.4, 18.2, 0.22, p.steelHi, 0.08)}
    <Mir>
      {pg(p, PAULD_C, p.bodyShade)}
      {pg(p, PAULD_B, p.body)}
      {pg(p, PAULD_A, p.bodyHi)}
      {ln('3.6,13.8 8.4,13.6', p.acc, 0.5)}
      {dot(p, 4.4, 16.2, 0.22, p.steelHi, 0.08)}
      {dot(p, 4.4, 18.2, 0.22, p.steelHi, 0.08)}
    </Mir>
    {/* breastplate + emblem */}
    {pg(p, '7.6,19 8.2,14 15.8,14 16.4,19', p.body)}
    {ln('12,14 12,19', p.edge, 0.2)}
    {pg(p, '12,15.2 13.2,16.6 12,18.4 10.8,16.6', p.acc, 0.2)}
    {/* gorget */}
    {pg(p, '8.2,12.8 15.8,12.8 16.6,14 7.4,14', p.steel)}
    {/* closed great helm */}
    {pg(p, '7.8,4 9,2.6 15,2.6 16.2,4 16.6,11.2 15.4,13.2 8.6,13.2 7.4,11.2', p.body)}
    {pg(p, '7.8,4 9,2.6 10.2,2.6 10.2,13.2 8.6,13.2 7.4,11.2', p.bodyHi, 0.2)}
    {pg(p, '13.8,2.6 15,2.6 16.2,4 16.6,11.2 15.4,13.2 13.8,13.2', p.bodyShade, 0.2)}
    {pg(p, '10.4,2.6 13.6,1 14.2,2.6', p.acc, 0.22)}
    {pg(p, '10.8,2.6 13.2,2.6 13.2,6 10.8,6', p.bodyShade, 0.2)}
    {/* cross-shaped visor */}
    {pg(p, '8.4,6 15.6,6 15.6,7.4 8.4,7.4', p.void, 0.25)}
    {pg(p, '11.3,7.4 12.7,7.4 12.7,12 11.3,12', p.void, 0.25)}
    {dot(p, 10.2, 6.7, 0.36, p.accHi, 0)}
    {dot(p, 13.8, 6.7, 0.36, p.accHi, 0)}
    {/* breath holes + rivets */}
    {[9.2, 10.3, 11.4].map((y) => (
      <React.Fragment key={y}>
        <circle cx="9.8" cy={y} r="0.26" fill={p.void} />
        <circle cx="14.2" cy={y} r="0.26" fill={p.void} />
      </React.Fragment>
    ))}
    {dot(p, 8.6, 4.4, 0.24, p.steelHi, 0.08)}
    {dot(p, 15.4, 4.4, 0.24, p.steelHi, 0.08)}
    {dot(p, 8.6, 12.2, 0.24, p.steelHi, 0.08)}
    {dot(p, 15.4, 12.2, 0.24, p.steelHi, 0.08)}
  </>
);

/* ---------------------------------------------------------------------------
 * 8. BLACK MONKEY - feather fan, single horn, raised brow, grin, trick card
 * ------------------------------------------------------------------------- */
const FEATHER_FAR = '6.2,2.6 8.6,5 7.8,6.4 5.6,4';
const FEATHER_NEAR = '8.2,1 10.4,4.4 9.2,5.6 7.6,2.8';
const EAR = '6,8.4 7.6,7.4 8.4,9.2 8.2,11.4 6.6,11.8 5.4,10.2';
const drawMonkey: Draw = (p) => (
  <>
    {/* curly tail */}
    {ln('7,19 4,17.6 3.4,14.6 5,13.2 6.4,14.6', p.edge, 1.7)}
    {ln('7,19 4,17.6 3.4,14.6 5,13.2 6.4,14.6', p.fur, 1.1)}
    {/* jacket body + feather collar */}
    {pg(p, '5.6,19 6.6,15.4 9.4,13.6 14.6,13.6 17.4,15.4 18.4,19', p.body)}
    {pg(p, '7.6,14.2 8.6,16.2 9.8,14.6 10.8,16.6 12,15 13.2,16.6 14.2,14.6 15.4,16.2 16.4,14.2 14,13.6 10,13.6', p.acc, 0.22)}
    {/* trick card + raised hand */}
    {pg(p, '18.6,8.2 21.6,9 20.6,13 17.6,12.2', p.paper, 0.22)}
    {pg(p, '19.6,9.6 20.4,10.6 19.6,11.6 18.8,10.6', p.acc, 0.15)}
    {pg(p, '16,19 17,15.4 19.6,13.6 20.6,15 19.2,19', p.body)}
    {pg(p, '18,14.4 18.6,12.4 20.8,12.6 21.2,14.6 19.6,15.2', p.fur, 0.22)}
    <Tilt a={9} cx={12} cy={11}>
      {/* feather fan behind head */}
      {pg(p, FEATHER_FAR, p.acc, 0.22)}
      {pg(p, FEATHER_NEAR, p.steelHi, 0.22)}
      <Mir>
        {pg(p, FEATHER_FAR, p.acc, 0.22)}
        {pg(p, FEATHER_NEAR, p.steelHi, 0.22)}
      </Mir>
      {/* ears */}
      {pg(p, EAR, p.fur)}
      {pg(p, '6.6,9 7.4,8.6 7.6,10.8 6.6,11', p.skinShade, 0.12)}
      <Mir>
        {pg(p, EAR, p.fur)}
        {pg(p, '6.6,9 7.4,8.6 7.6,10.8 6.6,11', p.skinShade, 0.12)}
      </Mir>
      {/* head + heart-shaped face mask */}
      {pg(p, '7.8,6.2 9.6,4.8 14.4,4.8 16.2,6.2 16.5,9 15.2,11.8 12,13.4 8.8,11.8 7.5,9', p.fur)}
      {pg(p, '8.8,7.4 10.8,7 12,7.8 13.2,7 15.2,7.4 15.2,10 13.8,12.6 12,13.4 10.2,12.6 8.8,10', p.skin, 0.22)}
      {/* sly eyes: one brow raised */}
      {pg(p, '9.4,8.6 10.2,8.2 11.2,8.4 11.4,9.4 10.6,9.9 9.6,9.7', p.paper, 0.15)}
      {dot(p, 10.6, 9.1, 0.38, p.ink, 0.05)}
      {pg(p, '12.8,8.5 13.9,8.2 14.7,8.6 14.6,9.6 13.6,9.9 12.7,9.4', p.paper, 0.15)}
      {dot(p, 13.7, 9.1, 0.38, p.ink, 0.05)}
      {ln('9.3,8.8 11.4,8.6', p.ink, 0.45)}
      {ln('12.7,8.6 14.8,8.9', p.ink, 0.45)}
      {pg(p, '9,7.2 11.2,6.6 11.3,7.2 9.2,7.9', p.ink, 0.08)}
      {pg(p, '12.8,7.4 15,8 14.9,8.5 12.8,8', p.ink, 0.08)}
      {dot(p, 11.4, 10.8, 0.22, p.ink, 0)}
      {dot(p, 12.6, 10.8, 0.22, p.ink, 0)}
      {/* wide grin with teeth */}
      {pg(p, '9.6,11.4 12,12.2 14.4,11.4 13.9,12.7 12,13.2 10.1,12.7', p.ink, 0.12)}
      {pg(p, '10.2,11.7 13.8,11.7 13.6,12.3 10.4,12.3', p.paper, 0.05)}
      {ln('11.2,11.7 11.2,12.3', p.ink, 0.15)}
      {ln('12,11.8 12,12.5', p.ink, 0.15)}
      {ln('12.8,11.7 12.8,12.3', p.ink, 0.15)}
      {/* single horn */}
      {pg(p, '11,5.4 11.4,3 12.4,1.4 12.8,3 13,5.4', p.steelHi, 0.25)}
      {pg(p, '11.9,2.6 12.4,1.4 12.8,3', p.acc, 0.15)}
    </Tilt>
  </>
);

/* ---------------------------------------------------------------------------
 * 9. PARTY KING KONG - hooded gorilla brute, tusks, party cone hat, confetti
 * ------------------------------------------------------------------------- */
const KONG_EYE = '9.6,9.4 11.2,9.5 11,10.2 9.8,10.2';
const KONG_NOSTRIL = '10.5,11.2 11.4,11.2 11.2,12 10.4,11.8';
const KONG_TUSK = '9.6,14.4 10.1,12.6 10.8,14.4';
const drawKong: Draw = (p) => (
  <>
    {/* huge hunched hoodie */}
    {pg(p, '1.8,19 2.4,14.4 5.6,11.8 9,13 15,13 18.4,11.8 21.6,14.4 22.2,19', p.body)}
    {pg(p, '1.8,19 2.4,14.4 4.2,13.2 4.2,19', p.bodyShade, 0.2)}
    <Mir>{pg(p, '1.8,19 2.4,14.4 4.2,13.2 4.2,19', p.bodyShade, 0.2)}</Mir>
    {/* knuckle-walking fists */}
    {pg(p, '0.8,16.6 4.2,15.8 4.8,19 0.8,19', p.skin)}
    <Mir>{pg(p, '0.8,16.6 4.2,15.8 4.8,19 0.8,19', p.skin)}</Mir>
    {/* hood */}
    {pg(p, '6.4,12.4 5.6,7.4 8.4,4.6 12,3.8 15.6,4.6 18.4,7.4 17.6,12.4 12,13.8', p.bodyShade)}
    {/* gorilla face */}
    {pg(p, '8,7.8 10.4,6.6 13.6,6.6 16,7.8 16.3,11 15.2,14.4 12,15.2 8.8,14.4 7.7,11', p.skin)}
    {pg(p, '7.9,7.8 12,7 16.1,7.8 15.8,9.3 12,8.6 8.2,9.3', p.skinShade, 0.2)}
    {pg(p, KONG_EYE, p.paper, 0.1)}
    {dot(p, 10.4, 9.85, 0.28, p.acc, 0)}
    <Mir>
      {pg(p, KONG_EYE, p.paper, 0.1)}
      {dot(p, 10.4, 9.85, 0.28, p.acc, 0)}
    </Mir>
    {pg(p, '10.2,10.4 13.8,10.4 14.3,12.2 12,12.8 9.7,12.2', p.skinShade, 0.2)}
    {pg(p, KONG_NOSTRIL, p.ink, 0.05)}
    <Mir>{pg(p, KONG_NOSTRIL, p.ink, 0.05)}</Mir>
    {/* roaring jaw with tusks */}
    {pg(p, '9,13 15,13 14.4,14.4 12,15 9.6,14.4', p.ink, 0.15)}
    {pg(p, KONG_TUSK, p.paper, 0.15)}
    <Mir>{pg(p, KONG_TUSK, p.paper, 0.15)}</Mir>
    {/* hoodie strings */}
    {ln('10,13.8 9.4,17.6', p.acc, 0.4)}
    {ln('14,13.8 14.6,17.6', p.acc, 0.4)}
    {dot(p, 9.4, 17.8, 0.4, p.accHi, 0.12)}
    {dot(p, 14.6, 17.8, 0.4, p.accHi, 0.12)}
    {/* party cone hat */}
    {pg(p, '9.4,5 13.2,0.2 15.4,4.6', p.acc, 0.25)}
    {pg(p, '10.35,3.8 14.85,3.5 14.41,2.62 11.11,2.84', p.paper, 0.15)}
    {pg(p, '11.87,1.88 13.97,1.74 13.64,1.08 12.44,1.16', p.paper, 0.12)}
    {dot(p, 13.2, 0.5, 0.7, p.accHi, 0.2)}
    {/* confetti */}
    {dot(p, 7.4, 2.4, 0.45, p.acc, 0)}
    {dot(p, 18.4, 2, 0.4, p.accHi, 0)}
    {dot(p, 21, 8, 0.4, p.accHi, 0)}
    {dot(p, 3.2, 9.4, 0.4, p.acc, 0)}
    <rect x="4.8" y="5.2" width="0.9" height="0.9" fill={p.steelHi} transform="rotate(30 5.2 5.6)" />
    <rect x="18.8" y="5.4" width="0.9" height="0.9" fill={p.acc} transform="rotate(-20 19.2 5.8)" />
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

/** Team base: chevron (white side, blue trim) or rounded shield (black side, red trim). */
const renderBase = (isWhite: boolean) =>
  isWhite ? (
    <>
      <polygon
        points="2.4,22.6 21.6,22.6 21.6,20.6 12,17.8 2.4,20.6"
        fill="#f7f9fc"
        stroke="#1b2747"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
      <path d="M2.9 20.9 L12 18.3 L21.1 20.9" fill="none" stroke="#2563eb" strokeWidth="0.5" strokeLinecap="round" />
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
  const p: Palette = isWhite ? WHITE : BLACK;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {renderBase(isWhite)}
      {draw(p)}
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
