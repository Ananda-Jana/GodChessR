export type PieceColor = 'white' | 'black';

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
 * HERO PIECES - humanoid characters (head, torso, limbs, gear)
 * ============================================================================
 * Silhouette language borrowed from the character sheet: chunky flat shapes,
 * oversized hats / hoods / shoulders, one bold gimmick prop per hero.
 *
 * - Player 1 (white): ivory fill, deep navy line art, GOLD accents,
 *   sharp upward CHEVRON base.
 * - Player 2 (black): obsidian fill, pale outline, CRIMSON accents,
 *   rounded SHIELD base.   (shape + color = colour-blind friendly)
 * - 0.4 outlines, hairline 0.3 details.
 * - viewBox 24x24. Feet land at y = 19 (just inside the base).
 * - No gradients / ids / filters inside the art, so any number of pieces can
 *   share one page or one <svg> without id collisions.
 *
 * Exports: HeroPiece (drop-in, same props as before), HeroArt (bare <g> for
 * embedding inside your own <svg>), HeroPieceSheet (one unified SVG with every
 * hero in both colours, for visual verification).
 */
const WHITE = {
  fill: '#fffaf0',
  shade: '#e4d8bd',
  line: '#1a2236',
  detail: '#1a2236',
  ink: '#1a2236',
  face: '#1a2236',
  skin: '#f2d3a9',
  accent: '#d4a017',
  accent2: '#f7dc7a',
};
const BLACK = {
  fill: '#090d16',
  shade: '#1d2639',
  line: 'rgba(241, 245, 249, 0.75)',
  detail: 'rgba(241, 245, 249, 0.85)',
  ink: 'rgba(241, 245, 249, 0.85)',
  face: '#090d16',
  skin: '#d9b99a',
  accent: '#c1121f',
  accent2: '#ff5d6c',
};

type Palette = typeof WHITE;

/** outline props */
const ol = (p: Palette, w = 0.4) => ({ stroke: p.line, strokeWidth: w, strokeLinejoin: 'round' as const });
/** hairline detail props (always unfilled) */
const dt = (p: Palette, w = 0.3) => ({ fill: 'none', stroke: p.detail, strokeWidth: w, strokeLinecap: 'round' as const });

/** An outlined limb / pole: dark outline stroke under a coloured stroke. */
const Limb: React.FC<{ d: string; w: number; color: string; p: Palette }> = ({ d, w, color, p }) => (
  <>
    <path d={d} fill="none" stroke={p.line} strokeWidth={w + 0.8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </>
);

/** A bare hand. */
const Hand: React.FC<{ x: number; y: number; r?: number; p: Palette }> = ({ x, y, r = 0.9, p }) => (
  <circle cx={x} cy={y} r={r} fill={p.skin} {...ol(p, 0.35)} />
);

/** A small phase dagger, origin at the grip, blade pointing up before rotation. */
const Dagger: React.FC<{ x: number; y: number; rot: number; solid: boolean; p: Palette }> = ({ x, y, rot, solid, p }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M0 -7.6 L1.1 -2.6 L0 -1.2 L-1.1 -2.6 Z" fill={solid ? p.accent : p.fill} {...ol(p)} />
    <path d="M0 -6 V-2.4" {...dt(p)} />
    <rect x="-1.8" y="-1.3" width="3.6" height="0.9" rx="0.3" fill={p.accent2} {...ol(p, 0.3)} />
    <rect x="-0.45" y="-0.4" width="0.9" height="1.8" fill={p.fill} {...ol(p, 0.3)} />
  </g>
);

/** Team base: chevron (P1) or rounded shield (P2). */
const renderBase = (p: Palette, isWhite: boolean) =>
  isWhite ? (
    <>
      <polygon
        points="2.4,22.6 21.6,22.6 21.6,20.6 12,17.8 2.4,20.6"
        fill={p.fill}
        {...ol(p)}
      />
      <path d="M2.9 20.9 L12 18.3 L21.1 20.9" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinecap="round" />
      <path d="M5 22 H19" {...dt(p)} />
    </>
  ) : (
    <>
      <path
        d="M3.4 19 H20.6 V20.4 C20.6 22.2 16.6 23.2 12 23.2 C7.4 23.2 3.4 22.2 3.4 20.4 Z"
        fill={p.fill}
        {...ol(p)}
      />
      <path d="M4.6 20.5 C7.4 21.6 16.6 21.6 19.4 20.5" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinecap="round" />
    </>
  );

/** Bare artwork for one hero (a <g>), safe to nest inside any 24x24 <svg>. */
export const HeroArt: React.FC<{ type: HeroPieceType; color: PieceColor }> = ({ type, color }) => {
  const isWhite = color === 'white';
  const p: Palette = isWhite ? WHITE : BLACK;

  const renderSvgContent = () => {
    switch (type) {
      /**
       * 1. MUGENKING - "The Sovereign"
       * Spiked crown, ermine collar, long cape, scepter with a glowing orb.
       */
      case 'mugenKing':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Aura rays */}
            <path d="M6.6 2.2 L7.8 3.6 M4.4 5.4 L6.4 5.8 M17.4 2.2 L16.2 3.6 M17.8 5.6 L16.6 5.8" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinecap="round" />
            {/* Cape */}
            <path d="M8.4 9.4 L3.8 19 H20.2 L15.6 9.4 Z" fill={p.accent} {...ol(p)} />
            <path d="M6.2 16.6 L7 19 M17.8 16.6 L17 19" {...dt(p)} />
            {/* Scepter (behind hand) */}
            <Limb d="M19.6 5.2 V19" w={0.7} color={p.accent2} p={p} />
            <circle cx="19.6" cy="4.2" r="1.4" fill={p.accent2} {...ol(p)} />
            <path d="M19 3.6 L19.6 3 M19.6 4.2 m-0.5 0.2" {...dt(p)} />
            {/* Robe */}
            <path d="M9.2 9.6 H14.8 L16.4 19 H7.6 Z" fill={p.fill} {...ol(p)} />
            <path d="M12 10.8 V19" fill="none" stroke={p.accent} strokeWidth="1.4" />
            <path d="M8.2 17.2 H15.8" {...dt(p)} />
            {/* Belt */}
            <rect x="8.4" y="13.6" width="7.2" height="1.1" fill={p.accent} {...ol(p, 0.3)} />
            <circle cx="12" cy="14.15" r="0.8" fill={p.accent2} {...ol(p, 0.3)} />
            {/* Ermine collar */}
            <path d="M7.6 9.8 Q12 12.6 16.4 9.8 L15.4 8.4 Q12 9.8 8.6 8.4 Z" fill={p.shade} {...ol(p)} />
            <circle cx="9.8" cy="10.2" r="0.25" fill={p.ink} />
            <circle cx="12" cy="11.1" r="0.25" fill={p.ink} />
            <circle cx="14.2" cy="10.2" r="0.25" fill={p.ink} />
            {/* Arms */}
            <Limb d="M8.8 10.4 L6.8 14.4" w={1.8} color={p.shade} p={p} />
            <Hand x={6.6} y={14.9} p={p} />
            <Limb d="M15.2 10.4 L19 11.8" w={1.8} color={p.shade} p={p} />
            <Hand x={19.6} y={12} p={p} />
            {/* Head */}
            <circle cx="12" cy="6.9" r="2.1" fill={p.skin} {...ol(p)} />
            <path d="M10.8 7 H11.7 M12.3 7 H13.2 M10.6 6.2 L11.8 6.6 M13.4 6.2 L12.2 6.6 M11.3 8.3 H12.7" fill="none" stroke={p.face} strokeWidth="0.35" strokeLinecap="round" />
            {/* Crown */}
            <path d="M9.6 5.7 L9.2 2.7 L10.8 4.1 L12 1.9 L13.2 4.1 L14.8 2.7 L14.4 5.7 Z" fill={p.accent} {...ol(p)} />
            <circle cx="9.2" cy="2.6" r="0.5" fill={p.accent2} {...ol(p, 0.3)} />
            <circle cx="14.8" cy="2.6" r="0.5" fill={p.accent2} {...ol(p, 0.3)} />
            <circle cx="12" cy="4.6" r="0.6" fill={p.accent2} {...ol(p, 0.3)} />
            {/* Cross-slash crest */}
            <path d="M12 1.6 V0.2 M11.3 0.9 H12.7" fill="none" stroke={p.line} strokeWidth="0.8" strokeLinecap="round" />
          </>
        );

      /**
       * 2. MALEVOLENT SHRINE PRIEST - "Curse Controller"
       * Bent pointed hat, wide-sleeved robe, paper talisman and a cursed orb.
       */
      case 'shrinePriest':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Robe */}
            <path d="M9.6 9.6 H14.4 L17.6 19 H6.4 Z" fill={p.fill} {...ol(p)} />
            <path d="M12 13.8 V19 M7.6 16 H16.4" {...dt(p)} />
            <path d="M10.4 9.6 L12 12.2 L13.6 9.6" {...dt(p)} />
            <rect x="8.4" y="12.6" width="7.2" height="1.2" fill={p.accent} {...ol(p, 0.3)} />
            {/* Curse eye on chest */}
            <circle cx="12" cy="11.2" r="0.85" fill="none" stroke={p.detail} strokeWidth="0.3" />
            <circle cx="12" cy="11.2" r="0.3" fill={p.ink} />
            {/* Left sleeve + cursed orb */}
            <path d="M9.8 9.8 L4.2 11.4 L5 15.2 L9.4 13 Z" fill={p.shade} {...ol(p)} />
            <Hand x={4.5} y={12.4} r={0.8} p={p} />
            <circle cx="2.9" cy="9.2" r="1.4" fill={p.accent} {...ol(p)} />
            <path d="M2.9 8.4 C3.7 8.4 3.9 9.4 3 9.5 C2.4 9.5 2.4 8.9 2.8 8.9" {...dt(p, 0.25)} />
            {/* Right sleeve + talisman */}
            <path d="M14.2 9.8 L19.8 11.4 L19 15.2 L14.6 13 Z" fill={p.shade} {...ol(p)} />
            <g transform="rotate(10 20.8 8.6)">
              <rect x="19.4" y="6" width="2.8" height="5" fill={p.fill} {...ol(p, 0.35)} />
              <rect x="19.4" y="6" width="2.8" height="1" fill={p.accent} {...ol(p, 0.3)} />
              <path d="M20.8 7.6 V10.4 M20.1 8.4 H21.5 M20.1 9.6 H21.5" {...dt(p)} />
            </g>
            <Hand x={19.9} y={11.7} r={0.8} p={p} />
            {/* Head */}
            <circle cx="12" cy="7.6" r="1.9" fill={p.skin} {...ol(p)} />
            <path d="M10.6 7.5 Q11.1 8.1 11.6 7.5 M12.4 7.5 Q12.9 8.1 13.4 7.5 M10.5 9 H11.3 M12.7 9 H13.5" fill="none" stroke={p.face} strokeWidth="0.3" strokeLinecap="round" />
            {/* Hat */}
            <path d="M10.2 5.8 L11.2 2 L13.6 0.5 L13.1 1.9 L13.9 5.8 Z" fill={p.shade} {...ol(p)} />
            <path d="M7.2 5.8 H16.8 L16.2 6.8 H7.8 Z" fill={p.shade} {...ol(p)} />
            <rect x="10.4" y="4.4" width="3.4" height="0.9" fill={p.accent} {...ol(p, 0.3)} />
          </>
        );

      /**
       * 3. DR. METHANOGENIC - "Alchemist of Gas"
       * Beaked gas mask, wide-brim hat, vial bandolier, flask and gas canister.
       */
      case 'methanogenic':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Coat */}
            <path d="M8.4 10.4 H15.6 L17.2 19 H6.8 Z" fill={p.fill} {...ol(p)} />
            <path d="M12 12 V19" {...dt(p)} />
            <path d="M7.2 10.6 Q12 8.4 16.8 10.6 L15.6 13 H8.4 Z" fill={p.shade} {...ol(p)} />
            {/* Boots */}
            <rect x="8" y="18.2" width="3.2" height="1.1" rx="0.4" fill={p.ink} />
            <rect x="12.8" y="18.2" width="3.2" height="1.1" rx="0.4" fill={p.ink} />
            {/* Bandolier */}
            <Limb d="M8.6 10.8 L15.4 16.4" w={1.1} color={p.accent} p={p} />
            <circle cx="9.9" cy="11.9" r="0.7" fill={p.accent2} {...ol(p, 0.3)} />
            <circle cx="11.3" cy="13" r="0.7" fill={p.fill} {...ol(p, 0.3)} />
            <circle cx="12.7" cy="14.2" r="0.7" fill={p.accent2} {...ol(p, 0.3)} />
            <circle cx="14.1" cy="15.3" r="0.7" fill={p.fill} {...ol(p, 0.3)} />
            {/* Left arm + flask */}
            <Limb d="M8 11.2 L5.8 14" w={1.7} color={p.shade} p={p} />
            <path d="M3.6 12.4 C3.2 11.4 5.2 11 4.4 9.8 M4.8 12.2 C5.4 11.2 4 10.6 4.8 9.4" fill="none" stroke={p.accent} strokeWidth="0.4" strokeLinecap="round" />
            <rect x="4" y="12.2" width="1.4" height="1.2" fill={p.accent} {...ol(p, 0.3)} />
            <circle cx="4.7" cy="15.6" r="2.1" fill={p.fill} {...ol(p)} />
            <path d="M2.7 15.4 C3.6 14.8 4.2 16 5 15.2 C5.8 14.6 6.4 15.4 6.8 15.4 C6.8 17.2 5.8 17.7 4.7 17.7 C3.5 17.7 2.6 17 2.7 15.4 Z" fill={p.accent} fillOpacity="0.9" />
            <Hand x={5.9} y={14.1} r={0.8} p={p} />
            {/* Right arm + gas canister */}
            <Limb d="M16 11.2 L18.4 14" w={1.7} color={p.shade} p={p} />
            <path d="M19.9 12.6 C19 11.6 20.8 11.2 20 10 M21 12.6 C20.4 11.8 21.6 11.4 21.2 10.6" fill="none" stroke={p.accent} strokeWidth="0.4" strokeLinecap="round" />
            <rect x="19" y="12.4" width="2.2" height="0.9" rx="0.3" fill={p.fill} {...ol(p, 0.3)} />
            <rect x="18.7" y="13.2" width="2.8" height="4.6" rx="1" fill={p.accent} {...ol(p, 0.35)} />
            <path d="M18.9 15 H21.3" {...dt(p)} />
            <Hand x={18.6} y={14.2} r={0.8} p={p} />
            {/* Head: goggles + beak */}
            <circle cx="12" cy="7.3" r="2.3" fill={p.shade} {...ol(p)} />
            <path d="M10.4 7.8 Q12 8.4 13.6 7.8 L12 12.2 Z" fill={p.fill} {...ol(p)} />
            <path d="M12 8.4 V11.2" {...dt(p)} />
            <circle cx="10.8" cy="6.9" r="1" fill={p.accent2} {...ol(p, 0.35)} />
            <circle cx="13.2" cy="6.9" r="1" fill={p.accent2} {...ol(p, 0.35)} />
            <circle cx="10.8" cy="6.9" r="0.35" fill={p.face} />
            <circle cx="13.2" cy="6.9" r="0.35" fill={p.face} />
            {/* Hat */}
            <ellipse cx="12" cy="4.8" rx="5.4" ry="1" fill={p.shade} {...ol(p)} />
            <path d="M9.2 4.6 L9.6 1.4 H14.4 L14.8 4.6 Z" fill={p.shade} {...ol(p)} />
            <rect x="9.3" y="3.3" width="5.4" height="0.9" fill={p.accent} {...ol(p, 0.3)} />
          </>
        );

      /**
       * 4. CAPTAIN ENGLLAND - "Field Commander"
       * Plumed helm, huge gold pauldrons, short cape, battle standard.
       */
      case 'englland':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Standard pole + swallowtail pennant */}
            <path d="M19.9 0.8 V19" fill="none" stroke={p.line} strokeWidth="0.6" strokeLinecap="round" />
            <path d="M20.1 1.2 L23.8 2.4 L22.4 4 L23.8 5.8 L20.1 7 Z" fill={p.accent} {...ol(p)} />
            <circle cx="19.9" cy="0.8" r="0.6" fill={p.accent2} {...ol(p, 0.3)} />
            {/* Cape */}
            <path d="M8 9.8 L4.2 18.4 L9 16.6 Z" fill={p.accent} {...ol(p)} />
            {/* Legs + boots */}
            <Limb d="M10 15.4 V18.4" w={2.4} color={p.shade} p={p} />
            <Limb d="M14 15.4 V18.4" w={2.4} color={p.shade} p={p} />
            <rect x="8.4" y="17.8" width="3.2" height="1.3" rx="0.5" fill={p.ink} />
            <rect x="12.4" y="17.8" width="3.2" height="1.3" rx="0.5" fill={p.ink} />
            {/* Torso */}
            <path d="M7.4 9.4 H16.6 L15.6 15.6 H8.4 Z" fill={p.fill} {...ol(p)} />
            <path d="M9.8 10.6 L12 12.2 L14.2 10.6 M9.8 12.4 L12 14 L14.2 12.4" fill="none" stroke={p.accent} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="8.2" y="14.5" width="7.6" height="1.2" fill={p.ink} />
            <rect x="11.3" y="14.5" width="1.4" height="1.2" fill={p.accent} {...ol(p, 0.25)} />
            {/* Arms */}
            <Limb d="M7 10.6 L6 14.4" w={2} color={p.shade} p={p} />
            <Hand x={6} y={15.1} p={p} />
            <Limb d="M17 10.6 L19.9 12.4" w={2} color={p.shade} p={p} />
            <Hand x={19.9} y={12.8} p={p} />
            {/* Pauldrons */}
            <circle cx="7" cy="10.1" r="1.9" fill={p.accent} {...ol(p)} />
            <circle cx="17" cy="10.1" r="1.9" fill={p.accent} {...ol(p)} />
            <circle cx="7" cy="10.1" r="0.5" fill={p.accent2} {...ol(p, 0.25)} />
            <circle cx="17" cy="10.1" r="0.5" fill={p.accent2} {...ol(p, 0.25)} />
            {/* Head */}
            <rect x="10" y="5" width="4" height="4.4" rx="1.6" fill={p.skin} {...ol(p)} />
            <path d="M9.6 6.8 C9.4 3.6 14.6 3.6 14.4 6.8 Z" fill={p.fill} {...ol(p)} />
            <rect x="9.3" y="6.3" width="5.4" height="0.8" fill={p.accent} {...ol(p, 0.3)} />
            <circle cx="11.1" cy="7.8" r="0.28" fill={p.face} />
            <circle cx="12.9" cy="7.8" r="0.28" fill={p.face} />
            <path d="M10.9 8.8 Q12 8.2 13.1 8.8" fill="none" stroke={p.face} strokeWidth="0.35" strokeLinecap="round" />
            {/* Plume */}
            <path d="M12 4.4 C10.4 2.8 11.4 0.8 13.8 0.8 C13.6 1.9 13.2 3 12.6 4.4 Z" fill={p.accent} {...ol(p)} />
          </>
        );

      /**
       * 5. AJX - "The Phase Assassin"
       * Hooded, scarf trailing, lunging stance, twin daggers, glitch slices.
       */
      case 'ajx':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Glitch slices + afterimage */}
            <path d="M1.6 6.6 H5.4 M18.6 4.6 H22.4 M1.2 14.4 H4.2 M19.8 15.6 H22.8 M2.4 17.4 H5" fill="none" stroke={p.accent} strokeWidth="0.6" strokeLinecap="round" />
            <path d="M7.4 9.4 H12.2 L11.4 14.2 H8.2 Z" fill="none" stroke={p.accent2} strokeWidth="0.3" strokeDasharray="0.8 0.6" />
            {/* Legs (lunge) */}
            <Limb d="M11 14 L8.4 16.2 L6.6 19" w={1.9} color={p.shade} p={p} />
            <Limb d="M13 14 L15.4 15.8 L17.4 19" w={1.9} color={p.shade} p={p} />
            {/* Torso */}
            <path d="M9.4 9.4 H14.6 L14 14.2 H10 Z" fill={p.fill} {...ol(p)} />
            <path d="M10 10.4 L14 13.2" {...dt(p)} />
            <rect x="9.9" y="13.2" width="4.2" height="1" fill={p.accent} {...ol(p, 0.25)} />
            {/* Arms + daggers */}
            <Limb d="M9.6 10.2 L6.4 12.8" w={1.5} color={p.shade} p={p} />
            <Limb d="M14.4 10.2 L17.2 11.4" w={1.5} color={p.shade} p={p} />
            <Dagger x={6.4} y={12.8} rot={-42} solid={false} p={p} />
            <Dagger x={17.2} y={11.4} rot={38} solid p={p} />
            {/* Scarf */}
            <path d="M9.4 8.8 H14.6 L19.4 7.6 L18.2 9.2 L21.6 10 L15.8 11.2 L14.4 10 H9.4 Z" fill={p.accent} {...ol(p)} />
            {/* Hood */}
            <path d="M12 0.8 L15.8 5.6 L15 9 H9 L8.2 5.6 Z" fill={p.shade} {...ol(p)} />
            <path d="M10.1 5.2 H13.9 L13.5 8.2 H10.5 Z" fill={p.face} />
            <path d="M10.6 6.3 L11.7 6.7 L10.9 7 Z M13.4 6.3 L12.3 6.7 L13.1 7 Z" fill={p.accent2} />
            {/* Central rift */}
            <path d="M12 1.2 L11.2 3.2 L12.6 4.6" fill="none" stroke={p.accent2} strokeWidth="0.4" strokeLinejoin="miter" strokeLinecap="round" />
          </>
        );

      /**
       * 6. YJKSTRA - "The Pathfinder"
       * Wide-brim wanderer: long coat, compass in one hand, node-staff in the other.
       */
      case 'yjkstra':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Staff with graph nodes */}
            <Limb d="M19 5.4 V19" w={0.6} color={p.shade} p={p} />
            <path d="M19 3.2 L17.4 5.8 L20.6 5.8 Z" fill="none" stroke={p.accent} strokeWidth="0.45" strokeLinejoin="round" />
            <circle cx="19" cy="3.2" r="0.9" fill={p.accent} {...ol(p, 0.3)} />
            <circle cx="17.4" cy="5.8" r="0.8" fill={p.accent2} {...ol(p, 0.3)} />
            <circle cx="20.6" cy="5.8" r="0.8" fill={p.accent2} {...ol(p, 0.3)} />
            {/* Coat */}
            <path d="M8.6 9.8 H15.4 L17.6 19 H6.4 Z" fill={p.fill} {...ol(p)} />
            <path d="M10.6 11 H13.4 L13.8 19 H10.2 Z" fill={p.shade} {...ol(p, 0.3)} />
            <path d="M7.2 16.8 L9.6 15.2 L12 16.6 L14.4 14.8 L16.8 16.4" fill="none" stroke={p.accent} strokeWidth="0.5" strokeDasharray="1 0.7" />
            <circle cx="7.2" cy="16.8" r="0.5" fill={p.accent2} {...ol(p, 0.25)} />
            <circle cx="16.8" cy="16.4" r="0.5" fill={p.accent2} {...ol(p, 0.25)} />
            {/* Boots */}
            <rect x="8.2" y="18.2" width="3" height="1.1" rx="0.4" fill={p.ink} />
            <rect x="12.8" y="18.2" width="3" height="1.1" rx="0.4" fill={p.ink} />
            {/* Bandana */}
            <path d="M10 9.2 H14 L12 11.6 Z" fill={p.accent} {...ol(p, 0.3)} />
            {/* Arms */}
            <Limb d="M8.8 10.6 L5.8 13.4" w={1.8} color={p.fill} p={p} />
            <Limb d="M15.2 10.6 L18.6 11.8" w={1.8} color={p.fill} p={p} />
            {/* Compass */}
            <circle cx="4.7" cy="15.2" r="1.9" fill={p.fill} {...ol(p)} />
            <path d="M4.7 13.7 L5.3 15.2 L4.7 16.7 L4.1 15.2 Z" fill={p.accent} {...ol(p, 0.25)} />
            <Hand x={5.7} y={13.7} r={0.8} p={p} />
            <Hand x={19} y={12} r={0.8} p={p} />
            {/* Head */}
            <circle cx="12" cy="7.7" r="1.8" fill={p.skin} {...ol(p)} />
            <circle cx="11.1" cy="7.8" r="0.28" fill={p.face} />
            <circle cx="12.9" cy="7.8" r="0.28" fill={p.face} />
            <path d="M11.4 8.7 Q12 9 12.6 8.7" fill="none" stroke={p.face} strokeWidth="0.3" strokeLinecap="round" />
            {/* Hat */}
            <path d="M9.6 5.4 L10.2 2.2 H13.8 L14.4 5.4 Z" fill={p.shade} {...ol(p)} />
            <rect x="9.9" y="3.9" width="4.2" height="0.9" fill={p.accent} {...ol(p, 0.3)} />
            <ellipse cx="12" cy="5.6" rx="5.6" ry="1.1" fill={p.shade} {...ol(p)} />
          </>
        );

      /**
       * 7. IRONCLAD WARDEN - "Wall Tank"
       * Boxy plated giant: slit helm, block pauldrons, tower shield, warhammer.
       */
      case 'ironcladWarden':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Warhammer */}
            <Limb d="M20.8 10.4 V18.8" w={0.8} color={p.shade} p={p} />
            <rect x="18.6" y="8" width="4.4" height="2.6" rx="0.4" fill={p.shade} {...ol(p)} />
            <path d="M19.6 8.6 V10 M22 8.6 V10" {...dt(p)} />
            {/* Legs */}
            <rect x="6.6" y="15" width="4.4" height="4" rx="0.5" fill={p.shade} {...ol(p)} />
            <rect x="13" y="15" width="4.4" height="4" rx="0.5" fill={p.shade} {...ol(p)} />
            <path d="M7.4 17 H10.2 M13.8 17 H16.6" {...dt(p)} />
            {/* Torso */}
            <path d="M5.4 7.4 H18.6 L19.4 15 H4.6 Z" fill={p.fill} {...ol(p)} />
            <path d="M5.2 10.6 H18.8 M5 12.8 H19" {...dt(p)} />
            <path d="M9.4 7.6 H14.6 V12 C14.6 13.8 13.4 14.6 12 15 C10.6 14.6 9.4 13.8 9.4 12 Z" fill={p.accent} {...ol(p)} />
            <path d="M12 8 V14.6 M9.8 10 H14.2" fill="none" stroke={p.ink} strokeWidth="0.3" strokeLinecap="round" />
            <rect x="4.8" y="14" width="14.4" height="1.2" fill={p.ink} />
            {/* Arms */}
            <rect x="18" y="10.2" width="3" height="5" rx="0.6" fill={p.fill} {...ol(p)} />
            <rect x="2.4" y="10.2" width="3" height="5" rx="0.6" fill={p.fill} {...ol(p)} />
            <Hand x={19.5} y={15.8} r={1} p={p} />
            {/* Pauldrons */}
            <rect x="2.2" y="6.4" width="4.4" height="4" rx="0.7" fill={p.shade} {...ol(p)} />
            <rect x="17.4" y="6.4" width="4.4" height="4" rx="0.7" fill={p.shade} {...ol(p)} />
            <path d="M3 8.4 H5.8 M18.2 8.4 H21" {...dt(p)} />
            {/* Tower shield */}
            <path d="M0.8 8.6 H6.4 V16 C6.4 17.6 5 18.6 3.6 19 C2.2 18.6 0.8 17.6 0.8 16 Z" fill={p.accent} {...ol(p)} />
            <path d="M3.6 9 V18.6 M1.2 12 H6" fill="none" stroke={p.ink} strokeWidth="0.35" strokeLinecap="round" />
            <circle cx="3.6" cy="12" r="0.8" fill={p.accent2} {...ol(p, 0.3)} />
            {/* Head */}
            <path d="M9.8 7.4 V4.4 C9.8 2.6 14.2 2.6 14.2 4.4 V7.4 Z" fill={p.fill} {...ol(p)} />
            <rect x="10.3" y="4.5" width="3.4" height="0.9" rx="0.3" fill={p.ink} />
            <path d="M12 2.9 V1.6" fill="none" stroke={p.accent} strokeWidth="1" strokeLinecap="round" />
            <path d="M10.8 6.2 H13.2" {...dt(p)} />
            {/* Rivets */}
            <circle cx="6.2" cy="13.6" r="0.4" fill={p.detail} />
            <circle cx="17.8" cy="13.6" r="0.4" fill={p.detail} />
          </>
        );

      /**
       * 8. BLACKMONKEY - "The Trickster"
       * Big-headed monkey king: twin plumes, golden fillet, golden staff, curling tail.
       */
      case 'blackMonkey':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Tail */}
            <Limb d="M15 15.6 C20 17 22.6 14 21.8 11.6 C21.2 10 19.8 10.6 20.2 12" w={1.2} color={p.accent} p={p} />
            {/* Golden staff (behind hands) */}
            <Limb d="M3.6 17.6 L20.4 5.6" w={0.8} color={p.accent} p={p} />
            {/* Legs */}
            <Limb d="M10.4 15 L9.6 18.4" w={1.8} color={p.shade} p={p} />
            <Limb d="M13.6 15 L14.6 18.4" w={1.8} color={p.shade} p={p} />
            <ellipse cx="9.2" cy="18.7" rx="1.3" ry="0.6" fill={p.skin} {...ol(p, 0.3)} />
            <ellipse cx="15" cy="18.7" rx="1.3" ry="0.6" fill={p.skin} {...ol(p, 0.3)} />
            {/* Body */}
            <path d="M9.4 10.6 H14.6 L15.4 15.4 H8.6 Z" fill={p.fill} {...ol(p)} />
            <rect x="8.8" y="13.6" width="6.4" height="1.1" fill={p.accent} {...ol(p, 0.25)} />
            <path d="M12 10.8 V13.6" {...dt(p)} />
            {/* Arms + hands on staff */}
            <Limb d="M9.6 11.2 L8.2 14.2" w={1.5} color={p.shade} p={p} />
            <Limb d="M14.4 11.2 L16.4 8.6" w={1.5} color={p.shade} p={p} />
            <Hand x={8.2} y={14.3} r={0.8} p={p} />
            <Hand x={16.4} y={8.5} r={0.8} p={p} />
            {/* Plumes */}
            <path d="M8.6 5 C5 3 5.4 1 8 0.4 C7.8 1.8 9 3 10.2 4" fill={p.accent} {...ol(p)} />
            <path d="M15.4 5 C19 3 18.6 1 16 0.4 C16.2 1.8 15 3 13.8 4" fill={p.accent} {...ol(p)} />
            {/* Ears */}
            <circle cx="8.2" cy="7.8" r="1.5" fill={p.skin} {...ol(p)} />
            <circle cx="15.8" cy="7.8" r="1.5" fill={p.skin} {...ol(p)} />
            <circle cx="8.2" cy="7.8" r="0.65" fill={p.accent2} {...ol(p, 0.25)} />
            <circle cx="15.8" cy="7.8" r="0.65" fill={p.accent2} {...ol(p, 0.25)} />
            {/* Head */}
            <path d="M12 4 C15.4 4 16.4 6.4 16.2 8.4 C16 10.4 14.2 11.2 12 11.2 C9.8 11.2 8 10.4 7.8 8.4 C7.6 6.4 8.6 4 12 4 Z" fill={p.shade} {...ol(p)} />
            {/* Face mask */}
            <path d="M12 7.2 C13.4 6.2 15.2 7 14.8 8.6 C14.5 9.8 13.4 10.4 12 10.8 C10.6 10.4 9.5 9.8 9.2 8.6 C8.8 7 10.6 6.2 12 7.2 Z" fill={p.skin} {...ol(p, 0.3)} />
            <path d="M10 7.6 L11.4 8.1 L10.8 8.6 Z M14 7.6 L12.6 8.1 L13.2 8.6 Z" fill={p.face} />
            <path d="M11.6 9.1 H12.4 M11 10 Q12 10.6 13 10" fill="none" stroke={p.face} strokeWidth="0.3" strokeLinecap="round" />
            {/* Golden fillet */}
            <path d="M7.9 5.8 C10 4.6 14 4.6 16.1 5.8 L16 7 C14 5.9 10 5.9 8 7 Z" fill={p.accent} {...ol(p)} />
            <circle cx="12" cy="5.4" r="0.7" fill={p.accent2} {...ol(p, 0.25)} />
          </>
        );

      /**
       * 9. PARTY KING KONG - "The Brute"
       * Barrel-chested ape in a party-cone crown, huge spiked gauntlet fists, confetti.
       */
      case 'partyKingKong':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Confetti */}
            <rect x="4.6" y="2.6" width="1" height="1" fill={p.accent} transform="rotate(20 5 3)" />
            <rect x="18.6" y="3.4" width="1" height="1" fill={p.accent2} transform="rotate(-25 19 4)" />
            <rect x="2.6" y="6.6" width="0.9" height="0.9" fill={p.accent2} transform="rotate(35 3 7)" />
            <rect x="20.4" y="7.4" width="0.9" height="0.9" fill={p.accent} transform="rotate(15 21 8)" />
            <circle cx="7" cy="1.4" r="0.45" fill={p.accent} />
            <circle cx="17.2" cy="1.2" r="0.45" fill={p.accent2} />
            {/* Legs */}
            <rect x="7" y="16.6" width="4.2" height="2.4" rx="1" fill={p.shade} {...ol(p)} />
            <rect x="12.8" y="16.6" width="4.2" height="2.4" rx="1" fill={p.shade} {...ol(p)} />
            {/* Body */}
            <path d="M5.4 9 C5.4 7.6 8 7 12 7 C16 7 18.6 7.6 18.6 9 L19.4 15.6 C19.4 17.6 16 18.8 12 18.8 C8 18.8 4.6 17.6 4.6 15.6 Z" fill={p.fill} {...ol(p)} />
            <path d="M12 8.6 V12.4 M8 13.4 Q12 15.4 16 13.4 M7.4 10.4 Q9.6 11.8 11.6 10.6 M16.6 10.4 Q14.4 11.8 12.4 10.6" {...dt(p)} />
            <path d="M7.4 15.2 H16.6 V16.8 H7.4 Z" fill={p.accent} {...ol(p, 0.3)} />
            <circle cx="9.4" cy="16" r="0.3" fill={p.ink} />
            <circle cx="12" cy="16" r="0.3" fill={p.ink} />
            <circle cx="14.6" cy="16" r="0.3" fill={p.ink} />
            {/* Arms */}
            <Limb d="M5.8 9.6 L3.4 14.6" w={3.2} color={p.shade} p={p} />
            <Limb d="M18.2 9.6 L20.6 14.6" w={3.2} color={p.shade} p={p} />
            {/* Spiked gauntlet fists */}
            <polygon points="1.6,14.2 1.6,12 3,13" fill={p.accent} {...ol(p, 0.3)} />
            <polygon points="3.4,13.6 3.4,11.4 4.8,12.6" fill={p.accent} {...ol(p, 0.3)} />
            <polygon points="22.4,14.2 22.4,12 21,13" fill={p.accent} {...ol(p, 0.3)} />
            <polygon points="20.6,13.6 20.6,11.4 19.2,12.6" fill={p.accent} {...ol(p, 0.3)} />
            <circle cx="3.2" cy="15.8" r="2.1" fill={p.fill} {...ol(p)} />
            <circle cx="20.8" cy="15.8" r="2.1" fill={p.fill} {...ol(p)} />
            <path d="M2 15.4 H4.4 M19.6 15.4 H22" {...dt(p)} />
            <rect x="2.2" y="13.2" width="2" height="0.9" fill={p.accent} {...ol(p, 0.25)} />
            <rect x="19.8" y="13.2" width="2" height="0.9" fill={p.accent} {...ol(p, 0.25)} />
            {/* Head */}
            <circle cx="12" cy="5.6" r="2.7" fill={p.shade} {...ol(p)} />
            <ellipse cx="12" cy="6.3" rx="1.7" ry="1.5" fill={p.skin} {...ol(p, 0.3)} />
            <path d="M10.3 4.9 H13.7" fill="none" stroke={p.line} strokeWidth="0.7" strokeLinecap="round" />
            <circle cx="11.2" cy="5.8" r="0.3" fill={p.face} />
            <circle cx="12.8" cy="5.8" r="0.3" fill={p.face} />
            <path d="M11.4 7.1 Q12 7.5 12.6 7.1" fill="none" stroke={p.face} strokeWidth="0.3" strokeLinecap="round" />
            {/* Party-cone crown */}
            <path d="M12 0.6 L14.2 3.2 H9.8 Z" fill={p.accent} {...ol(p, 0.35)} />
            <path d="M10.6 2.6 L13.4 2.6" fill="none" stroke={p.accent2} strokeWidth="0.4" strokeLinecap="round" />
            <circle cx="12" cy="0.6" r="0.6" fill={p.accent2} {...ol(p, 0.25)} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {renderSvgContent()}
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
 * Drop <HeroPieceSheet /> on any page (or render it to a string and save as
 * .svg) to eyeball every hero at once.
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
      if (diff < bestDiff) { bestDiff = diff; best = i; }
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
            <rect x={x + 2} y={rowA} width="96" height="96" rx="8" fill="#eadfc8" />
            <svg x={x + 6} y={rowA + 4} width="88" height="88" viewBox="0 0 24 24" overflow="visible">
              <HeroArt type={type} color="white" />
            </svg>
            <rect x={x + 2} y={rowB} width="96" height="96" rx="8" fill="#56657f" />
            <svg x={x + 6} y={rowB + 4} width="88" height="88" viewBox="0 0 24 24" overflow="visible">
              <HeroArt type={type} color="black" />
            </svg>
            {lines.map((ln, li) => (
              <text key={li} x={x + 50} y={labelY + li * 10} fontSize="9" fontWeight="600" fill="#e8edf5" textAnchor="middle">
                {ln}
              </text>
            ))}
            <text x={x + 50} y={labelY + 10 * lines.length + 1} fontSize="7.5" fill="#9aa8c2" textAnchor="middle">
              {HERO_INFO[type].title}
            </text>
            <rect x={x + 2} y={rowC} width="46" height="44" rx="6" fill="#eadfc8" />
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
