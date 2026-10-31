import React, { useState } from 'react';
import { AiDifficulty } from '../types/heroDuelTypes';
import { HowToPlayModal } from './HowToPlayModal';
import { PieceThemeModal } from './PieceThemeModal';
import {
  Swords,
  Bot,
  Users,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Shield,
  Crown,
  Palette,
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
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="hd-btn-brutal px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border-2 border-amber-400 flex items-center gap-1.5 text-xs cursor-pointer"
            title="Customise Piece Theme (Vector vs Faceted Busts)"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Piece Themes</span>
          </button>

          <button
            onClick={() => setIsHowToPlayOpen(true)}
            className="hd-btn-brutal px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white border-2 border-black flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Codex</span>
          </button>
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col items-center justify-center gap-6">
        {/* Hero Banner Card with Opening Avatar */}
        <div
          className="w-full relative overflow-hidden bg-cover bg-center border-4 border-amber-400 rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_#fbbf24] text-center flex flex-col items-center justify-center gap-4"
          style={{ backgroundImage: "url('/assets/aistudio/image_9466e3bd.png')" }}
        >
          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/50 z-0 pointer-events-none" />

          {/* Opening Screen Avatar Badge */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-3 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)]">
              <img
                src="/assets/aistudio/image_9466e3bd.png"
                alt="Hero Duel Trophy Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="relative z-10 space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hero Duel Arena • Shrine Siege • Card Vault</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Hero Duel Arena
            </h2>
            <p className="text-xs sm:text-sm text-neutral-200 font-mono leading-relaxed drop-shadow">
              Lead your 4 champions into tactical battle. Capture shrines, activate equipment skills, and slay enemy heroes to collect procedural cards!
            </p>
          </div>
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

      {/* Piece Theme Customizer Modal */}
      <PieceThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </div>
  );
};
