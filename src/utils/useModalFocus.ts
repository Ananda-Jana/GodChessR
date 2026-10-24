import { useEffect, useRef } from 'react';

/**
 * useModalFocus
 * 
 * A lightweight hook for focus trapping, scroll locking, and escape key handling.
 */
export function useModalFocus(isOpen: boolean, onClose: () => void, isDismissible: boolean = true) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus and lock scroll
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      // Focus the first focusable element inside the modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        // Escape key handling
        if (e.key === 'Escape' && isDismissible) {
          onClose();
        }

        // Tab key handling (Focus Trap)
        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as NodeListOf<HTMLElement>;
          
          if (focusable.length === 0) return;
          
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousFocus.current?.focus();
      };
    }
  }, [isOpen, onClose, isDismissible]);

  return modalRef;
}
