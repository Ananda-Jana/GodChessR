import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePredictor } from '../predictor/PredictorContext';
import { Check, X, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const EloStreakNotification: React.FC = () => {
  const { activeEloNotification, dismissEloNotification } = usePredictor();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeEloNotification) {
      setIsVisible(true);

      // Auto dismiss after 12 seconds
      const autoDismissTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          dismissEloNotification();
        }, 300);
      }, 12000);

      // Dismiss immediately when user clicks/taps anywhere on the screen
      const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
        setIsVisible(false);
        setTimeout(() => {
          dismissEloNotification();
        }, 300);
      };

      // Add listener on window for instant dismissal upon any user click
      const timer = setTimeout(() => {
        window.addEventListener('click', handleGlobalClick, { once: true, capture: true });
        window.addEventListener('touchstart', handleGlobalClick, { once: true, capture: true });
      }, 300);

      return () => {
        clearTimeout(autoDismissTimer);
        clearTimeout(timer);
        window.removeEventListener('click', handleGlobalClick, { capture: true });
        window.removeEventListener('touchstart', handleGlobalClick, { capture: true });
      };
    } else {
      setIsVisible(false);
    }
  }, [activeEloNotification, dismissEloNotification]);

  if (!activeEloNotification) return null;

  const {
    oldRating,
    newRating,
    delta,
    outcome,
    modeLabel,
    winStreak,
    recentResults = [],
  } = activeEloNotification;

  const isWin = delta > 0 || outcome === 'win';
  const isLoss = delta < 0 || outcome === 'loss';
  const absDelta = Math.abs(delta);

  // Calculate ELO progress within 0 to 3000 rating scale
  const progressPercent = Math.min(100, Math.max(5, Math.round((newRating / 3000) * 100)));

  // Display recent 7 match activity dots
  const paddedResults = [...recentResults];
  while (paddedResults.length < 7) {
    paddedResults.push('none' as any);
  }
  const displayResults = paddedResults.slice(0, 7);

  // Map day names or match labels
  const currentDayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, etc.
  const reorderedDays = Array.from({ length: 7 }, (_, i) => {
    const dayIdx = (currentDayIndex - 6 + i + 7) % 7;
    return DAY_LABELS[dayIdx === 0 ? 6 : dayIdx - 1]; // Convert 0 (Sun) to 6
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={activeEloNotification.id}
          initial={{ y: -120, opacity: 0, scale: 0.92, x: '-50%' }}
          animate={{ y: 0, opacity: 1, scale: 1, x: '-50%' }}
          exit={{ y: -140, opacity: 0, scale: 0.9, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="fixed top-4 left-1/2 z-[9999] pointer-events-auto cursor-pointer select-none w-[calc(100vw-2rem)] max-w-sm sm:max-w-md md:max-w-lg"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => dismissEloNotification(), 200);
          }}
        >
          {/* Main Glassmorphic Container matching attached UI spec */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0a0b0e]/95 backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(255,42,109,0.2)] p-3.5 sm:p-4 text-white">
            {/* Top Shine Specular Edge */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div className="flex items-stretch gap-3.5 sm:gap-4">
              {/* Left Side: Flame Box */}
              <div className="relative flex flex-col items-center justify-center bg-[#14151b] border border-white/10 rounded-2xl p-2.5 sm:p-3 w-28 sm:w-32 shrink-0 shadow-inner overflow-hidden group">
                {/* Glowing Flame Aura Backdrop */}
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isWin
                      ? 'bg-gradient-to-t from-[#ff2a6d]/40 via-[#ff2a6d]/15 to-transparent opacity-100'
                      : isLoss
                      ? 'bg-gradient-to-t from-slate-700/30 via-slate-800/10 to-transparent opacity-80'
                      : 'bg-gradient-to-t from-amber-500/20 to-transparent opacity-60'
                  }`}
                />

                {/* Animated Flame Icon */}
                <div className="relative z-10 my-1 flex items-center justify-center">
                  <div
                    className={`transition-all duration-500 ${
                      isWin
                        ? 'animate-flame-win drop-shadow-[0_0_20px_rgba(255,42,109,0.95)]'
                        : isLoss
                        ? 'animate-flame-loss drop-shadow-[0_0_8px_rgba(148,163,184,0.4)]'
                        : 'animate-flame-continuous drop-shadow-[0_0_12px_rgba(255,42,109,0.7)]'
                    }`}
                  >
                    {/* Flame Vector matching exact image layout */}
                    <svg
                      width="52"
                      height="56"
                      viewBox="0 0 64 68"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transform transition-transform duration-500"
                    >
                      <defs>
                        <linearGradient id="flameGradWin" x1="32" y1="4" x2="32" y2="64" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#ff5e83" />
                          <stop offset="50%" stopColor="#ff2a6d" />
                          <stop offset="100%" stopColor="#fa26a0" />
                        </linearGradient>
                        <linearGradient id="flameGradLoss" x1="32" y1="4" x2="32" y2="64" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#94a3b8" />
                          <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                      </defs>

                      {/* Outer Flame Silhouette */}
                      <path
                        d="M 32 4 C 32 4, 56 24, 56 42 C 56 55 45 64 32 64 C 19 64 8 55 8 42 C 8 24, 32 4, 32 4 Z"
                        fill={isLoss ? 'url(#flameGradLoss)' : 'url(#flameGradWin)'}
                      />

                      {/* Inner White Tear Notch */}
                      <path
                        d="M 32 30 C 32 30, 43 42, 38 51 C 35 56 29 56 26 51 C 21 42, 32 30, 32 30 Z"
                        fill="#ffffff"
                      />
                    </svg>
                  </div>
                </div>

                {/* Streak Count & Subtitle */}
                <div className="relative z-10 text-center mt-1">
                  <div className="text-base sm:text-lg font-black text-white leading-tight tracking-tight">
                    {winStreak > 0 ? `${winStreak} ${winStreak === 1 ? 'win' : 'wins'}` : `${recentResults.filter(r => r === 'win').length} wins`}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 leading-none mt-0.5">
                    {isWin ? 'Match streak' : 'ELO streak'}
                  </div>
                </div>
              </div>

              {/* Right Side: ELO Score, Progress Bar & Weekly/Match Dots */}
              <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                {/* Header: ELO Score & Delta Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1 min-w-0">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {newRating}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400 font-mono">
                      / 3000
                    </span>
                  </div>

                  {/* Rating Delta Pill */}
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                      isWin
                        ? 'bg-[#ff2a6d]/20 text-[#ff5e83] border border-[#ff2a6d]/40 shadow-[0_0_12px_rgba(255,42,109,0.3)] animate-pulse'
                        : isLoss
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isWin ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{absDelta}</span>
                      </>
                    ) : isLoss ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>-{absDelta}</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5" />
                        <span>0</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Middle: Progress Bar */}
                <div className="my-2.5">
                  <div className="relative w-full h-3 sm:h-3.5 bg-white/10 rounded-full border border-white/10 overflow-hidden p-0.5 shadow-inner">
                    <motion.div
                      initial={{ width: `${Math.max(5, Math.round((oldRating / 3000) * 100))}%` }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                    />
                  </div>
                </div>

                {/* Bottom Row: 7-Match Activity Checkmark Dots */}
                <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1">
                  {displayResults.map((res, idx) => {
                    const dayLabel = reorderedDays[idx] || `M${idx + 1}`;
                    const isResultWin = res === 'win';
                    const isResultLoss = res === 'loss';
                    const isResultDraw = res === 'draw';

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <div
                          className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            isResultWin
                              ? 'bg-[#ff2a6d] text-white shadow-[0_0_8px_rgba(255,42,109,0.6)]'
                              : isResultLoss
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                              : isResultDraw
                              ? 'bg-amber-500/40 text-amber-200 border border-amber-500/50'
                              : 'bg-white/5 border border-white/10 text-transparent'
                          }`}
                        >
                          {isResultWin ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : isResultLoss ? (
                            <X className="w-3 h-3 stroke-[2.5]" />
                          ) : isResultDraw ? (
                            <Minus className="w-2.5 h-2.5 stroke-[3]" />
                          ) : null}
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 truncate leading-none">
                          {dayLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tap to dismiss hint */}
            <div className="mt-2 text-center text-[10px] font-mono text-slate-400/80 tracking-wider uppercase">
              Tap anywhere on screen to dismiss
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
