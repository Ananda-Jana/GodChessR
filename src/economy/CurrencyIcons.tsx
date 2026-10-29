import React from 'react';

export interface CurrencyIconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * MugenGemIcon (無限ジェム)
 * Signature brilliant diamond facet cut with a radiant 4-point central vertical spark star.
 * Designed to scale crisply from small chips to large hero banners.
 */
export const MugenGemIcon: React.FC<CurrencyIconProps> = ({
  className = 'w-6 h-6 inline-block shrink-0',
  size,
  color,
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{
      ...(size ? { width: size, height: size } : {}),
      ...(color ? { color } : {}),
    }}
    aria-hidden="true"
  >
    <defs>
      {/* Radiant inner glow for high-fidelity gem luster */}
      <linearGradient id="gemFacetGradient" x1="50" y1="20" x2="50" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
        <stop offset="60%" stopColor="currentColor" stopOpacity="0.75" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
      </linearGradient>
    </defs>

    {/* Symmetrical Diamond Outer Silhouette */}
    <path
      d="M 28 42 L 50 85 L 72 42 L 62 26 L 38 26 Z"
      fill="currentColor"
    />

    {/* Upper Crown Table Cutout */}
    <path
      d="M 38 26 L 62 26 L 50 36 Z"
      fill="rgba(0, 0, 0, 0.45)"
    />

    {/* Left Crown Facet Cutout */}
    <path
      d="M 31 40 L 44 27 L 38 27 L 23 40 Z"
      fill="rgba(0, 0, 0, 0.65)"
    />

    {/* Right Crown Facet Cutout */}
    <path
      d="M 69 40 L 56 27 L 62 27 L 77 40 Z"
      fill="rgba(0, 0, 0, 0.65)"
    />

    {/* Left Lower Pavilion Facet Cutout */}
    <path
      d="M 32 44 L 48 44 L 48 78 Z"
      fill="rgba(0, 0, 0, 0.65)"
    />

    {/* Right Lower Pavilion Facet Cutout */}
    <path
      d="M 68 44 L 52 44 L 52 78 Z"
      fill="rgba(0, 0, 0, 0.65)"
    />

    {/* Central Shimmer Flashes */}
    <path
      d="M 50 38 L 54 44 L 50 74 L 46 44 Z"
      fill="rgba(255, 255, 255, 0.3)"
    />

    {/* Striking Central Vertical 4-Point Spark Star */}
    <path
      d="M 50 14 C 52.5 30, 54.5 37, 66 42 C 54.5 44.5, 52.5 49, 50 78 C 47.5 49, 45.5 44.5, 34 42 C 45.5 37, 47.5 30, 50 14 Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * MugenCryptoIcon (無限暗号)
 * Brutalist hexagonal quantum crystal cyber-shield with nested concentric geometry,
 * radiant vertex spokes, and an energetic quantum core atom.
 */
export const MugenCryptoIcon: React.FC<CurrencyIconProps> = ({
  className = 'w-6 h-6 inline-block shrink-0',
  size,
  color,
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{
      ...(size ? { width: size, height: size } : {}),
      ...(color ? { color } : {}),
    }}
    aria-hidden="true"
  >
    {/* Outer Hexagonal Protective Chassis */}
    <polygon
      points="50,6 88,28 88,72 50,94 12,72 12,28"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinejoin="round"
      fill="rgba(6, 182, 212, 0.15)"
    />

    {/* Concentric Inner Hexagon Lattice */}
    <polygon
      points="50,20 76,35 76,65 50,80 24,65 24,35"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinejoin="round"
      fill="rgba(0, 0, 0, 0.4)"
      opacity="0.8"
    />

    {/* Quantum Core Catalyst Atom */}
    <circle
      cx="50"
      cy="50"
      r="10.5"
      fill="currentColor"
    />
    <circle
      cx="50"
      cy="50"
      r="14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="3 3"
      opacity="0.8"
    />

    {/* Radiant Vertex Spoke Connectors */}
    <line x1="50" y1="20" x2="50" y2="6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="76" y1="35" x2="88" y2="28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="76" y1="65" x2="88" y2="72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="80" x2="50" y2="94" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="24" y1="65" x2="12" y2="72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="24" y1="35" x2="12" y2="28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

    {/* Center Highlight Spark */}
    <path
      d="M 50 44 L 51.5 48.5 L 56 50 L 51.5 51.5 L 50 56 L 48.5 51.5 L 44 50 L 48.5 48.5 Z"
      fill="#ffffff"
    />
  </svg>
);

/**
 * CurrencyAllocatedSlot
 * A dedicated, prominent container component specifically designed to allocate
 * ample, high-contrast space for currency icons inside buttons, badges, and cards.
 */
export const CurrencyAllocatedSlot: React.FC<{
  type: 'gem' | 'crypto';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ type, size = 'md', className = '' }) => {
  const containerDimensions = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-8 h-8 sm:w-9 sm:h-9',
  }[size];

  const iconDimensions = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-6 h-6 sm:w-7 sm:h-7',
  }[size];

  if (type === 'gem') {
    return (
      <div
        className={`shrink-0 ${containerDimensions} rounded-[4px] bg-black/70 border border-amber-400/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center justify-center text-amber-400 group-hover:border-amber-300 transition-colors ${className}`}
        aria-hidden="true"
      >
        <MugenGemIcon className={`${iconDimensions} drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]`} />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 ${containerDimensions} rounded-[4px] bg-black/70 border border-yellow-400/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center justify-center text-yellow-400 group-hover:border-yellow-300 transition-colors ${className}`}
      aria-hidden="true"
    >
      <MugenCryptoIcon className={`${iconDimensions} drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]`} />
    </div>
  );
};
