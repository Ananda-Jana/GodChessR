/**
 * CullingOpeningVectorOverlay.tsx
 *
 * Renders high-contrast, thicker, semi-transparent Emerald Green & Deep Navy Blue
 * tactical move vectors directly over the 88-square Culling Game cross board.
 * Designed for crystal legibility across both cream (#F2EFE4) and crimson (#e11d48) squares.
 */

import React from 'react';
import type { CullingVectorArrow } from './types';

interface CullingOpeningVectorOverlayProps {
  arrows: CullingVectorArrow[];
  boardDimension: number;
}

export const CullingOpeningVectorOverlay: React.FC<CullingOpeningVectorOverlayProps> = ({
  arrows,
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
        {/* Primary Emerald Green Arrowhead with Deep Navy Casing */}
        <marker
          id="emerald-arrowhead"
          markerUnits="userSpaceOnUse"
          markerWidth="38"
          markerHeight="34"
          refX="28"
          refY="17"
          orient="auto"
        >
          <polygon
            points="2 2, 34 17, 2 32, 8 17"
            fill="#10b981"
            stroke="#1e3a8a"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </marker>

        {/* Secondary Deep Navy Blue Arrowhead */}
        <marker
          id="navy-arrowhead"
          markerUnits="userSpaceOnUse"
          markerWidth="36"
          markerHeight="32"
          refX="26"
          refY="16"
          orient="auto"
        >
          <polygon
            points="2 2, 32 16, 2 30, 8 16"
            fill="#1e3a8a"
            stroke="#bae6fd"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {arrows.map((arrow, idx) => {
        const rawStart = getCenter(arrow.from.x, arrow.from.y);
        const rawEnd = getCenter(arrow.to.x, arrow.to.y);

        const dx = rawEnd.cx - rawStart.cx;
        const dy = rawEnd.cy - rawStart.cy;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;

        // Inset start & end slightly so piece icons and target square remain clearly visible
        const startOffset = Math.min(20, len * 0.18);
        const endOffset = Math.min(24, len * 0.22);

        const x1 = rawStart.cx + ux * startOffset;
        const y1 = rawStart.cy + uy * startOffset;
        const x2 = rawEnd.cx - ux * endOffset;
        const y2 = rawEnd.cy - uy * endOffset;

        // Map legacy 'crimson' -> emerald, 'gold' -> navy
        const isEmerald = arrow.color === 'emerald' || arrow.color === 'crimson';
        const coreStroke = isEmerald ? '#10b981' : '#1e3a8a';
        const casingStroke = isEmerald ? '#1e3a8a' : '#e0f2fe';
        const markerId = isEmerald ? 'emerald-arrowhead' : 'navy-arrowhead';
        const isDashed = arrow.style === 'dashed';

        // Place sequence label slightly toward origin (38% along shaft) to avoid covering middle pieces
        const badgeX = rawStart.cx + dx * 0.38;
        const badgeY = rawStart.cy + dy * 0.38;

        return (
          <g
            key={`arrow_${idx}_${arrow.from.x}_${arrow.from.y}`}
            opacity="0.78"
          >
            <title>
              {isEmerald ? 'Recommended move' : 'Tactical accent'} vector from ({arrow.from.x}, {arrow.from.y}) to ({arrow.to.x}, {arrow.to.y})
              {arrow.label ? ` step ${arrow.label}` : ''}
            </title>

            {/* Origin Anchor Ring (Deep Navy Accent) */}
            <circle
              cx={rawStart.cx}
              cy={rawStart.cy}
              r="11"
              fill="#1e3a8a"
              stroke="#10b981"
              strokeWidth="3"
            />

            {/* Outer Contrast Casing Shaft */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={casingStroke}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={isDashed ? '22 14' : undefined}
            />

            {/* Thicker Core Vector Shaft */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={coreStroke}
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={isDashed ? '22 14' : undefined}
              markerEnd={`url(#${markerId})`}
            />

            {/* Sequence Label Badge (Deep Navy Pill Circle with Emerald Ring) */}
            {arrow.label && (
              <g transform={`translate(${badgeX}, ${badgeY})`}>
                <circle
                  r="16"
                  fill="#0f172a"
                  stroke={isEmerald ? '#10b981' : '#93c5fd'}
                  strokeWidth="3"
                />
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="14"
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
