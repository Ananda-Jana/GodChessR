/**
 * MugenPassView.tsx - Event Ticket Pass Store Component
 * Designed separately for Desktop & Mobile viewports for zero flicker.
 * Allows purchasing 3 tiers of Mugen Passes using Mugen Gems:
 * - Nu Pass (1.2X Trophy Multiplier) - 1,200 Gems
 * - Mecha Mugen Pass (1.5X Trophy Multiplier) - 2,000 Gems
 * - VIP Pass (2.0X Trophy Multiplier) - 3,000 Gems
 */

import React, { useState, useEffect } from 'react';
import { getGems } from './mugenStore';
import {
  MUGEN_PASS_DEFINITIONS,
  MugenPassId,
  MugenPassDefinition,
  getActivePass,
  purchasePass,
  ActiveMugenPass,
} from './mugenPassStore';
import { MugenGemIcon } from './MugenGemIcon';
import { MugenPassIcon } from './MugenPassIcon';
import { PassTicketGraphic } from './PassTicketGraphic';
import { Sparkles, Trophy, CheckCircle2, Zap, AlertCircle, Award, Star, Shield } from 'lucide-react';

interface MugenPassViewProps {
  userId: string;
}

export const MugenPassView: React.FC<MugenPassViewProps> = ({ userId }) => {
  const [gems, setGems] = useState<number>(() => getGems(userId));
  const [activePass, setActivePass] = useState<ActiveMugenPass | null>(() => getActivePass(userId));
  const [selectedPassToBuy, setSelectedPassToBuy] = useState<MugenPassDefinition | null>(null);
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handleEconomyUpdate = () => {
      setGems(getGems(userId));
      setActivePass(getActivePass(userId));
    };

    window.addEventListener('mugen_economy_update', handleEconomyUpdate);
    window.addEventListener('mugen_pass_updated', handleEconomyUpdate);
    return () => {
      window.removeEventListener('mugen_economy_update', handleEconomyUpdate);
      window.removeEventListener('mugen_pass_updated', handleEconomyUpdate);
    };
  }, [userId]);

  const handleConfirmPurchase = (passDef: MugenPassDefinition) => {
    const res = purchasePass(userId, passDef.id);
    if (res.success && res.pass) {
      setGems(getGems(userId));
      setActivePass(res.pass);
      setSelectedPassToBuy(null);
      setNotice({
        text: `SUCCESS! Purchased ${passDef.name} (${passDef.multiplierText} Multiplier for 10 matches)!`,
        type: 'success',
      });
      setTimeout(() => setNotice(null), 5000);
    } else {
      setNotice({
        text: res.error || 'Failed to purchase pass. Please check your Gem balance.',
        type: 'error',
      });
      setTimeout(() => setNotice(null), 5000);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-white select-none">
      {/* Top Banner & Wallet Counter Header */}
      <div className="bg-[#0e131f] border-3 border-amber-400 p-4 sm:p-6 shadow-[6px_6px_0px_#f59e0b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-400 text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#fff] shrink-0">
            <MugenPassIcon className="w-7 h-7" active={true} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
                MUGEN PASS EVENT TICKET STORE
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-300 mt-0.5">
              Multiply all League match trophy rewards (wins & participation) for 10 matches using Mugen Gems!
            </p>
          </div>
        </div>

        {/* Gem Balance Counter */}
        <div className="bg-slate-950 border-2 border-amber-400/80 px-4 py-2 flex items-center gap-3 shrink-0 shadow-[2px_2px_0px_#fbbf24]">
          <MugenGemIcon className="w-6 h-6 text-amber-400" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400">YOUR MUGEN GEMS</span>
            <span className="text-lg font-mono font-black text-amber-400 tabular-nums">
              {gems.toLocaleString()} Gems
            </span>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-3 border-2 font-mono text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            notice.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-bold uppercase">{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs underline hover:no-underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Pass Banner (If owned) */}
      {activePass && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-2 border-amber-400 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-amber-400 text-black border-2 border-black flex items-center justify-center font-mono font-black text-xl shadow-[3px_3px_0px_#000]">
              {MUGEN_PASS_DEFINITIONS[activePass.passId]?.multiplierText || 'ACTIVE'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black px-2 py-0.5 bg-amber-400 text-black uppercase">
                  ACTIVE MULTIPLIER
                </span>
                <span className="text-sm font-black uppercase text-white">
                  {MUGEN_PASS_DEFINITIONS[activePass.passId]?.name || 'Mugen Pass'}
                </span>
              </div>
              <p className="text-xs font-mono text-amber-300 font-bold mt-1">
                {activePass.chargesRemaining} of {activePass.totalCharges} League Match Charges Remaining
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-300">
              <span>Pass Usage</span>
              <span className="text-amber-400 font-bold">{activePass.chargesRemaining}/10 Left</span>
            </div>
            <div className="w-full h-3 bg-slate-950 border border-amber-400/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                style={{ width: `${(activePass.chargesRemaining / activePass.totalCharges) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP VIEWPORT LAYOUT (>= 768px): 3-Column Ticket Showcase               */}
      {/* ========================================================================= */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {(Object.keys(MUGEN_PASS_DEFINITIONS) as MugenPassId[]).map((id) => {
          const pass = MUGEN_PASS_DEFINITIONS[id];
          const isCurrentActive = activePass?.passId === pass.id;
          const canAfford = gems >= pass.gemCost;

          return (
            <div
              key={pass.id}
              className={`relative bg-[#0c101a] border-3 transition-all flex flex-col justify-between overflow-hidden group ${
                isCurrentActive
                  ? 'border-amber-400 shadow-[6px_6px_0px_#f59e0b]'
                  : 'border-white/20 hover:border-amber-400/80 shadow-[4px_4px_0px_rgba(255,255,255,0.1)] hover:shadow-[6px_6px_0px_#fbbf24]'
              }`}
            >
              {/* Ticket Top Notch Bar */}
              <div
                className="p-4 border-b-2 flex items-center justify-between"
                style={{
                  backgroundColor: `${pass.primaryColor}15`,
                  borderColor: pass.primaryColor,
                }}
              >
                <div className="flex items-center gap-2">
                  <MugenPassIcon className="w-6 h-6" active={true} />
                  <span
                    className="text-xs font-mono font-black uppercase tracking-wider px-2 py-0.5 border"
                    style={{
                      color: pass.primaryColor,
                      borderColor: pass.primaryColor,
                      backgroundColor: `${pass.primaryColor}20`,
                    }}
                  >
                    {pass.badgeLabel}
                  </span>
                </div>

                {/* Stars Indicator */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: pass.starsCount }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
              </div>

              {/* Ticket Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                {/* Scalloped Vector Ticket Pass Design */}
                <div className="my-1">
                  <PassTicketGraphic
                    passId={pass.id}
                    multiplierText={pass.multiplierText}
                    badgeLabel={pass.badgeLabel}
                    isEquipped={isCurrentActive}
                    className="w-full h-auto"
                  />
                </div>

                {/* Ticket Description */}
                <div>
                  <h3 className="text-lg font-black uppercase text-white">{pass.name}</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1 leading-relaxed">
                    {pass.description}
                  </p>
                </div>

                {/* Price & Purchase Action */}
                <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Cost:</span>
                    <span className="font-black text-amber-400 flex items-center gap-1.5 text-sm">
                      <MugenGemIcon className="w-4 h-4" />
                      {pass.gemCost.toLocaleString()} Gems
                    </span>
                  </div>

                  {isCurrentActive ? (
                    <div className="w-full py-2.5 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 font-mono font-black text-xs uppercase text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>EQUIPPED & ACTIVE</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => setSelectedPassToBuy(pass)}
                      className={`w-full py-2.5 px-4 font-mono font-black text-xs uppercase border-2 transition-all flex items-center justify-center gap-2 ${
                        canAfford
                          ? 'bg-amber-400 hover:bg-amber-300 text-black border-black shadow-[3px_3px_0px_#fff] active:translate-y-0.5 cursor-pointer'
                          : 'bg-slate-900 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <MugenPassIcon className="w-4 h-4" active={canAfford} />
                      <span>{canAfford ? 'PURCHASE PASS' : 'NEED MORE GEMS'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEWPORT LAYOUT (< 768px): Touch-Optimized Cards                    */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col gap-4">
        {(Object.keys(MUGEN_PASS_DEFINITIONS) as MugenPassId[]).map((id) => {
          const pass = MUGEN_PASS_DEFINITIONS[id];
          const isCurrentActive = activePass?.passId === pass.id;
          const canAfford = gems >= pass.gemCost;

          return (
            <div
              key={pass.id}
              className={`bg-[#0c101a] border-2 p-4 flex flex-col gap-3 relative ${
                isCurrentActive ? 'border-amber-400 shadow-[4px_4px_0px_#f59e0b]' : 'border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-base font-black uppercase text-white">{pass.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400 block">{pass.subtitle}</span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-mono font-black text-amber-400 flex items-center gap-1 justify-end">
                    <MugenGemIcon className="w-3.5 h-3.5" />
                    {pass.gemCost.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">10 Matches</span>
                </div>
              </div>

              {/* Scalloped Vector Ticket Pass Design on Mobile */}
              <div className="w-full max-w-[280px] mx-auto py-1">
                <PassTicketGraphic
                  passId={pass.id}
                  multiplierText={pass.multiplierText}
                  badgeLabel={pass.badgeLabel}
                  isEquipped={isCurrentActive}
                  className="w-full h-auto"
                />
              </div>

              <p className="text-xs font-mono text-slate-300">{pass.description}</p>

              {isCurrentActive ? (
                <div className="w-full py-2 bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono font-black text-xs uppercase text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PASS ACTIVE ({activePass.chargesRemaining} MATCHES LEFT)</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => setSelectedPassToBuy(pass)}
                  className={`w-full py-2.5 px-4 font-mono font-black text-xs uppercase border-2 flex items-center justify-center gap-2 ${
                    canAfford
                      ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#fff] cursor-pointer'
                      : 'bg-slate-900 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <MugenPassIcon className="w-4 h-4" active={canAfford} />
                  <span>{canAfford ? `BUY ${pass.name.toUpperCase()}` : 'NEED MORE GEMS'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Purchase Confirmation Modal */}
      {selectedPassToBuy && (
        <div
          className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#0a0e17] border-3 border-amber-400 p-6 shadow-[8px_8px_0px_#f59e0b] flex flex-col gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 text-black border-2 border-black flex items-center justify-center shrink-0">
                <MugenPassIcon className="w-6 h-6" active={true} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-white">CONFIRM PASS PURCHASE</h3>
                <span className="text-xs font-mono text-slate-400">{selectedPassToBuy.name}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-700 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Multiplier:</span>
                <span className="font-bold text-amber-400">{selectedPassToBuy.multiplierText} Trophy Boost</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-bold text-white">10 League Matches</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">Price:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <MugenGemIcon className="w-3.5 h-3.5" />
                  {selectedPassToBuy.gemCost.toLocaleString()} Gems
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Balance:</span>
                <span className="font-bold text-slate-300">
                  {(gems - selectedPassToBuy.gemCost).toLocaleString()} Gems
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleConfirmPurchase(selectedPassToBuy)}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#fff] cursor-pointer"
              >
                CONFIRM & BUY
              </button>
              <button
                type="button"
                onClick={() => setSelectedPassToBuy(null)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono font-bold text-xs uppercase border border-slate-700 cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
