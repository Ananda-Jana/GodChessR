import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  JoystickWraith, 
  StaticJester, 
  OctavianHollow, 
  IronRegent, 
  CyclopsRevenant, 
  ChromeReaper,
  CHESS_BOTS
} from './ChessBotFaces_with_Gestures';
import { BANGLA_BOT_ENTRY, resolveBotFace } from './BanglaBotFaces';
import { PUNISHER_BOTS, PunisherBotId } from './punisherBot';
import { X, Sword, Target, Shield, Zap, Cpu, Flame } from 'lucide-react';
import { ModeArtPanel } from '../components/ModeArtPanel';

interface PunisherSelectorProps {
  onSelect: (botId: PunisherBotId) => void;
  onClose: () => void;
}

const ALL_PUNISHER_BOTS = [BANGLA_BOT_ENTRY, ...CHESS_BOTS] as const;

const BOT_ICON_MAP: Record<PunisherBotId, React.FC<any>> = {
  'bangla-bot': BANGLA_BOT_ENTRY.Face,
  'joystick-wraith': JoystickWraith,
  'static-jester': StaticJester,
  'octavian-hollow': OctavianHollow,
  'iron-regent': IronRegent,
  'cyclops-revenant': CyclopsRevenant,
  'chrome-reaper': ChromeReaper,
};

const BOT_COLOR_MAP: Record<PunisherBotId, string> = {
  'bangla-bot': 'text-yellow-300',
  'joystick-wraith': 'text-green-400',
  'static-jester': 'text-amber-400',
  'octavian-hollow': 'text-blue-400',
  'iron-regent': 'text-purple-400',
  'cyclops-revenant': 'text-orange-500',
  'chrome-reaper': 'text-red-500',
};

const BOT_BG_MAP: Record<PunisherBotId, string> = {
  'bangla-bot': 'from-red-950 to-orange-950/70',
  'joystick-wraith': 'from-green-950/30 to-black',
  'static-jester': 'from-amber-950/30 to-black',
  'octavian-hollow': 'from-blue-950/30 to-black',
  'iron-regent': 'from-purple-950/30 to-black',
  'cyclops-revenant': 'from-orange-950/30 to-black',
  'chrome-reaper': 'from-red-950/30 to-black',
};

const BOT_DESCRIPTION: Record<PunisherBotId, string> = {
  'bangla-bot': 'The raging Bengali berserker. Aggressive, furious, and delivers savage trash talk on every move.',
  'joystick-wraith': 'The beginner gamer. Grabs any free piece, even when it’s a trap.',
  'static-jester': 'The chaotic trickster. Early queen attacks and unpredictable Scholar’s gambits.',
  'octavian-hollow': 'The solid fortress. Defensive, patient, and keeps its pawn chains tight.',
  'iron-regent': 'The imperial strategist. Positional and royal, squeezing slowly with zero chaos.',
  'cyclops-revenant': 'The warlord. Sacrifices pieces aggressively for brutal initiative.',
  'chrome-reaper': 'The final boss calculator. Evaluates multi-ply combinations in milliseconds.',
};

export const PunisherSelector: React.FC<PunisherSelectorProps> = ({ onSelect, onClose }) => {
  const [hoveredBot, setHoveredBot] = useState<PunisherBotId | null>(null);
  const [selectedBotDetail, setSelectedBotDetail] = useState<PunisherBotId | null>(null);

  // Lock body scroll while selector modal is open
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col h-[100dvh] w-full overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Sticky Header */}
      <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b-4 border-white bg-black shrink-0 z-20">
        <h2 className="text-lg md:text-2xl font-black italic tracking-tighter text-white flex items-center gap-2.5">
          <Cpu className="w-6 h-6 md:w-8 md:h-8 text-[#2727F5]" />
          PUNISHER BOT SELECTOR
        </h2>
        <button 
          type="button"
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] p-2 hover:bg-white/10 transition-colors border-2 border-white flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#fff]"
          aria-label="Close selector"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content Container */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
        {/* Mobile Hero Banner (160px, md:hidden) */}
        <div className="md:hidden relative h-40 w-full shrink-0 overflow-hidden bg-black select-none border-b-2 border-white/20">
          <img
            src="/assets/aistudio/image_4681080e.png"
            alt="Punisher AI Artwork"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center filter brightness-105 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-[#2727F5] text-white border border-white shadow-[1px_1px_0px_#fff]">
              7 AI COMBATANTS
            </span>
            <span className="text-[10px] font-mono font-bold text-white/90 bg-black/70 px-2 py-0.5 border border-white/20">
              DEPTH 4-10 • TACTICAL SACRIFICE
            </span>
          </div>
        </div>

        {/* ================= MOBILE VIEW (< md): Vertical full-width list ================= */}
        <div className="md:hidden p-3 space-y-3 pb-24">
          {ALL_PUNISHER_BOTS.map((bot) => {
            const config = PUNISHER_BOTS[bot.id as PunisherBotId];
            const Icon = resolveBotFace(bot.id);
            const colorClass = BOT_COLOR_MAP[bot.id as PunisherBotId];
            const isBangla = bot.id === 'bangla-bot';

            return (
              <div
                key={bot.id}
                onClick={() => setSelectedBotDetail(bot.id as PunisherBotId)}
                className={`w-full flex items-center justify-between gap-3 p-3 text-left relative overflow-hidden transition-all cursor-pointer active:scale-[0.99] ${
                  isBangla
                    ? 'border-3 border-red-500 bg-[#2b0808] shadow-[3px_3px_0px_#dc2626]'
                    : 'bg-white/5 border-3 border-white/20 hover:border-[#2727F5] active:bg-white/10'
                }`}
              >
                {/* Bangla Fire Background on Mobile Card */}
                {isBangla && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 overflow-hidden pointer-events-none z-0 bangla-fire-surface opacity-35"
                    style={{ contain: 'layout paint' }}
                  />
                )}

                {/* Bot Icon (58px) */}
                <div className={`shrink-0 p-1 border-2 relative z-10 ${isBangla ? 'border-red-400 bg-black/60' : 'border-white/20'} ${colorClass}`}>
                  <Icon size={58} />
                </div>

                {/* Bot Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-black text-xs sm:text-sm text-white uppercase leading-tight break-words">
                      {bot.name}
                    </h3>
                    {isBangla && (
                      <span className="text-[8px] font-black uppercase px-1 py-0.5 bg-yellow-400 text-black border border-black shadow-[1px_1px_0px_#000] shrink-0">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-mono font-bold ${colorClass}`}>
                      ELO {config.rating}
                    </span>
                    <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-black border border-white/20 text-white">
                      Depth {config.depth}
                    </span>
                  </div>
                </div>

                {/* Action Challenge Button */}
                <button
                  type="button"
                  onClick={() => setSelectedBotDetail(bot.id as PunisherBotId)}
                  className={`min-w-[88px] min-h-[44px] px-3 font-black text-xs uppercase tracking-wider border-2 cursor-pointer shrink-0 relative z-10 ${
                    isBangla
                      ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-white shadow-[2px_2px_0px_#fff]'
                      : 'bg-[#2727F5] hover:bg-[#2727F5]/90 active:bg-blue-700 text-white border-white shadow-[2px_2px_0px_#fff]'
                  }`}
                >
                  CHALLENGE
                </button>
              </div>
            );
          })}
        </div>

        {/* ================= DESKTOP VIEW (>= md): Compact Rectangular Cards ================= */}
        <div className="hidden md:flex md:flex-row max-w-7xl mx-auto overflow-hidden">
          <ModeArtPanel
            modeKey="punisher-robot"
            title="Punisher Selector"
            subtitle="7 Mechanical AI Opponents"
          />

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6 overflow-y-auto">
          {ALL_PUNISHER_BOTS.map((bot) => {
            const config = PUNISHER_BOTS[bot.id as PunisherBotId];
            const Icon = resolveBotFace(bot.id);
            const colorClass = BOT_COLOR_MAP[bot.id as PunisherBotId];
            const bgGradient = BOT_BG_MAP[bot.id as PunisherBotId];
            const description = BOT_DESCRIPTION[bot.id as PunisherBotId];
            const isBangla = bot.id === 'bangla-bot';

            return (
              <motion.div
                key={bot.id}
                whileHover={{ scale: 1.015 }}
                onHoverStart={() => setHoveredBot(bot.id as PunisherBotId)}
                onHoverEnd={() => setHoveredBot(null)}
                className={`relative p-3.5 sm:p-4 flex flex-col justify-between group cursor-pointer overflow-hidden rounded-none border-3 ${
                  isBangla
                    ? 'border-red-500 shadow-[4px_4px_0px_#dc2626]'
                    : `bg-gradient-to-b ${bgGradient} border-white shadow-[4px_4px_0px_#fff]`
                }`}
                onClick={() => onSelect(bot.id as PunisherBotId)}
              >
                {/* Fire Animation Background (Bangla-bot only) */}
                {isBangla && (
                  <div 
                    aria-hidden="true" 
                    className="absolute inset-0 overflow-hidden pointer-events-none z-0 bangla-fire-surface opacity-40"
                    style={{ contain: 'layout paint' }}
                  >
                    {/* Dark vignette to ensure high text contrast */}
                    <div className="absolute inset-0 bg-black/50 pointer-events-none" />

                    {/* Rising flame tongues */}
                    <div 
                      className="absolute -bottom-10 left-4 w-32 h-44 rounded-full blur-xl pointer-events-none bangla-fire-tongue-1"
                      style={{
                        background: 'radial-gradient(circle, #fde047 10%, #f97316 50%, #dc2626 80%, transparent 100%)',
                        mixBlendMode: 'screen',
                      }}
                    />
                    <div 
                      className="absolute -bottom-12 right-6 w-36 h-48 rounded-full blur-xl pointer-events-none bangla-fire-tongue-2"
                      style={{
                        background: 'radial-gradient(circle, #ffffff 10%, #fbbf24 45%, #ea580c 75%, transparent 100%)',
                        mixBlendMode: 'screen',
                      }}
                    />

                    {/* Floating Embers */}
                    {[
                      { left: '15%', delay: '0s', dur: '3.2s', drift: '6px' },
                      { left: '45%', delay: '1.2s', dur: '4.5s', drift: '-8px' },
                      { left: '75%', delay: '0.5s', dur: '2.8s', drift: '10px' },
                    ].map((ember, idx) => (
                      <div
                        key={idx}
                        className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-yellow-300 pointer-events-none bangla-fire-ember shadow-[0_0_4px_#fde047]"
                        style={{
                          left: ember.left,
                          animation: `banglaFireEmber ${ember.dur} ease-out infinite ${ember.delay}`,
                          ['--ember-drift' as any]: ember.drift,
                        }}
                      />
                    ))}

                    {/* Hot-edge flicker */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-yellow-300 pointer-events-none bangla-fire-edge-glow" />
                  </div>
                )}

                {/* Content Layer (Relative z-10) */}
                <div className="relative z-10 flex flex-col gap-3">
                  {/* Top Row: ELO & Depth badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isBangla && (
                        <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-yellow-400 text-black border border-black shadow-[1px_1px_0px_#000]">
                          NEW
                        </span>
                      )}
                      <span className={`text-[11px] font-mono font-black px-2 py-0.5 bg-black border border-white ${colorClass}`}>
                        ELO {config.rating}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white/80 bg-black/60 px-2 py-0.5 border border-white/20">
                      Depth {config.depth}
                    </span>
                  </div>

                  {/* Body Row: Face on left + Details & Fight button on right */}
                  <div className="flex items-center gap-3.5">
                    {/* Face Icon Container (constant clear size face) */}
                    <div className={`p-2 border-2 shrink-0 transition-colors duration-300 ${
                      isBangla 
                        ? 'border-yellow-400/50 group-hover:border-yellow-400 bg-black/50' 
                        : 'border-white/20 group-hover:border-white bg-black/40'
                    } ${colorClass}`}>
                      <Icon size={100} />
                    </div>

                    {/* Details & Action Button */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div>
                        <h3 className="text-sm sm:text-base font-black italic uppercase text-white tracking-wider flex items-center gap-1 leading-tight break-words">
                          {isBangla && <Flame className="w-4 h-4 text-amber-400 shrink-0" />}
                          <span className="truncate">{bot.name}</span>
                        </h3>
                        <p className="text-[11px] text-zinc-300 font-medium line-clamp-2 mt-1 leading-snug">
                          {description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(bot.id as PunisherBotId);
                        }}
                        className={`w-full mt-2.5 py-2 px-3 text-white font-black text-xs uppercase tracking-wider border-2 border-white flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                          isBangla
                            ? 'bg-red-600 hover:bg-red-500 shadow-[2px_2px_0px_#fde047]'
                            : 'bg-[#2727F5] group-hover:bg-blue-600 shadow-[2px_2px_0px_#fff]'
                        }`}
                      >
                        <Sword className="w-3.5 h-3.5" />
                        FIGHT BOT
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM SHEET DETAIL MODAL ================= */}
      <AnimatePresence>
        {selectedBotDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-end justify-center md:hidden"
            onClick={() => setSelectedBotDetail(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="w-full max-h-[85dvh] bg-[#090912] border-t-4 border-x-4 border-white p-5 flex flex-col justify-between relative shadow-[0_-8px_32px_rgba(0,0,0,0.9)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Handle & Close */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-white/20 shrink-0">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#2727F5]" />
                  <span className="text-xs font-black uppercase text-white tracking-widest">
                    BOT SPECIFICATIONS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBotDetail(null)}
                  className="p-2 border border-white text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Middle Scrollable Stats */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {(() => {
                  const bot = ALL_PUNISHER_BOTS.find(b => b.id === selectedBotDetail);
                  if (!bot) return null;
                  const config = PUNISHER_BOTS[selectedBotDetail];
                  const Icon = resolveBotFace(selectedBotDetail);
                  const colorClass = BOT_COLOR_MAP[selectedBotDetail];
                  const description = BOT_DESCRIPTION[selectedBotDetail];
                  const isBangla = selectedBotDetail === 'bangla-bot';

                  return (
                    <>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 border-2 border-white ${colorClass} shrink-0 ${isBangla ? 'bg-red-950/60' : ''}`}>
                          <Icon size={80} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-black italic uppercase text-white leading-tight break-words">
                              {bot.name}
                            </h3>
                            {isBangla && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-yellow-400 text-black border border-black shadow-[1px_1px_0px_#000]">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-mono font-bold ${colorClass}`}>
                              ELO {config.rating}
                            </span>
                            <span className="text-xs font-mono font-bold text-zinc-400">
                              Depth {config.depth}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 font-medium leading-relaxed bg-white/5 p-3 border border-white/10">
                        {description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2 border border-white/10 bg-black/40">
                          <span className="text-zinc-500 block text-[10px] uppercase">Aggression</span>
                          <span className="font-bold text-white">{config.aggression * 100}%</span>
                        </div>
                        <div className="p-2 border border-white/10 bg-black/40">
                          <span className="text-zinc-500 block text-[10px] uppercase">Blunder Rate</span>
                          <span className="font-bold text-white">{Math.round(config.blunderChance * 100)}%</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Sticky Fight Button at Bottom with Safe Area Padding */}
              <div className="pt-3 border-t-2 border-white/20 shrink-0 pb-[env(safe-area-inset-bottom,16px)]">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBotDetail) {
                      onSelect(selectedBotDetail);
                      setSelectedBotDetail(null);
                    }
                  }}
                  className={`w-full py-3.5 text-white font-black text-sm uppercase tracking-widest border-2 border-white flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                    selectedBotDetail === 'bangla-bot'
                      ? 'bg-red-600 hover:bg-red-500 shadow-[3px_3px_0px_#fde047]'
                      : 'bg-[#2727F5] hover:bg-blue-600 shadow-[3px_3px_0px_#fff]'
                  }`}
                >
                  <Sword className="w-5 h-5" />
                  FIGHT BOT NOW
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
