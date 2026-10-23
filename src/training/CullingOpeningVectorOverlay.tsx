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

  // Each square on 10x10 board is boardDimension / 10
  const squareSize = boardDimension / 10;

  // Convert (x, y) board coordinate (x=0..9, y=0..9) to SVG pixel center
  // Note: Culling board renders y=0 at bottom or top depending on perspective.
  // Standard Culling board renders y=0 at top (row 0 = rank 10), y=9 at bottom (row 9 = rank 1).
  const getCenter = (x: number, y: number) => {
    // In CullingBoard.tsx, rank Y is mapped to row = 9 - y or row = y.
    // In cullingEngine: White starts at y=1 and y=2 (ranks 1-2 at bottom), Black starts at y=8 and y=7.
    // Rendering: row = 9 - y, col = x.
    const col = x;
    const row = 9 - y;
    return {
      cx: col * squareSize + squareSize / 2,
      cy: row * squareSize + squareSize / 2,
    };
  };

  return (
    <svg
      viewBox={`0 0 ${boardDimension} ${boardDimension}`}
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
