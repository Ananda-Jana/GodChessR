import React, { useEffect, useRef } from 'react';
import {
  X,
  Swords,
  Flame,
  Users,
  Lock,
  Sparkles,
  ShieldCheck,
  Zap,
  Box,
} from 'lucide-react';
import { CyberSkull } from './CyberSkull';
import { RoseParadiseEntryButton } from '../rose/RoseParadiseEntryButton';

export interface AllGameModesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHashiraTraining?: () => void;
  onOpenPunisher?: () => void;
  onOpenBotModal?: () => void;
  onOpenClassicBotModal?: () => void;
  onOpenCraftedBotModal?: () => void;
  onOpenSecretArena?: () => void;
  onOpenCulling?: () => void;
  onOpenRose?: () => void;
  onOpenCraftTheory?: () => void;
  onOpen3dChess?: () => void;
  onJumpToMultiplayer?: () => void;
}

export const AllGameModesModal: React.FC<AllGameModesModalProps> = ({
  isOpen,
  onClose,
  onOpenHashiraTraining,
  onOpenPunisher,
  onOpenBotModal,
  onOpenClassicBotModal,
  onOpenCraftedBotModal,
  onOpenSecretArena,
  onOpenCulling,
  onOpenRose,
  onOpen3dChess,
  onJumpToMultiplayer,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (action?: () => void) => {
    onClose();
    if (action) {
      setTimeout(action, 80);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 supports-[backdrop-filter]:backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="All Chess Game Modes"
    >
      {/* CSS Animations for Punisher & Fire Cards */}
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes plasmaFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes borderOrbit {
          from { --angle: 0deg; }
          to { --angle: 360deg; }
        }

        @keyframes gridDrift {
          from { background-position: 0 0; }
          to { background-position: 100px 100px; }
        }

        @keyframes scanSweep {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          40% { opacity: 1; }
          50% { transform: translateY(500%); opacity: 0; }
          100% { transform: translateY(500%); opacity: 0; }
        }

        @keyframes coreBeat {
          0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.3; }
          50% { transform: scale(1.4) translate(-50%, -50%); opacity: 0.6; }
        }

        @keyframes sparkTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes neonBreathe {
          0%, 100% { box-shadow: 6px 6px 0px #000000, 0 0 15px rgba(39,39,245,0.4); }
          50% { box-shadow: 6px 6px 0px #000000, 0 0 30px rgba(39,39,245,0.8); }
        }

        .modal-punisher-card {
          animation: neonBreathe 3s infinite ease-in-out;
          background: #0a0a3d;
          will-change: box-shadow;
        }

        .modal-punisher-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          padding: 3px;
          background: conic-gradient(from var(--angle), transparent, #818cf8, #ffffff, #818cf8, transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: borderOrbit 4s linear infinite;
          pointer-events: none;
          z-index: 5;
        }

        .modal-plasma-layer {
          background: radial-gradient(circle at 20% 30%, #2727F5, transparent 70%),
                      radial-gradient(circle at 80% 70%, #6d28d9, transparent 70%),
                      linear-gradient(135deg, #14146e 0%, #4c1d95 100%);
          background-size: 300% 300%;
          animation: plasmaFlow 10s ease-in-out infinite;
          will-change: background-position;
        }

        .modal-hologrid-layer {
          background-image: repeating-linear-gradient(rgba(129,140,248,0.15) 0 1px, transparent 1px 20px),
                            repeating-linear-gradient(90deg, rgba(129,140,248,0.15) 0 1px, transparent 1px 20px);
          animation: gridDrift 20s linear infinite;
          mask-image: radial-gradient(circle, black 40%, transparent 100%);
          will-change: background-position;
        }

        .modal-scanline-layer {
          background: linear-gradient(to bottom, transparent, rgba(199,210,254,0.25), transparent);
          height: 40px;
          animation: scanSweep 6s ease-in-out infinite;
          will-change: transform;
        }

        .modal-core-glow {
          background: radial-gradient(circle, #2727F5 0%, #6d28d9 50%, transparent 100%);
          filter: blur(40px);
          animation: coreBeat 3s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .modal-punisher-cont {
          box-shadow: 4px 4px 0px #000000, 0 0 16px rgba(220, 38, 38, 0.45);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .modal-punisher-cont:hover {
          transform: scale(1.04);
          box-shadow: 5px 5px 0px #000000, 0 0 28px rgba(220, 38, 38, 0.85);
        }

        @keyframes fireFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes flameRise {
          0% { transform: translateY(20%) scaleY(0.95) scaleX(0.98); opacity: 0.6; }
          25% { transform: translateY(-12%) scaleY(1.15) scaleX(1.05) translateX(-6px); opacity: 0.9; }
          50% { transform: translateY(8%) scaleY(0.9) scaleX(0.95) translateX(5px); opacity: 0.65; }
          75% { transform: translateY(-16%) scaleY(1.2) scaleX(0.92) translateX(-3px); opacity: 0.95; }
          100% { transform: translateY(20%) scaleY(0.95) scaleX(0.98); opacity: 0.6; }
        }

        @keyframes heatPulse {
          0%, 100% { box-shadow: 6px 6px 0px #000000, 0 0 16px rgba(249,115,22,0.5); }
          50% { box-shadow: 6px 6px 0px #000000, 0 0 32px rgba(253,224,71,0.85), inset 0 0 24px rgba(234,88,12,0.4); }
        }

        @keyframes edgeFlicker {
          0%, 100% { opacity: 0.4; }
          12% { opacity: 0.9; }
          27% { opacity: 0.35; }
          41% { opacity: 0.95; }
          63% { opacity: 0.5; }
          80% { opacity: 0.85; }
        }

        .modal-bot-fire-card {
          animation: heatPulse 2.5s infinite ease-in-out;
          will-change: box-shadow;
        }

        .modal-bot-fire-bg {
          background: linear-gradient(115deg, #dc2626 0%, #ea580c 25%, #f97316 50%, #f59e0b 75%, #fde047 100%);
          background-size: 300% 300%;
          animation: fireFlow 6.5s ease-in-out infinite;
          will-change: background-position;
        }

        .modal-bot-fire-edge {
          box-shadow: inset 0 3px 12px rgba(255, 255, 255, 0.6), inset 0 -3px 12px rgba(220, 38, 38, 0.8);
          animation: edgeFlicker 1.8s infinite linear;
          will-change: opacity;
        }

        .modal-flame-blob-1 {
          background: radial-gradient(circle, rgba(253,224,71,0.85) 0%, rgba(249,115,22,0.6) 50%, transparent 80%);
          filter: blur(14px);
          mix-blend-mode: overlay;
          animation: flameRise 3.2s infinite ease-in-out;
          will-change: transform, opacity;
        }

        .modal-flame-blob-2 {
          background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,146,60,0.7) 45%, transparent 75%);
          filter: blur(16px);
          mix-blend-mode: screen;
          animation: flameRise 4.5s infinite ease-in-out 0.6s;
          will-change: transform, opacity;
        }

        .modal-flame-blob-3 {
          background: radial-gradient(circle, rgba(253,224,71,0.8) 0%, rgba(234,88,12,0.65) 55%, transparent 80%);
          filter: blur(14px);
          mix-blend-mode: overlay;
          animation: flameRise 5.2s infinite ease-in-out 1.2s;
          will-change: transform, opacity;
        }

        .modal-scroll-area {
          scroll-behavior: smooth;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        @media (prefers-reduced-motion: reduce) {
          .modal-punisher-card, .modal-bot-fire-card, .modal-plasma-layer, .modal-hologrid-layer, .modal-scanline-layer, .modal-core-glow, .modal-bot-fire-bg {
            animation: none !important;
          }
          .modal-scroll-area {
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="bg-zinc-950/95 supports-[backdrop-filter]:bg-zinc-950/90 supports-[backdrop-filter]:backdrop-blur-xl border-3 border-black dark:border-white rounded-2xl p-4 sm:p-6 shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  All Game Modes
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-amber-300 font-mono font-bold">
                  Dashboard Selection
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Choose your battlefield across classical chess, anime dojos, and tactical variants.
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close game modes modal"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-neutral-300 hover:text-white border border-white/20 cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Modes Grid - Fixed layout with smooth scrolling */}
        <div className="modal-scroll-area flex-1 overflow-y-auto py-4 pr-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-start custom-scrollbar touch-pan-y">
          
          {/* COLUMN 1 */}
          <div className="flex flex-col gap-4">
            {/* 1. CHESS HASHIRA TRAINING */}
            <div className="bg-gradient-to-r from-yellow-950 via-neutral-900 to-black text-white border-4 border-amber-400 p-4 sm:p-5 shadow-[6px_6px_0px_#eab308] flex flex-col justify-between gap-4 relative overflow-hidden min-w-0 shrink-0">
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                  <Flame className="w-7 h-7 text-black fill-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black uppercase text-amber-400 tracking-wide">
                      Chess Hashira Training · 鬼殺チェス柱稽古
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-black font-black uppercase">
                      6 Martial Tiers
                    </span>
                  </div>
                  <p className="text-xs font-bold text-neutral-300 mt-0.5">
                    Train under Thukuna : The Plasma Hashira across Opening, Tactical & Culling Dojos. Practice sparring, earn authentic badges, and ascend to the Hashira Pillar!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                <button
                  onClick={() => handleSelect(onOpenHashiraTraining)}
                  className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Swords className="w-4 h-4" />
                  Enter Hashira Dojo
                </button>
              </div>
            </div>

            {/* 2. PUNISHER ROBOT SELECTOR */}
            <div className="modal-punisher-card relative border-4 border-[#2727F5] p-4 sm:p-5 shadow-[6px_6px_0px_#000000] flex flex-col justify-between gap-4 overflow-hidden min-w-0 shrink-0">
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                <div className="absolute inset-0 modal-plasma-layer" />
                <div className="absolute inset-0 modal-hologrid-layer" />
                <div className="absolute top-0 left-0 right-0 modal-scanline-layer" />
                <div className="absolute top-1/2 left-1/4 w-64 h-64 modal-core-glow -translate-x-1/2 -translate-y-1/2" />
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-0"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animation: `sparkTwinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 5}s`,
                      boxShadow: '0 0 8px #c7d2fe',
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3.5 sm:gap-4.5 relative z-10">
                <div
                  className="modal-punisher-cont w-20 h-20 sm:w-24 sm:h-24 bg-black border-3 border-red-600 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#000000] overflow-hidden relative group cursor-pointer"
                  onClick={() => handleSelect(onOpenPunisher)}
                  title="Enter Punisher Robot Selector"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.35)_0%,_transparent_75%)] pointer-events-none"
                  />
                  <img
                    src="/assets/aistudio/image_6c6f27fb.png"
                    alt="Punisher Robot Demon Mask"
                    className="w-full h-full object-contain filter contrast-125 brightness-110 p-1.5 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(220,38,38,0.55)]"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
                      Punisher Robot Selector
                    </h3>
                    <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-black text-amber-400 border border-amber-400/40 shadow-[1px_1px_0px_#000]">
                      RUTHLESS AI
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#c7d2fe] mt-0.5 max-w-md">
                    Face 7 legendary mechanical opponents. From the clumsy Joystick Wraith to the calculating Chrome Reaper. No dice, no mercy.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                <button
                  onClick={() => handleSelect(onOpenPunisher)}
                  className="relative z-10 py-3 px-5 bg-[#2727F5] hover:bg-[#4a4aff] text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Enter Selector
                </button>
              </div>
            </div>

            {/* 3. PLAY VS GRANDMASTER BOT */}
            <div className="modal-bot-fire-card text-black border-4 border-black p-4 sm:p-5 shadow-[6px_6px_0px_#000000] flex flex-col justify-between gap-4 relative overflow-hidden transition-all duration-200 min-w-0 shrink-0">
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                <div className="absolute inset-0 modal-bot-fire-bg" />
                <div className="absolute inset-0 modal-bot-fire-edge" />
                <div className="absolute -bottom-8 left-[10%] w-48 h-36 rounded-full modal-flame-blob-1" />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full modal-flame-blob-2" />
                <div className="absolute -bottom-8 right-[10%] w-52 h-36 rounded-full modal-flame-blob-3" />
              </div>

              <div className="flex items-center gap-3.5 relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-amber-400 shrink-0 shadow-[2px_2px_0px_#000]">
                  <CyberSkull size={28} className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black uppercase text-black">Play vs Grandmaster Bot</h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-black text-amber-400 font-black uppercase shadow-sm">
                      Instant
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10 lg:mt-auto">
                <button
                  type="button"
                  onClick={() => handleSelect(onOpenClassicBotModal || onOpenBotModal)}
                  className="py-2 px-3.5 bg-neutral-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center cursor-pointer transition-transform duration-75 active:scale-95"
                  title="Play Traditional Chess (No Prince)"
                >
                  <span className="leading-tight">Play Normal Chess</span>
                  <span className="text-[9px] font-bold text-amber-300 lowercase tracking-normal leading-tight">
                    without prince
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect(onOpenBotModal)}
                  className="py-3 px-5 bg-black hover:bg-neutral-900 text-amber-400 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer transition-transform duration-75 active:scale-95"
                >
                  <Swords className="w-4 h-4" />
                  Play vs Bot
                </button>
              </div>
            </div>

            {/* 4. PLAY VS GM BOT WITH CRAFTED PIECES */}
            <div className="bg-[#0f172a] text-white border-4 border-black dark:border-white p-4 sm:p-5 shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col justify-between gap-4 min-w-0 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                  <Sparkles className="w-7 h-7 text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black uppercase text-amber-400">
                      Play vs Grandmaster Bot with Crafted Pieces
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-black font-black uppercase">
                      New Mode
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-300 mt-0.5">
                    Custom crafted army: Bishops replaced with Communists, Knights with Priests, and a Rook with Supreme Rook. Same tactical dice rules!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                <button
                  onClick={() => handleSelect(onOpenCraftedBotModal || onOpenBotModal)}
                  className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  Play vs Bot (Crafted)
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col gap-4">
            {/* 5. SECRET PLAYERS ARENA (SQUARE CARD) */}
            <div
              className="relative overflow-hidden bg-cover bg-center border-4 border-neutral-300 p-4 sm:p-5 shadow-[6px_6px_0px_#ffffff] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col justify-between gap-4 active:scale-98 transition-all min-w-0 aspect-square shrink-0"
              style={{ backgroundImage: "url('/assets/aistudio/image_ba67a0d0.png')" }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.85)_95%)] z-0 pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10 bg-black/75 p-3 border border-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-black border-2 border-white flex items-center justify-center text-amber-400 shrink-0 shadow-[2px_2px_0px_#000] relative">
                  <Lock className="w-6 h-6 text-amber-400" />
                  <Sparkles className="w-3.5 h-3.5 text-white absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black uppercase text-white drop-shadow-md">
                      Play Against Secret Players
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 bg-black text-amber-400 font-black uppercase border border-amber-400 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      SECURED ACCESS
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">
                    Challenge passcode-protected custom bots (Boyfriend Bot, Girlfriend Bot & War Bot) with sweet Bengali dialogue & tactical personalities!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                <button
                  onClick={() => handleSelect(onOpenSecretArena)}
                  className="py-3 px-5 bg-white hover:bg-neutral-100 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer relative z-10"
                >
                  <Lock className="w-4 h-4 text-black" />
                  SECRET ARENA
                </button>
              </div>
            </div>

            {/* 6. CULLING GAME MODE (SQUARE CARD) */}
            <div
              className="relative overflow-hidden bg-cover bg-center border-4 border-red-600 p-4 sm:p-5 shadow-[6px_6px_0px_#8b0000] flex flex-col justify-between gap-4 active:scale-98 transition-all min-w-0 aspect-square shrink-0"
              style={{ backgroundImage: "url('/assets/aistudio/image_9087d774.png')" }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_95%)] z-0 pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10 bg-black/80 p-3 border border-red-500/40 backdrop-blur-sm rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-red-600 border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#000]">
                  <Swords className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black uppercase text-red-400 drop-shadow">
                      Play Culling Game Mode (Jujutsu Kaisen)
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-600 text-white font-black uppercase shadow-sm">
                      88 Cross Squares
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                <button
                  onClick={() => handleSelect(onOpenCulling)}
                  className="py-3 px-5 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer relative z-10"
                >
                  <Swords className="w-4 h-4" />
                  ⚔️ CULLING MODE
                </button>
              </div>
            </div>

            {/* 7. 3D ANNIHILATIC CHESS ARCADE */}
            <div className="bg-gradient-to-br from-[#1b1429] via-neutral-900 to-black text-white border-4 border-purple-500 p-4 sm:p-5 shadow-[6px_6px_0px_#9333ea] flex flex-col justify-between gap-4 min-w-0 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-purple-600 border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#000]">
                  <Box className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black uppercase text-purple-300">
                      3D Annihilatic Chess Arcade
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-600 text-white font-black uppercase">
                      New Mode · FIDE
                    </span>
                  </div>
                  <p className="text-xs font-bold text-purple-100/90 mt-0.5">
                    Standard FIDE chess with 3D cat pieces, deep Punisher AI calculation, and real-time multiplayer rooms.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                <button
                  type="button"
                  onClick={() => handleSelect(onOpen3dChess)}
                  className="py-3 px-5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Swords className="w-4 h-4 text-white" />
                  Enter 3D Arcade
                </button>
              </div>
            </div>

            {/* 8. ROSE PARADISE ENTRY */}
            <div className="min-w-0 shrink-0">
              <RoseParadiseEntryButton onClick={() => handleSelect(onOpenRose)} />
            </div>

            {/* 8. ONLINE MULTIPLAYER (PVP MATCHES) */}
            <div className="bg-gradient-to-br from-teal-950 via-neutral-900 to-black text-white border-4 border-teal-400 p-4 sm:p-5 shadow-[6px_6px_0px_#14b8a6] flex flex-col justify-between gap-4 min-w-0 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-teal-400 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                  <Users className="w-7 h-7 text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black uppercase text-teal-300">
                      Online Multiplayer
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-teal-400 text-black font-black uppercase">
                      PvP Matches
                    </span>
                  </div>
                  <p className="text-xs font-bold text-teal-100/90 mt-0.5">
                    Issue challenges to online players in real-time with custom timers, piece themes, and crafting options.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                <button
                  onClick={() => handleSelect(onJumpToMultiplayer)}
                  className="py-3 px-5 bg-teal-400 hover:bg-teal-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Users className="w-4 h-4 text-black" />
                  Find Players
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Quick Tip */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Ranked & unranked matches count toward your live predicted ELO.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-white transition-colors cursor-pointer uppercase font-bold text-[10px]"
          >
            Press Esc to dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
