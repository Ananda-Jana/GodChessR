import React from 'react';

interface MugenGemIconProps {
  className?: string;
  size?: number | string;
}

/**
 * MugenGemIcon
 * Replicates the symmetrical brilliant diamond with a striking central vertical spark star
 * matching /public/assets/aistudio/image_c0aa3eb5.png
 */
export const MugenGemIcon: React.FC<MugenGemIconProps> = ({
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
    {/* Symmetrical Diamond Outer Body */}
    <path
      d="M 28 42 L 50 84 L 72 42 L 62 28 L 38 28 Z"
      fill="currentColor"
    />

    {/* Left Crown Facet Cutout */}
    <path
      d="M 32 40 L 44 28 L 38 28 L 24 40 Z"
      fill="rgba(0, 0, 0, 0.65)"
    />

    {/* Right Crown Facet Cutout */}
    <path
      d="M 68 40 L 56 28 L 62 28 L 76 40 Z"
      fill="rgba(0, 0, 0, 0.65)"
    />

    {/* Left Pavilion Facet Cutout */}
    <path
      d="M 33 44 L 48 44 L 48 76 Z"
      fill="rgba(0, 0, 0, 0.65)"
    />

    {/* Right Pavilion Facet Cutout */}
    <path
      d="M 67 44 L 52 44 L 52 76 Z"
      fill="rgba(0, 0, 0, 0.65)"
    />

    {/* Striking Central Vertical 4-Point Spark Star */}
    <path
      d="M 50 16 C 52 32, 54 38, 64 42 C 54 44, 52 48, 50 76 C 48 48, 46 44, 36 42 C 46 38, 48 32, 50 16 Z"
      fill="currentColor"
    />
  </svg>
);
