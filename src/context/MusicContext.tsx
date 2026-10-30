import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const AUDIO_SRC = '/assets/aistudio/Death_Note_-_Ryuk_s_Theme_A__mp3.pm__8cd002ae.mp3';

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolumeState] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
    audioRef.current = audio;

    // Attempt autoplay by default
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay blocked by browser policy until user interaction
          setIsPlaying(false);
          const handleFirstInteraction = () => {
            if (audioRef.current && !isMuted) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
            window.removeEventListener('pointerdown', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
          };
          window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
          window.addEventListener('keydown', handleFirstInteraction, { once: true });
        });
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (v > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        volume,
        isMuted,
        togglePlay,
        setVolume,
        toggleMute,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
