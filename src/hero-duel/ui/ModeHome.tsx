import React, { useState } from 'react';
import { AiDifficulty } from '../types/heroDuelTypes';
import { HowToPlayModal } from './HowToPlayModal';
import {
  Swords,
  Bot,
  Users,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Shield,
  Crown,
} from 'lucide-react';

interface ModeHomeProps {
  onStartSiege: (difficulty: AiDifficulty) => void;
  onStartClassicAi: (difficulty: AiDifficulty) => void;
  onStartPassAndPlay: () => void;
  onOpenCardVault: () => void;
  onBack: () => void;
}

export const ModeHome: React.FC<ModeHomeProps> = ({
  onStartSiege,
  onStartClassicAi,
  onStartPassAndPlay,
  onOpenCardVault,
  onBack,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<AiDifficulty>('normal');
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [showClassicOptions, setShowClassicOptions] = useState(false);

  return (
    <div className="hd-root min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="px-4 py-3 border-b-2 border-white/20 bg-[#121218] sticky top-0 z-30 flex items-center justify-between">
        <button
          onClick={onBack}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white hover:bg-neutral-800 flex items-center gap-2 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <h1 className="text-sm sm:text-base font-black uppercase tracking-wider">
            Shrine Siege & Hero Duel Arena
          </h1>
        </div>

        <button
          onClick={() => setIsHowToPlayOpen(true)}
          className="hd-btn-brutal px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white border-2 border-black flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Codex</span>
        </button>
      </header>

      {/* Main Hub Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col items-center justify-center gap-6">
        {/* Hero Banner Card */}
        <div className="w-full bg-gradient-to-r from-red-950 via-[#181014] to-amber-950 border-4 border-amber-400 rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_#fbbf24] text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black border-2 border-black text-xs font-black uppercase mb-3 shadow-[2px_2px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shrine Siege • Real-Time Auto-Battle • 9×13 Grid • Shrines & Dominion</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2 drop-shadow">
            Shrine Siege
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 font-mono max-w-xl mx-auto leading-relaxed">
            Lead your 4 champions into real-time tactical war. Capture shrines, defend towers, and destroy the enemy Throne or achieve 100 Dominion!
          </p>
        </div>

        {/* Primary Shrine Siege Card */}
        <div className="w-full bg-[#14141c] border-3 border-amber-400 p-6 rounded-2xl shadow-[6px_6px_0px_#fbbf24] flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-400 text-black border-2 border-black rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase text-white">Shrine Siege (Real-Time Battle)</h3>
                <p className="text-xs text-neutral-400 font-mono">Default mode: 9×13 battlefield with shrines and towers</p>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5 bg-black p-1.5 border border-white/20 rounded-lg">
              {(['easy', 'normal', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStartSiege(selectedDifficulty)}
            className="hd-btn-brutal w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000]"
          >
            <Swords className="w-5 h-5" />
            <span>Play Shrine Siege ({selectedDifficulty.toUpperCase()})</span>
          </button>
        </div>

        {/* Secondary Actions: Card Vault & Legacy Classic Duel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <button
            onClick={onOpenCardVault}
            className="p-4 bg-[#14141c] hover:bg-[#1a1a24] border-2 border-white/20 rounded-xl flex items-center justify-center gap-3 text-amber-400 font-black text-xs uppercase cursor-pointer shadow-md transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>View Card Vault</span>
          </button>

          <button
            onClick={() => setShowClassicOptions(!showClassicOptions)}
            className="p-4 bg-[#14141c] hover:bg-[#1a1a24] border-2 border-white/20 rounded-xl flex items-center justify-center gap-3 text-neutral-300 hover:text-white font-black text-xs uppercase cursor-pointer shadow-md transition-all"
          >
            <Users className="w-5 h-5 text-blue-400" />
            <span>Classic Duel (Legacy 7×8 Chess)</span>
          </button>
        </div>

        {showClassicOptions && (
          <div className="w-full bg-[#121218] border-2 border-blue-500/50 p-4 rounded-xl flex flex-col gap-3 animate-in fade-in">
            <div className="text-xs font-black uppercase text-blue-400">Classic Turn-Based Modes (Legacy)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onStartClassicAi(selectedDifficulty)}
                className="py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/20 rounded text-xs font-black uppercase text-white cursor-pointer"
              >
                Classic AI Duel ({selectedDifficulty})
              </button>
              <button
                onClick={onStartPassAndPlay}
                className="py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/20 rounded text-xs font-black uppercase text-white cursor-pointer"
              >
                Classic Pass & Play (Local 2P)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Codex Modal */}
      {isHowToPlayOpen && <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />}
    </div>
  );
};
