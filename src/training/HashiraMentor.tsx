/**
 * HashiraMentor.tsx - Interactive 2D Traditional Sensei Avatar & Dialogue Panel
 *
 * Strict traditional sensei with dynamic expressions:
 * 'stern' | 'scowl' | 'approving' | 'analytical'
 * Rendered with pure inline SVG and high-contrast neobrutalist manga dialogue styling.
 */

import React, { useState } from 'react';
import type { MentorExpression } from './types';
import { Sparkles, HelpCircle, RotateCcw, ArrowRight, ShieldAlert, Award } from 'lucide-react';

interface HashiraMentorProps {
  expression: MentorExpression;
  message: string;
  hintText?: string;
  activeHint?: string | null;
  isCompleted?: boolean;
  onAskHint?: () => void;
  onReset?: () => void;
  onNext?: () => void;
  canNext?: boolean;
  rankTitle?: string;
  kanji?: string;
  layout?: 'vertical' | 'horizontal' | 'compact';
  className?: string;
}

export const HashiraMentor: React.FC<HashiraMentorProps> = ({
  expression,
  message,
  hintText,
  activeHint,
  isCompleted = false,
  onAskHint,
  onReset,
  onNext,
  canNext = false,
  rankTitle = 'Mizunoto',
  kanji = '癸',
  layout = 'vertical',
  className = '',
}) => {
  const [showHintModal, setShowHintModal] = useState(false);



  const getExpressionBadge = () => {
    switch (expression) {
      case 'scowl':
        return { text: 'REBUKE · 喝', bg: 'bg-red-600 text-white border-black' };
      case 'approving':
        return { text: 'PRAISE · 妙手', bg: 'bg-amber-400 text-black border-black' };
      case 'analytical':
        return { text: 'INSIGHT · 考', bg: 'bg-sky-400 text-black border-black' };
      case 'stern':
      default:
        return { text: 'DISCIPLINE · 訓', bg: 'bg-neutral-800 text-white border-white' };
    }
  };

  const badge = getExpressionBadge();

  // Compact Mobile Console: 1.7x expanded height banner (~116px).
  // Avatar on left (fixed small size), dynamic mood badge, and speech bubble on right.
  // When activeHint is active, a glowing blue rectangular popup covers the message until the next move.
  if (layout === 'compact') {
    return (
      <div className={`bg-[#0c0c0e] border-2 border-amber-400/90 shadow-[2px_2px_0px_#000000] p-2 flex items-center gap-2.5 w-full h-[116px] min-h-[116px] max-h-[120px] shrink-0 overflow-hidden ${className}`}>
        {/* Compact Avatar - Strictly fixed small size container */}
        <div className="relative shrink-0 flex items-center">
          <div className="w-11 h-11 bg-[#18181b] border-2 border-amber-400 shadow-[1px_1px_0px_#000] overflow-hidden flex items-center justify-center relative shrink-0">
            <img
              src="/assets/aistudio/image_77c93c63.png"
              alt="Thukuna : The Plasma Hashira"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0.5 left-0.5 bg-black/90 text-amber-400 border border-amber-400 font-black text-[8px] w-3.5 h-3.5 flex items-center justify-center leading-none">
              {kanji}
            </div>
          </div>
        </div>

        {/* Dialogue Bubble (Expanded height to fit full message cleanly) */}
        <div className="flex-1 min-w-0 h-full flex flex-col justify-between bg-neutral-900 border border-neutral-700 px-2.5 py-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
            <span className="font-black text-[10px] uppercase text-amber-400 truncate">
              THUKUNA : THE PLASMA HASHIRA · {rankTitle}
            </span>
            <span className={`text-[8px] font-black uppercase px-1 py-0 border shrink-0 ${badge.bg}`}>
              {badge.text}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 flex items-center">
            <p className="text-[11px] sm:text-xs font-bold text-neutral-100 leading-snug select-text font-sans">
              &ldquo;{message}&rdquo;
            </p>
          </div>

          {/* Temporary Blue Glowing Hint Overlay Popup */}
          {activeHint && (
            <div className="absolute inset-0 bg-sky-950/95 border-2 border-sky-400 p-2 flex flex-col justify-center z-20 shadow-[0_0_15px_rgba(56,189,248,0.6)] animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-1 mb-0.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="font-black text-[10px] uppercase text-sky-300 tracking-wider">
                    Sensei's Tactical Hint · 助言
                  </span>
                </div>
                <span className="text-[8px] font-bold text-sky-400 uppercase">Dismisses on move</span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 flex items-center">
                <p className="text-[11px] sm:text-xs font-bold text-sky-100 leading-snug">
                  {activeHint}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const containerClasses =
    layout === 'vertical'
      ? `bg-white dark:bg-[#0c0c0e] border-3 border-black dark:border-white shadow-[4px_4px_0px_#000000] p-3.5 flex flex-col items-center text-center gap-3 w-full ${className}`
      : `bg-white dark:bg-[#0c0c0e] border-4 border-black dark:border-white shadow-[6px_6px_0px_#000000] p-4 flex flex-col md:flex-row items-center md:items-start gap-4 w-full ${className}`;

  const avatarSize =
    layout === 'vertical'
      ? 'w-24 h-24'
      : 'w-28 h-28 sm:w-32 sm:h-32';

  return (
    <div className={containerClasses}>
      {/* Thukuna Avatar Box - Container size kept strictly fixed */}
      <div className="relative shrink-0">
        <div className={`${avatarSize} bg-[#18181b] border-2 sm:border-3 border-black dark:border-white shadow-[2px_2px_0px_#000000] overflow-hidden flex items-center justify-center relative`}>
          <img
            src="/assets/aistudio/image_77c93c63.png"
            alt="Thukuna : The Plasma Hashira"
            className="w-full h-full object-cover"
          />

          {/* Kanji Stamp Badge in Avatar Corner */}
          <div className="absolute top-1 left-1 bg-black/90 text-amber-400 border border-amber-400 font-black text-[10px] w-5 h-5 flex items-center justify-center shadow-[1px_1px_0px_#000]">
            {kanji}
          </div>
        </div>

        {/* Expression Mood Badge */}
        <div className={`mt-1.5 px-1.5 py-0.5 border text-[10px] font-black uppercase text-center tracking-wider shadow-[2px_2px_0px_#000] ${badge.bg}`}>
          {badge.text}
        </div>
      </div>

      {/* Sensei Dialogue & Guidance Panel */}
      <div className="flex-1 w-full flex flex-col justify-between">
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-1.5 mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm uppercase tracking-tight text-black dark:text-white">
                THUKUNA : THE PLASMA HASHIRA · 宿儺
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.2 bg-amber-400 text-black border border-black uppercase">
                {rankTitle}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Chess Hashira Instruction</span>
            </div>
          </div>

          {/* Dialogue Message */}
          <div className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans bg-neutral-100 dark:bg-[#18181b] p-3 border-2 border-black dark:border-neutral-700 min-h-[58px] relative overflow-hidden">
            &ldquo;{message}&rdquo;

            {/* Temporary Blue Glowing Hint Overlay Popup */}
            {activeHint && (
              <div className="absolute inset-0 bg-sky-950/95 border-2 border-sky-400 p-2.5 flex flex-col justify-center z-20 shadow-[0_0_15px_rgba(56,189,248,0.6)] animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    <span className="font-black text-[10px] uppercase text-sky-300 tracking-wider">
                      Sensei's Tactical Hint · 助言
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-sky-400 uppercase">Dismisses on move</span>
                </div>
                <div className="overflow-y-auto pr-0.5">
                  <p className="text-xs font-bold text-sky-100 leading-snug">
                    {activeHint}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-neutral-300 dark:border-neutral-800 flex-wrap">
          <div className="flex items-center gap-2">
            {hintText && (
              <button
                onClick={() => {
                  setShowHintModal(!showHintModal);
                  if (onAskHint) onAskHint();
                }}
                className="px-2.5 py-1.5 bg-sky-400 hover:bg-sky-300 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                title="Ask Sensei for tactical guidance"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHintModal ? 'Hide Hint' : 'Seek Hint'}</span>
              </button>
            )}

            {onReset && (
              <button
                onClick={onReset}
                className="px-2.5 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-black dark:text-white font-black text-xs uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                title="Reset board to initial kata state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>
            )}
          </div>

          {canNext && onNext && (
            <button
              onClick={onNext}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer animate-pulse active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>Next Kata</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Revealed Hint Box */}
        {showHintModal && hintText && (
          <div className="mt-2.5 p-2.5 bg-sky-950/80 border-2 border-sky-400 text-sky-200 text-xs font-semibold flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-sky-300 uppercase block mb-0.5">Sensei's Tactical Sight:</span>
              <p>{hintText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
