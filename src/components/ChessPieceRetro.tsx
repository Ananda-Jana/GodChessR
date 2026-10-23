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
 * CHESS PIECE RETRO DESIGN (Hand-drawn Card Character Art Style)
 * ============================================================================
 */
export const ChessPieceRetro: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'white';

  // ---- Card-art palette ----------------------------------------------------
  const ink = '#16112f';       // outline / line-work
  const red = '#e5252d';
  const blue = '#2a2aa6';
  const gold = '#f6b92f';
  const paper = '#ffffff';
  const primary = isWhite ? red : blue;     // garments / architecture
  const secondary = isWhite ? blue : red;   // hair / trim
  const starColor = isWhite ? blue : gold;  // prince chest star

  // Reusable stroke presets
  const ol = { stroke: ink, strokeWidth: 0.45, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const fine = { stroke: ink, strokeWidth: 0.3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, fill: 'none' };

  /** Shared chunky plinth: pure WHITE bar for white pieces, pure BLACK bar for black pieces. */
  const barColor = isWhite ? '#ffffff' : '#000000';
  const barBorder = isWhite ? '#1f2937' : '#e5e7eb'; // thin blackish / whitish border
  const plinth = (x = 5.2, w = 13.6) => (
    <rect x={x} y="20" width={w} height="2.4" rx="1.1" fill={barColor} stroke={barBorder} strokeWidth="0.3" />
  );

  /** Closed, happy lashed eye (arc + two lash ticks). dir = -1 left eye, +1 right eye. */
  const happyEye = (cx: number, cy: number, w = 1.5, dir = 1) => (
    <>
      <path d={`M${cx - w / 2} ${cy} Q${cx} ${cy - 1.1} ${cx + w / 2} ${cy}`} {...fine} strokeWidth={0.5} />
      <path
        d={`M${cx + (dir * w) / 2} ${cy} l${dir * 0.45} -0.35 M${cx + (dir * w) / 2} ${cy + 0.05} l${dir * 0.5} 0.05`}
        {...fine}
        strokeWidth={0.28}
      />
    </>
  );

  /** Small red lips smile. */
  const lips = (cx: number, cy: number, w = 2) => (
    <path
      d={`M${cx - w / 2} ${cy} Q${cx} ${cy + 0.2} ${cx + w / 2} ${cy} Q${cx} ${cy + 1.25} ${cx - w / 2} ${cy}Z`}
      fill={red}
      stroke={ink}
      strokeWidth={0.25}
      strokeLinejoin="round"
    />
  );

  /** Blush cheek dots. */
  const cheeks = (y: number, dx: number) => (
    <>
      <ellipse cx={12 - dx} cy={y} rx="0.65" ry="0.4" fill={red} opacity="0.55" />
      <ellipse cx={12 + dx} cy={y} rx="0.65" ry="0.4" fill={red} opacity="0.55" />
    </>
  );

  const renderSvgContent = () => {
    switch (type) {
      /**
       * 1. PAWN - "the page"
       * Round head with a blue/red hair cap and golden bun, lashed closed eyes,
       * blushing cheeks, small bell-shaped body with a golden scarf.
       */
      case 'pawn':
        return (
          <>
            {/* Body */}
            <path d="M7.4 20C7.4 16.6 9.2 14 12 14C14.8 14 16.6 16.6 16.6 20Z" fill={primary} {...ol} />
            {/* Golden scarf + knot */}
            <path d="M9.2 14.6Q12 16.6 14.8 14.6L14.4 13.4Q12 14.8 9.6 13.4Z" fill={gold} {...ol} strokeWidth={0.4} />
            <path d="M12.6 15.6L13.4 18L12.2 17.6L11.6 18.2Z" fill={gold} {...ol} strokeWidth={0.35} />
            {/* Chest button */}
            <circle cx="10.4" cy="17.8" r="0.45" fill={gold} stroke={ink} strokeWidth={0.2} />
            {/* Bun */}
            <circle cx="12" cy="3.4" r="1.7" fill={gold} {...ol} />
            <path d="M10.9 3.1Q12 2.3 13.1 3.1" {...fine} strokeWidth={0.22} />
            {/* Head */}
            <circle cx="12" cy="9" r="4" fill={paper} {...ol} />
            {/* Hair cap: split colours with a swooping fringe */}
            <path d="M8 9C7.6 5.8 9.4 4.6 12 4.6C14.6 4.6 16.4 5.8 16 9C15 7.6 13.8 6.9 12 6.9C10.2 6.9 9 7.6 8 9Z" fill={secondary} {...ol} />
            <path d="M12 4.6C14.6 4.6 16.4 5.8 16 9C15.4 8.2 14.8 7.6 14 7.3C13.4 6.4 12.8 5.4 12 4.6Z" fill={primary} {...ol} strokeWidth={0.35} />
            {/* Face */}
            {happyEye(10.1, 9.5, 1.4, -1)}
            {happyEye(13.9, 9.5, 1.4, 1)}
            <path d="M12.1 10L11.7 11.1L12.4 11.2" {...fine} strokeWidth={0.25} />
            {lips(12, 12.2, 1.7)}
            {cheeks(11.2, 2.6)}
            {plinth(5.6, 12.8)}
          </>
        );

      /**
       * 2. KNIGHT - grinning horse, faces left
       * Flowing golden mane behind the head, blue forelock, red bridle,
       * lashed eye, big toothy grin, pointy ear.
       */
      case 'knight':
        return (
          <>
            {/* Mane (behind head): scalloped curls running down the neck */}
            <path
              d="M9.4 4.4
                 C12.6 3 16.2 4 18 6.6
                 C18.9 6.9 19.6 7.8 19.3 8.9
                 C20.2 9.6 20.3 10.9 19.5 11.8
                 C20.4 12.7 20.3 14 19.4 14.8
                 C20.1 15.8 19.8 17.2 18.8 17.8
                 C19.2 18.5 19 19.1 18.6 19.6
                 L10 19.6 Z"
              fill={gold}
              {...ol}
            />
            {/* Mane flow lines */}
            <path
              d="M16.2 7C17.6 9.2 17.8 12.4 17 15.4
                 M14.2 5.8C15.7 7.8 16 10 15.4 12.4"
              {...fine}
              strokeWidth={0.3}
              opacity="0.8"
              stroke={red}
            />
            {/* Head, neck and chest silhouette */}
            <path
              d="M7 19.5
                 C7 16 9 14.5 10.2 12.8
                 L7.6 13.4
                 C6.4 13.7 5.4 13.2 4.9 12.2
                 L4.6 10.6
                 C4.7 9.8 5.4 9.2 6.2 8.6
                 L7.4 6.2
                 L7.6 3.4
                 L9.8 5
                 C12.4 4.6 15.4 6.2 16.6 10
                 C17.4 13.2 17.2 16.6 17 19.5
                 Z"
              fill={paper}
              {...ol}
            />
            {/* Inner ear */}
            <path d="M7.95 4.9L8 4.2L8.9 5Z" fill={red} stroke={ink} strokeWidth={0.2} strokeLinejoin="round" />
            {/* Blue forelock curl */}
            <path d="M7.6 6.3C8.2 4.9 10 4.8 11 5.6C10.6 7 9.8 7.8 9.2 8.4C9 7.4 8.4 6.8 7.6 6.3Z" fill={secondary} {...ol} strokeWidth={0.35} />
            {/* Bridle: noseband + cheek strap + brow band */}
            <path d="M4.75 10.9Q6.6 10.5 8.4 12.5" stroke={red} strokeWidth="0.85" fill="none" strokeLinecap="round" />
            <path d="M4.75 10.9Q6.6 10.5 8.4 12.5" {...fine} strokeWidth={0.2} stroke={ink} transform="translate(0 0.45)" opacity="0.7" />
            <path d="M8.2 8.8L9.4 12.6" stroke={red} strokeWidth="0.8" fill="none" strokeLinecap="round" />
            <circle cx="8.55" cy="9.9" r="0.38" fill={gold} stroke={ink} strokeWidth={0.2} />
            {/* Lashed eye */}
            <path d="M7.4 8.9Q8.3 7.9 9.2 8.8" {...fine} strokeWidth={0.55} />
            <path d="M9.2 8.8L9.7 8.5M9 8.55L9.4 8.1" {...fine} strokeWidth={0.28} />
            {/* Nostril + blushing cheek */}
            <ellipse cx="5.55" cy="11.2" rx="0.28" ry="0.48" fill={ink} />
            <ellipse cx="8.1" cy="11.6" rx="0.7" ry="0.42" fill={red} opacity="0.55" />
            {/* Toothy grin */}
            <path d="M5.1 12.35Q6.8 13.55 8.8 12.8" {...fine} strokeWidth={0.4} />
            <path d="M6 12.75V13.35M6.9 13.05V13.65M7.8 13.1V13.55" {...fine} strokeWidth={0.22} />
            {/* Collar + chest panel */}
            <path d="M7 19.5C7 17.6 7.8 16.2 8.8 15.2L12 17.4L17.1 15.8L17 19.5Z" fill={primary} {...ol} />
            <path d="M8.8 15.2L12 17.4L17.1 15.8" fill="none" stroke={gold} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="18.6" r="0.5" fill={gold} stroke={ink} strokeWidth={0.2} />
            {plinth(5.2, 13.6)}
          </>
        );

      /**
       * 3. BISHOP - the hooded mitre-wearer
       * Pointed mitre with golden band + finial, cowl with golden edges,
       * serene closed lashed eyes, red lips, cross pendant.
       */
      case 'bishop':
        return (
          <>
            {/* Cowl / hood */}
            <path d="M6.4 19.6C6.1 14.6 6.6 10.8 8.2 8.8H15.8C17.4 10.8 17.9 14.6 17.6 19.6Z" fill={secondary} {...ol} />
            <path d="M6.9 18.6C6.7 14.6 7.2 11.4 8.4 9.6M17.1 18.6C17.3 14.6 16.8 11.4 15.6 9.6" fill="none" stroke={gold} strokeWidth="0.8" strokeLinecap="round" />
            {/* Shoulders */}
            <path d="M6.6 20C7 17.4 9.2 15.4 12 15.4C14.8 15.4 17 17.4 17.4 20Z" fill={primary} {...ol} />
            <path d="M9.4 16.1L12 18.2L14.6 16.1" fill="none" stroke={gold} strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" />
            {/* Pectoral cross */}
            <path d="M12 18.4V19.8M11.3 19H12.7" stroke={gold} strokeWidth="0.55" strokeLinecap="round" />
            {/* Neck */}
            <path d="M11 14.4H13V15.8Q12 16.4 11 15.8Z" fill={paper} {...ol} strokeWidth={0.35} />
            {/* Face */}
            <path d="M8.8 10.4C8.8 9.2 10.2 8.8 12 8.8C13.8 8.8 15.2 9.2 15.2 10.4C15.2 13 13.8 14.8 12 14.8C10.2 14.8 8.8 13 8.8 10.4Z" fill={paper} {...ol} />
            {/* Mitre */}
            <path d="M12 1.9C14.6 3.6 16.4 6 16.4 9H7.6C7.6 6 9.4 3.6 12 1.9Z" fill={primary} {...ol} />
            <path d="M7.6 7.4H16.4V9.2H7.6Z" fill={gold} {...ol} strokeWidth={0.4} />
            {/* Mitre cross + slit */}
            <path d="M12 3.2V6.6M10.8 4.7H13.2" stroke={paper} strokeWidth="0.75" strokeLinecap="round" />
            <path d="M12 3.2V6.6M10.8 4.7H13.2" stroke={ink} strokeWidth="0.2" strokeLinecap="round" opacity="0.6" />
            <circle cx="12" cy="1.7" r="0.95" fill={gold} {...ol} strokeWidth={0.35} />
            <path d="M16.4 9.1Q17.8 9.8 17.4 11.6" {...fine} strokeWidth={0.3} />
            {/* Features */}
            {happyEye(10.3, 11.1, 1.4, -1)}
            {happyEye(13.7, 11.1, 1.4, 1)}
            <path d="M12.1 11.5L11.7 12.5L12.4 12.6" {...fine} strokeWidth={0.22} />
            {lips(12, 13.5, 1.8)}
            {cheeks(12.6, 2.2)}
            {plinth(5.2, 13.6)}
          </>
        );

      /**
       * 4. ROOK - the shouting tower
       * Three-banner battlements (like the club-king's headpiece), a white arched
       * window face with a wide-open shout, golden trim bands.
       */
      case 'rook':
        return (
          <>
            {/* Tower body */}
            <path
              d="M6.2 3.2H8.9V5.2H10.7V3.2H13.3V5.2H15.1V3.2H17.8V8.6H16.6V19.6H7.4V8.6H6.2Z"
              fill={primary}
              {...ol}
            />
            {/* Battlement band */}
            <path d="M6.2 6.2H17.8V8.6H6.2Z" fill={secondary} {...ol} strokeWidth={0.4} />
            {/* Three little V banners */}
            <path d="M6.9 6.6H8.9L7.9 8.2Z" fill={paper} stroke={ink} strokeWidth={0.28} strokeLinejoin="round" />
            <path d="M11 6.6H13L12 8.2Z" fill={paper} stroke={ink} strokeWidth={0.28} strokeLinejoin="round" />
            <path d="M15.1 6.6H17.1L16.1 8.2Z" fill={paper} stroke={ink} strokeWidth={0.28} strokeLinejoin="round" />
            {/* Brick lines */}
            <path d="M7.4 17H9.2M10.6 17H13.4M14.8 17H16.6M8.6 18.4H11M13 18.4H15.4" {...fine} strokeWidth={0.2} opacity="0.65" />
            {/* Face window */}
            <path d="M8.5 9.4H15.5V15C15.5 16.4 13.9 17 12 17C10.1 17 8.5 16.4 8.5 15Z" fill={paper} {...ol} />
            {/* Eyes (scrunched) */}
            <path d="M9.4 11Q10.4 10 11.4 11" {...fine} strokeWidth={0.55} />
            <path d="M12.6 11Q13.6 10 14.6 11" {...fine} strokeWidth={0.55} />
            <path d="M9.4 11l-0.35 -0.4M14.6 11l0.35 -0.4" {...fine} strokeWidth={0.26} />
            {/* Nose */}
            <path d="M12.1 11.2L11.5 12.5L12.4 12.6" {...fine} strokeWidth={0.25} />
            {/* Shouting mouth */}
            <path d="M9.9 13.1Q12 12.7 14.1 13.1Q14 15.8 12 15.9Q10 15.8 9.9 13.1Z" fill={red} {...ol} strokeWidth={0.35} />
            <path d="M10.2 13.2H13.8V13.9H10.2Z" fill={paper} stroke={ink} strokeWidth={0.18} />
            <path d="M11 15.2Q12 14.4 13 15.2Q12 15.8 11 15.2Z" fill="#fb7185" />
            {/* Gold ring at waist */}
            <path d="M7.4 18.8H16.6V19.6H7.4Z" fill={gold} stroke={ink} strokeWidth={0.25} />
            {/* Plinth */}
            {plinth(5.2, 13.6)}
          </>
        );

      /**
       * 5. QUEEN - long split-colour hair, golden crown, red lips, lashes
       */
      case 'queen':
        return (
          <>
            {/* Hair, back layer: two colour halves */}
            <path d="M12 3.8C10.2 3.8 8.6 4.6 7.6 6.4C6.4 8.6 6.1 13.4 6.4 19.6H12Z" fill={secondary} {...ol} />
            <path d="M12 3.8C13.8 3.8 15.4 4.6 16.4 6.4C17.6 8.6 17.9 13.4 17.6 19.6H12Z" fill={primary} {...ol} />
            {/* Golden hair edges */}
            <path d="M7.1 7.6C6.5 10.6 6.5 15 6.7 19" fill="none" stroke={gold} strokeWidth="0.85" strokeLinecap="round" />
            <path d="M16.9 7.6C17.5 10.6 17.5 15 17.3 19" fill="none" stroke={gold} strokeWidth="0.85" strokeLinecap="round" />
            {/* Dress */}
            <path d="M6.8 20C7.2 17.4 9.2 15.6 11 15.1L12 16.8L13 15.1C14.8 15.6 16.8 17.4 17.2 20Z" fill={primary} {...ol} />
            <path d="M11 15.1L12 16.8L13 15.1" fill="none" stroke={gold} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.2 17.3Q10 18.2 9.4 19.4M14.8 17.3Q14 18.2 14.6 19.4" {...fine} strokeWidth={0.22} stroke={gold} />
            {/* Neck */}
            <path d="M11 13.6H13V15.2Q12 16 11 15.2Z" fill={paper} {...ol} strokeWidth={0.35} />
            {/* Face with pointed chin */}
            <path d="M8.4 9C8.4 7.2 9.9 6.2 12 6.2C14.1 6.2 15.6 7.2 15.6 9C15.6 11.8 13.8 14.2 12 14.6C10.2 14.2 8.4 11.8 8.4 9Z" fill={paper} {...ol} />
            {/* Fringe: sweeping, two-tone */}
            <path d="M8.3 9.6C8.2 7.4 9.8 6 12 6C14.2 6 15.8 7.4 15.7 9.6C14.7 8.2 13.4 7.6 12 7.7C10.5 7.6 9.3 8.4 8.3 9.6Z" fill={secondary} {...ol} strokeWidth={0.4} />
            <path d="M12 6C14.2 6 15.8 7.4 15.7 9.6C15.2 8.9 14.6 8.4 14 8.1C13.5 7.1 12.8 6.4 12 6Z" fill={primary} {...ol} strokeWidth={0.35} />
            {/* Features */}
            {happyEye(10.3, 10.4, 1.5, -1)}
            {happyEye(13.7, 10.4, 1.5, 1)}
            <path d="M12.1 10.9L11.7 11.9L12.4 12" {...fine} strokeWidth={0.22} />
            {lips(12, 12.9, 2)}
            {cheeks(11.9, 2.3)}
            {/* Golden crown with jewels */}
            <path d="M8.6 6.4L8.2 2.6L10.2 4L12 1.4L13.8 4L15.8 2.6L15.4 6.4Z" fill={gold} {...ol} />
            <path d="M8.6 5.4H15.4V6.5H8.6Z" fill={gold} {...ol} strokeWidth={0.3} />
            <path d="M12 3.6L12.8 4.7L12 5.8L11.2 4.7Z" fill={red} stroke={ink} strokeWidth={0.2} strokeLinejoin="round" />
            <circle cx="8.2" cy="2.4" r="0.5" fill={red} stroke={ink} strokeWidth={0.2} />
            <circle cx="15.8" cy="2.4" r="0.5" fill={red} stroke={ink} strokeWidth={0.2} />
            <circle cx="12" cy="1.3" r="0.5" fill={blue} stroke={ink} strokeWidth={0.2} />
            {plinth(5.2, 13.6)}
          </>
        );

      /**
       * 6. KING - toothy grin, big mustache, tall crown with diamond jewels,
       * curly golden side-lock, robe with golden collar and a heart of diamonds.
       */
      case 'king':
        return (
          <>
            {/* Side curl (behind face) */}
            <path
              d="M15.6 9.2C18.4 8.4 20.2 10.2 19.6 12.4C19 14.2 16.8 14.4 16 13C15.4 11.8 16.6 10.8 17.6 11.4C18.2 11.8 18 12.6 17.4 12.6"
              fill={secondary}
              {...ol}
            />
            <path d="M8.4 9.2C5.8 8.6 4.6 10.4 5.2 12.2C5.7 13.6 7.4 13.6 8 12.6" fill={secondary} {...ol} />
            {/* Robe */}
            <path d="M5.4 20C5.4 17.4 7.8 15.8 10 15.4L12 17.4L14 15.4C16.2 15.8 18.6 17.4 18.6 20Z" fill={primary} {...ol} />
            <path d="M10 15.4L12 17.4L14 15.4" fill="none" stroke={gold} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            {/* Diamond chest panel */}
            <path d="M12 17.6L13.2 18.8L12 20L10.8 18.8Z" fill={gold} stroke={ink} strokeWidth={0.22} strokeLinejoin="round" />
            <path d="M7.4 17.4L8.2 18.2L7.4 19L6.6 18.2ZM16.6 17.4L17.4 18.2L16.6 19L15.8 18.2Z" fill={gold} stroke={ink} strokeWidth={0.18} strokeLinejoin="round" />
            {/* Neck */}
            <path d="M10.8 14.6H13.2V16L12 16.6L10.8 16Z" fill={paper} {...ol} strokeWidth={0.35} />
            {/* Face */}
            <path d="M7.7 8C7.7 6.8 9.2 6.4 12 6.4C14.8 6.4 16.3 6.8 16.3 8L16.1 12.2C16.1 14.6 14.4 15.8 12 15.8C9.6 15.8 7.9 14.6 7.9 12.2Z" fill={paper} {...ol} />
            {/* Happy squinty eyes */}
            <path d="M9.2 9.7Q10.2 8.6 11.2 9.7M12.8 9.7Q13.8 8.6 14.8 9.7" {...fine} strokeWidth={0.55} />
            <path d="M9.2 9.7l-0.45 -0.3M14.8 9.7l0.45 -0.3" {...fine} strokeWidth={0.26} />
            {/* Big pointed nose */}
            <path d="M12 9.8L10.8 11.9L12.5 12.1" fill={paper} {...fine} strokeWidth={0.32} />
            {/* Mustache */}
            <path d="M8.5 12.1C9.7 11.3 11.4 11.7 12 12.4C12.6 11.7 14.3 11.3 15.5 12.1C15 13.2 13.2 13.3 12 12.8C10.8 13.3 9 13.2 8.5 12.1Z" fill={secondary} {...ol} strokeWidth={0.35} />
            {/* Toothy grin */}
            <path d="M9.4 13.5Q12 16.6 14.6 13.5Z" fill={paper} {...ol} strokeWidth={0.35} />
            <path d="M11 13.8V14.9M12 14V15.3M13 13.8V14.9" {...fine} strokeWidth={0.2} />
            {/* Crown */}
            <path d="M7 7.2L6.4 2.4L9.2 4.6L12 1.5L14.8 4.6L17.6 2.4L17 7.2Z" fill={gold} {...ol} />
            <path d="M7 5.9H17V7.4H7Z" fill={gold} {...ol} strokeWidth={0.32} />
            <path d="M9.2 6.6L9.8 5.6L10.4 6.6L9.8 7.5ZM11.4 6.6L12 5.6L12.6 6.6L12 7.5ZM13.6 6.6L14.2 5.6L14.8 6.6L14.2 7.5Z" fill={red} stroke={ink} strokeWidth={0.15} strokeLinejoin="round" />
            <circle cx="6.4" cy="2.3" r="0.55" fill={red} stroke={ink} strokeWidth={0.2} />
            <circle cx="17.6" cy="2.3" r="0.55" fill={red} stroke={ink} strokeWidth={0.2} />
            <circle cx="12" cy="1.4" r="0.55" fill={blue} stroke={ink} strokeWidth={0.2} />
            {plinth(5.2, 13.6)}
          </>
        );

      /**
       * 7. PRINCE - the cool jack
       * Spiky golden hair, tilted mini crown, dark shades with glints, cheeky
       * smirk, jacket with four-pointed star.
       */
      case 'prince':
        return (
          <>
            {/* Spiky hair (behind face) */}
            <path
              d="M7.2 10L5.9 6.8L8.1 7.2L8 4.6L10.2 6L11.4 3.4L12.8 5.6L14.8 4.2L15.2 6.8L17.8 6.4L16.8 10Z"
              fill={gold}
              {...ol}
            />
            {/* Jacket */}
            <path d="M6.2 20C6.4 17.4 8.6 15.4 10.6 15L12 16.6L13.4 15C15.4 15.4 17.6 17.4 17.8 20Z" fill={secondary} {...ol} />
            <path d="M10.6 15L12 16.6L13.4 15L12 14.4Z" fill={paper} {...ol} strokeWidth={0.35} />
            <path d="M8.6 15.8L12 19.4L15.4 15.8" fill="none" stroke={primary} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            {/* Chest star */}
            <path d="M12 17.1L12.5 18.4L13.8 18.9L12.5 19.4L12 20.6L11.5 19.4L10.2 18.9L11.5 18.4Z" fill={starColor} stroke={ink} strokeWidth={0.18} strokeLinejoin="round" />
            {/* Face */}
            <path d="M8 9C8 7.6 9.6 7 12 7C14.4 7 16 7.6 16 9L15.8 12.4C15.8 14.6 14 15.8 12 15.8C10 15.8 8.2 14.6 8.2 12.4Z" fill={paper} {...ol} />
            {/* Fringe over forehead */}
            <path d="M8 9.2C8 7.6 9.6 7 12 7C14.4 7 16 7.6 16 9.2L15.4 8.6L14.4 9L13.2 8.2L12 9L10.8 8.2L9.6 9L8.6 8.6Z" fill={gold} {...ol} strokeWidth={0.35} />
            {/* Sunglasses */}
            <path d="M7.7 9.9H16.3V10.7C16.3 11.7 15.5 12.1 14.7 12.1C13.7 12.1 13.1 11.5 12.7 10.8H11.3C10.9 11.5 10.3 12.1 9.3 12.1C8.5 12.1 7.7 11.7 7.7 10.7Z" fill={ink} />
            <path d="M9 10.4L9.8 10.4M14.2 10.4L15 10.4" stroke={paper} strokeWidth="0.35" strokeLinecap="round" />
            <path d="M7.7 10.1L7.1 9.8M16.3 10.1L16.9 9.8" {...fine} strokeWidth={0.3} />
            {/* Nose + smirk */}
            <path d="M12.1 12.2L11.8 13L12.5 13.1" {...fine} strokeWidth={0.22} />
            <path d="M10.2 14.1Q12.2 15.2 14.3 13.5" {...fine} strokeWidth={0.4} />
            <path d="M14.3 13.5L14.7 13.1" {...fine} strokeWidth={0.28} />
            {/* Tilted mini crown */}
            <g transform="rotate(-12 12 4)">
              <path d="M9 5.8L8.8 2.8L10.4 3.9L12 1.9L13.6 3.9L15.2 2.8L15 5.8Z" fill={gold} {...ol} />
              <path d="M9 4.9H15V5.9H9Z" fill={primary} {...ol} strokeWidth={0.3} />
              <path d="M12 2.9L12.5 3.7L12 4.4L11.5 3.7Z" fill={primary} stroke={ink} strokeWidth={0.15} strokeLinejoin="round" />
            </g>
            {plinth(5.2, 13.6)}
          </>
        );

      /**
       * 8. COMMUNIST - ALL RED on both sides, NO outlines (tone-on-tone details)
       * Peaked cap with a pale star, happy closed eyes, thick moustache,
       * crossed arms.
       */
      case 'communist':
        return (
          <>
            {/* Plinth: pure white / pure black bar (only side marker on this piece) */}
            <rect x="5.2" y="19.6" width="13.6" height="2.6" rx="1.2" fill={barColor} stroke={barBorder} strokeWidth="0.3" />
            {/* Body / greatcoat */}
            <path d="M6.6 19.8C6.8 16.6 9 14.4 12 14.4C15 14.4 17.2 16.6 17.4 19.8Z" fill="#b91c1c" stroke="none" />
            {/* Collar tabs + buttons */}
            <path d="M10.2 14.6L12 17L13.8 14.6L12 14Z" fill="#dc2626" stroke="none" />
            <circle cx="12" cy="17.9" r="0.4" fill="#fca5a5" stroke="none" />
            <circle cx="12" cy="19.1" r="0.4" fill="#fca5a5" stroke="none" />
            {/* Head */}
            <path d="M8.2 9.2C8.2 7.6 9.8 6.8 12 6.8C14.2 6.8 15.8 7.6 15.8 9.2V11.4C15.8 13.6 14.2 14.8 12 14.8C9.8 14.8 8.2 13.6 8.2 11.4Z" fill="#ef4444" stroke="none" />
            {/* Ears */}
            <ellipse cx="8" cy="11" rx="0.8" ry="1.2" fill="#dc2626" stroke="none" />
            <ellipse cx="16" cy="11" rx="0.8" ry="1.2" fill="#dc2626" stroke="none" />
            {/* Peaked cap */}
            <path d="M7.2 8.2C7.2 5.6 9.4 3.6 12 3.6C14.6 3.6 16.8 5.6 16.8 8.2C16 7.4 14.2 7 12 7C9.8 7 8 7.4 7.2 8.2Z" fill="#991b1b" stroke="none" />
            <path d="M7 8.3C9 7.4 15 7.4 17 8.3L16.6 9.1C14.6 8.4 9.4 8.4 7.4 9.1Z" fill="#7f1d1d" stroke="none" />
            {/* Cap star */}
            <polygon
              points="12,3.9 12.55,5.25 14,5.3 12.9,6.2 13.25,7.6 12,6.8 10.75,7.6 11.1,6.2 10,5.3 11.45,5.25"
              fill="#fecaca"
              stroke="none"
              transform="translate(0 -0.2)"
            />
            {/* Happy closed eyes */}
            <path d="M9.4 10.4Q10.2 9.4 11 10.4M13 10.4Q13.8 9.4 14.6 10.4" fill="none" stroke="#fecaca" strokeWidth="0.6" strokeLinecap="round" />
            {/* Nose highlight */}
            <path d="M12 10.6L11.6 11.8L12.4 11.9" fill="none" stroke="#fca5a5" strokeWidth="0.3" strokeLinecap="round" />
            {/* Thick moustache */}
            <path d="M8.9 12.2C10 11.4 11.5 11.8 12 12.5C12.5 11.8 14 11.4 15.1 12.2C14.6 13.2 13 13.3 12 12.9C11 13.3 9.4 13.2 8.9 12.2Z" fill="#7f1d1d" stroke="none" />
            {/* Smile */}
            <path d="M10.6 13.8Q12 14.7 13.4 13.8" fill="none" stroke="#fecaca" strokeWidth="0.4" strokeLinecap="round" />
            {/* Crossed arms */}
            <path d="M8.6 16.2L15.4 19M15.4 16.2L8.6 19" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8.6 16.2L15.4 19M15.4 16.2L8.6 19" stroke="#ef4444" strokeWidth="1.7" strokeLinecap="round" />
          </>
        );

      /**
       * 9. SUPREME ROOK - the crowned castle-head
       * Castle body with battlements and a gate, golden cross, a big round
       * grinning dome-head wearing a jewelled crown.
       */
      case 'supremeRook':
        return (
          <>
            {/* Castle body */}
            <path d="M5.4 9.8H8.2V11.4H9.8V9.8H14.2V11.4H15.8V9.8H18.6V19.8H5.4Z" fill={primary} {...ol} />
            <path d="M5.4 12.6H18.6" {...fine} strokeWidth={0.3} stroke={gold} />
            {/* Arched gate */}
            <path d="M10.2 19.8V16.4C10.2 14.8 13.8 14.8 13.8 16.4V19.8Z" fill={secondary} {...ol} strokeWidth={0.4} />
            <path d="M12 15.6V19.8" {...fine} strokeWidth={0.2} stroke={gold} />
            {/* Golden cross on tower sides */}
            <path d="M7.4 14.2V17M6.3 15.4H8.5M16.6 14.2V17M15.5 15.4H17.7" stroke={gold} strokeWidth="0.85" strokeLinecap="round" />
            {/* Bricks */}
            <path d="M5.9 18.6H8.9M15.1 18.6H18.1" {...fine} strokeWidth={0.2} opacity="0.6" />
            {/* Dome head */}
            <circle cx="12" cy="7.6" r="3.6" fill={paper} {...ol} />
            {/* Helmet stripe */}
            <path d="M12 4.1V6.4" stroke={secondary} strokeWidth="1.3" strokeLinecap="butt" />
            {/* Eyes + nose + big grin */}
            {happyEye(10.2, 8, 1.4, -1)}
            {happyEye(13.8, 8, 1.4, 1)}
            <path d="M12.1 8.4L11.7 9.4L12.4 9.5" {...fine} strokeWidth={0.22} />
            <path d="M10 10Q12 12.2 14 10Z" fill={paper} {...ol} strokeWidth={0.32} />
            <path d="M11 10.3V11M12 10.4V11.4M13 10.3V11" {...fine} strokeWidth={0.18} />
            {cheeks(9.4, 2.7)}
            {/* Jewelled crown */}
            <path d="M8.7 4.6L8.3 1.6L10.2 2.8L12 0.8L13.8 2.8L15.7 1.6L15.3 4.6Z" fill={gold} {...ol} strokeWidth={0.4} />
            <path d="M8.7 3.9H15.3V4.8H8.7Z" fill={gold} {...ol} strokeWidth={0.28} />
            <circle cx="12" cy="1.1" r="0.45" fill={red} stroke={ink} strokeWidth={0.18} />
            <circle cx="8.3" cy="1.7" r="0.4" fill={red} stroke={ink} strokeWidth={0.18} />
            <circle cx="15.7" cy="1.7" r="0.4" fill={red} stroke={ink} strokeWidth={0.18} />
            {plinth(4.4, 15.2)}
          </>
        );

      /**
       * 10. PRIEST - the serene halo-wearer
       * Golden halo, skull-cap with golden stripe, closed eyes, rosy cheeks,
       * bell cloak with white collar and big golden cross.
       */
      case 'priest':
        return (
          <>
            {/* Cloak */}
            <path d="M6.6 20C6.6 16 8.8 12.8 12 12.8C15.2 12.8 17.4 16 17.4 20Z" fill={primary} {...ol} />
            {/* Clasped hands */}
            <ellipse cx="12" cy="18.5" rx="1.5" ry="0.95" fill={paper} {...ol} strokeWidth={0.35} />
            <path d="M11.2 18.5H12.8M12 17.9V19.1" {...fine} strokeWidth={0.18} />
            {/* White collar */}
            <path d="M9.6 13.4L12 15.6L14.4 13.4L12 12.9Z" fill={paper} {...ol} strokeWidth={0.35} />
            {/* Golden cross */}
            <path d="M12 15.7V18M11 16.6H13" stroke={gold} strokeWidth="0.8" strokeLinecap="round" />
            <path d="M8 16.4Q8.4 14.6 9.4 13.8M16 16.4Q15.6 14.6 14.6 13.8" fill="none" stroke={gold} strokeWidth="0.7" strokeLinecap="round" />
            {/* Head */}
            <circle cx="12" cy="8.6" r="3.6" fill={paper} {...ol} />
            {/* Skull-cap */}
            <path d="M8.5 7.7C8.6 5.4 10.1 4.8 12 4.8C13.9 4.8 15.4 5.4 15.5 7.7C14.2 6.9 9.8 6.9 8.5 7.7Z" fill={secondary} {...ol} />
            <path d="M12 4.9V7.2" stroke={gold} strokeWidth="1.1" strokeLinecap="butt" />
            <circle cx="12" cy="4.6" r="0.5" fill={gold} stroke={ink} strokeWidth={0.18} />
            {/* Face */}
            {happyEye(10.3, 9.1, 1.4, -1)}
            {happyEye(13.7, 9.1, 1.4, 1)}
            <path d="M12.1 9.5L11.7 10.5L12.4 10.6" {...fine} strokeWidth={0.22} />
            {lips(12, 11.5, 1.6)}
            {cheeks(10.4, 2.5)}
            {/* Halo */}
            <ellipse cx="12" cy="2.3" rx="3.4" ry="0.95" fill="none" stroke={gold} strokeWidth="0.9" />
            <ellipse cx="12" cy="2.3" rx="3.4" ry="0.95" fill="none" stroke={ink} strokeWidth="0.15" transform="translate(0 0.5)" opacity="0.5" />
            {/* Sparkle */}
            <path d="M17.6 3.4V5M16.8 4.2H18.4" stroke={gold} strokeWidth="0.5" strokeLinecap="round" />
            {plinth(5.2, 13.6)}
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
