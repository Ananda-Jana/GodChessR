import React from 'react';
import { CullingPieceType, CullingPieceColor } from '../types/cullingGame';

interface CullingPieceProps {
  type: CullingPieceType;
  color: CullingPieceColor;
  className?: string;
}

/**
 * Culling Game Chess Pieces - reference-sheet artwork.
 *
 * Every character belongs to ONE side only (shown in its comment header), so
 * each character is drawn in its canonical look regardless of the colour
 * argument. Only the Culling Pawn and the Cursed Roach Swarm follow `color`.
 *
 * - WHITE side: paper-white fill, deep navy line art, navy details
 * - BLACK side: obsidian fill, thin pale outline, pale details
 * - Accents: red (Sukuna mask, Yuji hoodie collar, Yorozu flower, Kurourushi eyes)
 *            and blue (Gojo blindfold weave, Mechamaru lens)
 *
 * viewBox (24x24), piece footprint, type ids and exports are unchanged.
 */
const WHITE = {
  fill: '#ffffff',
  line: '#1a2236',
  detail: '#1a2236',
  ink: '#1a2236',
};
const BLACK = {
  fill: '#090d16',
  line: 'rgba(241, 245, 249, 0.75)',
  detail: 'rgba(241, 245, 249, 0.85)',
  ink: 'rgba(241, 245, 249, 0.85)',
};
const RED = '#d7263d';
const BLUE = '#2f6fe4';

export function renderCullingPieceSvg(type: string, color: string) {
  const isWhite = color === 'white';

  switch (type) {
    /**
     * 1. SATORU GOJO (King-equivalent, White)
     * Spiky white hair, blue-crossed black blindfold, cross finial, infinity robe.
     */
    case 'culling_gojo': {
      const p = WHITE;
      return (
        <g id="gojo_king">
          {/* Two-tier plinth */}
          <rect x="4.5" y="20.6" width="15" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="5.8" y="19.5" width="12.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Robe */}
          <path d="M9.4 10.2 H14.6 C14.9 13 16.6 16.2 17.2 19.5 H6.8 C7.4 16.2 9.1 13 9.4 10.2 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M10.6 10.2 L12 11.6 L13.4 10.2" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Infinity symbol */}
          <path d="M12 15.4 C11.2 14 9.5 14 9.5 15.4 C9.5 16.8 11.2 16.8 12 15.4 C12.8 14 14.5 14 14.5 15.4 C14.5 16.8 12.8 16.8 12 15.4 Z" fill="none" stroke={p.line} strokeWidth="0.7" />
          {/* Face */}
          <path d="M8.4 6.4 C8.4 9 9.8 10.4 12 10.4 C14.2 10.4 15.6 9 15.6 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Blindfold */}
          <rect x="8.3" y="6.5" width="7.4" height="1.9" rx="0.4" fill={p.ink} />
          <path d="M9 7.1 L15 8 M9 8 L15 7.1" fill="none" stroke={BLUE} strokeWidth="0.35" strokeLinecap="round" />
          {/* Spiky hair */}
          <polygon points="7.6,7 7,5.2 8.2,5.6 7.9,3.9 9.4,4.7 9.8,3.2 11,4.3 12,2.8 13,4.3 14.2,3.2 14.6,4.7 16.1,3.9 15.8,5.6 17,5.2 16.4,7 15,6 13.6,5.6 12,6.2 10.4,5.6 9,6" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M10 4.6 L10.5 5.6 M12 4.2 L12 5.6 M14 4.6 L13.5 5.6 M8.6 5.6 L9 6.2 M15.4 5.6 L15 6.2" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          {/* King cross finial */}
          <path d="M12 0.5 V2.8 M10.9 1.3 H13.1" fill="none" stroke={p.line} strokeWidth="0.7" strokeLinecap="square" />
        </g>
      );
    }

    /**
     * 2. RYOMEN SUKUNA (King-equivalent, Black)
     * Horned demon crown, red cursed mask and red chest markings.
     */
    case 'culling_sukuna': {
      const p = BLACK;
      return (
        <g id="sukuna_king">
          {/* Two-tier plinth */}
          <rect x="4.5" y="20.6" width="15" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="5.8" y="19.5" width="12.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Robe */}
          <path d="M9.4 10.2 H14.6 C14.9 13 16.6 16.2 17.2 19.5 H6.8 C7.4 16.2 9.1 13 9.4 10.2 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M9.6 10.4 L12 13.2 L14.4 10.4" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Red chest sigil */}
          <path d="M12 12.8 V15.4" fill="none" stroke={RED} strokeWidth="0.6" strokeLinecap="round" />
          <path d="M12 14.8 C10.4 15.6 10 17.2 12 18.6 C14 17.2 13.6 15.6 12 14.8 Z" fill="none" stroke={RED} strokeWidth="0.5" />
          <path d="M10.2 13.2 C9.4 14.4 9.8 15.8 10.6 16.4 M13.8 13.2 C14.6 14.4 14.2 15.8 13.4 16.4" fill="none" stroke={RED} strokeWidth="0.4" strokeLinecap="round" />
          {/* Outer curved horns */}
          <path d="M8.8 6.2 C6.8 5.6 6.4 3.2 7.4 1.2 C7.8 3 8.8 4 9.8 4.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M15.2 6.2 C17.2 5.6 17.6 3.2 16.6 1.2 C16.2 3 15.2 4 14.2 4.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          {/* Tall central horns */}
          <path d="M10.4 4.6 L10 0.6 L11.9 3.8 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M13.6 4.6 L14 0.6 L12.1 3.8 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          {/* Head */}
          <ellipse cx="12" cy="7.3" rx="3.5" ry="3.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Red cursed mask */}
          <path d="M9.1 6 C9.4 5.4 14.6 5.4 14.9 6 C15.1 8.4 13.8 10.2 12 10.6 C10.2 10.2 8.9 8.4 9.1 6 Z" fill={RED} />
          <path d="M9.8 6.9 L11.3 7.4 M14.2 6.9 L12.7 7.4 M10.6 9.2 H13.4 M12 5.6 V8" fill="none" stroke="#090d16" strokeWidth="0.45" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 3. YUJI ITADORI (Queen-equivalent, White)
     * Spiky hair, RED hoodie collar with buttons, sunburst emblem.
     */
    case 'culling_yuji': {
      const p = WHITE;
      return (
        <g id="yuji_queen">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Torso */}
          <path d="M8.8 10.6 H15.2 C15.4 13 16.8 16.2 17.4 19.5 H6.6 C7.2 16.2 8.6 13 8.8 10.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Sunburst emblem */}
          <circle cx="12" cy="15.9" r="0.9" fill={p.ink} />
          <path d="M12 13.7 V14.6 M12 17.2 V18.1 M9.8 15.9 H10.7 M13.3 15.9 H14.2 M10.5 14.4 L11.1 15 M12.9 16.8 L13.5 17.4 M13.5 14.4 L12.9 15 M11.1 16.8 L10.5 17.4" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Face */}
          <path d="M8.8 6.4 C8.8 8.8 10 9.8 12 9.8 C14 9.8 15.2 8.8 15.2 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Red hoodie collar */}
          <path d="M7.9 10.2 C8 9.5 9.6 9.2 12 9.2 C14.4 9.2 16 9.5 16.1 10.2 L16.5 12.4 C15 13.3 9 13.3 7.5 12.4 Z" fill={RED} stroke={p.line} strokeWidth="0.5" strokeLinejoin="round" />
          <path d="M8.6 10.5 C10 11.3 14 11.3 15.4 10.5" fill="none" stroke={p.line} strokeWidth="0.3" />
          <circle cx="12" cy="11.4" r="0.35" fill={p.fill} stroke={p.line} strokeWidth="0.25" />
          <circle cx="12" cy="12.4" r="0.35" fill={p.fill} stroke={p.line} strokeWidth="0.25" />
          {/* Spiky hair */}
          <polygon points="8.5,7 7.4,5.8 8.2,5.4 7.5,3.8 9.2,4.4 9.4,2.8 10.8,3.8 11.6,2.2 12.6,3.6 13.8,2.4 14.4,4 16,3.4 15.8,5 16.8,5.4 15.8,6.8 15.5,7 14.6,5.6 13.2,5.4 12,6 10.6,5.4 9.4,5.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M10 4.4 L10.4 5.4 M12 3.6 L12 5 M14 4.2 L13.6 5.2" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 4. KENJAKU (Queen-equivalent, Black)
     * Top bun, long hair, forehead stitches, earrings, crossed robe.
     */
    case 'culling_kenjaku': {
      const p = BLACK;
      return (
        <g id="kenjaku_queen">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Robe */}
          <path d="M8.8 10.6 H15.2 C15.4 13 16.8 16.2 17.4 19.5 H6.6 C7.2 16.2 8.6 13 8.8 10.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M9.2 10.8 L12 15 L14.8 10.8 M9.8 15.6 L12 12.8 L14.2 15.6 M8.6 15.2 L11.2 19.4 M15.4 15.2 L12.8 19.4" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Long hair */}
          <path d="M8.7 4.4 C6.9 6 6.7 10 7 13 C7.2 14.6 6.8 15.8 6.6 17 C8.5 15.6 8.9 12.6 8.9 10 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M15.3 4.4 C17.1 6 17.3 10 17 13 C16.8 14.6 17.2 15.8 17.4 17 C15.5 15.6 15.1 12.6 15.1 10 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M7.8 6 C7.4 9 7.6 13 7.3 16 M16.2 6 C16.6 9 16.4 13 16.7 16" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          {/* Head */}
          <path d="M8.8 6.8 C8.8 3.6 10.2 3.2 12 3.2 C13.8 3.2 15.2 3.6 15.2 6.8 C15.2 9 13.8 10.4 12 10.4 C10.2 10.4 8.8 9 8.8 6.8 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Top bun */}
          <circle cx="12" cy="1.9" r="1.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M10.8 3.2 H13.2" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Forehead stitches */}
          <path d="M9.2 5 H14.8 M9.8 4.4 V5.6 M10.9 4.4 V5.6 M12 4.4 V5.6 M13.1 4.4 V5.6 M14.2 4.4 V5.6" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Earrings */}
          <circle cx="8.6" cy="8.6" r="0.5" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          <circle cx="15.4" cy="8.6" r="0.5" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 5. KOKICHI MUTA / MECHAMARU (Armored Ranged Attacker, White)
     * Round helmet with blue cyclops lens, ear pods, antenna, strapped armor.
     */
    case 'culling_mechamaru': {
      const p = WHITE;
      return (
        <g id="mechamaru_robot">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Armored torso */}
          <path d="M8 10.8 H16 L17.4 19.5 H6.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M8.4 11 C10 13.2 14 13.4 15.6 11 M9 12.4 L16 17.4 M8.8 11.8 L7.6 15" fill="none" stroke={p.ink} strokeWidth="0.7" strokeLinecap="round" />
          <path d="M7.4 16 L10.4 15 L11.4 17.6 L8.4 18.8 Z" fill={p.ink} strokeLinejoin="round" />
          {/* Neck */}
          <rect x="10.4" y="9.8" width="3.2" height="1.2" fill={p.ink} />
          {/* Antenna */}
          <path d="M15.4 4.4 L15.9 1" fill="none" stroke={p.line} strokeWidth="0.5" strokeLinecap="round" />
          <circle cx="15.9" cy="1.1" r="0.45" fill={p.ink} />
          {/* Ear pods */}
          <rect x="7" y="5.2" width="1.5" height="3" rx="0.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="15.5" y="5.2" width="1.5" height="3" rx="0.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Helmet */}
          <circle cx="12" cy="6.6" r="3.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M9.6 9.1 H14.4" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Cyclops lens */}
          <circle cx="12" cy="6.5" r="1.7" fill={p.fill} stroke={p.line} strokeWidth="0.5" />
          <circle cx="12" cy="6.5" r="1.1" fill={p.ink} />
          <circle cx="12" cy="6.5" r="0.55" fill={BLUE} />
        </g>
      );
    }

    /**
     * 6. KENTO NANAMI (Heavy Orthogonal Attacker, White)
     * Swept-back blond hair, dark sunglasses, suit lapels and navy tie.
     */
    case 'culling_nanami': {
      const p = WHITE;
      return (
        <g id="nanami_cleaver">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Suit */}
          <path d="M8.6 10.6 H15.4 C15.6 13 16.8 16.4 17.4 19.5 H6.6 C7.2 16.4 8.4 13 8.6 10.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M9.2 10.8 L12 16.6 L14.8 10.8 M9 11.2 L10.4 14.6 M15 11.2 L13.6 14.6" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          <circle cx="13.6" cy="17.4" r="0.3" fill={p.ink} />
          {/* Shirt collar and tie */}
          <polygon points="10.1,10 12,11.2 13.9,10 13,9.6 12,10.4 11,9.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <polygon points="12,10.9 11.2,11.8 11.7,15.8 12,16.6 12.3,15.8 12.8,11.8" fill={p.ink} strokeLinejoin="round" />
          {/* Face */}
          <path d="M8.8 6.4 C8.8 8.8 10 10 12 10.2 C14 10 15.2 8.8 15.2 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="8.9" y="6.6" width="2.7" height="1.4" rx="0.6" fill={p.ink} />
          <rect x="12.4" y="6.6" width="2.7" height="1.4" rx="0.6" fill={p.ink} />
          <path d="M11.6 7 H12.4 M11.2 9.2 H12.8" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Swept-back hair */}
          <path d="M8.4 6.6 C7.6 4 9.2 2.2 12 2.2 C14.8 2.2 16.4 4 15.6 6.6 C15.2 5.4 14.4 4.6 12.6 4.4 C11 4.6 9.6 5.4 8.4 6.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M10 3.2 C10.4 3.8 10.6 4.2 10.4 4.8 M12 2.8 C12.4 3.4 12.6 3.8 12.4 4.4 M13.8 3.2 C14 3.6 14.2 4 14 4.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 7. PANDA (Resilient Support, White)
     * Round panda head with ears, eye patches and nose, wrapped scarf and robe sash.
     */
    case 'culling_panda': {
      const p = WHITE;
      return (
        <g id="panda_knight">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Robe */}
          <path d="M8.4 11.2 H15.6 C15.8 13.4 16.8 16.4 17.4 19.5 H6.6 C7.2 16.4 8.2 13.4 8.4 11.2 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M8.8 13.8 L15.8 18.6 M8.2 16.6 L12.4 19.4 M15.8 13 L9.6 17.4" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Wrapped scarf */}
          <path d="M7.8 10.4 C9 11.8 15 11.8 16.2 10.4 L16.5 12.4 C15 13.6 9 13.6 7.5 12.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M8.8 12.4 L15 11.8 M9.6 13.2 L14.4 12.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          {/* Ears */}
          <circle cx="8.2" cy="3.4" r="1.5" fill={p.ink} />
          <circle cx="15.8" cy="3.4" r="1.5" fill={p.ink} />
          {/* Head */}
          <ellipse cx="12" cy="6.6" rx="4.2" ry="3.8" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Eye patches */}
          <ellipse cx="10.1" cy="6.4" rx="1.05" ry="1.6" transform="rotate(20 10.1 6.4)" fill={p.ink} />
          <ellipse cx="13.9" cy="6.4" rx="1.05" ry="1.6" transform="rotate(-20 13.9 6.4)" fill={p.ink} />
          <circle cx="10.3" cy="6.3" r="0.3" fill={p.fill} />
          <circle cx="13.7" cy="6.3" r="0.3" fill={p.fill} />
          {/* Nose and mouth */}
          <path d="M11 8 H13 L12 9 Z" fill={p.ink} strokeLinejoin="round" />
          <path d="M12 9 V9.5 M10.8 9.8 Q12 10.6 13.2 9.8" fill="none" stroke={p.ink} strokeWidth="0.35" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 8. MAKI ZENIN (Agile Close-Combat Support, White)
     * Short bob with side bangs, round glasses, dark scarf, diagonal weapon strap.
     */
    case 'culling_maki': {
      const p = WHITE;
      return (
        <g id="maki_knight">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Robe */}
          <path d="M8.4 11 H15.6 C15.8 13.4 16.8 16.4 17.4 19.5 H6.6 C7.2 16.4 8.2 13.4 8.4 11 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Diagonal strap */}
          <path d="M8.2 13.2 L9.6 12.6 L16.8 18.8 L15.8 19.4 Z" fill={p.ink} strokeLinejoin="round" />
          <path d="M9.4 15.4 L12.4 19.2" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Dark scarf */}
          <path d="M7.8 10.2 C9 11.8 15 11.8 16.2 10.2 L16.6 12.4 C15 13.4 9 13.4 7.4 12.4 Z" fill={p.ink} strokeLinejoin="round" />
          {/* Face */}
          <path d="M8.8 6.4 C8.8 8.8 10 10 12 10.2 C14 10 15.2 8.8 15.2 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <circle cx="10.2" cy="7.3" r="1.1" fill="none" stroke={p.ink} strokeWidth="0.4" />
          <circle cx="13.8" cy="7.3" r="1.1" fill="none" stroke={p.ink} strokeWidth="0.4" />
          <path d="M11.3 7.3 H12.7 M11.4 9.2 H12.6" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Bob with bangs */}
          <path d="M8 9 C7.4 5 8.8 2.6 12 2.6 C15.2 2.6 16.6 5 16 9 C15.6 7.4 15.4 5.8 14.6 5 C13.4 5.6 10.6 5.6 9.4 5 C8.6 5.8 8.4 7.4 8 9 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M10.2 3.4 L10.6 5.2 M12 3 L12 5.4 M13.8 3.4 L13.4 5.2" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 9. KINJI HAKARI (Tactical Magician, White)
     * Very spiky hair, closed eyes, high crossed collar, ringed jackpot emblem.
     */
    case 'culling_hakari': {
      const p = WHITE;
      return (
        <g id="hakari_bishop">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Coat */}
          <path d="M8.6 10.6 H15.4 C15.6 13 16.8 16.4 17.4 19.5 H6.6 C7.2 16.4 8.4 13 8.6 10.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M10 13.8 L14.4 18.8 M9.6 17 L11 19.3" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Jackpot emblem */}
          <circle cx="11.7" cy="15.7" r="1.3" fill="none" stroke={p.detail} strokeWidth="0.4" />
          <circle cx="11.7" cy="15.7" r="0.6" fill="none" stroke={p.detail} strokeWidth="0.3" />
          {/* Face */}
          <path d="M8.8 6.6 C8.8 8.8 10 9.8 12 9.8 C14 9.8 15.2 8.8 15.2 6.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M9.8 7.5 H11 M13 7.5 H14.2 M11.2 9 H12.8" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* High collar */}
          <polygon points="8.2,9.8 10.8,10.8 12,12 13.2,10.8 15.8,9.8 16,11.6 12.8,13.4 11.2,13.4 8,11.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <circle cx="12" cy="12.8" r="0.3" fill={p.ink} />
          {/* Spiky hair */}
          <polygon points="8.6,7 7.4,5.6 8,5.2 7.2,3.4 9,4.2 9,2.4 10.6,3.6 11.4,1.8 12.4,3.2 13.6,1.8 14.2,3.6 15.4,2.4 15.4,4.4 16.8,3.6 16.2,5.4 17,5.8 16,7 15.2,6 13.8,5.4 12,6 10.2,5.4 8.8,6" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M10 4 L10.4 5.2 M12 3.2 L12 5 M14 3.8 L13.6 5" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 10. URAUME (Tactical Magician, Black)
     * Straight bob with bangs, closed eyes, crossed kimono, glacial snowflake.
     */
    case 'culling_uraume': {
      const p = BLACK;
      return (
        <g id="uraume_bishop">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Kimono */}
          <path d="M8.6 10.6 H15.4 C15.6 13 16.8 16.4 17.4 19.5 H6.6 C7.2 16.4 8.4 13 8.6 10.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M9 10.8 L12 13 L15 10.8 M8.4 14.6 L10.2 19.3 M15.6 14.6 L13.8 19.3" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Glacial snowflake */}
          <path d="M9.6 16 H14.4 M10.8 13.92 L13.2 18.08 M13.2 13.92 L10.8 18.08" fill="none" stroke={p.ink} strokeWidth="0.6" strokeLinecap="round" />
          <path d="M10.5 15.4 L9.9 16 L10.5 16.6 M13.5 15.4 L14.1 16 L13.5 16.6 M11 14.6 L11.8 14.8 M13 14.6 L12.2 14.8 M11 17.4 L11.8 17.2 M13 17.4 L12.2 17.2" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          <circle cx="12" cy="16" r="0.45" fill={p.ink} />
          {/* Face */}
          <path d="M9 6.2 C9 8.8 10.2 10.2 12 10.2 C13.8 10.2 15 8.8 15 6.2 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Bob hair */}
          <path d="M7.4 10.2 C6.8 5 8.6 2.4 12 2.4 C15.4 2.4 17.2 5 16.6 10.2 L15.2 10.2 L15.2 6 C13.6 6.5 10.4 6.5 8.8 6 L8.8 10.2 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M12 2.8 V5.6 M10.4 3.2 C9.6 4 9.2 5 9.2 6 M13.6 3.2 C14.4 4 14.8 5 14.8 6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 11. YOROZU (Heavy Support, Black)
     * Long flowing hair, thorn crown, red flower sigil on the robe.
     */
    case 'culling_yorozu': {
      const p = BLACK;
      return (
        <g id="yorozu_construct">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Robe */}
          <path d="M8.6 10.6 H15.4 C15.6 13 16.8 16.4 17.4 19.5 H6.6 C7.2 16.4 8.4 13 8.6 10.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M9.2 10.8 L12 12.6 L14.8 10.8 M8.6 15 L10.6 19.3 M15.4 15 L13.4 19.3" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Red flower sigil */}
          <ellipse cx="12" cy="14.3" rx="0.7" ry="1.3" transform="rotate(0 12 15.6)" fill="none" stroke={RED} strokeWidth="0.4" />
          <ellipse cx="12" cy="14.3" rx="0.7" ry="1.3" transform="rotate(45 12 15.6)" fill="none" stroke={RED} strokeWidth="0.4" />
          <ellipse cx="12" cy="14.3" rx="0.7" ry="1.3" transform="rotate(90 12 15.6)" fill="none" stroke={RED} strokeWidth="0.4" />
          <ellipse cx="12" cy="14.3" rx="0.7" ry="1.3" transform="rotate(135 12 15.6)" fill="none" stroke={RED} strokeWidth="0.4" />
          <ellipse cx="12" cy="14.3" rx="0.7" ry="1.3" transform="rotate(180 12 15.6)" fill="none" stroke={RED} strokeWidth="0.4" />
          <ellipse cx="12" cy="14.3" rx="0.7" ry="1.3" transform="rotate(225 12 15.6)" fill="none" stroke={RED} strokeWidth="0.4" />
          <ellipse cx="12" cy="14.3" rx="0.7" ry="1.3" transform="rotate(270 12 15.6)" fill="none" stroke={RED} strokeWidth="0.4" />
          <ellipse cx="12" cy="14.3" rx="0.7" ry="1.3" transform="rotate(315 12 15.6)" fill="none" stroke={RED} strokeWidth="0.4" />
          <circle cx="12" cy="15.6" r="0.55" fill={RED} />
          {/* Long hair */}
          <path d="M8.6 4.4 C6.8 6 6.6 10 6.8 13 C6.9 15 6.6 17 6.4 18.4 C8.4 17 8.8 14 8.8 11 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M15.4 4.4 C17.2 6 17.4 10 17.2 13 C17.1 15 17.4 17 17.6 18.4 C15.6 17 15.2 14 15.2 11 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M7.8 6 C7.4 9 7.6 13 7.4 16 M16.2 6 C16.6 9 16.4 13 16.6 16" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          {/* Face */}
          <path d="M8.8 6.4 C8.8 8.8 10 10.2 12 10.2 C14 10.2 15.2 8.8 15.2 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M10 7.8 H11.2 M12.8 7.8 H14" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Hair cap */}
          <path d="M8.8 6.4 C8.8 3 10.4 2.6 12 2.6 C13.6 2.6 15.2 3 15.2 6.4 C14 4.6 10 4.6 8.8 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          {/* Thorn crown */}
          <path d="M8.6 4.6 Q10 3.2 11 4.4 T13 4.4 T15.4 4.6" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          <path d="M9.4 3.9 L9 3.1 M11.6 4 L11.8 3.2 M13.6 3.9 L14.2 3.2" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 12. REGGIE STAR (Tactical Support, Black)
     * Short tufted hair, pointed shirt collar, white four-point star.
     */
    case 'culling_reggie': {
      const p = BLACK;
      return (
        <g id="reggie_contract">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Jacket */}
          <path d="M8.6 10.6 H15.4 C15.6 13 16.8 16.4 17.4 19.5 H6.6 C7.2 16.4 8.4 13 8.6 10.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Four-point star */}
          <polygon points="12,14.4 12.5,15.5 13.6,16 12.5,16.5 12,17.6 11.5,16.5 10.4,16 11.5,15.5" fill={p.ink} />
          {/* Face */}
          <path d="M8.8 6.4 C8.8 8.8 10 10 12 10.2 C14 10 15.2 8.8 15.2 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Pointed collar */}
          <polygon points="8.8,10 10.8,11.6 12,10.6 13.2,11.6 15.2,10 15.6,12.6 12,14 8.4,12.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          {/* Tufted hair */}
          <polygon points="8.4,7.2 7.8,5 8.8,3.8 9.4,2.8 11,3 12.2,2.4 13.4,3 15,2.8 15.8,4.2 16.2,5.8 15.6,7.2 14.8,5.6 13.4,5.2 12,5.8 10.6,5.2 9.2,5.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M10 3.6 L10.4 5 M12 3 L12 5 M14 3.6 L13.6 5" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 13. NAOYA ZENIN (Agile Knight Counterpart, Black)
     * Side-swept hair, high collar, diagonal filmstrip slash.
     */
    case 'culling_naoya': {
      const p = BLACK;
      return (
        <g id="naoya_speed">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Robe */}
          <path d="M8.6 10.6 H15.4 C15.6 13 16.8 16.4 17.4 19.5 H6.6 C7.2 16.4 8.4 13 8.6 10.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Diagonal filmstrip slash */}
          <path d="M9 18.6 L14.6 13.6 L15.4 14.4 L9.8 19.2 Z" fill={p.ink} strokeLinejoin="round" />
          <path d="M10.6 17.6 L11.6 18.4 M12 16.4 L13 17.2 M13.4 15.2 L14.4 16" fill="none" stroke={p.fill} strokeWidth="0.5" strokeLinecap="round" />
          {/* Face */}
          <path d="M8.8 6.4 C8.8 8.8 10 10 12 10.2 C14 10 15.2 8.8 15.2 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* High collar */}
          <path d="M8.4 10 C9.6 11.4 14.4 11.4 15.6 10 L16 12.6 C14.4 13.6 9.6 13.6 8 12.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          {/* Side-swept hair */}
          <path d="M8.4 7.4 C7.8 4 9.4 2.6 12 2.6 C14.8 2.6 16.4 4.2 15.6 7.4 C15.2 6.2 14.8 5.4 14 5 C12.6 5.8 10.4 5.6 9 5 C8.8 5.8 8.6 6.6 8.4 7.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M10.2 3.4 L10.4 5 M12 3 L12 5.3 M13.8 3.4 L13.4 5" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
        </g>
      );
    }

    /**
     * 14. KUROURUSHI (Heavy Orthogonal Counterpart, Black)
     * Long hair, curved antennae, red eyes, feather sigil.
     */
    case 'culling_kurourushi': {
      const p = BLACK;
      return (
        <g id="kurourushi_cleaver">
          {/* Two-tier plinth */}
          <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Robe */}
          <path d="M8.6 10.6 H15.4 C15.6 13 16.8 16.4 17.4 19.5 H6.6 C7.2 16.4 8.4 13 8.6 10.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <path d="M9 10.8 L12 13 L15 10.8" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
          {/* Feather sigil */}
          <path d="M10 18.4 C9.8 15 12 13 14.4 12.8 C14.6 15.4 12.8 17.8 10 18.4 Z" fill="none" stroke={p.ink} strokeWidth="0.45" />
          <path d="M10 18.4 L14 13.2 M11.4 16.6 L10.6 15.6 M12.4 15.4 L11.6 14.4 M12.2 16.8 L13.4 16.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          {/* Curved antennae */}
          <path d="M10.2 3.2 C9 1.8 7.2 1.2 6 1.6 M13.8 3.2 C15 1.8 16.8 1.2 18 1.6 M10.8 2.8 L10.2 1.2 M13.2 2.8 L13.8 1.2 M9.2 2.4 L8.4 0.9 M14.8 2.4 L15.6 0.9" fill="none" stroke={p.line} strokeWidth="0.85" strokeLinecap="round" />
          <path d="M10.2 3.2 C9 1.8 7.2 1.2 6 1.6 M13.8 3.2 C15 1.8 16.8 1.2 18 1.6 M10.8 2.8 L10.2 1.2 M13.2 2.8 L13.8 1.2 M9.2 2.4 L8.4 0.9 M14.8 2.4 L15.6 0.9" fill="none" stroke={p.fill} strokeWidth="0.4" strokeLinecap="round" />
          {/* Long hair */}
          <path d="M8.5 4.4 C6.7 6.6 6.7 10 7 13 C7.3 14.4 7 15.8 6.8 17 C8.6 15.6 8.8 12.6 8.8 10 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M15.5 4.4 C17.3 6.6 17.3 10 17 13 C16.7 14.4 17 15.8 17.2 17 C15.4 15.6 15.2 12.6 15.2 10 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M7.8 7 C7.4 10 7.6 13 7.4 15.4 M16.2 7 C16.6 10 16.4 13 16.6 15.4" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          {/* Face */}
          <path d="M8.8 6.4 C8.8 8.8 10 10.2 12 10.2 C14 10.2 15.2 8.8 15.2 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <circle cx="10.2" cy="7.7" r="0.45" fill={RED} />
          <circle cx="13.8" cy="7.7" r="0.45" fill={RED} />
          {/* Hair cap */}
          <path d="M8.8 6.4 C8.8 3 10.4 2.8 12 2.8 C13.6 2.8 15.2 3 15.2 6.4 C14 4.8 10 4.8 8.8 6.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
        </g>
      );
    }

    /**
     * 15. CULLING PAWN (Standard pawn, both sides)
     * Round head marked with II, tall cone body with two diamond marks.
     */
    case 'culling_pawn': {
      const p = isWhite ? WHITE : BLACK;
      return (
        <g id="culling_pawn">
          {/* Two-tier plinth */}
          <rect x="6.5" y="20.6" width="11" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="7.8" y="19.5" width="8.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Cone body */}
          <path d="M9.8 11.2 H14.2 C14.4 14 15.6 17.2 16.4 19.5 H7.6 C8.4 17.2 9.6 14 9.8 11.2 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <polygon points="12,13.6 12.7,14.6 12,15.6 11.3,14.6" fill={p.ink} />
          <polygon points="12,16.4 12.6,17.2 12,18 11.4,17.2" fill={p.ink} />
          {/* Collar */}
          <rect x="9" y="10.4" width="6" height="1.1" rx="0.4" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Head */}
          <circle cx="12" cy="6.8" r="3.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="10.8" y="5.2" width="0.8" height="3.2" fill={p.ink} />
          <rect x="12.4" y="5.2" width="0.8" height="3.2" fill={p.ink} />
        </g>
      );
    }

    /**
     * 16. CURSED ROACH SWARM (Miniature Swarm Unit)
     * Tapering cone of stacked roach bodies, antennae and tiny eyes.
     */
    case 'culling_swarm': {
      const p = isWhite ? WHITE : BLACK;
      return (
        <g id="culling_swarm">
          {/* Two-tier plinth */}
          <rect x="7.5" y="20.6" width="9" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <rect x="8.8" y="19.5" width="6.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Roach bodies */}
          <ellipse cx="8.6" cy="18.2" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="10.3" cy="18.2" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="12" cy="18.2" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="13.7" cy="18.2" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="15.4" cy="18.2" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="9.4" cy="16.3" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="11.1" cy="16.3" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="12.9" cy="16.3" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="14.6" cy="16.3" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="10.1" cy="14.4" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="11.7" cy="14.4" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="13.3" cy="14.4" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="10.7" cy="12.5" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="12.2" cy="12.5" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="13.5" cy="12.5" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="11" cy="10.6" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="12.6" cy="10.6" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="11.4" cy="8.8" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="12.6" cy="8.8" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          <ellipse cx="12" cy="7.2" rx="1.05" ry="1.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          {/* Eyes */}
          <circle cx="10.5" cy="16.2" r="0.22" fill={p.ink} />
          <circle cx="13.4" cy="16.4" r="0.22" fill={p.ink} />
          <circle cx="11.7" cy="14.2" r="0.22" fill={p.ink} />
          <circle cx="12.9" cy="12.4" r="0.22" fill={p.ink} />
          <circle cx="11.2" cy="10.4" r="0.22" fill={p.ink} />
          <circle cx="12.2" cy="8.6" r="0.22" fill={p.ink} />
          <circle cx="9.4" cy="18" r="0.22" fill={p.ink} />
          <circle cx="14.9" cy="18.2" r="0.22" fill={p.ink} />
          {/* Antennae and legs */}
          <path d="M11.6 6 C10.4 4 8.6 2.8 7.2 2.4 M12.4 6 C13.6 4 15.4 2.8 16.8 2.4 M12 5.8 L12 1.8 M11.2 5.2 L10.4 2.2 M12.8 5.2 L13.6 2.2" fill="none" stroke={p.line} strokeWidth="0.85" strokeLinecap="round" />
          <path d="M11.6 6 C10.4 4 8.6 2.8 7.2 2.4 M12.4 6 C13.6 4 15.4 2.8 16.8 2.4 M12 5.8 L12 1.8 M11.2 5.2 L10.4 2.2 M12.8 5.2 L13.6 2.2" fill="none" stroke={p.fill} strokeWidth="0.4" strokeLinecap="round" />
          <path d="M7.6 17.4 L6.6 16.6 M7.8 15.4 L6.8 14.4 M8.6 13.4 L7.8 12.2 M16.4 17.4 L17.4 16.6 M16.2 15.4 L17.2 14.4 M15.4 13.4 L16.2 12.2" fill="none" stroke={p.line} strokeWidth="0.7" strokeLinecap="round" />
          <path d="M7.6 17.4 L6.6 16.6 M7.8 15.4 L6.8 14.4 M8.6 13.4 L7.8 12.2 M16.4 17.4 L17.4 16.6 M16.2 15.4 L17.2 14.4 M15.4 13.4 L16.2 12.2" fill="none" stroke={p.fill} strokeWidth="0.3" strokeLinecap="round" />
        </g>
      );
    }

    default:
      return null;
  }
}

export const CullingPiece: React.FC<CullingPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'white';
  return (
    <svg
      viewBox="0 0 24 24"
      strokeLinejoin="round"
      strokeLinecap="round"
      style={
        !isWhite
          ? { filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.45))' }
          : { filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.25))' }
      }
      className={`${className} select-none pointer-events-none transition-transform duration-150`}
    >
      {renderCullingPieceSvg(type, color)}
    </svg>
  );
};