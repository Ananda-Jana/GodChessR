import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface PopupAdProps {
  imageSrc: string;
  onClose: () => void;
}

export const PopupAd: React.FC<PopupAdProps> = ({ imageSrc, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 20000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full bg-black border-4 border-white shadow-[8px_8px_0px_#ffffff]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 p-1 bg-white text-black border-2 border-black hover:bg-neutral-200 z-10"
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
