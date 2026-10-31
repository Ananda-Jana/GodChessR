import React, { useState, useEffect, useMemo } from 'react';
import { HeroId } from '../../types/heroDuelTypes';
import { createInitialSiegeState } from '../../engine/siege/siegeState';
import {
  processPlayerTurnPhase,
  processBotTurnPhase,
  processOrthogonalAutoAttacks,
  unlockHeroAbility,
  skipHeroAbilityUnlock,
  executeHeroAbility,
  getValidHeroMoves,
  isCoordOnShrine,
  applyAbilityUpgrade,
  dismissAbilityUpgrade,
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
import { heroDuelAudio } from '../../utils/heroDuelAudio';
import { SiegeRulebookModal } from './SiegeRulebookModal';
import { HeroBottomDock, HeroDockItem } from '../HeroBottomDock';
import { MidGameUpgradeModal } from '../MidGameUpgradeModal';
import { HERO_DUEL_ABILITY_SUMMARIES } from '../../config/siegeRulesCodex';

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

  // Real-time 1-second interval loop: auto-attacks, 7s ability cooldown decrement, and shrine countdown ticks
  useEffect(() => {
    if (phase !== 'battle' || state.winner) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.winner) return prev;

        // 1. Decrement cooldowns every second for all living heroes
        const updatedHeroes = prev.heroes.map((h) => {
          if (h.currentAbilityCooldown > 0) {
            return {
              ...h,
              currentAbilityCooldown: Math.max(0, h.currentAbilityCooldown - 1),
            };
          }
          return h;
        });

        // 2. Continuous orthogonal auto-attack tick for units in adjacent contact (1-second tick)
        const { nextState: combatState, anyAttackHappened } = processOrthogonalAutoAttacks(
          {
            ...prev,
            heroes: updatedHeroes,
          },
          true // isSecondTick = true (increments 60s shrine countdown timer by 1s)
        );

        if (anyAttackHappened) {
          heroDuelAudio.playMoveThock();
        }

        return combatState;
      });

      // 3. Audio warning & hold ticks for shrine countdown (60s timer)
      const shrineHoldValues = state.shrines.map((s) => ({
        elapsed: s.dominionTimer || 0,
        isHolding: (s.dominionTimer || 0) > 0 || s.occupierTeam !== null,
      }));

      const activeHolds = shrineHoldValues.filter((s) => s.isHolding);
      if (activeHolds.length > 0) {
        const minRemaining = Math.min(...activeHolds.map((s) => Math.max(0, 60 - s.elapsed)));
        if (minRemaining <= 5 && minRemaining > 0) {
          heroDuelAudio.playWarningTick();
        } else if (minRemaining > 5) {
          heroDuelAudio.playShrineHoldTick();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, state.winner, state.shrines]);

  // Clear damage flashes automatically after brief burst
  useEffect(() => {
    if (state.damageFlashes.length > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, damageFlashes: [] }));
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [state.damageFlashes.length]);

  // Clear visual ability projectiles automatically after animation duration (1.25s)
  useEffect(() => {
    if (state.projectiles.length > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, projectiles: [] }));
      }, 1250);
      return () => clearTimeout(timer);
    }
  }, [state.projectiles.length]);

  // Active squad heroes for the bottom bar (exactly 4 heroes)
  const squadHeroes = useMemo(() => state.heroes.filter((h) => h.team === 1), [state.heroes]);

  // Memoized Hero Dock items with strict separation of name, 15 HP scaleX, and ability square
  // (Must be called unconditionally on every render before any early returns)
  const dockItems: HeroDockItem[] = useMemo(() => {
    return squadHeroes.slice(0, 4).map((hero) => ({
      instanceId: hero.instanceId,
      name: hero.name,
      hp: hero.hp,
      maxHp: 15,
      isAlive: hero.isAlive,
      abilityId: hero.assignedAbilityId || 'royalMeteor',
      abilityUnlocked: hero.abilityUnlocked,
      cooldownSeconds: hero.currentAbilityCooldown,
      initialCooldownSeconds: hero.abilityCooldownSec || 7,
      level: hero.abilityLevel || 1,
      maxLevel: 3,
      isActive: selectedHeroId === hero.instanceId,
    }));
  }, [squadHeroes, selectedHeroId]);

  // 1-Click Move/Action Execution
  const executeDirectPlayerAction = (actions: PlayerAction[]) => {
    if (turnPhase !== 'player_planning' || state.winner || state.shrineModal) return;

    // Wood-tap "thock" sound on every piece move
    heroDuelAudio.playMoveThock();

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
        heroDuelAudio.playShrineAcquired();
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
      setBannerText(`ABILITY COOLDOWN: ${hero.currentAbilityCooldown}s`);
      setTimeout(() => setBannerText(null), 1400);
      return;
    }

    heroDuelAudio.playAbilityWhoosh();
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
  const upgradeModalHero = state.upgradeModal
    ? state.heroes.find((h) => h.instanceId === state.upgradeModal?.heroInstanceId)
    : null;

  return (
    <div className="hd-root min-h-[100dvh] max-h-[100dvh] h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#07090e] text-white select-none">
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

      {/* BOTTOM NAVIGATION BAR: 1 COLUMN PER HERO (NAME -> 15 HP BAR -> 64PX PURPLE ABILITY SQUARE) */}
      <HeroBottomDock heroes={dockItems} onActivateAbility={handleTriggerAbility} />

      {/* MID-GAME ELIMINATION ABILITY UPGRADE MODAL */}
      {state.upgradeModal && upgradeModalHero && (
        <MidGameUpgradeModal
          isOpen={Boolean(state.upgradeModal)}
          heroName={upgradeModalHero.name}
          abilityId={upgradeModalHero.assignedAbilityId || 'meteor'}
          abilityName={
            HERO_DUEL_ABILITY_SUMMARIES.find(
              (a) => a.id === (upgradeModalHero.assignedAbilityId || 'meteor')
            )?.name || 'Equipment Ability'
          }
          currentLevel={upgradeModalHero.abilityLevel || 1}
          onSelectUpgrade={(choice) => {
            setState((prev) =>
              applyAbilityUpgrade(prev, state.upgradeModal!.heroInstanceId, choice)
            );
          }}
          onDismiss={() => {
            setState((prev) => dismissAbilityUpgrade(prev));
          }}
        />
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
