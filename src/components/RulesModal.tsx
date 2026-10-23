import React, { useState } from 'react';
import { X, BookOpen, Crown, Dices, Sparkles, Clock, Swords, Bot, Users, Layers, Shield } from 'lucide-react';
import { MatchState } from '../types/game';

export interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMatch?: MatchState | null;
  isBotMatch?: boolean;
}

type TabType = 'bot_standard' | 'bot_crafted' | 'multiplayer';

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  activeMatch,
  isBotMatch,
}) => {
  // Determine if opened inside an active match
  const isInMatch = Boolean(activeMatch);
  const matchIsBot = Boolean(
    isBotMatch ||
    activeMatch?.id?.startsWith('bot_match') ||
    activeMatch?.whitePlayer?.userId === 'usr_bot_gm' ||
    activeMatch?.blackPlayer?.userId === 'usr_bot_gm'
  );
  const matchGameMode = activeMatch?.gameMode || 'standard';
  const matchCraftingAllowed = activeMatch ? activeMatch.craftingAllowed !== false : true;

  // Initial tab for dashboard browsing
  const defaultTab: TabType = isInMatch
    ? matchIsBot
      ? matchGameMode === 'crafted'
        ? 'bot_crafted'
        : 'bot_standard'
      : 'multiplayer'
    : 'bot_standard';

  const [selectedTab, setSelectedTab] = useState<TabType>(defaultTab);

  // Sync selected tab if match changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (isInMatch) {
        if (matchIsBot) {
          setSelectedTab(matchGameMode === 'crafted' ? 'bot_crafted' : 'bot_standard');
        } else {
          setSelectedTab('multiplayer');
        }
      }
    }
  }, [isOpen, isInMatch, matchIsBot, matchGameMode]);

  if (!isOpen) return null;

  // Active view parameters
  const currentView: TabType = isInMatch
    ? matchIsBot
      ? matchGameMode === 'crafted'
        ? 'bot_crafted'
        : 'bot_standard'
      : 'multiplayer'
    : selectedTab;

  const showCraftedStartingArmy = currentView === 'bot_crafted';
  // If in match: hide crafting completely if crafting was avoided. If browsing dashboard: show crafting rules
  const showCraftingSection = isInMatch ? matchCraftingAllowed : true;
  // Board expansion is disabled for bot modes and only shown for multiplayer
  const showBoardExpansion = currentView === 'multiplayer';
  const isBotView = currentView === 'bot_standard' || currentView === 'bot_crafted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-none">
      <div className="bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white max-w-2xl w-full max-h-[90dvh] [max-height:90vh] flex flex-col shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] text-black dark:text-white">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 border-b-3 border-black dark:border-white flex items-center justify-between bg-neutral-100 dark:bg-[#141416] shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-2">
                Dice Chess Official Rulebook
              </h3>
              {isInMatch && (
                <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold block">
                  Active Match Rules ({matchIsBot ? (matchGameMode === 'crafted' ? 'Bot Crafted' : 'Bot Standard') : 'Multiplayer'})
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* In-Match Banner or Mode Tabs for Dashboard */}
        {isInMatch ? (
          <div className="px-4 py-2 bg-amber-400 text-black border-b-2 border-black font-mono text-[11px] font-bold flex flex-wrap items-center justify-between gap-1.5 shrink-0">
            <span className="uppercase font-black">
              Mode: {matchIsBot ? (matchGameMode === 'crafted' ? 'Play vs Bot (Crafted Pieces)' : 'Play vs Bot (Standard)') : 'Multiplayer Online'}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-black text-amber-400 uppercase text-[10px] font-black">
                {matchCraftingAllowed ? 'Crafting Enabled' : 'Crafting Avoided'}
              </span>
              <span className="px-1.5 py-0.5 bg-black text-white uppercase text-[10px] font-black">
                {matchIsBot ? 'Expansion: Disabled' : 'Expansion: Active'}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 border-b-3 border-black dark:border-white shrink-0 bg-neutral-200 dark:bg-neutral-800 text-xs font-black uppercase">
            <button
              onClick={() => setSelectedTab('bot_standard')}
              className={`p-2.5 sm:py-3 flex items-center justify-center gap-1.5 cursor-pointer border-r-2 border-black dark:border-white transition-colors ${
                selectedTab === 'bot_standard'
                  ? 'bg-amber-400 text-black shadow-[inset_0_-3px_0px_#000]'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="truncate">Bot Standard</span>
            </button>
            <button
              onClick={() => setSelectedTab('bot_crafted')}
              className={`p-2.5 sm:py-3 flex items-center justify-center gap-1.5 cursor-pointer border-r-2 border-black dark:border-white transition-colors ${
                selectedTab === 'bot_crafted'
                  ? 'bg-amber-400 text-black shadow-[inset_0_-3px_0px_#000]'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="truncate">Bot Crafted</span>
            </button>
            <button
              onClick={() => setSelectedTab('multiplayer')}
              className={`p-2.5 sm:py-3 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                selectedTab === 'multiplayer'
                  ? 'bg-amber-400 text-black shadow-[inset_0_-3px_0px_#000]'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="truncate">Multiplayer</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm font-medium leading-relaxed">
          
          {/* Section 1: Board Setup & Initial Army */}
          <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
            <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
              <Crown className="w-4 h-4 text-amber-500" />
              1. Board Setup & Starting Army
            </h4>
            <p className="mb-2">
              The game is played on an 8×8 grid with 64 squares using algebraic coordinates (a–h, ranks 1–8). Each side begins with 16 pieces (32 total).
            </p>

            {showCraftedStartingArmy ? (
              <div className="bg-white dark:bg-black p-3 border-2 border-black dark:border-white font-mono text-xs space-y-2">
                <div className="text-amber-600 dark:text-amber-400 font-black uppercase text-[11px]">
                  ★ CRAFTED PIECES INITIAL LAYOUT:
                </div>
                <div>· <strong>CORNER QUEENS & PRINCES:</strong> White Queen at a1, Prince at h1. Black Prince at a8, Queen at h8.</div>
                <div>· <strong>COMMUNISTS:</strong> Replace standard Bishops at c1, f1 (White) and c8, f8 (Black).</div>
                <div>· <strong>PRIESTS:</strong> Replace standard Knights at b1 (White) and g8 (Black).</div>
                <div>· <strong>SUPREME ROOK:</strong> Replaces one standard Rook at d1 (White) and d8 (Black).</div>
                <div>· <strong>REMAINING UNITS:</strong> Standard Rook at g1 (White) & b8 (Black), Kings at e1 & e8, and 8 Pawns on ranks 2 & 7.</div>
              </div>
            ) : (
              <div className="bg-white dark:bg-black p-3 border-2 border-black dark:border-white font-mono text-xs space-y-1.5">
                <div className="text-amber-600 dark:text-amber-400 font-black uppercase text-[11px]">
                  ★ STANDARD ROYAL CORNER LAYOUT:
                </div>
                <div>· <strong>CORNER QUEENS & PRINCES:</strong> White Queen at a1, Prince at h1. Black Prince at a8, Queen at h8.</div>
                <div>· <strong>STANDARD BACK RANKS:</strong> Standard Rooks, Bishops, Knights, and King occupy remaining squares.</div>
                <div>· <strong>PAWNS:</strong> 8 Pawns per side line ranks 2 (White) and 7 (Black).</div>
              </div>
            )}
          </div>

          {/* Section 2: Special Crafted Pieces Guide (Only in Crafted Mode OR if Crafting is Allowed) */}
          {(showCraftedStartingArmy || showCraftingSection) && (
            <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
              <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-500" />
                2. Legendary Crafted Pieces Guide
              </h4>
              <p className="mb-2">
                {showCraftedStartingArmy
                  ? 'These unique legendary pieces start directly on the board in Crafted Mode:'
                  : 'Legendary units summoned when the mid-game crafting perk is enabled:'}
              </p>
              <div className="space-y-2 text-xs">
                <div className="bg-white dark:bg-black p-2.5 border border-black dark:border-white">
                  <span className="font-black uppercase text-red-600 dark:text-red-400 block mb-0.5">
                    Communist:
                  </span>
                  Moves in an alternating diagonal zigzag along 4 orthogonal lines (offsets ±2, ±4). Valid as long as at least one zigzag branch is unobstructed.
                </div>
                <div className="bg-white dark:bg-black p-2.5 border border-black dark:border-white">
                  <span className="font-black uppercase text-amber-500 block mb-0.5">
                    Supreme Rook:
                  </span>
                  Unlimited orthogonal slides (blocked by pieces) AND leaps 2 squares diagonally over intervening pieces.
                </div>
                <div className="bg-white dark:bg-black p-2.5 border border-black dark:border-white">
                  <span className="font-black uppercase text-sky-500 dark:text-sky-400 block mb-0.5">
                    Priest:
                  </span>
                  Diagonal slides up to 3 squares (blocked by pieces) AND leaps 2 squares orthogonally over intervening pieces.
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Dice Mechanics */}
          <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
            <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
              <Dices className="w-4 h-4 text-amber-500" />
              3. Dice System & Piece Eligibility
            </h4>
            <p className="mb-2">
              Every turn begins by rolling the authoritative dice (values 1–6):
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>
                <strong>ROLLS 1, 2, 3 (INEXPENSIVE):</strong> Unlocks movement for {showCraftedStartingArmy ? 'Priests, Communists, and Pawns' : 'Knights, Bishops, and Pawns'}.
              </li>
              <li>
                <strong>ROLLS 4, 5, 6 (EXPENSIVE):</strong> Unlocks movement for {showCraftedStartingArmy ? 'Supreme Rook, Rooks, Queens, Princes, Kings, and Pawns' : 'Rooks, Queens, Princes, Kings, and Pawns'}.
              </li>
              <li>
                <strong>FALLBACK UNLOCK:</strong> If the rolled category contains zero legal moves for that player, the restriction lifts immediately and permits moving <em>any</em> piece that has a valid move!
              </li>
              <li>
                <strong>DICE GRACE TIMER:</strong> Player gets 3 seconds of clock pause before timer ticks to roll. If unrolled, a warning badge pulses for 2s before the server automatically rolls.
              </li>
              <li className="font-bold text-amber-600 dark:text-amber-400">
                <strong>DICE REMOVAL AFTER 3 CAPTURES:</strong> Once a combined total of 3 pieces are captured across the board, the dice permanently vanish and standard chess rules apply for the rest of the game!
              </li>
            </ul>
          </div>

          {/* Section 4: The Prince Piece */}
          <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
            <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
              <Crown className="w-4 h-4 text-amber-500" />
              4. The Prince Piece
            </h4>
            <p className="mb-2">
              The Prince is a royal hybrid unit stationed at the opposite corner (h1 for White, a8 for Black):
            </p>
            <div className="space-y-1.5">
              <div className="bg-white dark:bg-black p-2 border border-black dark:border-white text-xs">
                <span className="font-black uppercase">Ability A (Knight Leap):</span> Standard 2×1 L-shape jump over intervening pieces.
              </div>
              <div className="bg-white dark:bg-black p-2 border border-black dark:border-white text-xs">
                <span className="font-black uppercase">Ability B (Bounded Diagonal):</span> Unobstructed diagonal slide of 1 to 4 squares. Cannot jump over pieces.
              </div>
              <div className="bg-white dark:bg-black p-2 border border-black dark:border-white text-xs">
                <span className="font-black uppercase">Ability C (Extended 1st Move):</span> On its very first move of the game only, can perform an extended 3×1 knight leap over pieces.
              </div>
            </div>
          </div>

          {/* Section 5: Board Expansion (Multiplayer Only) */}
          {showBoardExpansion && (
            <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
              <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
                <Layers className="w-4 h-4 text-amber-500" />
                5. Board Expansion (7th Piece Lost Perk)
              </h4>
              <p className="mb-2">
                When a player loses their <strong>7th piece</strong> in a multiplayer match, they receive a one-time perk to expand the board by adding one <strong>ROW</strong> or <strong>COLUMN</strong> on ANY side (top, bottom, left, or right).
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs font-mono">
                <li>Each player receives this expansion perk independently, exactly once per match.</li>
                <li>Clocks pause during the choice (15-second auto-selection timer).</li>
                <li>Extra files become i, j; extra ranks become 9, 10. End rank targets adjust dynamically.</li>
              </ul>
            </div>
          )}

          {/* Section 6: Mid-Game Piece Crafting (Only if Crafting is Enabled / Allowed) */}
          {showCraftingSection && (
            <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
              <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {showBoardExpansion ? '6. Piece Crafting Perk' : '5. Piece Crafting Perk'}
              </h4>
              <p className="mb-2">
                When mid-game crafting is enabled, losing <strong>2 EXPENSIVE pieces</strong> unlocks the crafting perk:
              </p>
              <div className="bg-white dark:bg-black p-3 border-2 border-black dark:border-white font-mono text-xs space-y-1.5">
                <div>· <strong>TRIGGER CONDITION:</strong> Triggers ONLY after losing 2 expensive pieces (Queen, Rook, Prince, Communist, Supreme Rook, Priest).</div>
                <div className="text-red-600 dark:text-red-400 font-black">
                  · <strong>PAWNS EXCLUDED:</strong> Losing pawns NEVER counts toward crafting. Pawns never trigger crafting.
                </div>
                <div>· <strong>SUMMON ACTION:</strong> Player chooses to summon 1 Communist, Supreme Rook, or Priest onto an empty, safe square in their 2-rank home zone.</div>
                <div>· <strong>KING CHECK LOCK:</strong> If a player’s King is in check when the 2nd expensive piece is lost, crafting is safely held until check is resolved.</div>
                {!isInMatch && (
                  <div className="text-neutral-500 dark:text-neutral-400 font-sans text-[11px] pt-1 border-t border-black/20 dark:border-white/20">
                    * Players can choose to <strong>Avoid Crafting</strong> before starting a bot match or multiplayer game. If avoided, no mid-game crafting will trigger.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 7: Win Conditions & Timeouts */}
          <div className="border-2 border-black dark:border-white p-3.5 bg-neutral-50 dark:bg-neutral-900">
            <h4 className="font-black uppercase mb-1.5 flex items-center gap-1.5 text-black dark:text-amber-400">
              <Shield className="w-4 h-4 text-amber-500" />
              {showBoardExpansion && showCraftingSection ? '7' : (showBoardExpansion || showCraftingSection ? '6' : '5')}. Win Conditions & Timeout Rules
            </h4>
            <div className="space-y-2 text-xs">
              <div className="bg-white dark:bg-black p-2.5 border border-black dark:border-white">
                <span className="font-black uppercase text-amber-600 dark:text-amber-400 block mb-0.5">
                  1. Checkmate (Highest Priority)
                </span>
                Checkmate instantly wins the game. King cannot escape check, and attacking squares are highlighted in red.
              </div>
              <div className="bg-white dark:bg-black p-2.5 border border-black dark:border-white">
                <span className="font-black uppercase text-amber-600 dark:text-amber-400 block mb-0.5">
                  2. Two-Pawn End Rank Draw
                </span>
                If either player successfully advances 2 pawns to the opponent’s back rank, the match ends immediately in a draw. Checkmate takes precedence over this draw.
              </div>
              <div className="bg-white dark:bg-black p-2.5 border border-black dark:border-white">
                <span className="font-black uppercase text-amber-600 dark:text-amber-400 block mb-0.5">
                  3. Clock Timeout Rules ({isBotView ? 'Play vs Bot' : 'Multiplayer'})
                </span>
                {isBotView ? (
                  <p className="leading-tight">
                    In bot matches, if a player’s clock expires, they lose <strong>unless</strong> they hold a <strong>≥ 3 piece lead</strong> over the opponent. If the player holds at least a 3-piece lead, victory is awarded to the player despite timeout!
                  </p>
                ) : (
                  <p className="leading-tight">
                    In multiplayer matches, when a player’s clock expires, they lose unless the leading player holds a <strong>&gt; 7 piece advantage</strong>, in which case the piece leader is awarded the victory.
                  </p>
                )}
              </div>
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
