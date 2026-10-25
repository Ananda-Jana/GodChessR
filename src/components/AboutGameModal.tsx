import React, { useEffect, useRef } from 'react';
import { OctoSkull } from './OctoSkull';
import { X } from 'lucide-react';

interface AboutGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutGameModal: React.FC<AboutGameModalProps> = ({ isOpen, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 supports-[backdrop-filter]:backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="About MugenChessX"
    >
      <div className="bg-zinc-950/95 supports-[backdrop-filter]:bg-zinc-950/65 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto text-center relative animate-in zoom-in-95 duration-200 select-none">
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white border border-white/10 cursor-pointer transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand OctoSkull Graphic */}
        <div className="my-2 flex justify-center">
          <OctoSkull size={128} className="text-amber-400 shrink-0" />
        </div>

        {/* Title & Subtext */}
        <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-0.5">
          MugenChessX
        </h2>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-5 block">
          by ANANDA JANA
        </span>

        {/* Story Paragraph */}
        <p className="text-xs text-neutral-300 font-medium leading-relaxed bg-white/5 border border-white/10 p-4 rounded-xl text-left mb-2">
          In the endless realm of Mugen, every move is a battle that echoes across infinity. Here,
          skulls of fallen kings guard the board, and only those who think ten moves ahead survive the
          Culling. Face the GM Bot, enter the Secret Arena, craft your own rules, or train with the
          Hashira until your mind is sharp as a blade. Every game is a story, and yours has just
          begun.
        </p>
      </div>
    </div>
  );
};

export default AboutGameModal;
