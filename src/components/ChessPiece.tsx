import React from 'react';
import { PieceType, PieceColor, CullingPieceType } from '../types/game';
import { renderCullingPieceSvg } from './CullingPiece';
 
interface ChessPieceProps {
  type: PieceType | CullingPieceType;
  color: PieceColor;
  className?: string;
}
 
/**
 * ============================================================================
 * CHESS PIECE RENDERING ENGINE & CUSTOMIZATION GUIDE
 * ============================================================================
 * This file (src/components/ChessPiece.tsx) controls the visual rendering of all
 * chess pieces across the board and captured panels.
 *
 * HOW PIECES WORK:
 * - Coordinates: All piece SVGs use a viewBox of "0 0 24 24".
 * - Center is at (12, 12). Top is y=0, bottom is y=24. Left is x=0, right is x=24.
 * - Standard Piece Palette:
 *     - `fillColor`: White piece = '#f8fafc', Black piece = '#1e293b'
 *     - `strokeColor`: White piece = '#64748b', Black piece = '#94a3b8'
 *     - `accentColor`: White piece = '#f59e0b', Black piece = '#38bdf8'
 * - Cute special pieces (priest, prince, supremeRook) use the same fill/stroke
 *   as standard pieces (white side = white, black side = dark), plus:
 *     - `gold`: shared gold details
 *     - `markColor`: head stripe / eyes (navy on white, sky blue on black)
 *     - `princeStarColor`: Prince star (blue on white side, yellow on black side)
 * - Communist is always red on both sides, with no borders.
 *
 * TO REDESIGN ANY PIECE:
 * Simply edit the corresponding `case` block inside `renderSvgContent()`.
 * ============================================================================
 */
export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'white';
  const fillColor = isWhite ? '#f8fafc' : '#1e293b';
  // White pieces get a stroke slightly on the black side (#64748b), black pieces get a stroke on the lighter side (#94a3b8) with soft blur
  const strokeColor = isWhite ? '#64748b' : '#94a3b8';
  const accentColor = isWhite ? '#f59e0b' : '#38bdf8';
 
  // Cute-piece helpers
  const gold = '#fbbf24';
  const markColor = isWhite ? '#1e3a8a' : '#38bdf8';   // head stripe / eyes (blue on white, sky on black)
  const princeStarColor = isWhite ? '#1e3a8a' : '#fbbf24'; // blue star on white side, yellow star on black side
 
  const renderSvgContent = () => {
    switch (type) {
      /**
       * ----------------------------------------------------------------------
       * 1. PAWN DESIGN
       * Head circle at (12, 7), body pyramid from y=11.5 to 18, base at y=20.
       * ----------------------------------------------------------------------
       */
      case 'pawn':
        return (
          <>
            <circle cx="12" cy="7" r="3" fill={fillColor} stroke={strokeColor} strokeWidth="0.75" />
            <path
              d="M8.5 18C8.5 13.5 10 11.5 12 11.5C14 11.5 15.5 13.5 15.5 18H8.5Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.75"
            />
            <path d="M7 20H17V21.5H7V20Z" fill={fillColor} stroke={strokeColor} strokeWidth="0.6" />
          </>
        );
 
      /**
       * ----------------------------------------------------------------------
       * 2. KNIGHT DESIGN
       * Mane and head curve, eye accent at (11, 8.5), pedestal at y=20.5.
       * ----------------------------------------------------------------------
       */
      case 'knight':
        return (
          <>
            {/* Head, neck and body silhouette (faces left) */}
            <path
              d="M7 19.5
                 C7 16 9 14.5 10.2 12.8
                 L7.6 13.4
                 C6.4 13.7 5.4 13.2 4.9 12.2
                 L4.6 10.6
                 C4.7 9.8 5.4 9.2 6.2 8.6
                 L7.4 6.2
                 L7.6 3.8
                 L9.6 5.2
                 C12.8 4.6 16.4 6.8 17.6 11
                 C18.4 14.2 18 17.2 17.5 19.5
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.75"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
 
            {/* Mane flow lines */}
            <path
              d="M15.8 7.2C16.8 9 17 11 16.6 13
                 M13.6 6C15 7.6 15.4 9.6 15 11.4
                 M11.4 5.4C12.6 6.6 13 8.2 12.6 9.6"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.5"
              strokeLinecap="round"
              opacity="0.65"
            />
 
            {/* Forelock */}
            <path
              d="M7.6 6.2C8.6 6.4 9.2 7.2 9.4 8.2"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.5"
              strokeLinecap="round"
              opacity="0.65"
            />
 
            {/* Bridle: cheek strap and noseband */}
            <path
              d="M7.6 8.4L9.2 11.6
                 M4.7 10.8Q6.4 10.6 8.2 12.4"
              fill="none"
              stroke={accentColor}
              strokeWidth="0.5"
              strokeLinecap="round"
            />
 
            {/* Eye with small highlight */}
            <circle cx="8.2" cy="8.6" r="0.9" fill={accentColor} />
            <circle cx="8.5" cy="8.3" r="0.28" fill={fillColor} />
 
            {/* Nostril */}
            <ellipse cx="5.4" cy="11.3" rx="0.3" ry="0.5" fill={strokeColor} opacity="0.8" />
 
            {/* Jewelled collar */}
            <path
              d="M6.2 19.2H17.8V20.5H6.2Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="19.85" r="0.45" fill={accentColor} />
 
            {/* Base */}
            <path
              d="M5.5 20.5H18.5V22H5.5V20.5Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          </>
        );
 
      /**
       * ----------------------------------------------------------------------
       * 3. BISHOP DESIGN
       * Mitre silhouette, top cross / jewel at (12, 3.5), slot at (12, 8-12).
       * ----------------------------------------------------------------------
       */
      case 'bishop':
        return (
          <>
            <path
              d="M12 4L15.5 7.5C17 10 17 13.5 15.5 16.5H8.5C7 13.5 7 10 8.5 7.5L12 4Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.75"
            />
            <circle cx="12" cy="3.5" r="1.5" fill={accentColor} />
            <path d="M12 8V12M10 10H14" stroke={strokeColor} strokeWidth="0.6" strokeLinecap="round" />
            <path d="M6.5 18.5H17.5V21H6.5V18.5Z" fill={fillColor} stroke={strokeColor} strokeWidth="0.6" />
          </>
        );
 
      /**
       * ----------------------------------------------------------------------
       * 4. ROOK DESIGN
       * Crenellated battlements from x=6 to x=18, tower waist, and plinth.
       * ----------------------------------------------------------------------
       */
      case 'rook':
        return (
          <>
            <path
              d="M6 7H9V9H11V7H13V9H15V7H18V10H16.5V17H18V19H6V17H7.5V10H6V7Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
            <path d="M5 20H19V22H5V20Z" fill={fillColor} stroke={strokeColor} strokeWidth="0.6" />
          </>
        );
 
      /**
       * ----------------------------------------------------------------------
       * 5. QUEEN DESIGN
       * 5-pointed diadem crown with accent pearls and pedestal base.
       * ----------------------------------------------------------------------
       */
      case 'queen':
        return (
          <>
            <path
              d="M4 17L2.5 8L7 12L12 4.5L17 12L21.5 8L20 17H4Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            <circle cx="2.5" cy="7" r="1.4" fill={accentColor} />
            <circle cx="7" cy="11" r="1.3" fill={accentColor} />
            <circle cx="12" cy="3.5" r="1.6" fill={accentColor} />
            <circle cx="17" cy="11" r="1.3" fill={accentColor} />
            <circle cx="21.5" cy="7" r="1.4" fill={accentColor} />
            <path d="M4 18.5H20V21.5H4V18.5Z" fill={fillColor} stroke={strokeColor} strokeWidth="0.65" />
          </>
        );
 
      /**
       * ----------------------------------------------------------------------
       * 6. KING DESIGN
       * Crown body with vertical & horizontal cross at top (12, 2.5-6).
       * ----------------------------------------------------------------------
       */
      case 'king':
        return (
          <>
            <path
              d="M6 16.5L4.5 8.5L8.5 12L12 7L15.5 12L19.5 8.5L18 16.5H6Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
            <path d="M12 2.5V6M10.5 4H13.5" stroke={accentColor} strokeWidth="0.9" strokeLinecap="round" />
            <path d="M5.5 18.5H18.5V21.5H5.5V18.5Z" fill={fillColor} stroke={strokeColor} strokeWidth="0.6" />
          </>
        );
 
      /**
       * ----------------------------------------------------------------------
       * 7. PRINCE DESIGN (cute)
       * Same black/white body as the other pieces, floating gold diamond on top,
       * four-pointed star (blue on white side, yellow on black side), cheeks.
       * ----------------------------------------------------------------------
       */
      case 'prince':
        return (
          <>
            {/* Base */}
            <rect x="5.5" y="19.4" width="13" height="2.6" rx="1.2" fill={fillColor} stroke={strokeColor} strokeWidth="0.6" />
            <rect x="5.9" y="20.1" width="12.2" height="0.9" fill={gold} />
            {/* Stem */}
            <path d="M10 16.8L8.6 19.6H15.4L14 16.8Z" fill={fillColor} stroke={strokeColor} strokeWidth="0.6" strokeLinejoin="round" />
            {/* Crown body with raised arms */}
            <path
              d="M5.8 6H8.6V8.4L12 6.6L15.4 8.4V6H18.2V9.4L15.8 11.4L14.8 17H9.2L8.2 11.4L5.8 9.4Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
            {/* Floating diamond finial */}
            <path d="M12 1.2L13.5 3.4L12 5.6L10.5 3.4Z" fill={gold} />
            {/* Four-pointed star (blue on white side, yellow on black side) */}
            <path
              d="M12 8.4L13.1 10.5L15.2 11.6L13.1 12.7L12 14.8L10.9 12.7L8.8 11.6L10.9 10.5Z"
              fill={princeStarColor}
            />
            <circle cx="12" cy="11.6" r="0.6" fill={fillColor} />
            <circle cx="12" cy="11.6" r="0.25" fill={strokeColor} />
            {/* Cute cheeks */}
            <ellipse cx="9.9" cy="14.8" rx="0.45" ry="0.65" fill={strokeColor} opacity="0.85" />
            <ellipse cx="14.1" cy="14.8" rx="0.45" ry="0.65" fill={strokeColor} opacity="0.85" />
          </>
        );
 
      /**
       * ----------------------------------------------------------------------
       * 8. COMMUNIST (cute): all red on both sides, NO border.
       * Big star on top, happy closed eyes, crossed "mustache" arms below.
       * ----------------------------------------------------------------------
       */
      case 'communist':
        return (
          <>
            {/* Base */}
            <rect x="5.5" y="19.6" width="13" height="2.4" rx="1.2" fill="#b91c1c" stroke="none" />
            <rect x="5.9" y="20.3" width="12.2" height="0.7" fill="#ef4444" stroke="none" />
            {/* Body */}
            <path d="M7.6 20L9 13.5H15L16.4 20Z" fill="#b91c1c" stroke="none" />
            {/* Head */}
            <path d="M8.6 14.2L12 8.4L15.4 14.2Z" fill="#b91c1c" stroke="none" />
            {/* Big cute star on top */}
            <polygon
              points="12,1.2 13.18,4.38 16.56,4.52 13.9,6.62 14.82,9.88 12,8 9.18,9.88 10.1,6.62 7.44,4.52 10.82,4.38"
              fill="#dc2626"
              stroke="none"
            />
            {/* Happy closed eyes */}
            <path d="M9.6 12.3Q10.4 11.2 11.2 12.3M12.8 12.3Q13.6 11.2 14.4 12.3" fill="none" stroke="#fecaca" strokeWidth="0.6" strokeLinecap="round" />
            {/* Crossed "mustache" arms */}
            <path d="M9.4 13.6L14.6 16.8M14.6 13.6L9.4 16.8" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9.4 13.6L14.6 16.8M14.6 13.6L9.4 16.8" stroke="#ef4444" strokeWidth="1.7" strokeLinecap="round" />
          </>
        );
 
      /**
       * ----------------------------------------------------------------------
       * 9. SUPREME ROOK DESIGN (cute)
       * Castle body with battlements, round dome head with stripe, little eyes
       * and a gold cross. White/black via fillColor and strokeColor.
       * ----------------------------------------------------------------------
       */
      case 'supremeRook':
        return (
          <>
            {/* Base */}
            <rect x="4.8" y="17.6" width="14.4" height="4.4" rx="1.3" fill={fillColor} stroke={strokeColor} strokeWidth="0.65" />
            <rect x="5.2" y="18.4" width="13.6" height="1.1" fill={gold} />
            {/* Dome head with stripe */}
            <circle cx="12" cy="5.6" r="2.9" fill={fillColor} stroke={strokeColor} strokeWidth="0.7" />
            <path d="M12 2.8V5.1" stroke={markColor} strokeWidth="1.2" strokeLinecap="butt" />
            {/* Castle body with battlements */}
            <path
              d="M5.2 6.4H8.4V8.6H15.6V6.4H18.8V10.4H17.4V18H6.6V10.4H5.2Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
            {/* Cute eyes */}
            <ellipse cx="8.8" cy="13" rx="0.5" ry="0.85" fill={markColor} />
            <ellipse cx="15.2" cy="13" rx="0.5" ry="0.85" fill={markColor} />
            {/* Gold cross */}
            <path d="M12 10.6V15.4M10.3 12.6H13.7" stroke={gold} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
 
      /**
       * ----------------------------------------------------------------------
       * 10. PRIEST DESIGN (cute)
       * Round head with stripe, cloak body with gold cross, gold-banded base.
       * White/black via fillColor and strokeColor.
       * ----------------------------------------------------------------------
       */
      case 'priest':
        return (
          <>
            {/* Base */}
            <rect x="5.5" y="17.8" width="13" height="4.2" rx="1.3" fill={fillColor} stroke={strokeColor} strokeWidth="0.6" />
            <rect x="5.9" y="18.6" width="12.2" height="1" fill={gold} />
            {/* Cloak body */}
            <path
              d="M8.8 9.4Q12 8.2 15.2 9.4L17.4 16.6Q17.6 17.8 16.4 17.8H7.6Q6.4 17.8 6.6 16.6Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Gold cross */}
            <path d="M12 11V15.6M10.2 12.8H13.8" stroke={gold} strokeWidth="1.5" strokeLinecap="round" />
            {/* Round head with stripe */}
            <circle cx="12" cy="5.9" r="3.2" fill={fillColor} stroke={strokeColor} strokeWidth="0.7" />
            <path d="M12 2.8V5.4" stroke={markColor} strokeWidth="1.3" strokeLinecap="butt" />
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
      style={!isWhite ? { filter: 'drop-shadow(0px 0px 0.7px rgba(255, 255, 255, 0.45))' } : undefined}
      className={`${className} select-none pointer-events-none transition-transform duration-150`}
    >
      {renderSvgContent()}
    </svg>
  );
};
 