import React from 'react';
import { Flame, X } from 'lucide-react';
import { TRAINER_PROFILES } from '../training/data';
import type { TrainerId } from '../training/types';

export interface WalkWithMastersCardProps {
  onOpenHashiraTraining?: (trainerId: TrainerId) => void;
  onClose?: () => void;
  isModal?: boolean;
}

interface PerimeterLightStreakProps {
  offsetDelay?: number;
}

/**
 * PerimeterLightStreak renders an SVG-based continuous perimeter stroke
 * that accurately traces the rounded rectangle without rotating around the center.
 *
 * Specifications:
 * - Button Fill: #020203
 * - Faint Edge: #29212F (1.5px)
 * - Deep Violet Tail: #6D28D9
 * - Violet Highlight Body: #A855F7
 * - Main Light Tip: #F6E9FF
 * - Cycle: 2.5s traveling streak + 0.7s dormant pause (3.2s total)
 */
const PerimeterLightStreak: React.FC<PerimeterLightStreakProps> = ({ offsetDelay = 0 }) => {
  const delayStyle = offsetDelay ? { animationDelay: `${offsetDelay}s` } : undefined;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10 rounded-[8px]"
      fill="none"
      aria-hidden="true"
    >
      {/* Static faint edge border (1.5px) */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="8"
        stroke="#29212F"
        strokeWidth="1.5"
      />

      {/* Traveling Streak Layer 1: Deep Violet Tail (length 20) */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="8"
        pathLength="100"
        stroke="#6D28D9"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="streak-tail"
        style={delayStyle}
      />

      {/* Traveling Streak Layer 2: Violet Highlight Body (length 12) */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="8"
        pathLength="100"
        stroke="#A855F7"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="streak-body"
        style={delayStyle}
      />

      {/* Traveling Streak Layer 3: Main Light White-Lavender Leading Tip (length 4) */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="8"
        pathLength="100"
        stroke="#F6E9FF"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="streak-head"
        style={delayStyle}
      />
    </svg>
  );
};

export const WalkWithMastersCard: React.FC<WalkWithMastersCardProps> = ({
  onOpenHashiraTraining,
  onClose,
  isModal = false,
}) => {
  const handleSelect = (trainerId: TrainerId) => {
    if (onOpenHashiraTraining) {
      onOpenHashiraTraining(trainerId);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <style>{`
        .walk-with-masters-card {
          background: #141519;
          border: 1.5px solid #29212F;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .masters-header {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #F6E9FF;
        }

        .masters-buttons-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .masters-modal-container {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        .masters-btn {
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 10px 8px;
          border-radius: 8px;
          background: #020203;
          border: none;
          outline: none;
          transition: filter 0.2s ease, transform 0.15s ease;
          min-height: 60px;
        }

        .masters-btn:hover {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }

        .masters-btn:active {
          filter: brightness(0.95);
          transform: translateY(1px);
        }

        .masters-btn:focus-visible {
          outline: 2px solid #A855F7;
          outline-offset: 2px;
        }

        .masters-avatar-mobile,
        .masters-avatar-desktop,
        .masters-content-wrap,
        .masters-chevron {
          position: relative;
          z-index: 2;
        }

        .masters-avatar-mobile {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid #29212F;
          margin-bottom: 5px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }

        .masters-avatar-desktop {
          display: none;
        }

        .masters-title {
          font-size: 11px;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.2;
          letter-spacing: 0.01em;
        }

        .masters-subtitle {
          display: none;
        }

        .masters-chevron {
          display: none;
        }

        /* Modal or Desktop Expanded Layout */
        .masters-modal-btn {
          height: 72px !important;
          width: 100% !important;
          padding: 12px 16px !important;
          border-radius: 8px !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-start !important;
          text-align: left !important;
          gap: 14px !important;
          min-height: auto !important;
        }

        .masters-modal-btn .masters-avatar-mobile {
          display: none !important;
        }

        .masters-modal-btn .masters-avatar-desktop {
          display: block !important;
          width: 46px !important;
          height: 46px !important;
          border-radius: 8px !important;
          object-fit: cover !important;
          border: 1.5px solid #29212F !important;
          flex-shrink: 0 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6) !important;
        }

        .masters-modal-btn .masters-content-wrap {
          display: flex !important;
          flex-direction: column !important;
          flex: 1 !important;
          min-width: 0 !important;
        }

        .masters-modal-btn .masters-title {
          font-size: 14px !important;
          font-weight: 700 !important;
          color: #FFFFFF !important;
        }

        .masters-modal-btn .masters-subtitle {
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          font-size: 12px !important;
          color: #94A3B8 !important;
          margin-top: 2px !important;
          white-space: normal !important;
          text-overflow: clip !important;
        }

        .masters-modal-btn .masters-chevron {
          display: block !important;
          font-size: 18px !important;
          color: #A855F7 !important;
          flex-shrink: 0 !important;
          margin-left: auto !important;
          transition: transform 0.15s ease !important;
        }

        @media (min-width: 640px) {
          .masters-buttons-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .masters-btn {
            height: 72px;
            width: 100%;
            padding: 12px 16px;
            border-radius: 8px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            text-align: left;
            gap: 14px;
            aspect-ratio: auto;
            min-height: auto;
          }

          .masters-avatar-mobile {
            display: none;
          }

          .masters-avatar-desktop {
            display: block;
            width: 46px;
            height: 46px;
            border-radius: 8px;
            object-fit: cover;
            border: 1.5px solid #29212F;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
          }

          .masters-content-wrap {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
          }

          .masters-title {
            font-size: 14px;
            font-weight: 700;
            color: #FFFFFF;
          }

          .masters-subtitle {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 12px;
            color: #94A3B8;
            margin-top: 2px;
            white-space: normal;
            text-overflow: clip;
          }

          .masters-chevron {
            display: block;
            font-size: 18px;
            color: #A855F7;
            flex-shrink: 0;
            margin-left: auto;
            transition: transform 0.15s ease;
          }

          .masters-btn:hover .masters-chevron {
            transform: translateX(2px);
          }
        }
      `}</style>

      <div className="walk-with-masters-card">
        <div className="flex items-center justify-between mb-3">
          <div className="masters-header">
            <Flame className="w-4 h-4 text-[#A855F7] shrink-0" />
            <span>Walk with Masters</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Close Walk with Masters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className={`masters-buttons-container ${isModal ? 'masters-modal-container' : ''}`}>
          <button
            type="button"
            onClick={() => handleSelect('thukuna')}
            className={`masters-btn ${isModal ? 'masters-modal-btn' : ''}`}
            aria-label="Train with Thukuna"
          >
            <PerimeterLightStreak offsetDelay={0} />
            <img
              src={TRAINER_PROFILES.thukuna.avatarSrc}
              alt="Thukuna"
              className="masters-avatar-mobile"
            />
            <img
              src={TRAINER_PROFILES.thukuna.avatarSrc}
              alt="Thukuna"
              className="masters-avatar-desktop"
            />
            <div className="masters-content-wrap">
              <span className="masters-title">
                <span className={isModal ? 'inline' : 'hidden sm:inline'}>Train with </span>Thukuna
              </span>
              <span className="masters-subtitle">Plasma Hashira · Opening & Tactical</span>
            </div>
            <span className="masters-chevron">›</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('gatoru')}
            className={`masters-btn ${isModal ? 'masters-modal-btn' : ''}`}
            aria-label="Train with Gatoru"
          >
            <PerimeterLightStreak offsetDelay={-1.6} />
            <img
              src={TRAINER_PROFILES.gatoru.avatarSrc}
              alt="Gatoru"
              className="masters-avatar-mobile"
            />
            <img
              src={TRAINER_PROFILES.gatoru.avatarSrc}
              alt="Gatoru"
              className="masters-avatar-desktop"
            />
            <div className="masters-content-wrap">
              <span className="masters-title">
                <span className={isModal ? 'inline' : 'hidden sm:inline'}>Train with </span>Gatoru
              </span>
              <span className="masters-subtitle">Void Hashira · Six Eyes & Precision</span>
            </div>
            <span className="masters-chevron">›</span>
          </button>
        </div>
      </div>
    </>
  );
};

// Backwards-compatible alias so existing imports continue working smoothly
export const HashiraTrainingCard = WalkWithMastersCard;
export default WalkWithMastersCard;
