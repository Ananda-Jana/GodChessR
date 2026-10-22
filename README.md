# MugenChessX: The Definitive Technical & Gameplay Manual
### Created by ANANDA JANA

---

## Table of Contents
1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [Complete Game Modes & Formats](#2-complete-game-modes--formats)
3. [The Complete Piece Compendium & Movement Mechanics](#3-the-complete-piece-compendium--movement-mechanics)
   - [3.1 Standard Pieces with MugenChessX Conventions](#31-standard-pieces-with-mugenchessx-conventions)
   - [3.2 The Royal Hybrid: The Prince](#32-the-royal-hybrid-the-prince)
   - [3.3 The Extra Crafted Pieces: Deep Dive](#33-the-extra-crafted-pieces-deep-dive)
     - [3.3.1 The Communist](#331-the-communist)
     - [3.3.2 The Supreme Rook](#332-the-supreme-rook)
     - [3.3.3 The Priest](#333-the-priest)
4. [Dice-Constrained Turn Architecture](#4-dice-constrained-turn-architecture)
   - [4.1 The 6-Sided Authoritative Die & Categorization](#41-the-6-sided-authoritative-die--categorization)
   - [4.2 The Fallback Free-Pass Guarantee](#42-the-fallback-free-pass-guarantee)
   - [4.3 Grace Windows, Warning Alerts, and Auto-Roll Timers](#43-grace-windows-warning-alerts-and-auto-roll-timers)
   - [4.4 The Check-Defense Exemption](#44-the-check-defense-exemption)
   - [4.5 The Three-Capture Dice Vanishing Rule](#45-the-three-capture-dice-vanishing-rule)
   - [4.6 Late-Game Material Probability Bias](#46-late-game-material-probability-bias)
5. [Dynamic Board Expansion Mechanics](#5-dynamic-board-expansion-mechanics)
   - [5.1 Activation Trigger](#51-activation-trigger)
   - [5.2 Geometric Expansion Dimensions & Vectors](#52-geometric-expansion-dimensions--vectors)
   - [5.3 Clock Pausing & Auto-Pick Fail-Safe](#53-clock-pausing--auto-pick-fail-safe)
6. [The Tactical Crafting System](#6-the-tactical-crafting-system)
   - [6.1 Material Loss Thresholds](#61-material-loss-thresholds)
   - [6.2 Candidate Square Generation & Safe Placement](#62-candidate-square-generation--safe-placement)
   - [6.3 Crafting While In Check: Deferred Locks & Clock Integrity](#63-crafting-while-in-check-deferred-locks--clock-integrity)
7. [Winning, Drawing & Match Termination Rules](#7-winning-drawing--match-termination-rules)
   - [7.1 Checkmate Precedence](#71-checkmate-precedence)
   - [7.2 The Two-Pawns End-Rank Draw Rule](#72-the-two-pawns-end-rank-draw-rule)
   - [7.3 Stalemate & Insufficient Material](#73-stalemate--insufficient-material)
   - [7.4 Resignation & Agreement](#74-resignation--agreement)
   - [7.5 Clock Expiration & The Seven-Piece Advantage Rule](#75-clock-expiration--the-seven-piece-advantage-rule)
8. [In-Game & Between-Game Perks](#8-in-game--between-game-perks)
   - [8.1 Real-Time In-Game Perks](#81-real-time-in-game-perks)
   - [8.2 Metagame & Between-Game Perks](#82-metagame--between-game-perks)
9. [High-Performance Engineering: How Every Section Is Kept Fast](#9-high-performance-engineering-how-every-section-is-kept-fast)
   - [9.1 O(1) Capture & Condition Verification](#91-o1-capture--condition-verification)
   - [9.2 Minimax Search with Alpha-Beta Pruning & PSTs](#92-minimax-search-with-alpha-beta-pruning--psts)
   - [9.3 Zero-Polling WebSocket State Multiplexing](#93-zero-polling-websocket-state-multiplexing)
   - [9.4 Lazy UI Render Cycles & GPU Accelerated Motion](#94-lazy-ui-render-cycles--gpu-accelerated-motion)
10. [Hosting, Storage Architecture & Technical Limitations](#10-hosting-storage-architecture--technical-limitations)
    - [10.1 Cloud Host Environment](#101-cloud-host-environment)
    - [10.2 JSON File-Based Database Design & Rationale](#102-json-file-based-database-design--rationale)
    - [10.3 Inherent Limitations & Drawbacks](#103-inherent-limitations--drawbacks)
    - [10.4 Production Database Migration Blueprint](#104-production-database-migration-blueprint)
11. [Exhaustive Codebase & File-by-File Directory Mapping](#11-exhaustive-codebase--file-by-file-directory-mapping)
12. [Developer Extension Guide: Adding New Pieces & Modes](#12-developer-extension-guide-adding-new-pieces--modes)

---

## 1. Executive Summary & Core Philosophy

**MugenChessX** is an authoritative multiplayer chess strategy platform designed and built by **ANANDA JANA**. It reimagines classical chess by supercharging positional mastery with stochastic volatility, dynamic territory alteration, and tactical unit crafting.

Classical chess is often encumbered by centuries of opening memorization, opening book stagnation, and deterministic play patterns. MugenChessX breaks this static paradigm by introducing three interconnected pillars:
1. **Asymmetric Corner Royalty**: Standard back-rank corner rooks are replaced with an asymmetric power distribution: White positions its Queen at `a1` and its royal hybrid, the **Prince**, at `h1`. Black mirrors this diagonally with its Prince at `a8` and Queen at `h8`.
2. **Volatile Dice Constraints**: Players roll an authoritative six-sided die each turn partitioning their army into Inexpensive and Expensive mobilization categories, forcing rapid tactical improvisation.
3. **Mid-Game Board Mutation & Crafting**: When armies suffer heavy casualties, battlefield dimensions expand from 8x8 up to 10x10, and commanders gain the ability to synthesize non-standard fairy chess units—the **Communist**, the **Supreme Rook**, and the **Priest**—directly onto safe home squares.

Built with full TypeScript type safety, an authoritative Node.js/Express WebSocket backend, an ultra-responsive React 19 frontend, and a dedicated Minimax AI engine, MugenChessX delivers a fresh competitive battleground where no two matches unfold identically.

---

## 2. Complete Game Modes & Formats

MugenChessX features distinct competitive and local game modes catering to both casual experimenters and hardcore chess tacticians.

### 2.1 Standard Online PvP Mode
* **Format**: Human vs. Human networked real-time match.
* **Matchmaking & Pairing**: Handled through WebSocket challenge handshakes or direct player invitations via the online player discovery lobby.
* **Board Setup**: Classical 8x8 dimensions with MugenChessX Asymmetric Corner Royalty (White Queen `a1`, White Prince `h1`; Black Prince `a8`, Black Queen `h8`).
* **Dice Rules**: Full dice constraint system enabled. Transitions permanently into standard pure chess upon the 3rd total capture.
* **Time Controls**:
  - **Blitz (120s)**: 2 minutes per side with zero increment. Demands lightning-fast intuition under dice rolls.
  - **Rapid (300s)**: 5 minutes per side with zero increment. Encourages deep positional calculations and expansion timing.
* **Move Suggestions Option**: Players can toggle move suggestions `included` (visual highlight rings and target dots showing legal destinations for active pieces) or `excluded` (hardcore blind evaluation where players calculate all valid squares mentally).

### 2.2 Crafted Online PvP Mode
* **Format**: Pre-seeded experimental fairy chess mode.
* **Board Setup**: Both armies start the match with classical pieces partially replaced by revolutionary crafted units on the back ranks:
  - White Back Rank (`y=0`): `a1` Queen, `b1` Priest, `c1` Communist, `d1` Supreme Rook, `e1` King, `f1` Communist, `g1` Standard Rook, `h1` Prince.
  - Black Back Rank (`y=7`): `a8` Prince, `b8` Standard Rook, `c8` Communist, `d8` Supreme Rook, `e8` King, `f8` Communist, `g8` Priest, `h8` Queen.
* **Strategic Nuance**: Players possess immense tactical leaping and sliding firepower right from move one. Opening books are completely obsolete; opening maneuvers resemble violent tactical skirmishes across unorthodox angles.

### 2.3 Grandmaster Bot Mode (Local Minimax AI)
* **Format**: Single-player vs. Local Engine.
* **Engine Architecture**: 3-ply Minimax search augmented with Alpha-Beta pruning, Piece-Square Tables (PST) adapted for fairy pieces, corner queens, and dynamic board dimensions.
* **Bot Behavior**: Highly aggressive, tactical, and opportunistic. Evaluates piece mobility, king safety, center control, and material valuation (giving 600 centipawns to crafted units and 750 centipawns to the Prince).
* **Zero Database Footprint**: Runs completely in-memory on the client thread with simulated thinking delays (600ms) for natural human-like cadence.

### 2.4 Master Bot Mode (Local Fast AI)
* **Format**: Single-player vs. Fast Engine.
* **Engine Architecture**: 2-ply Minimax search designed for instant decision-making (< 100ms calculation time).
* **Bot Behavior**: Prioritizes raw material captures and immediate checks. Ideal for training dice reaction speed and testing opening ideas against unorthodox corner configurations.

### 2.5 Ephemeral Review & Post-Match Analysis Mode
* **Format**: Post-game state inspection.
* **Persistence Mechanism**: When any online or bot game completes, the final match state (board configuration, capture logs, algebraic notation history, and victory verdict) is saved into `localStorage` with a 10-minute auto-expiry window.
* **Functionality**: Players can review moves, explore how dice rolls influenced critical pivot points, analyze checkmate nets, and inspect board expansions without cluttering the persistent server database.

---

## 3. The Complete Piece Compendium & Movement Mechanics

Every piece in MugenChessX has been assigned specific movement capabilities, categorical valuations, and distinct tactical roles.

```
Crafted Back Rank Configurations:
White (Rank 1 / y=0): [a1: Queen] [b1: Priest] [c1: Communist] [d1: Supreme Rook] [e1: King] [f1: Communist] [g1: Rook] [h1: Prince]
Black (Rank 8 / y=7): [a8: Prince] [b8: Rook] [c8: Communist] [d8: Supreme Rook] [e8: King] [f8: Communist] [g8: Priest] [h8: Queen]
```

### 3.1 Standard Pieces with MugenChessX Conventions

#### Pawn
* **Category**: Inexpensive (Rolls 1, 2, 3) AND Expensive (Rolls 4, 5, 6). The Pawn is unique as it is eligible under every single dice roll.
* **Movement**: Forward 1 square into an unoccupied square; forward 2 squares from original starting rank (Rank 2 for White, Rank 7 for Black) provided intermediate and target squares are unoccupied; captures 1 square diagonally forward.
* **Special Rules**: Advancing a pawn to the opponent's back rank increments the player's `pawnsReachedEndRank` counter. Landing a second pawn on the back rank triggers an immediate draw condition. When not triggering a draw, it promotes to Queen, Rook, Bishop, or Knight.

#### Knight
* **Category**: Inexpensive (Rolls 1, 2, 3).
* **Movement**: The classical 2x1 L-shaped jump (offsets: `(±1, ±2)` and `(±2, ±1)`). Jumps over intervening pieces. Highly active during early low-dice turns.

#### Bishop
* **Category**: Inexpensive (Rolls 1, 2, 3).
* **Movement**: Unbounded diagonal slide along unobstructed paths (`dx === dy`). Blocked by intervening pieces. Essential for early fianchetto structures and long-range board slicing.

#### Rook
* **Category**: Expensive (Rolls 4, 5, 6).
* **Movement**: Unbounded orthogonal slide along ranks and files (`dx === 0` or `dy === 0`). Blocked by intervening pieces. Crucial for locking down files and supporting pawn pushes.

#### Queen
* **Category**: Expensive (Rolls 4, 5, 6).
* **Starting Position**: Corner square `a1` for White; corner square `h8` for Black.
* **Movement**: Unbounded orthogonal and diagonal sliding across all unobstructed rays.
* **Tactical Nuance**: Starting in the corner rather than in the center (`d1`/`d8`) radically alters opening theory. The Queen cannot be brought out instantly without moving the rook or knight pawn, shielding it from early vulnerability while setting up diagonal long-range snipes.

#### King
* **Category**: Expensive (Rolls 4, 5, 6).
* **Starting Position**: Square `e1` for White; square `e8` for Black.
* **Movement**: Exactly 1 square in any direction (orthogonal or diagonal).
* **Royal Defense Rule**: The King is the ultimate royal piece. If the King is placed in check, **all dice constraints are immediately waived**. The active player is permitted to move any legal piece to resolve check.

---

### 3.2 The Royal Hybrid: The Prince

The **Prince** is the signature hero unit of MugenChessX, bridging royalty with the agility of high-mobility cavalry.

* **Category**: Expensive (Rolls 4, 5, 6).
* **Starting Coordinates**: Square `h1` for White; square `a8` for Black.
* **Material Valuation**: 750 centipawns (valued between a Rook and a Queen).
* **Visual Iconography**: Adorned with a three-pointed coronet crest merged onto a knight's cavalry helm.
* **Job & Tactical Role**: The Prince acts as an asymmetrical flank striker. Because it occupies the corner opposite the Queen, players possess dual offensive pivots on both flanks. It functions as a rapid defender capable of leaping into the center and pivoting into a long-range diagonal sniper.

#### Movement Vectors:
1. **The Cavalry Leap**: Standard Knight jump:
   $$\Delta x, \Delta y \in \{(\pm 1, \pm 2), (\pm 2, \pm 1)\}$$
   Jumps over intervening friendly or enemy units.
2. **The Bounded Diagonal Slide**: Diagonal trajectory up to 4 squares:
   $$|\Delta x| = |\Delta y| \le 4$$
   Path must be clear of intervening units. Captures enemy piece on target square; blocked by friendly pieces.
3. **The Legendary Extended 3x1 Leap (Once-Per-Game Perk)**:
   On its very first move of the match (before `hasMoved` is set to true and while `princeSpecialUsed` is false), the Prince can perform an extraordinary 3x1 extended leap:
   $$\Delta x, \Delta y \in \{(\pm 1, \pm 3), (\pm 3, \pm 1)\}$$
   *Properties*: Jumps over all intervening pieces. This move can instantly reach `g4` or `e2` from `h1` on turn one, bypassing pawns to deliver surprise attacks, fork high-value defenders, or reposition immediately to the front lines.

---

### 3.3 The Extra Crafted Pieces: Deep Dive

When players lose heavy pieces or launch Crafted Mode, three custom-designed fairy chess units enter the arena. These pieces were mathematically designed to solve classic chess deadlocks.

#### 3.3.1 The Communist
* **Identifier**: `'communist'`
* **Short Label**: `Communist`
* **Dice Categories**: Inexpensive (Rolls 1, 2, 3) AND Expensive (Rolls 4, 5, 6). Mobilizable on *any* dice roll!
* **Material Valuation**: 600 centipawns.
* **Inspiration & Lore**: Inspired by revolutionary vanguard mechanics. While standard chess pieces respect strict aristocratic Euclidean lines (straight ranks or unbroken diagonals), the Communist refuses to be contained by conventional barriers. It weaves through dense pawn chains in an alternating diagonal zigzag.
* **Job & Board Role**: Penetrating rigid, locked pawn structures. When two opposing pawn walls grind a game to a halt, the Communist bypasses the blockade entirely by zigzagging through diagonal seams while progressing forward orthogonally.
* **Exact Movement & Path Clearance Algorithm**:
  The Communist moves along the four cardinal directions (Up, Down, Left, Right), advancing 2 or 4 squares orthogonally by executing alternating diagonal steps:
  - **Upward (dy = +2, +4)**: Reaching `(0, 2)` requires either `(-1, 1)` or `(+1, 1)` empty. Reaching `(0, 4)` requires either `(-1, 1), (0, 2), (-1, 3)` empty or `(+1, 1), (0, 2), (+1, 3)` empty.
  - **Downward (dy = -2, -4)**: Reaching `(0, -2)` requires either `(-1, -1)` or `(+1, -1)` empty. Reaching `(0, -4)` requires intermediate squares along either left-first or right-first zigzag clear.
  - **Rightward (dx = +2, +4)**: Reaching `(2, 0)` requires either `(1, 1)` or `(1, -1)` empty. Reaching `(4, 0)` requires intermediate squares along either path clear.
  - **Leftward (dx = -2, -4)**: Reaching `(-2, 0)` requires either `(-1, 1)` or `(-1, -1)` empty. Reaching `(-4, 0)` requires intermediate squares along either path clear.
  *Target Square Rule*: If at least one zigzag path leading to the target offset is clear, the Communist moves to the destination square (capturing an enemy piece or occupying an empty square).

#### 3.3.2 The Supreme Rook
* **Identifier**: `'supremeRook'`
* **Short Label**: `Sup. Rook`
* **Dice Categories**: Expensive (Rolls 4, 5, 6).
* **Material Valuation**: 650 centipawns.
* **Inspiration & Lore**: Designed as an apex-tier siege engine—a massive battering ram mounted on hydraulic treads. Where a standard Rook is easily neutralized by placing a single pawn or knight in its line of sight, the Supreme Rook leaps over the obstruction diagonally.
* **Job & Board Role**: The ultimate endgame closer. It anchors open files like a classical heavy rook while possessing lethal leaping out-clauses that prevent it from being trapped behind friendly pawn chains.
* **Exact Movement Vectors**:
  1. **Full Orthogonal Sliding**: Moves any distance along ranks and files up to board limits (`maxRange = 16`). Ray is blocked by intervening pieces; captures the first opposing unit encountered.
  2. **The Heavy Diagonal Leap**: Leaps exactly 2 squares along all 4 diagonal axes:
     $$\Delta x, \Delta y \in \{(2, 2), (2, -2), (-2, 2), (-2, -2)\}$$
     *Properties*: Jumps over any piece occupying the intermediate square `(±1, ±1)`. Cannot be blocked by enemy pawns or friendly defenders.

#### 3.3.3 The Priest
* **Identifier**: `'priest'`
* **Short Label**: `Priest`
* **Dice Categories**: Inexpensive (Rolls 1, 2, 3) AND Expensive (Rolls 4, 5, 6). Eligible under *every* dice roll!
* **Material Valuation**: 580 centipawns.
* **Inspiration & Lore**: Inspired by clerical tactical advisers who operate behind castle walls. While bishops are permanently confined to squares of a single color, the Priest pairs bounded diagonal influence with orthogonal leaping capabilities, allowing it to transition across color complexes and control crucial territory bottlenecks.
* **Job & Board Role**: Center control, diagonal fencing, and tactical forks. The Priest excels in tight quarters where sliding pieces are restricted by jumping 2 squares orthogonally over blockers.
* **Exact Movement Vectors**:
  1. **Bounded Diagonal Slide**: Slides 1, 2, or 3 squares diagonally along unobstructed diagonals:
     $$|\Delta x| = |\Delta y| \le 3$$
     Blocked by intermediate pieces along the ray; captures enemy piece on landing square.
  2. **Orthogonal Leaper**: Leaps exactly 2 squares orthogonally:
     $$\Delta x, \Delta y \in \{(0, 2), (0, -2), (2, 0), (-2, 0)\}$$
     *Properties*: Jumps directly over any intervening piece on square `(0, 1)`, `(0, -1)`, `(1, 0)`, or `(-1, 0)`.

---

## 4. Dice-Constrained Turn Architecture

The dice engine is the volatility heartbeat of MugenChessX. It prevents opening rote repetition and forces both players to calculate dynamic move trees on the fly.

### 4.1 The 6-Sided Authoritative Die & Categorization
At the start of every active turn, a random integer between 1 and 6 is generated on the server:
* **Inexpensive Tier (Rolls 1, 2, 3)**: Allowed Pieces: `Pawn`, `Knight`, `Bishop`, `Communist`, `Priest`. Mobilizes minor pieces and infantry. Heavy pieces (Queens, Rooks, Princes) must remain stationary.
* **Expensive Tier (Rolls 4, 5, 6)**: Allowed Pieces: `Pawn`, `Rook`, `Queen`, `Prince`, `King`, `Communist`, `Supreme Rook`, `Priest`. Activates heavy artillery, back-rank rooks, royal hybrids, and kings.

### 4.2 The Fallback Free-Pass Guarantee
To eliminate game-breaking deadlocks (e.g., rolling Inexpensive when all knights/bishops are blocked and pawns cannot advance):
* If legal moves for pieces in the rolled category equals **zero**, the engine flags `isFallbackAnyPiece = true`.
* All legal moves across the entire army are unlocked for that turn with an in-app visual Free-Pass indicator!

### 4.3 Grace Windows, Warning Alerts, and Auto-Roll Timers
To maintain clock fairness in blitz and rapid formats:
* **`DICE_GRACE_WINDOW_MS = 3000` (3s)**: Chess clock is **completely paused** during the first 3 seconds of a turn.
* **`DICE_WARNING_WINDOW_MS = 2000` (2s)**: Amber countdown warning pulses, and clock starts decrementing.
* **`DICE_AUTOROLL_DELAY_MS = 5000` (5s)**: If unrolled after 5.0 seconds, the server auto-rolls on the player's behalf. Match stalling is impossible!

### 4.4 The Check-Defense Exemption
King safety overrides all dice constraints. If a player's King is in check:
* **The dice requirement is 100% bypassed**.
* The player does not roll, and any legal check-resolving move (King evasion, block, or capture) is immediately valid.

### 4.5 The Three-Capture Dice Vanishing Rule
Dice chess is designed as an opening and early mid-game catalyst. Once blood is spilled:
* The engine tracks `totalCaptures` across both armies.
* Upon the **3rd total capture** (`totalCaptures >= 3`), `diceActive` permanently toggles to `false`.
* The die vanishes from the interface, and the game transitions seamlessly into pure tactical chess!

### 4.6 Late-Game Material Probability Bias
When a player has fewer than 7 pieces remaining, probability weights shift to prevent late-game king-and-pawn stalls:
* Rolls 1, 2, 3: 10.0% each (30% total).
* Rolls 4, 5, 6: 23.33% each (70% total).

---

## 5. Dynamic Board Expansion Mechanics

When matches turn into wars of attrition, the battlefield itself expands dynamically.

### 5.1 Activation Trigger
* Triggered the exact moment a player loses their **7th piece** (`lostPieces >= 7`), once per player per match.
* The player selects one of four expansion directions:
  - **Top**: Adds a row at the top rank.
  - **Bottom**: Adds a row below Rank 1 (existing pieces shifted $y+1$).
  - **Left**: Adds a column left of file `a` (existing pieces shifted $x+1$).
  - **Right**: Adds a column right of file `h`.

### 5.2 Geometric Expansion Dimensions & Vectors
* Expands board dimensions from 8x8 up to 9x8, 9x9, 10x9, or 10x10.
* Sliding pieces immediately enjoy extended sliding ranges up to 10 squares.
* Flank expansions create open corridors for rooks and princes to outflank rigid pawn chains.

### 5.3 Clock Pausing & Auto-Pick Fail-Safe
* During expansion selection, the match clock is **authoritatively paused**.
* The player has **15 seconds** (`EXPANSION_AUTO_PICK_TIMEOUT_MS = 15000`) to confirm a direction.
* On timeout, the server auto-picks a default direction (Top for White, Bottom for Black).

---

## 6. The Tactical Crafting System

The crafting system allows commanders who have suffered heavy losses to synthesize powerful reinforcements.

### 6.1 Material Loss Thresholds
* Triggered when a player loses their **2nd expensive piece** (`lostExpensive >= 2`: Rook, Queen, Prince, King, Communist, Supreme Rook, or Priest).
* The player chooses one unit to synthesize: Communist, Supreme Rook, or Priest.

### 6.2 Candidate Square Generation & Safe Placement
1. **Home Zone Restriction**: Placement is strictly limited to the player's 2-row Home Zone (Ranks 1-2 for White, Back 2 Ranks for Black).
2. **Occupancy Rule**: Target square must be empty (`board[y][x] === null`).
3. **Safety Guarantee**: Target square must not be under attack by any enemy piece (`isSquareAttacked === false`).
4. **Fallback**: If all empty home squares are attacked, the safety filter relaxes so the earned unit is never wasted.

### 6.3 Crafting While In Check: Deferred Locks & Clock Integrity
* If the move triggering crafting also puts the player's King in check, crafting is **deferred and locked** (`craftingLocked = true`).
* **The clock does NOT pause** while in check, preventing stalling.
* A banner alerts the player: *"Crafting Unlocked — In Check! Defend your King first. Crafting will open immediately after resolving check."*
* Once check is safely resolved, the crafting modal opens, the clock pauses, and the unit is placed.

---

## 7. Winning, Drawing & Match Termination Rules

MugenChessX implements a strict, deterministic hierarchy of victory and draw conditions:

### 7.1 Checkmate Precedence
* **Priority**: #1 Absolute Top Priority.
* Delivering checkmate wins immediately, even if the move simultaneously advances a second pawn to the back rank.

### 7.2 The Two-Pawns End-Rank Draw Rule
* **Priority**: #2 Priority.
* If either player navigates **two pawns** to the opponent's back rank, the match ends immediately as a **DRAW** (`two_pawns_end_rank_draw`).
* Serves as an aggressive comeback mechanic for material-deficient players.

### 7.3 Stalemate & Insufficient Material
* Ending a turn with zero legal moves while not in check produces an immediate draw (`stalemate`).

### 7.4 Resignation & Agreement
* Players can resign at any time or offer draw agreements over WebSockets.

### 7.5 Clock Expiration & The Seven-Piece Advantage Rule
* When a player's clock hits 0:00, the engine calculates the material difference on the board:
  - **Difference $\le 7$ Pieces**: Standard clock defeat for the flagged player (`timeout`).
  - **Difference $> 7$ Pieces**: The player with the larger army wins by overwhelming piece advantage (`timeout_piece_advantage`), even if their own clock expired!

---

## 8. In-Game & Between-Game Perks

### 8.1 Real-Time In-Game Perks
* **Web Audio Soundscapes**: Synthesized audio for moves, captures, dice rolls, checks, and game-over events.
* **Target Indicator Rings**: Soft rounded dots show all legal destination squares for the active piece.
* **Check Warning Glow**: Attacked king and attacker squares pulse with crimson indicators.
* **Dice Grace Buffer**: 3 seconds of zero-penalty thinking time every turn.
* **Live Material Trays**: Real-time display of captured units and army strength differences.

### 8.2 Metagame & Between-Game Perks
* **Persistent Profiles**: Cumulative tracking of wins, losses, draws, and win rates.
* **Brutalist Avatars**: Custom player icon selector.
* **Instant Rematch**: One-click rematch protocol over WebSockets.
* **10-Minute Ephemeral Review**: Completed matches cached in browser storage for post-game tactical inspection.

---

## 9. High-Performance Engineering: How Every Section Is Kept Fast

### 9.1 O(1) Capture & Condition Verification
Rather than scanning the entire board array on each turn ($O(W \times H)$), capture counters (`lostPieces`, `lostExpensive`, `totalCaptures`, `pawnsReachedEndRank`) are incremented in $O(1)$ time inside the capture handler. Expansion and crafting triggers evaluate via instantaneous integer checks.

### 9.2 Minimax Search with Alpha-Beta Pruning & PSTs
* Precomputed Piece-Square Tables (PSTs) score positional advantages instantly.
* Coordinate clamping ensures 9x9 and 10x10 boards reuse heuristic tables without memory reallocation.
* Alpha-Beta pruning cuts the effective branching factor, allowing 3-ply tactical searches in under 100ms.

### 9.3 Zero-Polling WebSocket State Multiplexing
* Full-duplex WebSockets on `/ws` stream state deltas in real-time.
* Zero HTTP polling overhead; the same Node.js server handles both REST routes and WebSocket frames.

### 9.4 Lazy UI Render Cycles & GPU Accelerated Motion
* Modals are rendered conditionally on demand.
* Animations and piece drag effects execute on the GPU compositor thread using Framer Motion.

---

## 10. Hosting, Storage Architecture & Technical Limitations

### 10.1 Cloud Host Environment
* Deployed on Node.js 22 runtime on port 3000 (`0.0.0.0`).
* Runs Express backend with Vite SPA middleware in development mode (`tsx server.ts`).

### 10.2 JSON File-Based Database Design & Rationale
Data resides in `/data/*.json` (`users.json`, `sessions.json`, `challenges.json`, `matches.json`).
* **Advantages**: Zero-cost, zero external credentials, self-contained portability.
* **Atomic Safety**: Uses temporary file writes followed by atomic renames (`safeWriteJson`) to eliminate corrupt state.
* **In-Memory Cache**: Serves reads instantly from Node.js in-memory `Map` instances.

### 10.3 Inherent Limitations & Drawbacks
* **Ephemeral Container Disks**: Cloud containers with scale-to-zero wipe local disk data on restart unless attached to persistent storage.
* **Synchronous File Writes**: High concurrent write traffic can cause minor event-loop pauses during disk sync.
* **Single-Process Clustering**: In-memory WebSocket room tracking restricts multi-instance horizontal scaling without an external Redis pub/sub layer.
* **Authentication Simplicity**: Passwords use salted PBKDF2 (`pbkdf2Sync`) and 32-byte session tokens without OAuth2 or refresh token rotation.

### 10.4 Production Database Migration Blueprint
* Migrate to PostgreSQL via Cloud SQL or Supabase.
* Implement Drizzle ORM or Prisma to map records to SQL tables.
* Wire Redis pub/sub for distributed WebSocket room management across cluster workers.

---

## 11. Exhaustive Codebase & File-by-File Directory Mapping

```
/
├── .env.example                     <-- Environment variables reference (PORT, NODE_ENV, GEMINI_API_KEY)
├── index.html                       <-- Web application entry point with dark theme and typography
├── metadata.json                    <-- AI Studio project manifest & capability declarations
├── package.json                     <-- Package scripts, dependencies (Express, React 19, Motion, Lucide)
├── tsconfig.json                    <-- TypeScript compiler configuration (bundler resolution, strict types)
├── vite.config.ts                   <-- Vite build setup with Tailwind v4 & React plugins
├── server.ts                        <-- Full-stack Express server, API routing, and Vite middleware
│
├── data/                            <-- File database storage directory
│   ├── users.json                   <-- Serialized user accounts, salts, hashes, and match records
│   ├── sessions.json                <-- Serialized active session tokens mapped to user IDs
│   ├── challenges.json              <-- Active and pending matchmaking invitations
│   └── matches.json                 <-- Serialized active and completed match states
│
├── public/assets/aistudio/          <-- Static promotional and visual image assets
│
├── server/                          <-- Server-side backend logic
│   ├── auth.ts                      <-- Crypto hashing (pbkdf2Sync), session generation, authMiddleware
│   ├── db.ts                        <-- FileDatabase class with atomic fs writes and in-memory Map caches
│   └── socket.ts                    <-- WebSocket server handling presence, timers, moves, and dice rolls
│
├── src/                             <-- Frontend client application
│   ├── main.tsx                     <-- React DOM client entry point
│   ├── App.tsx                      <-- Top-level layout orchestrator, bot runner, and router
│   ├── index.css                    <-- Tailwind CSS v4 directives and brutalist theme definitions
│   │
│   ├── context/                     <-- Global React state providers
│   │   ├── AuthContext.tsx          <-- User login, registration, profile update, and session caching
│   │   ├── SocketContext.tsx        <-- WebSocket client connection, real-time dispatchers, auto-reconnect
│   │   └── ThemeContext.tsx         <-- Theme manager (dark mode default)
│   │
│   ├── components/                  <-- Modular React UI components
│   │   ├── ChessBoard.tsx           <-- 2D board grid renderer, coordinate mapping, and move dot highlights
│   │   ├── ChessPiece.tsx           <-- SVG vector artwork for all pieces (King, Queen, Prince, Communist, etc.)
│   │   ├── MatchView.tsx            <-- Live match interface with player clocks, capture trays, and logs
│   │   ├── Dashboard.tsx            <-- Main home screen, online player list, challenge triggers, stats
│   │   ├── DiceRoller.tsx           <-- Interactive 3D/2D dice rolling button, timer animations, grace alerts
│   │   ├── CraftingModal.tsx        <-- Unit crafting selection UI with preview grids and square placement
│   │   ├── CraftTheoryView.tsx      <-- Dedicated interactive catalog explaining fairy piece mechanics
│   │   ├── ExpansionModal.tsx       <-- Board expansion selector (Top, Bottom, Left, Right)
│   │   ├── RulesModal.tsx           <-- Comprehensive in-app game guide with animated piece diagrams
│   │   ├── PrinceRulesCard.tsx      <-- Dedicated spotlight card detailing Prince capabilities
│   │   ├── BotMatchModal.tsx        <-- Modal for launching local Grandmaster or Master bot games
│   │   ├── ChallengeModal.tsx       <-- Online challenge creator with time controls and move hints toggle
│   │   ├── AuthModal.tsx            <-- Login and account registration modal dialog
│   │   ├── Avatars.tsx              <-- Vector avatar icons and player profile badge component
│   │   └── PopupAd.tsx              <-- Non-intrusive promotional asset banner
│   │
│   ├── game/                        <-- Pure chess logic and mathematical engines
│   │   ├── engine.ts                <-- Authoritative game engine: board init, move validation, check, triggers
│   │   ├── craftables.ts            <-- Mathematical definitions and path vectors for Communist, Supreme Rook, Priest
│   │   └── bot.ts                   <-- Grandmaster/Master Minimax search with PST and Alpha-Beta pruning
│   │
│   ├── types/                       <-- TypeScript contracts and system definitions
│   │   └── game.ts                  <-- Definitions for Piece, Move, MatchState, DiceState, Constants
│   │
│   └── utils/                       <-- Shared helper utilities
│       └── audio.ts                 <-- Synthesized Web Audio API sound generator (moves, captures, dice, check)
│
└── test/                            <-- Automated test suite
    ├── engine.test.ts               <-- 24 unit tests verifying rules, check defense, two-pawn draw, dice
    ├── bot.test.ts                  <-- Unit tests verifying bot move calculations and tactical evaluations
    ├── integration.test.ts          <-- Full-stack two-player integration test simulating PvP match flows
    └── benchmark.ts                 <-- Move generation and Minimax search performance benchmarks
```

---

## 12. Developer Extension Guide: Adding New Pieces & Modes

MugenChessX was engineered with a clean modular pipeline. Adding a new craftable piece requires 4 steps:

### Step 1: Define Movement Vectors in `src/game/craftables.ts`
```typescript
{
  id: 'ninja',
  name: 'Ninja',
  shortName: 'Ninja',
  description: 'Leaps 3 squares orthogonally and 1 square diagonally.',
  movementText: 'Jumps directly to target offset.',
  movement: {
    leaps: [
      { dx: 3, dy: 1 }, { dx: 3, dy: -1 },
      { dx: -3, dy: 1 }, { dx: -3, dy: -1 },
    ],
  },
}
```

### Step 2: Register the Piece Type in `src/types/game.ts`
```typescript
export type PieceType = 
  | 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' 
  | 'king' | 'prince' | 'communist' | 'supremeRook' | 'priest' 
  | 'ninja';
```

### Step 3: Draw the SVG Icon in `src/components/ChessPiece.tsx`
```tsx
case 'ninja':
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path d="..." fill={isWhite ? '#ffffff' : '#1e293b'} stroke="#000000" strokeWidth="1.5" />
    </svg>
  );
```

### Step 4: Add Heuristic Valuation in `src/game/bot.ts`
```typescript
case 'ninja':
  return 520;
```

Run `npm test` to verify your new piece against the automated engine tests!

---

*(MugenChessX is an open-source intellectual property created by ANANDA JANA. Designed for strategy enthusiasts who demand both deep tactical rigor and electrifying volatility.)*
