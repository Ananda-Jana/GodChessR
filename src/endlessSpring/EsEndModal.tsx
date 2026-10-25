import React from 'react';
import { RotateCcw, ArrowLeft, ExternalLink } from 'lucide-react';
import { useEsModalFocus } from './EsModalFocus';
import { ES_SCRIBBLE_HUB_URL } from './EsConfig';
import { ES_STORY_SCRIPTS } from './EsGameData';
import { EsGameId, EsOutcome } from './EsTypes';

export interface EsEndModalProps {
  isOpen: boolean;
  gameId: EsGameId;
  outcome: EsOutcome;
  outcomeReason?: string;
  outcomeVariant?: string;
  onReplay: () => void;
  onBackToSelect: () => void;
}

export const EsEndModal: React.FC<EsEndModalProps> = ({
  isOpen,
  gameId,
  outcome,
  outcomeReason,
  outcomeVariant,
  onReplay,
  onBackToSelect,
}) => {
  const modalRef = useEsModalFocus(isOpen, onBackToSelect);
  if (!isOpen || outcome === 'ongoing') return null;

  const script = ES_STORY_SCRIPTS[gameId];

  let endingText = '';
  if (outcome === 'win') {
    if (outcomeVariant && script.variants && script.variants[outcomeVariant]) {
      endingText = script.variants[outcomeVariant];
    } else {
      endingText = script.win;
    }
  } else if (outcome === 'loss') {
    endingText = script.loss;
  } else {
    endingText = script.draw || 'Dusk draws an equal silence over the board.';
  }

  const isWin = outcome === 'win';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Game Result"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] text-neutral-100"
      >
        {/* Banner */}
        <div
          className={`p-6 text-center border-b ${
            isWin
              ? 'bg-gradient-to-b from-amber-500/20 to-transparent border-amber-500/30'
              : 'bg-gradient-to-b from-rose-950/40 to-transparent border-rose-500/30'
          }`}
        >
          <span
            className={`text-xs font-mono font-bold uppercase tracking-wider ${
              isWin ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {isWin ? 'Chapter Arc Complete' : 'Chapter Conclusion'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1">
            {outcome === 'win' ? 'Victory' : outcome === 'draw' ? 'Dusk Draw' : 'Defeat'}
          </h2>
          {outcomeReason && (
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              {outcomeReason}
            </p>
          )}
        </div>

        {/* Narrative Ending Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="font-serif italic text-base text-amber-100/90 leading-relaxed">
              "{endingText}"
            </p>
          </div>

          {/* Scribble Hub Novel Link */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-between gap-3 text-xs">
            <div className="text-left">
              <span className="font-bold text-amber-300 block">Endless Spring: Part One</span>
              <span className="text-[11px] text-neutral-400">Read the complete web novel by Ananda Jana</span>
            </div>
            <a
              href={ES_SCRIBBLE_HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase rounded flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <span>Read</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onBackToSelect}
            className="px-4 py-2 border border-white/20 hover:bg-white/10 text-neutral-200 text-xs font-bold uppercase rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Select Episode
          </button>
          <button
            type="button"
            onClick={onReplay}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Replay
          </button>
        </div>
      </div>
    </div>
  );
};
