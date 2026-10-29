import React, { useState } from 'react';
import { SecretPlayerConfig } from '../types';
import {
  KeyRound,
  X,
  Copy,
  Check,
  Zap,
  Swords,
  ShieldAlert,
} from 'lucide-react';

export interface SecretEngineCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: SecretPlayerConfig | null;
  onLaunchArena?: (player: SecretPlayerConfig) => void;
}

export const SecretPinModal: React.FC<SecretEngineCodeModalProps> = ({
  isOpen,
  onClose,
  player,
  onLaunchArena,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !player) return null;

  const pinDigits = (player.passcode || '000000').split('');

  const handleCopy = () => {
    const pin = player.passcode || '000000';
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(pin).catch(() => {});
      }
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('mugen_last_copied_pin', pin);
        window.sessionStorage?.setItem('mugen_last_copied_pin', pin);
        window.dispatchEvent(new CustomEvent('mugen_pin_copied', { detail: { pin } }));
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleLaunch = () => {
    handleCopy();
    if (onLaunchArena) {
      onLaunchArena(player);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={`Decrypted PIN for ${player.publicName}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0a0c10] border-3 border-yellow-400 text-white shadow-[0_0_35px_rgba(250,204,21,0.35),8px_8px_0px_#000000] relative flex flex-col max-h-[92dvh] overflow-hidden rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#12141a] border-b-3 border-black p-3.5 sm:p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              <KeyRound className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                DECRYPTED ACCESS PIN
              </span>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white truncate mt-0.5">
                {player.publicName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-neutral-900 hover:bg-red-600 border-2 border-black text-white shadow-[2px_2px_0px_#000] cursor-pointer shrink-0 transition-transform active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 font-sans">
          {/* Character Quick Info */}
          <div className="flex items-center gap-3.5 p-3 bg-black/60 border-2 border-neutral-800 shadow-[3px_3px_0px_#000]">
            <div className="w-14 h-14 bg-black border-2 border-yellow-400/70 overflow-hidden shrink-0 relative">
              {player.avatarSrc ? (
                <img
                  src={player.avatarSrc}
                  alt={player.publicName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full ${player.avatarBg} flex items-center justify-center text-2xl`}>
                  {player.avatarIcon || '⚔️'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono font-black uppercase text-yellow-400">
                {player.title}
              </span>
              <h3 className="text-sm font-black uppercase text-white truncate">
                {player.publicName} {player.realName !== player.publicName && `(${player.realName})`}
              </h3>
              <p className="text-[11px] text-neutral-400 italic line-clamp-1">
                "{player.tagline}"
              </p>
            </div>
          </div>

          {/* 6-DIGIT PIN DISPLAY READOUT */}
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono font-black uppercase text-neutral-400 tracking-wider flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              SECRET 6-DIGIT ACCESS PIN
            </span>

            {/* Visual Boxed Digits */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 py-1">
              {pinDigits.map((digit, idx) => (
                <div
                  key={idx}
                  className="w-10 h-12 sm:w-12 sm:h-14 bg-black border-2 border-yellow-400 text-yellow-400 font-mono text-2xl sm:text-3xl font-black flex items-center justify-center shadow-[3px_3px_0px_#000] select-all"
                >
                  {digit}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-neutral-300 font-medium">
              Enter this 6-digit PIN at the Secret Arena gate to challenge this bot.
            </p>
          </div>

          {/* ACTION BUTTONS (Brutalist Yellow) */}
          <div className="space-y-2.5 pt-2">
            {/* Copy PIN Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="w-full min-h-[44px] py-3 px-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>PIN COPIED TO CLIPBOARD ({player.passcode})</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>COPY 6-DIGIT PIN</span>
                </>
              )}
            </button>

            {/* Launch Arena Shortcut */}
            <button
              type="button"
              onClick={handleLaunch}
              className="w-full min-h-[44px] py-3 px-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <Swords className="w-4 h-4 text-black stroke-[2.5]" />
              <span>LAUNCH ARENA WITH PIN</span>
            </button>
          </div>

          {/* Quick Notice */}
          <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>PIN stays unlocked permanently in your profile. You can re-view it anytime.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#12141a] border-t-2 border-black flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono font-bold text-xs uppercase border border-neutral-700 cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export const SecretEngineCodeModal = SecretPinModal;
