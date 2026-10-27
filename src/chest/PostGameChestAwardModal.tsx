import React from 'react';
import { Gift, Sparkles, Archive, X, Trophy } from 'lucide-react';
import { ChestSvg } from './ChestSvg';
import { useModalFocus } from '../utils/useModalFocus';

interface PostGameChestAwardModalProps {
  isOpen: boolean;
  result: 'win' | 'loss';
  mode?: string;
  onOpenNow: () => void;
  onSaveToInventory: () => void;
}

export const PostGameChestAwardModal: React.FC<PostGameChestAwardModalProps> = ({
  isOpen,
  result,
  mode,
  onOpenNow,
  onSaveToInventory,
}) => {
  const modalRef = useModalFocus(isOpen, onSaveToInventory, true);

  if (!isOpen) return null;

  const isWin = result === 'win';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chest Reward Modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-sm sm:max-w-md bg-[#0a0a0c] text-white border-4 border-amber-400 shadow-[10px_10px_0px_#000] p-5 sm:p-6 overflow-hidden flex flex-col items-center text-center animate-scale-up"
      >
        {/* Close / Save Button */}
        <button
          type="button"
          onClick={onSaveToInventory}
          aria-label="Save chest to inventory and close"
          className="absolute top-3 right-3 p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-white/60 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Badge Lead-in */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border-2 border-amber-400 text-amber-400 text-[11px] font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isWin ? 'Victory Reward' : 'Combat Loot'}</span>
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight leading-tight mb-1">
          CHEST REWARD DISCOVERED!
        </h2>
        <p className="text-xs font-mono text-neutral-400 mb-4 uppercase">
          {mode ? `Earned in ${mode.replace(/_/g, ' ')}` : 'Match Completed'}
        </p>

        {/* Animated Chest Visual Stage */}
        <div className="relative my-2 w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
          {/* Pulsing Aura Rings */}
          <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute inset-4 bg-gradient-to-t from-amber-500/20 via-pink-500/10 to-transparent rounded-full" />

          {/* Animated Shaking Chest SVG */}
          <div className="relative z-10 transform transition-transform hover:scale-105 animate-bounce-subtle">
            <ChestSvg isWin={isWin} tapCount={0} isOpened={false} isWindup={false} isResigned={false} />
          </div>
        </div>

        {/* Description Callout */}
        <div className="w-full bg-neutral-950 border-2 border-neutral-800 p-2.5 mb-5 text-neutral-300 text-xs font-medium">
          Contains mystery <span className="text-amber-400 font-bold">Secret Characters</span> & <span className="text-amber-400 font-bold">ELO Rating Boosts</span>. Open immediately or save to your Trophy Room inventory!
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onOpenNow}
            className="w-full min-h-[48px] px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-sm uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#ffffff] cursor-pointer flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Gift className="w-5 h-5 text-black shrink-0" aria-hidden="true" />
            <span>OPEN CHEST NOW</span>
          </button>

          <button
            type="button"
            onClick={onSaveToInventory}
            className="w-full min-h-[44px] px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider border-2 border-neutral-700 cursor-pointer flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-colors"
          >
            <Archive className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
            <span>SAVE TO INVENTORY (OPEN LATER)</span>
          </button>
        </div>

        {/* Tiny footer tip */}
        <div className="mt-3 text-[10px] font-mono text-neutral-500 uppercase">
          Saved chests can be opened anytime inside the Trophy Room
        </div>
      </div>
    </div>
  );
};
