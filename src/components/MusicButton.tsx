import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Music, Volume2, VolumeX } from 'lucide-react';

interface MusicButtonProps {
  className?: string;
  isDesktop?: boolean;
}

export const MusicButton: React.FC<MusicButtonProps> = ({ className = '', isDesktop = false }) => {
  const { isPlaying, isMuted, setIsModalOpen } = useMusic();

  if (isDesktop) {
    return (
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Soundtrack Settings"
        title="Soundtrack Settings"
        className={`mcx-nav2-item cursor-pointer group ${className}`}
      >
        <div className="relative flex items-center justify-center">
          <Music className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          {!isMuted && isPlaying && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          {isMuted && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
          )}
        </div>
        <span>Music</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsModalOpen(true)}
      aria-label="Soundtrack Settings"
      title="Soundtrack Settings"
      className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 text-white cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0 relative group ${className}`}
    >
      <Music className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
      {!isMuted && isPlaying && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {isMuted && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
      )}
    </button>
  );
};
