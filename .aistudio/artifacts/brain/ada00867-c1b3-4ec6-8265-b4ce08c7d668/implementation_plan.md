# Implementation Plan: Culling Game Opening Dojo — Tukuna's Classroom

Build an interactive, engine-validated **Culling Game Opening Dojo** ("Tukuna's Classroom") inside the existing Dojo Training system. The dojo teaches Culling Game opening theory, colony extension tactics, unit role coordination, and Sovereign protection under the guidance of instructor **Tukuna**.

---

## 1. User Interface & Navigation

### 1.1 Red Dojo Entry Card
- Add a high-visibility, dark crimson entry card/button inside the existing Dojo Training hub (`src/training/HashiraTrainingView.tsx`):
  - Title: **CULLING GAME OPENING DOJO**
  - Subtitle: *Learn openings, protect your Sovereign, and master the battlefield.*
  - Accent: Crimson glow, dark metallic borders, and subtle animation.
  - Action: Sets internal view state to `'culling_opening_dojo'` without full page reloads.

### 1.2 Three-Panel Responsive Classroom Layout
Create `src/training/CullingOpeningDojo.tsx` featuring a 3-panel layout tailored for dark crimson UI aesthetics:
1. **Curriculum Panel (Left/Top)**:
   - Level filters: Beginner, Intermediate, Advanced.
   - Course list with completion checkmarks, lesson badges, difficulty tags, and progress bar.
2. **Interactive 88-Square Board (Center)**:
   - Renders the central 64 squares plus the 4 cross arms (6 squares each).
   - Dynamic SVG overlay rendering:
     - **Numbered Crimson Arrows**: Main line recommended move vectors with clear step sequence numbers.
     - **Dashed Gold Arrows**: Alternative tactical responses and opponent counter-threats.
     - **Square Highlights & Rings**: Target square rings, active source square highlights, and legal move indicators.
3. **Tukuna's Dedicated Crimson Teaching Panel (Right/Bottom)**:
   - **Tukuna Identity**: Explicitly designated as Sensei Tukuna (Instructor) with a distinct teacher persona, separate from the playable game piece Sukuna (`culling_sukuna`).
   - Step-by-step tactical explanation, move purpose, and key threat alerts.
   - Step navigation controls: `Previous`, `Next`, `Reset`, `Replay Sequence`, `Toggle Arrows`, `Hint`, and `Free Practice Mode`.
   - Dedicated return-to-Dojo navigation header.

---

## 2. Curriculum Data & Engine Integration

### 2.1 Opening Lesson Curriculum (`src/training/cullingOpeningData.ts`)
Define structured opening lessons validated strictly against `cullingEngine.ts`:
1. **Beginner Courses**:
   - *Lesson 1: Vanguard Central Rush* (Pushing central pawns to establish cross-arm control).
   - *Lesson 2: Sovereign Fortress* (Forming Bulwark shell defenses around Sukuna / Gojo).
   - *Lesson 3: Skirmisher Flank Attack* (Using Heavenly Restriction high mobility for quick colony entry).
2. **Intermediate Courses**:
   - *Lesson 4: Warden 7:3 Ratio Strike* (Aligning 7:3 Ratio Fields to disable enemy defenses).
   - *Lesson 5: Rusher Jackpot Chain* (Activating 3-step jackpot movement through colony gates).
   - *Lesson 6: Colony Extension Expansion* (Pushing pieces into top/bottom/left/right arm colonies).
3. **Advanced Courses**:
   - *Lesson 7: Artillery Domain Barrage* (Positioning ranged units to pressure enemy Sovereign).
   - *Lesson 8: Anti-Rush Cross Gambit* (Trapping aggressive rushers in cross-column chokepoints).

### 2.2 Authoritative Culling Engine Validation
- All starting fen/board configurations, user moves, and automated opponent replies validate directly through `src/game/cullingEngine.ts`.
- **Strict Mode**: If the user makes an unrecommended legal move, Tukuna provides instant feedback explaining why it departs from book theory, highlighting the target square, and prompting a retry.
- **Free Practice Toggle**: Allows user to experiment with any valid move on the Culling board with live positional score feedback from Tukuna.

---

## 3. Automated Test Suite

Create `test/training/cullingOpening.test.ts`:
- Validates that every lesson in `cullingOpeningData.ts` starts with a legal 88-square Culling state.
- Simulates step-by-step moves for all 8 opening lessons through `cullingEngine.ts` to confirm 100% legal moves, valid captures, correct opponent responses, and lesson completion triggers.

---

## 4. Verification Plan

### 4.1 Automated Build & Lint Verification
1. Run `compile_applet` to verify TypeScript type-safety across all components.
2. Run `lint_applet` to ensure zero syntax or linting violations.
3. Run the automated unit tests to guarantee 100% test passing across the new opening dojo and existing training modules.

### 4.2 Manual Verification Steps
1. Navigate to Dojo Training, click the prominent red **CULLING GAME OPENING DOJO** button.
2. Verify Tukuna's Classroom opens seamlessly with all 3 panels intact.
3. Select an opening lesson (e.g. *Vanguard Central Rush*) and confirm numbered crimson arrows render correctly over board squares.
4. Make the requested move and verify Tukuna's commentary updates with tactical explanations and opponent counter-moves.
5. Try an off-book move to verify Tukuna's error explanation and retry mechanism.
6. Toggle Free Practice mode and verify legal move overlays.
