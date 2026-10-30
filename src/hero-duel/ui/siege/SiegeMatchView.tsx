import React, { useState, useEffect, useRef } from 'react';
import { HeroId } from '../../types/heroDuelTypes';
import { createInitialSiegeState } from '../../engine/siege/siegeState';
import { simulateSiegeTick } from '../../engine/siege/siegeSim';
import { runSiegeBotTick } from '../../ai/siege/siegeBot';
import { SiegeState, SiegeHeroInstance } from '../../engine/siege/siegeTypes';
import { SiegeBoard } from './SiegeBoard';
import { SiegeHud } from './SiegeHud';
import { SiegeResultsModal } from './SiegeResultsModal';
import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { ArrowLeft, Shield, Swords, Sparkles } from 'lucide-react';

interface SiegeMatchViewProps {
  heroes: HeroId[];
  placements: { heroId: HeroId; pos: { x: number; y: number } }[];
  aiDifficulty: 'easy' | 'normal' | 'hard';
  onBackToHome: () => void;
  onOpenCardVault: () => void;
}

export const SiegeMatchView: React.FC<SiegeMatchViewProps> = ({
  heroes,
  placements,
  aiDifficulty,
  onBackToHome,
  onOpenCardVault,
}) => {
  // Setup Bot Placements (mirror team 1 on top rows 11-12)
  const botPlacements = heroes.map((hId, idx) => ({
    heroId: hId,
    pos: { x: idx * 2 + 1, y: 11 },
  }));

  const [state, setState] = useState<SiegeState>(() =>
    createInitialSiegeState(heroes, heroes, placements, botPlacements)
  );

  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [selectedHero, setSelectedHero] = useState<SiegeHeroInstance | null>(null);
  const [matchKey, setMatchKey] = useState(0);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (isPaused || state.winner) return;

    const intervalMs = SIEGE_CONFIG.TICK_MS / gameSpeed;
    const timer = setInterval(() => {
      let nextState = simulateSiegeTick(stateRef.current, 0.1);
      nextState = runSiegeBotTick(nextState, aiDifficulty);
      setState(nextState);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, gameSpeed, state.winner, matchKey]);

  const handleOrderCellClick = (pos: { x: number; y: number }) => {
    if (!selectedHero) return;
    const updatedHeroes = state.heroes.map((h) => {
      if (h.instanceId === selectedHero.instanceId) {
        return {
          ...h,
          order: { type: 'move' as const, targetCoord: pos },
        };
      }
      return h;
    });
    setState((prev) => ({ ...prev, heroes: updatedHeroes }));
    setSelectedHero(null);
  };

  const handleRestart = () => {
    setState(createInitialSiegeState(heroes, heroes, placements, botPlacements));
    setMatchKey((prev) => prev + 1);
  };

  return (
    <div className="hd-root min-h-screen bg-[#08080a] text-white flex flex-col font-sans select-none p-4 sm:p-6">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-3 border-b border-white/20 mb-4">
        <button
          onClick={onBackToHome}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white flex items-center gap-2 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Siege</span>
        </button>

        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <h1 className="text-base font-black uppercase tracking-wider text-amber-400">
            Shrine Siege • Real-Time Battle
          </h1>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Difficulty: <span className="text-white uppercase font-bold">{aiDifficulty}</span>
        </div>
      </header>

      {/* HUD */}
      <SiegeHud
        state={state}
        isPaused={isPaused}
        gameSpeed={gameSpeed}
        onTogglePause={() => setIsPaused(!isPaused)}
        onChangeSpeed={(spd) => setGameSpeed(spd)}
        onResign={() => setState((prev) => ({ ...prev, winner: 2, winReason: 'Player resigned' }))}
      />

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <SiegeBoard
          state={state}
          selectedHero={selectedHero}
          onSelectHero={(h) => setSelectedHero(h)}
          onOrderCellClick={handleOrderCellClick}
        />
        {selectedHero && (
          <div className="mt-3 px-4 py-2 bg-amber-400 text-black font-black text-xs rounded uppercase shadow-lg animate-bounce">
            Selected: {selectedHero.name} — Tap any cell on the board to order movement!
          </div>
        )}
      </div>

      {/* Results Modal */}
      {state.winner && (
        <SiegeResultsModal
          state={state}
          playerTeam={1}
          onRestart={handleRestart}
          onBackToHome={onBackToHome}
          onOpenCardVault={onOpenCardVault}
        />
      )}
    </div>
  );
};
