import React from 'react';

interface MugenCryptoIconProps {
  className?: string;
  size?: number | string;
}

/**
 * MugenCryptoIcon
 * Distinct brutalist hexagonal quantum crystal atom icon component
 * for Mugen Crypto (無限暗号).
 */
export const MugenCryptoIcon: React.FC<MugenCryptoIconProps> = ({
  className = 'w-7 h-7 inline-block shrink-0',
  size,
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
  >
    {/* Outer Hexagonal Shield Frame */}
    <polygon
      points="50,6 88,28 88,72 50,94 12,72 12,28"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinejoin="round"
      fill="rgba(6, 182, 212, 0.15)"
    />

    {/* Inner Concentric Hexagon Grid */}
    <polygon
      points="50,20 76,35 76,65 50,80 24,65 24,35"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinejoin="round"
      fill="none"
      opacity="0.7"
    />

    {/* Quantum Core Atom / Energy Catalyst */}
    <circle
      cx="50"
      cy="50"
      r="10"
      fill="currentColor"
    />

    {/* Radiant Vertex Spoke Connectors */}
    <line x1="50" y1="20" x2="50" y2="6" stroke="currentColor" strokeWidth="4" />
    <line x1="76" y1="35" x2="88" y2="28" stroke="currentColor" strokeWidth="4" />
    <line x1="76" y1="65" x2="88" y2="72" stroke="currentColor" strokeWidth="4" />
    <line x1="50" y1="80" x2="50" y2="94" stroke="currentColor" strokeWidth="4" />
    <line x1="24" y1="65" x2="12" y2="72" stroke="currentColor" strokeWidth="4" />
    <line x1="24" y1="35" x2="12" y2="28" stroke="currentColor" strokeWidth="4" />

    {/* Center Spark Star Accent */}
    <path
      d="M 50 38 L 52 48 L 62 50 L 52 52 L 50 62 L 48 52 L 38 50 L 48 48 Z"
      fill="#ffffff"
    />
  </svg>
);
