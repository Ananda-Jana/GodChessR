import React from 'react';
import { DiagramPiece, FocalSquare } from './types';
import { ChessPiece } from '../ChessPiece';
import { CullingPiece } from '../CullingPiece';
import { CullingPieceType } from '../../types/cullingGame';

interface RulebookBoardDiagramProps {
  cols: number; // 8 or 10
  rows: number; // 8
  pieces: DiagramPiece[];
  focalSquares?: FocalSquare[];
  notationSteps: string[];
  strategicGoals: string[];
  title: string;
  tagline: string;
  description: string;
  keySquares: string[];
}

const FILES_8 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const FILES_10 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

export const RulebookBoardDiagram: React.FC<RulebookBoardDiagramProps> = ({
  cols,
  rows,
  pieces,
  focalSquares = [],
  notationSteps,
  strategicGoals,
  title,
  tagline,
  description,
  keySquares,
}) => {
  const files = cols === 10 ? FILES_10 : FILES_8;
  const ranks = Array.from({ length: rows }, (_, i) => rows - i); // [8, 7, ..., 1]

  const pieceMap = React.useMemo(() => {
    const map = new Map<string, DiagramPiece>();
    for (const p of pieces) {
      map.set(p.square.toLowerCase(), p);
    }
    return map;
  }, [pieces]);

  const focalMap = React.useMemo(() => {
    const map = new Map<string, FocalSquare>();
    for (const f of focalSquares) {
      map.set(f.square.toLowerCase(), f);
    }
    return map;
  }, [focalSquares]);

  const renderPiece = (piece: DiagramPiece) => {
    const isCullingType = piece.type.startsWith('culling_');
    if (isCullingType) {
      return (
        <CullingPiece
          type={piece.type as CullingPieceType}
          color={piece.color}
          className="w-full h-full p-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        />
      );
    }
    return (
      <ChessPiece
        type={piece.type as any}
        color={piece.color}
        className="w-full h-full p-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
      />
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start bg-neutral-950 border-3 border-black dark:border-white p-4 sm:p-5 shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff]">
      {/* Board Stage */}
      <div className="flex flex-col items-center w-full lg:w-auto shrink-0">
        <div className="text-center mb-2">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-black block">
            {cols}x{rows} Formation Geometry
          </span>
          <span className="text-xs font-black uppercase text-white tracking-wide">
            {title}
          </span>
        </div>

        {/* The Grid Canvas */}
        <div className="relative border-4 border-black dark:border-white bg-[#0b0f17] p-1 shadow-[4px_4px_0px_#f59e0b]">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              width: cols === 10 ? 'clamp(280px, 80vw, 420px)' : 'clamp(280px, 75vw, 360px)',
              aspectRatio: `${cols} / ${rows}`,
            }}
          >
            {ranks.map((rankNum, rIdx) =>
              files.map((fileLetter, cIdx) => {
                const square = `${fileLetter}${rankNum}`;
                const isLight = (rIdx + cIdx) % 2 === 0;
                const piece = pieceMap.get(square);
                const focal = focalMap.get(square);

                // Highlight color calculation
                let highlightClass = isLight ? 'bg-slate-700/60' : 'bg-slate-900/80';
                if (focal) {
                  if (focal.variant === 'attack') {
                    highlightClass = 'bg-red-500/50 ring-2 ring-red-400 ring-inset';
                  } else if (focal.variant === 'defense') {
                    highlightClass = 'bg-blue-500/50 ring-2 ring-blue-400 ring-inset';
                  } else if (focal.variant === 'fortress') {
                    highlightClass = 'bg-emerald-500/50 ring-2 ring-emerald-400 ring-inset';
                  } else {
                    highlightClass = 'bg-amber-400/50 ring-2 ring-amber-300 ring-inset';
                  }
                }

                return (
                  <div
                    key={square}
                    className={`relative flex items-center justify-center select-none transition-all ${highlightClass}`}
                    style={{ aspectRatio: '1 / 1' }}
                    title={`${square.toUpperCase()}${piece ? ` - ${piece.color} ${piece.type}` : ''}${focal?.label ? ` (${focal.label})` : ''}`}
                  >
                    {/* Coordinate Micro Labels on borders */}
                    {cIdx === 0 && (
                      <span className="absolute top-0.5 left-0.5 text-[8px] font-mono font-bold text-neutral-400 leading-none select-none">
                        {rankNum}
                      </span>
                    )}
                    {rIdx === rows - 1 && (
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold text-neutral-400 leading-none select-none">
                        {fileLetter}
                      </span>
                    )}

                    {/* Piece Rendering */}
                    {piece && (
                      <div className="w-full h-full relative z-10 flex items-center justify-center">
                        {renderPiece(piece)}
                      </div>
                    )}

                    {/* Focal Marker Indicator */}
                    {focal && !piece && (
                      <div className="w-2.5 h-2.5 rounded-none bg-amber-400 rotate-45 ring-1 ring-white" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[10px] font-mono uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-400 ring-1 ring-white inline-block" />
            <span className="text-neutral-300">Key Outpost</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500 ring-1 ring-white inline-block" />
            <span className="text-neutral-300">Attack Vector</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 ring-1 ring-white inline-block" />
            <span className="text-neutral-300">Fortress Node</span>
          </div>
        </div>
      </div>

      {/* Blueprint Tactical Dossier */}
      <div className="flex-1 flex flex-col gap-4 text-xs">
        <div>
          <div className="text-[11px] font-mono uppercase text-amber-400 font-bold tracking-widest">
            Tactical Dossier
          </div>
          <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-amber-300 font-mono italic mt-0.5">
            "{tagline}"
          </p>
          <p className="text-neutral-300 font-normal mt-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Move sequence steps */}
        <div className="p-3 bg-neutral-900 border-2 border-neutral-700">
          <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-2 flex items-center justify-between">
            <span>Canonical Move Sequence</span>
            <span className="font-mono text-neutral-400">Step-by-Step</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
            {notationSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-1.5 bg-black/60 border border-neutral-800"
              >
                <span className="w-5 h-5 flex items-center justify-center bg-amber-500 text-black font-black text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span className="text-neutral-200 font-bold truncate">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Goals & Invariants */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400" />
            <span>Core Strategic Objectives</span>
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-300">
            {strategicGoals.map((goal, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2 bg-neutral-900/60 border-l-2 border-amber-400"
              >
                <span className="text-amber-400 font-mono font-bold shrink-0">·</span>
                <span className="leading-normal">{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Squares Checklist */}
        {keySquares.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-neutral-800 text-[11px] font-mono">
            <span className="text-neutral-400 uppercase font-bold shrink-0">Critical Squares:</span>
            <div className="flex flex-wrap gap-1.5">
              {keySquares.map((sq) => (
                <span
                  key={sq}
                  className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase font-black"
                >
                  {sq}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
