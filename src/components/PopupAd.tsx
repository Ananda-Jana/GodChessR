import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalFocus } from '../utils/useModalFocus';

interface PopupAdProps {
  imageSrc: string;
  onClose: () => void;
}

export const PopupAd: React.FC<PopupAdProps> = ({ imageSrc, onClose }) => {
  const modalRef = useModalFocus(true, onClose, true);

  useEffect(() => {
    const timer = setTimeout(onClose, 20000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Promotional announcement"
        className="relative max-w-sm w-full bg-black border-4 border-white shadow-[8px_8px_0px_#ffffff] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-6 -right-3 w-11 h-11 flex items-center justify-center bg-white text-black border-2 border-black hover:bg-neutral-200 z-10 focus-visible:ring-4 focus-visible:ring-amber-400 outline-none"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={imageSrc}
          alt="Advertisement"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};
