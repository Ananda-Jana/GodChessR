import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChestSvg } from './ChestSvg';
import { RewardCard } from './RewardCard';
import { GemRewardCard } from './GemRewardCard';
import { SecretPlayerRewardDef } from './chestConfig';
import { pickRandomReward, unlockSecretPlayer, recordClaimedReward, PickedRewardResult } from './chestStore';
import { addGems } from '../economy/mugenStore';
import { MugenGemIcon } from '../economy/MugenGemIcon';
import { X, Sparkles, ShieldAlert } from 'lucide-react';
import './chest.css';

interface ChestModalProps {
  isOpen: boolean;
  result: 'win' | 'loss';
  resigned?: boolean;
  matchId?: string;
  initialEloBoost?: number;
  onApplyEloBoost?: (boost: number, matchId?: string) => void;
  onClose: (wasOpened: boolean) => void;
  onPlaySecretPlayer: (reward: SecretPlayerRewardDef) => void;
  userId?: string;
}

interface Particle {
  id: number;
  tx: number;
  ty: number;
  shape: 'star' | 'square' | 'glint';
  color: string;
}

function playChestSound(type: 'tap1' | 'tap2' | 'burst' | 'card') {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'tap1') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'tap2') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else if (type === 'burst') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } else if (type === 'card') {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.26);
      });
    }
  } catch {
    // Fail silently
  }
}

export const ChestModal: React.FC<ChestModalProps> = ({
  isOpen,
  result,
  resigned = false,
  matchId,
  initialEloBoost,
  onApplyEloBoost,
  onClose,
  onPlaySecretPlayer,
  userId,
}) => {
  const [tapCount, setTapCount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isWindup, setIsWindup] = useState<boolean>(false);
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [showShockwave, setShowShockwave] = useState<boolean>(false);
  const [showCard, setShowCard] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [rewardResult, setRewardResult] = useState<PickedRewardResult | null>(null);
  const [gemsAwarded, setGemsAwarded] = useState<number>(0);
  const [resignedEloBoost, setResignedEloBoost] = useState<number>(() => {
    return initialEloBoost && initialEloBoost >= 6 && initialEloBoost <= 10
      ? initialEloBoost
      : Math.floor(Math.random() * 5) + 6;
  });

  const queuedTapRef = useRef<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const chestButtonRef = useRef<HTMLButtonElement>(null);

  const isWin = result === 'win' && !resigned;

  // Lock page body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Focus management & Escape key trap
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      chestButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(isOpened);
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isOpened, onClose]);

  // Generate particles
  const spawnParticles = (count: number, shapes: ('star' | 'square' | 'glint')[]) => {
    const palette = resigned
      ? ['#78716c', '#a8a29e', '#ef4444', '#44403c', '#d6d3d1']
      : [
          '#fde047',
          '#fb923c',
          '#ffffff',
          '#fbbf24',
          '#818cf8',
          '#6d28d9',
          '#38bdf8',
          '#2727F5',
        ];
    const newItems: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.PI / 4 + Math.random() * (Math.PI / 2);
      const distance = 40 + Math.random() * 85;
      const tx = Math.cos(angle) * distance * (Math.random() > 0.5 ? 1 : -1);
      const ty = -Math.sin(angle) * distance;
      newItems.push({
        id: Date.now() + i,
        tx,
        ty,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }
    setParticles((prev) => [...prev.slice(-15), ...newItems]);
  };

  const executeTap = useCallback(
    (targetTap: number) => {
      if (targetTap === 1) {
        if (navigator.vibrate) navigator.vibrate(40);
        setIsAnimating(true);
        setTapCount(1);
        playChestSound('tap1');
        spawnParticles(4, ['square', 'glint']);
        setTimeout(() => {
          setIsAnimating(false);
          if (queuedTapRef.current) {
            queuedTapRef.current = false;
            executeTap(2);
          }
        }, 360);
      } else if (targetTap === 2) {
        if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
        setIsAnimating(true);
        setTapCount(2);
        playChestSound('tap2');
        spawnParticles(8, ['square', 'glint', 'star']);
        setTimeout(() => {
          setIsAnimating(false);
          if (queuedTapRef.current) {
            queuedTapRef.current = false;
            executeTap(3);
          }
        }, 460);
      } else if (targetTap === 3) {
        if (navigator.vibrate) navigator.vibrate([60, 30, 60, 30, 120]);
        setIsAnimating(true);
        setTapCount(3);
        setIsWindup(true);

        // Mutually exclusive randomized reward (50% chance for Secret Player Card, 50% chance for Mugen Gems)
        const isGemDrop = Math.random() < 0.5;

        if (isGemDrop) {
          const randomGems = isWin
            ? Math.floor(Math.random() * 201) + 500
            : Math.floor(Math.random() * 151) + 50;

          setGemsAwarded(randomGems);
          setRewardResult(null);
          addGems(userId || 'guest', randomGems);

          recordClaimedReward(
            {
              id: 'gem_loot_payout',
              name: `${randomGems} Mugen Gems`,
              role: 'Currency Loot',
              title: 'Vault Payout',
              rarity: 'Rare',
              avatarUrl: '/assets/aistudio/image_93cd5708.png',
              quote: 'Gleaming crystals of pure combat resonance.',
              flavor: `Awarded +${randomGems} Mugen Gems directly to your wallet.`,
            },
            true,
            matchId,
            undefined,
            userId
          );
        } else {
          setGemsAwarded(0);
          if (!resigned) {
            const picked = pickRandomReward(userId);
            setRewardResult(picked);
            unlockSecretPlayer(picked.reward.id, userId);
            recordClaimedReward(picked.reward, picked.isOwned, matchId, undefined, userId);
          } else {
            const delta = resignedEloBoost;
            if (matchId && onApplyEloBoost) {
              try {
                onApplyEloBoost(delta, matchId);
              } catch {
                // Fail safe
              }
            }
            recordClaimedReward(
              {
                id: 'elo_consolation',
                name: 'Resilience Spirit',
                role: 'Tactical Grit',
                title: 'Resilience Honor',
                rarity: 'Common',
                avatarUrl: '/assets/aistudio/image_4aa74391.png',
                quote: 'Honor remains in standing tall through defeat.',
                flavor: `Awarded +${delta} ELO rating boost.`,
              },
              true,
              matchId,
              delta,
              userId
            );
          }
        }

        setTimeout(() => {
          setIsWindup(false);
          setIsOpened(true);
          setShowFlash(true);
          setShowShockwave(true);
          playChestSound('burst');
          spawnParticles(resigned ? 8 : 16, ['star', 'square', 'glint']);

          setTimeout(() => setShowFlash(false), 140);
          setTimeout(() => setShowShockwave(false), 460);

          setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 200]);
            setShowCard(true);
            playChestSound('card');

            setTimeout(() => {
              setShowButtons(true);
              setIsAnimating(false);
            }, 650);
          }, 200);
        }, 120);
      }
    },
    [userId, resigned, matchId, onApplyEloBoost, resignedEloBoost]
  );

  const handleChestTap = () => {
    if (isOpened) return;

    if (isAnimating) {
      queuedTapRef.current = true;
      return;
    }

    const nextTap = tapCount + 1;
    if (nextTap <= 3) {
      executeTap(nextTap);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Reward chest"
      className="chest-backdrop-overlay"
    >
      <div className="chest-panel-container">
        {/* Background FX Layer */}
        <div className="chest-bg-layer" aria-hidden="true">
          <div className={`chest-sunburst ${tapCount >= 2 ? 'chest-sunburst-fast' : ''}`}>
            <svg viewBox="0 0 600 600" className="w-full h-full">
              <g transform="translate(300, 300)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <path
                    key={i}
                    d="M 0 0 L -25 -300 L 25 -300 Z"
                    transform={`rotate(${i * 30})`}
                    fill={
                      resigned
                        ? 'rgba(120, 113, 108, 0.08)'
                        : isWin
                        ? 'rgba(253, 224, 71, 0.12)'
                        : 'rgba(147, 197, 253, 0.10)'
                    }
                  />
                ))}
              </g>
            </svg>
          </div>

          <div className="chest-aura-wrapper">
            <div
              className={`chest-aura-inner ${
                resigned ? 'chest-aura-inner-resigned' : tapCount >= 2 ? 'chest-aura-fast' : ''
              }`}
            />
          </div>

          {!resigned && (
            <div
              className={`chest-warm-glow ${
                tapCount === 1
                  ? 'chest-warm-glow-tap1'
                  : tapCount >= 2
                  ? 'chest-warm-glow-tap2'
                  : ''
              }`}
            />
          )}
        </div>

        {showFlash && <div className="chest-flash" aria-hidden="true" />}

        {/* Header */}
        <div className="w-full flex items-center justify-between z-20 shrink-0">
          <div className="h-9 flex items-center">
            <h2
              className={`text-base sm:text-lg font-black uppercase tracking-widest text-center drop-shadow-[2px_2px_0px_#000000] ${
                resigned ? 'text-slate-400' : 'text-[#fde68a]'
              }`}
            >
              {resigned
                ? 'RESIGNED CHEST'
                : isWin
                ? 'VICTORY CHEST'
                : 'CONSOLATION CHEST'}
            </h2>
          </div>

          <button
            onClick={() => onClose(isOpened)}
            className="w-11 h-11 bg-[#111827] text-white border-2 border-white/60 hover:border-white shadow-[2px_2px_0px_#000000] flex items-center justify-center cursor-pointer active:translate-x-0.5 active:translate-y-0.5 z-30 transition-colors"
            aria-label="Close chest modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Chest Stage */}
        <div className="relative w-[260px] h-[220px] md:w-[240px] md:h-[210px] flex items-center justify-center my-auto z-20">
          {showShockwave && <div className="chest-shockwave" aria-hidden="true" />}

          {particles.map((p) => (
            <div
              key={p.id}
              className="chest-particle"
              style={
                {
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  backgroundColor: p.color,
                  width: p.shape === 'glint' ? '7px' : '5px',
                  height: p.shape === 'glint' ? '7px' : '5px',
                  transform: p.shape === 'glint' ? 'rotate(45deg)' : 'none',
                } as React.CSSProperties
              }
              aria-hidden="true"
            />
          ))}

          <button
            ref={chestButtonRef}
            onClick={handleChestTap}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleChestTap();
              }
            }}
            disabled={isOpened}
            aria-label="Tap to open the chest"
            className={`w-[240px] h-[200px] bg-transparent border-none p-0 outline-none flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
              isOpened ? 'opacity-70 pointer-events-none' : ''
            } ${
              tapCount === 0 && !isOpened
                ? 'chest-float'
                : isWindup
                ? 'chest-anim-windup'
                : tapCount === 1 && isAnimating
                ? 'chest-anim-tap1'
                : tapCount === 2 && isAnimating
                ? 'chest-anim-tap2'
                : ''
            }`}
          >
            <ChestSvg
              isWin={isWin}
              tapCount={tapCount}
              isOpened={isOpened}
              isWindup={isWindup}
              isResigned={resigned}
            />
          </button>

          {/* Emergence Panel: Single Exclusive Reward Reveal */}
          {showCard && (
            <div className="absolute z-30 chest-card-rise pointer-events-auto flex items-center justify-center max-w-full px-2">
              {gemsAwarded > 0 ? (
                <GemRewardCard amount={gemsAwarded} />
              ) : !resigned && rewardResult ? (
                <RewardCard
                  reward={rewardResult.reward}
                  isOwned={rewardResult.isOwned}
                  onPlay={() => {
                    onPlaySecretPlayer(rewardResult.reward);
                  }}
                />
              ) : (
                /* Resign Outcome Card */
                <div className="w-[148px] h-[236px] min-w-[148px] min-h-[236px] max-360:w-[128px] max-360:h-[208px] rounded-[14px] bg-[#1a0f0f] border-[3px] border-[#ef4444] shadow-[4px_4px_0px_#000000] p-2.5 flex flex-col justify-between items-center text-center select-none box-border">
                  <div className="text-[9px] font-black uppercase text-[#ef4444] tracking-wider leading-none pt-0.5">
                    RATING BOOST
                  </div>

                  <div className="my-auto flex flex-col items-center justify-center">
                    <span className="font-black text-[32px] leading-none text-[#ef4444] drop-shadow-md tracking-tight">
                      +{resignedEloBoost} ELO
                    </span>
                  </div>

                  <div className="text-[8px] font-black uppercase text-slate-300 tracking-wider leading-tight px-1 mb-1">
                    RESIGNATION CONSOLATION
                  </div>

                  <div className="w-full">
                    <button
                      type="button"
                      onClick={() => onClose(true)}
                      className="w-full h-[32px] bg-neutral-900 hover:bg-neutral-800 text-slate-200 hover:text-white font-black text-[11px] uppercase rounded-[8px] border border-slate-700 shadow-[2px_2px_0px_#000000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      CONTINUE
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="w-full flex flex-col items-center justify-center z-20 shrink-0 mb-2">
          <div className="h-7 flex items-center justify-center">
            {isOpened ? (
              <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 animate-in fade-in zoom-in-90 duration-300">
                {!resigned && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                <span>
                  {resigned
                    ? 'RATING BOOST AWARDED'
                    : rewardResult?.isOwned
                    ? 'SECRET PLAYER CARD REVEALED!'
                    : 'NEW SECRET PLAYER UNLOCKED!'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-3.5 h-3.5 border-2 border-black transition-colors ${
                      tapCount >= num
                        ? resigned
                          ? 'bg-[#ef4444]'
                          : 'bg-[#fbbf24]'
                        : 'bg-[#374151]'
                    }`}
                    style={{ borderRadius: 0 }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="h-13 flex items-center justify-center w-full mt-1.5">
            {!isOpened ? (
              <p
                className={`text-xs font-black uppercase tracking-widest chest-pulse ${
                  resigned ? 'text-red-400' : 'text-[#fde68a]'
                }`}
              >
                {tapCount === 0
                  ? 'TAP THE CHEST'
                  : tapCount === 1
                  ? 'TAP 1/3'
                  : 'TAP 2/3'}
              </p>
            ) : (
              showButtons &&
              !resigned && (
                <div className="flex items-center justify-center gap-3 w-full animate-in fade-in duration-300">
                  <button
                    onClick={() => onClose(true)}
                    className="h-11 px-7 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 hover:text-white bg-[#111827] border-2 border-slate-400 hover:border-white shadow-[3px_3px_0px_#000000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-colors"
                    style={{ borderRadius: 0 }}
                  >
                    CONTINUE
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
