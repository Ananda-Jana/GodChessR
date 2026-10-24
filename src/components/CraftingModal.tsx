import React, { useState, useEffect, useMemo } from 'react';
import { PieceColor, PieceType } from '../types/game';
import { CRAFTABLE_PIECES, CRAFTABLE_MAP, getCraftablePreviewOffsets, CraftablePieceDef } from '../game/craftables';
import { ChessPiece } from './ChessPiece';
import { useTheme } from '../context/ThemeContext';
import { Hammer, Clock, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useModalFocus } from '../utils/useModalFocus';

interface CraftingModalProps {
  playerColor: PieceColor;
  onConfirmPiece: (pieceType: PieceType) => void;
  onAutoPick: () => void;
  onCancel?: () => void;
  expiresAt: number;
  hasValidSquares: boolean;
}

export const CraftingModal: React.FC<CraftingModalProps> = ({
  playerColor,
  onConfirmPiece,
  onAutoPick,
  onCancel,
  expiresAt,
  hasValidSquares,
}) => {
  const { theme } = useTheme();
  const isThemeLight = theme === 'light';
  
  // Keyboard focus trap with Escape handling
  const modalRef = useModalFocus(true, () => {
    if (onCancel) onCancel();
    else onAutoPick();
  }, true);

  // Step 1: Selection list; Step 2: Inspection & 9x9 preview window
  const [selectedPieceId, setSelectedPieceId] = useState<PieceType | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(() =>
    Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onAutoPick();
      }
    }, 250);

    return () => clearInterval(timer);
  }, [expiresAt, onAutoPick]);

  const selectedDef = selectedPieceId ? CRAFTABLE_MAP[selectedPieceId] : null;

  // Static 9x9 preview grid offset set - generated ONCE strictly from engine data
  const reachableOffsetsSet = useMemo(() => {
    if (!selectedDef) return new Set<string>();
    const offsets = getCraftablePreviewOffsets(selectedDef);
    return new Set(offsets.map((o) => `${o.dx},${o.dy}`));
  }, [selectedDef]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crafting-modal-title"
        className="w-[min(calc(100vw-32px),500px)] max-h-[85dvh] overflow-y-auto border-4 transition-colors flex flex-col bg-black border-white shadow-[8px_8px_0px_#ffffff] text-white animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150"
      >
        {/* Header - Red Accent */}
        <div className="bg-red-600 text-white p-2.5 sm:p-3 border-b-2 border-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 flex-shrink-0" />
            <div>
              <h2 id="crafting-modal-title" className="text-xs sm:text-sm font-black uppercase tracking-wider">
                Piece Crafting Unlocked
              </h2>
              <p className="text-[10px] font-mono opacity-90">
                Free action • Clocks paused • 1 craft per game
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-white/60 text-white font-mono font-black text-xs flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                title="Cancel Crafting"
                className="w-11 h-11 flex items-center justify-center bg-black/50 hover:bg-black/90 border-2 border-white/60 text-white font-mono font-bold text-xs flex-shrink-0 cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400 outline-none"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!hasValidSquares && (
            <div className="p-3 mb-4 bg-amber-500/15 border-2 border-amber-500 text-amber-500 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                All home squares are currently blocked or unsafe. If you cannot place now, craft will be offered again next turn.
              </span>
            </div>
          )}

          {/* VIEW 1: Craftables List */}
          {!selectedDef ? (
            <div>
              <div className="space-y-3 mb-4">
                {CRAFTABLE_PIECES.map((craftable) => (
                  <div
                    key={craftable.id}
                    className={`p-3 border-2 flex items-center justify-between gap-3 transition-transform ${
                      isThemeLight
                        ? 'border-black bg-neutral-50 hover:bg-neutral-100'
                        : 'border-white bg-zinc-950 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="w-12 h-12 p-1 border border-current flex-shrink-0 flex items-center justify-center bg-black/5">
                      <ChessPiece type={craftable.id} color={playerColor} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm uppercase tracking-wide">
                        {craftable.name}
                      </h3>
                      <p className="text-xs opacity-75 font-mono line-clamp-2">
                        {craftable.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedPieceId(craftable.id)}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider border border-black shadow-[2px_2px_0px_#000] cursor-pointer flex-shrink-0 active:translate-x-0.5 active:translate-y-0.5"
                    >
                      Craft
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-[11px] font-mono text-center opacity-60">
                Auto-picks first safe placement in {timeLeft}s if unconfirmed.
              </div>
            </div>
          ) : (
            /* VIEW 2: Crafting Window */
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-current">
                <button
                  onClick={() => setSelectedPieceId(null)}
                  className="flex items-center gap-1.5 text-xs font-black uppercase px-2 py-1 border border-current hover:bg-black/10 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change Piece
                </button>
                <div className="flex items-center gap-1 text-xs font-black uppercase text-amber-500">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Home Zone Deploy</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 p-1 border border-current flex items-center justify-center bg-black/5">
                  <ChessPiece type={selectedDef.id} color={playerColor} />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase">{selectedDef.name}</h3>
                  <p className="text-xs font-mono text-amber-500 font-bold">
                    {selectedDef.movementText}
                  </p>
                </div>
              </div>

              {/* Static 9x9 Preview Grid */}
              <div className="my-3 flex flex-col items-center">
                <div className="text-[11px] font-mono uppercase tracking-wider opacity-70 mb-1.5">
                  Movement Pattern (9×9 Static Preview)
                </div>
                <div
                  className={`grid grid-cols-9 grid-rows-9 w-56 h-56 sm:w-64 sm:h-64 border-2 p-1 ${
                    isThemeLight ? 'border-black bg-neutral-200' : 'border-white bg-zinc-800'
                  }`}
                >
                  {Array.from({ length: 9 }).map((_, r) => {
                    const dy = 4 - r; 
                    return Array.from({ length: 9 }).map((__, c) => {
                      const dx = c - 4;
                      const isCenter = dx === 0 && dy === 0;
                      const isReachable = reachableOffsetsSet.has(`${dx},${dy}`);
                      const isCellLight = (c + r) % 2 === 0;

                      let cellBg = isCellLight
                        ? isThemeLight ? 'bg-neutral-100' : 'bg-zinc-700'
                        : isThemeLight ? 'bg-neutral-300' : 'bg-zinc-900';

                      if (isReachable) {
                        cellBg = 'bg-amber-500 ring-1 ring-inset ring-amber-400';
                      }

                      return (
                        <div
                          key={`${dx},${dy}`}
                          className={`flex items-center justify-center relative p-0.5 ${cellBg}`}
                        >
                          {isCenter && (
                            <div className="w-full h-full p-0.5">
                              <ChessPiece type={selectedDef.id} color={playerColor} />
                            </div>
                          )}
                          {isReachable && (
                            <div className="w-1.5 h-1.5 bg-black rounded-full pointer-events-none" />
                          )}
                        </div>
                      );
                    });
                  })}
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-amber-500 inline-block border border-black" />
                    Reachable Cells
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-zinc-700 inline-block border border-black" />
                    Empty / Unreachable
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t-2 border-white bg-black shrink-0 flex items-center justify-between gap-3">
          {!selectedDef ? (
            onCancel && (
              <button
                onClick={onCancel}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-black text-xs uppercase tracking-wider border border-neutral-600 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                Cancel Crafting (Skip Perk)
              </button>
            )
          ) : (
            <>
              <span className="text-[11px] font-mono opacity-80 hidden sm:inline">
                Click Confirm to place on board
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="flex-1 sm:flex-none px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-black text-xs uppercase tracking-wider border border-neutral-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => onConfirmPiece(selectedDef.id)}
                  className="flex-[2] sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CraftingModal;
