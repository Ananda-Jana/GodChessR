import React from 'react';
import { EsPieceType, EsSide } from './EsTypes';

export interface EsPieceProps {
  type: EsPieceType;
  side: EsSide;
  className?: string;
  isRealFootman?: boolean;
}

export const EsPieceRenderer: React.FC<EsPieceProps> = ({
  type,
  side,
  className = 'w-full h-full',
  isRealFootman = false,
}) => {
  const actualType = type === 'echo' && isRealFootman ? 'footman' : type;

  // Color assignments via CSS variables or fallback inline styling
  const fillClass =
    side === 'A'
      ? 'var(--es-a-fill, #fef08a)'
      : side === 'B'
      ? 'var(--es-b-fill, #fca5a5)'
      : 'var(--es-neutral-fill, #cbd5e1)';

  const strokeClass =
    side === 'A'
      ? 'var(--es-a-stroke, #ca8a04)'
      : side === 'B'
      ? 'var(--es-b-stroke, #dc2626)'
      : 'var(--es-neutral-stroke, #475569)';

  const renderSilhouette = () => {
    switch (actualType) {
      case 'dreamer':
        // Hooded figure with a small paper boat in pocket
        return (
          <g>
            <path d="M 24 6 C 18 6 14 12 14 20 L 14 40 L 34 40 L 34 20 C 34 12 30 6 24 6 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" strokeLinejoin="round" />
            <circle cx="24" cy="18" r="5" fill="#1e293b" />
            {/* Paper boat in pocket */}
            <path d="M 20 34 L 28 34 L 26 38 L 22 38 Z" fill="#ffffff" stroke={strokeClass} strokeWidth="1.5" />
            <path d="M 24 30 L 24 34" stroke={strokeClass} strokeWidth="1.5" />
          </g>
        );

      case 'keeper':
        // Child figure holding a sun disc
        return (
          <g>
            <circle cx="24" cy="12" r="6" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <path d="M 18 20 L 30 20 L 32 40 L 16 40 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            {/* Sun disc */}
            <circle cx="24" cy="27" r="4.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          </g>
        );

      case 'guide':
        // Tall figure with long coat collar and lantern-eye
        return (
          <g>
            <path d="M 16 42 L 20 18 L 28 18 L 32 42 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <path d="M 18 16 L 24 6 L 30 16 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            {/* Lantern-eye */}
            <polygon points="24,20 28,26 24,32 20,26" fill="#38bdf8" stroke={strokeClass} strokeWidth="1.5" />
          </g>
        );

      case 'footman':
        // Small round-headed child
        return (
          <g>
            <circle cx="24" cy="14" r="7" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <path d="M 17 23 L 31 23 L 33 41 L 15 41 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" strokeLinejoin="round" />
          </g>
        );

      case 'shade':
        // Horse-head silhouette made of shadow stripes
        return (
          <g>
            <path d="M 14 40 L 18 22 L 24 10 L 32 14 L 34 26 L 30 40 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <line x1="18" y1="24" x2="28" y2="24" stroke={strokeClass} strokeWidth="2" strokeDasharray="3 2" />
            <line x1="19" y1="30" x2="29" y2="30" stroke={strokeClass} strokeWidth="2" strokeDasharray="3 2" />
            <line x1="20" y1="36" x2="30" y2="36" stroke={strokeClass} strokeWidth="2" strokeDasharray="3 2" />
          </g>
        );

      case 'wind':
        // Diamond with three curved gust lines
        return (
          <g>
            <polygon points="24,6 40,24 24,42 8,24" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <path d="M 16 20 Q 24 16 30 20" stroke={strokeClass} strokeWidth="2" fill="none" />
            <path d="M 14 25 Q 24 21 34 25" stroke={strokeClass} strokeWidth="2" fill="none" />
            <path d="M 18 30 Q 24 26 30 30" stroke={strokeClass} strokeWidth="2" fill="none" />
          </g>
        );

      case 'beam':
        // Tall rectangle with a ray crown
        return (
          <g>
            <rect x="17" y="16" width="14" height="24" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <polygon points="15,16 24,6 33,16" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <line x1="24" y1="4" x2="24" y2="1" stroke={strokeClass} strokeWidth="2" />
            <line x1="16" y1="7" x2="13" y2="5" stroke={strokeClass} strokeWidth="2" />
            <line x1="32" y1="7" x2="35" y2="5" stroke={strokeClass} strokeWidth="2" />
          </g>
        );

      case 'scarecrow':
        // Cross-shaped post with a straw hat and tilted head
        return (
          <g>
            <line x1="24" y1="6" x2="24" y2="42" stroke={strokeClass} strokeWidth="3" />
            <line x1="10" y1="20" x2="38" y2="20" stroke={strokeClass} strokeWidth="3" />
            {/* Tilted head & hat */}
            <circle cx="25" cy="14" r="5" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <path d="M 16 11 Q 25 7 34 11 L 28 8 L 22 8 Z" fill="#eab308" stroke={strokeClass} strokeWidth="1.5" />
          </g>
        );

      case 'echo':
        // Dashed-outline footman (stroke-dasharray) at 60% opacity
        return (
          <g opacity="0.6">
            <circle cx="24" cy="14" r="7" fill="none" stroke={strokeClass} strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 17 23 L 31 23 L 33 41 L 15 41 Z" fill="none" stroke={strokeClass} strokeWidth="2" strokeDasharray="3 3" />
          </g>
        );

      case 'angel':
        // Figure with two wing triangles
        return (
          <g>
            <polygon points="12,14 22,22 10,32" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <polygon points="36,14 26,22 38,32" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <circle cx="24" cy="14" r="5" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <path d="M 20 21 L 28 21 L 29 40 L 19 40 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
          </g>
        );

      case 'investigator':
        // Grinning mouthless helmet with hatch lines
        return (
          <g>
            <path d="M 14 20 C 14 10 34 10 34 20 L 34 38 L 14 38 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <line x1="18" y1="22" x2="30" y2="22" stroke={strokeClass} strokeWidth="2" />
            <line x1="18" y1="27" x2="30" y2="27" stroke={strokeClass} strokeWidth="2" />
            <line x1="18" y1="32" x2="30" y2="32" stroke={strokeClass} strokeWidth="2" />
            <circle cx="20" cy="16" r="2" fill="#000" />
            <circle cx="28" cy="16" r="2" fill="#000" />
          </g>
        );

      case 'observer':
        // Single eye in a square badge
        return (
          <g>
            <rect x="10" y="10" width="28" height="28" fill={fillClass} stroke={strokeClass} strokeWidth="2" rx="2" />
            <path d="M 14 24 Q 24 15 34 24 Q 24 33 14 24 Z" fill="#ffffff" stroke={strokeClass} strokeWidth="1.5" />
            <circle cx="24" cy="24" r="4" fill="#0284c7" />
          </g>
        );

      case 'boat':
        // Folded paper boat
        return (
          <g>
            <polygon points="24,8 14,28 24,24" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <polygon points="24,8 34,28 24,24" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <polygon points="6,28 42,28 34,38 14,38" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
          </g>
        );

      case 'guest':
        // Faceless suit figure with a key
        return (
          <g>
            <rect x="17" y="10" width="14" height="12" fill={fillClass} stroke={strokeClass} strokeWidth="2" rx="3" />
            <path d="M 15 24 L 33 24 L 35 42 L 13 42 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            {/* Key */}
            <circle cx="24" cy="30" r="3" fill="none" stroke="#eab308" strokeWidth="1.5" />
            <line x1="24" y1="33" x2="24" y2="38" stroke="#eab308" strokeWidth="1.5" />
            <line x1="24" y1="36" x2="27" y2="36" stroke="#eab308" strokeWidth="1.5" />
          </g>
        );

      case 'undertow':
        // Wave crest with a hook
        return (
          <g>
            <path d="M 10 38 Q 24 30 28 16 Q 30 10 36 12 Q 38 18 32 26 Q 24 34 10 38 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <path d="M 28 16 L 36 14 L 34 20" stroke={strokeClass} strokeWidth="2" fill="none" />
          </g>
        );

      case 'rescuer':
        // White-shirt figure with open arms
        return (
          <g>
            <circle cx="24" cy="12" r="5" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <path d="M 18 20 L 30 20 L 32 40 L 16 40 Z" fill="#ffffff" stroke={strokeClass} strokeWidth="2" />
            <line x1="10" y1="22" x2="18" y2="22" stroke={strokeClass} strokeWidth="2.5" />
            <line x1="30" y1="22" x2="38" y2="22" stroke={strokeClass} strokeWidth="2.5" />
          </g>
        );

      case 'banded':
        // Figure with a red arm band
        return (
          <g>
            <circle cx="24" cy="12" r="6" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <path d="M 16 20 L 32 20 L 34 41 L 14 41 Z" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            {/* Red arm band */}
            <rect x="29" y="24" width="5" height="4" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          </g>
        );

      case 'crowd':
        // Round head cluster of three circles
        return (
          <g>
            <circle cx="24" cy="16" r="6" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <circle cx="16" cy="28" r="6" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <circle cx="32" cy="28" r="6" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
          </g>
        );

      case 'torchbearer':
        // Figure holding a flame, flat body
        return (
          <g>
            <rect x="18" y="18" width="12" height="22" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <circle cx="24" cy="12" r="4.5" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            {/* Flame */}
            <path d="M 33 22 Q 35 14 31 8 Q 38 12 37 20 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
            <line x1="30" y1="28" x2="35" y2="20" stroke={strokeClass} strokeWidth="2" />
          </g>
        );

      case 'kin':
        // Question-mark mask
        return (
          <g>
            <circle cx="24" cy="24" r="15" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
            <text x="24" y="31" fontSize="18" fontWeight="bold" textAnchor="middle" fill={strokeClass} fontFamily="monospace">
              ?
            </text>
          </g>
        );

      case 'watcher':
        // Tall shadow with two pale eyes
        return (
          <g>
            <path d="M 14 42 L 18 10 L 30 10 L 34 42 Z" fill="#0f172a" stroke="#000000" strokeWidth="2" />
            <ellipse cx="21" cy="18" rx="2" ry="3" fill="#ffffff" />
            <ellipse cx="27" cy="18" rx="2" ry="3" fill="#ffffff" />
          </g>
        );

      case 'yjkstra':
        // Hooded blade carrier, dark hand drawn as a filled shape
        return (
          <g>
            <path d="M 14 42 L 16 16 L 24 6 L 32 16 L 34 42 Z" fill="#18181b" stroke="#71717a" strokeWidth="2" />
            {/* Blade */}
            <line x1="34" y1="12" x2="42" y2="38" stroke="#cbd5e1" strokeWidth="2.5" />
            {/* Dark hand */}
            <circle cx="20" cy="28" r="3.5" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
          </g>
        );

      default:
        return (
          <circle cx="24" cy="24" r="14" fill={fillClass} stroke={strokeClass} strokeWidth="2" />
        );
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={`${side} ${type}`}
    >
      {renderSilhouette()}
    </svg>
  );
};
