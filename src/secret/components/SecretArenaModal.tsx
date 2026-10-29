import React, { useState } from 'react';
import { SecretPlayerConfig } from '../types';
import { SECRET_PLAYERS } from '../secretPlayersData';
import { SecretPlayerCard } from './SecretPlayerCard';
import { PasscodeGateModal } from './PasscodeGateModal';
import { Lock, Sparkles, ShieldCheck, X, ArrowLeft } from 'lucide-react';
import { ModeArtPanel } from '../../components/ModeArtPanel';

interface SecretArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onStartSecretMatch: (botConfig: SecretPlayerConfig) => void;
}

export const SecretArenaModal: React.FC<SecretArenaModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onStartSecretMatch,
}) => {
  const [selectedBotForPin, setSelectedBotForPin] = useState<SecretPlayerConfig | null>(null);

  if (!isOpen) return null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onClose();
    }
  };

  const handlePinSuccess = () => {
    if (selectedBotForPin) {
      const targetBot = selectedBotForPin;
      setSelectedBotForPin(null);
      onClose();
      onStartSecretMatch(targetBot);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-7xl bg-[#0a0a0c] border-t-4 border-x-4 md:border-4 border-slate-200 text-white shadow-[6px_6px_0px_#ffffff] md:shadow-[10px_10px_0px_#ffffff] relative flex flex-col md:flex-row rounded-t-2xl md:rounded-none h-[94dvh] md:h-[85vh] max-h-[94dvh] md:max-h-[85vh] md:overflow-hidden">
        {/* Mobile Floating Action Buttons (FIX 2) */}
        <div className="md:hidden absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={handleBack}
            className="pointer-events-auto min-w-[40px] min-h-[40px] px-2.5 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 border-2 border-white text-white flex items-center justify-center rounded-lg gap-1.5 shadow-[2px_2px_0px_#fff] text-xs font-bold uppercase cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto min-w-[40px] min-h-[40px] p-2 bg-red-600 hover:bg-red-700 border-2 border-black text-white flex items-center justify-center shadow-[2px_2px_0px_#000] rounded-lg cursor-pointer"
            title="Close Secret Arena"
            aria-label="Close Secret Arena"
          >
            <X className="w-4 h-4 text-white stroke-[2.5]" />
          </button>
        </div>

        <ModeArtPanel
          modeKey="secret-arena"
          title="Secret Arena"
          subtitle="Passcode-Gated Custom Bots"
        />

        <div className="flex-1 flex flex-col min-w-0 p-3 sm:p-6 pb-28 pb-[calc(7rem+env(safe-area-inset-bottom))] md:overflow-y-auto">
          {/* Mobile Hero Banner (160px, md:hidden) */}
          <div className="md:hidden relative h-40 w-full shrink-0 overflow-hidden bg-black select-none border-b-3 border-slate-700 mb-3">
            <img
              src="/assets/aistudio/image_ba67a0d0.png"
              alt="Secret Arena Artwork"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center filter brightness-105 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-purple-600 text-white border border-white shadow-[1px_1px_0px_#fff]">
                PASSCODE-GATED
              </span>
              <span className="text-[10px] font-mono font-bold text-white/90 bg-black/70 px-2 py-0.5 border border-white/20">
                3 EXCLUSIVE CHALLENGERS
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between border-b-2 sm:border-b-3 border-slate-700 pb-2.5 sm:pb-4 mb-3 sm:mb-6 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={handleBack}
                className="hidden md:flex min-w-[40px] min-h-[40px] px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border-2 border-white text-white items-center justify-center rounded-lg gap-1.5 shadow-[2px_2px_0px_#fff] text-xs font-bold uppercase cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-200 via-neutral-400 to-zinc-900 border-2 border-white flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#fff] sm:shadow-[3px_3px_0px_#fff] shrink-0">
                <Lock className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-xl font-black uppercase tracking-wider text-amber-400">
                    Secret Players Arena
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 bg-amber-400 text-black border border-black flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Secured Access
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 font-semibold mt-0.5">
                  Passcode-Gated Secret Bots with Custom Dialogue & Personalities
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="hidden md:flex min-w-[40px] min-h-[40px] p-2 bg-red-600 hover:bg-red-700 active:translate-x-0.5 active:translate-y-0.5 border-2 border-black text-white items-center justify-center shadow-[2px_2px_0px_#000] rounded-lg cursor-pointer shrink-0"
              title="Close Secret Arena"
              aria-label="Close Secret Arena"
            >
              <X className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </div>

          {/* 3 Secret Challenger Cards List */}
          <div className="pr-1.5 flex flex-col gap-3 sm:gap-3.5 md:grid md:grid-cols-3 md:gap-5 mb-3 sm:mb-4 flex-1 min-h-0">
            {SECRET_PLAYERS.map((player) => (
              <SecretPlayerCard
                key={player.id}
                player={player}
                onSelect={(p) => setSelectedBotForPin(p)}
              />
            ))}
          </div>

          {/* Footer Info */}
          <div className="pt-2.5 sm:pt-4 border-t-2 border-slate-800 text-center text-[10px] sm:text-[11px] font-mono text-slate-400 flex items-center justify-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Matches run locally with zero lag. Enter secret 6-digit PIN to unlock!</span>
          </div>
        </div>
      </div>

      {/* 6-Digit Passcode Gate Modal */}
      {selectedBotForPin && (
        <PasscodeGateModal
          isOpen={Boolean(selectedBotForPin)}
          botConfig={selectedBotForPin}
          onClose={() => setSelectedBotForPin(null)}
          onSuccess={handlePinSuccess}
        />
      )}
    </div>
  );
};
