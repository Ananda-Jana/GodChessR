import React from 'react';
import { X, BookOpen, Crown, Dices } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-none">
      <div className="bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white max-w-2xl w-full max-h-[90dvh] [max-height:90vh] flex flex-col shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] text-black dark:text-white">
        {/* Header */}
        <div className="px-5 py-3 border-b-3 border-black dark:border-white flex items-center justify-between bg-neutral-100 dark:bg-[#141416] shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
              Dice Chess Official Rulebook
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm font-medium leading-relaxed">
          {/* Section 1: Overview & Board */}
          <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
            <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
              <Crown className="w-4 h-4 text-amber-500" />
              1. Board & Custom Starting Setup
            </h4>
            <p className="mb-2">
              The game is played on a standard 8×8 grid with 64 squares using algebraic coordinates (a–h, 1–8).
              White starts on ranks 1 & 2; Black starts on ranks 8 & 7.
            </p>
            <div className="bg-white dark:bg-black p-2.5 border-2 border-black dark:border-white font-mono text-xs space-y-1">
              <div>· <strong>CORNER QUEENS & PRINCES:</strong></div>
              <div className="pl-3">White Queen is at a1, White Prince is at h1.</div>
              <div className="pl-3">Black Prince is at a8, Black Queen is at h8.</div>
              <div>· Rooks, Bishops, Knights, King, and 8 Pawns fill the remaining standard ranks.</div>
              <div>· Each side begins with exactly 16 pieces (32 total).</div>
            </div>
          </div>

          {/* Section 2: Dice Mechanics */}
          <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
            <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
              <Dices className="w-4 h-4 text-amber-500" />
              2. Dice System & Piece Eligibility
            </h4>
            <p className="mb-2">
              Every turn begins by pressing <strong>ROLL DICE</strong>. The authoritative server generates a roll from 1 to 6:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>
                <strong>ROLLS 1, 2, 3 (INEXPENSIVE):</strong> Unlocks movement for <strong>Knights</strong>, <strong>Bishops</strong>, and <strong>Pawns</strong>.
              </li>
              <li>
                <strong>ROLLS 4, 5, 6 (EXPENSIVE):</strong> Unlocks movement for <strong>Rooks</strong>, <strong>Queens</strong>, <strong>Princes</strong>, <strong>Kings</strong>, and <strong>Pawns</strong>.
              </li>
              <li>
                <strong>NO-LEGAL-MOVE FALLBACK:</strong> If the rolled category contains zero legal moves for that player, the game lifts the restriction and permits moving <em>any</em> piece that has a valid move!
              </li>
              <li>
                <strong>DICE GRACE TIMER:</strong> Player gets 3 seconds of clock pause to roll. If unrolled, a warning badge pulses for 2s before the server automatically rolls.
              </li>
              <li className="font-bold text-amber-600 dark:text-amber-400">
                <strong>DICE REMOVAL AFTER 3 CAPTURES:</strong> Once a combined total of 3 pieces have been captured, the dice vanish permanently and normal chess rules apply for the rest of the game!
              </li>
            </ul>
          </div>

          {/* Section 3: The Prince Piece */}
          <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
            <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
              <Crown className="w-4 h-4 text-amber-500" />
              3. The Prince Piece
            </h4>
            <p className="mb-2">
              The Prince is a royal hybrid unit replacing the second Knight:
            </p>
            <div className="space-y-1.5">
              <div className="bg-white dark:bg-black p-2 border border-black dark:border-white text-xs">
                <span className="font-black uppercase">Ability A (Knight Leap):</span> Standard 2×1 L-shape jump over intervening pieces.
              </div>
              <div className="bg-white dark:bg-black p-2 border border-black dark:border-white text-xs">
                <span className="font-black uppercase">Ability B (Bounded Diagonal):</span> Unobstructed diagonal slide of 1 to 4 squares. Cannot jump over pieces.
              </div>
              <div className="bg-white dark:bg-black p-2 border border-black dark:border-white text-xs">
                <span className="font-black uppercase">Ability C (Extended 1st Move):</span> On its very first move only, can perform an extended 3×1 knight leap over pieces (usable once per game).
              </div>
            </div>
          </div>

          {/* Section 4: Board Expansion Mechanic */}
          <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
            <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
              <BookOpen className="w-4 h-4 text-amber-500" />
              4. Board Expansion (7th Piece Lost Perk)
            </h4>
            <p className="mb-2">
              When a player loses their <strong>7th piece</strong>, they are awarded a one-time choice to expand the battlefield by adding one <strong>ROW</strong> or one <strong>COLUMN</strong> on ANY side (top, bottom, left, or right).
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-xs font-mono">
              <li>Each player gets this expansion perk independently, exactly once per game.</li>
              <li>Both clocks pause completely while the choice is pending (15s auto-pick to back rank).</li>
              <li>Extra files continue as i, j; extra ranks continue as 9, 10.</li>
              <li>Pawn promotion and end ranks dynamically follow the board's far edge.</li>
            </ul>
          </div>

          {/* Section 5: Crafting Mechanic */}
          <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
            <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
              <BookOpen className="w-4 h-4 text-amber-500" />
              5. Piece Crafting (2nd Expensive Piece Lost Perk)
            </h4>
            <p className="mb-2">
              When a player loses their <strong>2nd EXPENSIVE piece</strong> (Rooks, Queen, Prince), both clocks pause and the player may craft one legendary unit as a free action (does not consume turn):
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="bg-white dark:bg-black p-2 border border-black dark:border-white">
                <span className="font-black uppercase text-red-600">Communist:</span> Moves in an alternating diagonal zigzag along 4 orthogonal lines (offsets ±2, ±4). Valid if at least one zigzag path is unobstructed.
              </div>
              <div className="bg-white dark:bg-black p-2 border border-black dark:border-white">
                <span className="font-black uppercase text-amber-500">Supreme Rook:</span> Unlimited orthogonal slides (blocked by pieces) AND leaps 2 squares diagonally over pieces.
              </div>
              <div className="bg-white dark:bg-black p-2 border border-black dark:border-white">
                <span className="font-black uppercase text-sky-400">Priest:</span> Diagonal slides up to 3 squares (blocked by pieces) AND leaps 2 squares orthogonally over pieces.
              </div>
            </div>
            <div className="mt-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              * Must be deployed on an empty, safe square in your 2-row home zone that does not leave your King in check.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t-3 border-black dark:border-white bg-neutral-100 dark:bg-[#141416] shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase border-2 border-black dark:border-white cursor-pointer"
          >
            Close Rulebook
          </button>
        </div>
      </div>
    </div>
  );
};
