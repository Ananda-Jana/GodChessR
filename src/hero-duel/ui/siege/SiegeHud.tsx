import React, { useState } from 'react';
import { SiegeState } from '../../engine/siege/siegeTypes';
import { Shield, Swords, ArrowLeft } from 'lucide-react';
import { HeroPiece, heroIdToPieceType } from '../../art/heroAvatarHelper';

interface SiegeHudProps {
  state: SiegeState;
  selectedHeroId: string | null;
  phase: string;
  statusNotification?: string | null;
  aiDifficulty?: string;
  onExit: () => void;
  onSelectHeroChip: (instanceId: string) => void;
  onPassTurn: () => void;
  onResign: () => void;
  onOpenRulebook: () => void;
}

export const SiegeHud: React.FC<SiegeHudProps> = ({
  state,
  selectedHeroId,
  phase,
  statusNotification,
  aiDifficulty,
  onExit,
  onSelectHeroChip,
  onPassTurn,
  onResign,
  onOpenRulebook,
}) => {
  const [showLog, setShowLog] = useState(false);

  const playerHeroes = state.heroes.filter((h) => h.team === 1 && h.isAlive);
  const shrineLeft = state.shrines.find((s) => s.id === 's-left');
  const shrineRight = state.shrines.find((s) => s.id === 's-right');

  const isPlanning = phase === 'player_planning';
  const isBotTurn = phase.includes('bot');

  return (
    <div className="w-full flex flex-col gap-1.5 shrink-0 select-none">
      {/* 1. TOP BAR: Exit, Turn Number, Dominion, Compact In-Bar Status Button, Controls */}
      <div className="bg-[#121218] border border-amber-400/80 px-2 py-1.5 rounded-xl flex items-center justify-between gap-1.5 shadow-lg min-h-[40px]">
        {/* Left: Exit & Turn Info */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onExit}
            className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-white/40 flex items-center gap-1 rounded text-[11px] font-bold cursor-pointer transition-colors active:scale-95"
            title="Exit Match"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden xs:inline">Exit</span>
          </button>

          <div className="text-[11px] font-mono font-black text-amber-400 bg-black/90 px-2 py-0.5 rounded border border-amber-400/40 uppercase">
            T{state.turn}
          </div>

          <div className="text-[10px] font-mono font-bold text-amber-300 hidden sm:flex items-center gap-1">
            <span>DOM:</span>
            <span className="text-white font-extrabold">{state.dominionTurns[1]}/8</span>
            <span className="text-neutral-500">•</span>
            <span className="text-red-400 font-extrabold">{state.dominionTurns[2]}/8</span>
          </div>
        </div>

        {/* Center: In-Bar Turn Notification Button (Fixed width/height, zero layout flicker) */}
        <div className="flex items-center justify-center shrink-0">
          <div
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase flex items-center justify-center gap-1.5 w-[115px] sm:w-[130px] h-6 shadow transition-colors ${
              isBotTurn
                ? 'bg-red-950/90 text-red-200 border border-red-500/90 animate-pulse'
                : 'bg-emerald-950/90 text-emerald-200 border border-emerald-400/90'
            }`}
          >
            {isBotTurn ? (
              <>
                <Swords className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate">OPPONENT</span>
              </>
            ) : (
              <>
                <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{statusNotification || 'YOUR TURN'}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Pass Turn, Log, Resign */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onPassTurn}
            disabled={!isPlanning}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border cursor-pointer transition-colors ${
              isPlanning
                ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border-amber-400/50 active:scale-95'
                : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
            }`}
            title="Pass turn without moving"
          >
            Pass
          </button>

          <button
            type="button"
            onClick={() => setShowLog(!showLog)}
            className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono rounded border border-white/20 cursor-pointer"
          >
            {showLog ? '✕' : 'Log'}
          </button>

          <button
            type="button"
            onClick={onOpenRulebook}
            className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[10px] font-mono font-bold rounded border border-amber-400/40 cursor-pointer flex items-center gap-0.5"
            title="Read Rulebook"
          >
            <span>?</span>
            <span className="hidden xs:inline">Rules</span>
          </button>

          <button
            type="button"
            onClick={onResign}
            className="px-1.5 py-0.5 bg-red-950 hover:bg-red-900 text-red-300 text-[10px] font-mono rounded border border-red-500/40 cursor-pointer"
            title="Surrender Match"
          >
            Resign
          </button>
        </div>
      </div>

      {/* 2. SECOND ROW: Shrine Control Badges & Hero Chips */}
      <div className="bg-[#14141c] border border-white/10 px-2 py-1 rounded-xl flex items-center justify-between gap-1.5 shadow min-h-[34px]">
        {/* Shrine Control Status Badges */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase shrink-0">
          <div
            className={`px-1.5 py-0.5 rounded border ${
              shrineLeft?.owner === 1
                ? 'bg-blue-950 border-blue-400 text-blue-300'
                : shrineLeft?.owner === 2
                ? 'bg-red-950 border-red-500 text-red-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-400'
            }`}
          >
            W: {shrineLeft?.owner === 1 ? 'Player' : shrineLeft?.owner === 2 ? 'Bot' : '—'}
          </div>
          <div
            className={`px-1.5 py-0.5 rounded border ${
              shrineRight?.owner === 1
                ? 'bg-blue-950 border-blue-400 text-blue-300'
                : shrineRight?.owner === 2
                ? 'bg-red-950 border-red-500 text-red-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-400'
            }`}
          >
            E: {shrineRight?.owner === 1 ? 'Player' : shrineRight?.owner === 2 ? 'Bot' : '—'}
          </div>
        </div>

        {/* Hero selection chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {playerHeroes.map((h, idx) => {
            const isSelected = selectedHeroId === h.instanceId;

            return (
              <button
                key={h.instanceId}
                type="button"
                onClick={() => onSelectHeroChip(h.instanceId)}
                className={`px-1.5 py-0.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-black border-white shadow-md'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                  <HeroPiece type={heroIdToPieceType(h.heroId)} color={isSelected ? 'black' : 'white'} className="w-full h-full" />
                </div>
                <span>H{idx + 1}</span>
                <span className="text-[9px] text-neutral-400 font-normal">
                  {h.hp}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Battle Log */}
      {showLog && (
        <div className="bg-black/95 border border-white/20 p-2 rounded-xl max-h-32 overflow-y-auto space-y-1 font-mono text-[10px] shadow-2xl">
          <div className="text-amber-400 font-bold uppercase pb-0.5 border-b border-white/10 flex justify-between">
            <span>Combat Log</span>
            <button onClick={() => setShowLog(false)} className="text-neutral-400 hover:text-white">✕</button>
          </div>
          {state.events.slice(0, 10).map((ev) => (
            <div
              key={ev.id}
              className={`leading-tight ${
                ev.team === 1 ? 'text-sky-300' : ev.team === 2 ? 'text-red-300' : 'text-neutral-300'
              }`}
            >
              • {ev.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
