import React from 'react';
import { CullingPieceType, CullingPieceColor } from '../types/cullingGame';

interface CullingPieceProps {
  type: CullingPieceType;
  color: CullingPieceColor;
  className?: string;
}

/**
 * Minimal Modern Culling Chess Palette:
 * - White Pieces: Crisp `#ffffff` fill with soft charcoal-grey 0.5px outline (`#374151`)
 * - Black Pieces: Deep `#090d16` obsidian fill with thin, muted white 0.5px outline (`rgba(241, 245, 249, 0.7)`)
 * All 16 Culling characters feature clean, understated, consistent outlines without heavy glow.
 */
export function renderCullingPieceSvg(type: string, color: string) {
  const isWhite = color === 'white';
  const fill = isWhite ? '#ffffff' : '#090d16';
  const stroke = isWhite ? '#374151' : 'rgba(241, 245, 249, 0.7)';
  const detail = isWhite ? '#374151' : 'rgba(241, 245, 249, 0.75)';
  const contrastFill = isWhite ? '#374151' : 'rgba(241, 245, 249, 0.8)';

  switch (type) {
    /**
     * 1. SATORU GOJO (King-equivalent, White)
     * Royal King Crown with Cross finial and centered Infinity Symbol (∞).
     */
    case 'culling_gojo':
      return (
        <g id="gojo_king">
          {/* Base */}
          <path d="M4.5 20.5 H19.5 V22 H4.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Body */}
          <path d="M6 19.5 C6.8 15 8 13 8 10 C8 7.5 10 5.8 12 5.8 C14 5.8 16 7.5 16 10 C16 13 17.2 15 18 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Crown Band */}
          <path d="M8 10 H16 V11.5 H8 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* King Cross Finial */}
          <path d="M12 2 V5.8 M10 3.8 H14" stroke={stroke} strokeWidth="0.5" strokeLinecap="square" />
          {/* Infinity Symbol Crest (∞) */}
          <path
            d="M9.6 14.8 C8.4 13.8 8.4 16.2 9.6 15.2 C10.6 14.2 13.4 16.2 14.4 15.2 C15.6 16.2 15.6 13.8 14.4 14.8 C13.4 15.8 10.6 13.8 9.6 14.8 Z"
            fill="none"
            stroke={detail}
            strokeWidth="0.5"
          />
        </g>
      );

    /**
     * 2. RYOMEN SUKUNA (King-equivalent, Black)
     * Demon King Crown with 4 prominent curved horns and Cursed Face markings.
     */
    case 'culling_sukuna':
      return (
        <g id="sukuna_king">
          {/* Base */}
          <path d="M4.5 20.5 H19.5 V22 H4.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Demon Body */}
          <path d="M6 19.5 C6.8 15 8 13 8 10 C8 7.5 10 5.8 12 5.8 C14 5.8 16 7.5 16 10 C16 13 17.2 15 18 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Four-Point Demonic Horned Crown */}
          <path d="M6 6.5 L7.5 2 L9.5 5.5 L12 1.5 L14.5 5.5 L16.5 2 L18 6.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" strokeLinejoin="round" />
          {/* Cursed Forehead Eye & Crescent Marking */}
          <circle cx="12" cy="11.5" r="1.3" fill={contrastFill} />
          <path d="M9.5 16 C9.5 13.8 14.5 13.8 14.5 16 M12 13 V18" stroke={detail} strokeWidth="0.5" strokeLinecap="round" fill="none" />
        </g>
      );

    /**
     * 3. YUJI ITADORI (Queen-equivalent, White)
     * Queen coronet with 5 pearls and Tiger Sunburst Divergent Fist crest.
     */
    case 'culling_yuji':
      return (
        <g id="yuji_queen">
          {/* Base */}
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Flared Queen Torso */}
          <path d="M6.2 19.5 C7.2 15 8.5 13 9 10.5 H15 C15.5 13 16.8 15 17.8 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Queen Coronet */}
          <polygon points="5.5,9.5 7,12.5 12,9.5 17,12.5 18.5,9.5 17.5,14.5 6.5,14.5" fill={fill} stroke={stroke} strokeWidth="0.5" strokeLinejoin="round" />
          <circle cx="5.5" cy="8.5" r="1.1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="8.8" cy="7.8" r="1.1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="12" cy="7.2" r="1.3" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="15.2" cy="7.8" r="1.1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="18.5" cy="8.5" r="1.1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Divergent Fist Impact Sunburst Emblem */}
          <path d="M12 14.8 V18.2 M10.2 15.4 L13.8 17.6 M10.2 17.6 L13.8 15.4 M9.4 16.5 H14.6" stroke={detail} strokeWidth="0.5" strokeLinecap="round" />
        </g>
      );

    /**
     * 4. KENJAKU (Queen-equivalent, Black)
     * Veiled Queen coronet with 5 pearls and Horizontal Brain Stitches across forehead.
     */
    case 'culling_kenjaku':
      return (
        <g id="kenjaku_queen">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path d="M6.2 19.5 C7.2 15 8.5 13 9 10.5 H15 C15.5 13 16.8 15 17.8 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <polygon points="5.5,9.5 7,12.5 12,9.5 17,12.5 18.5,9.5 17.5,14.5 6.5,14.5" fill={fill} stroke={stroke} strokeWidth="0.5" strokeLinejoin="round" />
          <circle cx="5.5" cy="8.5" r="1.1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="8.8" cy="7.8" r="1.1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="12" cy="7.2" r="1.3" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="15.2" cy="7.8" r="1.1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="18.5" cy="8.5" r="1.1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Signature Forehead Stitches Crest */}
          <line x1="8.5" y1="16.5" x2="15.5" y2="16.5" stroke={detail} strokeWidth="0.5" strokeLinecap="round" />
          <line x1="9.5" y1="15" x2="9.5" y2="18" stroke={detail} strokeWidth="0.5" />
          <line x1="11.2" y1="15" x2="11.2" y2="18" stroke={detail} strokeWidth="0.5" />
          <line x1="12.8" y1="15" x2="12.8" y2="18" stroke={detail} strokeWidth="0.5" />
          <line x1="14.5" y1="15" x2="14.5" y2="18" stroke={detail} strokeWidth="0.5" />
        </g>
      );

    /**
     * 5. KOKICHI MUTA / MECHAMARU (Armored Ranged Attacker, White)
     * Heavy armored puppet robot with visor slit and shoulder cannon exhausts.
     */
    case 'culling_mechamaru':
      return (
        <g id="mechamaru_robot">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Angular Armor Torso */}
          <path d="M6.5 19.5 L7.5 11 H16.5 L17.5 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Angular Helmet & Dual Shoulder Cannons */}
          <rect x="5.5" y="7" width="2.5" height="4" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <rect x="16" y="7" width="2.5" height="4" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path d="M8 11 V5 H16 V11 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Horizontal Robot Visor Slit */}
          <rect x="9.5" y="7.5" width="5" height="1.5" fill={contrastFill} stroke={stroke} strokeWidth="0.5" />
          {/* Puppet Core Chest Aperture */}
          <circle cx="12" cy="15.5" r="1.6" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="12" cy="15.5" r="0.7" fill={contrastFill} />
        </g>
      );

    /**
     * 6. KENTO NANAMI (Heavy Orthogonal Attacker, White)
     * Fortress Rook Tower with signature round goggles and 7:3 Ratio Cleaver tie.
     */
    case 'culling_nanami':
      return (
        <g id="nanami_cleaver">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path d="M6.5 19.5 L7.5 10.5 H16.5 L17.5 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Rook Battlements */}
          <polygon points="6,10.5 6,5.5 8.5,5.5 8.5,7.8 10.8,7.8 10.8,5.5 13.2,5.5 13.2,7.8 15.5,7.8 15.5,5.5 18,5.5 18,10.5" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Nanami's Iconic Round Goggles/Glasses */}
          <circle cx="10" cy="9" r="1.4" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="14" cy="9" r="1.4" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <line x1="11.4" y1="9" x2="12.6" y2="9" stroke={detail} strokeWidth="0.5" />
          {/* 7:3 Cleaver Diagonal Slash */}
          <line x1="9" y1="13.5" x2="15" y2="17.5" stroke={detail} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="13.2" cy="16.3" r="1" fill={contrastFill} />
        </g>
      );

    /**
     * 7. PANDA (Resilient Support, White)
     * Muscular Knight Steed with prominent Round Panda Ears and Boxing Glove Core.
     */
    case 'culling_panda':
      return (
        <g id="panda_knight">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Knight Torso */}
          <path
            d="M6.8 19.5 C6.8 16 8.5 14 9.5 12 L7.2 12.8 C6.2 13 5.2 12.5 4.8 11.5 L4.5 10 C4.5 9.5 5 9 6 8.5 L7.5 6 L7.5 4 L9.5 5 C12.5 4.5 16 6.5 17 11 C18 14 17.5 17 17.2 19.5 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          {/* Prominent Round Panda Ears */}
          <circle cx="9.5" cy="4.5" r="1.6" fill={contrastFill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="14.2" cy="6.8" r="1.6" fill={contrastFill} stroke={stroke} strokeWidth="0.5" />
          {/* Panda Eye Patch */}
          <ellipse cx="9.5" cy="9" rx="1.4" ry="1" fill={contrastFill} />
          {/* Boxing Core Chest Crest */}
          <circle cx="13" cy="14.5" r="1.5" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path d="M12 14.5 H14" stroke={detail} strokeWidth="0.5" />
        </g>
      );

    /**
     * 8. MAKI ZENIN (Agile Close-Combat Support, White)
     * Knight Steed with High Ponytail Crest and Twin Dragon Bone Spear Blades.
     */
    case 'culling_maki':
      return (
        <g id="maki_knight">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path
            d="M6.8 19.5 C6.8 16 8.5 14 9.5 12 L7.2 12.8 C6.2 13 5.2 12.5 4.8 11.5 L4.5 10 C4.5 9.5 5 9 6 8.5 L7.5 6 L7.5 4 L9.5 5 C12.5 4.5 16 6.5 17 11 C18 14 17.5 17 17.2 19.5 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          {/* High Ponytail Crest */}
          <path d="M15 6 Q19 5 18 9" stroke={detail} strokeWidth="0.5" fill="none" strokeLinecap="round" />
          {/* Twin Spear Blade Crest */}
          <line x1="11" y1="8" x2="16" y2="15" stroke={detail} strokeWidth="0.5" strokeLinecap="round" />
          <line x1="15.5" y1="9" x2="10.5" y2="16" stroke={detail} strokeWidth="0.5" strokeLinecap="round" />
        </g>
      );

    /**
     * 9. KINJI HAKARI (Tactical Magician, White)
     * Bishop Mitre with 777 Pachinko Jackpot Die and Station Shutter Doors.
     */
    case 'culling_hakari':
      return (
        <g id="hakari_bishop">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Bishop Mitre Body */}
          <path d="M7.8 19.5 C7.8 15 8.8 13 9 10 C9 6.8 11 4 12 3.5 C13 4 15 6.8 15 10 C15.2 13 16.2 15 16.2 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Bishop Top Finial */}
          <circle cx="12" cy="2.8" r="1.2" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Mitre Slash */}
          <path d="M12 5.5 L14 9.5" stroke={stroke} strokeWidth="0.5" />
          {/* 777 Jackpot Die Box */}
          <rect x="9.5" y="12.5" width="5" height="4.5" rx="0.5" fill={fill} stroke={detail} strokeWidth="0.5" />
          {/* Three Jackpot Pip Dots (777) */}
          <circle cx="11" cy="14" r="0.6" fill={contrastFill} />
          <circle cx="12" cy="15" r="0.6" fill={contrastFill} />
          <circle cx="13" cy="14" r="0.6" fill={contrastFill} />
        </g>
      );

    /**
     * 10. URAUME (Tactical Magician, Black)
     * Bishop Mitre with Intricate 6-Point Glacial Snowflake Crystal.
     */
    case 'culling_uraume':
      return (
        <g id="uraume_bishop">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path d="M7.8 19.5 C7.8 15 8.8 13 9 10 C9 6.8 11 4 12 3.5 C13 4 15 6.8 15 10 C15.2 13 16.2 15 16.2 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="12" cy="2.8" r="1.2" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path d="M12 5.5 L14 9.5" stroke={stroke} strokeWidth="0.5" />
          {/* Glacial Snowflake Crystal (6-point asterism) */}
          <line x1="12" y1="12" x2="12" y2="17" stroke={detail} strokeWidth="0.5" strokeLinecap="round" />
          <line x1="9.8" y1="13.2" x2="14.2" y2="15.8" stroke={detail} strokeWidth="0.5" strokeLinecap="round" />
          <line x1="9.8" y1="15.8" x2="14.2" y2="13.2" stroke={detail} strokeWidth="0.5" strokeLinecap="round" />
          <circle cx="12" cy="14.5" r="0.8" fill={contrastFill} />
        </g>
      );

    /**
     * 11. YOROZU (Heavy Support / Rook Counterpart, Black)
     * Heavy Fortress Silhouette with Beetle Carapace Wings & True Sphere Diamond.
     */
    case 'culling_yorozu':
      return (
        <g id="yorozu_construct">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Body */}
          <path d="M6.5 19.5 L7.5 11 H16.5 L17.5 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Carapace Crest */}
          <polygon points="7,11 9,6 12,8 15,6 17,11" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* True Sphere Liquid Construct Diamond */}
          <polygon points="12,11.5 15,14.5 12,17.5 9,14.5" fill={fill} stroke={detail} strokeWidth="0.5" />
          <circle cx="12" cy="14.5" r="1" fill={contrastFill} />
        </g>
      );

    /**
     * 12. REGGIE STAR (Tactical Support / Knight Counterpart, Black)
     * Knight Silhouette wrapped in Floating Contract Receipt Scroll Banners.
     */
    case 'culling_reggie':
      return (
        <g id="reggie_contract">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path
            d="M6.8 19.5 C6.8 16 8.5 14 9.5 12 L7.2 12.8 C6.2 13 5.2 12.5 4.8 11.5 L4.5 10 C4.5 9.5 5 9 6 8.5 L7.5 6 L7.5 4 L9.5 5 C12.5 4.5 16 6.5 17 11 C18 14 17.5 17 17.2 19.5 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          {/* Floating Receipt Parchment Banner */}
          <rect x="9.5" y="12" width="5" height="5.5" rx="0.5" fill={fill} stroke={detail} strokeWidth="0.5" />
          <line x1="10.8" y1="13.5" x2="13.2" y2="13.5" stroke={detail} strokeWidth="0.5" />
          <line x1="10.8" y1="15" x2="13.2" y2="15" stroke={detail} strokeWidth="0.5" />
          <line x1="10.8" y1="16.5" x2="13.2" y2="16.5" stroke={detail} strokeWidth="0.5" />
        </g>
      );

    /**
     * 13. NAOYA ZENIN (Agile Knight Counterpart, Black)
     * Aerodynamic Speed Vector Knight with 24-FPS Animation Filmstrip Notches.
     */
    case 'culling_naoya':
      return (
        <g id="naoya_speed">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path
            d="M6.8 19.5 C6.8 16 8.5 14 9.5 12 L7.2 12.8 C6.2 13 5.2 12.5 4.8 11.5 L4.5 10 C4.5 9.5 5 9 6 8.5 L7.5 6 L7.5 4 L9.5 5 C12.5 4.5 16 6.5 17 11 C18 14 17.5 17 17.2 19.5 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          {/* 24-FPS Projection Speed Arrows */}
          <path d="M10.5 13 L13.5 15 L10.5 17" fill="none" stroke={detail} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.5 13 L15.5 15 L12.5 17" fill="none" stroke={detail} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );

    /**
     * 14. KUROURUSHI (Heavy Orthogonal / Rook Counterpart, Black)
     * Cockroach Carapace with Antennae Horns and Festering Life Cleaver Blade.
     */
    case 'culling_kurourushi':
      return (
        <g id="kurourushi_cleaver">
          <path d="M5 20.5 H19 V22 H5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path d="M6.5 19.5 L7.5 11 H16.5 L17.5 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Dual Mandible Antennae */}
          <path d="M10 8 Q8 4 10 2" stroke={detail} strokeWidth="0.5" fill="none" strokeLinecap="round" />
          <path d="M14 8 Q16 4 14 2" stroke={detail} strokeWidth="0.5" fill="none" strokeLinecap="round" />
          {/* Festering Cleaver Blade */}
          <path d="M9 13 H15 V16.5 L13 18.5 H9 Z" fill={fill} stroke={detail} strokeWidth="0.5" />
          <circle cx="12" cy="15" r="1" fill={contrastFill} />
        </g>
      );

    /**
     * 15. CULLING PAWN (Standard Chess Pawn with Clean Sorcery Seal)
     */
    case 'culling_pawn':
      return (
        <g id="culling_pawn">
          <path d="M6.5 20.5 H17.5 V22 H6.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path d="M8 19.5 C8 14.5 9.5 12 12 12 C14.5 12 16 14.5 16 19.5 H8 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="12" cy="7.2" r="3.2" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Subtle Centered Sorcery Ring */}
          <circle cx="12" cy="15.5" r="1.3" fill={fill} stroke={detail} strokeWidth="0.5" />
        </g>
      );

    /**
     * 16. CURSED ROACH SWARM (Miniature Swarm Unit)
     */
    case 'culling_swarm':
      return (
        <g id="culling_swarm">
          <path d="M7.5 20.5 H16.5 V22 H7.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <path d="M8.8 19.5 C8.8 15.5 10 13.5 12 13.5 C14 13.5 15.2 15.5 15.2 19.5 Z" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="12" cy="9.2" r="2.5" fill={fill} stroke={stroke} strokeWidth="0.5" />
          {/* Trio of Swarm Chitin Dots */}
          <circle cx="12" cy="15" r="0.8" fill={contrastFill} />
          <circle cx="10.5" cy="16.5" r="0.7" fill={contrastFill} />
          <circle cx="13.5" cy="16.5" r="0.7" fill={contrastFill} />
        </g>
      );

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
