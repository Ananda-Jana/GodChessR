import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { PredictorProvider } from './predictor/PredictorContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { MatchView } from './components/MatchView';
import { ChallengeModal } from './components/ChallengeModal';
import { RulesModal } from './components/RulesModal';
import { BotMatchModal } from './components/BotMatchModal';
import { PopupAd } from './components/PopupAd';
import { CraftTheoryView } from './components/CraftTheoryView';
import { RoseParadiseView } from './rose/RoseParadiseView';
import { HashiraTrainingView } from './training/HashiraTrainingView';
import { HashiraDojoModal } from './components/HashiraDojoModal';
import type { TrainerId, TrainingToolId } from './training/types';
import { SecretMatchView } from './secret/SecretMatchView';
import type { SecretPlayerConfig } from './secret/types';
import { Chess3dArcadeView } from './chess3d/Chess3dArcadeView';
import type { Team as Team3D, TimeControl3D } from './chess3d/types';
import {
  MatchState,
  PieceColor,
  Position,
  ExpansionSide,
  PieceType,
  PieceTheme,
  DICE_GRACE_WINDOW_MS,
} from './types/game';
import {
  createInitialBoard,
  rollAuthoritativeDice,
  executeMove,
  resignMatch,
  handleTimeout,
  applyBoardExpansion,
  applyCraftPlacement,
  cancelCrafting,
  isKingInCheck,
  applyMoveToBoard,
} from './game/engine';
import { getBestBotMove, getBotExpansionChoice, getBotCraftingChoice } from './game/bot';
import { sounds } from './utils/audio';
import { Crown, Bot } from 'lucide-react';
import { PunisherSelector } from './punisher/PunisherSelector';
import { getPunisherBotMove, PunisherBotId, PUNISHER_BOTS } from './punisher/punisherBot';
import { ChestRewardHost } from './chest/ChestRewardHost';
import { EloStreakNotification } from './components/EloStreakNotification';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showAd, setShowAd] = useState(false);
  const adImage = '/assets/aistudio/6a05a9fcfc3686e80dfcb3f94a933556_5459d7e7.jpg';

  useEffect(() => {
    const img = new Image();
    img.src = adImage;
    img.onload = () => setShowAd(true);
  }, []);

  const {
    activeMatch: socketMatch,
    incomingChallenge,
    respondChallenge,
    clearActiveMatch: clearSocketMatch,
  } = useSocket();

  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [showCraftTheory, setShowCraftTheory] = useState(false);
  const [isRoseOpen, setIsRoseOpen] = useState(false);
  const [isHashiraTrainingOpen, setIsHashiraTrainingOpen] = useState(false);
  const [isHashiraModalOpen, setIsHashiraModalOpen] = useState(false);
  const [selectedTrainerForTraining, setSelectedTrainerForTraining] = useState<TrainerId>('thukuna');
  const [selectedToolForTraining, setSelectedToolForTraining] = useState<TrainingToolId>('opening');
  const [botInitialGameMode, setBotInitialGameMode] = useState<'standard' | 'crafted' | 'classic'>('standard');
  const [activeSecretBot, setActiveSecretBot] = useState<SecretPlayerConfig | null>(null);
  const [returnToSecretArena, setReturnToSecretArena] = useState(false);
  const [active3dMatchParams, setActive3dMatchParams] = useState<{
    botId?: PunisherBotId;
    playerTeam?: Team3D;
    timeControl?: TimeControl3D;
    roomCode?: string;
  } | null>(null);

  // Punisher Robot Selector Mode State
  const [isPunisherSelectorOpen, setIsPunisherSelectorOpen] = useState(false);
  const [initialPunisherBot, setInitialPunisherBot] = useState<PunisherBotId | undefined>(undefined);
  const [punisherMatch, setPunisherMatch] = useState<MatchState | null>(null);
  const [activePunisherBotId, setActivePunisherBotId] = useState<PunisherBotId | null>(null);

  const punisherTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (punisherTimeoutRef.current) {
        clearTimeout(punisherTimeoutRef.current);
      }
    };
  }, []);

  // Run Punisher Bot turn with natural thinking time:
  // - Fast instant calculation (< 25ms, never stalls the tab)
  // - Normal moves: within 2 seconds (1.2s to 1.85s randomly)
  // - Special moves (captures, checks, escaping check, promotion): 3 to 4 seconds (3.0s to 3.8s randomly)
  const runPunisherBotTurn = useCallback(
    (currentMatch: MatchState, botId: PunisherBotId) => {
      if (punisherTimeoutRef.current) {
        clearTimeout(punisherTimeoutRef.current);
        punisherTimeoutRef.current = null;
      }

      setIsBotThinking(true);

      // Defer bot computation to next tick so React paints player's piece move instantly
      punisherTimeoutRef.current = setTimeout(() => {
        const startTime = Date.now();
        const bestMove = getPunisherBotMove(currentMatch, botId);
        if (!bestMove) {
          setIsBotThinking(false);
          punisherTimeoutRef.current = null;
          return;
        }

        // Check if move is a "special move"
        const nextBoard = applyMoveToBoard(currentMatch.board, bestMove);
        const opponentColor: PieceColor = currentMatch.turn === 'white' ? 'black' : 'white';
        const deliversCheck = isKingInCheck(nextBoard, opponentColor);
        const isEscapingCheck = currentMatch.inCheck === currentMatch.turn;
        const isCapture = Boolean(bestMove.captured);
        const isPromotion = bestMove.piece.type === 'pawn' && (bestMove.to.y === 0 || bestMove.to.y === 7);

        const isSpecialMove = isCapture || deliversCheck || isEscapingCheck || isPromotion;

        // Detect obvious moves (recaptures on the square just played or escaping check)
        const lastPlayerMove = currentMatch.moveHistory[currentMatch.moveHistory.length - 1];
        const isRecapture = Boolean(
          lastPlayerMove?.captured &&
          bestMove.captured &&
          bestMove.to.x === lastPlayerMove.to.x &&
          bestMove.to.y === lastPlayerMove.to.y
        );
        const isObviousMove = isRecapture || isEscapingCheck;

        // Identify the 4 high-rated bots: Chrome Reaper, Cyclops Revenant, Iron Regent, Bangla-Bot
        const isHighRatedBot =
          botId === 'chrome-reaper' ||
          botId === 'cyclops-revenant' ||
          botId === 'iron-regent' ||
          botId === 'bangla-bot';

        let thinkingTimeMs: number;
        if (isHighRatedBot) {
          if (isObviousMove) {
            thinkingTimeMs = Math.floor(150 + Math.random() * 150);
          } else if (isSpecialMove) {
            thinkingTimeMs = Math.floor(400 + Math.random() * 200);
          } else {
            thinkingTimeMs = Math.floor(200 + Math.random() * 200);
          }
        } else {
          thinkingTimeMs = isSpecialMove
            ? Math.floor(3000 + Math.random() * 800)
            : Math.floor(1250 + Math.random() * 650);
        }

        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(50, thinkingTimeMs - elapsed);

        punisherTimeoutRef.current = setTimeout(() => {
          const res = executeMove(currentMatch, bestMove.from, bestMove.to);
          if (res.success) {
            setPunisherMatch(res.state);
            if (res.state.status === 'completed') {
              sounds.playGameOver();
              const entry = { match: res.state, completedAt: Date.now() };
              setLastCompletedMatch(entry);
            } else if (bestMove.captured) {
              sounds.playCapture();
            } else {
              sounds.playMove();
            }
          }
          setIsBotThinking(false);
          punisherTimeoutRef.current = null;
        }, remainingDelay);
      }, 20);
    },
    []
  );

  const handleStartPunisherMatch = (botId: PunisherBotId) => {
    if (!user) return;
    if (punisherTimeoutRef.current) {
      clearTimeout(punisherTimeoutRef.current);
      punisherTimeoutRef.current = null;
    }
    setIsBotThinking(false);
    setIsPunisherSelectorOpen(false);
    setActivePunisherBotId(botId);
    setLastCompletedMatch(null);
    
    const botConfig = PUNISHER_BOTS[botId];
    const botUser = {
      userId: `punisher_${botId}`,
      username: botId,
      displayName: botConfig.name,
      avatarId: 'avatar_prince',
    };

    const now = Date.now();
    // Use 'classic' mode for "simple chess" as requested (standard board, no prince, no dice)
    const initialMatch: MatchState = {
      id: `punisher_${botId}_${now}`,
      whitePlayer: {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarId: user.avatarId,
      },
      blackPlayer: botUser,
      board: createInitialBoard('classic'),
      gameMode: 'classic',
      craftingAllowed: false,
      pieceTheme: 'classic',
      turn: 'white',
      status: 'active',
      dice: null,
      diceActive: false, // Force no dice
      whitePawnsReachedEndRank: 0,
      blackPawnsReachedEndRank: 0,
      capturedByWhite: [],
      capturedByBlack: [],
      moveHistory: [],
      inCheck: null,
      result: null,
      moveSuggestions: 'included',
      totalCaptures: 0,
      timeControl: 300,
      whiteTimeRemaining: 300,
      blackTimeRemaining: 300,
      lastTurnStartTime: now,
      createdAt: now,
      updatedAt: now,
    };

    setPunisherMatch(initialMatch);
    sounds.playChallenge();
  };

  // Last completed game review state (retained for 10 minutes then auto-flushed)
  const [lastCompletedMatch, setLastCompletedMatch] = useState<{ match: MatchState; completedAt: number } | null>(() => {
    try {
      const saved = localStorage.getItem('dice_chess_last_game');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.completedAt && (Date.now() - parsed.completedAt < 600000)) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLastCompletedMatch((prev) => {
        if (!prev) return null;
        if (Date.now() - prev.completedAt >= 600000) {
          localStorage.removeItem('dice_chess_last_game');
          return null;
        }
        return prev;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (socketMatch && socketMatch.status === 'completed') {
      const entry = { match: socketMatch, completedAt: Date.now() };
      setLastCompletedMatch(entry);
      try {
        localStorage.setItem('dice_chess_last_game', JSON.stringify(entry));
      } catch {}
    }
  }, [socketMatch?.status]);

  // Local Grandmaster Bot Match State (zero database clutter, ephemeral)
  const [botMatch, setBotMatch] = useState<MatchState | null>(null);
  const [botPlayerColor, setBotPlayerColor] = useState<PieceColor>('white');
  const [botDifficulty, setBotDifficulty] = useState<'grandmaster' | 'master'>('grandmaster');
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Run Bot turn
  const runBotTurn = useCallback(
    (currentMatch: MatchState, color: PieceColor) => {
      setIsBotThinking(true);

      // EDIT 2 & Check Defense: If dice are permanently disabled or Bot is in check, skip dice roll and move directly!
      if (!currentMatch.diceActive || currentMatch.inCheck === color) {
        setTimeout(() => {
          const depth = botDifficulty === 'grandmaster' ? 3 : 2;
          const bestMove = getBestBotMove(currentMatch, color, depth);

          if (bestMove) {
            const res = executeMove(currentMatch, bestMove.from, bestMove.to);
            if (res.success) {
              let botFinalState = res.state;
              if (botFinalState.pausedForAction && botFinalState.pausedForAction.player === color) {
                if (botFinalState.pausedForAction.type === 'expansion') {
                  const side = getBotExpansionChoice(color);
                  botFinalState = applyBoardExpansion(botFinalState, color, side);
                }
                if (botFinalState.pausedForAction?.type === 'crafting') {
                  const craftChoice = getBotCraftingChoice(botFinalState.board, color);
                  if (craftChoice) {
                    const craftRes = applyCraftPlacement(botFinalState, color, craftChoice.pieceType, craftChoice.position);
                    if (craftRes.success) botFinalState = craftRes.state;
                  } else {
                    botFinalState = { ...botFinalState, pausedForAction: null };
                  }
                }
              }
              setBotMatch(botFinalState);
              if (botFinalState.status === 'completed') {
                sounds.playGameOver();
                const entry = { match: botFinalState, completedAt: Date.now() };
                setLastCompletedMatch(entry);
                try {
                  localStorage.setItem('dice_chess_last_game', JSON.stringify(entry));
                } catch {}
              } else if (bestMove.captured) {
                sounds.playCapture();
              } else {
                sounds.playMove();
              }
            }
          }
          setIsBotThinking(false);
        }, 600);
        return;
      }

      // Normal turn: Bot rolls dice after brief delay
      setTimeout(() => {
        const dice = rollAuthoritativeDice(currentMatch.board, color);
        sounds.playDiceRoll();

        const matchWithDice: MatchState = {
          ...currentMatch,
          dice,
          updatedAt: Date.now(),
        };
        setBotMatch(matchWithDice);

        // Phase 2: Bot computes best move using Minimax + PST
        setTimeout(() => {
          const depth = botDifficulty === 'grandmaster' ? 3 : 2;
          const bestMove = getBestBotMove(matchWithDice, color, depth);

          if (bestMove) {
            const res = executeMove(matchWithDice, bestMove.from, bestMove.to);
            if (res.success) {
              let botFinalState = res.state;
              if (botFinalState.pausedForAction && botFinalState.pausedForAction.player === color) {
                if (botFinalState.pausedForAction.type === 'expansion') {
                  const side = getBotExpansionChoice(color);
                  botFinalState = applyBoardExpansion(botFinalState, color, side);
                }
                if (botFinalState.pausedForAction?.type === 'crafting') {
                  const craftChoice = getBotCraftingChoice(botFinalState.board, color);
                  if (craftChoice) {
                    const craftRes = applyCraftPlacement(botFinalState, color, craftChoice.pieceType, craftChoice.position);
                    if (craftRes.success) botFinalState = craftRes.state;
                  } else {
                    botFinalState = { ...botFinalState, pausedForAction: null };
                  }
                }
              }
              setBotMatch(botFinalState);
              if (botFinalState.status === 'completed') {
                sounds.playGameOver();
                const entry = { match: botFinalState, completedAt: Date.now() };
                setLastCompletedMatch(entry);
                try {
                  localStorage.setItem('dice_chess_last_game', JSON.stringify(entry));
                } catch {}
              } else if (bestMove.captured) {
                sounds.playCapture();
              } else {
                sounds.playMove();
              }
            }
          }
          setIsBotThinking(false);
        }, 500);
      }, 500);
    },
    [botDifficulty]
  );

  // Start instant match against Grandmaster Bot with chosen timer (2m or 5m), move suggestions, game mode, and piece theme
  const handleStartBotMatch = (
    playerColor: PieceColor,
    difficulty: 'grandmaster' | 'master',
    timeControl: 120 | 300 = 300,
    moveSuggestions: 'included' | 'excluded' = 'included',
    gameMode: 'standard' | 'crafted' | 'classic' = 'standard',
    craftingAllowed: boolean = true,
    pieceTheme: PieceTheme = 'classic'
  ) => {
    if (!user) return;
    setIsBotModalOpen(false);
    setBotPlayerColor(playerColor);
    setBotDifficulty(difficulty);
    setLastCompletedMatch(null);
    localStorage.removeItem('dice_chess_last_game');

    const botUser = {
      userId: 'usr_bot_gm',
      username: 'grandmaster_bot',
      displayName: difficulty === 'grandmaster' ? 'Grandmaster Bot' : 'Master Bot',
      avatarId: 'avatar_prince',
    };

    const now = Date.now();
    const initialMatch: MatchState = {
      id: `bot_match_${now}`,
      whitePlayer: playerColor === 'white' ? {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarId: user.avatarId,
      } : botUser,
      blackPlayer: playerColor === 'black' ? {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarId: user.avatarId,
      } : botUser,
      board: createInitialBoard(gameMode),
      gameMode,
      craftingAllowed: gameMode === 'classic' ? false : craftingAllowed,
      pieceTheme,
      turn: 'white',
      status: 'active',
      dice: null,
      whitePawnsReachedEndRank: 0,
      blackPawnsReachedEndRank: 0,
      capturedByWhite: [],
      capturedByBlack: [],
      moveHistory: [],
      inCheck: null,
      result: null,
      moveSuggestions,
      totalCaptures: 0,
      diceActive: gameMode === 'classic' ? false : true,
      timeControl,
      whiteTimeRemaining: timeControl,
      blackTimeRemaining: timeControl,
      lastTurnStartTime: now,
      createdAt: now,
      updatedAt: now,
    };

    setBotMatch(initialMatch);
    sounds.playChallenge();

    // If bot is playing White, take first turn
    if (playerColor === 'black') {
      runBotTurn(initialMatch, 'white');
    }
  };

  // Bot Match Timer Countdown & Timeout evaluation
  useEffect(() => {
    if (!botMatch || botMatch.status !== 'active') return;

    const interval = setInterval(() => {
      setBotMatch((prev) => {
        if (!prev || prev.status !== 'active') return prev;

        // When crafting or expansion is triggered/pending, timer MUST stop
        if (prev.pausedForAction) return prev;

        const isWhiteTurn = prev.turn === 'white';
        const needsDice = prev.diceActive !== false && prev.inCheck !== prev.turn;
        const hasUnrolledDice = !prev.dice || prev.dice.isConsumed;
        const now = Date.now();
        const turnElapsed = (now - (prev.lastTurnStartTime || now)) / 1000;

        // Grace pause: clock does not tick during grace window while awaiting dice roll
        if (needsDice && hasUnrolledDice && turnElapsed < (DICE_GRACE_WINDOW_MS / 1000)) {
          return prev;
        }

        const currentRemaining = isWhiteTurn ? prev.whiteTimeRemaining : prev.blackTimeRemaining;
        const newRemaining = Math.max(0, currentRemaining - 1);

        if (newRemaining <= 0) {
          // Timeout occurred! Evaluate timeout with bot >= 3 piece advantage rule
          const finished = handleTimeout(prev, prev.turn, true);
          sounds.playGameOver();
          const entry = { match: finished, completedAt: Date.now() };
          setLastCompletedMatch(entry);
          try {
            localStorage.setItem('dice_chess_last_game', JSON.stringify(entry));
          } catch {}
          return finished;
        }

        return {
          ...prev,
          whiteTimeRemaining: isWhiteTurn ? newRemaining : prev.whiteTimeRemaining,
          blackTimeRemaining: !isWhiteTurn ? newRemaining : prev.blackTimeRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [botMatch?.status, botMatch?.turn, botMatch?.dice, botMatch?.diceActive, botMatch?.inCheck]);

  // Bot Match: Human Rolls Dice
  const handleBotMatchRoll = () => {
    if (!botMatch || botMatch.status !== 'active') return;
    if (botMatch.diceActive === false) return; // EDIT 2: Dice disabled after 3 captures
    if (botMatch.turn !== botPlayerColor) return;
    if (botMatch.dice && !botMatch.dice.isConsumed) return;

    const dice = rollAuthoritativeDice(botMatch.board, botPlayerColor);
    sounds.playDiceRoll();
    setBotMatch({
      ...botMatch,
      dice,
      updatedAt: Date.now(),
    });
  };

  // Bot Match: Human Moves Piece
  const handleBotMatchMove = (from: Position, to: Position) => {
    if (!botMatch || botMatch.status !== 'active') return;
    if (botMatch.turn !== botPlayerColor) return;

    const res = executeMove(botMatch, from, to);
    if (!res.success) return;

    let nextMatch = res.state;
    const botColor: PieceColor = botPlayerColor === 'white' ? 'black' : 'white';

    // If move triggered an expansion or craft perk for the Bot:
    if (nextMatch.pausedForAction && nextMatch.pausedForAction.player === botColor) {
      if (nextMatch.pausedForAction.type === 'expansion') {
        const side = getBotExpansionChoice(botColor);
        nextMatch = applyBoardExpansion(nextMatch, botColor, side);
      }
      if (nextMatch.pausedForAction?.type === 'crafting') {
        const craftChoice = getBotCraftingChoice(nextMatch.board, botColor);
        if (craftChoice) {
          const craftRes = applyCraftPlacement(nextMatch, botColor, craftChoice.pieceType, craftChoice.position);
          if (craftRes.success) nextMatch = craftRes.state;
        } else {
          nextMatch = { ...nextMatch, pausedForAction: null };
        }
      }
    }

    setBotMatch(nextMatch);

    if (nextMatch.status === 'completed') {
      sounds.playGameOver();
      const entry = { match: nextMatch, completedAt: Date.now() };
      setLastCompletedMatch(entry);
      try {
        localStorage.setItem('dice_chess_last_game', JSON.stringify(entry));
      } catch {}
      return;
    }

    const lastMove = nextMatch.moveHistory[nextMatch.moveHistory.length - 1];
    if (lastMove?.captured) {
      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    // Trigger Bot's turn ONLY if not waiting for human player action
    if (!nextMatch.pausedForAction && nextMatch.turn === botColor) {
      runBotTurn(nextMatch, botColor);
    }
  };

  // Bot Match: Human expands board
  const handleBotMatchExpand = (side: ExpansionSide) => {
    if (!botMatch) return;
    let nextMatch = applyBoardExpansion(botMatch, botPlayerColor, side);
    setBotMatch(nextMatch);
    const botColor: PieceColor = botPlayerColor === 'white' ? 'black' : 'white';
    if (!nextMatch.pausedForAction && nextMatch.turn === botColor) {
      runBotTurn(nextMatch, botColor);
    }
  };

  // Bot Match: Human places crafted piece
  const handleBotMatchCraftPlace = (pieceType: PieceType, position: Position) => {
    if (!botMatch) return;
    const res = applyCraftPlacement(botMatch, botPlayerColor, pieceType, position);
    if (!res.success) return;
    const nextMatch = res.state;
    setBotMatch(nextMatch);
    const botColor: PieceColor = botPlayerColor === 'white' ? 'black' : 'white';
    if (!nextMatch.pausedForAction && nextMatch.turn === botColor) {
      runBotTurn(nextMatch, botColor);
    }
  };

  // Bot Match: Human cancels crafting
  const handleBotMatchCraftCancel = () => {
    if (!botMatch) return;
    const nextMatch = cancelCrafting(botMatch, botPlayerColor);
    setBotMatch(nextMatch);
    const botColor: PieceColor = botPlayerColor === 'white' ? 'black' : 'white';
    if (!nextMatch.pausedForAction && nextMatch.turn === botColor) {
      runBotTurn(nextMatch, botColor);
    }
  };

  // Bot Match: Resign
  const handleBotMatchResign = () => {
    if (!botMatch || !user) return;
    const resMatch = resignMatch(botMatch, user.id);
    setBotMatch(resMatch);
    sounds.playGameOver();
    const entry = { match: resMatch, completedAt: Date.now() };
    setLastCompletedMatch(entry);
    try {
      localStorage.setItem('dice_chess_last_game', JSON.stringify(entry));
    } catch {}
  };

  // Exit match view
  const handleExitMatch = () => {
    if (botMatch) {
      setBotMatch(null); // Clean up bot match immediately (zero storage clutter)
    } else {
      clearSocketMatch();
    }
  };

  // Punisher Match: Human Moves Piece
  const handlePunisherMatchMove = (from: Position, to: Position) => {
    if (!punisherMatch || punisherMatch.status !== 'active') return;
    if (punisherMatch.turn !== 'white') return; // User is always white in this mode

    const res = executeMove(punisherMatch, from, to);
    if (!res.success) return;

    setPunisherMatch(res.state);

    if (res.state.status === 'completed') {
      sounds.playGameOver();
      const entry = { match: res.state, completedAt: Date.now() };
      setLastCompletedMatch(entry);
      return;
    }

    const lastMove = res.state.moveHistory[res.state.moveHistory.length - 1];
    if (lastMove?.captured) {
      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    // Trigger Bot's turn
    if (activePunisherBotId) {
      runPunisherBotTurn(res.state, activePunisherBotId);
    }
  };

  const handlePunisherMatchResign = () => {
    if (!punisherMatch || !user) return;
    if (punisherTimeoutRef.current) {
      clearTimeout(punisherTimeoutRef.current);
      punisherTimeoutRef.current = null;
    }
    setIsBotThinking(false);
    const resMatch = resignMatch(punisherMatch, user.id);
    setPunisherMatch(resMatch);
    sounds.playGameOver();
    const entry = { match: resMatch, completedAt: Date.now() };
    setLastCompletedMatch(entry);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6" role="status">
        <div className="w-12 h-12 border-4 border-white bg-amber-400 animate-spin shadow-[4px_4px_0px_#ffffff]"></div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-black uppercase tracking-widest text-white">Initialising Domain</span>
          <span className="sr-only">Loading Dice Chess...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthModal />
        <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      </>
    );
  }

  if (showCraftTheory) {
    return <CraftTheoryView onBack={() => setShowCraftTheory(false)} />;
  }

  if (isRoseOpen) {
    return <RoseParadiseView onBack={() => setIsRoseOpen(false)} />;
  }

  if (isHashiraTrainingOpen) {
    return (
      <HashiraTrainingView
        initialTrainerId={selectedTrainerForTraining}
        initialToolId={selectedToolForTraining}
        onBack={() => setIsHashiraTrainingOpen(false)}
      />
    );
  }

  if (activeSecretBot) {
    return (
      <>
        <SecretMatchView
          botConfig={activeSecretBot}
          onExit={() => {
            setActiveSecretBot(null);
            setReturnToSecretArena(true);
          }}
          onHome={() => {
            setActiveSecretBot(null);
            setReturnToSecretArena(false);
            try {
              sessionStorage.removeItem('mugen_secret_arena_origin');
            } catch {}
          }}
          onOpenRules={() => setIsRulesOpen(true)}
        />
        <RulesModal
          isOpen={isRulesOpen}
          onClose={() => setIsRulesOpen(false)}
        />
      </>
    );
  }

  if (active3dMatchParams) {
    return (
      <Chess3dArcadeView
        botId={active3dMatchParams.botId}
        playerTeam={active3dMatchParams.playerTeam}
        timeControl={active3dMatchParams.timeControl}
        roomCode={active3dMatchParams.roomCode}
        onExit={() => setActive3dMatchParams(null)}
      />
    );
  }

  const activeGame = botMatch || socketMatch || punisherMatch;

  return (
    <>
      {showAd && (
        <PopupAd
          imageSrc={adImage}
          onClose={() => setShowAd(false)}
          onFightPunishers={() => {
            setShowAd(false);
            setIsPunisherSelectorOpen(true);
          }}
        />
      )}
      
      <AnimatePresence>
        {isPunisherSelectorOpen && (
          <PunisherSelector 
            initialSelectedBot={initialPunisherBot}
            onSelect={(botId) => {
              setInitialPunisherBot(undefined);
              handleStartPunisherMatch(botId);
            }}
            onClose={() => {
              setInitialPunisherBot(undefined);
              setIsPunisherSelectorOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {activeGame ? (
        <MatchView
          onOpenRules={() => setIsRulesOpen(true)}
          onExit={() => {
            if (punisherTimeoutRef.current) {
              clearTimeout(punisherTimeoutRef.current);
              punisherTimeoutRef.current = null;
            }
            setIsBotThinking(false);
            setBotMatch(null);
            setPunisherMatch(null);
            setActivePunisherBotId(null);
            clearSocketMatch();
          }}
          overrideMatch={activeGame || undefined}
          customOnRoll={botMatch ? handleBotMatchRoll : (punisherMatch ? () => {} : undefined)}
          customOnMove={botMatch ? handleBotMatchMove : (punisherMatch ? handlePunisherMatchMove : undefined)}
          customOnResign={botMatch ? handleBotMatchResign : (punisherMatch ? handlePunisherMatchResign : undefined)}
          customOnExpand={botMatch ? handleBotMatchExpand : undefined}
          customOnCraftPlace={botMatch ? handleBotMatchCraftPlace : undefined}
          customOnCraftCancel={botMatch ? handleBotMatchCraftCancel : undefined}
          isBotMatch={Boolean(botMatch || punisherMatch)}
          isBotThinking={isBotThinking}
          activePunisherBotId={activePunisherBotId}
        />
      ) : (
        <Dashboard
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenBotModal={() => {
            setBotInitialGameMode('standard');
            setIsBotModalOpen(true);
          }}
          onOpenCraftedBotModal={() => {
            setBotInitialGameMode('crafted');
            setIsBotModalOpen(true);
          }}
          onOpenClassicBotModal={() => {
            setBotInitialGameMode('classic');
            setIsBotModalOpen(true);
          }}
          onOpenCraftTheory={() => setShowCraftTheory(true)}
          onOpenRose={() => setIsRoseOpen(true)}
          onOpenHashiraTraining={(trainerId?: TrainerId) => {
            if (trainerId) setSelectedTrainerForTraining(trainerId);
            setIsHashiraModalOpen(true);
          }}
          onOpenPunisher={() => setIsPunisherSelectorOpen(true)}
          onExitPreGameViews={() => {
            setIsPunisherSelectorOpen(false);
            setIsBotModalOpen(false);
            setIsHashiraModalOpen(false);
          }}
          onStartSecretMatch={(botConfig) => setActiveSecretBot(botConfig)}
          onStart3dMatch={(params) => setActive3dMatchParams(params)}
          lastCompletedMatch={lastCompletedMatch}
          onClearLastGame={() => {
            setLastCompletedMatch(null);
            localStorage.removeItem('dice_chess_last_game');
          }}
          initialSecretArenaOpen={returnToSecretArena}
          onClearInitialSecretArena={() => setReturnToSecretArena(false)}
        />
      )}

      {/* Global Real-Time Incoming Challenge Modal */}
      <ChallengeModal
        challenge={incomingChallenge}
        onAccept={(id) => respondChallenge(id, 'accept')}
        onDecline={(id) => respondChallenge(id, 'decline')}
      />

      {/* Full Game Rulebook Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        activeMatch={activeGame || undefined}
        isBotMatch={Boolean(botMatch)}
      />

      {/* Instant Grandmaster Bot Match Modal */}
      <BotMatchModal
        isOpen={isBotModalOpen}
        onClose={() => setIsBotModalOpen(false)}
        initialGameMode={botInitialGameMode}
        onStartBotMatch={handleStartBotMatch}
      />

      {/* Hashira Training Dojo Opening Modal */}
      <HashiraDojoModal
        isOpen={isHashiraModalOpen}
        initialTrainerId={selectedTrainerForTraining}
        onClose={() => setIsHashiraModalOpen(false)}
        onStartTraining={(trainerId, toolId) => {
          setSelectedTrainerForTraining(trainerId);
          setSelectedToolForTraining(toolId);
          setIsHashiraModalOpen(false);
          setIsHashiraTrainingOpen(true);
        }}
      />

      {/* Global 2D Reward Chest Host */}
      <ChestRewardHost
        userId={user?.id}
        onStartSecretMatch={(botConfig) => setActiveSecretBot(botConfig)}
      />

      {/* Global Elo Streak Notification Banner */}
      <EloStreakNotification />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PredictorProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </PredictorProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
