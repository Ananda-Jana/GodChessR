/**
 * PredictorPanel - Fixed-Height Zero-Shift Predictor Component
 * Mobile: Ultra-compact 1-line top badge
 * Desktop: Strictly fixed 148px height box with pre-reserved sparkline area
 */

import React from 'react';
import { usePredictor } from '../predictor/PredictorContext';
import { isProvisionalRating } from '../predictor/ratingEngine';
import { Zap, Target, ShieldAlert, Award } from 'lucide-react';
import type { TacticalMetrics } from '../predictor/types';

interface PredictorPanelProps {
  metrics: TacticalMetrics;
  modeLabel: string;
}

export const PredictorPanel: React.FC<PredictorPanelProps> = ({ metrics }) => {
  const { state } = usePredictor();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const rating = state.currentRating;
  const activeStats = state.activeMatchStats;
  const history = activeStats?.ratingHistory || [];
  const movesCount = metrics.turnsSurvived;
  const provisional = isProvisionalRating(movesCount);

  const lastDelta = history.length > 0 ? history[history.length - 1].delta : 0;
  const lastQuality = history.length > 0 ? history[history.length - 1].tacticalQuality : 70;

  return (
    <>
      {/* MOBILE ONLY: Ultra-Compact 1-Line Fixed Top Badge with Expandable Details */}
      <div className="md:hidden w-full flex flex-col shrink-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between px-3 py-2 bg-[#0f172a] border-2 border-slate-700 text-slate-100 font-mono text-xs shadow-md select-none w-full cursor-pointer active:bg-slate-800"
        >
          <div className="flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-12 scale-110' : ''} text-amber-400`} />
            <span className="font-extrabold text-amber-300">{rating}</span>
            <span className={`text-[10px] font-bold ${lastDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ({lastDelta >= 0 ? `+${lastDelta}` : lastDelta})
            </span>
            {provisional && (
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 border border-slate-700">
                Prov
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-slate-400">
            {isExpanded ? 'Hide Stats' : 'Show Stats'}
            <Zap className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-2 gap-1 px-3 py-2 bg-slate-900 border-x-2 border-b-2 border-slate-700 text-[10px] animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">QUALITY</span>
              <span className="text-emerald-400 font-black">{lastQuality}%</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">CAPTURES</span>
              <span className="text-cyan-400 font-black">{metrics.capturesMade}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">CHECKS DEF</span>
              <span className="text-emerald-300 font-black">{metrics.checksDefendedCount}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">SPECIAL</span>
              <span className="text-amber-400 font-black">{metrics.specialActionsCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP ONLY: Strictly Fixed Height 148px Container (Zero Layout Shift) */}
      <div className="hidden md:block w-full h-[148px] min-h-[148px] max-h-[148px] bg-[#0f172a] border-2 border-slate-700 text-slate-100 overflow-hidden shadow-lg shrink-0 p-2.5 space-y-2 select-none">
        {/* Header */}
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1">
          <div className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Predicted Skill</span>
            {provisional && (
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 border border-slate-700 font-normal">
                Prov
              </span>
            )}
          </div>
          <div className="font-mono font-bold text-amber-400 text-sm">
            {rating}
            <span className={`text-xs ml-1 font-semibold ${lastDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ({lastDelta >= 0 ? `+${lastDelta}` : lastDelta})
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-1.5 text-[11px] bg-slate-950/70 p-1.5 border border-slate-800 font-mono">
          <div className="text-center">
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Quality</div>
            <div className="font-bold text-emerald-400">{lastQuality}%</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Captures</div>
            <div className="font-bold text-cyan-400">{metrics.capturesMade}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Checks Def</div>
            <div className="font-bold text-emerald-300">{metrics.checksDefendedCount}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Special</div>
            <div className="font-bold text-amber-400">{metrics.specialActionsCount}</div>
          </div>
        </div>

        {/* Pre-Reserved Sparkline Graph Area (Always h-7, preventing layout shift when moves accumulate) */}
        <div className="h-7 w-full bg-slate-950 p-1 border border-slate-800 flex items-end gap-1 overflow-hidden">
          {history.length > 0 ? (
            history.slice(-16).map((snap, idx) => {
              const heightPct = Math.max(20, Math.min(100, ((snap.rating - 1000) / 600) * 100));
              return (
                <div
                  key={idx}
                  className="flex-1 bg-amber-500/80 hover:bg-amber-400 transition-all rounded-none min-w-[3px]"
                  style={{ height: `${heightPct}%` }}
                  title={`Turn ${snap.turnIndex}: Rating ${snap.rating}`}
                />
              );
            })
          ) : (
            <div className="w-full text-center text-[9px] text-slate-600 font-mono self-center">
              Session trendline initializes on first move
            </div>
          )}
        </div>
      </div>
    </>
  );
};
