import React from 'react';
import { PieceType, PieceColor, CullingPieceType } from '../types/game';
import { renderCullingPieceSvg } from './CullingPiece';

export interface ChessPieceProps {
  type: PieceType | CullingPieceType;
  color: PieceColor;
  className?: string;
}

/**
 * ============================================================================
 * CHESS PIECE CLASSIC DESIGN - same artwork language as the Culling pieces
 * ============================================================================
 * Classic chess silhouettes drawn with the Culling Game finish:
 * - White pieces: crisp `#ffffff` fill, deep navy `#1a2236` line art and details
 * - Black pieces: obsidian `#090d16` fill, thin pale outline, pale details
 * - 0.4 outlines, hairline 0.3 detail strokes, two-tier plinth, soft drop shadow
 * - One accent only: red for the Communist (cap, star and sash)
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

export const ChessPieceClassic: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'white';
  const p = isWhite ? WHITE : BLACK;

  const renderSvgContent = () => {
    switch (type) {
      /**
       * 1. PAWN
       * Round head, collar ring, tapered body.
       */
      case 'pawn':
        return (
          <>
            {/* Two-tier plinth */}
            <rect x="6" y="20.6" width="12" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="7.3" y="19.5" width="9.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Figure scaled to 86%, anchored on the plinth (x = 12, y = 19.5) */}
            <g transform="translate(1.68 2.73) scale(0.86)">
              {/* Body */}
              <path d="M9.7 11.4 H14.3 C14.5 14.4 15.8 17.2 16.6 19.5 H7.4 C8.2 17.2 9.5 14.4 9.7 11.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
              <path d="M9.2 16.8 C11 17.4 13 17.4 14.8 16.8" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
              {/* Collar */}
              <rect x="8.7" y="10.3" width="6.6" height="1.2" rx="0.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
              {/* Head */}
              <circle cx="12" cy="6.7" r="3.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
              <path d="M10.2 5.6 C10.7 4.9 11.4 4.6 12.2 4.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            </g>
          </>
        );

      /**
       * 2. KNIGHT
       * Horse head in profile with mane, ear, eye and nostril.
       */
      case 'knight':
        return (
          <>
            {/* Two-tier plinth */}
            <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Horse head, neck and chest */}
            <path d="M7.2 19.5 C7.4 16.2 8.6 14.6 10.2 12.6 C9 13 7.8 13.4 6.9 13.2 C5.9 13 5.1 12 4.9 11 L5.1 9.8 L7.4 6.4 L7.6 3.4 L9.4 4.8 C9.8 4 10.4 3.2 11 2.8 L11.6 4.4 C15.2 4.6 18 7.6 18 12.2 C18 15 17.8 17.4 17.4 19.5 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            {/* Mane */}
            <path d="M15.6 6.4 C16.6 8.4 16.8 10.8 16.2 13 M13.4 5.6 C14.6 7.4 15 9.6 14.4 11.8 M11.6 5.2 C12.4 6.4 12.8 8 12.4 9.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Bridle, eye, nostril, mouth */}
            <path d="M7.6 8 L9.4 11.2 M5.2 10.6 C6.4 10.5 7.6 11.2 8.4 12" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            <circle cx="8.3" cy="7.6" r="0.6" fill={p.ink} />
            <ellipse cx="5.5" cy="10.5" rx="0.28" ry="0.45" fill={p.ink} />
            <path d="M5.4 12.2 C6.2 12.6 7 12.7 7.8 12.5" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          </>
        );

      /**
       * 3. BISHOP
       * Pointed mitre with diagonal slit, ball finial, flared collar.
       */
      case 'bishop':
        return (
          <>
            {/* Two-tier plinth */}
            <rect x="5.5" y="20.6" width="13" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="6.8" y="19.5" width="10.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Body */}
            <path d="M9.5 11.4 H14.5 C14.7 14 15.8 16.8 16.4 19.5 H7.6 C8.2 16.8 9.3 14 9.5 11.4 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <path d="M9.4 16.6 C11 17.2 13 17.2 14.6 16.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Collar */}
            <rect x="8.4" y="10.4" width="7.2" height="1.2" rx="0.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Mitre */}
            <path d="M12 3.6 C14.8 4.8 16 7.2 16 8.6 C16 10 14.4 10.4 12 10.4 C9.6 10.4 8 10 8 8.6 C8 7.2 9.2 4.8 12 3.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <path d="M13.4 5.4 L10.6 8.6" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
            {/* Finial */}
            <circle cx="12" cy="2.6" r="1.1" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
          </>
        );

      /**
       * 4. ROOK
       * Crenellated tower with brick courses and ledge.
       */
      case 'rook':
        return (
          <>
            {/* Two-tier plinth */}
            <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Tower body */}
            <path d="M8.6 11.4 H15.4 L16.4 19.5 H7.6 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <path d="M9 14.2 H15 M8.7 16.8 H15.3 M12 11.6 V14.2 M10.4 14.4 V16.6 M13.6 14.4 V16.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Ledge */}
            <rect x="7" y="10.2" width="10" height="1.3" rx="0.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Battlements */}
            <polygon points="7.4,10.2 7.4,4.6 9.5,4.6 9.5,6.4 10.9,6.4 10.9,4.6 13.1,4.6 13.1,6.4 14.5,6.4 14.5,4.6 16.6,4.6 16.6,10.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <path d="M7.4 8 H16.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
          </>
        );


/**
 * 5. QUEEN
 * Tall, symmetrical five-point crown.
 * Wide upper tips, narrow waist, flared base.
 */
case 'queen':
  return (
    <>
      {/* Two-tier plinth */}
      <rect x="5" y="20.6" width="14" height="1.4" rx="0.2"
        fill={p.fill} stroke={p.line} strokeWidth="0.4" />
      <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2"
        fill={p.fill} stroke={p.line} strokeWidth="0.4" />

      {/* Tall crown: wide top, narrow waist, wide base */}
      <path
        d="M6.8 19.5
           L3.8 7.8
           L7.5 11.4
           L7.9 6.8
           L10.1 10.5
           L12 4.5
           L13.9 10.5
           L16.1 6.8
           L16.5 11.4
           L20.2 7.8
           L17.2 19.5
           Z"
        fill={p.fill}
        stroke={p.line}
        strokeWidth="0.4"
        strokeLinejoin="round"
      />

      {/* Four symmetrical diamond cutouts */}
      <path d="M7.5 16.6 Q6.3 15.1 7.5 13.6 Q8.7 15.1 7.5 16.6 Z"
        fill={p.ink} />
      <path d="M10.1 16.3 Q8.8 14.3 10.1 12.3 Q11.4 14.3 10.1 16.3 Z"
        fill={p.ink} />
      <path d="M13.9 16.3 Q12.6 14.3 13.9 12.3 Q15.2 14.3 13.9 16.3 Z"
        fill={p.ink} />
      <path d="M16.5 16.6 Q15.3 15.1 16.5 13.6 Q17.7 15.1 16.5 16.6 Z"
        fill={p.ink} />

      {/* Five equally spaced ball tips */}
      <circle cx="3.8" cy="7.5" r="0.9"
        fill={p.fill} stroke={p.line} strokeWidth="0.4" />
      <circle cx="7.9" cy="6.4" r="0.9"
        fill={p.fill} stroke={p.line} strokeWidth="0.4" />
      <circle cx="12" cy="4.1" r="1.05"
        fill={p.fill} stroke={p.line} strokeWidth="0.4" />
      <circle cx="16.1" cy="6.4" r="0.9"
        fill={p.fill} stroke={p.line} strokeWidth="0.4" />
      <circle cx="20.2" cy="7.5" r="0.9"
        fill={p.fill} stroke={p.line} strokeWidth="0.4" />
    </>
  );


       /**
 * 6. KING
 * Heart-shaped dominant crown: two bulging lobes, central column + chunky cross,
 * rounded cut-outs, sitting on a low wide slab.
 */
        case 'king':
          return (
            <>
              {/* Low wide slab */}
              <rect x="3.2" y="19.2" width="17.6" height="2.6" rx="0.6" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
              <path d="M4 20.1 H20" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />

              {/* Crown body with two cut-out holes (evenodd) */}
              <path
                fillRule="evenodd"
                fill={p.fill}
                stroke={p.line}
                strokeWidth="0.4"
                strokeLinejoin="round"
                d="
                  M7.4 19.2
                  C6.6 17.4 3.4 15.8 3 12.4
                  C2.7 9.4 4.9 7.4 7.6 7.4
                  C9 7.4 10 8 10.4 8.8
                  V5.8 H13.6 V8.8
                  C14 8 15 7.4 16.4 7.4
                  C19.1 7.4 21.3 9.4 21 12.4
                  C20.6 15.8 17.4 17.4 16.6 19.2 Z
                  M6.2 11.6
                  C6.2 10.6 7.4 10.2 8.4 10.6
                  C9.2 10.9 9.8 11.6 9.8 12.6
                  V15
                  C8.2 15 6.2 13.6 6.2 11.6 Z
                  M17.8 11.6
                  C17.8 10.6 16.6 10.2 15.6 10.6
                  C14.8 10.9 14.2 11.6 14.2 12.6
                  V15
                  C15.8 15 17.8 13.6 17.8 11.6 Z
                "
              />

              {/* Lobe highlights + base band */}
              <path
                d="M4.4 11.2 C4.4 9.8 5.6 8.8 7 8.8 M19.6 11.2 C19.6 9.8 18.4 8.8 17 8.8 M8 18.2 H16"
                fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round"
              />

              {/* Chunky cross */}
              <path
                d="M11.2 1.4 H12.8 V2.6 H14.6 V4.2 H12.8 V5.8 H11.2 V4.2 H9.4 V2.6 H11.2 Z"
                fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round"
              />
            </>
          );

      /**
       * 7. PRINCE (extra)
       * Young royal: small three-point crown on a round head, four-point star on the tunic.
       */
      case 'prince':
        return (
          <>
            {/* Two-tier plinth */}
            <rect x="5.5" y="20.6" width="13" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="6.8" y="19.5" width="10.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Tunic */}
            <path d="M9.4 11 H14.6 C14.8 13.8 15.9 16.8 16.5 19.5 H7.5 C8.1 16.8 9.2 13.8 9.4 11 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <polygon points="12,12.8 12.7,14.3 14.2,15 12.7,15.7 12,17.2 11.3,15.7 9.8,15 11.3,14.3" fill={p.ink} />
            {/* Collar */}
            <rect x="8.6" y="10.2" width="6.8" height="1.2" rx="0.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Head */}
            <circle cx="12" cy="7.2" r="3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Little crown */}
            <polygon points="9.3,4.8 9,2.4 10.7,3.6 12,1.6 13.3,3.6 15,2.4 14.7,4.8" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <circle cx="12" cy="1.3" r="0.4" fill={p.ink} />
          </>
        );

      /**
       * 8. COMMUNIST (extra)
       * Capped figure with red star, red sash across the chest.
       */
      case 'communist':
        return (
          <>
            {/* Two-tier plinth */}
            <rect x="5.5" y="20.6" width="13" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="6.8" y="19.5" width="10.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Body */}
            <path d="M9.2 11 H14.8 C15 13.8 16 16.8 16.6 19.5 H7.4 C8 16.8 9 13.8 9.2 11 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Red sash */}
            <path d="M9.2 11.8 L10.6 11 L16.2 18.4 L16.6 19.5 L14.6 19.5 Z" fill={RED} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <path d="M9.5 16 L11.2 19.3" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Collar */}
            <rect x="8.6" y="10.2" width="6.8" height="1.2" rx="0.5" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Head */}
            <circle cx="12" cy="7.4" r="3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <path d="M10.4 8 H11.2 M12.8 8 H13.6" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
            {/* Cap with red star */}
            <path d="M8.8 6.4 C8.8 3.4 10.2 2.6 12 2.6 C13.8 2.6 15.2 3.4 15.2 6.4 Z" fill={RED} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <rect x="8.2" y="6" width="7.6" height="1" rx="0.4" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <polygon points="12,3.4 12.35,4.3 13.3,4.35 12.55,4.9 12.8,5.8 12,5.3 11.2,5.8 11.45,4.9 10.7,4.35 11.65,4.3" fill={p.fill} />
          </>
        );

      /**
       * 9. SUPREME ROOK (extra)
       * Rook with a taller central turret topped by a red flag, arched gate.
       */
      case 'supremeRook':
        return (
          <>
            {/* Two-tier plinth */}
            <rect x="4.5" y="20.6" width="15" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="5.8" y="19.5" width="12.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Tower body */}
            <path d="M8.2 11.6 H15.8 L16.8 19.5 H7.2 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <path d="M10.4 19.4 V16 C10.4 14.4 13.6 14.4 13.6 16 V19.4" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
            <path d="M8.6 13.6 H10.2 M13.8 13.6 H15.4 M8.4 16.4 H9.8 M14.2 16.4 H15.6" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Ledge */}
            <rect x="6.6" y="10.4" width="10.8" height="1.4" rx="0.3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Battlements with central turret */}
            <polygon points="6.8,10.4 6.8,5.4 8.6,5.4 8.6,7 9.9,7 9.9,4.2 14.1,4.2 14.1,7 15.4,7 15.4,5.4 17.2,5.4 17.2,10.4" fill={p.fill} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
            <rect x="11.6" y="5.2" width="0.8" height="1.8" fill={p.ink} />
            <path d="M6.8 8.4 H17.2" fill="none" stroke={p.detail} strokeWidth="0.3" strokeLinecap="round" />
            {/* Red flag */}
            <path d="M12 0.6 V4.2" fill="none" stroke={p.line} strokeWidth="0.5" strokeLinecap="round" />
            <path d="M12.25 0.9 C13.4 0.4 14.4 1.6 15.6 1.2 V2.9 C14.4 3.3 13.4 2.1 12.25 2.6 Z" fill={RED} stroke={p.line} strokeWidth="0.4" strokeLinejoin="round" />
          </>
        );









      /**
       * 10. PRIEST (extra)
       * Robed figure with stole and cross, skullcap and halo ring.
       */
      case 'priest':
        return (
          <>
            {/* Two-tier plinth */}
            <rect x="5" y="20.6" width="14" height="1.4" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <rect x="6.3" y="19.5" width="11.4" height="1.1" rx="0.2" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            {/* Robe */}
            <path d="M9 10.8 H15 C15.4 13.6 16.8 16.6 17.4 19.5 H6.6 C7.2 16.6 8.6 13.6 9 10.8 Z" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <path d="M11 11.4 L10.6 19.2 M13 11.4 L13.4 19.2" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
            <path d="M12 13 V17.2 M10.6 14.4 H13.4" fill="none" stroke={p.ink} strokeWidth="0.6" strokeLinecap="round" />
            {/* Roman collar */}
            <rect x="10.2" y="9.6" width="3.6" height="1.3" rx="0.4" fill={p.ink} />
            {/* Head */}
            <circle cx="12" cy="6.4" r="3" fill={p.fill} stroke={p.line} strokeWidth="0.4" />
            <path d="M9.2 5.4 C10 3.8 14 3.8 14.8 5.4" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
            <path d="M10.4 7.4 H11.2 M12.8 7.4 H13.6" fill="none" stroke={p.detail} strokeWidth="0.4" strokeLinecap="round" />
            {/* Halo */}
            <ellipse cx="12" cy="1.9" rx="2.6" ry="0.7" fill="none" stroke={p.line} strokeWidth="0.45" />
          </>
        );

      case 'culling_gojo':
      case 'culling_sukuna':
      case 'culling_yuji':
      case 'culling_kenjaku':
      case 'culling_mechamaru':
      case 'culling_panda':
      case 'culling_nanami':
      case 'culling_maki':
      case 'culling_hakari':
      case 'culling_uraume':
      case 'culling_yorozu':
      case 'culling_reggie':
      case 'culling_naoya':
      case 'culling_kurourushi':
      case 'culling_pawn':
      case 'culling_swarm':
        return renderCullingPieceSvg(type, color);

      default:
        return null;
    }
  };
 
  return (
    <svg
      viewBox="0 0 24 24"
      strokeLinejoin="round"
      strokeLinecap="round"
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