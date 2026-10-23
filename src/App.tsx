import React, { useState, useEffect, useCallback } from 'react';
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
} from './game/engine';
import { getBestBotMove, getBotExpansionChoice, getBotCraftingChoice } from './game/bot';
import { sounds } from './utils/audio';
import { Crown } from 'lucide-react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showAd, setShowAd] = useState(false);
  const adImage = '/assets/aistudio/image_554ae4cc.png';

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
  const [botInitialGameMode, setBotInitialGameMode] = useState<'standard' | 'crafted'>('standard');

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
    gameMode: 'standard' | 'crafted' = 'standard',
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
      craftingAllowed,
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
      diceActive: true,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center text-slate-100 gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
          <Crown className="w-5 h-5" />
        </div>
        <span className="text-xs text-slate-400 font-medium">Connecting to Dice Chess...</span>
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

  const activeGame = botMatch || socketMatch;

  return (
    <>
      {showAd && <PopupAd imageSrc={adImage} onClose={() => setShowAd(false)} />}
      {activeGame ? (
        <MatchView
          onOpenRules={() => setIsRulesOpen(true)}
          onExit={handleExitMatch}
          overrideMatch={botMatch || undefined}
          customOnRoll={botMatch ? handleBotMatchRoll : undefined}
          customOnMove={botMatch ? handleBotMatchMove : undefined}
          customOnResign={botMatch ? handleBotMatchResign : undefined}
          customOnExpand={botMatch ? handleBotMatchExpand : undefined}
          customOnCraftPlace={botMatch ? handleBotMatchCraftPlace : undefined}
          customOnCraftCancel={botMatch ? handleBotMatchCraftCancel : undefined}
          isBotMatch={Boolean(botMatch)}
          isBotThinking={isBotThinking}
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
          onOpenCraftTheory={() => setShowCraftTheory(true)}
          onOpenRose={() => setIsRoseOpen(true)}
          lastCompletedMatch={lastCompletedMatch}
          onClearLastGame={() => {
            setLastCompletedMatch(null);
            localStorage.removeItem('dice_chess_last_game');
          }}
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
