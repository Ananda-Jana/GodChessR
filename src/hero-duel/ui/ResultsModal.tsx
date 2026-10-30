import React, { useState } from 'react';
import { HeroDuelState } from '../types/heroDuelTypes';
import { CollectibleHeroCard } from '../types/cardTypes';
import { Trophy, Skull, Sparkles, ArrowRight, RotateCcw, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { downloadCardPng } from '../cards/cardRenderer';

interface ResultsModalProps {
  matchState: HeroDuelState;
  earnedCards: CollectibleHeroCard[];
  onPlayAgain: () => void;
  onOpenVault: () => void;
  onExit: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  matchState,
  earnedCards,
  onPlayAgain,
  onOpenVault,
  onExit,
}) => {
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewStep, setReviewStep] = useState(0);

  const isVictory = matchState.winner === 1;
  const isDraw = matchState.winner === 'draw';
  const isPassAndPlay = matchState.isPassAndPlay;

  // Outcome title
  let title = 'DEFEAT';
  if (isPassAndPlay) {
    title = matchState.winner === 1 ? 'PLAYER 1 VICTORY' : matchState.winner === 2 ? 'PLAYER 2 VICTORY' : 'DRAW';
  } else if (isVictory) {
    title = 'VICTORY ACHIEVED!';
  } else if (isDraw) {
    title = 'STALEMATE DRAW';
  }

  const winReason = matchState.winReason || (isVictory ? 'Enemy Captain vanquished!' : 'All allies fallen.');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative bg-[#14141c] border-4 border-amber-400 max-w-lg w-full max-h-[92vh] overflow-y-auto rounded-2xl p-5 sm:p-7 shadow-[8px_8px_0px_#fbbf24] text-white text-center flex flex-col items-center gap-4">
        {/* Outcome Icon */}
        <div className="w-16 h-16 rounded-2xl bg-black border-3 border-amber-400 flex items-center justify-center shadow-lg">
          {isVictory ? (
            <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
          ) : isDraw ? (
            <Sparkles className="w-9 h-9 text-blue-400" />
          ) : (
            <Skull className="w-9 h-9 text-red-500 animate-pulse" />
          )}
        </div>

        <div>
          <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-widest block mb-1">
            HERO DUEL MATCH CONCLUDED • ROUND {matchState.turnNumber}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {title}
          </h2>
          <p className="text-xs text-neutral-300 font-mono mt-1 leading-relaxed">
            {winReason}
          </p>
        </div>

        {/* Review Game Sub-View */}
        {isReviewMode ? (
          <div className="w-full bg-[#1c1c28] border-2 border-white/20 rounded-xl p-4 text-left space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-amber-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Review Game Step {reviewStep + 1}
              </span>
              <button
                onClick={() => setIsReviewMode(false)}
                className="text-[10px] text-neutral-400 hover:text-white underline uppercase font-bold"
              >
                Close Review
              </button>
            </div>

            <div className="p-3 bg-black/60 rounded border border-white/10 text-xs font-mono text-neutral-200">
              Round {Math.floor(reviewStep / 2) + 1}: Move recorded. Examine positioning and active cooldowns.
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                disabled={reviewStep === 0}
                onClick={() => setReviewStep((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 bg-neutral-800 disabled:opacity-40 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Prev Step
              </button>

              <button
                onClick={() => setReviewStep((prev) => prev + 1)}
                className="px-3 py-1.5 bg-amber-400 text-black rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Earned Cards Reveal */}
            {earnedCards.length > 0 && (
              <div className="w-full bg-[#1c1c28] border-2 border-white/20 rounded-xl p-3.5 text-left">
                <div className="flex items-center justify-between text-xs font-black uppercase text-amber-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Cards Conquered ({earnedCards.length})
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Added to Vault</span>
                </div>

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {earnedCards.map((card) => (
                    <div
                      key={card.code}
                      className="flex items-center justify-between p-2.5 bg-black/70 border border-white/15 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-black uppercase text-white truncate max-w-[160px]">
                            {card.heroName}
                          </div>
                          <div className="text-[10px] font-mono text-amber-400">
                            {card.rarity.toUpperCase()} • #{card.code}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => downloadCardPng(card)}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/20 cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase"
                        title="Download 2x PNG"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PNG</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 pt-2 border-t border-white/15">
          <button
            onClick={onPlayAgain}
            className="hd-btn-brutal w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch • Play Again</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setIsReviewMode(true)}
              className="py-2.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-[11px] uppercase border border-white/30 rounded flex items-center justify-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Review</span>
            </button>

            <button
              onClick={onOpenVault}
              className="py-2.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-[11px] uppercase border border-white/30 rounded flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Vault</span>
            </button>

            <button
              onClick={onExit}
              className="py-2.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-[11px] uppercase border border-white/30 rounded flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Main Hub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
