/**
 * src/training/validateLessons.ts
 *
 * Universal, Engine-Authoritative Validator for ALL Training Content:
 * - Culling Opening Dojo (16 lessons, 128 steps)
 * - Hashira Dojo Katas & Ranks (22 lessons, 50 steps)
 *
 * Pure functions only - safe for tests, dev runtime logging, and CLI scripts.
 */

import { CULLING_OPENING_LESSONS } from './cullingOpeningData.js';
import { DOJO_LESSONS } from './data.js';
import type { CullingOpeningLesson, CullingOpeningStep, DojoLesson, KataStep } from './types.js';
import {
  createInitialCullingMatch,
  executeCullingMove,
  applyCullingMoveToBoard,
  getLegalMovesForSquare as getCullingLegalMovesForSquare,
  getAllLegalMoves as getAllCullingLegalMoves,
  isCullingKingInCheck,
  isSquareAttackedBy,
  cloneCullingBoard,
} from '../game/cullingEngine.js';
import {
  createInitialBoard,
  getLegalMovesForSquare as getStandardLegalMovesForSquare,
  applyMoveToBoard,
  isKingInCheck as isStandardKingInCheck,
  cloneBoard,
} from '../game/engine.ts';
import type { Position, PieceColor } from '../types/game.ts';
import type { CullingPos, CullingMatchState, CullingBoard } from '../types/cullingGame.ts';
import { getPieceRole, CULLING_MATERIAL_VALUES, posToCullingSquare } from '../types/cullingGame.ts';

export interface ValidationFailure {
  lessonId: string;
  lessonTitle: string;
  stepIndex: number;
  rule: string;
  expected: string;
  actual: string;
  legalMoves?: string[];
}

export interface ValidationReport {
  totalLessons: number;
  passedLessons: number;
  failedLessons: number;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  failures: ValidationFailure[];
  lessonSummaries: Array<{
    id: string;
    title: string;
    type: 'culling_opening' | 'dojo_kata';
    stepsTotal: number;
    stepsPassed: number;
    status: 'PASSED' | 'FAILED';
  }>;
}

/**
 * Validates a single Culling Opening Lesson step-by-step against cullingEngine rules.
 */
export function validateCullingOpeningLesson(
  lesson: CullingOpeningLesson,
  failures: ValidationFailure[]
): number {
  let match = createInitialCullingMatch(
    `val_${lesson.id}`,
    { userId: 'player', username: 'Pupil', displayName: 'Pupil' },
    { userId: 'tukuna_bot', username: 'Sensei Tukuna', displayName: 'Sensei Tukuna' }
  );

  if (lesson.initialBoard) {
    match.board = cloneCullingBoard(lesson.initialBoard);
  }

  let stepsPassed = 0;

  for (let sIdx = 0; sIdx < lesson.steps.length; sIdx++) {
    const step = lesson.steps[sIdx];
    const from = step.from;
    const to = step.to;
    const stepNum = sIdx + 1;

    // 1. Piece exists & belongs to active color
    const movingPiece = match.board[from.y]?.[from.x];
    if (!movingPiece) {
      failures.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        stepIndex: stepNum,
        rule: 'RULE_1_PIECE_EXISTS',
        expected: `Piece at (${from.x},${from.y})`,
        actual: `Empty square (null/undefined)`,
      });
      break;
    }

    if (movingPiece.color !== lesson.playerColor) {
      failures.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        stepIndex: stepNum,
        rule: 'RULE_1_PIECE_COLOR',
        expected: `Piece color '${lesson.playerColor}'`,
        actual: `Piece color '${movingPiece.color}'`,
      });
      break;
    }

    // 2. Move Legality
    const legalMoves = getCullingLegalMovesForSquare(match, from);
    const legalMoveStrings = legalMoves.map(
      (m) => `(${m.to.x},${m.to.y})[action:${m.actionType || 'move'}]`
    );

    const isPrimaryLegal = legalMoves.some((m) => m.to.x === to.x && m.to.y === to.y);
    const isAcceptedLegal =
      step.acceptedMoves?.some((m) => m.from.x === from.x && m.from.y === from.y && m.to.x === to.x && m.to.y === to.y) ?? false;

    if (!isPrimaryLegal && !isAcceptedLegal) {
      failures.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        stepIndex: stepNum,
        rule: 'RULE_2_ILLEGAL_MOVE',
        expected: `Move (${from.x},${from.y}) -> (${to.x},${to.y}) in legal moves`,
        actual: `Illegal move`,
        legalMoves: legalMoveStrings,
      });
      break;
    }

    // 3. Label & Notation & Vector Consistency (Primary move arrow must match step.from -> step.to)
    if (step.vectorArrows && step.vectorArrows.length > 0) {
      const primaryVec = step.vectorArrows[0];
      if (
        primaryVec.from.x !== from.x ||
        primaryVec.from.y !== from.y ||
        primaryVec.to.x !== to.x ||
        primaryVec.to.y !== to.y
      ) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_3_VECTOR_MISMATCH',
          expected: `Primary vector from (${from.x},${from.y}) to (${to.x},${to.y})`,
          actual: `Primary vector from (${primaryVec.from.x},${primaryVec.from.y}) to (${primaryVec.to.x},${primaryVec.to.y})`,
        });
      }
    }

    // Check notation capture claim (e.g. "B5 × B6", "B5xB6", "Qxh7", "takes", "capture")
    const notationText = step.notation || '';
    const hasCaptureSymbol = notationText.includes('×') || /\b(x|capture|takes|capturing)\b/i.test(notationText) || /[A-H0-9]x[A-H0-9]/i.test(notationText);
    const hasArrow = notationText.includes('→') || notationText.includes('->');
    const isCaptureInNotation = hasCaptureSymbol && !hasArrow;
    const targetPieceBefore = match.board[to.y]?.[to.x];
    if (isCaptureInNotation && !targetPieceBefore && step.actionType !== 'black_flash' && step.actionType !== 'shoot') {
      failures.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        stepIndex: stepNum,
        rule: 'RULE_3_CAPTURE_LABEL_MISMATCH',
        expected: `Target square (${to.x},${to.y}) occupied by enemy piece for capture notation '${step.notation}'`,
        actual: `Target square is empty`,
      });
    }

    // 4. Pre-move check resolution check
    const wasInCheckBefore = isCullingKingInCheck(match.board, lesson.playerColor);

    // Execute Move
    const res = executeCullingMove(match, from, to, step.actionType || 'move');
    if (!res.success) {
      failures.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        stepIndex: stepNum,
        rule: 'RULE_2_EXECUTION_FAILED',
        expected: `executeCullingMove success`,
        actual: `Failed: ${res.error}`,
        legalMoves: legalMoveStrings,
      });
      break;
    }

    match = res.state;

    // Confirm pre-move check was resolved
    if (wasInCheckBefore) {
      const isInCheckAfter = isCullingKingInCheck(match.board, lesson.playerColor);
      if (isInCheckAfter) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_4_CHECK_NOT_RESOLVED',
          expected: `Move resolves check on ${lesson.playerColor} King`,
          actual: `King remains in check`,
        });
        break;
      }
    }

    // Check notation check/mate claim after move
    const isCheckInNotation = step.notation?.includes('Check!') || step.notation?.includes('+');
    const isMateInNotation = step.notation?.includes('CHECKMATE') || step.notation?.includes('#');
    const opponentColor = lesson.playerColor === 'white' ? 'black' : 'white';
    const isOppInCheckNow = isCullingKingInCheck(match.board, opponentColor);

    if (isCheckInNotation && !isMateInNotation && !isOppInCheckNow) {
      failures.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        stepIndex: stepNum,
        rule: 'RULE_3_CHECK_CLAIM_INVALID',
        expected: `Opponent King in check for notation '${step.notation}'`,
        actual: `Opponent King is not in check`,
      });
    }

    if (isMateInNotation) {
      const oppLegalMoves = getAllCullingLegalMoves(match);
      if (!isOppInCheckNow || oppLegalMoves.length > 0) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_3_CHECKMATE_CLAIM_INVALID',
          expected: `Checkmate (in check AND 0 legal moves) for notation '${step.notation}'`,
          actual: `InCheck=${isOppInCheckNow}, LegalRepliesCount=${oppLegalMoves.length}`,
        });
      }
    }

    // 4b. TACTICAL PIECE-SAFETY AUDIT (RULE_7_PIECE_SAFETY):
    // When turn passes to Opponent (i.e. match is active and no same-turn Jackpot bonus is pending),
    // verify NO friendly non-pawn piece (>= 3.5 value) is left hanging to:
    //  (a) an enemy Pawn (1.0 value),
    //  (b) an enemy Ranged Strike ('shoot') or Black Flash ('black_flash') that destroys it without moving,
    //  (c) a lower-value enemy piece, or
    //  (d) an undefended free capture (en prise).
    // Intact Bulwark Shell ('panda') absorbs the first hit without dying, EXCEPT we still forbid gifting
    // Panda's Shell to a 1-point enemy Pawn!
    if (match.status === 'active' && match.turn !== lesson.playerColor) {
      const oppLegalNow = getAllCullingLegalMoves(match);
      for (const oppMove of oppLegalNow) {
        const victim = match.board[oppMove.to.y]?.[oppMove.to.x];
        if (!victim || victim.color !== lesson.playerColor) continue;

        const victimRole = getPieceRole(victim.type);
        if (victimRole === 'pawn' || victimRole === 'swarm') continue;

        const attackerRole = getPieceRole(oppMove.piece.type);
        const victimVal = CULLING_MATERIAL_VALUES[victimRole];
        const attackerVal = CULLING_MATERIAL_VALUES[attackerRole];
        const hasIntactShell = victimRole === 'bulwark' && victim.pandaCore !== 'gorilla';

        // Never place any expensive piece (even intact Panda) where an enemy Pawn can hit it!
        if (attackerRole === 'pawn') {
          failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            stepIndex: stepNum,
            rule: 'RULE_7_EXPENSIVE_PIECE_IN_PAWN_RANGE',
            expected: `No friendly non-pawn unit exposed to enemy pawn capture`,
            actual: `${victim.type} at ${posToCullingSquare(oppMove.to)} can be struck by enemy pawn from ${posToCullingSquare(oppMove.from)}`,
          });
          break;
        }

        // If victim has intact Bulwark Shell against a non-pawn attacker, it cannot be captured this ply
        if (hasIntactShell) continue;

        // Ranged Strike ('shoot') or Black Flash ('black_flash') destroys our piece without moving onto square
        if (oppMove.actionType === 'shoot' || oppMove.actionType === 'black_flash') {
          failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            stepIndex: stepNum,
            rule: 'RULE_7_EXPOSED_TO_RANGED_OR_BLACK_FLASH',
            expected: `No friendly non-pawn unit exposed to free ${oppMove.actionType}`,
            actual: `${victim.type} at ${posToCullingSquare(oppMove.to)} can be eliminated via ${oppMove.actionType} by ${oppMove.piece.type} at ${posToCullingSquare(oppMove.from)}`,
          });
          break;
        }

        // Lower-value attacker capturing strictly higher-value friendly piece (losing trade even if defended)
        if (attackerVal < victimVal) {
          failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            stepIndex: stepNum,
            rule: 'RULE_7_UNFAVORABLE_EXCHANGE_EXPOSURE',
            expected: `Higher-value ${victim.type} (${victimVal}) not exposed to lower-value ${oppMove.piece.type} (${attackerVal})`,
            actual: `${oppMove.piece.type} at ${posToCullingSquare(oppMove.from)} can capture ${victim.type} at ${posToCullingSquare(oppMove.to)}`,
          });
          break;
        }

        // Equal/higher-value attacker capturing an UNDEFENDED friendly non-pawn piece (en prise)
        const { board: afterOppCap } = applyCullingMoveToBoard(match.board, oppMove, match.turnCount);
        const canPlayerRecapture = isSquareAttackedBy(afterOppCap, oppMove.to, lesson.playerColor);
        if (!canPlayerRecapture) {
          failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            stepIndex: stepNum,
            rule: 'RULE_7_UNDEFENDED_PIECE_HANGING',
            expected: `${victim.type} at ${posToCullingSquare(oppMove.to)} defended or unattacked`,
            actual: `Undefended ${victim.type} at ${posToCullingSquare(oppMove.to)} hangs for free to ${oppMove.piece.type} at ${posToCullingSquare(oppMove.from)}`,
          });
          break;
        }
      }
    }

    // 5. Scripted Opponent Response
    if (step.opponentResponse) {
      const opp = step.opponentResponse;
      const oppPiece = match.board[opp.from.y]?.[opp.from.x];
      if (!oppPiece || oppPiece.color !== opponentColor) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_5_OPPONENT_PIECE_INVALID',
          expected: `Opponent piece at (${opp.from.x},${opp.from.y}) with color ${opponentColor}`,
          actual: oppPiece ? `Color ${oppPiece.color}` : `Null piece`,
        });
        break;
      }

      const oppAction = opp.actionType || 'move';
      const oppLegal = getCullingLegalMovesForSquare(match, opp.from);
      const isOppLegal = oppLegal.some(
        (m) => m.to.x === opp.to.x && m.to.y === opp.to.y && (m.actionType || 'move') === oppAction
      );
      if (!isOppLegal) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_5_OPPONENT_MOVE_ILLEGAL',
          expected: `Opponent response (${opp.from.x},${opp.from.y}) -> (${opp.to.x},${opp.to.y}) [${oppAction}] legal`,
          actual: `Illegal opponent move`,
          legalMoves: oppLegal.map((m) => `(${m.to.x},${m.to.y})[${m.actionType || 'move'}]`),
        });
        break;
      }

      const oppRes = executeCullingMove(match, opp.from, opp.to, oppAction);
      if (!oppRes.success) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_5_OPPONENT_EXECUTION_FAILED',
          expected: `Opponent move executed successfully`,
          actual: `Failed: ${oppRes.error}`,
        });
        break;
      }
      match = oppRes.state;
    }

    // 6. Post-move Legal Moves Check
    const isFinalStep = sIdx === lesson.steps.length - 1;
    if (!isFinalStep && !isMateInNotation) {
      const playerLegalMoves = getCullingLegalMovesForSquare(match, lesson.steps[sIdx + 1].from);
      if (playerLegalMoves.length === 0) {
        // Fallback check all player pieces
        const allMoves = getAllCullingLegalMoves(match);
        if (allMoves.length === 0) {
          failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            stepIndex: stepNum,
            rule: 'RULE_6_STALEMATE_LOCK',
            expected: `Player has legal moves after step ${stepNum}`,
            actual: `0 legal moves available (stalemate/lock)`,
          });
        }
      }
    }

    stepsPassed++;
  }

  return stepsPassed;
}

/**
 * Validates a single Hashira Dojo Kata step-by-step against standard or culling engine rules.
 */
export function validateDojoKataLesson(
  lesson: DojoLesson,
  failures: ValidationFailure[]
): number {
  const isCulling = lesson.tool === 'culling' || Boolean(lesson.cullingBoard);

  if (isCulling) {
    let match = createInitialCullingMatch(
      `kata_val_${lesson.id}`,
      { userId: 'player', username: 'Pupil', displayName: 'Pupil' },
      { userId: 'kata_bot', username: 'Sensei', displayName: 'Sensei' }
    );
    if (lesson.cullingBoard) {
      match.board = cloneCullingBoard(lesson.cullingBoard);
    }
    if (lesson.cullingPlayerColor) {
      match.turn = lesson.cullingPlayerColor;
    }

    let stepsPassed = 0;

    for (let sIdx = 0; sIdx < lesson.correctSteps.length; sIdx++) {
      const step = lesson.correctSteps[sIdx];
      const stepNum = sIdx + 1;
      const from = step.from;
      const to = step.to;

      // Piece existence & color
      const piece = match.board[from.y]?.[from.x];
      if (!piece) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_1_PIECE_EXISTS',
          expected: `Piece at (${from.x},${from.y})`,
          actual: `Empty square`,
        });
        break;
      }

      // Legal moves
      const legalMoves = getCullingLegalMovesForSquare(match, from);
      const isLegal = legalMoves.some((m) => m.to.x === to.x && m.to.y === to.y);
      const isAccepted =
        step.acceptedMoves?.some((m) => m.from.x === from.x && m.from.y === from.y && m.to.x === to.x && m.to.y === to.y) ?? false;

      if (!isLegal && !isAccepted) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_2_ILLEGAL_MOVE',
          expected: `Move (${from.x},${from.y}) -> (${to.x},${to.y}) in legal moves`,
          actual: `Illegal move`,
          legalMoves: legalMoves.map((m) => `(${m.to.x},${m.to.y})`),
        });
        break;
      }

      const execRes = executeCullingMove(match, from, to, step.cullingActionType || 'move');
      if (!execRes.success) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_2_EXECUTION_FAILED',
          expected: `executeCullingMove success`,
          actual: `Failed: ${execRes.error}`,
        });
        break;
      }
      match = execRes.state;

      // Opponent response
      const oppResp = lesson.opponentResponses?.find((r) => r.triggerStepIndex === sIdx);
      if (oppResp) {
        const oppLegal = getCullingLegalMovesForSquare(match, oppResp.from);
        const oppIsLegal = oppLegal.some((m) => m.to.x === oppResp.to.x && m.to.y === oppResp.to.y);
        if (!oppIsLegal) {
          failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            stepIndex: stepNum,
            rule: 'RULE_5_OPPONENT_MOVE_ILLEGAL',
            expected: `Opponent response (${oppResp.from.x},${oppResp.from.y}) -> (${oppResp.to.x},${oppResp.to.y}) legal`,
            actual: `Illegal move`,
            legalMoves: oppLegal.map((m) => `(${m.to.x},${m.to.y})`),
          });
          break;
        }

        const oppExec = executeCullingMove(match, oppResp.from, oppResp.to, 'move');
        if (!oppExec.success) {
          failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            stepIndex: stepNum,
            rule: 'RULE_5_OPPONENT_EXECUTION_FAILED',
            expected: `Opponent response executed`,
            actual: `Failed: ${oppExec.error}`,
          });
          break;
        }
        match = oppExec.state;
      }

      stepsPassed++;
    }

    return stepsPassed;
  } else {
    // Standard Chess Kata Validation
    let board = lesson.initialBoard ? cloneBoard(lesson.initialBoard) : [];
    let turn: PieceColor = lesson.playerColor || 'white';
    let stepsPassed = 0;

    for (let sIdx = 0; sIdx < lesson.correctSteps.length; sIdx++) {
      const step = lesson.correctSteps[sIdx];
      const stepNum = sIdx + 1;
      const from = step.from;
      const to = step.to;

      const piece = board[from.y]?.[from.x];
      if (!piece) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_1_PIECE_EXISTS',
          expected: `Piece at (${from.x},${from.y})`,
          actual: `Empty square`,
        });
        break;
      }

      if (piece.color !== turn) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_1_PIECE_COLOR',
          expected: `Piece color '${turn}'`,
          actual: `Piece color '${piece.color}'`,
        });
        break;
      }

      const legalDests = getStandardLegalMovesForSquare(board, from);
      const isLegal = legalDests.some((m) => m.to.x === to.x && m.to.y === to.y);
      const isAccepted =
        step.acceptedMoves?.some((m) => m.from.x === from.x && m.from.y === from.y && m.to.x === to.x && m.to.y === to.y) ?? false;

      if (!isLegal && !isAccepted) {
        failures.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          stepIndex: stepNum,
          rule: 'RULE_2_ILLEGAL_MOVE',
          expected: `Move (${from.x},${from.y}) -> (${to.x},${to.y}) in legal moves`,
          actual: `Illegal move`,
          legalMoves: legalDests.map((m) => `(${m.to.x},${m.to.y})`),
        });
        break;
      }

      // Apply move
      board = applyMoveToBoard(board, {
        from,
        to,
        piece,
        captured: board[to.y]?.[to.x] || undefined,
        timestamp: Date.now(),
      });
      turn = turn === 'white' ? 'black' : 'white';

      // Opponent response
      const oppResp = lesson.opponentResponses?.find((r) => r.triggerStepIndex === sIdx);
      if (oppResp) {
        const oppPiece = board[oppResp.from.y]?.[oppResp.from.x];
        if (!oppPiece || oppPiece.color !== turn) {
          failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            stepIndex: stepNum,
            rule: 'RULE_5_OPPONENT_PIECE_INVALID',
            expected: `Opponent piece at (${oppResp.from.x},${oppResp.from.y}) with color ${turn}`,
            actual: oppPiece ? `Color ${oppPiece.color}` : `Null piece`,
          });
          break;
        }

        const oppDests = getStandardLegalMovesForSquare(board, oppResp.from);
        const oppIsLegal = oppDests.some((m) => m.to.x === oppResp.to.x && m.to.y === oppResp.to.y);
        if (!oppIsLegal) {
          failures.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            stepIndex: stepNum,
            rule: 'RULE_5_OPPONENT_MOVE_ILLEGAL',
            expected: `Opponent response (${oppResp.from.x},${oppResp.from.y}) -> (${oppResp.to.x},${oppResp.to.y}) legal`,
            actual: `Illegal move`,
            legalMoves: oppDests.map((m) => `(${m.to.x},${m.to.y})`),
          });
          break;
        }

        board = applyMoveToBoard(board, {
          from: oppResp.from,
          to: oppResp.to,
          piece: oppPiece,
          captured: board[oppResp.to.y]?.[oppResp.to.x] || undefined,
          timestamp: Date.now(),
        });
        turn = turn === 'white' ? 'black' : 'white';
      }

      stepsPassed++;
    }

    return stepsPassed;
  }
}

/**
 * Validates all training content across Culling Opening Dojo and Hashira Dojo Katas.
 */
export function validateAllLessons(options?: { lessonId?: string; verbose?: boolean }): ValidationReport {
  const failures: ValidationFailure[] = [];
  const lessonSummaries: ValidationReport['lessonSummaries'] = [];

  let totalSteps = 0;
  let passedSteps = 0;

  let cullingLessonsToTest = CULLING_OPENING_LESSONS;
  let dojoLessonsToTest = DOJO_LESSONS;

  if (options?.lessonId) {
    const targetId = options.lessonId;
    cullingLessonsToTest = CULLING_OPENING_LESSONS.filter((l) => l.id === targetId);
    dojoLessonsToTest = DOJO_LESSONS.filter((l) => l.id === targetId);
  }

  // 1. Culling Opening Lessons
  for (const lesson of cullingLessonsToTest) {
    const total = lesson.steps.length;
    totalSteps += total;
    const initialFailuresCount = failures.length;
    const passed = validateCullingOpeningLesson(lesson, failures);
    passedSteps += passed;

    const lessonFailed = failures.length > initialFailuresCount;
    lessonSummaries.push({
      id: lesson.id,
      title: lesson.title,
      type: 'culling_opening',
      stepsTotal: total,
      stepsPassed: passed,
      status: lessonFailed ? 'FAILED' : 'PASSED',
    });
  }

  // 2. Hashira Dojo Katas
  for (const lesson of dojoLessonsToTest) {
    const total = lesson.correctSteps.length;
    totalSteps += total;
    const initialFailuresCount = failures.length;
    const passed = validateDojoKataLesson(lesson, failures);
    passedSteps += passed;

    const lessonFailed = failures.length > initialFailuresCount;
    lessonSummaries.push({
      id: lesson.id,
      title: lesson.title,
      type: 'dojo_kata',
      stepsTotal: total,
      stepsPassed: passed,
      status: lessonFailed ? 'FAILED' : 'PASSED',
    });
  }

  const passedLessons = lessonSummaries.filter((l) => l.status === 'PASSED').length;
  const failedLessons = lessonSummaries.filter((l) => l.status === 'FAILED').length;

  return {
    totalLessons: lessonSummaries.length,
    passedLessons,
    failedLessons,
    totalSteps,
    passedSteps,
    failedSteps: totalSteps - passedSteps,
    failures,
    lessonSummaries,
  };
}

/**
 * UI-Level click simulator test.
 * Simulates piece selection and target click for step expected moves, asserting acceptance and advancement.
 */
export function simulateStepClick(lesson: CullingOpeningLesson | DojoLesson, stepIndex: number): {
  success: boolean;
  targetHighlighted: boolean;
  nextStepIndex: number;
} {
  if ('steps' in lesson) {
    // CullingOpeningLesson
    const step = lesson.steps[stepIndex];
    if (!step) return { success: false, targetHighlighted: false, nextStepIndex: stepIndex };

    let match = createInitialCullingMatch(
      `sim_${lesson.id}`,
      { userId: 'p1', username: 'P', displayName: 'P' },
      { userId: 'b1', username: 'B', displayName: 'B' }
    );
    if (lesson.initialBoard) {
      match.board = cloneCullingBoard(lesson.initialBoard);
    }

    for (let i = 0; i < stepIndex; i++) {
      const prevStep = lesson.steps[i];
      const res = executeCullingMove(match, prevStep.from, prevStep.to, prevStep.actionType || 'move');
      if (res.success) {
        match = res.state;
        if (prevStep.opponentResponse) {
          const oppRes = executeCullingMove(match, prevStep.opponentResponse.from, prevStep.opponentResponse.to, 'move');
          if (oppRes.success) match = oppRes.state;
        }
      }
    }

    const legalMoves = getCullingLegalMovesForSquare(match, step.from);
    const targetHighlighted = legalMoves.some((m) => m.to.x === step.to.x && m.to.y === step.to.y);
    const execRes = executeCullingMove(match, step.from, step.to, step.actionType || 'move');

    return {
      success: execRes.success,
      targetHighlighted,
      nextStepIndex: execRes.success ? stepIndex + 1 : stepIndex,
    };
  } else {
    // DojoLesson
    const step = lesson.correctSteps[stepIndex];
    if (!step) return { success: false, targetHighlighted: false, nextStepIndex: stepIndex };

    if (lesson.tool === 'culling' || lesson.cullingBoard) {
      let match = createInitialCullingMatch(
        `sim_dojo_${lesson.id}`,
        { userId: 'p1', username: 'P', displayName: 'P' },
        { userId: 'b1', username: 'B', displayName: 'B' }
      );
      if (lesson.cullingBoard) match.board = cloneCullingBoard(lesson.cullingBoard);

      for (let i = 0; i < stepIndex; i++) {
        const prevStep = lesson.correctSteps[i];
        const res = executeCullingMove(match, prevStep.from, prevStep.to, prevStep.cullingActionType || 'move');
        if (res.success) {
          match = res.state;
          const oppResp = lesson.opponentResponses?.find((r) => r.triggerStepIndex === i);
          if (oppResp) {
            const oppRes = executeCullingMove(match, oppResp.from, oppResp.to, 'move');
            if (oppRes.success) match = oppRes.state;
          }
        }
      }

      const legalMoves = getCullingLegalMovesForSquare(match, step.from);
      const targetHighlighted = legalMoves.some((m) => m.to.x === step.to.x && m.to.y === step.to.y);
      const execRes = executeCullingMove(match, step.from, step.to, step.cullingActionType || 'move');

      return {
        success: execRes.success,
        targetHighlighted,
        nextStepIndex: execRes.success ? stepIndex + 1 : stepIndex,
      };
    } else {
      let board = lesson.initialBoard ? cloneBoard(lesson.initialBoard) : [];
      for (let i = 0; i < stepIndex; i++) {
        const prevStep = lesson.correctSteps[i];
        const pc = board[prevStep.from.y]?.[prevStep.from.x];
        if (pc) {
          board = applyMoveToBoard(board, {
            from: prevStep.from,
            to: prevStep.to,
            piece: pc,
            captured: board[prevStep.to.y]?.[prevStep.to.x] || undefined,
            timestamp: Date.now(),
          });
          const oppResp = lesson.opponentResponses?.find((r) => r.triggerStepIndex === i);
          if (oppResp) {
            const oppPc = board[oppResp.from.y]?.[oppResp.from.x];
            if (oppPc) {
              board = applyMoveToBoard(board, {
                from: oppResp.from,
                to: oppResp.to,
                piece: oppPc,
                captured: board[oppResp.to.y]?.[oppResp.to.x] || undefined,
                timestamp: Date.now(),
              });
            }
          }
        }
      }

      const legalDests = getStandardLegalMovesForSquare(board, step.from);
      const targetHighlighted = legalDests.some((m) => m.to.x === step.to.x && m.to.y === step.to.y);
      return {
        success: targetHighlighted,
        targetHighlighted,
        nextStepIndex: targetHighlighted ? stepIndex + 1 : stepIndex,
      };
    }
  }
}

// CLI Execution runner
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('validateLessons.ts')) {
  let targetLessonId: string | undefined = undefined;
  const lessonArgIdx = process.argv.indexOf('--lesson');
  if (lessonArgIdx !== -1 && process.argv[lessonArgIdx + 1]) {
    targetLessonId = process.argv[lessonArgIdx + 1];
  }

  console.log('=== RUNNING UNIVERSAL ENGINE-AUTHORITATIVE LESSON VALIDATOR ===\n');
  if (targetLessonId) {
    console.log(`Filtering for lesson ID: "${targetLessonId}"`);
  }

  const report = validateAllLessons({ lessonId: targetLessonId });

  console.log('\n--- LESSON VALIDATION SUMMARY ---');
  console.table(report.lessonSummaries);

  if (report.failures.length > 0) {
    console.log('\n❌ DETAILED FAILURES BY ROOT CAUSE:');
    console.table(report.failures);
    console.error(`\nValidation FAILED: ${report.failedLessons}/${report.totalLessons} lessons failed, ${report.failures.length} total error(s).`);
    process.exit(1);
  } else {
    console.log(`\n✅ ALL ${report.totalLessons} LESSONS (${report.totalSteps} STEPS) PASSED VALIDATION!`);
    process.exit(0);
  }
}
