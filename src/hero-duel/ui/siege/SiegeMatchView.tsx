import React, { useState, useEffect } from 'react';
import { HeroId } from '../../types/heroDuelTypes';
import { createInitialSiegeState } from '../../engine/siege/siegeState';
import {
  processPlayerTurnPhase,
  processBotTurnPhase,
  unlockHeroAbility,
  skipHeroAbilityUnlock,
  executeHeroAbility,
  getValidHeroMoves,
  isCoordOnShrine,
} from '../../engine/siege/siegeSim';
import { calculateBotTurnMoves } from '../../ai/siege/siegeBot';
import { SiegeState, SiegeHeroInstance, Coord, PlayerAction } from '../../engine/siege/siegeTypes';
import { SiegeChessBoard } from './SiegeChessBoard';
import { SiegeHud } from './SiegeHud';
import { SiegeResultsModal } from './SiegeResultsModal';
import { DeploymentScreen } from './DeploymentScreen';
import { ArrowLeft, Shield, Sparkles, Swords, Zap, Lock } from 'lucide-react';
import { getHeroById } from '../../heroes/heroRegistry';
import { HeroPiece, heroIdToPieceType } from '../../art/heroAvatarHelper';
import { haptics } from '../../utils/haptics';
import { SiegeRulebookModal } from './SiegeRulebookModal';

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
  const [phase, setPhase] = useState<'deploy' | 'battle'>('deploy');
  const [activePlacements, setActivePlacements] = useState(placements);

  // Bot Placements (row 0: cols 1, 3, 5, 7)
  const botPlacements = heroes.slice(0, 4).map((hId, idx) => ({
    heroId: hId,
    pos: { x: idx * 2 + 1, y: 0 },
  }));

  const [state, setState] = useState<SiegeState>(() =>
    createInitialSiegeState(heroes, heroes, activePlacements, botPlacements)
  );

  // Turn-based State
  const [turnPhase, setTurnPhase] = useState<
    'player_planning' | 'player_animating' | 'bot_thinking' | 'bot_animating' | 'turn_transition'
  >('player_planning');

  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [bannerText, setBannerText] = useState<string | null>(null);
  const [showRulebook, setShowRulebook] = useState<boolean>(false);

  // Auto-select first alive player hero if none selected during planning
  useEffect(() => {
    if (turnPhase === 'player_planning' && !selectedHeroId && !state.winner && !state.shrineModal) {
      const firstAlive = state.heroes.find((h) => h.team === 1 && h.isAlive);
      if (firstAlive) {
        setSelectedHeroId(firstAlive.instanceId);
      }
    }
  }, [turnPhase, selectedHeroId, state.heroes, state.winner, state.shrineModal]);

  // Start battle handler
  const handleStartBattle = (
    deployedPlacements: { heroId: HeroId; pos: { x: number; y: number } }[]
  ) => {
    setActivePlacements(deployedPlacements);
    const deployedHeroIds = deployedPlacements.map((p) => p.heroId);
    const initialState = createInitialSiegeState(deployedHeroIds, heroes, deployedPlacements, botPlacements);
    setState(initialState);
    const firstAlive = initialState.heroes.find((h) => h.team === 1 && h.isAlive);
    setSelectedHeroId(firstAlive ? firstAlive.instanceId : null);
    setTurnPhase('player_planning');
    setPhase('battle');
  };

  // Selected hero
  const selectedHero = state.heroes.find(
    (h) => h.team === 1 && h.isAlive && h.instanceId === selectedHeroId
  ) || null;

  // Handle hero selection
  const handleSelectHero = (hero: SiegeHeroInstance) => {
    if (hero.team !== 1 || !hero.isAlive || turnPhase !== 'player_planning') return;
    haptics.select();
    setSelectedHeroId(hero.instanceId);
  };

  // 1-Click Move/Action Execution
  const executeDirectPlayerAction = (actions: PlayerAction[]) => {
    if (turnPhase !== 'player_planning' || state.winner || state.shrineModal) return;

    setTurnPhase('player_animating');
    setSelectedHeroId(null);

    const { nextState: playerResolved, unlockedModalHeroId } = processPlayerTurnPhase(
      state,
      actions
    );
    setState(playerResolved);

    setTimeout(() => {
      // Clear damage flashes
      setState((prev) => ({ ...prev, damageFlashes: [] }));

      // Shrine reached ability unlock modal check
      if (unlockedModalHeroId && playerResolved.shrineModal) {
        haptics.shrine();
        return;
      }

      // Win check
      if (playerResolved.winner) {
        if (playerResolved.winner === 1) haptics.victory();
        else haptics.defeat();
        return;
      }

      // Proceed to Bot Turn
      proceedToBotTurn(playerResolved);
    }, 280);
  };

  // Handle cell click on board (1-click immediate response)
  const handleCellClick = (pos: Coord) => {
    if (turnPhase !== 'player_planning') return;

    // Check if clicked cell contains a player hero
    const clickedPlayerHero = state.heroes.find(
      (h) => h.team === 1 && h.isAlive && h.pos.x === pos.x && h.pos.y === pos.y
    );

    if (clickedPlayerHero) {
      if (selectedHero && clickedPlayerHero.instanceId === selectedHero.instanceId && isCoordOnShrine(selectedHero.pos)) {
        // Hero is on shrine: clicking their cell defends/fortifies shrine in 1 click!
        haptics.shrine();
        executeDirectPlayerAction([
          { heroInstanceId: selectedHero.instanceId, targetPos: selectedHero.pos, isHold: true },
        ]);
        return;
      }
      // Otherwise switch active selection
      haptics.select();
      setSelectedHeroId(clickedPlayerHero.instanceId);
      return;
    }

    if (!selectedHero) return;

    // Check if clicked cell is a valid move/attack/shrine target
    const valid = getValidHeroMoves(selectedHero, state);
    const isAttack = valid.attacks.some((c) => c.x === pos.x && c.y === pos.y);
    const isShrine = valid.shrines.some((c) => c.x === pos.x && c.y === pos.y);
    const isMove = valid.moves.some((c) => c.x === pos.x && c.y === pos.y);

    if (isAttack) {
      haptics.attack();
      executeDirectPlayerAction([{ heroInstanceId: selectedHero.instanceId, targetPos: pos }]);
    } else if (isShrine) {
      haptics.shrine();
      executeDirectPlayerAction([{ heroInstanceId: selectedHero.instanceId, targetPos: pos }]);
    } else if (isMove) {
      haptics.move();
      executeDirectPlayerAction([{ heroInstanceId: selectedHero.instanceId, targetPos: pos }]);
    }
  };

  // Pass Turn handler (0 moves)
  const handlePassTurn = () => {
    if (turnPhase !== 'player_planning' || state.winner || state.shrineModal) return;
    haptics.select();
    executeDirectPlayerAction([]);
  };

  // Bot Planning and Execution
  const proceedToBotTurn = (currentState: SiegeState) => {
    setTurnPhase('bot_thinking');
    setBannerText("OPPONENT'S TURN...");

    const thinkDelay = aiDifficulty === 'easy' ? 900 : aiDifficulty === 'normal' ? 650 : 350;

    setTimeout(() => {
      const botActions = calculateBotTurnMoves(currentState, aiDifficulty);
      setTurnPhase('bot_animating');

      const botResolved = processBotTurnPhase(currentState, botActions);
      setState(botResolved);

      setTimeout(() => {
        setState((prev) => ({ ...prev, damageFlashes: [] }));

        if (botResolved.winner) {
          setBannerText(null);
          if (botResolved.winner === 1) haptics.victory();
          else haptics.defeat();
          return;
        }

        setBannerText('YOUR TURN');
        setTurnPhase('turn_transition');

        setTimeout(() => {
          setBannerText(null);
          const firstAlive = botResolved.heroes.find((h) => h.team === 1 && h.isAlive);
          setSelectedHeroId(firstAlive ? firstAlive.instanceId : null);
          setTurnPhase('player_planning');
        }, 300);
      }, 280);
    }, thinkDelay);
  };

  // Ability Unlock Modal Handlers
  const handleConfirmUnlock = (instanceId: string, abilityName: string) => {
    haptics.ability();
    const updatedState = unlockHeroAbility(state, instanceId, abilityName);
    setState(updatedState);

    if (!updatedState.winner) {
      proceedToBotTurn(updatedState);
    }
  };

  const handleSkipUnlock = () => {
    haptics.select();
    const updatedState = skipHeroAbilityUnlock(state);
    setState(updatedState);

    if (!updatedState.winner) {
      proceedToBotTurn(updatedState);
    }
  };

  // Trigger Hero Active Skill directly (1-tap execution)
  const handleTriggerAbility = (instanceId: string) => {
    const hero = state.heroes.find((h) => h.instanceId === instanceId && h.team === 1);
    if (!hero) return;

    if (!hero.abilityUnlocked) {
      haptics.select();
      setBannerText(`${hero.name.toUpperCase()} MUST REACH SHRINE TO AWAKEN!`);
      setTimeout(() => setBannerText(null), 1600);
      return;
    }

    if (hero.currentAbilityCooldown > 0) {
      haptics.select();
      setBannerText(`ABILITY COOLDOWN: ${hero.currentAbilityCooldown} TURNS`);
      setTimeout(() => setBannerText(null), 1400);
      return;
    }

    haptics.ability();
    setState((prev) => executeHeroAbility(prev, instanceId));
  };

  // Restart match
  const handleRestart = () => {
    haptics.select();
    setState(createInitialSiegeState(heroes, heroes, activePlacements, botPlacements));
    setSelectedHeroId(null);
    setBannerText(null);
    setTurnPhase('player_planning');
  };

  if (phase === 'deploy') {
    return (
      <DeploymentScreen
        heroes={heroes}
        onStartBattle={handleStartBattle}
        onBack={onBackToHome}
      />
    );
  }

  const modalHero = state.shrineModal
    ? state.heroes.find((h) => h.instanceId === state.shrineModal?.heroInstanceId)
    : null;
  const modalHeroDef = modalHero ? getHeroById(modalHero.heroId) : null;

  // Active squad heroes for the bottom bar (exactly 4 heroes)
  const squadHeroes = state.heroes.filter((h) => h.team === 1);

  return (
    <div className="hd-root min-h-screen max-h-screen h-screen flex flex-col justify-between overflow-hidden bg-[#07090e] text-white select-none">
      {/* TOP SECTION: Integrated Compact HUD (Redundant 'Shrine Siege 8×8' header removed) */}
      <div className="w-full max-w-5xl mx-auto px-2 pt-1.5 shrink-0">
        <SiegeHud
          state={state}
          selectedHeroId={selectedHeroId}
          phase={turnPhase}
          statusNotification={bannerText}
          aiDifficulty={aiDifficulty}
          onExit={onBackToHome}
          onOpenRulebook={() => {
            haptics.select();
            setShowRulebook(true);
          }}
          onSelectHeroChip={(id) => {
            haptics.select();
            setSelectedHeroId(id);
          }}
          onPassTurn={handlePassTurn}
          onResign={() => {
            haptics.defeat();
            setState((prev) => ({ ...prev, winner: 2, winReason: 'Player surrendered' }));
          }}
        />
      </div>

      {/* Rulebook Modal */}
      <SiegeRulebookModal
        isOpen={showRulebook}
        onClose={() => {
          haptics.select();
          setShowRulebook(false);
        }}
      />

      {/* CENTER SECTION: Mobile and Desktop Centered Board */}
      <div className="flex-1 flex items-center justify-center min-h-0 w-full overflow-hidden px-2">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full max-w-5xl h-full">
          {/* Desktop Left Roster */}
          <div className="hidden lg:flex w-48 bg-[#10141f] border border-white/10 p-2.5 rounded-xl flex-col gap-2 shrink-0">
            <h3 className="text-xs font-black uppercase text-amber-400 border-b border-white/10 pb-1">
              Champions
            </h3>
            <div className="flex flex-col gap-1.5">
              {squadHeroes.map((h, idx) => {
                const isSelected = selectedHeroId === h.instanceId;
                return (
                  <div
                    key={h.instanceId}
                    onClick={() => {
                      if (h.isAlive) {
                        haptics.select();
                        setSelectedHeroId(h.instanceId);
                      }
                    }}
                    className={`p-1.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400'
                        : !h.isAlive
                        ? 'bg-neutral-900/50 border-neutral-800 opacity-40 cursor-not-allowed'
                        : 'bg-neutral-900 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center drop-shadow-md">
                      <HeroPiece type={heroIdToPieceType(h.heroId)} color="white" className="w-full h-full" />
                    </div>
                    <div className="text-[10px] font-mono leading-tight flex-1 min-w-0">
                      <div className="font-bold text-white uppercase truncate">{h.name}</div>
                      <div className="text-emerald-400 font-bold">{h.hp}/{h.maxHp} HP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Centered Board */}
          <div className="flex-1 flex items-center justify-center h-full w-full max-h-full">
            <SiegeChessBoard
              state={state}
              selectedHero={selectedHero}
              queuedMoves={{}}
              heldHeroIds={new Set()}
              interactive={turnPhase === 'player_planning' && !state.shrineModal}
              onSelectHero={handleSelectHero}
              onCellClick={handleCellClick}
            />
          </div>

          {/* Desktop Right Details & In-Game Status */}
          <div className="hidden lg:flex w-64 bg-[#10141f] border border-white/10 p-3 rounded-xl flex-col gap-2.5 shrink-0">
            {/* Dedicated In-Game Turn & Intel Notification Widget */}
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                turnPhase.includes('bot')
                  ? 'bg-red-950/70 border-red-500/60'
                  : 'bg-[#151926] border-amber-400/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  {turnPhase.includes('bot') ? (
                    <span className="text-red-400 flex items-center gap-1 animate-pulse">
                      <Swords className="w-3.5 h-3.5" /> Opponent's Turn
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> Your Turn
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-neutral-400">1-Tap Action</span>
              </div>
              {bannerText && (
                <div className="text-[10px] font-mono text-amber-200 mt-1 font-bold truncate">
                  {bannerText}
                </div>
              )}
            </div>

            {selectedHero ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <div>
                    <h3 className="text-xs font-black uppercase text-amber-400">{selectedHero.name}</h3>
                    <p className="text-[10px] text-neutral-400 font-mono">{selectedHero.title}</p>
                  </div>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-500/30">
                    {selectedHero.role}
                  </span>
                </div>
                <div className="text-[11px] font-mono space-y-1 bg-black/40 p-2 rounded border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Health:</span>
                    <span className="text-emerald-400 font-bold">{selectedHero.hp}/{selectedHero.maxHp} HP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Attack:</span>
                    <span className="text-white font-bold">{selectedHero.attackDamage} DMG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Position:</span>
                    <span className="text-amber-300 font-bold">Col {selectedHero.pos.x + 1}, Row {8 - selectedHero.pos.y}</span>
                  </div>
                </div>
                {isCoordOnShrine(selectedHero.pos) && (
                  <button
                    onClick={() => {
                      haptics.shrine();
                      executeDirectPlayerAction([
                        { heroInstanceId: selectedHero.instanceId, targetPos: selectedHero.pos, isHold: true },
                      ]);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded cursor-pointer border border-white shadow"
                  >
                    Fortify & Hold Shrine
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-neutral-400 font-mono text-center py-8">
                Tap any champion on board to view movement and targets.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION BAR: 4 ACTIVE ABILITY USAGE BUTTONS */}
      <div className="w-full bg-[#0c101a]/95 backdrop-blur-md border-t-2 border-slate-700/80 p-2 sm:p-2.5 z-30 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-1.5 sm:gap-2">
          {squadHeroes.slice(0, 4).map((hero, idx) => {
            const def = getHeroById(hero.heroId);
            const isUnlocked = hero.abilityUnlocked;
            const onCooldown = hero.currentAbilityCooldown > 0;
            const isReady = isUnlocked && !onCooldown && hero.isAlive;
            const isHeroSelected = selectedHeroId === hero.instanceId;

            return (
              <button
                key={hero.instanceId}
                type="button"
                onClick={() => {
                  if (!isUnlocked || onCooldown) {
                    handleTriggerAbility(hero.instanceId);
                  } else {
                    handleTriggerAbility(hero.instanceId);
                  }
                }}
                className={`relative p-1.5 sm:p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                  !hero.isAlive
                    ? 'bg-neutral-900/60 border-neutral-800 opacity-40 cursor-not-allowed'
                    : isReady
                    ? 'bg-gradient-to-b from-purple-900/80 to-purple-950/90 border-purple-400 ring-1 ring-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] animate-pulse active:scale-95'
                    : isUnlocked && onCooldown
                    ? 'bg-neutral-900/90 border-neutral-700 text-neutral-400 active:scale-98'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-500 active:scale-98'
                }`}
              >
                {/* Hero Avatar & Ability Title */}
                <div className="flex items-center gap-1 w-full justify-center">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 drop-shadow-md">
                    <HeroPiece type={heroIdToPieceType(hero.heroId)} color="white" className="w-full h-full" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-white truncate max-w-[70px]">
                    {hero.name}
                  </span>
                </div>

                <div className="text-[9px] sm:text-[10px] font-bold text-amber-300 truncate w-full mt-0.5">
                  {def?.active.name || 'Ability'}
                </div>

                {/* Status Indicator */}
                <div className="w-full mt-1">
                  {!isUnlocked ? (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-black/60 text-amber-400 border border-amber-500/30">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Shrine</span>
                    </span>
                  ) : onCooldown ? (
                    <span className="inline-block text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      CD: {hero.currentAbilityCooldown}T
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white border border-purple-300 shadow">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      <span>1-Tap Cast</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SHRINE REACHED ABILITY UNLOCK MODAL OVERLAY */}
      {state.shrineModal && modalHero && modalHeroDef && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#121218] border-3 border-amber-400 p-5 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center gap-2 border-b border-white/20 pb-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="font-black text-base uppercase text-amber-400 tracking-wider">
                ✨ GRAND SHRINE CLAIMED ✨
              </h3>
            </div>

            <div className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-white/10">
              <div className="w-12 h-12 p-1 shrink-0 flex items-center justify-center drop-shadow-md">
                <HeroPiece type={heroIdToPieceType(modalHero.heroId)} color="white" className="w-full h-full" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-black">
                  {modalHero.title}
                </span>
                <h4 className="text-sm font-black uppercase text-white">{modalHero.name}</h4>
                <p className="text-[11px] text-neutral-300">Choose 1 of 3 awakened shrine blessings:</p>
              </div>
            </div>

            {/* 3 Ability Choices */}
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div
                onClick={() => handleConfirmUnlock(modalHero.instanceId, modalHeroDef.active.name)}
                className="p-3 bg-purple-950/70 hover:bg-purple-900/80 border-2 border-purple-500/60 rounded-xl cursor-pointer transition-all flex items-start gap-2.5"
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="font-black text-amber-300 uppercase flex items-center justify-between">
                    <span>{modalHeroDef.active.name}</span>
                    <span className="text-[9px] text-purple-300 font-mono">Cooldown: 2 Turns</span>
                  </div>
                  <p className="text-[11px] text-neutral-200">{modalHeroDef.active.description}</p>
                </div>
              </div>

              <div
                onClick={() => handleConfirmUnlock(modalHero.instanceId, 'Celestial Aegis')}
                className="p-3 bg-blue-950/70 hover:bg-blue-900/80 border-2 border-blue-500/60 rounded-xl cursor-pointer transition-all flex items-start gap-2.5"
              >
                <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="font-black text-sky-300 uppercase flex items-center justify-between">
                    <span>Celestial Aegis</span>
                    <span className="text-[9px] text-sky-300 font-mono">Passive Barrier</span>
                  </div>
                  <p className="text-[11px] text-neutral-200">
                    Fortify defenses: grants +4 Shield HP and permanent +20% damage reduction on all squares.
                  </p>
                </div>
              </div>

              <div
                onClick={() => handleConfirmUnlock(modalHero.instanceId, 'Divine Smite')}
                className="p-3 bg-red-950/70 hover:bg-red-900/80 border-2 border-red-500/60 rounded-xl cursor-pointer transition-all flex items-start gap-2.5"
              >
                <Swords className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="font-black text-red-300 uppercase flex items-center justify-between">
                    <span>Divine Smite</span>
                    <span className="text-[9px] text-red-300 font-mono">Instant Strike</span>
                  </div>
                  <p className="text-[11px] text-neutral-200">
                    Call down lightning dealing 5 Holy DMG to the nearest enemy champion.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={handleSkipUnlock}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-black text-xs uppercase rounded cursor-pointer border border-white/10"
              >
                Skip For Now
              </button>
            </div>
          </div>
        </div>
      )}

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
