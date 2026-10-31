import React from 'react';

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
 * HERO PIECES - same finish as the Classic / Culling sets, new silhouettes
 * ============================================================================
 * - Player 1 (white): ivory fill, deep navy line art, GOLD accents,
 *   sharp upward CHEVRON base.
 * - Player 2 (black): obsidian fill, pale outline, CRIMSON accents,
 *   rounded SHIELD base.   (shape + color = colour-blind friendly)
 * - 0.4 outlines, hairline 0.3 details, soft drop shadow.
 * - viewBox 24x24. Figures fill almost the whole box (bigger than classic).
 */
const WHITE = {
  fill: '#fffaf0',
  line: '#1a2236',
  detail: '#1a2236',
  ink: '#1a2236',
  accent: '#d4a017',
  accent2: '#f7dc7a',
};
const BLACK = {
  fill: '#090d16',
  line: 'rgba(241, 245, 249, 0.75)',
  detail: 'rgba(241, 245, 249, 0.85)',
  ink: 'rgba(241, 245, 249, 0.85)',
  accent: '#c1121f',
  accent2: '#ff5d6c',
};

type Palette = typeof WHITE;

/** Team base: chevron (P1) or rounded shield (P2). Figures end at y = 19. */
const renderBase = (p: Palette, isWhite: boolean) =>
  isWhite ? (
    <>
      <polygon
        points="2.4,22.6 21.6,22.6 21.6,20.6 12,17.8 2.4,20.6"
        fill={p.fill}
        stroke={p.line}
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
      <path d="M2.9 20.9 L12 18.3 L21.1 20.9" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinecap="round" />
      <path d="M5 22 H19" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
    </>
  ) : (
    <>
      <path
        d="M3.4 19 H20.6 V20.4 C20.6 22.2 16.6 23.2 12 23.2 C7.4 23.2 3.4 22.2 3.4 20.4 Z"
        fill={p.fill}
        stroke={p.line}
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
      <path d="M4.6 20.5 C7.4 21.6 16.6 21.6 19.4 20.5" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinecap="round" />
    </>
  );

export const HeroPiece: React.FC<HeroPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'white';
  const p: Palette = isWhite ? WHITE : BLACK;

  const renderSvgContent = () => {
    switch (type) {
      /**
       * 1. MUGENKING - "The Sovereign"
       * Tall imperial crown, cross-slash crest, radiating aura.
       */
      case 'mugenKing':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Aura rays */}
            <path
              d="M2.2 5 L4.6 6.8 M21.8 5 L19.4 6.8 M1.2 10.6 L4 11 M22.8 10.6 L20 11 M2.6 15.4 L5 14.6 M21.4 15.4 L19 14.6"
              fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinecap="round"
            />
            {/* Crown body */}
            <path
              d="M6 19 L4.8 8.2 L8.8 11.8 L12 3.6 L15.2 11.8 L19.2 8.2 L18 19 Z"
              fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            {/* Inner facets */}
            <path d="M12 3.6 V15.8 M8.8 11.8 L9.6 15.8 M15.2 11.8 L14.4 15.8" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Band */}
            <path d="M5.6 15.8 H18.4 L18 19 H6 Z" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <path d="M7 17.4 H17" fill="none" stroke={p.ink} strokeWidth="0.3" strokeLinecap="round" strokeDasharray="0.8 0.8" />
            {/* Gems */}
            <polygon points="12,8.4 13.3,10.2 12,12 10.7,10.2" fill={p.accent} stroke={p.line} strokeWidth="0.3" />
            <circle cx="4.8" cy="7.6" r="1" fill={p.accent2} stroke={p.line} strokeWidth="0.4" />
            <circle cx="19.2" cy="7.6" r="1" fill={p.accent2} stroke={p.line} strokeWidth="0.4" />
            {/* Cross-slash crest */}
            <path d="M12 2.8 V0.6 M10.7 1.5 H13.3" fill="none" stroke={p.line} strokeWidth="0.9" strokeLinecap="round" />
            <path d="M10.2 2.6 L13.8 0.4" fill="none" stroke={p.accent} strokeWidth="0.7" strokeLinecap="round" />
          </>
        );

      /**
       * 2. MALEVOLENT SHRINE PRIEST - "Curse Controller"
       * Torii gate with talisman ribbons.
       */
      case 'shrinePriest':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Pillars */}
            <rect x="5.8" y="7.6" width="2.4" height="11.4" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="15.8" y="7.6" width="2.4" height="11.4" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="5.2" y="17.8" width="3.6" height="1.2" rx="0.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="15.2" y="17.8" width="3.6" height="1.2" rx="0.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Lower beam */}
            <rect x="4.6" y="11.6" width="14.8" height="1.4" rx="0.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Plaque */}
            <rect x="10.4" y="7.8" width="3.2" height="3.8" rx="0.3" fill={p.accent} stroke={p.line} strokeWidth="0.4" />
            <path d="M12 8.6 V10.8 M11.2 9.2 H12.8" fill="none" stroke={p.ink} strokeWidth="0.3" strokeLinecap="round" />
            {/* Upper beams with upswept ends */}
            <rect x="3.8" y="6.4" width="16.4" height="1.4" rx="0.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <path
              d="M0.8 2.4 C5.4 5.2 18.6 5.2 23.2 2.4 L22.2 6 C17.6 7 6.4 7 1.8 6 Z"
              fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            <path d="M2.6 4.6 C7 6.2 17 6.2 21.4 4.6" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinecap="round" />
            {/* Talisman ribbons */}
            <path d="M8.6 13 H10.4 V18.4 L9.5 17.4 L8.6 18.4 Z" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <path d="M13.6 13 H15.4 V18.4 L14.5 17.4 L13.6 18.4 Z" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <path d="M9.5 14 V16 M14.5 14 V16" fill="none" stroke={p.ink} strokeWidth="0.35" strokeLinecap="round" />
            {/* Curse eye */}
            <circle cx="12" cy="15.2" r="1.1" fill="none" stroke={p.detail} strokeWidth="0.3" />
            <circle cx="12" cy="15.2" r="0.4" fill={p.ink} />
          </>
        );

      /**
       * 3. DR. METHANOGENIC - "Alchemist of Gas"
       * Bubbling round flask with toxic vapor tendrils.
       */
      case 'methanogenic':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Vapor tendrils */}
            <path d="M10.8 3.6 C9.2 2.6 11.8 1.8 10.4 0.4" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinecap="round" />
            <path d="M13.2 3.6 C14.8 2.6 12.2 1.8 13.6 0.4" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinecap="round" />
            <path d="M12 3.2 C13 2.2 11 1.6 12 0.4" fill="none" stroke={p.accent2} strokeWidth="0.4" strokeLinecap="round" />
            {/* Cork */}
            <rect x="10.2" y="3.6" width="3.6" height="1.6" rx="0.4" fill={p.accent} stroke={p.line} strokeWidth="0.4" />
            {/* Flask */}
            <path
              d="M10.4 5.2 H13.6 V8.6 C17.4 9.6 19.2 12 19.2 14.4 C19.2 17.2 16.4 19 12 19 C7.6 19 4.8 17.2 4.8 14.4 C4.8 12 6.6 9.6 10.4 8.6 Z"
              fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            <rect x="9.8" y="4.9" width="4.4" height="1" rx="0.4" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Liquid */}
            <path
              d="M5.2 13.8 C7.2 12.6 8.8 14.6 10.8 13.4 C12.8 12.2 14.6 14.4 18.8 13.4 C19 16.6 16 18.6 12 18.6 C8 18.6 5 16.8 5.2 13.8 Z"
              fill={p.accent} fillOpacity="0.9"
            />
            {/* Gauge ticks on neck */}
            <path d="M10.6 6.8 H11.6 M10.6 7.8 H11.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Bubbles */}
            <circle cx="9.4" cy="16" r="0.9" fill={p.fill} stroke={p.line} strokeWidth="0.3" />
            <circle cx="13.6" cy="15.4" r="1.3" fill={p.fill} stroke={p.line} strokeWidth="0.3" />
            <circle cx="15.8" cy="17" r="0.6" fill={p.fill} stroke={p.line} strokeWidth="0.3" />
            <circle cx="11.4" cy="11.4" r="0.7" fill={p.fill} stroke={p.line} strokeWidth="0.3" />
            <circle cx="14.2" cy="10.6" r="0.4" fill={p.fill} stroke={p.line} strokeWidth="0.3" />
            {/* Glass highlight */}
            <path d="M6.6 12.6 C6.8 11.8 7.4 11.2 8.2 10.8" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          </>
        );

      /**
       * 4. CAPTAIN ENGLLAND - "Field Commander"
       * Great helm with T-visor, fan crest, battle pennant on a standard.
       */
      case 'englland':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Pennant pole + swallowtail flag */}
            <path d="M19.6 0.8 V19" fill="none" stroke={p.line} strokeWidth="0.6" strokeLinecap="round" />
            <path d="M19.8 1.2 L23.6 2.4 L22.2 4 L23.6 5.8 L19.8 7 Z" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <circle cx="19.6" cy="0.8" r="0.6" fill={p.accent2} stroke={p.line} strokeWidth="0.3" />
            {/* Crest fan */}
            <path
              d="M6.6 6.4 C6.8 2.4 10.2 1.2 12 1 C13.8 1.2 17.2 2.4 17.4 6.4 C15.2 4.8 8.8 4.8 6.6 6.4 Z"
              fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            <path d="M12 1.6 V5 M9.4 2.6 L10 5 M14.6 2.6 L14 5" fill="none" stroke={p.ink} strokeWidth="0.3" strokeLinecap="round" />
            {/* Great helm */}
            <path
              d="M5.8 19 V10.4 C5.8 7 8.4 5.4 12 5.4 C15.6 5.4 18.2 7 18.2 10.4 V19 Z"
              fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            {/* T-visor */}
            <rect x="7" y="9.4" width="10" height="1.4" rx="0.5" fill={p.ink} />
            <rect x="11.3" y="10.6" width="1.4" height="3.8" rx="0.5" fill={p.ink} />
            {/* Breaths + rivets */}
            <path d="M8.6 14.4 H9.8 M14.2 14.4 H15.4 M8.6 16 H9.8 M14.2 16 H15.4" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            <circle cx="7.2" cy="12.2" r="0.4" fill={p.detail} />
            <circle cx="16.8" cy="12.2" r="0.4" fill={p.detail} />
            {/* Gorget band */}
            <rect x="5.2" y="17" width="13.6" height="2" rx="0.4" fill={p.accent} stroke={p.line} strokeWidth="0.4" />
          </>
        );

      /**
       * 5. AJX - "The Phase Assassin"
       * Two crossed phase daggers split by a glitch rift.
       */
      case 'ajx':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Glitch slices */}
            <path
              d="M1.6 6.4 H6 M18 7.2 H22.4 M1.2 12.6 H4.6 M19.6 13.4 H22.8 M3 16.6 H6.6 M17.6 4 H20.4"
              fill="none" stroke={p.accent} strokeWidth="0.6" strokeLinecap="round"
            />
            {/* Dagger A (left lean, filled accent) */}
            <g transform="rotate(-25 12 10.4)">
              <path d="M12 1 L14.2 11.6 L12 13.2 L9.8 11.6 Z" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
              <path d="M12 2.4 V11.6" fill="none" stroke={p.ink} strokeWidth="0.3" strokeLinecap="round" />
              <rect x="8.6" y="13" width="6.8" height="1.2" rx="0.4" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
              <rect x="11.1" y="14.2" width="1.8" height="3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
              <circle cx="12" cy="18" r="1.1" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            </g>
            {/* Dagger B (right lean, hollow) */}
            <g transform="rotate(25 12 10.4)">
              <path d="M12 1 L14.2 11.6 L12 13.2 L9.8 11.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
              <path d="M12 2.4 V11.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
              <rect x="8.6" y="13" width="6.8" height="1.2" rx="0.4" fill={p.accent} stroke={p.line} strokeWidth="0.4" />
              <rect x="11.1" y="14.2" width="1.8" height="3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
              <circle cx="12" cy="18" r="1.1" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            </g>
            {/* Central rift */}
            <path
              d="M12 0.8 L11 3.6 L13 5.6 L11 8 L13.2 10.4 L11.2 13 L12.8 15.6 L12 18.6"
              fill="none" stroke={p.accent2} strokeWidth="0.45" strokeLinejoin="miter" strokeLinecap="round"
            />
            <polygon points="12,8.2 13.2,10.4 12,12.6 10.8,10.4" fill={p.ink} />
          </>
        );

      /**
       * 6. YJKSTRA - "The Pathfinder"
       * Hexagonal node lattice with a glowing route and direction arrow.
       */
      case 'yjkstra':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Hex body */}
            <polygon
              points="12,1.4 20.6,6.4 20.6,15.6 12,19 3.4,15.6 3.4,6.4"
              fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            {/* Lattice edges */}
            <path
              d="M6 6.8 L9.4 9.8 M6 6.8 L12 5.2 M12 5.2 L9.4 9.8 M12 5.2 L18 6.8 M9.4 9.8 L12.2 16.2 M14.6 12.6 L12.2 16.2 M14.6 12.6 L18 15.2 M6.4 14.6 L12.2 16.2 M18 6.8 L18 15.2 M6 6.8 L6.4 14.6"
              fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round"
            />
            {/* Route */}
            <path d="M6.4 14.6 L9.4 9.8 L14.6 12.6 L17.7 7.3" fill="none" stroke={p.accent} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
            <polygon points="18.8,5.4 18.9,8 16.5,6.6" fill={p.accent} stroke={p.line} strokeWidth="0.3" strokeLinejoin="round" />
            {/* Nodes */}
            <circle cx="6" cy="6.8" r="1" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <circle cx="12" cy="5.2" r="1" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <circle cx="18" cy="15.2" r="1" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <circle cx="12.2" cy="16.2" r="1" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <circle cx="18" cy="6.8" r="0.01" fill="none" />
            <circle cx="6.4" cy="14.6" r="1.3" fill={p.accent2} stroke={p.line} strokeWidth="0.4" />
            <circle cx="9.4" cy="9.8" r="1.2" fill={p.accent} stroke={p.line} strokeWidth="0.4" />
            <circle cx="14.6" cy="12.6" r="1.2" fill={p.accent} stroke={p.line} strokeWidth="0.4" />
            <circle cx="6.4" cy="14.6" r="0.4" fill={p.ink} />
          </>
        );

      /**
       * 7. IRONCLAD WARDEN - "Wall Tank"
       * Wide crenellated bastion, scaled iron plates, kite-shield emblem.
       */
      case 'ironcladWarden':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Body */}
            <rect x="2.6" y="9.4" width="18.8" height="9.6" rx="0.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Battlements */}
            <polygon
              points="3,9.6 3,3.8 6,3.8 6,6 8.6,6 8.6,3.8 10.6,3.8 10.6,6 13.4,6 13.4,3.8 15.4,3.8 15.4,6 18,6 18,3.8 21,3.8 21,9.6"
              fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            <path d="M3 8 H21" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Interlocking iron plates */}
            <path
              d="M3 11.6 Q4.5 13.8 6 11.6 Q7.5 13.8 9 11.6 Q10.5 13.8 12 11.6 Q13.5 13.8 15 11.6 Q16.5 13.8 18 11.6 Q19.5 13.8 21 11.6"
              fill="none" stroke={p.detail} strokeWidth="0.35" strokeLinecap="round"
            />
            <path
              d="M3 15.2 Q4.5 17.4 6 15.2 Q7.5 17.4 9 15.2 Q10.5 17.4 12 15.2 Q13.5 17.4 15 15.2 Q16.5 17.4 18 15.2 Q19.5 17.4 21 15.2"
              fill="none" stroke={p.detail} strokeWidth="0.35" strokeLinecap="round"
            />
            {/* Arrow slits */}
            <rect x="4.2" y="4.8" width="0.8" height="2.4" fill={p.ink} />
            <rect x="19" y="4.8" width="0.8" height="2.4" fill={p.ink} />
            {/* Kite shield emblem */}
            <path
              d="M9.2 9.8 H14.8 V14.2 C14.8 16.6 13.4 18 12 18.8 C10.6 18 9.2 16.6 9.2 14.2 Z"
              fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            <path d="M12 10.4 V18.2 M9.6 13 H14.4" fill="none" stroke={p.ink} strokeWidth="0.3" strokeLinecap="round" />
            {/* Rivets */}
            <circle cx="4.2" cy="17.6" r="0.4" fill={p.detail} />
            <circle cx="19.8" cy="17.6" r="0.4" fill={p.detail} />
          </>
        );

      /**
       * 8. BLACKMONKEY - "The Trickster"
       * Sun-wukong mask: golden fillet, twin plumes, curling tail.
       */
      case 'blackMonkey':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Tail (outlined stroke) */}
            <path d="M16 18.6 C20.8 19 23 16.2 22.2 13.8 C21.6 12.2 19.8 12.6 20 14" fill="none" stroke={p.line} strokeWidth="2" strokeLinecap="round" />
            <path d="M16 18.6 C20.8 19 23 16.2 22.2 13.8 C21.6 12.2 19.8 12.6 20 14" fill="none" stroke={p.accent} strokeWidth="1.2" strokeLinecap="round" />
            {/* Plumes */}
            <path d="M8.2 7.2 C4.6 4.6 5.4 1.8 8 0.6 C7.8 2.8 9 4.4 10.4 6" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <path d="M15.8 7.2 C19.4 4.6 18.6 1.8 16 0.6 C16.2 2.8 15 4.4 13.6 6" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            {/* Ears */}
            <circle cx="4.8" cy="10.4" r="2.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <circle cx="19.2" cy="10.4" r="2.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <circle cx="4.8" cy="10.4" r="1" fill={p.accent2} stroke={p.detail} strokeWidth="0.3" />
            <circle cx="19.2" cy="10.4" r="1" fill={p.accent2} stroke={p.detail} strokeWidth="0.3" />
            {/* Head */}
            <path
              d="M12 4.8 C16.8 4.8 18.4 8.4 18.2 12 C18 16 15.4 19 12 19 C8.6 19 6 16 5.8 12 C5.6 8.4 7.2 4.8 12 4.8 Z"
              fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            {/* Muzzle mask */}
            <path
              d="M12 10.4 C14.4 8.8 16.6 10.4 16 12.8 C15.6 15 13.8 16.4 12 18.4 C10.2 16.4 8.4 15 8 12.8 C7.4 10.4 9.6 8.8 12 10.4 Z"
              fill={p.accent2} fillOpacity="0.55" stroke={p.detail} strokeWidth="0.3" strokeLinejoin="round"
            />
            {/* Eyes: sly slants */}
            <path d="M8.2 11 L10.8 11.8 L10.2 12.6 Z M15.8 11 L13.2 11.8 L13.8 12.6 Z" fill={p.ink} />
            {/* Nose + grin */}
            <path d="M11.2 14 H12.8 M10.4 15.8 C11.4 16.6 12.6 16.6 13.6 15.8" fill="none" stroke={p.detail} strokeWidth="0.35" strokeLinecap="round" />
            {/* Golden fillet */}
            <path d="M6 8.4 C9 6.8 15 6.8 18 8.4 L17.8 10 C15 8.6 9 8.6 6.2 10 Z" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <circle cx="12" cy="7.9" r="0.9" fill={p.accent2} stroke={p.line} strokeWidth="0.3" />
          </>
        );

      /**
       * 9. PARTY KING KONG - "The Brute"
       * Huge spiked gauntlet fist with seismic impact marks closing in.
       */
      case 'partyKingKong':
        return (
          <>
            {renderBase(p, isWhite)}
            {/* Inward impact chevrons */}
            <path d="M0.8 6.4 L3.2 8.6 L0.8 10.8 M23.2 6.4 L20.8 8.6 L23.2 10.8" fill="none" stroke={p.accent} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1.4 15.4 L3.2 14.6 L3.8 16.2 M22.6 15.4 L20.8 14.6 L20.2 16.2" fill="none" stroke={p.accent2} strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Spikes */}
            <polygon points="5.9,7.4 6.9,3.6 7.9,7.4" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <polygon points="9.3,7 10.3,2.4 11.3,7" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <polygon points="12.7,7 13.7,2.4 14.7,7" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <polygon points="16.1,7.4 17.1,3.6 18.1,7.4" fill={p.accent} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            {/* Knuckles */}
            <rect x="5.2" y="6.6" width="3.5" height="6.4" rx="1.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="8.6" y="6.2" width="3.5" height="6.8" rx="1.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="12" y="6.2" width="3.5" height="6.8" rx="1.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="15.4" y="6.6" width="3.5" height="6.4" rx="1.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Palm */}
            <path d="M5.2 11.6 H18.8 V16.4 H5.2 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <path d="M5.4 9.4 H8.4 M8.8 9.4 H11.9 M12.3 9.4 H15.4 M15.6 9.4 H18.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Thumb */}
            <path
              d="M4.8 12.8 C4.8 11.6 6.6 11.4 9.6 12.2 C12 12.8 13 14 12.4 15 C11.6 16.2 7.8 16 6.2 15.4 C5.2 15 4.8 14 4.8 12.8 Z"
              fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
            />
            <path d="M6.4 13.6 C7.6 13.4 9 13.6 10 14.2" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Gauntlet cuff */}
            <rect x="4.6" y="15.8" width="14.8" height="3.2" rx="0.7" fill={p.accent} stroke={p.line} strokeWidth="0.4" />
            <path d="M8.4 16 V18.8 M12 16 V18.8 M15.6 16 V18.8" fill="none" stroke={p.ink} strokeWidth="0.3" strokeLinecap="round" />
          </>
        );

      default:
        return null;
    }
  };

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
      {renderSvgContent()}
    </svg>
  );
};
