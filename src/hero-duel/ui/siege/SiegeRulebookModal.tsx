import React, { useState } from 'react';
import { BookOpen, X, Swords, Shield, Sparkles, Zap, Trophy, Heart } from 'lucide-react';
import { HeroPiece, heroIdToPieceType } from '../../art/heroAvatarHelper';
import { ALL_HEROES } from '../../heroes/heroRegistry';

interface SiegeRulebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiegeRulebookModal: React.FC<SiegeRulebookModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'movement' | 'shrines' | 'heroes'>('overview');
  const [demoPos, setDemoPos] = useState<{ x: number; y: number }>({ x: 2, y: 2 });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-[#10141f] border-2 border-amber-400 p-4 sm:p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col gap-4 text-white animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-400">
              Shrine Siege • Comprehensive Rulebook
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1.5 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 rounded-lg border cursor-pointer uppercase ${
              activeTab === 'overview' ? 'bg-amber-400 text-black border-white' : 'bg-neutral-900 text-neutral-300 border-white/10'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('movement')}
            className={`py-2 rounded-lg border cursor-pointer uppercase ${
              activeTab === 'movement' ? 'bg-amber-400 text-black border-white' : 'bg-neutral-900 text-neutral-300 border-white/10'
            }`}
          >
            Movement & Combat
          </button>
          <button
            onClick={() => setActiveTab('shrines')}
            className={`py-2 rounded-lg border cursor-pointer uppercase ${
              activeTab === 'shrines' ? 'bg-amber-400 text-black border-white' : 'bg-neutral-900 text-neutral-300 border-white/10'
            }`}
          >
            Shrines & Skills
          </button>
          <button
            onClick={() => setActiveTab('heroes')}
            className={`py-2 rounded-lg border cursor-pointer uppercase ${
              activeTab === 'heroes' ? 'bg-amber-400 text-black border-white' : 'bg-neutral-900 text-neutral-300 border-white/10'
            }`}
          >
            Champions
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs text-neutral-300 pr-1">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2">
                <h3 className="text-amber-400 font-black uppercase text-sm flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" /> Objective & Win Conditions
                </h3>
                <p className="leading-relaxed text-neutral-200">
                  Shrine Siege is an 8×8 tactical chess strategy battle. You command 4 chosen Champion Heroes and 4 supporting Pawns. Two win conditions decide the victor:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-amber-500/40">
                    <div className="font-bold text-amber-300 uppercase">1. Shrine Dominion</div>
                    <div className="text-[11px] text-neutral-300 mt-1">Hold both 2×2 Grand Shrines simultaneously for 8 continuous seconds to win by divine dominion.</div>
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-red-500/40">
                    <div className="font-bold text-red-300 uppercase">2. Total Elimination</div>
                    <div className="text-[11px] text-neutral-300 mt-1">Eliminate all 4 enemy Champion Heroes from the battlefield.</div>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2">
                <h3 className="text-amber-400 font-black uppercase text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 1-Tap Fast Battle System
                </h3>
                <p className="leading-relaxed text-neutral-200">
                  No complex queuing required! Simply tap your active champion, then tap any highlighted green move destination, red enemy target, or blue shrine square to execute your action instantly in 1 click.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'movement' && (
            <div className="space-y-3">
              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2">
                <h3 className="text-amber-400 font-black uppercase text-sm flex items-center gap-1.5">
                  <Swords className="w-4 h-4" /> Movement, Striking & HP
                </h3>
                <p className="leading-relaxed text-neutral-200">
                  Champions move like chess pieces (Rooks, Knights, Bishops or Kings depending on their class). When moving into an enemy square, your hero strikes to deal attack damage.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-neutral-300 text-[11px]">
                  <li><strong className="text-white">Health Bars:</strong> Unhurt heroes show no bar. Once hit, damaged heroes display a health bar underneath in Royal Purple for Player units and Radiant Orange for enemy units.</li>
                  <li><strong className="text-white">Elimination:</strong> When HP drops to 0, the champion is slain and removed from the board.</li>
                </ul>
              </div>

              {/* Interactive Mini Board Demo */}
              <div className="bg-neutral-900 border border-white/15 p-3 rounded-xl flex flex-col items-center gap-2">
                <div className="text-[11px] font-bold text-amber-300 uppercase">Miniature Grid Demonstration (Tap squares)</div>
                <div className="grid grid-cols-4 gap-1 p-2 bg-black/80 rounded-lg border border-slate-700">
                  {Array.from({ length: 4 }).map((_, y) =>
                    Array.from({ length: 4 }).map((_, x) => {
                      const isSelected = demoPos.x === x && demoPos.y === y;
                      const isAdjacent = Math.abs(demoPos.x - x) + Math.abs(demoPos.y - y) === 1;
                      return (
                        <div
                          key={`${x}-${y}`}
                          onClick={() => setDemoPos({ x, y })}
                          className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer border transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-black border-white font-bold'
                              : isAdjacent
                              ? 'bg-emerald-600/30 border-emerald-400 animate-pulse'
                              : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? 'Hero' : isAdjacent ? 'Move' : ''}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 text-center">Tap any adjacent square to move your champion.</div>
              </div>
            </div>
          )}

          {activeTab === 'shrines' && (
            <div className="space-y-3">
              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2">
                <h3 className="text-amber-400 font-black uppercase text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Grand Shrines & Ability Awakening
                </h3>
                <p className="leading-relaxed text-neutral-200">
                  Two 2×2 Pagoda Shrines sit in the center of the board. Reaching a shrine unlocks powerful tactical advantages:
                </p>
                <div className="space-y-2 mt-2">
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-purple-500/40">
                    <div className="font-bold text-purple-300 uppercase">1. Skill Awakening Modal</div>
                    <div className="text-[11px] text-neutral-300 mt-0.5">When your champion steps on a shrine, a divine blessing modal appears allowing you to choose 1 of 3 awakened abilities (Signature Active Skill, Celestial Aegis, or Divine Smite).</div>
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-sky-500/40">
                    <div className="font-bold text-sky-300 uppercase">2. Permanent Shrine Buff</div>
                    <div className="text-[11px] text-neutral-300 mt-0.5">Heroes standing on a shrine gain fortified defense (+20% permanent damage reduction).</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'heroes' && (
            <div className="space-y-2">
              <div className="text-[11px] text-neutral-400 mb-1">All 9 Available Champions & Their Roles:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_HEROES.map((h) => (
                  <div key={h.id} className="bg-black/50 p-2.5 rounded-xl border border-white/10 flex items-center gap-2.5">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 drop-shadow-md">
                      <HeroPiece type={heroIdToPieceType(h.id)} color="white" className="w-full h-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black uppercase text-white truncate">{h.name}</div>
                      <div className="text-[9px] text-amber-300 font-mono capitalize">{h.role} • {h.active.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded cursor-pointer shadow-lg"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
