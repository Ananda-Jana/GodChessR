import React from 'react';
import { PieceMovementDef } from './pieceMovementData';
import { ChessPiece } from '../ChessPiece';
import { CullingPiece } from '../CullingPiece';
import { CullingPieceType } from '../../types/cullingGame';

interface PieceMovementGridProps {
  item: PieceMovementDef;
}

export const PieceMovementGrid: React.FC<PieceMovementGridProps> = ({ item }) => {
  const gridSize = item.gridSize || 9;
  const radius = Math.floor(gridSize / 2); // 4 for 9x9, 3 for 7x7

  const offsetMap = React.useMemo(() => {
    const map = new Map<string, { isLeap?: boolean; isAbility?: boolean; label?: string }>();
    const offsets = item.getOffsets();
    offsets.forEach(o => {
      map.set(`${o.dx},${o.dy}`, o);
    });
    return map;
  }, [item]);

  const renderPiece = () => {
    const isCulling = item.pieceType.startsWith('culling_');
    if (isCulling) {
      return (
        <CullingPiece
          type={item.pieceType as CullingPieceType}
          color={item.pieceColor}
          className="w-full h-full p-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        />
      );
    }
    return (
      <ChessPiece
        type={item.pieceType as any}
        color={item.pieceColor}
        className="w-full h-full p-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
      />
    );
  };

  const rows = Array.from({ length: gridSize }, (_, r) => radius - r); // [4, 3, 2, 1, 0, -1, -2, -3, -4]
  const cols = Array.from({ length: gridSize }, (_, c) => c - radius); // [-4, -3, -2, -1, 0, 1, 2, 3, 4]

  return (
    <div className="flex flex-col items-center select-none">
      {/* Grid Canvas */}
      <div
        className="grid border-3 border-black dark:border-white bg-[#0a0e17] p-1 shadow-[4px_4px_0px_#f59e0b]"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: gridSize === 9 ? 'clamp(210px, 45vw, 260px)' : 'clamp(180px, 40vw, 220px)',
          aspectRatio: '1 / 1',
        }}
      >
        {rows.map((dy, rIdx) =>
          cols.map((dx, cIdx) => {
            const isCenter = dx === 0 && dy === 0;
            const isEven = (rIdx + cIdx) % 2 === 0;
            const offset = offsetMap.get(`${dx},${dy}`);

            let cellClass = isEven ? 'bg-slate-700/60' : 'bg-slate-900/80';
            let marker = null;

            if (isCenter) {
              cellClass = 'bg-black ring-2 ring-white ring-inset z-10';
            } else if (offset) {
              if (offset.isAbility) {
                cellClass = 'bg-purple-600 text-white ring-1 ring-purple-300 font-bold';
                if (offset.label) {
                  marker = <span className="text-[7px] font-mono leading-none font-black">{offset.label}</span>;
                }
              } else if (offset.isLeap) {
                cellClass = 'bg-emerald-400 text-black ring-1 ring-emerald-500 font-black';
                marker = <span className="text-[8px] font-mono leading-none">▲</span>;
              } else {
                cellClass = 'bg-amber-400 text-black ring-1 ring-amber-500';
              }
            }

            return (
              <div
                key={`${dx},${dy}`}
                className={`relative flex items-center justify-center p-0.5 transition-colors ${cellClass}`}
                style={{ aspectRatio: '1 / 1' }}
                title={
                  isCenter
                    ? `${item.name} Origin (0,0)`
                    : offset
                    ? `Reachable (${dx > 0 ? `+${dx}` : dx}, ${dy > 0 ? `+${dy}` : dy})${offset.isLeap ? ' [LEAP]' : ''}${offset.isAbility ? ' [ABILITY]' : ''}`
                    : `(${dx > 0 ? `+${dx}` : dx}, ${dy > 0 ? `+${dy}` : dy})`
                }
              >
                {isCenter ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {renderPiece()}
                  </div>
                ) : (
                  marker
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Mini Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2.5 text-[9px] font-mono uppercase">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-amber-400 ring-1 ring-white inline-block" />
          <span className="text-neutral-300">Slide / Step</span>
        </div>
        {item.canLeap && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-400 ring-1 ring-white inline-block flex items-center justify-center text-[7px] text-black font-black">
              ▲
            </span>
            <span className="text-emerald-300 font-bold">Leap / Jump</span>
          </div>
        )}
        {item.hasSpecialAbility && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-purple-600 ring-1 ring-white inline-block" />
            <span className="text-purple-300 font-bold">Technique</span>
          </div>
        )}
      </div>
    </div>
  );
};
