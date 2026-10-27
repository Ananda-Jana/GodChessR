# Implementation Plan - Center Punisher Robot Selector Challenge Modal on Mobile

## Problem
In the Punisher Robot Selector game mode on mobile view, when a user clicks on a bot's challenge button, a confirmation modal opens at the bottom (`items-end`). The mobile bottom navigation bar interferes with this modal, overlapping or obstructing the final "FIGHT BOT NOW" challenge button.

## Proposed Changes
- **File**: `src/punisher/PunisherSelector.tsx`
- **Changes**:
  1. Update the outer modal overlay container on mobile (`md:hidden`) from `flex items-end justify-center` to `flex items-center justify-center p-4`.
  2. Update the inner motion container from bottom sheet animation (`y: "100%"`) and top/side borders (`border-t-4 border-x-4`) to centered scale/fade animation and full box border (`border-4 border-white shadow-[8px_8px_0px_#fff] max-w-sm rounded-none`) so it opens squarely in the middle (mid-height) of the mobile screen.
  3. Keep desktop view (`md:flex` and above) completely untouched.

## Verification
- Run `compile_applet` and `lint_applet` to ensure successful build and type checking.
- Verify desktop behavior remains identical.
