import React from 'react';

/**
 * LiveAnnouncer
 * 
 * A reusable component for accessibility announcements.
 * Provides 'polite' and 'assertive' aria-live regions.
 */
interface LiveAnnouncerProps {
  message: string;
  type?: 'polite' | 'assertive';
}

export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({ message, type = 'polite' }) => {
  return (
    <div
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};
