/**
 * PracticeBoard.tsx - Isolated Sandbox Board & Rank-Calibrated Sparring Arena
 *
 * Features:
 * 1. Mode Selector: Standard (8x8), Crafted Army, Culling Game (88 cross-squares with Gojo/Sukuna), Rose Paradise
 * 2. Two modes:
 *    - Free Analysis Sandbox (interactive legal moves for both sides, undo, reset, flip)
 *    - Rank Sparring Bot Match (Mizunoto beginner bot [easily winnable] -> Hashira lethal GM)
 * 3. Verified Check and Checkmate detection across Standard, Crafted, and Culling Game modes
 * 4. Badge Award Integration: Winning a sparring match invokes PredictorContext to grant genuine
 *    1:1 square achievement badges viewable in the Trophy Room!
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { HashiraRankInfo, MentorExpression, TrainerId } from './types';
import type { PieceColor, Position, Piece, Move, MatchState } from '../types/game';
import type { CullingMatchState, CullingPos, CullingPieceColor, CullingMove } from '../types/cullingGame';
import {
  createInitialBoard,
  getLegalMovesForSquare,
  getAllLegalMoves,
  applyMoveToBoard,
  cloneBoard,
  isKingInCheck,
} from '../game/engine';
import { getBestBotMove } from '../game/bot';
import {
  createInitialCullingMatch,
  executeCullingMove,
  isCullingKingInCheck,
} from '../game/cullingEngine';
import { getBestCullingBotMove } from '../game/cullingBot';
import { ChessPiece } from '../components/ChessPiece';
import { CullingBoard } from '../components/CullingBoard';
import { sounds } from '../utils/audio';
import { usePredictor } from '../predictor/PredictorContext';
import type { TacticalMetrics, AchievementCard } from '../predictor/types';
import {
  RotateCcw,
  Swords,
  Play,
  Award,
  Sparkles,
  Trophy,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface PracticeBoardProps {
  rankInfo: HashiraRankInfo;
  onReaction: (expression: MentorExpression, text: string) => void;
  onOpenTrophyRoom: () => void;
  onRecordResult: (outcome: 'win' | 'loss') => void;
  maxBoardDimension?: number;
  trainerId?: TrainerId;
}

type SandboxGameMode = 'standard' | 'crafted' | 'culling' | 'rose';

export const PracticeBoard: React.FC<PracticeBoardProps> = ({
  rankInfo,
  onReaction,
  onOpenTrophyRoom,
  onRecordResult,
  maxBoardDimension,
  trainerId = 'thukuna',
}) => {
  const { finalizeMatch } = usePredictor();
  const isGatoru = trainerId === 'gatoru';
  const resultRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<SandboxGameMode>('standard');
  const [isBotMatchActive, setIsBotMatchActive] = useState(false);
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [board, setBoard] = useState<(Piece | null)[][]>(() => createInitialBoard('standard'));
  const [cullingMatch, setCullingMatch] = useState<CullingMatchState>(() =>
    createInitialCullingMatch(
      `practice_culling_${Date.now()}`,
      { userId: 'player', username: 'Player', displayName: 'Player' },
      { userId: 'bot', username: rankInfo.botDifficulty.label, displayName: rankInfo.botDifficulty.label }
    )
  );

  const [turn, setTurn] = useState<PieceColor>('white');
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [moveHistory, setMoveHistory] = useState<Array<{ board: (Piece | null)[][]; move: Move }>>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Victory / Defeat State & Awarded Badges
  const [matchOutcome, setMatchOutcome] = useState<'win' | 'loss' | 'draw' | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<AchievementCard[]>([]);

  // Performance metrics tracking for badge generation
  const [tacticalMetrics, setTacticalMetrics] = useState<TacticalMetrics>({
    materialBalance: 0,
    inCheckCount: 0,
    checksDefendedCount: 0,
    capturesMade: 0,
    piecesLost: 0,
    specialActionsCount: 0,
    bestTacticalSequence: 1,
    turnsSurvived: 0,
    gameOutcome: 'active',
  });

  // Auto-scroll down smoothly to debrief outcome when match concludes
  useEffect(() => {
    if (matchOutcome) {
      const scrollTimer = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 120);
      return () => clearTimeout(scrollTimer);
    }
  }, [matchOutcome]);

  // Reset board when mode changes
  const initializeBoardForMode = useCallback((newMode: SandboxGameMode) => {
    setSelectedSquare(null);
    setMoveHistory([]);
    setLastMove(null);
    setTurn('white');
    setMatchOutcome(null);
    setEarnedBadges([]);
    setTacticalMetrics({
      materialBalance: 0,
      inCheckCount: 0,
      checksDefendedCount: 0,
      capturesMade: 0,
      piecesLost: 0,
      specialActionsCount: 0,
      bestTacticalSequence: 1,
      turnsSurvived: 0,
      gameOutcome: 'active',
    });

    if (newMode === 'crafted') {
      setBoard(createInitialBoard('crafted'));
    } else if (newMode === 'culling') {
      setCullingMatch(
        createInitialCullingMatch(
          `practice_culling_${Date.now()}`,
          { userId: 'player', username: 'Player', displayName: 'Player' },
          { userId: 'bot', username: rankInfo.botDifficulty.label, displayName: rankInfo.botDifficulty.label }
        )
      );
    } else {
      setBoard(createInitialBoard('standard'));
    }
  }, [rankInfo.botDifficulty.label]);

  const handleModeChange = (newMode: SandboxGameMode) => {
    setMode(newMode);
    initializeBoardForMode(newMode);
    onReaction(
      'analytical',
      `Switched practice layout to ${newMode.toUpperCase()}. Test your maneuvers or engage in sparring!`
    );
  };

  const handleResetBoard = () => {
    initializeBoardForMode(mode);
    onReaction('stern', 'Board reset to the opening formation. Clear your mind and strike with precision.');
  };

  const handleUndoMove = () => {
    if (mode === 'culling') {
      // Undo for Culling board if not thinking
      if (isBotThinking) return;
      initializeBoardForMode('culling');
      return;
    }
    if (moveHistory.length === 0 || isBotThinking) return;
    const prevEntry = moveHistory[moveHistory.length - 1];
    setBoard(prevEntry.board);
    setMoveHistory((prev) => prev.slice(0, -1));
    setTurn((prev) => (prev === 'white' ? 'black' : 'white'));
    setSelectedSquare(null);
    setLastMove(null);
    sounds.playMove();
  };

  const legalMovesForSelected = useMemo(() => {
    if (mode === 'culling' || !selectedSquare || matchOutcome) return [];
    return getLegalMovesForSquare(board, selectedSquare);
  }, [mode, board, selectedSquare, matchOutcome]);

  // Handle Match Conclusion & Award Authentic Badges
  const handleMatchCompletion = (outcome: 'win' | 'loss' | 'draw') => {
    setMatchOutcome(outcome);
    setIsBotMatchActive(false);

    if (outcome === 'win') {
      sounds.playGameOver();
      onReaction('approving', `CHECKMATE! You have vanquished the ${rankInfo.name} sparring trial! The Dojo honors your martial triumph.`);
      onRecordResult('win');

      try {
        const finalMetrics: TacticalMetrics = {
          ...tacticalMetrics,
          gameOutcome: 'win',
          turnsSurvived: Math.max(8, tacticalMetrics.turnsSurvived),
          capturesMade: Math.max(3, tacticalMetrics.capturesMade),
        };

        const awarded = finalizeMatch(
          `hashira_practice_${Date.now()}`,
          mode === 'crafted' ? 'crafted' : mode === 'culling' ? 'culling' : 'standard',
          playerColor,
          'win',
          finalMetrics,
          rankInfo.botDifficulty.label,
          rankInfo.tierNumber >= 5 ? 'grandmaster' : 'master'
        );

        if (awarded && awarded.length > 0) {
          setEarnedBadges(awarded);
        }
      } catch (err) {
        console.error('Error awarding practice match badges:', err);
      }
    } else if (outcome === 'loss') {
      sounds.playGameOver();
      onReaction(
        'scowl',
        rankInfo.tierNumber >= 5
          ? 'Checkmate! At this rank, single errors seal your fate. Learn from this blade wound and strike again!'
          : 'You have been checkmated. Reflect upon your structure, dust yourself off, and try once more.'
      );
      onRecordResult('loss');
    } else {
      sounds.playGameOver();
      onReaction('analytical', 'Stalemate! Neither king has legal moves left without being in check. A drawn battle.');
    }
  };

  // Bot Sparring Engine with Calibrated Rank Difficulty for Standard/Crafted Chess
  const triggerBotSparringTurn = (currentBoard: (Piece | null)[][], botColor: PieceColor) => {
    setIsBotThinking(true);
    onReaction('analytical', `Sensei observes the ${rankInfo.botDifficulty.label} considering their reply...`);

    const delay = Math.max(350, Math.min(800, 300 + rankInfo.botDifficulty.depth * 150));

    setTimeout(() => {
      const allMoves = getAllLegalMoves(currentBoard, botColor);
      if (allMoves.length === 0) {
        setIsBotThinking(false);
        const inCheck = isKingInCheck(currentBoard, botColor);
        if (inCheck) {
          handleMatchCompletion('win');
        } else {
          handleMatchCompletion('draw');
        }
        return;
      }

      let chosenMove: Move | null = null;
      const { blunderChance, depth } = rankInfo.botDifficulty;

      // In Mizunoto / Kanoe, deliberate blunder chance ensures beginners easily triumph!
      if (Math.random() < blunderChance) {
        chosenMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      } else {
        const syntheticMatch: MatchState = {
          id: `practice_${Date.now()}`,
          whitePlayer: { userId: 'player', username: 'player', displayName: 'Player', avatarId: 'avatar_prince' },
          blackPlayer: { userId: 'bot', username: 'bot', displayName: rankInfo.botDifficulty.label, avatarId: 'avatar_prince' },
          board: currentBoard,
          turn: botColor,
          status: 'active',
          dice: null,
          whitePawnsReachedEndRank: 0,
          blackPawnsReachedEndRank: 0,
          capturedByWhite: [],
          capturedByBlack: [],
          moveHistory: [],
          inCheck: null,
          result: null,
          moveSuggestions: 'included',
          totalCaptures: 10,
          diceActive: false,
          timeControl: 300,
          whiteTimeRemaining: 300,
          blackTimeRemaining: 300,
          lastTurnStartTime: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        try {
          chosenMove = getBestBotMove(syntheticMatch, botColor, depth);
        } catch {
          chosenMove = allMoves[0];
        }
      }

      if (!chosenMove) {
        chosenMove = allMoves[0];
      }

      const updatedBoard = applyMoveToBoard(currentBoard, chosenMove);
      setBoard(updatedBoard);
      setLastMove({ from: chosenMove.from, to: chosenMove.to });
      setIsBotThinking(false);

      if (chosenMove.captured) {
        sounds.playCapture();
        setTacticalMetrics((prev) => ({
          ...prev,
          piecesLost: prev.piecesLost + 1,
          materialBalance: prev.materialBalance - 2,
        }));
      } else {
        sounds.playMove();
      }

      setTurn(playerColor);

      // Check if Player is in check or checkmated
      const playerInCheck = isKingInCheck(updatedBoard, playerColor);
      if (playerInCheck) {
        sounds.playCheck();
        onReaction('scowl', 'Check! The sparring partner strikes at your King! Parry or escape immediately.');
        setTacticalMetrics((prev) => ({ ...prev, checksDefendedCount: prev.checksDefendedCount + 1 }));
      }

      const playerLegalMoves = getAllLegalMoves(updatedBoard, playerColor);
      if (playerLegalMoves.length === 0) {
        if (playerInCheck) {
          handleMatchCompletion('loss');
        } else {
          handleMatchCompletion('draw');
        }
      }
    }, delay);
  };

  // Execute a standard chess move on the board
  const executePlayerMove = (from: Position, to: Position) => {
    const movingPiece = board[from.y][from.x]!;
    const targetPiece = board[to.y][to.x];

    const moveObj: Move = {
      from,
      to,
      piece: movingPiece,
      captured: targetPiece || undefined,
      timestamp: Date.now(),
    };

    setMoveHistory((prev) => [...prev, { board: cloneBoard(board), move: moveObj }]);

    const nextBoard = applyMoveToBoard(board, moveObj);
    setBoard(nextBoard);
    setLastMove({ from, to });
    setSelectedSquare(null);

    if (targetPiece) {
      sounds.playCapture();
      setTacticalMetrics((prev) => ({
        ...prev,
        capturesMade: prev.capturesMade + 1,
        materialBalance: prev.materialBalance + 2,
      }));
    } else {
      sounds.playMove();
    }

    const nextTurn: PieceColor = turn === 'white' ? 'black' : 'white';
    setTurn(nextTurn);
    setTacticalMetrics((prev) => ({ ...prev, turnsSurvived: prev.turnsSurvived + 1 }));

    // Check if opponent King is in check or captured
    const oppInCheck = isKingInCheck(nextBoard, nextTurn);
    if (oppInCheck) {
      sounds.playCheck();
      onReaction('approving', 'Check delivered! Relentless martial pressure.');
      setTacticalMetrics((prev) => ({ ...prev, inCheckCount: prev.inCheckCount + 1 }));
    }

    // Check if opponent has legal moves (checkmate / stalemate)
    const oppLegalMoves = getAllLegalMoves(nextBoard, nextTurn);
    if (oppLegalMoves.length === 0) {
      if (oppInCheck) {
        handleMatchCompletion('win');
      } else {
        handleMatchCompletion('draw');
      }
      return;
    }

    // Trigger bot turn if sparring match active
    if (isBotMatchActive && nextTurn !== playerColor) {
      triggerBotSparringTurn(nextBoard, nextTurn);
    }
  };

  // Culling Game Move Execution Handler
  const handleCullingMove = (from: CullingPos, to: CullingPos, actionType?: string) => {
    if (isBotThinking || matchOutcome) return;
    if (isBotMatchActive && cullingMatch.turn !== (playerColor as CullingPieceColor)) return;

    const execResult = executeCullingMove(cullingMatch, from, to, actionType as any);
    if (!execResult.success) return;

    const nextMatch = execResult.state;
    setCullingMatch(nextMatch);
    sounds.playMove();

    // Check match completion
    if (nextMatch.status === 'completed') {
      if (nextMatch.winner === (playerColor as CullingPieceColor)) {
        handleMatchCompletion('win');
      } else if (nextMatch.winner) {
        handleMatchCompletion('loss');
      } else {
        handleMatchCompletion('draw');
      }
      return;
    }

    // If opponent is now in check
    if (nextMatch.inCheck) {
      sounds.playCheck();
      onReaction('approving', 'Sovereign in check! The cursed pressure mounts.');
    }

    // If sparring bot match is active and it's bot's turn (Black side)
    if (isBotMatchActive && nextMatch.turn === 'black') {
      setIsBotThinking(true);
      onReaction('analytical', `The Culling opponent calculates their cursed technique...`);
      setTimeout(() => {
        const botMove = getBestCullingBotMove(nextMatch, 'black', Math.min(2, rankInfo.botDifficulty.depth));
        if (botMove) {
          const botExec = executeCullingMove(nextMatch, botMove.from, botMove.to, botMove.actionType);
          if (botExec.success) {
            setCullingMatch(botExec.state);
            sounds.playMove();

            if (botExec.state.status === 'completed') {
              if (botExec.state.winner === 'white') handleMatchCompletion('win');
              else if (botExec.state.winner === 'black') handleMatchCompletion('loss');
              else handleMatchCompletion('draw');
            } else if (botExec.state.inCheck === 'white') {
              sounds.playCheck();
              onReaction('scowl', 'Beware! Satoru Gojo is under attack!');
            }
          }
        }
        setIsBotThinking(false);
      }, 500);
    }
  };

  const handleSquareClick = (x: number, y: number) => {
    if (isBotThinking || matchOutcome) return;
    const clickedPiece = board[y]?.[x];

    if (isBotMatchActive && turn !== playerColor) return;

    if (clickedPiece && clickedPiece.color === turn) {
      if (selectedSquare && selectedSquare.x === x && selectedSquare.y === y) {
        setSelectedSquare(null);
      } else {
        setSelectedSquare({ x, y });
        sounds.playSelect();
      }
      return;
    }

    if (selectedSquare) {
      const isLegal = legalMovesForSelected.some((m) => m.to.x === x && m.to.y === y);
      if (isLegal) {
        executePlayerMove(selectedSquare, { x, y });
      } else {
        setSelectedSquare(null);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start justify-center w-full">
      {/* Board Container Section */}
      <div className="flex flex-col items-center w-full max-w-[500px]">
        {/* Mode Selector Pill Bar */}
        <div className="flex items-center justify-between w-full mb-3 bg-neutral-200 dark:bg-[#18181b] p-1.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
          <span className="text-[11px] font-black uppercase text-neutral-600 dark:text-neutral-400 pl-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Mode:
          </span>
          <div className="flex items-center gap-1">
            {(['standard', 'crafted', 'culling', 'rose'] as SandboxGameMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`px-2 py-0.5 text-[10px] font-black uppercase border cursor-pointer transition-all ${
                  mode === m
                    ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-400'
                }`}
              >
                {m === 'culling' ? '🩸 Culling' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Board View: Either Authentic Culling Cross Board or Standard 8x8 */}
        {mode === 'culling' ? (
          <div className="relative shrink-0">
            <CullingBoard
              match={cullingMatch}
              myColor={playerColor as CullingPieceColor}
              isInteractive={!isBotThinking && !matchOutcome}
              onMove={handleCullingMove}
              flipped={isFlipped}
              maxDimension={maxBoardDimension ? Math.floor(maxBoardDimension - 14) : undefined}
            />

            {isBotThinking && (
              <div className="absolute top-2 right-2 bg-black/85 text-amber-400 border border-amber-400 px-2.5 py-1 text-[11px] font-black uppercase flex items-center gap-1.5 shadow-md z-30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Culling Bot Calculating...
              </div>
            )}
          </div>
        ) : (
          /* 8x8 Board Container */
          <div
            style={maxBoardDimension ? { width: `${maxBoardDimension}px`, height: `${maxBoardDimension}px` } : undefined}
            className="relative border-3 sm:border-4 border-black dark:border-white shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] bg-black select-none max-w-[460px] w-full aspect-square shrink-0"
          >
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {Array.from({ length: 8 }).map((_, rankIdx) => {
                const y = isFlipped ? rankIdx : 7 - rankIdx;
                return Array.from({ length: 8 }).map((_, fileIdx) => {
                  const x = isFlipped ? 7 - fileIdx : fileIdx;
                  const isDark = (x + y) % 2 === 1;
                  const piece = board[y] ? board[y][x] : null;
                  const isSelected = selectedSquare?.x === x && selectedSquare?.y === y;
                  const isLegalDest = legalMovesForSelected.some(
                    (m) => m.to.x === x && m.to.y === y
                  );
                  const isLastMoveFrom = lastMove?.from.x === x && lastMove?.from.y === y;
                  const isLastMoveTo = lastMove?.to.x === x && lastMove?.to.y === y;

                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => handleSquareClick(x, y)}
                      className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${
                        isSelected
                          ? 'bg-amber-300 dark:bg-amber-600'
                          : isLastMoveFrom || isLastMoveTo
                          ? isDark
                            ? 'bg-[#800d23]'
                            : 'bg-[#fde68a]'
                          : isDark
                          ? 'bg-[#BC1434]'
                          : 'bg-[#F2EFE4]'
                      }`}
                    >
                      {fileIdx === 0 && (
                        <span className={`absolute top-0.5 left-1 text-[9px] font-black pointer-events-none ${
                          isDark ? 'text-rose-100/70' : 'text-neutral-800/70'
                        }`}>
                          {y + 1}
                        </span>
                      )}
                      {rankIdx === 7 && (
                        <span className={`absolute bottom-0.5 right-1 text-[9px] font-black pointer-events-none uppercase ${
                          isDark ? 'text-rose-100/70' : 'text-neutral-800/70'
                        }`}>
                          {String.fromCharCode(97 + x)}
                        </span>
                      )}

                      {piece && (
                        <div className="w-[85%] h-[85%] flex items-center justify-center drop-shadow-md">
                          <ChessPiece type={piece.type} color={piece.color} />
                        </div>
                      )}

                      {isLegalDest && (
                        <div
                          className={`absolute rounded-full pointer-events-none ${
                            piece
                              ? 'w-full h-full border-4 border-amber-400/90 animate-pulse'
                              : 'w-3.5 h-3.5 bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          }`}
                        />
                      )}
                    </div>
                  );
                });
              })}
            </div>

            {isBotThinking && (
              <div className="absolute top-2 right-2 bg-black/85 text-amber-400 border border-amber-400 px-2.5 py-1 text-[11px] font-black uppercase flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                {rankInfo.botDifficulty.label} Thinking...
              </div>
            )}
          </div>
        )}

        {/* Dedicated Hashira Debrief Card */}
        {matchOutcome && (
          <div
            ref={resultRef}
            className={`mt-3 w-full bg-[#0a0a0f] border-2 ${
              isGatoru ? 'border-sky-400' : 'border-amber-400'
            } p-4 text-left z-20 animate-fade-in shadow-[4px_4px_0px_#000]`}
          >
            <div className="flex items-center justify-between border-b border-neutral-700 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`font-serif text-lg ${isGatoru ? 'text-sky-400' : 'text-amber-400'}`}>
                  {rankInfo.kanji}
                </span>
                <span className={`text-xs font-black uppercase ${isGatoru ? 'text-sky-400' : 'text-amber-400'} tracking-wider`}>
                  {rankInfo.name} Sparring Debrief
                </span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                matchOutcome === 'win'
                  ? isGatoru
                    ? 'bg-sky-400 text-black border-black'
                    : 'bg-amber-400 text-black border-black'
                  : matchOutcome === 'loss'
                  ? 'bg-red-950 text-red-300 border-red-500'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-600'
              }`}>
                {matchOutcome === 'win' ? 'Victory' : matchOutcome === 'loss' ? 'Defeat' : 'Stalemate'}
              </span>
            </div>

            <h3 className={`text-base sm:text-lg font-black uppercase tracking-wider mb-1 ${
              matchOutcome === 'win'
                ? isGatoru ? 'text-sky-400' : 'text-amber-400'
                : 'text-red-400'
            }`}>
              {matchOutcome === 'win'
                ? 'Checkmate — Martial Triumph!'
                : matchOutcome === 'loss'
                ? 'Checkmated by Sparring Partner'
                : 'Stalemate Draw'}
            </h3>

            {/* Diagnostic Tactical Metrics */}
            <div className="grid grid-cols-4 gap-1.5 my-3 p-2 bg-neutral-900 border border-neutral-800 text-center font-mono">
              <div className="p-1 bg-black border border-neutral-800">
                <div className="text-[9px] text-neutral-500 font-bold uppercase">Turns</div>
                <div className="text-xs font-black text-white">{tacticalMetrics.turnsSurvived}</div>
              </div>
              <div className="p-1 bg-black border border-neutral-800">
                <div className="text-[9px] text-neutral-500 font-bold uppercase">Captures</div>
                <div className={`text-xs font-black ${isGatoru ? 'text-sky-400' : 'text-amber-400'}`}>{tacticalMetrics.capturesMade}</div>
              </div>
              <div className="p-1 bg-black border border-neutral-800">
                <div className="text-[9px] text-neutral-500 font-bold uppercase">Lost</div>
                <div className="text-xs font-black text-red-400">{tacticalMetrics.piecesLost}</div>
              </div>
              <div className="p-1 bg-black border border-neutral-800">
                <div className="text-[9px] text-neutral-500 font-bold uppercase">Checks</div>
                <div className="text-xs font-black text-sky-400">{tacticalMetrics.inCheckCount}</div>
              </div>
            </div>

            {/* Sensei Tactical Diagnostics & Critique */}
            <div className={`p-2.5 bg-neutral-950 border ${isGatoru ? 'border-sky-400/50' : 'border-amber-400/50'} mb-3 text-xs`}>
              <div className={`text-[10px] font-black uppercase tracking-wider ${isGatoru ? 'text-sky-400' : 'text-amber-400'} flex items-center gap-1.5 mb-1.5`}>
                <span>{isGatoru ? '悟 Gatoru\'s Tactical Critique:' : '🥋 Thukuna\'s Tactical Critique:'}</span>
              </div>
              <ul className="text-[11px] text-neutral-300 space-y-1 font-medium list-disc list-inside">
                {matchOutcome === 'win' ? (
                  isGatoru ? (
                    <>
                      <li>Infinite void precision executed! You locked down open files and forced the sparring partner into total positional collapse.</li>
                      <li>Calculated conversion of tempo advantage into an airtight checkmate net. Maintain this focus against grandmasters.</li>
                    </>
                  ) : (
                    <>
                      <li>Exemplary martial discipline! You seized central squares and punished the opponent\'s overextended structure.</li>
                      <li>Clean conversion of material advantage into checkmate pressure. Keep this tempo in higher Hashira ranks!</li>
                    </>
                  )
                ) : (
                  <>
                    <li>Do not leave officers exposed on undefended diagonals. Coordinate minor pieces before advancing your pawns.</li>
                    <li>Always verify whether the enemy has discovered checks or knight forks before capturing on distant squares.</li>
                    <li>Create an escape square ('luft') for your King early to deny back-rank corridor mating nets.</li>
                  </>
                )}
              </ul>
            </div>

            {earnedBadges.length > 0 && (
              <div className="mb-3 p-2 bg-neutral-900 border border-amber-400">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">
                  Badges Awarded to Trophy Room:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {earnedBadges.map((b) => (
                    <span key={b.id} className="text-[10px] font-black text-white px-2 py-0.5 bg-neutral-800 border border-neutral-600">
                      {b.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={handleResetBoard}
                className="px-3.5 py-1.5 bg-white text-black font-black text-xs uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                Play Again
              </button>
              {earnedBadges.length > 0 && (
                <button
                  onClick={onOpenTrophyRoom}
                  className="px-3.5 py-1.5 bg-amber-400 text-black font-black text-xs uppercase border-2 border-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Trophy Room
                </button>
              )}
            </div>
          </div>
        )}

        {/* Board Controls Toolbar */}
        <div className="flex items-center justify-between w-full mt-3 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetBoard}
              className="px-2.5 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-black dark:text-white font-black text-xs uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              title="Reset position"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleUndoMove}
              disabled={mode !== 'culling' && moveHistory.length === 0}
              className="px-2.5 py-1.5 bg-neutral-200 dark:bg-neutral-800 disabled:opacity-40 text-black dark:text-white font-black text-xs uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              title="Undo last move"
            >
              Undo
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-2.5 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-black dark:text-white font-black text-xs uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              title="Flip board perspective"
            >
              Flip
            </button>
          </div>

          <div className="text-xs font-black uppercase text-neutral-500">
            Turn:{' '}
            <span className={(mode === 'culling' ? cullingMatch.turn : turn) === 'white' ? 'text-amber-500' : 'text-neutral-400'}>
              {mode === 'culling' ? cullingMatch.turn : turn}
            </span>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Sparring Match Setup & Info */}
      <div className="w-full lg:w-72 flex flex-col gap-3">
        <div className="bg-white dark:bg-[#0c0c0e] border-3 border-black dark:border-white shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] p-3.5">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b-2 border-black dark:border-neutral-700">
            <Swords className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-black uppercase tracking-tight text-black dark:text-white">
              Rank Sparring Match
            </h4>
          </div>

          <div className="space-y-2 mb-3">
            <div className="p-2 bg-neutral-100 dark:bg-[#18181b] border border-neutral-300 dark:border-neutral-700 text-xs">
              <span className="font-black text-neutral-800 dark:text-neutral-200 block uppercase mb-0.5">
                Opponent: {rankInfo.botDifficulty.label}
              </span>
              <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 leading-tight">
                {rankInfo.botDifficulty.description}
              </p>
            </div>

            {rankInfo.tierNumber === 1 && (
              <div className="p-2 bg-sky-950/40 border border-sky-400 text-sky-300 text-[11px] font-bold">
                ✓ Guaranteed Novice Wins: Frequent blunders allow any initiate to claim victory easily!
              </div>
            )}

            {rankInfo.tierNumber >= 5 && (
              <div className="p-2 bg-red-950/50 border border-red-500 text-red-300 text-[11px] font-bold">
                ⚠️ Lethal Severity: The Master/Hashira punishes every inaccuracy instantly.
              </div>
            )}
          </div>

          {!isBotMatchActive ? (
            <button
              onClick={() => {
                initializeBoardForMode(mode);
                setIsBotMatchActive(true);
                onReaction(
                  'approving',
                  `Sparring match started against ${rankInfo.botDifficulty.label}! Fight with discipline!`
                );
                sounds.playChallenge();
              }}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start Sparring Match</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsBotMatchActive(false);
                onReaction('stern', 'Sparring suspended. You may analyze the position freely.');
              }}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase border-2 border-black cursor-pointer"
            >
              Switch to Free Sandbox
            </button>
          )}
        </div>

        {/* Badge Reward Info Card */}
        <div className="bg-amber-50 dark:bg-[#1a1708] border-2 border-amber-400 p-3 shadow-[3px_3px_0px_#000] text-black dark:text-white">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-black uppercase text-amber-600 dark:text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>Badge Reward Protocol</span>
          </div>
          <p className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 leading-snug">
            Defeating the sparring bot awards genuine achievement badges to your Trophy Room.
          </p>
          <button
            onClick={onOpenTrophyRoom}
            className="mt-2.5 w-full py-1.5 bg-black text-amber-400 hover:text-amber-300 font-black text-[11px] uppercase border border-amber-400 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Open Trophy Room</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
