import React, { useState, useEffect } from 'react';
import { SiegeState, TeamSide } from '../../engine/siege/siegeTypes';
import { Award, Trophy, RotateCcw, Home, Sparkles, Shield, ExternalLink } from 'lucide-react';
import { awardSiegeMatchCard } from '../../cards/siegeCardBridge';
import { CollectibleHeroCard } from '../../types/cardTypes';
import { HeroPiece, heroIdToPieceType } from '../../art/heroAvatarHelper';

interface SiegeResultsModalProps {
  state: SiegeState;
  playerTeam: TeamSide;
  onRestart: () => void;
  onBackToHome: () => void;
  onOpenCardVault: () => void;
}

export const SiegeResultsModal: React.FC<SiegeResultsModalProps> = ({
  state,
  playerTeam,
  onRestart,
  onBackToHome,
  onOpenCardVault,
}) => {
  const isWinner = state.winner === playerTeam;
  const [awardedCard, setAwardedCard] = useState<CollectibleHeroCard | null>(null);

  useEffect(() => {
    // Mint match reward card for both victory and defeat
    const card = awardSiegeMatchCard(state, isWinner);
    if (card) {
      setAwardedCard(card);
    }
  }, [isWinner, state]);

  // Find MVP Hero
  const playerHeroes = state.heroes.filter((h) => h.team === playerTeam);
  const mvpHero = [...playerHeroes].sort((a, b) => b.damageDealt + b.kills * 3 - (a.damageDealt + a.kills * 3))[0];

  const totalControlSec = state.stats.shrineControlSec[1] + state.stats.shrineControlSec[2] || 1;
  const playerControlPct = Math.round((state.stats.shrineControlSec[1] / totalControlSec) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121218] border-3 border-amber-400 p-6 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95">
        {/* Header Title */}
        <div className="text-center border-b border-white/20 pb-4">
          <div className={`inline-flex items-center justify-center p-3 border-2 rounded-full mb-2 ${
            isWinner ? 'bg-amber-400/20 border-amber-400' : 'bg-red-950/40 border-red-500'
          }`}>
            <Trophy className={`w-8 h-8 ${isWinner ? 'text-amber-400' : 'text-red-400'}`} />
          </div>
          <h2 className={`text-2xl font-black uppercase tracking-wider ${isWinner ? 'text-amber-400' : 'text-red-400'}`}>
            {isWinner ? 'VICTORY ACHIEVED!' : 'DEFEAT'}
          </h2>
          <p className="text-xs font-mono text-neutral-300 mt-1">{state.winReason}</p>
        </div>

        {/* Awarded Card Badge Notification with Hero Vector Artwork */}
        {awardedCard && (
          <div className={`p-3.5 rounded-xl flex items-center justify-between border-2 ${
            isWinner
              ? 'bg-gradient-to-r from-amber-950/60 to-purple-950/60 border-amber-400'
              : 'bg-gradient-to-r from-red-950/80 to-neutral-900 border-red-500/80'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 p-1 bg-black/60 rounded-lg border border-white/20 shrink-0 flex items-center justify-center drop-shadow-md">
                <HeroPiece type={heroIdToPieceType(awardedCard.heroId)} color="white" className="w-full h-full" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-amber-300 font-bold uppercase">
                  {isWinner ? '✨ Victory Reward Card Minted' : '📜 Valor Appreciation Card (Red)'}
                </div>
                <div className="text-xs font-black uppercase text-white">{awardedCard.heroName}</div>
                <div className="text-[9px] text-neutral-300 font-mono">Code: #{awardedCard.code} • {awardedCard.rarity}</div>
              </div>
            </div>
            <button
              onClick={onOpenCardVault}
              className="px-3 py-1.5 bg-amber-400 text-black text-[10px] font-black uppercase rounded cursor-pointer hover:bg-amber-300 flex items-center gap-1 shadow"
            >
              <span>Vault</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Tactical Statistics Matrix */}
        <div className="bg-black/60 border border-white/20 p-4 rounded-xl flex flex-col gap-3 font-mono text-xs">
          <div className="text-[10px] font-black uppercase text-amber-400 border-b border-white/10 pb-1">
            Tactical Match Breakdown
          </div>

          <div className="grid grid-cols-2 gap-2 text-neutral-300">
            <div>Match Duration: <span className="text-white font-bold">{Math.floor(state.elapsedSeconds)}s</span></div>
            <div>Shrine Dominance: <span className="text-white font-bold">{playerControlPct}%</span></div>
            <div>Dominion Hold: <span className="text-white font-bold">{state.dominionTimer[1].toFixed(1)}s</span></div>
            <div>Heroes Eliminated: <span className="text-white font-bold">{state.stats.heroesEliminated[1]}</span></div>
            <div className="col-span-2">Total Damage Dealt: <span className="text-white font-bold">{state.stats.totalDamageDealt[1]} HP</span></div>
          </div>

          {mvpHero && (
            <div className="bg-neutral-900 border border-white/10 p-2.5 rounded-lg flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-black uppercase text-white">MVP: {mvpHero.name}</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">{mvpHero.damageDealt} DMG • {mvpHero.kills} Kills</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase rounded border-2 border-white/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onBackToHome}
            className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded border-2 border-white flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Mode Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
