/**
 * LeaguePreMatchModal.tsx - Pre-Match Loadout Screen for League Bot Battles
 */

import React from 'react';
import type { PunisherBotId } from '../../punisher/punisherBot';
import { LEAGUE_BOTS } from '../../league/leagueBots';
import { RankDefinition, LEAGUE_MATH_CONSTANTS } from '../../league/rankConfig';
import { RankBadge } from './RankBadge';
import { resolveBotFace } from '../../punisher/BanglaBotFaces';
import { Swords, Play, X, Shield, Clock, Flame, Trophy } from 'lucide-react';

interface LeaguePreMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: PunisherBotId;
  currentRank: RankDefinition;
  currentTrophies: number;
  userName?: string;
  onDeploy: (botId: PunisherBotId) => void;
}

export const LeaguePreMatchModal: React.FC<LeaguePreMatchModalProps> = ({
  isOpen,
  onClose,
  botId,
  currentRank,
  currentTrophies,
  userName = 'Player',
  onDeploy,
}) => {
  if (!isOpen) return null;

  const botObj = LEAGUE_BOTS.find((b) => b.id === botId) || LEAGUE_BOTS[0];
  const BotFace = resolveBotFace(botObj.id);

  // Calculate projected stakes against bot
  const winTR = Math.round(LEAGUE_MATH_CONSTANTS.WIN_BASE * LEAGUE_MATH_CONSTANTS.BOT_WIN_MULTIPLIER);
  const lossTR = 0; // Bot loss costs 0 TR

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none"
      role="dialog"
      aria-modal="true"
      aria-label="League Match Pre-Battle Loadout"
    >
      <div
        className="relative w-full max-w-xl bg-[#090d14] border-2 border-amber-400 p-6 md:p-8 shadow-[8px_8px_0px_#f5a623] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-slate-900 hover:bg-rose-600 text-white border border-slate-700 hover:border-black cursor-pointer transition-colors active:scale-95"
          title="Cancel Loadout"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 pr-10">
          <div className="w-10 h-10 bg-amber-400 text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#fff] shrink-0">
            <Flame className="w-6 h-6 fill-black" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block">
              OFFICIAL RANKED ARENA
            </span>
            <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-wide">
              PRE-MATCH LOADOUT
            </h2>
          </div>
        </div>

        {/* Versus Face-off Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 border border-slate-800 p-4 relative">
          {/* Left: You */}
          <div className="flex flex-col items-center text-center p-3 border border-slate-800/80 bg-slate-900/40">
            <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider mb-2">
              YOU (WHITE PIECES)
            </span>
            <div className="mb-2">
              <RankBadge rank={currentRank} size="md" />
            </div>
            <span className="text-sm font-black text-white uppercase truncate max-w-[160px]">
              {userName}
            </span>
            <span
              className="text-xs font-black uppercase mt-0.5 tracking-wide"
              style={{ color: currentRank.primaryColor }}
            >
              {currentRank.name}
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-bold mt-1">
              {currentTrophies} TR · Tier {currentRank.tierNumber}
            </span>
          </div>

          {/* Center VS Badge */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black border-2 border-amber-400 rounded-full items-center justify-center shadow-[0_0_10px_rgba(245,166,35,0.4)]">
            <Swords className="w-4 h-4 text-amber-400" />
          </div>

          {/* Right: Bot Opponent */}
          <div className="flex flex-col items-center text-center p-3 border border-amber-400/30 bg-amber-400/5">
            <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-wider mb-2">
              OPPONENT (BLACK PIECES)
            </span>
            <div className="w-16 h-16 flex items-center justify-center text-amber-400 mb-2">
              <BotFace size={64} mood="neutral" />
            </div>
            <span className="text-sm font-black text-white uppercase truncate max-w-[160px]">
              {botObj.name}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 mt-0.5">
              Rating: {botObj.rating}
            </span>
            <span className="text-[10px] font-mono text-slate-400 italic mt-1 line-clamp-1">
              &ldquo;{botObj.desc}&rdquo;
            </span>
          </div>
        </div>

        {/* Stakes & Rules Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 uppercase font-black">LEAGUE STAKES</span>
            <span className="text-emerald-400 font-black text-sm">
              +{winTR} TR / 0 TR Loss
            </span>
          </div>
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 uppercase font-black">TIME CONTROL</span>
            <span className="text-slate-200 font-black text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              5:00 Rapid
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-2.5 bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 uppercase font-black">RULES FORMAT</span>
            <span className="text-slate-200 font-black text-sm flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              Standard Classic
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onDeploy(botObj.id)}
            className="w-full sm:flex-1 py-3 px-6 bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-sm uppercase border-2 border-black shadow-[3px_3px_0px_#fff] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>DEPLOY INTO LEAGUE ARENA</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono font-bold text-xs uppercase border border-slate-700 cursor-pointer active:scale-95"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
