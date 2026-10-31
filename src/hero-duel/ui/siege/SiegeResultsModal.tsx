import React, { useState, useEffect, useRef } from 'react';
import { SiegeState, TeamSide } from '../../engine/siege/siegeTypes';
import { Award, Trophy, RotateCcw, Home, Sparkles, Shield, ExternalLink, Eye, EyeOff, Heart, Swords } from 'lucide-react';
import { awardSiegeMatchCard } from '../../cards/siegeCardBridge';
import { CollectibleHeroCard } from '../../types/cardTypes';
import { HeroPiece, heroIdToPieceType } from '../../art/heroAvatarHelper';
import { renderCardToCanvas } from '../../cards/cardRenderer';

interface SiegeResultsModalProps {
  state: SiegeState;
  playerTeam: TeamSide;
  onRestart: () => void;
  onBackToHome: () => void;
  onOpenCardVault: () => void;
}

const HEROIC_LINES: Record<string, string> = {
  'mugen-king': '“The realm stands immovable under my infinite domain!”',
  'dr-methanogenic': '“Toxic forces bloom eternal—victory is synthesized!”',
  'captain-englland': '“For honor, unity, and an unyielding shield line!”',
  'ironclad-warden': '“Steel and iron withstand every siege!”',
  'ajx-assassin': '“Vanquished in silence before they ever saw the blade.”',
  'yjkstra-pathfinder': '“Every calculation led inevitably to this triumph!”',
  'malevolent-priest': '“Sacred shrines bow only to true malevolence!”',
  'black-monkey': '“The storm has cleared, and I alone remain standing!”',
  'part-king-kong': '“Unstoppable power crushes all opposition!”',
};

function HeroCardPreview({ card, widthPx }: { card: CollectibleHeroCard; widthPx: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderCardToCanvas(c, card, (widthPx * dpr) / 750);
  }, [card, widthPx]);
  return (
    <canvas
      ref={ref}
      style={{ width: widthPx, height: (widthPx * 1050) / 750, display: 'block' }}
      aria-label={`${card.heroName} card, ${card.rarity}`}
    />
  );
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
  const [isBoardMinimized, setIsBoardMinimized] = useState<boolean>(false);

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

  // Surviving Heroes (Player & Allies)
  const survivingHeroes = state.heroes.filter((h) => h.isAlive);
  const survivingPlayerHeroes = state.heroes.filter((h) => h.team === playerTeam && h.isAlive);

  if (isBoardMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in fade-in">
        <button
          onClick={() => setIsBoardMinimized(false)}
          className="px-4 py-2.5 bg-amber-400 text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-amber-300"
        >
          <Eye className="w-4 h-4" />
          <span>Return to Match Results</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#121218] border-3 border-amber-400 p-4 sm:p-6 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col gap-4 text-white animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header Title & Defeat/Victory Reason */}
        <div className="text-center border-b border-white/20 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8" />
            <div className={`inline-flex items-center justify-center p-3 border-2 rounded-full ${
              isWinner ? 'bg-amber-400/20 border-amber-400' : 'bg-red-950/40 border-red-500'
            }`}>
              <Trophy className={`w-8 h-8 ${isWinner ? 'text-amber-400' : 'text-red-400'}`} />
            </div>
            <button
              onClick={() => setIsBoardMinimized(true)}
              className="p-2 text-neutral-400 hover:text-white bg-black/50 hover:bg-black/80 rounded-lg border border-white/20 cursor-pointer"
              title="Inspect Final Game Board State"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>

          <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-wider ${isWinner ? 'text-amber-400' : 'text-red-400'}`}>
            {isWinner ? 'VICTORY ACHIEVED!' : 'DEFEAT'}
          </h2>

          {/* Exact Defeat/Victory Condition Display */}
          <div className={`mt-2 p-2.5 rounded-xl border font-mono text-xs text-left ${
            isWinner ? 'bg-amber-950/40 border-amber-400/80 text-amber-200' : 'bg-red-950/60 border-red-500/80 text-red-200'
          }`}>
            <span className="font-black uppercase tracking-wider block text-[10px] text-white/80 mb-0.5">
              {isWinner ? '⚔️ Victory Condition Met:' : '💀 Defeat Reason:'}
            </span>
            <p className="leading-snug text-xs font-bold">{state.winReason}</p>
          </div>
        </div>

        {/* Awarded Card Redesigned Visual Display */}
        {awardedCard && (
          <div className={`p-4 rounded-xl flex flex-col items-center border-2 gap-3 ${
            isWinner
              ? 'bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
              : 'bg-gradient-to-r from-red-950/80 via-neutral-900 to-black border-red-500/80'
          }`}>
            {/* Redesigned Card Preview */}
            <div className="drop-shadow-2xl rounded-2xl overflow-hidden border-2 border-white/20">
              <HeroCardPreview card={awardedCard} widthPx={190} />
            </div>

            <div className="text-center">
              <div className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                {isWinner ? '✨ Victory Collectible Card Minted' : '📜 Valor Appreciation Card (Red)'}
              </div>
              <div className="text-sm font-black uppercase text-white mt-0.5">{awardedCard.heroName}</div>
              <div className="text-[10px] text-neutral-300 font-mono mt-0.5">
                Code: #{awardedCard.code} • {awardedCard.rarity.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Surviving Heroes Celebration Pop-up */}
        <div className="bg-gradient-to-b from-[#181824] to-[#0c0c12] border-2 border-amber-400/80 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Surviving Champions Celebration ({survivingPlayerHeroes.length}/{playerHeroes.length})
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
              {survivingPlayerHeroes.length > 0 ? 'Enduring Warriors' : 'All Fallen in Valor'}
            </span>
          </div>

          {survivingPlayerHeroes.length === 0 ? (
            <p className="text-xs font-mono text-neutral-400 italic text-center py-2">
              No champions survived the brutal siege, but their valor is etched in the shrine forever.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {survivingPlayerHeroes.map((hero) => {
                const quote = HEROIC_LINES[hero.heroId] || '“Standing firm against all odds!”';
                return (
                  <div
                    key={hero.instanceId}
                    className="p-2.5 bg-black/70 border border-amber-400/40 rounded-lg flex items-center gap-3 shadow-md"
                  >
                    <div className="w-10 h-10 p-1 bg-neutral-900 rounded-lg border border-amber-400/60 shrink-0 flex items-center justify-center shadow">
                      <HeroPiece type={heroIdToPieceType(hero.heroId)} color="white" className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-white truncate">{hero.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-emerald-400" /> {hero.hp} / {hero.maxHp || 35} HP
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-300 italic font-serif leading-snug truncate mt-0.5">
                        {quote}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tactical Statistics Matrix */}
        <div className="bg-black/60 border border-white/20 p-3.5 rounded-xl flex flex-col gap-2 font-mono text-xs">
          <div className="text-[10px] font-black uppercase text-amber-400 border-b border-white/10 pb-1 flex justify-between">
            <span>Tactical Match Breakdown</span>
            <span>Duration: {Math.floor(state.elapsedSeconds)}s</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-neutral-300 text-[11px]">
            <div>Shrine Dominance: <span className="text-white font-bold">{playerControlPct}%</span></div>
            <div>Dominion Hold: <span className="text-white font-bold">{state.dominionTimer[1].toFixed(1)}s</span></div>
            <div>Heroes Eliminated: <span className="text-white font-bold">{state.stats.heroesEliminated[1]}</span></div>
            <div>Total Damage: <span className="text-white font-bold">{state.stats.totalDamageDealt[1]} HP</span></div>
          </div>

          {mvpHero && (
            <div className="bg-neutral-900 border border-white/10 p-2 rounded-lg flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-black uppercase text-white">MVP: {mvpHero.name}</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">{mvpHero.damageDealt} DMG • {mvpHero.kills} Kills</span>
            </div>
          )}
        </div>

        {/* Action Navigation Buttons */}
        <div className="flex flex-col gap-2 pt-1 border-t border-white/15">
          {/* Select Card Vault Button */}
          <button
            onClick={onOpenCardVault}
            className="w-full py-3 min-h-[44px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Select Card Vault</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={onRestart}
              className="flex-1 py-3 min-h-[44px] bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase rounded-xl border-2 border-white/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              onClick={onBackToHome}
              className="flex-1 py-3 min-h-[44px] bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase rounded-xl border-2 border-white/30 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Home className="w-4 h-4" />
              <span>Exit to Mode Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
