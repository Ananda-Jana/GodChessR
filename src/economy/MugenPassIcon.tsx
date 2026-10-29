/**
 * MugenPassIcon.tsx - Custom SVG Ticket Pass Icon with $ Symbol
 * Inspired by image_a17115c5.png with ticket notches, dashed perforation, and center $ symbol.
 */

import React from 'react';

interface MugenPassIconProps {
  className?: string;
  size?: number;
  color?: string;
  active?: boolean;
}

export const MugenPassIcon: React.FC<MugenPassIconProps> = ({
  className = 'w-5 h-5',
  size,
  color = 'currentColor',
  active = false,
}) => {
  const width = size || 24;
  const height = size || 24;

  return (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Ticket Outline with Notches */}
      <path
        d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V9.5C20.1716 9.5 19.5 10.1716 19.5 11C19.5 11.8284 20.1716 12.5 21 12.5V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V12.5C3.82843 12.5 4.5 11.8284 4.5 11C4.5 10.1716 3.82843 9.5 3 9.5V6Z"
        fill={active ? '#fbbf24' : '#18181b'}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dashed Perforation Line on Right */}
      <line
        x1="16.5"
        y1="5.5"
        x2="16.5"
        y2="18.5"
        stroke={active ? '#000000' : color}
        strokeWidth="1.2"
        strokeDasharray="1.5 1.5"
      />

      {/* Center $ Symbol */}
      <text
        x="9.8"
        y="14.2"
        fill={active ? '#000000' : '#fbbf24'}
        fontSize="9.5"
        fontWeight="900"
        fontFamily="monospace"
        textAnchor="middle"
      >
        $
      </text>

      {/* Small Right Star Emblem */}
      <path
        d="M18.8 8.2L19.2 9L20 9.1L19.4 9.6L19.6 10.4L18.8 10L18 10.4L18.2 9.6L17.6 9.1L18.4 9L18.8 8.2Z"
        fill={active ? '#000000' : '#fbbf24'}
      />
    </svg>
  );
};
