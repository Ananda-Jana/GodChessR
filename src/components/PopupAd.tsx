import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalFocus } from '../utils/useModalFocus';

interface PopupAdProps {
  imageSrc: string;
  onClose: () => void;
  onFightPunishers?: () => void;
}

export const PopupAd: React.FC<PopupAdProps> = ({ imageSrc, onClose, onFightPunishers }) => {
  const modalRef = useModalFocus(true, onClose, true);

  useEffect(() => {
    const timer = setTimeout(onClose, 30000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleFightPunishers = () => {
    onClose();
    if (onFightPunishers) {
      onFightPunishers();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Promotional announcement for Punisher Robot Mode"
        className="relative max-w-sm md:max-w-xl lg:max-w-2xl w-full bg-black border-4 border-amber-400 shadow-[8px_8px_0px_#000000] sm:shadow-[14px_14px_0px_#000000] rounded-none overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Left Declaration Badge */}
        <div className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-black/90 border border-amber-400 text-amber-400 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[2px_2px_0px_#000]">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>ADVERTISEMENT · NEW GAME MODE</span>
        </div>

        {/* Top-Right Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-black hover:bg-neutral-900 text-white border-2 border-white shadow-[2px_2px_0px_#000] focus-visible:ring-4 focus-visible:ring-amber-400 outline-none transition-transform active:scale-95"
          aria-label="Close Advertisement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ad Image Container */}
        <div className="relative w-full max-h-[55vh] md:max-h-[60vh] bg-black flex items-center justify-center overflow-hidden border-b-2 border-amber-400/40">
          <img
            src={imageSrc}
            alt="Punisher Mode Game Announcement"
            className="w-full h-auto object-contain max-h-[55vh] md:max-h-[60vh]"
          />
        </div>

        {/* Action Buttons Section */}
        <div className="p-3 sm:p-4 bg-neutral-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-black hover:bg-neutral-900 text-white border-2 border-neutral-400 hover:border-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
          >
            Explore Other Game Modes
          </button>
          <button
            onClick={handleFightPunishers}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-amber-400 text-black border-2 border-black text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
          >
            Fight Punishers
          </button>
        </div>
      </div>
    </div>
  );
};

