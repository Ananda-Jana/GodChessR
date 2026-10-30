import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Volume2, VolumeX, Play, Pause, X, Music } from 'lucide-react';

export const MusicModal: React.FC = () => {
  const {
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    setVolume,
    toggleMute,
    isModalOpen,
    setIsModalOpen,
  } = useMusic();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0a0a0c] border-3 border-white p-6 max-w-md w-full shadow-[6px_6px_0px_#ffffff] text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-white/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-400 text-black flex items-center justify-center font-black border-2 border-white">
              <Music className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider text-amber-400">
                Soundtrack Control
              </h3>
              <p className="text-xs text-zinc-400 font-medium">
                Death Note - Ryuk's Theme A
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center bg-zinc-900 border-2 border-white hover:bg-red-600 hover:border-red-600 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Play / Pause & Mute Status */}
          <div className="flex items-center justify-between gap-3 bg-zinc-900/80 p-3 border-2 border-white/20">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isPlaying && !isMuted ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-bold uppercase tracking-wide">
                {isMuted ? 'Muted' : isPlaying ? 'Playing Soundtrack' : 'Paused'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="px-3 py-1.5 bg-amber-400 text-black font-black uppercase text-xs border-2 border-white flex items-center gap-1.5 cursor-pointer hover:bg-amber-300 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-zinc-300">
              <span>Volume</span>
              <span className="font-mono text-amber-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-400 bg-zinc-800 h-2 cursor-pointer"
            />
          </div>

          {/* Mute Toggle */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-sm font-bold uppercase text-zinc-300">
              Permanent Mute
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className={`px-4 py-2 border-2 border-white font-black uppercase text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                isMuted ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              {isMuted ? 'Muted (Active)' : 'Mute Sound'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-white/20 flex justify-end">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="w-full py-2.5 bg-amber-400 text-black font-black uppercase text-sm border-2 border-white hover:bg-amber-300 transition-colors cursor-pointer shadow-[3px_3px_0px_#ffffff]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
