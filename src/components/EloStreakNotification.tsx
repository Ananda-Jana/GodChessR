import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePredictor } from '../predictor/PredictorContext';
import { Check, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const EloStreakNotification: React.FC = () => {
  const { activeEloNotification, dismissEloNotification } = usePredictor();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeEloNotification) {
      setIsVisible(true);

      // Trigger subtle haptic vibration (40ms) on iOS/Android if supported
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(40);
        } catch {
          // Ignore if vibration is restricted by browser policy
        }
      }

      // Fast auto-dismiss after 2 seconds (2000ms) for sleek non-intrusive gameplay notification
      const autoDismissTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          dismissEloNotification();
        }, 200);
      }, 2000);

      // Dismiss immediately when user clicks/taps anywhere on the screen
      const handleGlobalClick = () => {
        setIsVisible(false);
        setTimeout(() => {
          dismissEloNotification();
        }, 200);
      };

      const timer = setTimeout(() => {
        window.addEventListener('click', handleGlobalClick, { once: true, capture: true });
        window.addEventListener('touchstart', handleGlobalClick, { once: true, capture: true });
      }, 150);

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
    winStreak = 0,
    recentResults = [],
  } = activeEloNotification;

  const isWin = delta > 0 || outcome === 'win';
  const isLoss = delta < 0 || outcome === 'loss';
  const absDelta = Math.abs(delta);

  // Calculate ELO progress within 0 to 3000 rating scale
  const progressPercent = Math.min(100, Math.max(5, Math.round((newRating / 3000) * 100)));

  // Display recent 7 match activity dots without any day strings
  const paddedResults = [...recentResults];
  while (paddedResults.length < 7) {
    paddedResults.push('none' as any);
  }
  const displayResults = paddedResults.slice(0, 7);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={activeEloNotification.id}
          initial={{ y: -100, opacity: 0, scale: 0.94, x: '-50%' }}
          animate={{ y: 0, opacity: 1, scale: 1, x: '-50%' }}
          exit={{ y: -120, opacity: 0, scale: 0.92, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="fixed top-3 left-1/2 z-[9999] pointer-events-auto cursor-pointer select-none w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => dismissEloNotification(), 150);
          }}
        >
          {/* iOS Style Notification Glass Container */}
          <div className="relative overflow-hidden rounded-[26px] bg-black/85 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(255,255,255,0.1)] p-3.5 text-white">
            {/* Top Shine Accent */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            <div className="flex items-center gap-3">
              {/* Flame Badge */}
              <div
                className={`relative flex items-center justify-center rounded-2xl p-2 shrink-0 border ${
                  isWin
                    ? 'bg-gradient-to-b from-pink-500/30 to-rose-600/30 border-rose-500/40 shadow-[0_0_15px_rgba(255,42,109,0.3)]'
                    : isLoss
                    ? 'bg-slate-800/80 border-slate-700'
                    : 'bg-amber-500/20 border-amber-500/30'
                }`}
              >
                <div
                  className={`${
                    isWin
                      ? 'drop-shadow-[0_0_10px_rgba(255,42,109,0.9)]'
                      : isLoss
                      ? 'drop-shadow-[0_0_4px_rgba(148,163,184,0.4)]'
                      : 'drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                  }`}
                >
                  <svg width="32" height="34" viewBox="0 0 64 68" fill="none">
                    <defs>
                      <linearGradient id="flameGradWin" x1="32" y1="4" x2="32" y2="64" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ff5e83" />
                        <stop offset="100%" stopColor="#fa26a0" />
                      </linearGradient>
                      <linearGradient id="flameGradLoss" x1="32" y1="4" x2="32" y2="64" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 32 4 C 32 4, 56 24, 56 42 C 56 55 45 64 32 64 C 19 64 8 55 8 42 C 8 24, 32 4, 32 4 Z"
                      fill={isLoss ? 'url(#flameGradLoss)' : 'url(#flameGradWin)'}
                    />
                    <path
                      d="M 32 30 C 32 30, 43 42, 38 51 C 35 56 29 56 26 51 C 21 42, 32 30, 32 30 Z"
                      fill="#ffffff"
                    />
                  </svg>
                </div>
              </div>

              {/* Rating Information & Progress Bar */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                      {newRating}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 font-mono">
                      ELO
                    </span>
                  </div>

                  {/* Rating Delta Pill */}
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black shrink-0 ${
                      isWin
                        ? 'bg-[#ff2a6d]/20 text-[#ff5e83] border border-[#ff2a6d]/40'
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

                {/* ELO Rating Progress Bar */}
                <div className="mt-2 relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    initial={{ width: `${Math.max(5, Math.round((oldRating / 3000) * 100))}%` }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  />
                </div>

                {/* Match Dots (No day strings) */}
                <div className="mt-2 flex items-center gap-1">
                  {displayResults.map((res, idx) => {
                    const isResultWin = res === 'win';
                    const isResultLoss = res === 'loss';
                    const isResultDraw = res === 'draw';

                    return (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                          isResultWin
                            ? 'bg-[#ff2a6d] text-white shadow-[0_0_6px_rgba(255,42,109,0.5)]'
                            : isResultLoss
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                            : isResultDraw
                            ? 'bg-amber-500/40 text-amber-200 border border-amber-500/50'
                            : 'bg-white/10 border border-white/10 text-transparent'
                        }`}
                      >
                        {isResultWin ? (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        ) : isResultLoss ? (
                          <X className="w-2.5 h-2.5 stroke-[2.5]" />
                        ) : isResultDraw ? (
                          <Minus className="w-2 h-2 stroke-[3]" />
                        ) : null}
                      </div>
                    );
                  })}
                  <span className="ml-auto text-[10px] font-medium text-slate-400">
                    {winStreak > 0 ? `${winStreak} W Streak` : 'Match result'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
