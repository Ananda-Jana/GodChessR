import React from 'react';
import { SecretPlayerConfig } from '../types';
import { KeyRound, Lock, ShieldAlert } from 'lucide-react';

interface SecretPlayerCardProps {
  player: SecretPlayerConfig;
  onSelect: (player: SecretPlayerConfig) => void;
}

export const SecretPlayerCard: React.FC<SecretPlayerCardProps> = ({ player, onSelect }) => {
  const isBoyOrGirl = player.id === 'boy_friend' || player.id === 'girl_friend';

  return (
    <div className="bg-[#0a0a0c] border-2 sm:border-3 border-slate-200 text-white shadow-[4px_4px_0px_#ffffff] sm:shadow-[6px_6px_0px_#ffffff] hover:border-amber-400 transition-all flex flex-col justify-between p-3.5 sm:p-5 relative group w-full shrink-0 min-h-[200px] rounded-none">
      {/* Metallic Accent Top Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
          player.themeColor === 'rose'
            ? 'from-rose-500 via-pink-400 to-rose-600'
            : player.themeColor === 'amber'
            ? 'from-amber-400 via-yellow-300 to-amber-600'
            : 'from-slate-200 via-zinc-400 to-slate-600'
        }`}
      />

      <div className="pt-1">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5 sm:mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {player.avatarSrc ? (
              <img
                src={player.avatarSrc}
                alt={player.publicName}
                className="w-11 h-11 sm:w-14 sm:h-14 object-cover border-2 border-white shadow-[2px_2px_0px_#000] shrink-0"
              />
            ) : (
              <div
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-none ${player.avatarBg} border-2 border-white flex items-center justify-center text-lg sm:text-2xl shadow-[2px_2px_0px_#000] shrink-0`}
              >
                {player.avatarIcon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-base font-black uppercase text-white group-hover:text-amber-300 transition-colors truncate">
                  {player.publicName}
                </h3>
                <span className="text-[8px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 bg-amber-400 text-black border border-black shrink-0">
                  Passcode Required
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 truncate">
                {isBoyOrGirl ? 'Secret Bot · Identity Locked' : player.title}
              </p>
            </div>
          </div>

          <div className="p-1 sm:p-1.5 bg-neutral-900 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </div>
        </div>

        {/* Details Section: Locked for Boy & Girl bot, Visible for War Bot */}
        {isBoyOrGirl ? (
          <div className="p-2 sm:p-3 bg-neutral-900/90 border border-slate-800 text-slate-300 text-[10px] sm:text-xs font-mono font-semibold my-2 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Identity locked. Enter secret 6-digit PIN to challenge!</span>
          </div>
        ) : (
          <div className="my-2 space-y-1">
            <p className="text-[10px] sm:text-xs font-semibold text-amber-200/90 leading-relaxed">
              "{player.tagline}"
            </p>
            <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed">
              {player.description}
            </p>
          </div>
        )}
      </div>

      {/* Action Button - Always Prominent and Unclipped at Bottom */}
      <button
        onClick={() => onSelect(player)}
        className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#ffffff] sm:shadow-[3px_3px_0px_#ffffff] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0 z-10"
      >
        <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black shrink-0" />
        <span>Enter PIN & Challenge</span>
      </button>
    </div>
  );
};
