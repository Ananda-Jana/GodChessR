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
    <div className="bg-[#0c0d12] border-2 sm:border-3 border-slate-200 text-white shadow-[4px_4px_0px_#ffffff] sm:shadow-[6px_6px_0px_#ffffff] hover:border-amber-400 transition-all flex flex-col justify-between p-3.5 sm:p-5 relative group w-full shrink-0 rounded-none h-full">
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

      <div className="pt-2 flex flex-col flex-1">
        {/* Large Featured Character Portrait Image (BIG Card Layout for Desktop) */}
        <div className="relative w-full mb-3.5 bg-black overflow-hidden border-2 border-slate-300 shadow-[3px_3px_0px_#000000]">
          {player.avatarSrc ? (
            <img
              src={player.avatarSrc}
              alt={player.publicName}
              className="w-full h-52 sm:h-64 md:h-72 object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={`w-full h-52 sm:h-64 md:h-72 ${player.avatarBg} flex items-center justify-center text-5xl sm:text-6xl`}
            >
              {player.avatarIcon}
            </div>
          )}

          {/* Lock Badge Overlay */}
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm border border-slate-400 px-2 py-1 flex items-center gap-1.5 text-amber-400 shadow-md">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">Locked</span>
          </div>

          {/* ELO or Title Tag */}
          <div className="absolute bottom-2 left-2 bg-amber-400 text-black font-black text-[10px] uppercase px-2 py-0.5 border border-black shadow-sm">
            {player.title.includes('ELO') ? player.title.split('(')[1]?.replace(')', '') || 'SECRET' : 'SECRET BOT'}
          </div>
        </div>

        {/* Card Info Header */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-white group-hover:text-amber-300 transition-colors">
              {player.publicName}
            </h3>
            <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 bg-neutral-800 text-amber-400 border border-slate-700">
              PIN Required
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400">
            {isBoyOrGirl ? 'Secret Companion · Identity Secured' : player.title}
          </p>
        </div>

        {/* Tagline / Description */}
        {isBoyOrGirl ? (
          <div className="p-2.5 bg-neutral-900/90 border border-slate-800 text-slate-300 text-xs font-mono font-medium my-1 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Identity locked. Enter secret 6-digit PIN to challenge!</span>
          </div>
        ) : (
          <div className="my-1.5 space-y-1 flex-1">
            <p className="text-xs font-semibold text-amber-200/90 italic leading-snug">
              "{player.tagline}"
            </p>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
              {player.description}
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelect(player)}
        className="w-full mt-3 min-h-[44px] py-3.5 sm:py-3 px-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#ffffff] sm:shadow-[3px_3px_0px_#ffffff] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0 z-10"
      >
        <KeyRound className="w-4 h-4 text-black shrink-0" />
        <span>Enter PIN & Challenge</span>
      </button>
    </div>
  );
};
