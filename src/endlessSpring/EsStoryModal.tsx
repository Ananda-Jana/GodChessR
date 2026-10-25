import React from 'react';
import { X, Play } from 'lucide-react';
import { useEsModalFocus } from './EsModalFocus';
import { ES_GAME_METADATA } from './EsConfig';
import { ES_STORY_SCRIPTS } from './EsGameData';
import { EsGameId } from './EsTypes';

export interface EsStoryModalProps {
  isOpen: boolean;
  gameId: EsGameId;
  onBegin: () => void;
  onClose: () => void;
}

export const EsStoryModal: React.FC<EsStoryModalProps> = ({
  isOpen,
  gameId,
  onBegin,
  onClose,
}) => {
  const modalRef = useEsModalFocus(isOpen, onClose);
  if (!isOpen) return null;

  const meta = ES_GAME_METADATA[gameId];
  const script = ES_STORY_SCRIPTS[gameId];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${meta.title} Prologue`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-zinc-950/95 supports-[backdrop-filter]:bg-zinc-950/65 supports-[backdrop-filter]:backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl flex flex-col max-h-[85dvh] overflow-hidden text-neutral-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
              {meta.arcName} · {meta.chapterRange}
            </span>
            <h3 className="text-base font-black uppercase tracking-tight text-white mt-0.5">
              Game {gameId}: {meta.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to selection"
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative Script Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-4">
          <div className="relative p-5 bg-white/5 border border-amber-500/20 rounded-lg">
            <div className="text-2xl text-amber-400/40 font-serif absolute top-2 left-3 select-none">
              “
            </div>
            <p className="text-sm md:text-base leading-relaxed text-amber-100/90 font-serif italic pl-4">
              {script.intro}
            </p>
          </div>

          <div className="text-xs text-neutral-400 space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span>Estimated Duration: {meta.durationEstimate}</span>
              <span>Total Isolation Mode</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              {meta.boardDescription}. Every move is automatically saved to local storage.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-zinc-950 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onBegin}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Begin Game
          </button>
        </div>
      </div>
    </div>
  );
};
