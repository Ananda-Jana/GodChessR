import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { useModalFocus } from '../utils/useModalFocus';

const CullingTheoryView = lazy(() => import('./CullingTheoryView'));

interface CullingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CullingRulesModal: React.FC<CullingRulesModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useModalFocus(isOpen, onClose, true);
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex flex-col animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Culling Game Theory Book"
        className="flex-1 flex flex-col animate-in slide-in-from-bottom-4 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center text-white font-mono text-xs font-bold gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span>Loading Culling Theory Book...</span>
            </div>
          }
        >
          <CullingTheoryView onBack={onClose} />
        </Suspense>
      </div>
    </div>
  );
};

