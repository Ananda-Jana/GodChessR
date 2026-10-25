import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  DiceState,
  PieceColor,
  PieceType,
  DICE_GRACE_WINDOW_MS,
  DICE_AUTOROLL_DELAY_MS,
} from '../types/game';
import { Dices, Sparkles, AlertCircle, Clock } from 'lucide-react';

const PIECE_DISPLAY_LABELS: Record<PieceType, string> = {
  knight: 'KNIGHT',
  bishop: 'BISHOP',
  priest: 'PRIEST',
  communist: 'COMMUNIST',
  rook: 'ROOK',
  supremeRook: 'SUP. ROOK',
  queen: 'QUEEN',
  prince: 'PRINCE',
  king: 'KING',
  pawn: 'PAWN',
};

const DISPLAY_PRIORITY: PieceType[] = [
  'knight',
  'bishop',
  'priest',
  'communist',
  'rook',
  'supremeRook',
  'queen',
  'prince',
  'king',
  'pawn',
];

export function formatEligiblePieceNames(
  dice: DiceState,
  availablePieceTypes?: PieceType[]
): string {
  if (dice.isFallbackAnyPiece) {
    return 'ANY PIECE (FREE PASS)';
  }

  const eligibleSet = new Set(dice.eligiblePieceTypes);
  const availableSet =
    availablePieceTypes && availablePieceTypes.length > 0
      ? new Set(availablePieceTypes)
      : null;

  const matched = DISPLAY_PRIORITY.filter(
    (pt) => eligibleSet.has(pt) && (!availableSet || availableSet.has(pt))
  );

  const finalTypes =
    matched.length > 0
      ? matched
      : dice.category === 'inexpensive'
      ? (['knight', 'bishop', 'pawn'] as PieceType[])
      : (['rook', 'queen', 'prince', 'king', 'pawn'] as PieceType[]);

  return finalTypes.map((pt) => PIECE_DISPLAY_LABELS[pt] || pt.toUpperCase()).join(' · ');
}

interface DiceRollerProps {
  dice: DiceState | null;
  isMyTurn: boolean;
  myColor: PieceColor;
  onRoll: () => void;
  disabled?: boolean;
  isInCheck?: boolean;
  turnStartTime?: number;
  diceActive?: boolean;
  variant?: 'stage' | 'panel';
  activeTurnColor?: PieceColor;
  isBotMatch?: boolean;
  isBotThinking?: boolean;
  isGameOver?: boolean;
  availablePieceTypes?: PieceType[];
  gameMode?: 'standard' | 'crafted' | 'classic';
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  dice,
  isMyTurn,
  myColor,
  onRoll,
  disabled = false,
  isInCheck = false,
  turnStartTime,
  diceActive = true,
  variant = 'panel',
  activeTurnColor,
  isBotMatch = false,
  isBotThinking = false,
  isGameOver = false,
  availablePieceTypes,
  gameMode,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const autoRollTriggeredRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mq.matches;
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      if (e.matches) setIsRolling(false);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Trigger ~300ms transform-only roll animation on new roll (skipped under prefers-reduced-motion)
  useEffect(() => {
    if (dice && diceActive && !prefersReducedMotionRef.current) {
      setIsRolling(true);
      const timer = setTimeout(() => setIsRolling(false), 300);
      return () => clearTimeout(timer);
    }
    setIsRolling(false);
  }, [dice?.rolledAt, diceActive]);

  const hasRolled = Boolean(dice && !dice.isConsumed);

  // Reset auto-roll trigger on turn or dice state change
  useEffect(() => {
    autoRollTriggeredRef.current = false;
    setSecondsElapsed(0);
  }, [turnStartTime, isMyTurn, hasRolled, diceActive]);

  // Active countdown ticker for dice roll phase
  useEffect(() => {
    if (!diceActive || !isMyTurn || hasRolled || isInCheck || disabled || isGameOver) {
      setSecondsElapsed(0);
      return;
    }

    const start = turnStartTime || Date.now();
    const tick = () => {
      const elapsed = Math.max(0, (Date.now() - start) / 1000);
      setSecondsElapsed(elapsed);

      // Automatically roll dice after grace + warning window
      if (elapsed >= DICE_AUTOROLL_DELAY_MS / 1000 && !autoRollTriggeredRef.current) {
        autoRollTriggeredRef.current = true;
        onRoll();
      }
    };

    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [diceActive, isMyTurn, hasRolled, isInCheck, disabled, isGameOver, turnStartTime, onRoll]);

  const handleRollClick = () => {
    if (disabled || isGameOver || !diceActive || !isMyTurn || hasRolled || isInCheck) return;
    if (!prefersReducedMotionRef.current) {
      setIsRolling(true);
    }
    onRoll();
  };

  const currentVal = dice?.rolledValue || 1;

  const pieceNamesText = useMemo(() => {
    if (!dice) return '';
    return formatEligiblePieceNames(dice, availablePieceTypes);
  }, [dice, availablePieceTypes]);

  const effectiveTurnColor: PieceColor =
    activeTurnColor || (isMyTurn ? myColor : myColor === 'white' ? 'black' : 'white');
  const turnColorLabel = effectiveTurnColor === 'white' ? 'WHITE' : 'BLACK';

  // Dice dot coordinates (rounded-full preserved on geometric dots when permitted, sharp contrast otherwise)
  const renderDots = (value: number) => {
    switch (value) {
      case 1:
        return <div className="w-2.5 h-2.5 bg-black rounded-full" />;
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full self-end" />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full self-center" />
            <div className="w-2 h-2 bg-black rounded-full self-end" />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-2 p-1.5 w-full h-full">
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full justify-self-end" />
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full justify-self-end" />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-1.5">
            <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-black rounded-full" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full" />
            <div className="absolute bottom-1.5 left-1.5 w-2 h-2 bg-black rounded-full" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-black rounded-full" />
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 p-1 w-full h-full">
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full justify-self-end" />
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full justify-self-end" />
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full justify-self-end" />
          </div>
        );
      default:
        return null;
    }
  };

  // --- POST-DICE PHASE STATUS PANEL (Both Mobile Stage & Desktop Side Panel) ---
  if (!diceActive) {
    const turnSummary = isGameOver
      ? 'MATCH COMPLETED'
      : isMyTurn
      ? isInCheck
        ? `YOUR TURN (${turnColorLabel}) · IN CHECK!`
        : `YOUR TURN (${turnColorLabel})`
      : isBotMatch && isBotThinking
      ? `BOT THINKING (${turnColorLabel}'S TURN)`
      : `WAITING FOR OPPONENT (${turnColorLabel}'S TURN)`;

    const isClassic = gameMode === 'classic';

    if (variant === 'stage') {
      return (
        <div
          role="region"
          aria-label="Chess phase status"
          className="w-full h-full bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white px-3 py-2 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] flex items-center justify-between gap-2.5 overflow-hidden"
        >
          <div className="w-11 h-11 shrink-0 bg-amber-400 text-black border-3 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <span className="text-xs font-black uppercase tracking-tight text-black dark:text-white truncate">
              {isClassic ? 'TRADITIONAL CHESS (NO PRINCE)' : 'NORMAL CHESS - dice phase over'}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-black uppercase text-amber-600 dark:text-amber-400 truncate">
              <span
                aria-hidden="true"
                className={`w-2.5 h-2.5 shrink-0 ${
                  effectiveTurnColor === 'white'
                    ? 'bg-white border border-black'
                    : 'bg-black border border-white'
                }`}
              />
              <span className="truncate">{turnSummary}</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-600 dark:text-neutral-400 uppercase truncate">
              {isClassic
                ? 'Standard FIDE rules · Pure deterministic moves'
                : '3+ captures reached · All legal moves active'}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        role="region"
        aria-label="Chess phase status"
        className="w-full bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
            {isClassic ? 'TRADITIONAL CHESS (NO PRINCE)' : 'NORMAL CHESS - dice phase over'}
          </span>
          <span className="text-[10px] font-mono font-black uppercase text-amber-600 dark:text-amber-400">
            {isClassic ? 'NO DICE' : '3+ CAPTURES'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white px-3 py-2.5">
          <span
            aria-hidden="true"
            className={`w-3 h-3 shrink-0 ${
              effectiveTurnColor === 'white'
                ? 'bg-white border border-black'
                : 'bg-black border border-white'
            }`}
          />
          <span className="text-xs font-mono font-black uppercase text-black dark:text-white truncate">
            {turnSummary}
          </span>
        </div>

        <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 leading-snug">
          {isClassic
            ? 'Authentic classical FIDE rules active. No prince piece, no dice rolls, no crafting perks. Move any legal piece directly.'
            : '3 captures reached — dice restrictions are permanently off. Move any legal piece directly.'}
        </p>
      </div>
    );
  }

  // --- ACTIVE DICE PHASE ---
  const graceLimitSec = DICE_GRACE_WINDOW_MS / 1000;
  const autoRollSec = DICE_AUTOROLL_DELAY_MS / 1000;
  const isWarningPhase =
    isMyTurn && !hasRolled && !isInCheck && !isGameOver && secondsElapsed >= graceLimitSec && secondsElapsed < autoRollSec;
  const isGracePhase =
    isMyTurn && !hasRolled && !isInCheck && !isGameOver && secondsElapsed < graceLimitSec;
  const warningSeconds = Math.max(1, Math.ceil(autoRollSec - secondsElapsed));
  const graceSeconds = Math.max(1, Math.ceil(graceLimitSec - secondsElapsed));

  const canRoll = !disabled && !isGameOver && isMyTurn && !hasRolled && !isInCheck && !isRolling;

  // --- MOBILE FIXED-HEIGHT DICE STAGE ---
  if (variant === 'stage') {
    return (
      <div
        role="region"
        aria-label="Dice stage"
        className="w-full h-full bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white px-2.5 py-2 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] flex items-center justify-between gap-2 overflow-hidden"
      >
        {/* Die Face (transform-only 300ms animation) */}
        <div
          aria-label={`Die showing ${currentVal}`}
          className={`w-12 h-12 bg-white border-3 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] transition-transform duration-300 motion-reduce:transition-none ${
            isRolling ? 'rotate-180 scale-105' : 'rotate-0 scale-100'
          }`}
        >
          {renderDots(currentVal)}
        </div>

        {/* Piece Names & Roll Status */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          {isInCheck && isMyTurn ? (
            <>
              <span className="text-xs font-black uppercase text-red-600 dark:text-red-400 truncate flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                CHECK! ESCAPE REQUIRED
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300 truncate">
                ANY LEGAL ESCAPE MOVE UNLOCKED
              </span>
            </>
          ) : hasRolled && dice ? (
            <>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-mono font-black bg-amber-400 text-black px-1 border border-black shrink-0 tabular-nums">
                  {dice.rolledValue}
                </span>
                <span className="text-[11px] font-black uppercase text-black dark:text-white leading-tight line-clamp-2">
                  {pieceNamesText}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 truncate">
                {dice.isFallbackAnyPiece
                  ? 'NO CATEGORY MOVES · ALL PIECES FREE'
                  : isMyTurn
                  ? 'SELECT ELIGIBLE PIECE ON BOARD'
                  : 'OPPONENT SELECTING MOVE'}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-black uppercase text-black dark:text-white truncate">
                {isGameOver
                  ? 'MATCH ENDED'
                  : isMyTurn
                  ? 'ROLL TO UNLOCK PIECES'
                  : isBotMatch && isBotThinking
                  ? 'BOT ROLLING DIE...'
                  : 'OPPONENT TURN TO ROLL'}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 truncate tabular-nums">
                {isGameOver
                  ? 'FINAL BOARD STATE'
                  : isMyTurn
                  ? isGracePhase
                    ? `CLOCK PAUSED · ${graceSeconds}S FREE`
                    : isWarningPhase
                    ? `AUTO-ROLL IN ${warningSeconds}S`
                    : 'ROLL REQUIRED BEFORE MOVE'
                  : 'WAITING FOR OPPONENT'}
              </span>
            </>
          )}
        </div>

        {/* Roll / Disabled Reason Button (>= 44px touch target) */}
        <button
          type="button"
          onClick={handleRollClick}
          disabled={!canRoll}
          aria-label={
            canRoll
              ? 'Roll dice'
              : !isMyTurn && !isGameOver
              ? 'Roll dice disabled: waiting for opponent'
              : undefined
          }
          className={`min-h-[48px] min-w-[104px] max-w-[132px] px-2.5 shrink-0 border-3 font-black uppercase flex flex-col items-center justify-center text-center transition-transform duration-100 motion-reduce:transition-none ${
            canRoll
              ? 'bg-amber-400 hover:bg-amber-300 text-black border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer'
              : 'bg-neutral-200 dark:bg-[#141416] text-neutral-700 dark:text-neutral-300 border-black dark:border-white cursor-not-allowed'
          }`}
        >
          {canRoll ? (
            <>
              <span className="text-[11px] leading-tight flex items-center gap-1 whitespace-nowrap">
                <Dices className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                ROLL DICE
              </span>
              {isGracePhase && (
                <span className="text-[9px] font-mono font-black leading-none mt-0.5 tabular-nums">
                  {graceSeconds}S FREE
                </span>
              )}
              {isWarningPhase && (
                <span className="text-[9px] font-mono font-black text-red-900 leading-none mt-0.5 tabular-nums">
                  AUTO {warningSeconds}S
                </span>
              )}
            </>
          ) : isGameOver ? (
            <span className="text-[10px] font-mono leading-tight">MATCH OVER</span>
          ) : !isMyTurn ? (
            <span className="text-[9px] font-mono font-black leading-tight">
              WAITING FOR
              <br />
              OPPONENT
            </span>
          ) : isInCheck ? (
            <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 leading-tight">
              IN CHECK
              <br />
              MOVE PIECE
            </span>
          ) : (
            <span className="text-[9px] font-mono font-black text-amber-700 dark:text-amber-400 leading-tight">
              ROLLED {dice?.rolledValue}
              <br />
              MOVE PIECE
            </span>
          )}
        </button>
      </div>
    );
  }

  // --- DESKTOP SIDE-COLUMN PANEL ---
  return (
    <div
      role="region"
      aria-label="Dice phase controls"
      className="dark:bg-[#0a0a0c] bg-white dark:border-white border-black border-3 p-4 flex flex-col gap-3 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-wider dark:text-white text-black flex items-center gap-1.5">
          <Dices className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
          DICE PHASE
        </span>
        {dice?.probabilityMode === 'biased_late_game' && (
          <span className="text-[10px] font-mono font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
            LATE-GAME BIAS
          </span>
        )}
      </div>

      <div className="flex items-center gap-3.5 dark:bg-[#141416] bg-neutral-100 p-3 border-2 dark:border-white border-black">
        {/* Brutalist die face with 300ms transform-only roll */}
        <div
          aria-label={`Die showing ${currentVal}`}
          className={`w-12 h-12 bg-white border-3 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] transition-transform duration-300 motion-reduce:transition-none ${
            isRolling ? 'rotate-180 scale-105' : 'rotate-0 scale-100'
          }`}
        >
          {renderDots(currentVal)}
        </div>

        <div className="flex flex-col flex-1 min-w-0 gap-0.5">
          {hasRolled && dice ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black font-mono dark:text-white text-black tabular-nums shrink-0">
                  #{dice.rolledValue}
                </span>
                <span className="text-[11px] font-black uppercase dark:text-amber-400 text-amber-700 leading-tight">
                  {pieceNamesText}
                </span>
              </div>
              <p className="text-[11px] dark:text-neutral-300 text-neutral-700 font-bold uppercase truncate">
                {dice.category === 'inexpensive' ? 'Inexpensive Tier' : 'Expensive Tier'}
              </p>
            </>
          ) : (
            <>
              <span className="text-sm font-black uppercase dark:text-white text-black truncate">
                {isGameOver
                  ? 'Match ended'
                  : isMyTurn
                  ? 'Ready to roll'
                  : isBotMatch && isBotThinking
                  ? 'Bot thinking...'
                  : 'Opponent’s turn'}
              </span>
              <p className="text-xs dark:text-neutral-400 text-neutral-600 font-bold uppercase truncate tabular-nums">
                {isGameOver
                  ? 'Final board position'
                  : isMyTurn
                  ? isGracePhase
                    ? `Clock paused (${graceSeconds}s grace)`
                    : isWarningPhase
                    ? `Auto-rolling in ${warningSeconds}s`
                    : 'Roll required before moving'
                  : 'Waiting for opponent'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Check Defense notification */}
      {isInCheck && (
        <div className="bg-red-600 text-white border-3 border-black dark:border-white p-2.5 flex items-start gap-2 text-xs font-bold shadow-[2px_2px_0px_#000]">
          <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="block uppercase text-white font-black">King Under Attack!</strong>
            <span>Dice roll bypassed: select any legal check-escaping move on the board.</span>
          </div>
        </div>
      )}

      {/* Fallback notification if rolled category had 0 legal moves */}
      {hasRolled && !isInCheck && dice?.isFallbackAnyPiece && (
        <div className="bg-amber-400 text-black border-3 border-black p-2.5 flex items-start gap-2 text-xs font-black shadow-[2px_2px_0px_#000]">
          <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            NO MOVES FOR CATEGORY: Free pass applied — all legal moves unlocked!
          </span>
        </div>
      )}

      {/* Primary Action / Disabled Status Button (Always >= 44px height) */}
      <button
        type="button"
        onClick={handleRollClick}
        disabled={!canRoll}
        className={`w-full min-h-[46px] py-2.5 px-4 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-3 border-black dark:border-white transition-transform duration-100 motion-reduce:transition-none ${
          canRoll
            ? 'bg-amber-400 hover:bg-amber-300 active:translate-x-0.5 active:translate-y-0.5 text-black shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] cursor-pointer'
            : 'bg-neutral-200 dark:bg-[#141416] text-neutral-700 dark:text-neutral-300 cursor-not-allowed'
        }`}
      >
        {canRoll ? (
          <>
            <Dices className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">ROLL DICE</span>
            {isGracePhase && (
              <span className="text-[11px] font-mono font-black bg-black text-amber-400 px-1.5 py-0.5 border border-amber-400 tabular-nums whitespace-nowrap">
                {graceSeconds}S FREE
              </span>
            )}
            {isWarningPhase && (
              <span className="text-[11px] font-mono font-black bg-red-600 text-white px-2 py-0.5 border border-black flex items-center gap-1 tabular-nums whitespace-nowrap">
                <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                AUTO IN {warningSeconds}S
              </span>
            )}
          </>
        ) : isGameOver ? (
          <span>MATCH COMPLETED</span>
        ) : !isMyTurn ? (
          <span>WAITING FOR OPPONENT</span>
        ) : isInCheck ? (
          <span>CHECK DEFENSE — SELECT ESCAPE MOVE</span>
        ) : (
          <span>ROLLED #{dice?.rolledValue} — SELECT ELIGIBLE PIECE</span>
        )}
      </button>
    </div>
  );
};
