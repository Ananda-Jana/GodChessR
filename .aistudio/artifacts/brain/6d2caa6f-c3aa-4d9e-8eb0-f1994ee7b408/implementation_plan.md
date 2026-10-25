# Compact Mobile Top Bar & OctoSkull "About the Game" Modal Plan

## Summary
Refine the home Dashboard top navigation and brand identity:
1. **TASK 1 (Mobile Top Bar Optimization)**: Convert the mobile `Rules` button into a square icon-only button (`44×44px` `w-11 h-11`) containing Lucide `BookOpen`, preserving `aria-label="Open rulebook"` and `title="Rules"`. Eliminate mobile brand icon box on the left and adjust horizontal flex gaps so the right-hand controls (`[Rules] [Skull] [Profile/ELO pill]`) fit on 1 row without clipping or horizontal scroll at 360px width.
2. **TASK 2 (Brand OctoSkull Icon & About Modal)**:
   - Create `src/components/OctoSkull.tsx` containing the Octagon Skull SVG asset.
   - Create `src/components/AboutGameModal.tsx` rendering a dark glassmorphic modal with large centered `OctoSkull` (amber), title, subtext, story paragraph, and close controls.
   - Update mobile and desktop brand headers so tapping `MugenChessX` on mobile or the `OctoSkull` + `MugenChessX` lockup on desktop opens the About modal.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Confirmed user choices:
> - **TASK 1 (Mobile Top Bar)**:
>   - **Rules Button**: Icon-only `w-11 h-11` (44×44px) square button with Lucide `BookOpen` (size 20) in amber, `aria-label="Open rulebook"`, and `title="Rules"`.
>   - **Brand Mark**: Removed left square website icon on mobile. Only text brand `MugenChessX` remains.
>   - **Pill & Spacing**: Increased right-group flex rhythm with `gap-1.5`–`gap-2` so the Profile/ELO pill is no longer pushed to the screen edge at 360px.
> - **TASK 2 (Brand Icon & About Modal)**:
>   - **Desktop Header Icon**: Replaced previous brand icon with `OctoSkull` (size 30, text-white, `shrink-0`). Icon and title form a single keyboard-accessible button trigger with focus-visible amber ring.
>   - **About Modal Styling & Color**: Modular component `src/components/AboutGameModal.tsx` styled with dark glass backdrop (`bg-black/70`) and panel (`bg-zinc-950/95 supports-[backdrop-filter]:backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 max-w-md`). Displays 128px amber `OctoSkull` icon, `MugenChessX` title, `by ANANDA JANA` subtext, and story text.
>   - **Scroll & State**: Uses local state (`isAboutOpen`), closes on backdrop tap, X button, or Escape key without locking page scroll.

---

### 1. Visual Layout & Touch Target Math

#### Mobile Top Bar Layout (at 360px width)
```
┌────────────────────────────────────────────────────────┐
│ [MugenChessX]            [📖]  [💀]  [👤 1500 ELO]    │
└────────────────────────────────────────────────────────┘
```
- Brand title: `MugenChessX` (single text button trigger for About Modal).
- Right-hand controls (`gap-1.5`):
  1. `[📖]` Square Rules button (`44×44px`, icon-only `BookOpen`).
  2. `[💀]` Square Red Culling button (`44×44px`, `GamepadSkull`).
  3. `[👤 1500 ELO]` Profile pill (`44px` height, unclipped).

#### Desktop Header Lockup
```
┌────────────────────────────────────────────────────────┐
│ [💀 MugenChessX by ANANDA JANA]  ...   [Links] [Theme] │
└────────────────────────────────────────────────────────┘
```
- Single interactive button lockup containing 30px `OctoSkull` icon + brand text.

---

### 2. Technical Architecture & File Changes

#### New Files:
1. `src/components/OctoSkull.tsx`:
   Clean SVG component implementation for the Octagon Skull brand mark.
2. `src/components/AboutGameModal.tsx`:
   Dark glassmorphic modal component displaying the story text and brand graphics with Escape key listener and focus management.

#### Modified File:
1. `src/components/Dashboard.tsx`:
   - Task 1: Update mobile header (`md:hidden`) to use square icon-only Rules button and remove left icon box.
   - Task 2: Replace desktop header icon with `OctoSkull`, wrap brand lockup in button trigger, add `isAboutOpen` state, and render `<AboutGameModal />`.
