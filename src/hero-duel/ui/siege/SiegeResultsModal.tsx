import React, { useEffect, useState } from 'react';
import { SiegeState, TeamSide } from '../../engine/siege/siegeTypes';
import { CollectibleHeroCard } from '../../types/cardTypes';
import { grantSiegeKillCard } from '../../cards/siegeCardBridge';
import { Trophy, RefreshCw, ArrowLeft, Sparkles, Shield } from 'lucide-react';

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
  const [rewardCards, setRewardCards] = useState<CollectibleHeroCard[]>([]);
  const [hasGranted, setHasGranted] = useState(false);

  const isVictory = state.winner === playerTeam;

  useEffect(() => {
    if (!hasGranted && isVictory) {
      setHasGranted(true);
      // Grant a reward card for winning / defeating enemy heroes
      grantSiegeKillCard('mugen-king').then((card) => {
        setRewardCards([card]);
      });
    }
  }, [isVictory, hasGranted]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#16161c] border-3 border-amber-400 max-w-xl w-full rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-5 text-center">
        <div className={`w-16 h-16 rounded-2xl border-3 flex items-center justify-center shadow-lg ${isVictory ? 'bg-amber-400 text-black border-white' : 'bg-red-600 text-white border-black'}`}>
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {isVictory ? 'VICTORY • SHRINE SIEGE WON' : 'DEFEAT • SIEGE OVER'}
          </h2>
          <p className="text-xs text-amber-400 font-mono mt-1">
            {state.winReason || 'Match completed'}
          </p>
        </div>

        {rewardCards.length > 0 && (
          <div className="w-full bg-black/60 p-4 rounded-xl border border-amber-400/40">
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-amber-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Card Reward Earned!</span>
            </div>
            <div className="text-xs font-mono text-white">
              {rewardCards[0].heroName} • #{rewardCards[0].code} ({rewardCards[0].rarity.toUpperCase()})
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-3 border-t border-white/15">
          <button
            onClick={onRestart}
            className="hd-btn-brutal flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onOpenCardVault}
            className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase rounded border border-white/20 cursor-pointer"
          >
            Card Vault
          </button>
          <button
            onClick={onBackToHome}
            className="py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold text-xs uppercase rounded border border-white/20 cursor-pointer"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );
};
