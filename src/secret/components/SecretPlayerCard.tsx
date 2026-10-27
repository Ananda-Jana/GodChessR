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
    <div className="bg-[#0c0d12] border-2 md:border-3 border-slate-200 text-white shadow-[4px_4px_0px_#ffffff] md:shadow-[6px_6px_0px_#ffffff] hover:border-amber-400 transition-all p-2.5 md:p-5 relative group w-full shrink-0 rounded-none flex flex-col justify-between h-auto md:h-full">
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 z-10 bg-gradient-to-r ${
          player.themeColor === 'rose'
            ? 'from-rose-500 via-pink-400 to-rose-600'
            : player.themeColor === 'amber'
            ? 'from-amber-400 via-yellow-300 to-amber-600'
            : player.themeColor === 'cyan'
            ? 'from-teal-400 via-cyan-300 to-emerald-500'
            : 'from-slate-200 via-zinc-400 to-slate-600'
        }`}
      />

      <div className="pt-1 md:pt-2 flex flex-col flex-1">
        {/* Layout container: Horizontal row on mobile, full vertical layout on desktop */}
        <div className="flex flex-row md:flex-col gap-3 md:gap-0 items-center md:items-stretch flex-1">
          {/* Featured Character Portrait Image */}
          <div className="relative w-24 sm:w-28 md:w-full h-24 sm:h-28 md:h-72 shrink-0 bg-black overflow-hidden border-2 border-slate-300 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000] md:mb-3.5">
            {player.avatarSrc ? (
              <img
                src={player.avatarSrc}
                alt={player.publicName}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div
                className={`w-full h-full ${player.avatarBg} flex items-center justify-center text-3xl sm:text-4xl md:text-6xl`}
              >
                {player.avatarIcon}
              </div>
            )}

            {/* Lock Badge Overlay */}
            <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/80 backdrop-blur-sm border border-slate-400 px-1.5 py-0.5 md:px-2 md:py-1 flex items-center gap-1 text-amber-400 shadow-md">
              <Lock className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-white">Locked</span>
            </div>

            {/* ELO or Title Tag */}
            <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-amber-400 text-black font-black text-[9px] md:text-[10px] uppercase px-1.5 md:px-2 py-0.5 border border-black shadow-sm">
              {player.title.includes('ELO') ? player.title.split('(')[1]?.replace(')', '') || 'SECRET' : 'SECRET BOT'}
            </div>
          </div>

          {/* Card Details Container */}
          <div className="flex-1 min-w-0 flex flex-col justify-between md:justify-start h-full md:h-auto">
            <div className="flex flex-col gap-0.5 md:gap-1">
              <div className="flex items-center justify-between gap-1.5 md:gap-2">
                <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wide text-white group-hover:text-amber-300 transition-colors truncate">
                  {player.publicName}
                </h3>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase px-1.5 py-0.5 md:px-2 bg-neutral-800 text-amber-400 border border-slate-700 shrink-0">
                  PIN Required
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-amber-300/90 md:text-slate-400 truncate">
                {isBoyOrGirl ? 'Secret Companion' : player.title}
              </p>
            </div>

            {/* Tagline / Description (Desktop Only for compact horizontal mobile cards) */}
            {isBoyOrGirl ? (
              <div className="hidden md:flex p-2.5 bg-neutral-900/90 border border-slate-800 text-slate-300 text-xs font-mono font-medium my-1 items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Identity locked. Enter secret 6-digit PIN to challenge!</span>
              </div>
            ) : (
              <div className="hidden md:block my-1.5 space-y-1 flex-1">
                <p className="text-xs font-semibold text-amber-200/90 italic leading-snug">
                  "{player.tagline}"
                </p>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {player.description}
                </p>
              </div>
            )}

            {/* Action Button - Mobile inline inside details block */}
            <button
              onClick={() => onSelect(player)}
              className="md:hidden w-full mt-2 py-2 px-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-black font-black text-[11px] uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#ffffff] flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0 z-10"
            >
              <KeyRound className="w-3.5 h-3.5 text-black shrink-0" />
              <span>Enter PIN & Play</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Button - Desktop Only */}
      <button
        onClick={() => onSelect(player)}
        className="hidden md:flex w-full mt-3 min-h-[44px] py-3.5 sm:py-3 px-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#ffffff] items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0 z-10"
      >
        <KeyRound className="w-4 h-4 text-black shrink-0" />
        <span>Enter PIN & Challenge</span>
      </button>
    </div>
  );
};
