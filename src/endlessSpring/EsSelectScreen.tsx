import React from 'react';
import { ArrowLeft, Play, RotateCcw, ExternalLink, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { ES_GAME_METADATA, ES_SCRIBBLE_HUB_URL } from './EsConfig';
import { esHasSave } from './EsSaveStore';
import { EsGameId } from './EsTypes';

export interface EsSelectScreenProps {
  onSelectGame: (gameId: EsGameId, startOver?: boolean) => void;
  onExit: () => void;
}

export const EsSelectScreen: React.FC<EsSelectScreenProps> = ({
  onSelectGame,
  onExit,
}) => {
  const games: EsGameId[] = [1, 2, 3, 4, 5];

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col overflow-y-auto">
      {/* Top Bar */}
      <header className="h-14 px-4 sm:px-6 border-b border-amber-500/20 bg-zinc-950/95 sticky top-0 z-30 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-amber-300">
            Endless Spring · Story Mode
          </h1>
        </div>

        <div className="text-[11px] font-mono text-amber-500/80 hidden sm:block">
          Mind Opens · By Ananda Jana
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* Intro Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black border border-amber-500/30 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Episodic Narrative Chess-Variants
            </span>
            <a
              href={ES_SCRIBBLE_HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 hover:underline"
            >
              <span>Read Novel on Scribble Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-serif">
            Each episode is playable independently without progress locks. Boards, custom pieces, and rule mechanics are directly drawn from the novel. Your progress is saved after every move.
          </p>
        </div>

        {/* 5-Card Chooser Grid (1 col below md, 2 cols from md) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
          {games.map((gameId) => {
            const meta = ES_GAME_METADATA[gameId];
            const hasSave = esHasSave(gameId);

            return (
              <div
                key={gameId}
                className="bg-zinc-950/90 border border-amber-500/30 hover:border-amber-400/60 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all duration-150"
              >
                <div>
                  {/* Top line: Arc & Chapters */}
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-amber-400/90 mb-1.5">
                    <span className="truncate">{meta.arcName}</span>
                    <span className="shrink-0">{meta.chapterRange}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">
                    Episode {gameId}: {meta.title}
                  </h3>

                  {/* Metadata line */}
                  <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {meta.durationEstimate}
                    </span>
                    <span>·</span>
                    <span className="text-neutral-300">{meta.boardDescription}</span>
                  </div>

                  {/* Spoiler Warning */}
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-200/70 bg-amber-950/20 px-2.5 py-1.5 rounded border border-amber-500/20 mb-4">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{meta.spoilerWarning}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <a
                    href={ES_SCRIBBLE_HUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Novel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2">
                    {hasSave ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectGame(gameId, true)}
                          className="px-3 py-2 border border-white/20 hover:bg-white/10 text-neutral-300 text-xs font-bold uppercase rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restart</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectGame(gameId, false)}
                          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase rounded flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Continue</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectGame(gameId, true)}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase rounded flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
