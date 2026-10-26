import React, { useState } from 'react';
import { SecretPlayerConfig } from '../types';
import { SECRET_PLAYERS } from '../secretPlayersData';
import { SecretPlayerCard } from './SecretPlayerCard';
import { PasscodeGateModal } from './PasscodeGateModal';
import { Lock, Sparkles, ShieldCheck, X } from 'lucide-react';
import { ModeArtPanel } from '../../components/ModeArtPanel';

interface SecretArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSecretMatch: (botConfig: SecretPlayerConfig) => void;
}

export const SecretArenaModal: React.FC<SecretArenaModalProps> = ({
  isOpen,
  onClose,
  onStartSecretMatch,
}) => {
  const [selectedBotForPin, setSelectedBotForPin] = useState<SecretPlayerConfig | null>(null);

  if (!isOpen) return null;

  const handlePinSuccess = () => {
    if (selectedBotForPin) {
      const targetBot = selectedBotForPin;
      setSelectedBotForPin(null);
      onClose();
      onStartSecretMatch(targetBot);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-7xl bg-[#0a0a0c] border-3 sm:border-4 border-slate-200 text-white shadow-[6px_6px_0px_#ffffff] sm:shadow-[10px_10px_0px_#ffffff] relative flex flex-col md:flex-row my-auto max-h-[92vh] sm:max-h-[90vh] overflow-hidden">
        <ModeArtPanel
          modeKey="secret-arena"
          title="Secret Arena"
          subtitle="Passcode-Gated Custom Bots"
        />

        <div className="flex-1 flex flex-col min-w-0 p-3 sm:p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 sm:border-b-3 border-slate-700 pb-2.5 sm:pb-4 mb-3 sm:mb-6 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
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
            className="p-1.5 sm:p-2 bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-white cursor-pointer shrink-0 active:translate-x-0.5 active:translate-y-0.5"
            title="Close Secret Arena"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 3 Secret Challenger Cards List */}
        <div className="overflow-y-auto pr-1.5 flex flex-col md:grid md:grid-cols-3 gap-4 sm:gap-5 mb-3 sm:mb-4 flex-1 min-h-0">
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
