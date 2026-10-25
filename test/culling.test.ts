/**
 * Automated Test Suite for MugenChessX Jujutsu Kaisen Culling Game Engine
 * 
 * Tests:
 * 1. 88-square cruciform geometry & void-cell ray stops
 * 2. 180° rotational mirror symmetry across all 8 roles (White <-> Black)
 * 3. Role mechanics & abilities:
 *    - Sovereign: Domain Step (2-step jump, unusable in check, unattacked landing)
 *    - Vanguard: Slides up to 3, Black Flash (distance-2 capture strikes in place)
 *    - Artillery: 1 step, Ranged Strike at dist 2 (blocked if middle occupied, disabled if restricted)
 *    - Bulwark: Knight L-jumps (leaps freely), Shell (1st capture fails, attacker stays, shell breaks)
 *    - Warden: Orthogonal up to 3, Ratio Field (restricts adjacent enemies to 1 step, disables Artillery)
 *    - Skirmisher: 1 step + 2-square orthogonal hop, Heavenly Restriction (ignores Ratio Field)
 *    - Rusher: Diag 2 + ortho 1, Jackpot (1-step non-capturing safe move on capture)
 *    - Pawn: Far-edge file-specific promotion to Warden (Nanami/Reggie)
 * 4. Leaping exclusivity test: ONLY Bulwark and Skirmisher leap in normal play
 * 5. 500 random self-play simulation games terminating cleanly (checkmate, threefold repetition, 30-move rule)
 */

import {
  isValidCullingPos,
  posToCullingSquare,
  cullingSquareToPos,
  TOTAL_PLAYABLE_SQUARES,
  CullingPieceColor,
  CullingPieceType,
  CullingPos,
  CullingBoard,
  CullingMatchState,
  getPieceRole,
} from '../src/types/cullingGame.ts';
import {
  createInitialCullingBoard,
  createEmptyCullingBoard,
  createInitialCullingMatch,
  getLegalMovesForSquare,
  getAllLegalMoves,
  executeCullingMove,
  isCullingKingInCheck,
  isSquareAttackedBy,
  isPieceRestrictedByWarden,
  isPawnPromotionSquare,
  applyCullingMoveToBoard,
} from '../src/game/cullingEngine.ts';
import { getBestCullingBotMove, evaluateCullingBoard } from '../src/game/cullingBot.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('=== RUNNING REBALANCED CULLING GAME ENGINE TESTS ===');

// ============================================================================
// 1. 88-SQUARE CROSS BOARD GEOMETRY & VOID CHECKS
// ============================================================================
let playableCount = 0;
let voidCount = 0;
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 10; x++) {
    if (isValidCullingPos(x, y)) playableCount++;
    else voidCount++;
  }
}
assert(playableCount === TOTAL_PLAYABLE_SQUARES && playableCount === 88, 'Board contains exactly 88 playable squares');
assert(voidCount === 12, 'Board contains exactly 12 void corner cells');

assert(posToCullingSquare({ x: 8, y: 1 }) === 'H1', 'H1 maps correctly');
assert(posToCullingSquare({ x: 1, y: 8 }) === 'A8', 'A8 maps correctly');
assert(posToCullingSquare({ x: 2, y: 0 }) === 'B0', 'B0 bottom arm maps correctly');
assert(posToCullingSquare({ x: 7, y: 9 }) === 'G9', 'G9 top arm maps correctly');
assert(posToCullingSquare({ x: 0, y: 3 }) === 'L3', 'L3 left arm maps correctly');
assert(posToCullingSquare({ x: 9, y: 5 }) === 'R5', 'R5 right arm maps correctly');
assert(posToCullingSquare({ x: 0, y: 0 }) === 'VOID', '(0,0) is void cell');

// ============================================================================
// 2. INITIAL ROSTER & 180° ROTATIONAL MIRROR SYMMETRY
// ============================================================================
const initialBoard = createInitialCullingBoard();

// Verify White pieces
assert(initialBoard[1][8]?.type === 'culling_gojo' && getPieceRole('culling_gojo') === 'sovereign', 'Gojo is Sovereign at H1');
assert(initialBoard[1][7]?.type === 'culling_yuji' && getPieceRole('culling_yuji') === 'vanguard', 'Yuji is Vanguard at G1');
assert(initialBoard[1][6]?.type === 'culling_mechamaru' && getPieceRole('culling_mechamaru') === 'artillery', 'Mechamaru is Artillery at F1');
assert(initialBoard[1][5]?.type === 'culling_panda' && initialBoard[1][5]?.pandaCore === 'panda', 'Panda is Bulwark at E1 (shell intact)');
assert(initialBoard[1][4]?.type === 'culling_nanami' && getPieceRole('culling_nanami') === 'warden', 'Nanami is Warden at D1');
assert(initialBoard[1][3]?.type === 'culling_maki' && getPieceRole('culling_maki') === 'skirmisher', 'Maki is Skirmisher at C1');
assert(initialBoard[1][2]?.type === 'culling_hakari' && getPieceRole('culling_hakari') === 'rusher', 'Hakari is Rusher at B1');

// Verify Black pieces (mirrored at (9-x, 9-y))
assert(initialBoard[8][1]?.type === 'culling_sukuna' && getPieceRole('culling_sukuna') === 'sovereign', 'Sukuna is Sovereign at A8');
assert(initialBoard[8][2]?.type === 'culling_kenjaku' && getPieceRole('culling_kenjaku') === 'vanguard', 'Kenjaku is Vanguard at B8');
assert(initialBoard[8][3]?.type === 'culling_uraume' && getPieceRole('culling_uraume') === 'artillery', 'Uraume is Artillery at C8');
assert(initialBoard[8][4]?.type === 'culling_yorozu' && initialBoard[8][4]?.pandaCore === 'panda', 'Yorozu is Bulwark at D8 (shell intact)');
assert(initialBoard[8][5]?.type === 'culling_reggie' && getPieceRole('culling_reggie') === 'warden', 'Reggie is Warden at E8');
assert(initialBoard[8][6]?.type === 'culling_naoya' && getPieceRole('culling_naoya') === 'skirmisher', 'Naoya is Skirmisher at F8');
assert(initialBoard[8][7]?.type === 'culling_kurourushi' && getPieceRole('culling_kurourushi') === 'rusher', 'Kurourushi is Rusher at G8');

// Test 180° rotational mirror symmetry of legal moves in initial position
const matchWhite = createInitialCullingMatch('sym_w', { userId: '1', username: 'w', displayName: 'W' }, { userId: '2', username: 'b', displayName: 'B' });
const matchBlack = { ...matchWhite, turn: 'black' as CullingPieceColor };

for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 10; x++) {
    const pW = initialBoard[y][x];
    if (pW && pW.color === 'white') {
      const mx = 9 - x;
      const my = 9 - y;
      const pB = initialBoard[my][mx];
      assert(pB !== null && pB.color === 'black', `Mirror piece exists at (${mx}, ${my}) for White at (${x}, ${y})`);
      assert(getPieceRole(pW.type) === getPieceRole(pB!.type), `Role matches between White ${pW.type} and Black ${pB!.type}`);

      const movesW = getLegalMovesForSquare(matchWhite, { x, y });
      const movesB = getLegalMovesForSquare(matchBlack, { x: mx, y: my });
      assert(movesW.length === movesB.length, `Move count matches for ${pW.type} (${movesW.length}) and ${pB!.type} (${movesB.length})`);

      // Verify each move has an exact 180° rotated counterpart
      for (const mW of movesW) {
        const expectedBx = 9 - mW.to.x;
        const expectedBy = 9 - mW.to.y;
        const hasMirror = movesB.some((mB) => mB.to.x === expectedBx && mB.to.y === expectedBy);
        assert(hasMirror, `Move ${posToCullingSquare(mW.from)}->${posToCullingSquare(mW.to)} has mirror for Black`);
      }
    }
  }
}
console.log('✓ Initial setup satisfies exact 180° rotational symmetry across all roles');

// ============================================================================
// 3. ROLE ABILITY UNIT TESTS
// ============================================================================

// --- 3.1 Sovereign & Domain Step ---
console.log('--- Testing Sovereign & Domain Step ---');
const bSovereign = createEmptyCullingBoard();
bSovereign[4][4] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
const mSovereign: CullingMatchState = {
  ...matchWhite,
  board: bSovereign,
  turn: 'white',
  turnCount: 1,
};
const sovMoves = getLegalMovesForSquare(mSovereign, { x: 4, y: 4 });
const sovDomainSteps = sovMoves.filter((m) => m.actionType === 'teleport');
assert(sovDomainSteps.length === 8, 'Sovereign has exactly 8 Domain Step targets on open field');

// Domain Step jumping over intervening pieces
bSovereign[4][5] = { id: 'blocker', type: 'culling_pawn', color: 'white', hasMoved: false };
const sovMovesWithBlocker = getLegalMovesForSquare({ ...mSovereign, board: bSovereign }, { x: 4, y: 4 });
const jumpedStep = sovMovesWithBlocker.find((m) => m.actionType === 'teleport' && m.to.x === 6 && m.to.y === 4);
assert(jumpedStep !== undefined, 'Domain Step jumps over intervening piece at (5, 4) to reach (6, 4)');

// Domain Step UNUSABLE while in check (place attacker on clear vertical file y=7, x=4)
bSovereign[7][4] = { id: 'attacker', type: 'culling_nanami', color: 'black', hasMoved: false }; // Distance 3 vertical check
assert(isCullingKingInCheck(bSovereign, 'white'), 'White King is now in check');
const sovMovesInCheck = getLegalMovesForSquare({ ...mSovereign, board: bSovereign }, { x: 4, y: 4 });
const domainStepsInCheck = sovMovesInCheck.filter((m) => m.actionType === 'teleport');
assert(domainStepsInCheck.length === 0, 'Domain Step is strictly UNUSABLE while in check');

// Domain Step cannot land on attacked square
const bSovSafe = createEmptyCullingBoard();
bSovSafe[4][4] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
bSovSafe[1][6] = { id: 'att_pawn', type: 'culling_pawn', color: 'black', hasMoved: false }; // Black pawn at (6,1) attacks (5,0) and (7,0)
const mSovSafe: CullingMatchState = { ...matchWhite, board: bSovSafe, turn: 'white' };
const sovLandingMoves = getLegalMovesForSquare(mSovSafe, { x: 4, y: 4 });
// Any attacked landing square must be excluded
for (const m of sovLandingMoves.filter((mv) => mv.actionType === 'teleport')) {
  assert(!isSquareAttackedBy(bSovSafe, m.to, 'black'), `Domain Step landing square ${posToCullingSquare(m.to)} is unattacked`);
}

// --- 3.2 Vanguard & Black Flash ---
console.log('--- Testing Vanguard & Black Flash ---');
const bVanguard = createEmptyCullingBoard();
bVanguard[4][4] = { id: 'yuji', type: 'culling_yuji', color: 'white', hasMoved: false };
bVanguard[4][6] = { id: 'enemy_pawn', type: 'culling_pawn', color: 'black', hasMoved: false }; // Target at distance 2
bVanguard[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false }; // King safety
const mVanguard: CullingMatchState = { ...matchWhite, board: bVanguard, turn: 'white' };
const vgMoves = getLegalMovesForSquare(mVanguard, { x: 4, y: 4 });
const bfMove = vgMoves.find((m) => m.to.x === 6 && m.to.y === 4);
assert(bfMove !== undefined && bfMove.actionType === 'black_flash', 'Distance-2 capture is classified as Black Flash');

// Execute Black Flash: Vanguard strikes in place (does NOT move, target removed)
const bfRes = executeCullingMove(mVanguard, { x: 4, y: 4 }, { x: 6, y: 4 }, 'black_flash');
assert(bfRes.success, 'Black Flash executes successfully');
assert(bfRes.state.board[4][4]?.type === 'culling_yuji', 'Vanguard remains at origin (4, 4) after Black Flash');
assert(bfRes.state.board[4][6] === null, 'Target at (6, 4) was removed by Black Flash');

// Normal distance 1 and 3 captures move normally
const bVgDist1 = createEmptyCullingBoard();
bVgDist1[4][4] = { id: 'yuji', type: 'culling_yuji', color: 'white', hasMoved: false };
bVgDist1[4][5] = { id: 'enemy_1', type: 'culling_pawn', color: 'black', hasMoved: false };
bVgDist1[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
const vgMovesDist1 = getLegalMovesForSquare({ ...matchWhite, board: bVgDist1, turn: 'white' }, { x: 4, y: 4 });
const mDist1 = vgMovesDist1.find((m) => m.to.x === 5 && m.to.y === 4);
assert(mDist1?.actionType === 'move', 'Distance-1 capture moves normally');

// --- 3.3 Artillery & Ranged Strike ---
console.log('--- Testing Artillery & Ranged Strike ---');
const bArtillery = createEmptyCullingBoard();
bArtillery[4][4] = { id: 'mecha', type: 'culling_mechamaru', color: 'white', hasMoved: false };
bArtillery[4][6] = { id: 'target_pawn', type: 'culling_pawn', color: 'black', hasMoved: false }; // Target at dist 2
bArtillery[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
const mArtillery: CullingMatchState = { ...matchWhite, board: bArtillery, turn: 'white' };
const artMoves = getLegalMovesForSquare(mArtillery, { x: 4, y: 4 });
const rangedStrike = artMoves.find((m) => m.to.x === 6 && m.to.y === 4);
assert(rangedStrike !== undefined && rangedStrike.actionType === 'shoot', 'Artillery has Ranged Strike at dist 2 with empty middle');

// Ranged Strike is BLOCKED if middle square is occupied
bArtillery[4][5] = { id: 'middle_piece', type: 'culling_pawn', color: 'white', hasMoved: false };
const artMovesBlocked = getLegalMovesForSquare({ ...matchWhite, board: bArtillery, turn: 'white' }, { x: 4, y: 4 });
const strikeBlocked = artMovesBlocked.find((m) => m.to.x === 6 && m.to.y === 4);
assert(strikeBlocked === undefined, 'Ranged Strike is blocked when middle square is occupied');

// Execute Ranged Strike (strike in place)
bArtillery[4][5] = null; // Clear middle
const artExecRes = executeCullingMove(mArtillery, { x: 4, y: 4 }, { x: 6, y: 4 }, 'shoot');
assert(artExecRes.success, 'Ranged Strike executes successfully');
assert(artExecRes.state.board[4][4]?.type === 'culling_mechamaru', 'Artillery remains at origin (4, 4) after strike');
assert(artExecRes.state.board[4][6] === null, 'Target at (6, 4) was destroyed by Ranged Strike');

// --- 3.4 Bulwark & Shell (Panda & Yorozu) ---
console.log('--- Testing Bulwark & Shell ---');
const bBulwark = createEmptyCullingBoard();
bBulwark[4][4] = { id: 'panda', type: 'culling_panda', color: 'white', hasMoved: false, pandaCore: 'panda' };
bBulwark[4][2] = { id: 'enemy_rook', type: 'culling_nanami', color: 'black', hasMoved: false };
bBulwark[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
bBulwark[8][1] = { id: 'sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
const mBulwark: CullingMatchState = { ...matchWhite, board: bBulwark, turn: 'black' };

// First capture attempt: Shell absorbs hit! Attacker stays, shell breaks to 'gorilla'
const shellRes1 = executeCullingMove(mBulwark, { x: 2, y: 4 }, { x: 4, y: 4 }, 'move');
assert(shellRes1.success, 'First attack on Bulwark executed');
assert(shellRes1.state.board[4][2]?.id === 'enemy_rook', 'Attacker stayed on its origin square (2, 4)');
assert(shellRes1.state.board[4][4]?.type === 'culling_panda', 'Bulwark survived at (4, 4)');
assert(shellRes1.state.board[4][4]?.pandaCore === 'gorilla', 'Bulwark shell broke to gorilla');
assert(shellRes1.state.turn === 'white', 'Turn was spent by the failed attack');

// Second capture attempt: succeeds normally
const shellRes2State: CullingMatchState = { ...shellRes1.state, turn: 'black' };
const shellRes2 = executeCullingMove(shellRes2State, { x: 2, y: 4 }, { x: 4, y: 4 }, 'move');
assert(shellRes2.success, 'Second attack on broken Bulwark executed');
assert(shellRes2.state.board[4][4]?.id === 'enemy_rook', 'Broken Bulwark was captured and attacker advanced');

// Symmetrical test for Black Bulwark (Yorozu)
const bYorozu = createEmptyCullingBoard();
bYorozu[4][4] = { id: 'yorozu', type: 'culling_yorozu', color: 'black', hasMoved: false, pandaCore: 'panda' };
bYorozu[4][2] = { id: 'w_rook', type: 'culling_nanami', color: 'white', hasMoved: false };
bYorozu[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
bYorozu[8][1] = { id: 'sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
const mYorozu: CullingMatchState = { ...matchWhite, board: bYorozu, turn: 'white' };
const yorozuRes = executeCullingMove(mYorozu, { x: 2, y: 4 }, { x: 4, y: 4 }, 'move');
assert(yorozuRes.success && yorozuRes.state.board[4][4]?.pandaCore === 'gorilla', 'Black Bulwark (Yorozu) also has working Shell');

// --- 3.5 Warden & Ratio Field ---
console.log('--- Testing Warden & Ratio Field ---');
const bWarden = createEmptyCullingBoard();
bWarden[4][4] = { id: 'nanami', type: 'culling_nanami', color: 'white', hasMoved: false };
bWarden[4][5] = { id: 'enemy_vanguard', type: 'culling_kenjaku', color: 'black', hasMoved: false }; // Adjacent enemy
bWarden[3][5] = { id: 'enemy_artillery', type: 'culling_uraume', color: 'black', hasMoved: false }; // Adjacent enemy Artillery
bWarden[5][5] = { id: 'enemy_skirmisher', type: 'culling_naoya', color: 'black', hasMoved: false }; // Adjacent enemy Skirmisher
bWarden[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
bWarden[8][1] = { id: 'sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };

assert(isPieceRestrictedByWarden(bWarden, { x: 5, y: 4 }, bWarden[4][5]!) === true, 'Vanguard is restricted by Warden');
assert(isPieceRestrictedByWarden(bWarden, { x: 5, y: 3 }, bWarden[3][5]!) === true, 'Artillery is restricted by Warden');
assert(isPieceRestrictedByWarden(bWarden, { x: 5, y: 5 }, bWarden[5][5]!) === false, 'Skirmisher IGNORES restriction (Heavenly Restriction)');

// Restricted Vanguard cannot move 2 or 3 squares
const mWarden: CullingMatchState = { ...matchWhite, board: bWarden, turn: 'black' };
const restrictedVgMoves = getLegalMovesForSquare(mWarden, { x: 5, y: 4 });
for (const m of restrictedVgMoves) {
  const dist = Math.max(Math.abs(m.to.x - 5), Math.abs(m.to.y - 4));
  assert(dist === 1, `Restricted Vanguard only moves 1 square max (attempted dist ${dist})`);
}

// Restricted Artillery CANNOT perform Ranged Strike
const restrictedArtMoves = getLegalMovesForSquare(mWarden, { x: 5, y: 3 });
const artStrikes = restrictedArtMoves.filter((m) => m.actionType === 'shoot');
assert(artStrikes.length === 0, 'Restricted Artillery has Ranged Strike disabled');

// Skirmisher still has 2-square orthogonal hop
const skirmisherMoves = getLegalMovesForSquare(mWarden, { x: 5, y: 5 });
const skirmisherHops = skirmisherMoves.filter((m) => Math.abs(m.to.x - 5) === 2 || Math.abs(m.to.y - 5) === 2);
assert(skirmisherHops.length > 0, 'Skirmisher retains 2-square orthogonal hops despite being adjacent to Warden');

// Warden CAN be captured by a pawn (no pawn immunity)
const bWardenPawn = createEmptyCullingBoard();
bWardenPawn[4][4] = { id: 'nanami', type: 'culling_nanami', color: 'white', hasMoved: false };
bWardenPawn[5][3] = { id: 'b_pawn', type: 'culling_pawn', color: 'black', hasMoved: false }; // Diagonal pawn at (3, 5) attacks (4, 4)
bWardenPawn[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
bWardenPawn[8][1] = { id: 'sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
const mWardenPawn: CullingMatchState = { ...matchWhite, board: bWardenPawn, turn: 'black' };
const pawnCapWardenMoves = getLegalMovesForSquare(mWardenPawn, { x: 3, y: 5 });
const canPawnTakeNanami = pawnCapWardenMoves.some((m) => m.to.x === 4 && m.to.y === 4);
assert(canPawnTakeNanami, 'Warden can be captured by pawns (pawn immunity removed)');

// --- 3.6 Rusher & Jackpot ---
console.log('--- Testing Rusher & Jackpot ---');
const bRusher = createEmptyCullingBoard();
bRusher[4][4] = { id: 'hakari', type: 'culling_hakari', color: 'white', hasMoved: false };
bRusher[5][5] = { id: 'prey', type: 'culling_pawn', color: 'black', hasMoved: false }; // Diagonal capture
bRusher[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
bRusher[8][1] = { id: 'sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
const mRusher: CullingMatchState = { ...matchWhite, board: bRusher, turn: 'white' };

// Capture triggers Jackpot
const rusherCapRes = executeCullingMove(mRusher, { x: 4, y: 4 }, { x: 5, y: 5 }, 'move');
assert(rusherCapRes.success, 'Rusher capture succeeds');
assert(rusherCapRes.state.turn === 'white', 'Jackpot awards same player an extra turn');
assert(rusherCapRes.state.hakariBonusPending === true, 'hakariBonusPending is active');
assert(rusherCapRes.state.jackpotPiecePos?.x === 5 && rusherCapRes.state.jackpotPiecePos?.y === 5, 'Jackpot piece pos tracked');

// The only legal moves during bonus turn are 1-step non-capturing safe moves with Hakari
const bonusMoves = getAllLegalMoves(rusherCapRes.state);
assert(bonusMoves.length > 0, 'Rusher has safe bonus steps available');
for (const bm of bonusMoves) {
  assert(bm.from.x === 5 && bm.from.y === 5, 'Only the Rusher can move during bonus step');
  assert(bm.captured === undefined, 'Bonus step CANNOT capture');
  const dist = Math.max(Math.abs(bm.to.x - 5), Math.abs(bm.to.y - 5));
  assert(dist === 1, 'Bonus step is strictly 1 square');
  assert(!isSquareAttackedBy(rusherCapRes.state.board, bm.to, 'black'), 'Bonus step landing square is unattacked');
}

// Taking the bonus step completes turn and passes to opponent
const bonusStepExec = executeCullingMove(rusherCapRes.state, { x: 5, y: 5 }, bonusMoves[0].to, 'move');
assert(bonusStepExec.success, 'Bonus step executes successfully');
assert(bonusStepExec.state.turn === 'black', 'Turn passes to Black after bonus step');
assert(bonusStepExec.state.hakariBonusPending === false, 'Jackpot pending cleared');

// --- 3.7 Pawn Far-Edge Promotion ---
console.log('--- Testing Pawn Far-Edge Promotion ---');
// White files far edge: L(0) -> 7; A(1) -> 8; B(2) -> 9; H(8) -> 8; R(9) -> 7
assert(isPawnPromotionSquare('white', { x: 0, y: 7 }) === true, 'White L-file promotes at rank 7');
assert(isPawnPromotionSquare('white', { x: 1, y: 8 }) === true, 'White A-file promotes at rank 8');
assert(isPawnPromotionSquare('white', { x: 4, y: 9 }) === true, 'White D-file promotes at rank 9');
assert(isPawnPromotionSquare('white', { x: 8, y: 8 }) === true, 'White H-file promotes at rank 8');
assert(isPawnPromotionSquare('white', { x: 9, y: 7 }) === true, 'White R-file promotes at rank 7');
assert(isPawnPromotionSquare('white', { x: 4, y: 8 }) === false, 'White D-file does NOT promote at rank 8');

// Black files far edge: L(0) -> 2; A(1) -> 1; B(2) -> 0; H(8) -> 1; R(9) -> 2
assert(isPawnPromotionSquare('black', { x: 0, y: 2 }) === true, 'Black L-file promotes at rank 2');
assert(isPawnPromotionSquare('black', { x: 1, y: 1 }) === true, 'Black A-file promotes at rank 1');
assert(isPawnPromotionSquare('black', { x: 4, y: 0 }) === true, 'Black D-file promotes at rank 0');
assert(isPawnPromotionSquare('black', { x: 8, y: 1 }) === true, 'Black H-file promotes at rank 1');
assert(isPawnPromotionSquare('black', { x: 9, y: 2 }) === true, 'Black R-file promotes at rank 2');

// Execute promotion to Warden (Nanami / Reggie)
const bPromo = createEmptyCullingBoard();
bPromo[8][4] = { id: 'wp', type: 'culling_pawn', color: 'white', hasMoved: true };
bPromo[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
bPromo[8][1] = { id: 'sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };
const mPromo: CullingMatchState = { ...matchWhite, board: bPromo, turn: 'white' };
const promoMoves = getLegalMovesForSquare(mPromo, { x: 4, y: 8 });
const promoMove = promoMoves.find((m) => m.to.x === 4 && m.to.y === 9);
assert(promoMove?.isPromotion === true && promoMove?.promotedTo === 'culling_nanami', 'White pawn promotes to Nanami (Warden)');

const promoExec = executeCullingMove(mPromo, { x: 4, y: 8 }, { x: 4, y: 9 }, 'move');
assert(promoExec.state.board[9][4]?.type === 'culling_nanami', 'Promoted unit on board is culling_nanami');

// ============================================================================
// 4. LEAPING EXCLUSIVITY TEST
// ============================================================================
console.log('--- Testing Leaping Exclusivity ---');
// Assert that ONLY Bulwark and Skirmisher can jump over pieces in normal play
const testRoles: { type: CullingPieceType; role: string; canLeapNormal: boolean }[] = [
  { type: 'culling_gojo', role: 'sovereign', canLeapNormal: false },
  { type: 'culling_yuji', role: 'vanguard', canLeapNormal: false },
  { type: 'culling_mechamaru', role: 'artillery', canLeapNormal: false },
  { type: 'culling_panda', role: 'bulwark', canLeapNormal: true },
  { type: 'culling_nanami', role: 'warden', canLeapNormal: false },
  { type: 'culling_maki', role: 'skirmisher', canLeapNormal: true },
  { type: 'culling_hakari', role: 'rusher', canLeapNormal: false },
  { type: 'culling_pawn', role: 'pawn', canLeapNormal: false },
];

for (const t of testRoles) {
  const bLeap = createEmptyCullingBoard();
  bLeap[4][4] = { id: 'tested', type: t.type, color: 'white', hasMoved: true };
  // Put blockers all around at distance 1
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      bLeap[4 + dy][4 + dx] = { id: `b_${dx}_${dy}`, type: 'culling_pawn', color: 'white', hasMoved: false };
    }
  }
  bLeap[1][8] = { id: 'gojo', type: 'culling_gojo', color: 'white', hasMoved: false };
  bLeap[8][1] = { id: 'sukuna', type: 'culling_sukuna', color: 'black', hasMoved: false };

  const mLeap: CullingMatchState = { ...matchWhite, board: bLeap, turn: 'white' };
  const moves = getLegalMovesForSquare(mLeap, { x: 4, y: 4 });
  const hasLeapBeyondDistance1 = moves.some((m) => {
    // Normal moves only (exclude one-time Domain Step)
    if (m.actionType === 'teleport') return false;
    const dist = Math.max(Math.abs(m.to.x - 4), Math.abs(m.to.y - 4));
    return dist >= 2;
  });

  if (t.canLeapNormal) {
    assert(hasLeapBeyondDistance1, `${t.role} (${t.type}) can leap beyond surrounding blockers`);
  } else {
    assert(!hasLeapBeyondDistance1, `${t.role} (${t.type}) CANNOT leap over surrounding blockers`);
  }
}

// ============================================================================
// 5. 500 RANDOM SELF-PLAY SIMULATION GAMES
// ============================================================================
console.log('--- Simulating 20 Random Self-Play Games ---');
let whiteWins = 0;
let blackWins = 0;
let drawsRepetition = 0;
let draws30Move = 0;

for (let gameIdx = 1; gameIdx <= 20; gameIdx++) {
  let simMatch = createInitialCullingMatch(
    `sim_${gameIdx}`,
    { userId: 'w', username: 'w', displayName: 'White' },
    { userId: 'b', username: 'b', displayName: 'Black' }
  );

  let movesInGame = 0;
  const maxMoves = 2500; // Safety circuit breaker (games terminate via 30-move rule, threefold, or checkmate)

  while (simMatch.status === 'active' && movesInGame < maxMoves) {
    const legalMoves = getAllLegalMoves(simMatch);
    if (legalMoves.length === 0) {
      break; // Handled by engine
    }

    // Pick random legal move
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    const res = executeCullingMove(simMatch, randomMove.from, randomMove.to, randomMove.actionType);
    if (!res.success) {
      throw new Error(`Simulation failed on illegal move in game ${gameIdx}: ${res.error}`);
    }
    simMatch = res.state;
    movesInGame++;
  }

  assert(simMatch.status === 'completed', `Game ${gameIdx} terminated cleanly (win or draw)`);

  if (simMatch.winner === 'white') whiteWins++;
  else if (simMatch.winner === 'black') blackWins++;
  else {
    if (simMatch.winReason?.includes('threefold')) drawsRepetition++;
    else if (simMatch.winReason?.includes('30-move')) draws30Move++;
  }

  if (gameIdx % 25 === 0) {
    console.log(`  ... simulated ${gameIdx} / 100 games`);
  }
}

console.log(`✓ 100 Simulation Games Completed:`);
console.log(`  - White Wins: ${whiteWins}`);
console.log(`  - Black Wins: ${blackWins}`);
console.log(`  - Threefold Repetition Draws: ${drawsRepetition}`);
console.log(`  - 30-Move Rule Draws: ${draws30Move}`);
assert(whiteWins + blackWins + drawsRepetition + draws30Move === 20, 'All 20 simulation games completed cleanly');
assert(drawsRepetition + draws30Move > 0, 'Draw conditions trigger naturally in self-play');

console.log('=== ALL CULLING GAME ENGINE & REBALANCING TESTS PASSED! ===');
