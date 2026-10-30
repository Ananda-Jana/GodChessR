import React from 'react';
import { HeroId, TeamId } from '../types/heroDuelTypes';

interface HeroPieceSvgProps {
  heroId: HeroId;
  team: TeamId;
  isCaptain?: boolean;
  className?: string;
  size?: number;
}

export const HeroPieceSvg: React.FC<HeroPieceSvgProps> = ({
  heroId,
  team,
  isCaptain = false,
  className = 'w-full h-full',
  size,
}) => {
  const isTeam1 = team === 1;
  const primaryFill = isTeam1 ? '#FFFFFF' : '#1c1917';
  const strokeColor = isTeam1 ? '#18181b' : '#f5f5f4';
  const accentColor = isTeam1 ? '#d97706' : '#dc2626';
  const baseColor = isTeam1 ? '#fbbf24' : '#44403c';

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${heroId} - Team ${team}`}
    >
      <defs>
        <filter id={`hd-shadow-${team}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.6" />
        </filter>
        <linearGradient id={`hd-grad-${heroId}-${team}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={primaryFill} stopOpacity="1" />
          <stop offset="100%" stopColor={isTeam1 ? '#f3f4f6' : '#0c0a09'} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Team Base Accent (Colour-blind safety: Team 1 Chevron / Team 2 Shield) */}
      {isTeam1 ? (
        // Team 1: Chevron Foundation
        <polygon
          points="20,86 50,78 80,86 85,93 15,93"
          fill={baseColor}
          stroke={strokeColor}
          strokeWidth="2.5"
        />
      ) : (
        // Team 2: Curved Shield Foundation
        <path
          d="M 18,85 Q 50,96 82,85 L 80,93 Q 50,100 20,93 Z"
          fill={baseColor}
          stroke={strokeColor}
          strokeWidth="2.5"
        />
      )}

      {/* Hero Icon Body */}
      <g filter={`url(#hd-shadow-${team})`}>
        {renderHeroGlyph(heroId, primaryFill, strokeColor, accentColor)}
      </g>

      {/* Captaincy Golden Diadem */}
      {isCaptain && (
        <g transform="translate(50, 14)">
          <path
            d="M -16,-2 L -12,-12 L -5,-5 L 0,-15 L 5,-5 L 12,-12 L 16,-2 Z"
            fill="#fbbf24"
            stroke="#18181b"
            strokeWidth="2"
          />
          <circle cx="0" cy="-6" r="2.5" fill="#ef4444" stroke="#000" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
};

function renderHeroGlyph(
  heroId: HeroId | string,
  fill: string,
  stroke: string,
  accent: string
): React.ReactNode {
  switch (heroId) {
    case 'mugen-king':
    case 'mugenKing':
      // Crown with infinite decree jewel
      return (
        <g>
          <path
            d="M 24,78 L 24,45 L 34,58 L 50,30 L 66,58 L 76,45 L 76,78 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="54" r="8" fill={accent} stroke={stroke} strokeWidth="2.5" />
          <circle cx="50" cy="54" r="3.5" fill="#fff" />
        </g>
      );

    case 'malevolent-priest':
    case 'malevolentPriest':
      // Sacred Shrine Torii and Ofuda Talisman
      return (
        <g>
          <path
            d="M 22,34 L 78,34 M 26,42 L 74,42 M 35,42 L 35,78 M 65,42 L 65,78"
            stroke={stroke}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect
            x="42"
            y="48"
            width="16"
            height="26"
            rx="2"
            fill={fill}
            stroke={accent}
            strokeWidth="2"
          />
          <path d="M 46,55 L 54,67 M 54,55 L 46,67" stroke={accent} strokeWidth="2" />
        </g>
      );

    case 'dr-methanogenic':
    case 'drMethanogenic':
      // Alchemy Flask with Spore Vapors
      return (
        <g>
          <path
            d="M 44,28 L 56,28 L 56,42 L 74,70 Q 76,76 70,78 L 30,78 Q 24,76 26,70 L 44,42 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M 33,65 Q 50,60 67,65 L 69,74 L 31,74 Z" fill={accent} opacity="0.85" />
          <circle cx="44" cy="69" r="3" fill="#fff" />
          <circle cx="55" cy="66" r="2" fill="#fff" />
        </g>
      );

    case 'captain-englland':
    case 'captainEnglland':
      // Vanguard Great Helm with Battle Banner
      return (
        <g>
          <path
            d="M 30,34 Q 50,22 70,34 L 72,60 Q 70,76 50,80 Q 30,76 28,60 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M 50,28 L 50,78" stroke={stroke} strokeWidth="3.5" />
          <path d="M 34,48 L 66,48" stroke={stroke} strokeWidth="3.5" />
          <circle cx="50" cy="48" r="4" fill={accent} />
        </g>
      );

    case 'ajx-assassin':
    case 'ajx':
      // Stealth Cipher Glitch Shuriken
      return (
        <g>
          <polygon
            points="50,24 58,42 78,50 58,58 50,76 42,58 22,50 42,42"
            fill={fill}
            stroke={stroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <polygon
            points="50,38 54,46 62,50 54,54 50,62 46,54 38,50 46,46"
            fill={accent}
          />
        </g>
      );

    case 'yjkstra-pathfinder':
    case 'yjkstra':
      // Graph Network & Shortest Path Diamond
      return (
        <g>
          <line x1="30" y1="36" x2="70" y2="36" stroke={stroke} strokeWidth="3" />
          <line x1="30" y1="36" x2="50" y2="74" stroke={stroke} strokeWidth="3" />
          <line x1="70" y1="36" x2="50" y2="74" stroke={stroke} strokeWidth="3" />
          <circle cx="30" cy="36" r="8" fill={fill} stroke={stroke} strokeWidth="3" />
          <circle cx="70" cy="36" r="8" fill={fill} stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="74" r="10" fill={accent} stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="74" r="4" fill="#fff" />
        </g>
      );

    case 'ironclad-warden':
    case 'ironcladWarden':
      // Bulwark Fortress Tower
      return (
        <g>
          <path
            d="M 28,78 L 28,42 L 36,42 L 36,32 L 46,32 L 46,42 L 54,42 L 54,32 L 64,32 L 64,42 L 72,42 L 72,78 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <polygon points="50,48 62,58 50,68 38,58" fill={accent} stroke={stroke} strokeWidth="2" />
          <rect x="46" y="66" width="8" height="12" fill={stroke} />
        </g>
      );

    case 'black-monkey':
    case 'blackMonkey':
      // Trickster Primate Mask & Monkey Staff
      return (
        <g>
          <path
            d="M 24,42 Q 22,66 50,78 Q 78,66 76,42 Q 68,30 50,34 Q 32,30 24,42 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3.5"
          />
          <circle cx="40" cy="50" r="5" fill={accent} stroke={stroke} strokeWidth="2" />
          <circle cx="60" cy="50" r="5" fill={accent} stroke={stroke} strokeWidth="2" />
          <path d="M 42,65 Q 50,72 58,65" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case 'part-king-kong':
    case 'partKingKong':
      // Primal Titan Fist & Stone Smasher
      return (
        <g>
          <path
            d="M 26,76 L 26,44 Q 30,34 42,34 L 58,34 Q 70,34 74,44 L 74,76 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M 38,34 L 38,58 M 50,34 L 50,58 M 62,34 L 62,58" stroke={stroke} strokeWidth="3" />
          <path d="M 32,64 L 68,64" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        </g>
      );

    default:
      return <circle cx="50" cy="50" r="25" fill={fill} stroke={stroke} strokeWidth="3" />;
  }
}
