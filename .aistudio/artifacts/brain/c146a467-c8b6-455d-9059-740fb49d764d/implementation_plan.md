# Rose Paradise: Instantaneous Zero-Lag Multiplayer & Untimed Couples Chess

A robust redesign of the Rose Paradise couples game mode that eliminates room creation stalling and WebSocket handshake latency by adopting the proven authoritative direct-room multiplayer architecture from Culling Game and Dice Chess. Features instant board transition, timer-free relaxed gameplay, an on-start romantic rulebook modal, and dual access via private custom codes or open lobby rooms.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the interactive interview:
>
> - **Zero-Delay Start with Untimed Play**: As soon as a partner enters the room code (or clicks an open room), the game transitions directly and immediately to the chessboard. There is **no countdown timer** and **no match clock**—partners can deliberate and play at their own leisure.
> - **Initial Romantic Rulebook Modal**: Upon entering the active board, a romantic popup modal explaining the Rose rules (roles, petals, summons, love link) appears without any timer pressure, allowing both players to review rules before playing. Players can close it with a single tap or re-open it at any time.
> - **Dual Room Access**: Players can host private custom code rooms (`ROSE-XXXXXX`) or browse an open lobby list of waiting challenges (identical to the seamless Culling Mode challenges list).
> - **Strict 2-Player Role Archetypes**: The game is strictly human vs human (Boyfriend as Prince vs Girlfriend as Queen) with full move validation, petal harvesting, unit summoning, and instant live reactions.

---

## 1. Overview & Core Concept

- **What It Does**: Rose Paradise is a tactical chess variant created for couples, featuring the Prince (Boyfriend) and Queen (Girlfriend). Players earn Petals upon making captures, unlocking powerful romantic summons (Cupid Priest, Thorn Guard, Rose Tower).
- **The Problem Solved**: Previously, Rose Paradise stalled on a multi-step `"handshake"` and `"countdown"` phase waiting for mutual `rose:ready` packet confirmations that frequently hung over WebSockets in cloud environments. Furthermore, disconnected connections and ticking blitz timers ran counter to an enjoyable couples experience.
- **Key Value**: Instantaneous match launch, 100% reliable WebSocket synchronization, relaxed untimed matches, and seamless room discovery.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Lobby & Room Creation**:
   - Host chooses role: **Boyfriend (Prince / White)** or **Girlfriend (Queen / Black)**.
   - Host clicks **"Create Rose Paradise Room"**.
   - Server registers room code instantly in memory and broadcasts to the lobby.
   - Host sees clean invite code with 1-click clipboard copy (`ROSE-XXXXXX`) and a live waiting state.
   - Alternatively, another player visiting the lobby sees the open room in the **"Open Rose Rooms"** lobby table and clicks **"Join Duel"**, or enters the 6-character code directly.

2. **Instant Match Launch**:
   - As soon as the guest enters the code or clicks Join, the server assigns seats, sets status to `'active'`, and transmits the start packet to both clients in under 10ms.
   - Both players' screens immediately transition from lobby/waiting to the Rose chessboard.
   - An elegant, non-intrusive **"Romantic Rulebook"** modal pops open automatically on the first turn:
     - Clear visual cards explaining roles, petal accumulation, and the 3 special summon units.
     - A simple **"Begin Our Match"** button dismisses the modal without any ticking clock.
     - A small **"Rules"** button in the top navigation allows either player to re-read it anytime.

3. **In-Game Experience (Untimed)**:
   - Clock badges are replaced with tranquil turn status indicators: *"Your Turn · Take your time"* vs *"Partner is thinking..."*.
   - Responsive board click-to-move with pink particle legal move hints.
   - Live romantic reaction palette (❤️, 🌹, ✨, 💍, 🥰) floating across partner screens.
   - Interactive Petal meter (3 petals required to summon) with an in-board summon placement overlay.
   - Elegant Victory / Draw overlay upon checkmate or mutual agreement with 1-click **"Play Again"** room recreation.

### Visual Identity & Theme
- **Dominant Palette**: Velvet plum background (`#140727` to `#1b0a2e`), deep royal purple surfaces (`#2a0f45`, `#3b155e`), with delicate rose gold and rose-pink accents (`#f472b6`, `#fda4af`).
- **Chessboard**: High-contrast royal purple alternating checkered tiles with glowing rose target dots (`rgba(244, 114, 182, 0.8)`).
- **Typography**: Neo-grotesque display headers (`Plus Jakarta Sans`) paired with warm, legible body prose (`DM Sans`), tabular notation for moves (`JetBrains Mono`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct State Activation (Eliminating the Handshake Barrier)**
  - *Chosen Approach*: Transition the match state to `'active'` immediately when the second player joins, dispatching `rose:match_started` to both host and guest sockets.
  - *Why*: Multi-step handshakes (`handshake` -> `ready` -> `countdown`) add needless round-trip latency and introduce race conditions on proxy servers like Google Cloud Run / Gemini AI Studio. Instant activation mirrors Culling and standard Dice Chess, guaranteeing zero stall.
  - *Alternatives Considered*: Retaining a 3-second countdown client-side—rejected in favor of an untimed rulebook modal that gives users full agency over when they begin.

- **Decision 2: Untimed Match Architecture**
  - *Chosen Approach*: Set `timeControl = 0` / untimed mode for Rose Paradise, disabling auto-loss flags and clock decrement tickers.
  - *Why*: The user explicitly stated: *"the whole game is without timer... they can play as long as they want because it's their love"*. Removing timeouts prevents anxiety and artificial disconnect forfeits.

- **Decision 3: Dedicated Room Registry with Public Lobby + Private Code**
  - *Chosen Approach*: Maintain an authoritative server-side `roseRooms` registry with `broadcastPublicRoseRooms()` updating all connected clients in real time, while supporting direct private code lookup.
  - *Why*: Gives players the choice of spontaneous partner matching from the lobby or sharing a private code via messaging apps.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AI Studio Client Browser                        │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │    RoseParadiseView       │      │    RomanticRulebookModal    │   │
│   │  (Untimed Board, Petals,  │◄─────┤   (Pops on match start,     │   │
│   │   Summons, Live Chat)     │      │    no timer, re-openable)   │   │
│   └─────────────▲─────────────┘      └─────────────────────────────┘   │
│                 │                                                      │
│   ┌─────────────┴─────────────┐                                        │
│   │        useRoseRoom        │ (Persistent WebSocket handler)         │
│   └─────────────▲─────────────┘                                        │
└─────────────────┼──────────────────────────────────────────────────────┘
                  │ WebSocket (`/ws` path multiplexed over port 3000)
┌─────────────────▼──────────────────────────────────────────────────────┐
│                    Express & Node.js HTTP Server                       │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │    registerRoseSocket     │      │       RoseRoomRegistry      │   │
│   │  - rose:create_room       │◄────►│  - directChallenges map     │   │
│   │  - rose:join_room         │      │  - activeRooms map          │   │
│   │  - rose:move              │      │  - instant match generator  │   │
│   │  - rose:summon            │      │                             │   │
│   │  - rose:reaction          │      └─────────────────────────────┘   │
│   └───────────────────────────┘                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Event Lifecycle & Message Flow

| Event Name | Direction | Payload & Action |
|---|---|---|
| `rose:create_room` | Client $\to$ Server | `{ role, displayName }` $\to$ Creates room code, adds to public list, confirms code to host |
| `rose:join_room` | Client $\to$ Server | `{ code, displayName }` $\to$ Matches guest, builds active match, sends `rose:match_started` |
| `rose:match_started` | Server $\to$ Client | `{ match, yourColor, yourRole }` $\to$ Both players instantly switch to board, open rulebook modal |
| `rose:move` | Client $\to$ Server | `{ from, to }` $\to$ Validates turn & piece rules, updates petals, broadcasts new board |
| `rose:summon` | Client $\to$ Server | `{ pieceType, to }` $\to$ Validates 3 petals & home zone, places unit, broadcasts new state |
| `rose:reaction` | Client $\to$ Server | `{ text }` $\to$ Broadcasts floating emoji reaction to opponent |
| `rose:list_rooms` | Client $\to$ Server | Fetches active waiting rooms for the lobby table |

### Implementation File Strategy
1. **`server/rose/roseSocket.ts`**: Refactor socket message handler to eliminate the `handshake`/`ready` gate. Add `rose:create_room`, `rose:join_room`, `rose:list_rooms`, and instant broadcast of `rose:match_started` directly analogous to `cullingSocket.ts`.
2. **`server/rose/roseRooms.ts`**: Ensure room creation sets `status: 'waiting_guest'`, and on guest join immediately upgrades to `status: 'active'`, removes time-out decrements, and manages connection tracking.
3. **`src/rose/useRoseRoom.ts`**: Update hook to interface with the new instant events, maintain clean reconnection logic, and expose room lobby lists.
4. **`src/rose/RoseParadiseView.tsx`**: Update UI to support untimed display, instantaneous board presentation, initial rulebook popup modal, and working summon placement.
5. **`test/rose/rose.test.ts`**: Update unit test suite to verify the instant-start lifecycle and untimed state consistency.
