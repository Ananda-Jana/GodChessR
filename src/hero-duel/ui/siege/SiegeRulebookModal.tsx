import React, { useState } from 'react';
import { BookOpen, X, Swords, Zap, Trophy } from 'lucide-react';
import { HeroPiece, heroIdToPieceType } from '../../art/heroAvatarHelper';
import { ALL_HEROES } from '../../heroes/heroRegistry';
import { HERO_DUEL_CORE_RULES, HERO_DUEL_ABILITY_SUMMARIES } from '../../config/siegeRulesCodex';
import { AbilityTile } from '../AbilityTiles';

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
              {/* Core Codex Rules */}
              <div className="bg-black/50 p-3.5 rounded-xl border border-white/10 space-y-2">
                <h3 className="text-amber-400 font-black uppercase text-sm flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" /> Hero Duel Codex Rules
                </h3>
                <ul className="space-y-1.5 text-neutral-200 text-[11px] list-disc list-inside leading-relaxed">
                  {HERO_DUEL_CORE_RULES.map((rule, idx) => (
                    <li key={idx} className="font-medium text-slate-100">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ability Summaries Grid */}
              <div className="bg-black/50 p-3.5 rounded-xl border border-purple-500/30 space-y-2">
                <h3 className="text-purple-400 font-black uppercase text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-400" /> Equipment Ability Summaries
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {HERO_DUEL_ABILITY_SUMMARIES.map((ab) => (
                    <div
                      key={ab.id}
                      className="p-2.5 bg-neutral-900/90 rounded-xl border border-purple-500/30 flex items-center gap-3"
                    >
                      <AbilityTile ability={ab.id} rarity={ab.rarity} state="ready" size={44} />
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-amber-300 uppercase text-[11px]">
                          {ab.name} <span className="text-[9px] text-purple-300">({ab.heroName})</span>
                        </div>
                        <div className="text-[10px] text-neutral-300 leading-tight truncate">{ab.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movement' && (
            <div className="space-y-3">
              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2">
                <h3 className="text-amber-400 font-black uppercase text-sm flex items-center gap-1.5">
                  <Swords className="w-4 h-4" /> Automatic Orthogonal Attacks (No Manual Targeting)
                </h3>
                <p className="leading-relaxed text-neutral-200">
                  You do not need to click an enemy to attack! Simply move your champions into direct orthogonal contact (horizontally or vertically adjacent, 1-square distance).
                </p>
                <ul className="list-disc pl-5 space-y-1 text-neutral-300 text-[11px]">
                  <li><strong className="text-emerald-400">Automatic Engagement:</strong> When directly connected horizontally or vertically next to an enemy, your hero automatically attacks every 1.0 second.</li>
                  <li><strong className="text-amber-300">No Diagonal Attacks:</strong> Diagonal contact cannot trigger attacks. Units must be directly touching horizontally or vertically.</li>
                  <li><strong className="text-sky-300">No Attack Across Gaps:</strong> Even a 1-square gap prevents attacking; direct contact is mandatory.</li>
                  <li><strong className="text-white">Elimination:</strong> When HP drops to 0, the piece is removed. Defeating enemies triggers mid-game skill upgrades!</li>
                </ul>
              </div>

              {/* Interactive Mini Board Demo */}
              <div className="bg-neutral-900 border border-white/15 p-3 rounded-xl flex flex-col items-center gap-2">
                <div className="text-[11px] font-bold text-amber-300 uppercase">Orthogonal Contact Demo (Tap squares)</div>
                <div className="grid grid-cols-4 gap-1 p-2 bg-black/80 rounded-lg border border-slate-700">
                  {Array.from({ length: 4 }).map((_, y) =>
                    Array.from({ length: 4 }).map((_, x) => {
                      const isSelected = demoPos.x === x && demoPos.y === y;
                      const isOrthogonal = Math.abs(demoPos.x - x) + Math.abs(demoPos.y - y) === 1;
                      const isDiagonal = Math.abs(demoPos.x - x) === 1 && Math.abs(demoPos.y - y) === 1;
                      return (
                        <div
                          key={`${x}-${y}`}
                          onClick={() => setDemoPos({ x, y })}
                          className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer border transition-all text-[9px] font-bold ${
                            isSelected
                              ? 'bg-amber-400 text-black border-white'
                              : isOrthogonal
                              ? 'bg-red-600/40 text-red-300 border-red-500 animate-pulse'
                              : isDiagonal
                              ? 'bg-slate-800/40 text-neutral-500 border-slate-700'
                              : 'bg-slate-800 text-neutral-400 border-slate-700'
                          }`}
                        >
                          {isSelected ? 'Hero' : isOrthogonal ? 'Auto Hit' : isDiagonal ? 'No Hit' : ''}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 text-center">Green/Red: Orthogonal contact auto-attacks. Diagonal cells cannot attack.</div>
              </div>
            </div>
          )}

          {activeTab === 'shrines' && (
            <div className="space-y-3">
              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2">
                <h3 className="text-amber-400 font-black uppercase text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> 60-Second Shrine Countdown & Victory Rules
                </h3>
                <p className="leading-relaxed text-neutral-200">
                  Two 2×2 Pagoda Shrines sit at the center of the battlefield. Capturing and holding them dictates victory:
                </p>
                <div className="space-y-2 mt-2">
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-purple-500/40">
                    <div className="font-bold text-purple-300 uppercase">1. Instant Equipment Auto-Unlock & 7s Repeatable Cooldown</div>
                    <div className="text-[11px] text-neutral-300 mt-0.5">Whichever champion reaches a shrine FIRST automatically unlocks their equipment ability. Abilities have a 7-second cooldown and can be cast repeatedly throughout battle!</div>
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-amber-500/40">
                    <div className="font-bold text-amber-300 uppercase">2. Top-Left Shrine 60s Countdown & Warning Ticks</div>
                    <div className="text-[11px] text-neutral-300 mt-0.5">When occupied, an unstoppable timer counts down from 60s on the top-left square of the shrine. When 10 seconds or fewer remain, the timer turns glowing RED and warning audio ticks play!</div>
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-emerald-500/40">
                    <div className="font-bold text-emerald-300 uppercase">3. Shrine Victory & Average HP Comparison</div>
                    <div className="text-[11px] text-neutral-300 mt-0.5 space-y-1">
                      <div>• If a team reaches 60s and the opponent has NO pieces on any shrine at that last second, the occupier wins immediately.</div>
                      <div>• If both teams occupy shrines (or contest the same shrine), the average HP of pieces of each team standing on the shrine is compared. For example, if the enemy has two pieces and you have one piece, the average HP of their two pieces is compared to your piece's HP. The team with higher average HP wins!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'heroes' && (
            <div className="space-y-2">
              <div className="text-[11px] text-neutral-400 mb-1">All 9 Available Champions & Their Equipment:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_HEROES.map((h) => (
                  <div key={h.id} className="bg-black/50 p-2.5 rounded-xl border border-white/10 flex items-center gap-2.5">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 drop-shadow-md">
                      <HeroPiece type={heroIdToPieceType(h.id)} color="white" className="w-full h-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black uppercase text-white truncate">{h.name}</div>
                      <div className="text-[9px] text-amber-300 font-mono capitalize">{h.role} • 35 HP</div>
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
