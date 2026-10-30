import React, { useState, useEffect } from 'react';
import { HeroInstance, Coord } from '../types/heroDuelTypes';
import { HeroPieceSvg } from '../art/heroPieceSvg';
import { StatusBadge } from '../art/statusIcons';
import {
  BookOpen,
  Zap,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Info,
  Scroll,
} from 'lucide-react';

export interface LogEntry {
  id: string;
  turnNumber: number;
  text: string;
  side: 'player' | 'enemy' | 'system';
}

interface GuidancePanelProps {
  selectedHero: HeroInstance | null;
  logs: LogEntry[];
  currentTurn: 1 | 2;
  isAiThinking: boolean;
  activeTargetMode: boolean;
  activeTargetName?: string;
  isCaptainInDanger?: boolean;
  isEnemyCaptainExposed?: boolean;
  onOpenHowToPlay: () => void;
  isMobile?: boolean;
}

export const GuidancePanel: React.FC<GuidancePanelProps> = ({
  selectedHero,
  logs,
  currentTurn,
  isAiThinking,
  activeTargetMode,
  activeTargetName,
  isCaptainInDanger,
  isEnemyCaptainExposed,
  onOpenHowToPlay,
  isMobile = false,
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'log' | 'rules'>('hero');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('hero_duel_tour_seen');
      if (!seen) {
        setShowTour(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismissTour = () => {
    setShowTour(false);
    try {
      localStorage.setItem('hero_duel_tour_seen', 'true');
    } catch {
      // ignore
    }
  };

  const handleReplayTour = () => {
    setTourStep(0);
    setShowTour(true);
  };

  // Turn Coach Message Generation
  let coachText = 'Your turn. Tap any friendly champion on the board or in the Ability Bar.';
  if (isAiThinking) {
    coachText = 'Enemy is strategizing... Prepare your counter-attack!';
  } else if (currentTurn === 2) {
    coachText = 'Waiting for enemy move...';
  } else if (activeTargetMode) {
    coachText = `Targeting: Choose a highlighted square to unleash ${activeTargetName || 'active power'}.`;
  } else if (selectedHero) {
    coachText = `${selectedHero.name || selectedHero.heroId} selected. Green dots = Legal Moves, Red rings = Captures. Or tap USE ABILITY.`;
  }

  const latestLog = logs[0]?.text || 'Battle commences. Capture the enemy Captain to claim victory!';

  const tourSteps = [
    {
      title: '1. Select a Hero',
      desc: 'Tap any champion on the 7×8 board or use the persistent Ability Bar below.',
    },
    {
      title: '2. See Legal Moves',
      desc: 'Green dots show movement destinations. Red rings indicate capture targets.',
    },
    {
      title: '3. Use Active Abilities',
      desc: 'Tap READY active power buttons to enter targeting mode immediately without moving.',
    },
    {
      title: '4. Slay the Captain',
      desc: 'Eliminate the enemy Captain (marked with 👑) to claim total victory and conquer cards!',
    },
  ];

  return (
    <>
      {/* 4-Step Interactive Coach Mark Tour Overlay */}
      {showTour && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border-3 border-amber-400 max-w-sm w-full p-5 rounded-xl shadow-2xl text-white relative flex flex-col gap-3">
            <button
              onClick={handleDismissTour}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Hero Duel Guide • Step {tourStep + 1}/4</span>
            </div>

            <h3 className="text-lg font-black uppercase text-white">
              {tourSteps[tourStep].title}
            </h3>
            <p className="text-xs text-neutral-300 font-mono leading-relaxed">
              {tourSteps[tourStep].desc}
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <button
                onClick={handleDismissTour}
                className="text-xs text-neutral-400 hover:text-white uppercase font-bold"
              >
                Skip Tour
              </button>
              {tourStep < 3 ? (
                <button
                  onClick={() => setTourStep((prev) => prev + 1)}
                  className="hd-btn-brutal px-4 py-1.5 bg-amber-400 text-black font-black text-xs uppercase cursor-pointer"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleDismissTour}
                  className="hd-btn-brutal px-4 py-1.5 bg-emerald-500 text-black font-black text-xs uppercase cursor-pointer"
                >
                  Got It!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Guidance Banner & Bottom Sheet */}
      {isMobile ? (
        <div className="w-full flex flex-col gap-2">
          {/* Slim Turn Coach Banner */}
          <div
            className={`w-full px-3 py-2 border-2 rounded-lg text-xs font-mono flex items-center justify-between gap-2 shadow-sm ${
              isCaptainInDanger
                ? 'bg-red-950 border-red-500 text-red-200 animate-pulse'
                : isEnemyCaptainExposed
                ? 'bg-amber-950 border-amber-400 text-amber-200'
                : 'bg-[#141419] border-white/20 text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate leading-tight">{coachText}</span>
            </div>
            <button
              onClick={handleReplayTour}
              className="text-[10px] text-amber-400 underline shrink-0 font-bold uppercase"
            >
              Tour
            </button>
          </div>

          {/* Bottom Sheet Handle & Tabs */}
          <div className="w-full bg-[#121218] border-2 border-white/20 rounded-xl overflow-hidden shadow-lg">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-3 py-2 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-mono text-neutral-300 cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Scroll className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate text-[11px]">{latestLog}</span>
              </div>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {isExpanded && (
              <div className="p-3 max-h-56 overflow-y-auto flex flex-col gap-3">
                <div className="flex border-b border-white/10 gap-2 text-xs font-black uppercase">
                  <button
                    onClick={() => setActiveTab('hero')}
                    className={`pb-1 px-2 border-b-2 ${
                      activeTab === 'hero'
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Hero Info
                  </button>
                  <button
                    onClick={() => setActiveTab('log')}
                    className={`pb-1 px-2 border-b-2 ${
                      activeTab === 'log'
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Battle Log ({logs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('rules')}
                    className={`pb-1 px-2 border-b-2 ${
                      activeTab === 'rules'
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Rules
                  </button>
                </div>

                {activeTab === 'hero' && (
                  <div>
                    {selectedHero ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="font-black text-amber-300 text-sm uppercase">
                          {selectedHero.name} {selectedHero.isCaptain ? '👑' : ''}
                        </div>
                        <p className="text-neutral-300 text-[11px]">{selectedHero.title}</p>
                        <div className="p-2 bg-black/50 border border-white/10 rounded">
                          <span className="font-bold text-blue-400">⚡ {selectedHero.active.name}:</span>{' '}
                          <span className="text-neutral-300">{selectedHero.active.description}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 font-mono italic">
                        Tap any hero on the board to view stats and tactical abilities.
                      </span>
                    )}
                  </div>
                )}

                {activeTab === 'log' && (
                  <div className="space-y-1 max-h-36 overflow-y-auto font-mono text-[11px]">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`py-0.5 border-b border-white/5 ${
                          log.side === 'player'
                            ? 'text-amber-300'
                            : log.side === 'enemy'
                            ? 'text-red-400'
                            : 'text-neutral-400'
                        }`}
                      >
                        <span className="opacity-60">[Turn {log.turnNumber}]</span> {log.text}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'rules' && (
                  <div className="text-[11px] font-mono text-neutral-300 space-y-1">
                    <p>• 1 move OR 1 active ability per turn.</p>
                    <p>• Active powers never capture directly unless specified.</p>
                    <p>• Slay enemy Captain (👑) for immediate match victory!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Right Sidebar: Turn Coach & Guide Panel */
        <aside className="w-80 bg-[#121218] border-2 border-white/20 rounded-xl p-4 flex flex-col gap-4 text-white shadow-xl h-[calc(100vh-5rem)] sticky top-16 overflow-y-auto">
          {/* Turn Coach */}
          <div
            className={`p-3.5 border-2 rounded-xl text-xs font-mono space-y-1.5 shadow-md ${
              isCaptainInDanger
                ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
                : isEnemyCaptainExposed
                ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                : 'bg-black/60 border-amber-400/50 text-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-400 tracking-wider">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Turn Coach
              </span>
              <button onClick={handleReplayTour} className="underline hover:text-white cursor-pointer">
                Replay Tour
              </button>
            </div>
            <p className="leading-relaxed text-xs">{coachText}</p>
            <div className="text-[10px] text-amber-300/80 font-bold uppercase pt-1 border-t border-white/10">
              Goal: Capture Enemy Captain (👑) to Win!
            </div>
          </div>

          {/* Selected Hero Info Card */}
          <div className="bg-[#181822] border-2 border-white/15 rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase text-neutral-400">
                Selected Champion
              </span>
              {selectedHero && (
                <span className="text-[10px] font-mono text-amber-400">
                  {selectedHero.team === 1 ? 'Ally' : 'Enemy'}
                </span>
              )}
            </div>

            {selectedHero ? (
              <div className="space-y-2 text-xs">
                <div>
                  <h4 className="font-black text-sm uppercase text-white flex items-center gap-1.5">
                    {selectedHero.name} {selectedHero.isCaptain && '👑'}
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-mono">{selectedHero.title}</p>
                </div>

                {/* Active Ability */}
                <div className="p-2.5 bg-blue-950/50 border border-blue-400/40 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-blue-300 font-black text-xs">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      {selectedHero.active.name}
                    </span>
                    <span className="text-[9px] font-mono bg-blue-900/80 px-1.5 py-0.5 rounded">
                      {selectedHero.currentCooldown === 0
                        ? 'READY'
                        : `CD: ${selectedHero.currentCooldown}T`}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    {selectedHero.active.description}
                  </p>
                </div>

                {/* Key Passives */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-amber-400 block">
                    Innate Passives
                  </span>
                  {selectedHero.passives.map((p, idx) => (
                    <div key={idx} className="text-[11px] p-2 bg-black/40 border border-white/10 rounded">
                      <span className="font-bold text-amber-300">{p.name}:</span>{' '}
                      <span className="text-neutral-300">{p.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-neutral-400 font-mono italic">
                Tap any hero on the 7×8 board or ability bar to view tactical stats and movement diagrams.
              </div>
            )}
          </div>

          {/* Quick Reference Rules (Collapsible) */}
          <div className="bg-[#181822] border-2 border-white/15 rounded-xl p-3 flex flex-col gap-2">
            <button
              onClick={() => setIsRulesExpanded(!isRulesExpanded)}
              className="flex items-center justify-between text-xs font-black uppercase text-amber-400 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Rules Quick-Ref
              </span>
              {isRulesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isRulesExpanded && (
              <div className="text-[11px] font-mono text-neutral-300 space-y-1.5 pt-2 border-t border-white/10">
                <p>• 1 move OR 1 active ability per turn.</p>
                <p>• Active abilities never capture directly unless specified.</p>
                <p>• Cooldown ticks down at end of owner turn.</p>
                <p>• Silenced: Cannot use active ability.</p>
                <p>• Rooted: Cannot move on board.</p>
              </div>
            )}
          </div>

          <button
            onClick={onOpenHowToPlay}
            className="hd-btn-brutal w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase cursor-pointer mt-auto"
          >
            Full Codex & How to Play
          </button>
        </aside>
      )}
    </>
  );
};
