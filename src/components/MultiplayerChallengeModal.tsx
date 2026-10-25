import React, { useState, useEffect } from 'react';
import { Swords, X, Crown, Sparkles, Layers, Shield, Clock } from 'lucide-react';
import { PieceTheme } from '../types/game';
import { useModalFocus } from '../utils/useModalFocus';

export interface MultiplayerChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlayer: { id: string; name: string } | null;
  onSendChallenge: (
    targetUserId: string,
    timeControl: 120 | 300,
    moveSuggestions: 'included' | 'excluded',
    craftingAllowed: boolean,
    pieceTheme: PieceTheme,
    gameMode: 'standard' | 'crafted' | 'classic',
    expansionDisabled: boolean
  ) => void;
}

export const MultiplayerChallengeModal: React.FC<MultiplayerChallengeModalProps> = ({
  isOpen,
  onClose,
  targetPlayer,
  onSendChallenge,
}) => {
  const modalRef = useModalFocus(isOpen, onClose, true);

  const [modeCategory, setModeCategory] = useState<'classic' | 'mugen'>('classic');
  const [mugenVariant, setMugenVariant] = useState<'standard' | 'crafted'>('standard');
  const [timeControl, setTimeControl] = useState<120 | 300>(300);
  const [moveSuggestions, setMoveSuggestions] = useState<'included' | 'excluded'>('included');
  const [craftingAllowed, setCraftingAllowed] = useState<boolean>(true);
  const [expansionDisabled, setExpansionDisabled] = useState<boolean>(false);
  const [pieceTheme, setPieceTheme] = useState<PieceTheme>('classic');

  useEffect(() => {
    if (isOpen) {
      setModeCategory('classic');
      setMugenVariant('standard');
      setTimeControl(300);
      setMoveSuggestions('included');
      setCraftingAllowed(true);
      setExpansionDisabled(false);
      setPieceTheme('classic');
    }
  }, [isOpen]);

  if (!isOpen || !targetPlayer) return null;

  const handleSend = () => {
    const finalGameMode = modeCategory === 'classic' ? 'classic' : mugenVariant;
    const finalCrafting = modeCategory === 'classic' ? false : craftingAllowed;
    const finalExpansionDisabled = modeCategory === 'classic' ? true : expansionDisabled;

    onSendChallenge(
      targetPlayer.id,
      timeControl,
      moveSuggestions,
      finalCrafting,
      pieceTheme,
      finalGameMode,
      finalExpansionDisabled
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-modal-title"
        className="bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white max-w-lg w-full max-h-[90dvh] shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] text-black dark:text-white flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="p-3 sm:px-4 sm:py-3 border-b-3 border-black dark:border-white flex items-center justify-between shrink-0 bg-black text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-white flex items-center justify-center font-black bg-amber-400 text-black">
              <Swords className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="challenge-modal-title" className="text-sm sm:text-base font-black uppercase tracking-tight">
                Challenge {targetPlayer.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center border-2 border-white hover:bg-white hover:text-black transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-3 border-b-3 border-black dark:border-white shrink-0 bg-amber-400">
          <button
            onClick={handleSend}
            className="w-full py-2.5 px-4 bg-black text-amber-400 hover:bg-neutral-900 border-2 border-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000000]"
          >
            <Swords className="w-4 h-4" aria-hidden="true" />
            Send Challenge Now
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 text-xs font-bold">
          {/* Mode Category Choice */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5">
              Select Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModeCategory('classic')}
                className={`p-3 border-2 border-black dark:border-white flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                  modeCategory === 'classic'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)] font-black'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <Crown className="w-4 h-4 text-black" aria-hidden="true" />
                <span className="font-black uppercase text-xs">Traditional Chess</span>
                <span className="text-[10px] font-normal leading-tight">No Prince, Zero Dice, Classical Rules</span>
              </button>

              <button
                type="button"
                onClick={() => setModeCategory('mugen')}
                className={`p-3 border-2 border-black dark:border-white flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                  modeCategory === 'mugen'
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_var(--shadow)] font-black'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-black" aria-hidden="true" />
                <span className="font-black uppercase text-xs">Mugen Chess</span>
                <span className="text-[10px] font-normal leading-tight">Prince, Dice Phase, 2-Pawn Draw</span>
              </button>
            </div>
          </div>

          {/* Mode Specific Settings */}
          {modeCategory === 'mugen' ? (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Mugen Army Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMugenVariant('standard')}
                    className={`p-2 border-2 border-black dark:border-white text-center cursor-pointer ${
                      mugenVariant === 'standard' ? 'bg-amber-400 text-black font-black' : 'bg-white dark:bg-[#141416]'
                    }`}
                  >
                    Standard Mugen
                  </button>
                  <button
                    type="button"
                    onClick={() => setMugenVariant('crafted')}
                    className={`p-2 border-2 border-black dark:border-white text-center cursor-pointer ${
                      mugenVariant === 'crafted' ? 'bg-[#0f172a] text-amber-400 font-black' : 'bg-white dark:bg-[#141416]'
                    }`}
                  >
                    Crafted Pieces
                  </button>
                </div>
              </div>

              {/* Mid-Game Crafting */}
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Mid-Game Crafting Perk</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCraftingAllowed(true)}
                    className={`p-2 border-2 border-black dark:border-white cursor-pointer ${
                      craftingAllowed ? 'bg-amber-400 text-black font-black' : 'bg-white dark:bg-[#141416]'
                    }`}
                  >
                    Allowed
                  </button>
                  <button
                    type="button"
                    onClick={() => setCraftingAllowed(false)}
                    className={`p-2 border-2 border-black dark:border-white cursor-pointer ${
                      !craftingAllowed ? 'bg-amber-400 text-black font-black' : 'bg-white dark:bg-[#141416]'
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              {/* Board Expansion Notice & Toggle */}
              <div className="p-2.5 bg-amber-400/20 border border-amber-500 rounded-none text-[11px]">
                <p className="font-bold text-amber-900 dark:text-amber-300 leading-tight mb-1.5">
                  ★ <strong>Board Expansion:</strong> In Mugen Chess, losing 7 pieces triggers a row/column board expansion.
                </p>
                <button
                  type="button"
                  onClick={() => setExpansionDisabled((prev) => !prev)}
                  className={`w-full py-1.5 px-2 border-2 border-black text-[10px] font-black uppercase cursor-pointer ${
                    expansionDisabled
                      ? 'bg-neutral-800 text-white'
                      : 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  Expansion Trigger: {expansionDisabled ? 'Disabled (Fixed 8×8)' : 'Enabled (Triggers after 7 lost pieces)'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white">
              <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 leading-relaxed">
                ★ <strong>Traditional Normal Chess:</strong> Authentic classical FIDE chess. Pure deterministic turns, no prince piece, no dice phase, no board expansions, and no mid-game piece crafting.
              </p>
            </div>
          )}

          {/* Time Control */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Time Control
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTimeControl(300)}
                className={`p-2 border-2 border-black dark:border-white cursor-pointer ${
                  timeControl === 300 ? 'bg-amber-400 text-black font-black' : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                5 Minutes
              </button>
              <button
                type="button"
                onClick={() => setTimeControl(120)}
                className={`p-2 border-2 border-black dark:border-white cursor-pointer ${
                  timeControl === 120 ? 'bg-amber-400 text-black font-black' : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                2 Minutes
              </button>
            </div>
          </div>

          {/* Move Suggestions */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1">
              Move Suggestions / Hints
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMoveSuggestions('included')}
                className={`p-2 border-2 border-black dark:border-white cursor-pointer ${
                  moveSuggestions === 'included' ? 'bg-amber-400 text-black font-black' : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                Included
              </button>
              <button
                type="button"
                onClick={() => setMoveSuggestions('excluded')}
                className={`p-2 border-2 border-black dark:border-white cursor-pointer ${
                  moveSuggestions === 'excluded' ? 'bg-amber-400 text-black font-black' : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                Excluded
              </button>
            </div>
          </div>

          {/* Piece Theme */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1">
              Piece Visual Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPieceTheme('classic')}
                className={`p-2 border-2 border-black dark:border-white cursor-pointer ${
                  pieceTheme === 'classic' ? 'bg-amber-400 text-black font-black' : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                Classic
              </button>
              <button
                type="button"
                onClick={() => setPieceTheme('retro')}
                className={`p-2 border-2 border-black dark:border-white cursor-pointer ${
                  pieceTheme === 'retro' ? 'bg-amber-400 text-black font-black' : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                Retro Cards
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
