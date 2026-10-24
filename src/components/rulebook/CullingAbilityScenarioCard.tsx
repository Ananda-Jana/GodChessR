import React from 'react';
import { CullingAbilityScenario } from './cullingAbilityScenarios';
import { CullingPiece } from '../CullingPiece';
import { ChessPiece } from '../ChessPiece';
import { CullingPieceType } from '../../types/cullingGame';
import { Zap, Shield, Target, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

interface CullingAbilityScenarioCardProps {
  scenario: CullingAbilityScenario;
}

const FILES_7 = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

export const CullingAbilityScenarioCard: React.FC<CullingAbilityScenarioCardProps> = ({
  scenario,
}) => {
  const { boardCols, boardRows, scenarioPieces, arrows, highlights, technicalSpecs } = scenario;
  const files = FILES_7.slice(0, boardCols);
  const ranks = Array.from({ length: boardRows }, (_, i) => boardRows - i);

  const pieceMap = React.useMemo(() => {
    const map = new Map<string, { type: string; color: 'white' | 'black' }>();
    scenarioPieces.forEach((p) => map.set(p.square.toLowerCase(), p));
    return map;
  }, [scenarioPieces]);

  const highlightMap = React.useMemo(() => {
    const map = new Map<string, { variant: string; label?: string }>();
    highlights.forEach((h) => map.set(h.square.toLowerCase(), h));
    return map;
  }, [highlights]);

  // Coordinate mapper: 'c2' -> { xPercent, yPercent }
  const getSquareCenter = (square: string) => {
    const file = square[0].toLowerCase();
    const rank = parseInt(square.slice(1), 10);
    const colIdx = files.indexOf(file);
    const rowIdx = ranks.indexOf(rank);

    if (colIdx === -1 || rowIdx === -1) return { x: 50, y: 50 };

    const x = ((colIdx + 0.5) / boardCols) * 100;
    const y = ((rowIdx + 0.5) / boardRows) * 100;
    return { x, y };
  };

  // Compute curved paths that arch away from pieces with thin lines and small arrowheads
  const curvedArrows = React.useMemo(() => {
    return arrows.map((arr, aIdx) => {
      const p1 = getSquareCenter(arr.from);
      const p2 = getSquareCenter(arr.to);
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 1) return { path: '', badgePos: null, label: arr.label, dashed: arr.dashed };

      // Margin from piece centers so arrow starts and ends clearly outside the piece boundary
      const margin = Math.min(dist * 0.32, 5.0);
      const startX = p1.x + (dx / dist) * margin;
      const startY = p1.y + (dy / dist) * margin;
      const endX = p2.x - (dx / dist) * margin;
      const endY = p2.y - (dy / dist) * margin;

      // Normal perpendicular unit vector (-dy, dx)
      const nx = -dy / dist;
      const ny = dx / dist;

      // Curve deflection distance (arcs away from straight line to avoid occluding middle pieces)
      const bendDir = aIdx % 2 === 0 ? 1 : -1;
      const bendDist = Math.min(16, Math.max(9, dist * 0.35)) * bendDir;

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      // Quadratic bezier control point arched outward
      const ctrlX = midX + nx * bendDist;
      const ctrlY = midY + ny * bendDist;

      const path = `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;

      // Badge floats near the apex of the arc, offset further out so squares and pieces remain 100% visible
      const badgeOffset = bendDist + (bendDir > 0 ? 4 : -4);
      const badgeX = Math.max(8, Math.min(92, midX + nx * badgeOffset));
      const badgeY = Math.max(8, Math.min(92, midY + ny * badgeOffset));

      return {
        path,
        badgePos: { x: badgeX, y: badgeY },
        label: arr.label,
        dashed: arr.dashed,
      };
    });
  }, [arrows, boardCols, boardRows]);

  const renderPiece = (piece: { type: string; color: 'white' | 'black' }) => {
    if (piece.type.startsWith('culling_')) {
      return (
        <CullingPiece
          type={piece.type as CullingPieceType}
          color={piece.color}
          className="w-full h-full p-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
        />
      );
    }
    return (
      <ChessPiece
        type={piece.type as any}
        color={piece.color}
        className="w-full h-full p-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
      />
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start bg-neutral-950 border-3 border-black dark:border-white p-4 sm:p-5 shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff]">
      {/* Board Visual Stage with Curved Arrow Overlay */}
      <div className="flex flex-col items-center w-full lg:w-auto shrink-0">
        <div className="text-center mb-1.5 w-full">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-amber-400 uppercase font-black">
            <span>{scenario.role} Role</span>
            <span>•</span>
            <span className="text-neutral-400">
              {scenario.characterName} / {scenario.counterpartName}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-black uppercase text-white tracking-wide block truncate">
            {scenario.abilityName}
          </span>
        </div>

        {/* Board Canvas with Absolute SVG Arrow Layer */}
        <div className="relative border-4 border-black dark:border-white bg-[#080d1a] p-1 shadow-[4px_4px_0px_#f59e0b]">
          {/* Base Grid */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${boardCols}, minmax(0, 1fr))`,
              width: 'clamp(240px, 75vw, 310px)',
              aspectRatio: `${boardCols} / ${boardRows}`,
            }}
          >
            {ranks.map((rankNum, rIdx) =>
              files.map((fileLetter, cIdx) => {
                const sq = `${fileLetter}${rankNum}`;
                const isEven = (rIdx + cIdx) % 2 === 0;
                const piece = pieceMap.get(sq);
                const hl = highlightMap.get(sq);

                let bgClass = isEven ? 'bg-slate-700/60' : 'bg-slate-900/80';
                if (hl) {
                  if (hl.variant === 'origin') {
                    bgClass = 'bg-blue-600/50 ring-2 ring-blue-300 ring-inset';
                  } else if (hl.variant === 'target') {
                    bgClass = 'bg-red-600/60 ring-2 ring-red-400 ring-inset';
                  } else if (hl.variant === 'aoe') {
                    bgClass = 'bg-purple-600/50 ring-2 ring-purple-300 ring-inset';
                  } else if (hl.variant === 'danger') {
                    bgClass = 'bg-amber-500/50 ring-2 ring-amber-300 ring-inset';
                  } else if (hl.variant === 'ratio') {
                    bgClass = 'bg-emerald-500/60 ring-2 ring-emerald-300 ring-inset';
                  } else if (hl.variant === 'ally') {
                    bgClass = 'bg-teal-600/60 ring-2 ring-teal-300 ring-inset';
                  }
                }

                return (
                  <div
                    key={sq}
                    className={`relative flex items-center justify-center p-0.5 select-none ${bgClass}`}
                    style={{ aspectRatio: '1 / 1' }}
                    title={`${sq.toUpperCase()}${piece ? ` - ${piece.color} ${piece.type}` : ''}${hl?.label ? ` (${hl.label})` : ''}`}
                  >
                    {/* Coordinate Markers */}
                    {cIdx === 0 && (
                      <span className="absolute top-0.5 left-0.5 text-[8px] font-mono font-bold text-neutral-400 leading-none">
                        {rankNum}
                      </span>
                    )}
                    {rIdx === boardRows - 1 && (
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold text-neutral-400 leading-none">
                        {fileLetter}
                      </span>
                    )}

                    {piece && (
                      <div className="w-full h-full relative z-10 flex items-center justify-center">
                        {renderPiece(piece)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* SVG Overlay Layer for Bent / Curved Thin Directional Arrows */}
          <svg
            className="absolute inset-1 pointer-events-none z-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Minimalist Thin High-Contrast Arrowhead (Small, neat, non-occluding) */}
              <marker
                id={`arrowhead-bw-${scenario.id}`}
                markerWidth="4"
                markerHeight="4"
                refX="2.8"
                refY="1.75"
                orient="auto"
              >
                <path d="M 0 0.5 L 3 1.75 L 0 3 Z" fill="#ffffff" stroke="#000000" strokeWidth="0.4" />
              </marker>
            </defs>

            {curvedArrows.map((arr, aIdx) => {
              if (!arr.path) return null;
              return (
                <g key={aIdx}>
                  {/* Subtle Dark Shadow Outline */}
                  <path
                    d={arr.path}
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeDasharray={arr.dashed ? '3,3' : undefined}
                  />
                  {/* Thin White Core Arrow Line */}
                  <path
                    d={arr.path}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeDasharray={arr.dashed ? '3,3' : undefined}
                    markerEnd={`url(#arrowhead-bw-${scenario.id})`}
                  />
                </g>
              );
            })}
          </svg>

          {/* Curved Arrow Annotated Callout Badges (Floats along outer arc) */}
          {curvedArrows.map((arr, aIdx) => {
            if (!arr.label || !arr.badgePos) return null;

            return (
              <div
                key={`badge-${aIdx}`}
                className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${arr.badgePos.x}%`, top: `${arr.badgePos.y}%` }}
              >
                <span className="px-1.5 py-0.5 bg-black/95 text-white border border-neutral-400 text-[7px] font-mono font-bold tracking-tight uppercase whitespace-nowrap shadow-[1px_1px_0px_#000]">
                  {arr.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[9px] font-mono uppercase">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-blue-500 ring-1 ring-white inline-block" />
            <span className="text-neutral-300">Origin</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-red-600 ring-1 ring-white inline-block" />
            <span className="text-neutral-300">Target</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-teal-600 ring-1 ring-white inline-block" />
            <span className="text-neutral-300">Intervening Ally</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-white border-t border-black inline-block" />
            <span className="text-neutral-300">Thin Curved Vector</span>
          </div>
        </div>
      </div>

      {/* Scenario Breakdown & Pure Technical Specifications */}
      <div className="flex-1 flex flex-col gap-3 text-xs w-full">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-400 text-black font-black text-[10px] uppercase font-mono tracking-wider">
              {scenario.role}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              White: {scenario.characterName} | Black: {scenario.counterpartName}
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-black uppercase text-amber-300 tracking-tight flex items-center gap-2">
            <span>{scenario.abilityName}</span>
          </h4>
          <p className="text-neutral-200 font-mono mt-1 leading-relaxed">
            {scenario.techniqueExplanation}
          </p>
        </div>

        {/* Technical Specification Matrix */}
        {technicalSpecs && (
          <div className="p-3 bg-neutral-900 border-2 border-neutral-700 font-mono text-[11px] space-y-1.5">
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 pb-1 border-b border-neutral-800">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Technical Engine Specification</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300 pt-1">
              <div>
                <strong className="text-white">Base Movement:</strong> {technicalSpecs.movementProfile}
              </div>
              <div>
                <strong className="text-white">Leap Mechanics:</strong> {technicalSpecs.leapRadius}
              </div>
              <div>
                <strong className="text-white">Coordinate Offsets:</strong> {technicalSpecs.coordinateOffsets}
              </div>
              <div>
                <strong className="text-white">Capture Invariant:</strong> {technicalSpecs.captureCondition}
              </div>
            </div>
            {technicalSpecs.specialRestrictions && (
              <div className="text-[10px] text-amber-200/90 pt-1 border-t border-neutral-800">
                <strong className="text-amber-400">Engine Restriction:</strong>{' '}
                {technicalSpecs.specialRestrictions}
              </div>
            )}
          </div>
        )}

        {/* Activation Invariant & Prerequisite */}
        <div className="p-2.5 bg-neutral-900/90 border border-neutral-700 font-mono">
          <span className="text-[10px] font-black uppercase text-sky-400 block mb-0.5 flex items-center gap-1">
            <Zap className="w-3 h-3 text-sky-400" />
            <span>Engine Validation Rule:</span>
          </span>
          <p className="text-xs text-neutral-300 font-mono">{scenario.activationCondition}</p>
        </div>

        {/* Student Takeaway Box */}
        <div className="p-3 bg-amber-950/30 border-2 border-amber-500/80 font-mono">
          <span className="text-[10px] font-black uppercase text-amber-400 block mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Competitive Gameplay Application:</span>
          </span>
          <p className="text-xs text-amber-100 leading-relaxed font-bold">
            {scenario.studentTakeaway}
          </p>
        </div>
      </div>
    </div>
  );
};
