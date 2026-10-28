/**
 * CullingOpeningVectorOverlay.tsx
 *
 * Renders sleek, crisp black tactical arrows with a thin white border
 * over the 88-square Culling Game cross board in Culling Game Dojo.
 * Supports both straight vectors and true mathematical circular-arc vectors.
 */

import React from 'react';
import type { CullingVectorArrow } from './types';

export type VectorCurveMode = 'auto' | 'straight' | 'arc';
export type VectorThicknessPreset = 'thin' | 'medium' | 'thick';

export interface FlexibleCullingVectorArrow extends CullingVectorArrow {
  /** 'straight' for linear shaft, 'arc' for circular arc, or 'auto' (default) */
  curve?: VectorCurveMode;
  /**
   * Optional signed arc sagitta ratio (relative to chord length, e.g. 0.2 or -0.2)
   * or 0 for straight. Positive bends counter-clockwise normal; negative bends clockwise normal.
   */
  bend?: number;
  /** Optional explicit arc sweep preference when curve='arc' */
  sweep?: 'cw' | 'ccw';
  /** Optional per-arrow shaft thickness override */
  thickness?: VectorThicknessPreset | number;
}

interface CullingOpeningVectorOverlayProps {
  arrows: FlexibleCullingVectorArrow[];
  boardDimension: number;
  /** Default curve behavior across arrows when per-arrow `curve` is omitted ('auto' by default) */
  defaultCurve?: VectorCurveMode;
  /** Default arc bend ratio when curving (default 0.20) */
  defaultBend?: number;
  /** Overall arrow thickness preset or shaft width in 1000-unit SVG space (default 'medium') */
  thickness?: VectorThicknessPreset | number;
  /** Overall arrow opacity (default 0.9) */
  opacity?: number;
}

interface ArrowDimensions {
  shaftHalfW: number;
  headHalfW: number;
  headLen: number;
  barbSweep: number;
  borderWidth: number;
}

function resolveArrowDimensions(thickness: VectorThicknessPreset | number = 'medium'): ArrowDimensions {
  if (typeof thickness === 'number' && Number.isFinite(thickness)) {
    const clampedShaft = Math.max(4, Math.min(16, thickness));
    const half = clampedShaft / 2;
    return {
      shaftHalfW: half,
      headHalfW: half * 2.45,
      headLen: half * 4.9,
      barbSweep: half * 0.72,
      borderWidth: 2.0,
    };
  }

  switch (thickness) {
    case 'thin':
      return {
        shaftHalfW: 3.1,
        headHalfW: 8.2,
        headLen: 17.5,
        barbSweep: 2.4,
        borderWidth: 1.8,
      };
    case 'thick':
      return {
        shaftHalfW: 5.5,
        headHalfW: 13.0,
        headLen: 25.0,
        barbSweep: 3.6,
        borderWidth: 2.2,
      };
    case 'medium':
    default:
      return {
        shaftHalfW: 4.1,
        headHalfW: 10.2,
        headLen: 20.5,
        barbSweep: 2.9,
        borderWidth: 2.0,
      };
  }
}

const fmt = (n: number) => Number(n.toFixed(2));

export const CullingOpeningVectorOverlay: React.FC<CullingOpeningVectorOverlayProps> = ({
  arrows,
  defaultCurve = 'auto',
  defaultBend = 0.2,
  thickness = 'medium',
  opacity = 0.9,
}) => {
  if (!arrows || arrows.length === 0) return null;

  // Convert (x, y) board coordinate (x=0..6, y=0..6) to normalized 1000x1000 SVG pixel center
  const getCenter = (x: number, y: number) => ({
    cx: x * (1000 / 7) + (1000 / 14),
    cy: (6 - y) * (1000 / 7) + (1000 / 14),
  });

  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className="w-full h-full absolute inset-0 pointer-events-none z-30 overflow-visible"
    >
      {arrows.map((arrow, idx) => {
        const rawStart = getCenter(arrow.from.x, arrow.from.y);
        const rawEnd = getCenter(arrow.to.x, arrow.to.y);

        const dx = rawEnd.cx - rawStart.cx;
        const dy = rawEnd.cy - rawStart.cy;
        const chordLen = Math.hypot(dx, dy);
        if (chordLen < 1) return null;

        const dims = resolveArrowDimensions(arrow.thickness ?? thickness);
        const { shaftHalfW, headHalfW, headLen, barbSweep, borderWidth } = dims;
        const isDashed = arrow.style === 'dashed';

        // Unit chord & counter-clockwise screen normal
        const ux = dx / chordLen;
        const uy = dy / chordLen;
        const nx = -uy;
        const ny = ux;

        // Determine straight vs circular-arc sagitta `signedSagitta`
        const curveMode = arrow.curve ?? defaultCurve;
        const gridDx = Math.abs(arrow.to.x - arrow.from.x);
        const gridDy = Math.abs(arrow.to.y - arrow.from.y);
        const gridDist = Math.hypot(gridDx, gridDy);

        let signedSagitta = 0;

        if (typeof arrow.bend === 'number' && Number.isFinite(arrow.bend)) {
          signedSagitta = arrow.bend * chordLen;
        } else if (curveMode === 'straight') {
          signedSagitta = 0;
        } else {
          // 'arc' always curves; 'auto' curves multi-square leaps/vaults/strikes, L-jumps, or secondary vectors,
          // while keeping single-square adjacent steps crisp & straight.
          const isKnightLike = gridDx > 0 && gridDy > 0 && gridDx !== gridDy;
          const isMultiSquareSpan = gridDist > 1.45;
          const shouldArc = curveMode === 'arc' || isKnightLike || isMultiSquareSpan || idx > 0;

          if (shouldArc) {
            const mag = Math.min(44, Math.max(20, chordLen * Math.abs(defaultBend)));
            let dirSign = 1;

            if (arrow.sweep === 'cw') {
              dirSign = -1;
            } else if (arrow.sweep === 'ccw') {
              dirSign = 1;
            } else {
              // Bow gently toward the board center (500, 500) when near outer colony arms so arcs stay comfortably inside the grid
              const midX = (rawStart.cx + rawEnd.cx) * 0.5;
              const midY = (rawStart.cy + rawEnd.cy) * 0.5;
              const plusDistSq = (midX + nx * mag - 500) ** 2 + (midY + ny * mag - 500) ** 2;
              const minusDistSq = (midX - nx * mag - 500) ** 2 + (midY - ny * mag - 500) ** 2;
              dirSign = plusDistSq <= minusDistSq ? 1 : -1;
            }

            signedSagitta = dirSign * mag;
          }
        }

        // Clamp sagitta so the circular arc always remains a clean minor arc
        const maxSagitta = chordLen * 0.4;
        if (Math.abs(signedSagitta) > maxSagitta) {
          signedSagitta = Math.sign(signedSagitta) * maxSagitta;
        }

        const startOffset = Math.min(20, chordLen * 0.2);
        const endOffset = Math.min(18, chordLen * 0.18);

        let unifiedArrowPath = '';
        let dashedShaftPath = '';
        let dashedHeadPath = '';
        let badgeX = rawStart.cx + dx * 0.4;
        let badgeY = rawStart.cy + dy * 0.4;

        if (Math.abs(signedSagitta) < 1) {
          // ===================================================================
          // STRAIGHT VECTOR GEOMETRY
          // ===================================================================
          const usableLen = Math.max(headLen + 6, chordLen - startOffset - endOffset);
          const adjStartOffset = (chordLen - usableLen) * 0.52;
          const adjEndOffset = chordLen - usableLen - adjStartOffset;

          const tailX = rawStart.cx + ux * adjStartOffset;
          const tailY = rawStart.cy + uy * adjStartOffset;
          const tipX = rawEnd.cx - ux * adjEndOffset;
          const tipY = rawEnd.cy - uy * adjEndOffset;
          const neckX = tipX - ux * headLen;
          const neckY = tipY - uy * headLen;

          const tailLX = tailX + nx * shaftHalfW;
          const tailLY = tailY + ny * shaftHalfW;
          const tailRX = tailX - nx * shaftHalfW;
          const tailRY = tailY - ny * shaftHalfW;

          const neckLX = neckX + nx * shaftHalfW;
          const neckLY = neckY + ny * shaftHalfW;
          const neckRX = neckX - nx * shaftHalfW;
          const neckRY = neckY - ny * shaftHalfW;

          const wingBaseX = neckX - ux * barbSweep;
          const wingBaseY = neckY - uy * barbSweep;
          const wingLX = wingBaseX + nx * headHalfW;
          const wingLY = wingBaseY + ny * headHalfW;
          const wingRX = wingBaseX - nx * headHalfW;
          const wingRY = wingBaseY - ny * headHalfW;

          unifiedArrowPath = [
            `M ${fmt(tailLX)} ${fmt(tailLY)}`,
            `L ${fmt(neckLX)} ${fmt(neckLY)}`,
            `L ${fmt(wingLX)} ${fmt(wingLY)}`,
            `L ${fmt(tipX)} ${fmt(tipY)}`,
            `L ${fmt(wingRX)} ${fmt(wingRY)}`,
            `L ${fmt(neckRX)} ${fmt(neckRY)}`,
            `L ${fmt(tailRX)} ${fmt(tailRY)}`,
            `A ${fmt(shaftHalfW)} ${fmt(shaftHalfW)} 0 0 0 ${fmt(tailLX)} ${fmt(tailLY)}`,
            'Z',
          ].join(' ');

          dashedShaftPath = `M ${fmt(tailX)} ${fmt(tailY)} L ${fmt(neckX)} ${fmt(neckY)}`;
          dashedHeadPath = [
            `M ${fmt(neckLX)} ${fmt(neckLY)}`,
            `L ${fmt(wingLX)} ${fmt(wingLY)}`,
            `L ${fmt(tipX)} ${fmt(tipY)}`,
            `L ${fmt(wingRX)} ${fmt(wingRY)}`,
            `L ${fmt(neckRX)} ${fmt(neckRY)}`,
            'Z',
          ].join(' ');

          badgeX = tailX + (neckX - tailX) * 0.44;
          badgeY = tailY + (neckY - tailY) * 0.44;
        } else {
          // ===================================================================
          // TRUE CIRCULAR ARC VECTOR GEOMETRY
          // ===================================================================
          const s = Math.abs(signedSagitta);
          const sgn = signedSagitta >= 0 ? 1 : -1;
          const bowX = sgn * nx;
          const bowY = sgn * ny;

          // Circle radius R from chord length and sagitta: R = L^2 / (8s) + s / 2
          const R = (chordLen * chordLen) / (8 * s) + s * 0.5;
          const midX = (rawStart.cx + rawEnd.cx) * 0.5;
          const midY = (rawStart.cy + rawEnd.cy) * 0.5;

          // Circle center O lies (R - s) opposite the bow direction from chord midpoint
          const ox = midX - bowX * (R - s);
          const oy = midY - bowY * (R - s);

          const thetaStart = Math.atan2(rawStart.cy - oy, rawStart.cx - ox);
          const thetaEnd = Math.atan2(rawEnd.cy - oy, rawEnd.cx - ox);

          let dTheta = thetaEnd - thetaStart;
          while (dTheta <= -Math.PI) dTheta += 2 * Math.PI;
          while (dTheta > Math.PI) dTheta -= 2 * Math.PI;

          const dir = dTheta >= 0 ? 1 : -1; // +1 = clockwise (SVG sweep=1), -1 = counter-clockwise (SVG sweep=0)
          const totalArcLen = R * Math.abs(dTheta);
          const usableArcLen = Math.max(headLen + 8, totalArcLen - startOffset - endOffset);
          const adjStart = (totalArcLen - usableArcLen) * 0.52;
          const adjEnd = totalArcLen - usableArcLen - adjStart;

          const theta1 = thetaStart + dir * (adjStart / R);
          const thetaNeck = thetaEnd - dir * ((adjEnd + headLen) / R);

          const rOuter = R + shaftHalfW;
          const rInner = Math.max(4, R - shaftHalfW);

          const cos1 = Math.cos(theta1);
          const sin1 = Math.sin(theta1);
          const cosN = Math.cos(thetaNeck);
          const sinN = Math.sin(thetaNeck);

          // Unit forward tangent along the circle at thetaNeck
          const tanNX = dir * -sinN;
          const tanNY = dir * cosN;

          const outerStartX = ox + rOuter * cos1;
          const outerStartY = oy + rOuter * sin1;
          const innerStartX = ox + rInner * cos1;
          const innerStartY = oy + rInner * sin1;

          const centerStartX = ox + R * cos1;
          const centerStartY = oy + R * sin1;
          const centerNeckX = ox + R * cosN;
          const centerNeckY = oy + R * sinN;

          const outerNeckX = ox + rOuter * cosN;
          const outerNeckY = oy + rOuter * sinN;
          const innerNeckX = ox + rInner * cosN;
          const innerNeckY = oy + rInner * sinN;

          // Symmetric arrowhead aligned with instantaneous circle tangent at thetaNeck
          const outerWingX = ox + (R + headHalfW) * cosN - barbSweep * tanNX;
          const outerWingY = oy + (R + headHalfW) * sinN - barbSweep * tanNY;
          const innerWingX = ox + (R - headHalfW) * cosN - barbSweep * tanNX;
          const innerWingY = oy + (R - headHalfW) * sinN - barbSweep * tanNY;
          const tipX = centerNeckX + tanNX * headLen;
          const tipY = centerNeckY + tanNY * headLen;

          const sweepFlag = dir === 1 ? 1 : 0;
          const invSweepFlag = dir === 1 ? 0 : 1;

          unifiedArrowPath = [
            `M ${fmt(outerStartX)} ${fmt(outerStartY)}`,
            `A ${fmt(rOuter)} ${fmt(rOuter)} 0 0 ${sweepFlag} ${fmt(outerNeckX)} ${fmt(outerNeckY)}`,
            `L ${fmt(outerWingX)} ${fmt(outerWingY)}`,
            `L ${fmt(tipX)} ${fmt(tipY)}`,
            `L ${fmt(innerWingX)} ${fmt(innerWingY)}`,
            `L ${fmt(innerNeckX)} ${fmt(innerNeckY)}`,
            `A ${fmt(rInner)} ${fmt(rInner)} 0 0 ${invSweepFlag} ${fmt(innerStartX)} ${fmt(innerStartY)}`,
            `A ${fmt(shaftHalfW)} ${fmt(shaftHalfW)} 0 0 ${sweepFlag} ${fmt(outerStartX)} ${fmt(outerStartY)}`,
            'Z',
          ].join(' ');

          dashedShaftPath = `M ${fmt(centerStartX)} ${fmt(centerStartY)} A ${fmt(R)} ${fmt(R)} 0 0 ${sweepFlag} ${fmt(centerNeckX)} ${fmt(centerNeckY)}`;
          dashedHeadPath = [
            `M ${fmt(outerNeckX)} ${fmt(outerNeckY)}`,
            `L ${fmt(outerWingX)} ${fmt(outerWingY)}`,
            `L ${fmt(tipX)} ${fmt(tipY)}`,
            `L ${fmt(innerWingX)} ${fmt(innerWingY)}`,
            `L ${fmt(innerNeckX)} ${fmt(innerNeckY)}`,
            'Z',
          ].join(' ');

          const thetaBadge = theta1 + (thetaNeck - theta1) * 0.45;
          badgeX = ox + R * Math.cos(thetaBadge);
          badgeY = oy + R * Math.sin(thetaBadge);
        }

        return (
          <g
            key={`arrow_${idx}_${arrow.from.x}_${arrow.from.y}_${arrow.to.x}_${arrow.to.y}`}
            opacity={isDashed ? opacity * 0.92 : opacity}
          >
            <title>
              Move vector from ({arrow.from.x}, {arrow.from.y}) to ({arrow.to.x}, {arrow.to.y})
              {arrow.label ? ` step ${arrow.label}` : ''}
            </title>

            {!isDashed ? (
              <path
                d={unifiedArrowPath}
                fill="#09090b"
                stroke="#ffffff"
                strokeWidth={borderWidth}
                strokeLinejoin="round"
              />
            ) : (
              <>
                {/* Thin white border around each black dash segment */}
                <path
                  d={dashedShaftPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={shaftHalfW * 2 + borderWidth * 1.8}
                  strokeLinecap="round"
                  strokeDasharray="13 13"
                />
                <path
                  d={dashedShaftPath}
                  fill="none"
                  stroke="#09090b"
                  strokeWidth={shaftHalfW * 2 - 0.2}
                  strokeLinecap="round"
                  strokeDasharray="13 13"
                />
                <path
                  d={dashedHeadPath}
                  fill="#09090b"
                  stroke="#ffffff"
                  strokeWidth={borderWidth}
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Sleek Step Badge (Black with Thin White Border) */}
            {arrow.label && (
              <g transform={`translate(${fmt(badgeX)}, ${fmt(badgeY)})`}>
                <circle
                  r="11.5"
                  fill="#09090b"
                  stroke="#ffffff"
                  strokeWidth="1.75"
                />
                <text
                  x="0"
                  y="3.8"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
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

