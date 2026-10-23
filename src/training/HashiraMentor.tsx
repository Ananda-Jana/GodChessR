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

  // Expression-specific eyebrow, eye, and mouth SVG paths
  const renderFaceFeatures = () => {
    switch (expression) {
      case 'scowl':
        return (
          <g>
            {/* Angry vein indicator */}
            <path
              d="M 148 38 L 158 38 M 153 33 L 153 43 M 150 40 L 156 40"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Steep furrowed angry eyebrows */}
            <path d="M 68 84 L 96 96" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            <path d="M 132 96 L 104 84" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            {/* Intense glaring eyes */}
            <ellipse cx="82" cy="100" rx="9" ry="5" fill="#ffffff" stroke="#000000" strokeWidth="2.5" />
            <ellipse cx="118" cy="100" rx="9" ry="5" fill="#ffffff" stroke="#000000" strokeWidth="2.5" />
            <circle cx="82" cy="100" r="3.5" fill="#ef4444" />
            <circle cx="118" cy="100" r="3.5" fill="#ef4444" />
            {/* Disappointed scowling mouth */}
            <path d="M 88 140 Q 100 130 112 140" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'approving':
        return (
          <g>
            {/* Golden triumph sparks */}
            <path d="M 40 40 L 46 46 M 46 40 L 40 46" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
            <path d="M 160 40 L 166 46 M 166 40 L 160 46" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
            {/* Relaxed, disciplined confident eyebrows */}
            <path d="M 66 84 Q 82 82 96 88" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 134 84 Q 118 82 104 88" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
            {/* Pleased, composed smiling eyes */}
            <path d="M 74 100 Q 82 93 90 100" stroke="#000000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 110 100 Q 118 93 126 100" stroke="#000000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Subtle approving smile */}
            <path d="M 88 132 Q 100 142 112 132" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'analytical':
        return (
          <g>
            {/* Thinking halo aura mark */}
            <circle cx="100" cy="30" r="4" fill="#38bdf8" />
            {/* One raised eyebrow, one squinted */}
            <path d="M 66 80 Q 82 78 96 82" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 134 88 Q 118 88 104 92" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
            {/* Analytical assessing eyes */}
            <ellipse cx="82" cy="98" rx="8" ry="6" fill="#ffffff" stroke="#000000" strokeWidth="2.5" />
            <line x1="110" y1="99" x2="126" y2="99" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
            <circle cx="82" cy="98" r="3" fill="#38bdf8" />
            {/* Thoughtful mouth */}
            <line x1="94" y1="135" x2="108" y2="135" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );

      case 'stern':
      default:
        return (
          <g>
            {/* Sharp, watchful martial eyebrows */}
            <path d="M 66 84 L 96 90" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            <path d="M 134 84 L 104 90" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
            {/* Discerning, piercing eyes */}
            <ellipse cx="82" cy="100" rx="9" ry="6" fill="#ffffff" stroke="#000000" strokeWidth="2.5" />
            <ellipse cx="118" cy="100" rx="9" ry="6" fill="#ffffff" stroke="#000000" strokeWidth="2.5" />
            <circle cx="82" cy="100" r="3.5" fill="#1e293b" />
            <circle cx="118" cy="100" r="3.5" fill="#1e293b" />
            <circle cx="84" cy="99" r="1.2" fill="#ffffff" />
            <circle cx="120" cy="99" r="1.2" fill="#ffffff" />
            {/* Firm martial line mouth */}
            <line x1="90" y1="136" x2="110" y2="136" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
          </g>
        );
    }
  };

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

  // Compact Mobile Console: Shallow ~68px wide rectangle banner.
  // Avatar on left, dynamic mood badge, and speech bubble on right.
  // Action buttons are omitted here because they live in the mobile bottom bar.
  if (layout === 'compact') {
    return (
      <div className={`bg-[#0c0c0e] border-2 border-amber-400/90 shadow-[2px_2px_0px_#000000] p-1.5 flex items-center gap-2.5 w-full h-[68px] max-h-[72px] shrink-0 overflow-hidden ${className}`}>
        {/* Compact Avatar */}
        <div className="relative shrink-0 flex items-center">
          <div className="w-11 h-11 bg-[#18181b] border-2 border-white shadow-[1px_1px_0px_#000] overflow-hidden flex items-center justify-center relative shrink-0">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full object-contain filter drop-shadow-md"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="100" cy="100" r="92" fill="#27272a" stroke="#000" strokeWidth="2" />
              <path
                d="M 100 20 C 70 20 50 45 46 80 C 44 95 46 120 48 135 C 56 125 60 100 64 85 C 70 55 90 45 100 45 C 110 45 130 55 136 85 C 140 100 144 125 152 135 C 154 120 156 95 154 80 C 150 45 130 20 100 20 Z"
                fill="#f1f5f9"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
              <ellipse cx="100" cy="22" rx="14" ry="9" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
              <circle cx="100" cy="18" r="6" fill="#0f172a" />
              <path
                d="M 30 190 L 60 145 L 100 170 L 140 145 L 170 190 Z"
                fill="#09090b"
                stroke="#000"
                strokeWidth="3"
              />
              <path d="M 60 145 L 100 185 L 140 145" fill="none" stroke="#f8fafc" strokeWidth="3" />
              <rect x="86" y="130" width="28" height="25" fill="#fbcfe8" stroke="#000" strokeWidth="2" />
              <ellipse cx="100" cy="105" rx="38" ry="42" fill="#fed7aa" stroke="#000" strokeWidth="3" />
              <path
                d="M 64 68 Q 100 62 136 68 L 138 78 Q 100 72 62 78 Z"
                fill="#dc2626"
                stroke="#000"
                strokeWidth="2"
              />
              <circle cx="100" cy="73" r="5" fill="#fef08a" stroke="#000" strokeWidth="1" />
              <line x1="72" y1="84" x2="80" y2="114" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
              <path d="M 98 108 L 103 122 L 96 122" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
              <path
                d="M 82 130 Q 92 126 100 130 Q 108 126 118 130 Q 108 142 100 144 Q 92 142 82 130 Z"
                fill="#f1f5f9"
                stroke="#0f172a"
                strokeWidth="2"
              />
              <path
                d="M 94 144 Q 100 162 100 166 Q 100 162 106 144 Z"
                fill="#f1f5f9"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              {renderFaceFeatures()}
            </svg>
            <div className="absolute top-0.5 left-0.5 bg-black text-amber-400 border border-amber-400 font-black text-[8px] w-3.5 h-3.5 flex items-center justify-center leading-none">
              {kanji}
            </div>
          </div>
        </div>

        {/* Dialogue Bubble */}
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center bg-neutral-900 border border-neutral-700 px-2 py-1 overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-0.5 shrink-0">
            <span className="font-black text-[10px] uppercase text-amber-400 truncate">
              GENSEI · {rankTitle}
            </span>
            <span className={`text-[8px] font-black uppercase px-1 py-0 border shrink-0 ${badge.bg}`}>
              {badge.text}
            </span>
          </div>
          <p className="text-[11px] font-bold text-neutral-100 leading-snug line-clamp-2 select-text font-sans">
            &ldquo;{message}&rdquo;
          </p>
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
      {/* 2D Sensei SVG Avatar Box */}
      <div className="relative shrink-0">
        <div className={`${avatarSize} bg-[#18181b] border-2 sm:border-3 border-black dark:border-white shadow-[2px_2px_0px_#000000] overflow-hidden flex items-center justify-center relative`}>
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full object-contain filter drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Halo */}
            <circle cx="100" cy="100" r="92" fill="#27272a" stroke="#000" strokeWidth="2" />

            {/* Hair: Samurai White Topknot & Flow */}
            <path
              d="M 100 20 C 70 20 50 45 46 80 C 44 95 46 120 48 135 C 56 125 60 100 64 85 C 70 55 90 45 100 45 C 110 45 130 55 136 85 C 140 100 144 125 152 135 C 154 120 156 95 154 80 C 150 45 130 20 100 20 Z"
              fill="#f1f5f9"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            {/* Topknot knot */}
            <ellipse cx="100" cy="22" rx="14" ry="9" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
            <circle cx="100" cy="18" r="6" fill="#0f172a" />

            {/* Traditional Black Haori Robe / Collar */}
            <path
              d="M 30 190 L 60 145 L 100 170 L 140 145 L 170 190 Z"
              fill="#09090b"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Haori Inner White Trim */}
            <path d="M 60 145 L 100 185 L 140 145" fill="none" stroke="#f8fafc" strokeWidth="3" />

            {/* Neck */}
            <rect x="86" y="130" width="28" height="25" fill="#fbcfe8" stroke="#000" strokeWidth="2" />

            {/* Sensei Head & Face */}
            <ellipse cx="100" cy="105" rx="38" ry="42" fill="#fed7aa" stroke="#000" strokeWidth="3" />

            {/* Martial Forehead Headband */}
            <path
              d="M 64 68 Q 100 62 136 68 L 138 78 Q 100 72 62 78 Z"
              fill="#dc2626"
              stroke="#000"
              strokeWidth="2"
            />
            {/* Headband Kanji / Emblem */}
            <circle cx="100" cy="73" r="5" fill="#fef08a" stroke="#000" strokeWidth="1" />

            {/* Battle Scar over left eye */}
            <line x1="72" y1="84" x2="80" y2="114" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />

            {/* Nose */}
            <path d="M 98 108 L 103 122 L 96 122" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />

            {/* Traditional Sensei Mustache & Beard */}
            <path
              d="M 82 130 Q 92 126 100 130 Q 108 126 118 130 Q 108 142 100 144 Q 92 142 82 130 Z"
              fill="#f1f5f9"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Pointed Chin Beard */}
            <path
              d="M 94 144 Q 100 162 100 166 Q 100 162 106 144 Z"
              fill="#f1f5f9"
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* Dynamic Emotion Facial Features */}
            {renderFaceFeatures()}
          </svg>

          {/* Kanji Stamp Badge in Avatar Corner */}
          <div className="absolute top-1 left-1 bg-black text-amber-400 border border-amber-400 font-black text-[10px] w-5 h-5 flex items-center justify-center">
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
                SENSEI GENSEI · 源征
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
          <div className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans bg-neutral-100 dark:bg-[#18181b] p-3 border-2 border-black dark:border-neutral-700 min-h-[58px]">
            &ldquo;{message}&rdquo;
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
