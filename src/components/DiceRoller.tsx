import React, { useState, useEffect, useRef } from 'react';
import {
  DiceState,
  PieceColor,
  DICE_GRACE_WINDOW_MS,
  DICE_WARNING_WINDOW_MS,
  DICE_AUTOROLL_DELAY_MS,
} from '../types/game';
import { Dices, Sparkles, AlertCircle, Clock } from 'lucide-react';

interface DiceRollerProps {
  dice: DiceState | null;
  isMyTurn: boolean;
  myColor: PieceColor;
  onRoll: () => void;
  disabled?: boolean;
  isInCheck?: boolean;
  turnStartTime?: number;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  dice,
  isMyTurn,
  onRoll,
  disabled = false,
  isInCheck = false,
  turnStartTime,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const autoRollTriggeredRef = useRef(false);

  // Trigger brief roll animation on new roll
  useEffect(() => {
    if (dice) {
      setIsRolling(true);
      const timer = setTimeout(() => setIsRolling(false), 350);
      return () => clearTimeout(timer);
    }
  }, [dice?.rolledAt]);

  const hasRolled = Boolean(dice && !dice.isConsumed);

  // Reset auto-roll trigger on turn or dice state change
  useEffect(() => {
    autoRollTriggeredRef.current = false;
    setSecondsElapsed(0);
  }, [turnStartTime, isMyTurn, hasRolled]);

  // Active countdown ticker for dice roll phase
  useEffect(() => {
    if (!isMyTurn || hasRolled || isInCheck || disabled) {
      setSecondsElapsed(0);
      return;
    }

    const start = turnStartTime || Date.now();
    const tick = () => {
      const elapsed = Math.max(0, (Date.now() - start) / 1000);
      setSecondsElapsed(elapsed);

      // Automatically roll dice after grace + warning window
      if (elapsed >= (DICE_AUTOROLL_DELAY_MS / 1000) && !autoRollTriggeredRef.current) {
        autoRollTriggeredRef.current = true;
        onRoll();
      }
    };

    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [isMyTurn, hasRolled, isInCheck, disabled, turnStartTime, onRoll]);

  const handleRollClick = () => {
    if (disabled || !isMyTurn || hasRolled) return;
    setIsRolling(true);
    onRoll();
  };

  const currentVal = dice?.rolledValue || 1;

  // Dice dot coordinates
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

  const graceLimitSec = DICE_GRACE_WINDOW_MS / 1000;
  const autoRollSec = DICE_AUTOROLL_DELAY_MS / 1000;
  const isWarningPhase = isMyTurn && !hasRolled && !isInCheck && secondsElapsed >= graceLimitSec && secondsElapsed < autoRollSec;
  const isGracePhase = isMyTurn && !hasRolled && !isInCheck && secondsElapsed < graceLimitSec;
  const warningSeconds = Math.max(1, Math.ceil(autoRollSec - secondsElapsed));
  const graceSeconds = Math.max(1, Math.ceil(graceLimitSec - secondsElapsed));

  return (
    <div className="dark:bg-[#0a0a0c] bg-white dark:border-white border-black border-3 p-4 flex flex-col gap-3 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider dark:text-white text-black flex items-center gap-1.5">
          <Dices className="w-4 h-4 text-amber-500" />
          DICE PHASE
        </span>
        {dice?.probabilityMode === 'biased_late_game' && (
          <span className="text-[11px] bg-amber-400 text-black px-1.5 py-0.5 border border-black font-black uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-black" />
            LATE-GAME BIAS
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 dark:bg-[#141416] bg-neutral-100 p-3 border-2 dark:border-white border-black">
        {/* Flat Brutalist dice face with 3D-style roll */}
        <div
          className={`w-12 h-12 bg-white border-3 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] transition-transform duration-300 motion-reduce:transition-none ${
            isRolling ? 'rotate-180 scale-110 -translate-y-1 shadow-[4px_4px_0px_#000]' : 'rotate-0 scale-100 translate-y-0'
          }`}
        >
          {renderDots(currentVal)}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          {hasRolled && dice ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-black font-mono dark:text-white text-black tabular-nums">
                  {dice.rolledValue}
                </span>
                <span className="text-[10px] bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 font-black uppercase border border-black dark:border-white">
                  {dice.category === 'inexpensive' ? 'KNIGHT/BISHOP/PAWN' : 'ROOK/QUEEN/KING/PRINCE/PAWN'}
                </span>
                <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 border border-black font-black uppercase">
                  {dice.category === 'inexpensive' ? 'Inexpensive' : 'Expensive'}
                </span>
              </div>
              <p className="text-xs dark:text-neutral-300 text-neutral-800 font-bold uppercase truncate">
                {dice.category === 'inexpensive'
                  ? 'Eligible: Knights, Bishops & Pawns'
                  : 'Eligible: Rooks, Queens, Princes, Kings & Pawns'}
              </p>
            </>
          ) : (
            <>
              <span className="text-sm font-black uppercase dark:text-white text-black">
                {isMyTurn ? 'Ready to roll' : 'Opponent’s turn to roll'}
              </span>
              <p className="text-xs dark:text-neutral-400 text-neutral-600 font-bold uppercase">
                {isGracePhase
                  ? `Clock paused (${graceSeconds}s grace)`
                  : isWarningPhase
                  ? 'Roll the dice! Auto-roll imminent'
                  : 'Roll required before piece can move'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Check Defense notification */}
      {isInCheck && (
        <div className="bg-red-500 text-white border-3 border-black dark:border-white p-2.5 flex items-start gap-2 text-xs font-bold shadow-[2px_2px_0px_#000]">
          <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <div>
            <strong className="block uppercase text-white font-black">King Under Attack!</strong>
            <span>Dice roll bypassed: move your King, capture the attacking piece, or block to escape check.</span>
          </div>
        </div>
      )}

      {/* Fallback notification if rolled category had 0 legal moves */}
      {hasRolled && !isInCheck && dice?.isFallbackAnyPiece && (
        <div className="bg-amber-400 text-black border-3 border-black p-2.5 flex items-start gap-2 text-xs font-black shadow-[2px_2px_0px_#000]">
          <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <span>
            NO MOVES FOR CATEGORY: Free pass rule applied! All legal moves across all pieces unlocked.
          </span>
        </div>
      )}

      {/* Primary Action Button */}
      {isMyTurn && isInCheck ? (
        <div className="text-xs text-center text-white bg-red-600 border-3 border-black dark:border-white py-2.5 px-3 font-black uppercase shadow-[3px_3px_0px_#000]">
          Check Defense Active: Select an escape move directly
        </div>
      ) : isMyTurn && !hasRolled ? (
        <button
          onClick={handleRollClick}
          disabled={disabled || isRolling}
          className={`w-full py-3 px-4 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border-3 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] ${
            isWarningPhase
              ? 'bg-amber-400 text-black animate-pulse'
              : 'bg-amber-400 hover:bg-amber-300 active:translate-x-0.5 active:translate-y-0.5 text-black'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>ROLL DICE</span>
          {isGracePhase && (
            <span className="text-[11px] font-black bg-black text-amber-400 px-1.5 py-0.5 border border-amber-400">
              {graceSeconds}S FREE
            </span>
          )}
          {isWarningPhase && (
            <span className="text-[11px] font-black bg-red-600 text-white px-2 py-0.5 border border-black uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" />
              AUTO-ROLLING IN {warningSeconds}S
            </span>
          )}
        </button>
      ) : null}

      {isMyTurn && (hasRolled || isInCheck) && (
        <div className="text-xs text-center dark:text-neutral-400 text-neutral-600 py-1 font-black uppercase">
          Select an eligible highlighted piece on the board to move
        </div>
      )}
    </div>
  );
};
