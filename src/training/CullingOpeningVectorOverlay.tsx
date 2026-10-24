/**
 * CullingOpeningVectorOverlay.tsx
 *
 * Renders glowing SVG move vectors, numbered crimson arrows, and gold dashed threat lines
 * directly over the 88-square Culling Game cross board.
 */

import React from 'react';
import type { CullingVectorArrow } from './types';

interface CullingOpeningVectorOverlayProps {
  arrows: CullingVectorArrow[];
  boardDimension: number; // e.g. 400px
}

export const CullingOpeningVectorOverlay: React.FC<CullingOpeningVectorOverlayProps> = ({
  arrows,
  boardDimension,
}) => {
  if (!arrows || arrows.length === 0) return null;

  // Convert (x, y) board coordinate (x=0..9, y=0..9) to normalized 1000x1000 SVG pixel center
  // 10x10 grid: each square is 100 units wide and 100 units high. Center is col*100 + 50, row*100 + 50.
  const getCenter = (x: number, y: number) => {
    const col = x;
    const row = 9 - y;
    return {
      cx: col * 100 + 50,
      cy: row * 100 + 50,
    };
  };

  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className="w-full h-full absolute inset-0 pointer-events-none z-30 overflow-visible"
    >
      <defs>
        {/* Crimson Arrowhead */}
        <marker
          id="crimson-arrowhead"
          markerWidth="10"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" fill="#ef4444" />
        </marker>

        {/* Gold Arrowhead */}
        <marker
          id="gold-arrowhead"
          markerWidth="10"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" fill="#eab308" />
        </marker>

        {/* Glow Filters */}
        <filter id="glow-crimson" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {arrows.map((arrow, idx) => {
        const start = getCenter(arrow.from.x, arrow.from.y);
        const end = getCenter(arrow.to.x, arrow.to.y);

        const isCrimson = arrow.color === 'crimson';
        const strokeColor = isCrimson ? '#ef4444' : '#eab308';
        const markerId = isCrimson ? 'crimson-arrowhead' : 'gold-arrowhead';
        const filterId = isCrimson ? 'glow-crimson' : 'glow-gold';
        const isDashed = arrow.style === 'dashed';

        // Calculate midpoint for label badge
        const midX = (start.cx + end.cx) / 2;
        const midY = (start.cy + end.cy) / 2;

        return (
          <g key={`arrow_${idx}_${arrow.from.x}_${arrow.from.y}`}>
            <title>
              {isCrimson ? 'Recommended move' : 'Tactical threat'} vector from square ({arrow.from.x}, {arrow.from.y}) to ({arrow.to.x}, {arrow.to.y})
              {arrow.label ? ` step ${arrow.label}` : ''}
            </title>
            {/* Outer Glow Line */}
            <line
              x1={start.cx}
              y1={start.cy}
              x2={end.cx}
              y2={end.cy}
              stroke={strokeColor}
              strokeWidth="4"
              strokeOpacity="0.4"
              strokeDasharray={isDashed ? '6 4' : undefined}
              filter={`url(#${filterId})`}
            />

            {/* Core Vector Line */}
            <line
              x1={start.cx}
              y1={start.cy}
              x2={end.cx}
              y2={end.cy}
              stroke={strokeColor}
              strokeWidth="3"
              strokeDasharray={isDashed ? '6 4' : undefined}
              markerEnd={`url(#${markerId})`}
            />

            {/* Sequence Label Badge */}
            {arrow.label && (
              <g transform={`translate(${midX}, ${midY})`}>
                <circle
                  r="10"
                  fill={isCrimson ? '#991b1b' : '#854d0e'}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  className="shadow-lg"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="sans-serif"
                >
                  {arrow.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
