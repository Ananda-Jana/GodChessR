# Implementation Plan - Punisher Observer Bot Dedicated Stage & Dialogue System

Overhaul the Punisher Robot Observer from a misplaced floating head into a dedicated, high-impact presence: a dedicated square reactor box on the desktop left sidebar (above the match clocks) and a sleek rectangular top-bar on mobile (above the board). Features 6 distinct bot personality dialogue scripts with timed glassmorphic speech bubbles, reactive mood animations, and subtle device haptic feedback when pieces are captured.

## User Review & Critical Decisions

> [!IMPORTANT]
> The overhaul strictly applies **only to Punisher Robot Selector matches** (`activePunisherBotId` present). Standard vs-Bot, Crafted Bot, Classic Bot, and Multiplayer match views remain completely untouched.

- **Desktop Placement**: Dedicated square reactor stage placed at the top of the left sidebar, right above the Clocks panel. Bot face is displayed large (~120–140px) with dedicated speech bubble placement.
- **Mobile Placement**: Dedicated horizontal rectangular stage anchored in the top section above the board. It houses the prominent bot face, live mood status, and floating glassmorphic speech bubble without overflowing the viewport or pushing the board off-screen.
- **Bot Dialogue System**: Each of the 6 bots has distinct voice lines (Joystick Wraith whines and acts clueless, Static Jester mocks with chaotic jokes, Octavian Hollow stays cold and defensive, Iron Regent speaks with royal authority, Cyclops Revenant unleashes ferocious threats, Chrome Reaper computes cold probabilities).
- **Dialogue Frequency & Timing**: Triggered ~9–10 times per game based on tactical triggers (piece captures, check given/received, decisive moves, blunders), displaying for 3.5 seconds in a glassmorphic rounded balloon before fading out.
- **Haptics & Vibration**: Subtle low-frequency device vibration (`navigator.vibrate([30, 40, 30])` with safe capability checks) combined with head jitter animations when the bot loses valuable pieces.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the Punisher bot from an opponent behind the screen into an active, breathing presence in the room. The bot physically reacts to every board swing, taunts or panics via floating dialogue bubbles, and gives tactical sensory feedback.
- **Target Audience**: Mobile and desktop players challenging the 6 Punisher bosses who want engaging, cinematic personality and clear visibility without layout clipping.
- **Key Value**: Eliminates the navigation bar overlap bug while dramatically enhancing the immersion and visual polish of the Punisher game mode.

---

## 2. User Experience & Visual Design

### Desktop Layout (Left Column Top Box)
- **Container**: A dedicated square-proportioned card with brutalist `#2727F5` borders, deep indigo plasma background, and hard black offset shadow (`shadow-[4px_4px_0px_#000000]`).
- **Bot Avatar**: High-contrast, large SVG bot face (120px+) centered with smooth idle floating, thinking blue pulsing, happy bounces upon taking human pieces, and aggressive head tremors on losing pieces.
- **Floating Dialogue Bubble**: A glassmorphic speech balloon (`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3`) with a triangular pointer toward the bot face. Appears on key tactical moments with spring animation, lingers for 3.5 seconds, then gracefully dismisses.

### Mobile Layout (Top Rectangular Stage)
- **Container**: A sleek, horizontal rectangular banner (height ~80–90px) nestled above the board area.
- **Arrangement**: Left side features the prominent bot avatar (~64–72px) with mood glow ring; right side dynamically hosts the live dialogue balloon or status badge ("ANALYZING...", "ENRAGED", "TRIUMPHANT").
- **Viewport Protection**: Board sizing math is adjusted (`min(calc(100vw - 16px), calc(100dvh - 280px))`) so the chessboard and bottom controls remain fully visible without page scrolling.

### Bot Personality Profiles & Dialogue Matrix
1. **Joystick Wraith** (Clueless & Panic):
   - *Piece Lost*: "Wait, that piece was free! Why did you take it?!", "My controller disconnected!"
   - *Piece Captured*: "Haha! I didn't even mean to do that!", "Is this what winning feels like?!"
   - *In Check*: "Help! Where do I run?! My king is scared!"
2. **Static Jester** (Chaotic Trickster):
   - *Piece Lost*: "Just part of the magic trick... look over there!", "A pawn for your soul, fair trade!"
   - *Piece Captured*: "BAM! Walked right into the trap!", "Did you really think that square was safe?!"
   - *In Check*: "Haha! You think this is check? It's a party!"
3. **Octavian Hollow** (Stoic Fortress):
   - *Piece Lost*: "Acceptable material attrition. The fortress holds.", "A momentary lapse. Defense recalculated."
   - *Piece Captured*: "Order is restored. Your aggression has been penalized.", "Temptation punished."
   - *In Check*: "The perimeter is breached. Reinforcing coordinates."
4. **Iron Regent** (Royal Strategist):
   - *Piece Lost*: "A knight may fall, but the crown remains unyielding.", "A bold strike, peasant. You will answer for it."
   - *Piece Captured*: "The realm expands. Concede while dignity permits.", "A predictable sacrifice on your flank."
   - *In Check*: "Insolence! You dare challenge the sovereign directly?!"
5. **Cyclops Revenant** (Relentless Berserker):
   - *Piece Lost*: "MORE BLOOD FOR THE EYE! YOU CANNOT ESCAPE!", "PAIN ONLY FUELS MY ENGINE!"
   - *Piece Captured*: "CRUSHED! YOUR KING IS NEXT ON THE ANVIL!", "TASTE THE FURY OF THE CYCLOPS!"
   - *In Check*: "YOU STRIKE AT A GOD?! I WILL TEAR YOUR RANKS APART!"
6. **Chrome Reaper** (Omniscient AI):
   - *Piece Lost*: "Sub-optimal branch detected. Recalibrating 40,000 permutations.", "Sacrifice logged. Your probability of survival: 12.4%."
   - *Piece Captured*: "Evaluation +3.4 centipawns. Checkmate sequence converging.", "Error detected in human heuristics."
   - *In Check*: "Check alert cleared. Counter-offensive trajectory locked."

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Relocating from Board Overlay to Dedicated Containers**:
  - *Chosen*: Remove the relative board positioning that caused header collision. Insert into Left Sidebar (desktop) and Top Bar (mobile).
  - *Why*: Eliminates z-index fighting with top navigation and keeps the chessboard completely uncluttered for move input.
- **Decision 2: Event-Based Dialogue Rate Limiting (9–10 times per game)**:
  - *Chosen*: Implement a cooldown timer (minimum 12s between dialogues) paired with meaningful tactical triggers (captures, checks, first 3 moves, endgame). Total triggers capped at ~10 per match.
  - *Why*: Keeps the bots feeling witty and alive without annoying speech bubble spam that distracts from calculation.
- **Decision 3: Device Haptics Safety**:
  - *Chosen*: Check `typeof navigator !== 'undefined' && 'vibrate' in navigator`. Call `navigator.vibrate([30, 40, 30])` only on major piece captures and checks.
  - *Why*: Provides high-end tactile game feel on mobile devices while failing silently on unsupported browsers.

---

## 4. Technical Architecture & Component Flow

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  - Tracks activePunisherBotId ('joystick-wraith', etc.)│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                     MatchView.tsx                      │
│                                                        │
│  [Desktop Layout - Left Column]                        │
│   ├── PunisherObserverBox (activePunisherBotId only!)  │
│   │    └── ObserverBot (Face + Expressions + Speech)   │
│   ├── Match Clocks Panel                               │
│   └── Captures & Metrics                               │
│                                                        │
│  [Mobile Layout - Center Column]                       │
│   ├── PunisherMobileHeaderBar (activePunisherBotId)    │
│   │    └── ObserverBot (Horizontal Bar + Speech Bubble)│
│   ├── Adjusted ChessBoard (non-overflowing)            │
│   └── Controls                                         │
└────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    ObserverBot.tsx                     │
│  - Expressions: neutral, thinking, happy, angry,       │
│                victory, defeat                         │
│  - Haptics: navigator.vibrate on bot piece loss        │
│  - Dialogue Engine: 6 bot scripts, rate limiter,       │
│    glassmorphic floating bubble (3.5s auto-dismiss)    │
└────────────────────────────────────────────────────────┘
```

---

## 5. Verification Plan

1. **Desktop Viewport Verification**:
   - Start Punisher Robot match on desktop.
   - Verify observer card appears strictly in the left column above match clocks.
   - Verify the bot face does not overlap the navigation header.
   - Check that Standard Bot, Crafted Bot, and Multiplayer matches do not render this box.
2. **Mobile Viewport Verification**:
   - Resize or simulate mobile (<768px).
   - Verify horizontal top observer stage renders cleanly above the board.
   - Confirm board and bottom actions fit without page scrolling.
3. **Dialogue & Expression Triggers**:
   - Check that speech bubbles appear with the correct bot personality script.
   - Confirm speech bubble stays for 3.5s and auto-dismisses smoothly.
   - Confirm bot reacts to player moves, captures, checks, and game results.
4. **Build Verification**:
   - Run `lint_applet` and `compile_applet` to guarantee type safety and clean bundling.
