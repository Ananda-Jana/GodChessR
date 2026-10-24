import React from 'react';
import { SecretPlayerConfig } from '../types';
import { MessageSquare, Sparkles } from 'lucide-react';

interface SecretChatOverlayProps {
  botConfig: SecretPlayerConfig;
  currentMessage: string | null;
  isBotThinking?: boolean;
}

export const SecretChatOverlay: React.FC<SecretChatOverlayProps> = ({
  botConfig,
  currentMessage,
  isBotThinking = false,
}) => {
  return (
    <div className="w-full max-w-[540px] mb-2 sm:mb-3 select-none">
      {/* FIXED HEIGHT BOX: h-20 on mobile, h-22 on sm screens to prevent vertical layout jitter */}
      <div className="relative h-20 sm:h-22 w-full overflow-hidden rounded-2xl border-3 border-slate-700/80 bg-[#0f172a]/95 text-white shadow-xl backdrop-blur-md p-2.5 flex items-center gap-3 transition-all duration-300">
        {/* Glow Accent Border Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            botConfig.themeColor === 'rose'
              ? 'from-rose-500 via-pink-400 to-rose-600'
              : botConfig.themeColor === 'amber'
              ? 'from-amber-400 via-yellow-300 to-amber-600'
              : 'from-slate-300 via-zinc-400 to-slate-600'
          }`}
        />

        {/* Bot Profile Image (Square) */}
        {botConfig.avatarSrc ? (
          <img
            src={botConfig.avatarSrc}
            alt={botConfig.realName}
            className={`w-12 h-12 sm:w-14 sm:h-14 object-cover border-2 border-white/80 shadow-md shrink-0 ${
              isBotThinking ? 'animate-pulse' : ''
            }`}
          />
        ) : (
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 ${botConfig.avatarBg} border-2 border-white/80 shadow-md flex items-center justify-center text-xl shrink-0 ${
              isBotThinking ? 'animate-bounce' : ''
            }`}
          >
            {botConfig.avatarIcon}
          </div>
        )}

        {/* Bot Name & Current Live Message */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-slate-200 truncate">
              {botConfig.realName}
            </span>
            <span
              className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                botConfig.themeColor === 'rose'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : botConfig.themeColor === 'amber'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
              }`}
            >
              Live
            </span>
          </div>

          <div className="mt-0.5 text-xs sm:text-sm font-semibold text-amber-200/90 leading-snug line-clamp-2 overflow-hidden transition-all">
            {isBotThinking ? (
              <span className="inline-flex items-center gap-1.5 text-slate-400 italic">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                Thinking with affection...
              </span>
            ) : currentMessage ? (
              <span>"{currentMessage}"</span>
            ) : (
              <span className="text-slate-400 italic font-normal">
                Waiting for your move! 💕
              </span>
            )}
          </div>
        </div>

        <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block opacity-60" />
      </div>
    </div>
  );
};
