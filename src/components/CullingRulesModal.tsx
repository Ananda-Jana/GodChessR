import React, { useState } from 'react';
import { CULLING_ROSTER } from '../types/cullingGame';
import { CullingPiece } from './CullingPiece';
import { X, BookOpen, Shield, Zap, Sparkles, AlertTriangle } from 'lucide-react';

interface CullingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CullingRulesModal: React.FC<CullingRulesModalProps> = ({ isOpen, onClose }) => {
  const [filterTeam, setFilterTeam] = useState<'all' | 'white' | 'black'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const rosterList = Object.values(CULLING_ROSTER).filter((char) => {
    if (filterTeam !== 'all' && char.team !== filterTeam) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        char.name.toLowerCase().includes(q) ||
        char.role.toLowerCase().includes(q) ||
        char.mobilityDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-none">
      <div className="bg-white dark:bg-[#0a0a0c] text-black dark:text-white border-4 border-black dark:border-white shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b-3 border-black dark:border-white flex items-center justify-between bg-neutral-100 dark:bg-[#141416] shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight">
                Culling Game — Rules & Technique Codex
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Overview Banner */}
        <div className="bg-neutral-50 dark:bg-[#0f172a] px-4 py-2.5 border-b-2 border-black dark:border-white text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Cross-Board:</strong> 88 playable squares. Pawns defend in front on ranks 2 & 7. 4 void outside corners.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
            <Shield className="w-4 h-4 shrink-0" />
            <span>
              <strong>Turn 1-5 Immunity:</strong> Satoru Gojo & Ryomen Sukuna cannot be captured during turns 1–5.
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-3 bg-neutral-100 dark:bg-[#141416] border-b-2 border-black dark:border-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterTeam('all')}
              className={`px-3 py-1 text-xs font-black uppercase border-2 border-black cursor-pointer ${
                filterTeam === 'all'
                  ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white dark:bg-black text-neutral-600 dark:text-neutral-300'
              }`}
            >
              All ({Object.keys(CULLING_ROSTER).length})
            </button>
            <button
              onClick={() => setFilterTeam('white')}
              className={`px-3 py-1 text-xs font-black uppercase border-2 border-black cursor-pointer ${
                filterTeam === 'white'
                  ? 'bg-white text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-neutral-200 dark:bg-slate-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              White
            </button>
            <button
              onClick={() => setFilterTeam('black')}
              className={`px-3 py-1 text-xs font-black uppercase border-2 border-black cursor-pointer ${
                filterTeam === 'black'
                  ? 'bg-black text-white shadow-[2px_2px_0px_#000] dark:border-white'
                  : 'bg-neutral-200 dark:bg-slate-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Black
            </button>
          </div>

          <input
            type="text"
            placeholder="Search character or technique..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white placeholder-neutral-400 font-bold focus:outline-none w-full sm:w-64"
          />
        </div>

        {/* Character Cards List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rosterList.map((char) => (
              <div
                key={char.type}
                className="p-4 border-2 border-black dark:border-white bg-neutral-50 dark:bg-[#0f172a] shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]"
              >
                {/* Character Header */}
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 bg-white dark:bg-neutral-900 border-2 border-black dark:border-white p-1 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
                    <CullingPiece type={char.type} color={char.team} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black uppercase">{char.name}</h3>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 border border-black ${
                          char.team === 'white'
                            ? 'bg-white text-black'
                            : 'bg-black text-white dark:border-white'
                        }`}
                      >
                        {char.team}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{char.role}</p>
                  </div>
                </div>

                {/* Movement Vector Description */}
                <div className="bg-white dark:bg-black p-2.5 border-2 border-black dark:border-white mb-2 font-mono text-xs">
                  <span className="font-bold text-neutral-500 uppercase block text-[10px]">Movement:</span>
                  <span className="font-semibold">{char.mobilityDescription}</span>
                </div>

                {/* Passive Ability */}
                {char.passiveAbility && (
                  <div className="p-2 bg-neutral-100 dark:bg-[#1e293b] border border-black dark:border-white text-xs mb-1.5 flex items-start gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="uppercase text-[10px] text-sky-600 dark:text-sky-400 block font-black">
                        Passive Technique
                      </strong>
                      <span>{char.passiveAbility}</span>
                    </div>
                  </div>
                )}

                {/* Active Ability */}
                {char.activeAbility && (
                  <div className="p-2 bg-neutral-100 dark:bg-[#1e293b] border border-black dark:border-white text-xs mb-1.5 flex items-start gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="uppercase text-[10px] text-amber-600 dark:text-amber-400 block font-black">
                        Active Technique
                      </strong>
                      <span>{char.activeAbility}</span>
                    </div>
                  </div>
                )}

                {/* Status Condition */}
                {char.statusEffect && (
                  <div className="p-2 bg-neutral-100 dark:bg-[#1e293b] border border-black dark:border-white text-xs flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="uppercase text-[10px] text-purple-600 dark:text-purple-400 block font-black">
                        Status / Cooldown
                      </strong>
                      <span>{char.statusEffect}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-100 dark:bg-[#141416] border-t-3 border-black dark:border-white flex items-center justify-between text-xs font-bold shrink-0">
          <span>Opening rulebook pauses timer for exactly 8 seconds.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black font-black uppercase border-2 border-black dark:border-white cursor-pointer"
          >
            Close Rulebook
          </button>
        </div>
      </div>
    </div>
  );
};
