import React from 'react';
import { Flame } from 'lucide-react';
import { TRAINER_PROFILES } from '../training/data';
import type { TrainerId } from '../training/types';

interface HashiraTrainingCardProps {
  onOpenHashiraTraining?: (trainerId: TrainerId) => void;
}

const FireEffect: React.FC<{ offset?: number }> = ({ offset = 0 }) => {
  const getDelay = (base: number) => `${base + offset}s`;
  
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bot-fire-bg" style={{ animationDelay: getDelay(0) }} />
      <div className="absolute inset-0 bot-fire-edge" style={{ animationDelay: getDelay(0) }} />
      <div className="absolute -bottom-8 left-[10%] w-48 h-36 rounded-full bot-flame-blob-1" style={{ animationDelay: getDelay(0) }} />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full bot-flame-blob-2" style={{ animationDelay: getDelay(0.6) }} />
      <div className="absolute -bottom-8 right-[10%] w-52 h-36 rounded-full bot-flame-blob-3" style={{ animationDelay: getDelay(1.2) }} />

      <div className="absolute bottom-1 left-[12%] w-1.5 h-1.5 rounded-full bg-amber-200 bot-ember-1" style={{ animationDelay: getDelay(0.1) }} />
      <div className="absolute bottom-2 left-[28%] w-1 h-1 rounded-full bg-yellow-300 bot-ember-2" style={{ animationDelay: getDelay(0.7) }} />
      <div className="absolute bottom-1 left-[45%] w-2 h-2 rounded-full bg-orange-300 bot-ember-3" style={{ animationDelay: getDelay(1.3) }} />
      <div className="absolute bottom-2 left-[62%] w-1.5 h-1.5 rounded-full bg-amber-300 bot-ember-4" style={{ animationDelay: getDelay(0.4) }} />
      <div className="absolute bottom-1 left-[78%] w-1 h-1 rounded-full bg-yellow-200 bot-ember-5" style={{ animationDelay: getDelay(1.8) }} />
      <div className="absolute bottom-2 left-[90%] w-2 h-2 rounded-full bg-orange-400 bot-ember-6" style={{ animationDelay: getDelay(0.9) }} />
    </div>
  );
};

export const HashiraTrainingCard: React.FC<HashiraTrainingCardProps> = ({ onOpenHashiraTraining }) => {
  return (
    <>
      <style>{`
        .hashira-dojos-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .hashira-header {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #f59e0b;
        }

        .hashira-buttons-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .hashira-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 8px;
          border-radius: 12px;
          background: #ea580c;
          border: 1px solid rgba(255, 255, 255, 0.22);
          transition: filter 0.25s ease;
          min-height: 58px;
        }

        @keyframes fireFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes flameRise {
          0% { transform: translateY(20%) scaleY(0.95) scaleX(0.98); opacity: 0.6; }
          25% { transform: translateY(-12%) scaleY(1.15) scaleX(1.05) translateX(-6px); opacity: 0.9; }
          50% { transform: translateY(8%) scaleY(0.9) scaleX(0.95) translateX(5px); opacity: 0.65; }
          75% { transform: translateY(-16%) scaleY(1.2) scaleX(0.92) translateX(-3px); opacity: 0.95; }
          100% { transform: translateY(20%) scaleY(0.95) scaleX(0.98); opacity: 0.6; }
        }

        @keyframes emberFloat {
          0% { transform: translateY(30px) translateX(0) scale(1); opacity: 0; }
          20% { opacity: 0.95; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-90px) translateX(14px) scale(0.2); opacity: 0; }
        }

        @keyframes heatPulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), 0 0 16px rgba(249,115,22,0.5); }
          50% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), 0 0 32px rgba(253,224,71,0.85), inset 0 0 24px rgba(234,88,12,0.4); }
        }

        @keyframes edgeFlicker {
          0%, 100% { opacity: 0.4; }
          12% { opacity: 0.9; }
          27% { opacity: 0.35; }
          41% { opacity: 0.95; }
          63% { opacity: 0.5; }
          80% { opacity: 0.85; }
        }

        .bot-fire-bg {
          background: linear-gradient(115deg, #dc2626 0%, #ea580c 25%, #f97316 50%, #f59e0b 75%, #fde047 100%);
          background-size: 300% 300%;
          animation: fireFlow 6.5s ease-in-out infinite;
          will-change: background-position;
        }

        .bot-fire-edge {
          box-shadow: inset 0 3px 12px rgba(255, 255, 255, 0.6), inset 0 -3px 12px rgba(220, 38, 38, 0.8);
          animation: edgeFlicker 1.8s infinite linear;
          will-change: opacity;
        }

        .bot-flame-blob-1 {
          background: radial-gradient(circle, rgba(253,224,71,0.85) 0%, rgba(249,115,22,0.6) 50%, transparent 80%);
          filter: blur(14px);
          mix-blend-mode: overlay;
          animation: flameRise 3.2s infinite ease-in-out;
          will-change: transform, opacity;
        }

        .bot-flame-blob-2 {
          background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,146,60,0.7) 45%, transparent 75%);
          filter: blur(16px);
          mix-blend-mode: screen;
          animation: flameRise 4.5s infinite ease-in-out 0.6s;
          will-change: transform, opacity;
        }

        .bot-flame-blob-3 {
          background: radial-gradient(circle, rgba(253,224,71,0.8) 0%, rgba(234,88,12,0.65) 55%, transparent 80%);
          filter: blur(14px);
          mix-blend-mode: overlay;
          animation: flameRise 5.2s infinite ease-in-out 1.2s;
          will-change: transform, opacity;
        }

        .bot-ember-1 { animation: emberFloat 2.8s infinite ease-out 0.1s; will-change: transform, opacity; }
        .bot-ember-2 { animation: emberFloat 3.6s infinite ease-out 0.7s; will-change: transform, opacity; }
        .bot-ember-3 { animation: emberFloat 2.4s infinite ease-out 1.3s; will-change: transform, opacity; }
        .bot-ember-4 { animation: emberFloat 4.1s infinite ease-out 0.4s; will-change: transform, opacity; }
        .bot-ember-5 { animation: emberFloat 3.1s infinite ease-out 1.8s; will-change: transform, opacity; }
        .bot-ember-6 { animation: emberFloat 2.6s infinite ease-out 0.9s; will-change: transform, opacity; }

        .hashira-avatar-mobile,
        .hashira-avatar-desktop,
        .hashira-content-wrap,
        .hashira-chevron {
          position: relative;
          z-index: 2;
        }

        .hashira-avatar-mobile {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .hashira-avatar-desktop {
          display: none;
        }

        .hashira-title {
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
        }

        .hashira-subtitle {
          display: none;
        }

        .hashira-chevron {
          display: none;
        }

        .hashira-btn-thukuna {
          animation: heatPulse 2.5s infinite ease-in-out;
        }

        .hashira-btn-gatoru {
          animation: heatPulse 2.5s infinite ease-in-out -1.25s;
        }

        .hashira-btn:hover {
          filter: brightness(1.15);
        }

        .hashira-btn:active {
          filter: brightness(0.92);
        }

        .hashira-btn:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 2px;
        }

        @media (min-width: 640px) {
          .hashira-buttons-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .hashira-btn {
            height: 72px;
            width: 100%;
            padding: 12px 14px;
            border-radius: 18px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            text-align: left;
            gap: 12px;
            aspect-ratio: auto;
            min-height: auto;
          }

          .hashira-avatar-mobile {
            display: none;
          }

          .hashira-avatar-desktop {
            display: block;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            object-fit: cover;
            border: 1px solid rgba(255, 255, 255, 0.3);
            flex-shrink: 0;
          }

          .hashira-content-wrap {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
          }

          .hashira-title {
            font-size: 15px;
            font-weight: 600;
            color: #fff;
          }

          .hashira-subtitle {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.65);
            margin-top: 1px;
            white-space: normal;
            text-overflow: clip;
            text-shadow: 0 1px 2px rgba(0,0,0,0.4);
          }

          .hashira-chevron {
            display: block;
            font-size: 18px;
            color: rgba(255, 255, 255, 0.5);
            flex-shrink: 0;
            margin-left: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hashira-btn, .bot-fire-bg, .bot-flame-blob-1, .bot-flame-blob-2, .bot-flame-blob-3, .bot-ember-1, .bot-ember-2, .bot-ember-3, .bot-ember-4, .bot-ember-5, .bot-ember-6, .bot-fire-edge {
            animation: none !important;
          }
          .bot-flame-blob-1, .bot-flame-blob-2, .bot-flame-blob-3, .bot-ember-1, .bot-ember-2, .bot-ember-3, .bot-ember-4, .bot-ember-5, .bot-ember-6 {
            display: none !important;
          }
          .bot-fire-bg {
             background: linear-gradient(115deg, #ea580c, #f59e0b, #fde047) !important;
          }
        }
      `}</style>

      <div className="hashira-dojos-card">
        <div className="hashira-header">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Hashira Training Dojos</span>
        </div>
        <div className="hashira-buttons-container">
          <button
            type="button"
            onClick={() => onOpenHashiraTraining && onOpenHashiraTraining('thukuna')}
            className="hashira-btn hashira-btn-thukuna"
            aria-label="Train with Thukuna"
          >
            <FireEffect />
            <img
              src={TRAINER_PROFILES.thukuna.avatarSrc}
              alt="Thukuna"
              className="hashira-avatar-mobile"
            />
            <img
              src={TRAINER_PROFILES.thukuna.avatarSrc}
              alt="Thukuna"
              className="hashira-avatar-desktop"
            />
            <div className="hashira-content-wrap">
              <span className="hashira-title">
                <span className="hidden sm:inline">Train with </span>Thukuna
              </span>
              <span className="hashira-subtitle">Plasma Hashira · Opening & Tactical</span>
            </div>
            <span className="hashira-chevron">›</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenHashiraTraining && onOpenHashiraTraining('gatoru')}
            className="hashira-btn hashira-btn-gatoru"
            aria-label="Train with Gatoru"
          >
            <FireEffect offset={-1.25} />
            <img
              src={TRAINER_PROFILES.gatoru.avatarSrc}
              alt="Gatoru"
              className="hashira-avatar-mobile"
            />
            <img
              src={TRAINER_PROFILES.gatoru.avatarSrc}
              alt="Gatoru"
              className="hashira-avatar-desktop"
            />
            <div className="hashira-content-wrap">
              <span className="hashira-title">
                <span className="hidden sm:inline">Train with </span>Gatoru
              </span>
              <span className="hashira-subtitle">Void Hashira · Six Eyes & Precision</span>
            </div>
            <span className="hashira-chevron">›</span>
          </button>
        </div>
      </div>
    </>
  );
};
