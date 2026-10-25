import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  JoystickWraith, 
  StaticJester, 
  OctavianHollow, 
  IronRegent, 
  CyclopsRevenant, 
  ChromeReaper,
  BotExpression,
} from './ChessBotFaces_with_Gestures';
import { PunisherBotId, PUNISHER_BOTS } from './punisherBot';
import { MatchState, Piece, PieceType } from '../types/game';
import { MessageSquare, Zap } from 'lucide-react';
import { getRandomBotMessage, BotMessageSituation } from './botMessages';
import { resolveBotFace } from './BanglaBotFaces';
import { getRandomBanglaBotMessage } from './banglaBotMessages';

interface ObserverBotProps {
  botId: PunisherBotId;
  match: MatchState;
  isThinking?: boolean;
  variant?: 'desktop' | 'mobile';
}


const getPieceValue = (type: PieceType): number => {
  switch (type) {
    case 'pawn': return 1;
    case 'knight':
    case 'bishop': return 3;
    case 'rook': return 5;
    case 'queen': return 9;
    default: return 1;
  }
};

const getMaterialScore = (pieces: Piece[] = []) => {
  return pieces.reduce((sum, p) => sum + getPieceValue(p.type), 0);
};

export const ObserverBot: React.FC<ObserverBotProps> = ({
  botId,
  match,
  isThinking = false,
  variant = 'desktop',
}) => {
  const [currentExpression, setCurrentExpression] = useState<BotExpression>('neutral');
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);

  // Expression & animation timing refs
  const lastFaceChangeTimeRef = useRef<number>(0);
  const lastExpressionRef = useRef<BotExpression>('neutral');
  const alternateMinorRef = useRef<boolean>(false);
  const prevInCheckRef = useRef<string | null>(match.inCheck);

  // Timers
  const revertTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const slowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech inventory tracker
  const usedMessagesRef = useRef<Set<string>>(new Set());
  const messageCountRef = useRef<number>(0);
  const lastMessageTimeRef = useRef<number>(0);
  const prevMoveCountRef = useRef<number>(match.moveHistory.length);
  const prevMatchIdRef = useRef<string>(match.id);

  const config = PUNISHER_BOTS[botId] || PUNISHER_BOTS['chrome-reaper'];
  const Icon = resolveBotFace(botId);

  // Material evaluation: positive means bot (black) is ahead on material
  const botMaterial = getMaterialScore(match.capturedByBlack || []);
  const playerMaterial = getMaterialScore(match.capturedByWhite || []);
  const materialDiff = botMaterial - playerMaterial;

  // Apply expression state cleanly without interrupting the floating animation
  const applyExpression = (nextExp: BotExpression, autoRevertMs: number = 3200) => {
    const now = Date.now();

    if (revertTimerRef.current) {
      clearTimeout(revertTimerRef.current);
      revertTimerRef.current = null;
    }

    setCurrentExpression(nextExp);
    lastExpressionRef.current = nextExp;
    lastFaceChangeTimeRef.current = now;

    // Auto-revert to neutral / material state after specified duration
    if (autoRevertMs > 0 && nextExp !== 'neutral' && nextExp !== 'thinking' && nextExp !== 'victory' && nextExp !== 'defeat') {
      revertTimerRef.current = setTimeout(() => {
        if (materialDiff >= 6) {
          setCurrentExpression('victory');
        } else if (materialDiff >= 3) {
          setCurrentExpression('smug');
        } else if (materialDiff <= -6) {
          setCurrentExpression('angry');
        } else if (materialDiff <= -3) {
          setCurrentExpression('worried');
        } else {
          setCurrentExpression('neutral');
        }
      }, autoRevertMs);
    }
  };

  // Helper to trigger bot speech bubble (smooth non-disruptive dialog)
  const triggerSpeech = (
    situation: BotMessageSituation, 
    force: boolean = false, 
    context?: { piece?: string; square?: string }
  ) => {
    const now = Date.now();
    const timeSinceLast = now - lastMessageTimeRef.current;

    if (!force) {
      if (messageCountRef.current >= 15) return;
      if (timeSinceLast < 6000) return;
    }

    const msg = botId === 'bangla-bot'
      ? getRandomBanglaBotMessage(situation, usedMessagesRef.current, context)
      : getRandomBotMessage(botId, situation, usedMessagesRef.current, context);

    setActiveSpeech(msg);
    messageCountRef.current += 1;
    lastMessageTimeRef.current = now;

    setTimeout(() => {
      setActiveSpeech((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Clear all pending timers safely
  const clearAllTimers = () => {
    if (revertTimerRef.current) clearTimeout(revertTimerRef.current);
    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Monitor Thinking state: always 'thinking', trigger 'longThinking' if > 3.5s
  useEffect(() => {
    if (isThinking) {
      applyExpression('thinking', 0);
      thinkingTimerRef.current = setTimeout(() => {
        if (isThinking) {
          triggerSpeech('longThinking');
        }
      }, 3500);
    } else {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
    }
  }, [isThinking]);

  // Monitor Idle and Player Slow timers
  useEffect(() => {
    if (match.status !== 'active') return;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);

    // Idle timer: 8-10 seconds of no moves
    idleTimerRef.current = setTimeout(() => {
      if (!isThinking && match.status === 'active') {
        applyExpression('neutral', 1000);
        stageTimerRef.current = setTimeout(() => {
          applyExpression(Math.random() > 0.5 ? 'wave' : 'smug', 2500);
          triggerSpeech('idleTaunt');
        }, 800);
      }
    }, 9000);

    // Player slow timer: 20 seconds on player's turn
    if (match.turn === 'white' && !isThinking) {
      slowTimerRef.current = setTimeout(() => {
        if (match.turn === 'white' && !isThinking && match.status === 'active') {
          applyExpression(Math.random() > 0.5 ? 'taunt' : 'smug', 3000);
          triggerSpeech('playerSlow');
        }
      }, 20000);
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, [match.moveHistory.length, match.turn, isThinking, match.status]);

  // Main match event listener
  useEffect(() => {
    // Reset trackers when match ID changes (new game start)
    if (match.id !== prevMatchIdRef.current) {
      clearAllTimers();
      usedMessagesRef.current.clear();
      messageCountRef.current = 0;
      lastMessageTimeRef.current = 0;
      prevMoveCountRef.current = 0;
      prevMatchIdRef.current = match.id;
      prevInCheckRef.current = match.inCheck;
      setActiveSpeech(null);

      // Game start: wave or taunt
      applyExpression(Math.random() > 0.5 ? 'wave' : 'taunt', 3500);
      triggerSpeech('gameStart', true);
      return;
    }

    // 1. GAME END STATE
    if (match.status === 'completed' && match.result) {
      clearAllTimers();
      const isWinner = match.result.winner === 'black'; // Bot is black in Punisher mode
      if (isWinner) {
        // Bot wins: victory (then taunt or devil 1.5s later)
        applyExpression('victory', 0);
        triggerSpeech('botVictory', true);
        stageTimerRef.current = setTimeout(() => {
          applyExpression(Math.random() > 0.5 ? 'taunt' : 'devil', 0);
        }, 1500);
      } else if (match.result.winner === 'white') {
        // Bot loses: defeat (then worried 1.5s later)
        applyExpression('defeat', 0);
        triggerSpeech('botDefeat', true);
        stageTimerRef.current = setTimeout(() => {
          applyExpression('worried', 0);
        }, 1500);
      }
      return;
    }

    // 2. MOVE EVENT HANDLING
    const moveCount = match.moveHistory.length;
    if (moveCount > prevMoveCountRef.current) {
      const lastMove = match.moveHistory[moveCount - 1];
      const secondLastMove = moveCount >= 2 ? match.moveHistory[moveCount - 2] : null;
      const isBotMove = lastMove.piece.color === 'black';
      prevMoveCountRef.current = moveCount;

      const squareName = String.fromCharCode(97 + lastMove.to.x) + (lastMove.to.y + 1);
      const pieceName = lastMove.piece.type;

      if (!isBotMove) {
        // ==================== PLAYER MOVED ====================
        if (lastMove.captured) {
          // Player captured bot's piece
          const capType = lastMove.captured.type;
          const isCheck = match.inCheck === 'black';

          if (isCheck) {
            // Player captures with check
            const checkFace = capType === 'queen' ? 'devil' : capType === 'rook' ? 'angry' : (Math.random() > 0.5 ? 'angry' : 'devil');
            applyExpression(checkFace);
            triggerSpeech('lostWithCheck', true);
          } else if (capType === 'queen') {
            // Player captures queen: shocked first, then devil about 900ms later
            applyExpression('shocked');
            triggerSpeech('lostQueen', true);
            stageTimerRef.current = setTimeout(() => {
              applyExpression('devil');
            }, 900);
          } else if (capType === 'rook') {
            // Player captures rook: shocked first, then angry or devil about 700ms later
            applyExpression('shocked');
            triggerSpeech('lostRook', true);
            stageTimerRef.current = setTimeout(() => {
              applyExpression(Math.random() > 0.5 ? 'angry' : 'devil');
            }, 700);
          } else if (capType === 'knight' || capType === 'bishop') {
            // Player captures knight or bishop: angry or devil (alternate)
            const chosenFace = alternateMinorRef.current ? 'devil' : 'angry';
            alternateMinorRef.current = !alternateMinorRef.current;
            applyExpression(chosenFace);
            triggerSpeech('lostMinor');
          } else {
            // Player captures pawn: angry
            applyExpression('angry');
            triggerSpeech('lostPawn');
          }
        } else if (match.inCheck === 'black') {
          // Player gives check without capture: worried or shocked
          applyExpression(Math.random() > 0.5 ? 'worried' : 'shocked');
          triggerSpeech('playerGivesCheck');
        } else if (secondLastMove?.captured && !lastMove.captured) {
          // Check if equal trade occurred
          applyExpression(Math.random() > 0.5 ? 'neutral' : 'smug');
          triggerSpeech('playerTrade');
        } else if (lastMove.to.y < lastMove.from.y) {
          // Player retreats a piece: smug
          applyExpression('smug');
          triggerSpeech('playerRetreat');
        } else if (lastMove.to.y >= 4) {
          // Threatening bot's territory / strong attack: worried
          applyExpression('worried');
          triggerSpeech('playerThreat');
        } else {
          // Material momentum check
          if (materialDiff <= -6) {
            applyExpression('shocked');
            triggerSpeech('botLosing');
            stageTimerRef.current = setTimeout(() => applyExpression('angry'), 750);
          } else if (materialDiff <= -3) {
            applyExpression('worried');
            triggerSpeech('botBehind');
          }
        }
      } else {
        // ==================== BOT MOVED ====================
        if (lastMove.captured) {
          // Bot captured player's piece
          const capType = lastMove.captured.type;
          if (capType === 'queen') {
            // Bot captures queen: victory or devil
            applyExpression(Math.random() > 0.5 ? 'victory' : 'devil');
            triggerSpeech('botTakesQueen', true);
          } else if (capType === 'rook') {
            // Bot captures rook: taunt or wave
            applyExpression(Math.random() > 0.5 ? 'taunt' : 'wave');
            triggerSpeech('botTakesRook');
          } else if (capType === 'knight' || capType === 'bishop') {
            // Bot captures knight or bishop: happy or taunt
            applyExpression(Math.random() > 0.5 ? 'happy' : 'taunt');
            triggerSpeech('botTakesMinor');
          } else {
            // Bot captures pawn: smug
            applyExpression('smug');
            triggerSpeech('botTakesPawn');
          }
        } else if (match.inCheck === 'white') {
          // Bot gives check: devil or taunt
          applyExpression(Math.random() > 0.5 ? 'devil' : 'taunt');
          triggerSpeech('botGivesCheck');
        } else if (prevInCheckRef.current === 'black' && match.inCheck !== 'black') {
          // Bot escaped a check or threat: smug
          applyExpression('smug');
          triggerSpeech('botEscapes');
        } else {
          // Material momentum check
          if (materialDiff >= 6) {
            applyExpression(Math.random() > 0.5 ? 'victory' : 'taunt');
            triggerSpeech('botCrushing');
          } else if (materialDiff >= 3) {
            applyExpression(Math.random() > 0.5 ? 'smug' : 'wave');
            triggerSpeech('botAhead');
          }
        }
      }

      prevInCheckRef.current = match.inCheck;
    }
  }, [match.moveHistory.length, match.inCheck, match.status, match.id]);

  // Color scheme: Red for angry/devil, Blue (#2727F5) for thinking, Yellow (amber-400) by default
  const moodColor = useMemo(() => {
    if (currentExpression === 'angry' || currentExpression === 'devil') {
      return 'text-red-500';
    }
    if (currentExpression === 'thinking') {
      return 'text-[#2727F5]';
    }
    return 'text-amber-400';
  }, [currentExpression]);

  const moodLabel = useMemo(() => {
    switch (currentExpression) {
      case 'angry':
      case 'devil':
        return 'ANGRY';
      case 'thinking':
        return 'COMPUTING';
      case 'happy':
      case 'wave':
        return 'PLEASED';
      case 'smug':
      case 'taunt':
        return 'SMUG';
      case 'shocked':
        return 'SHOCKED';
      case 'worried':
        return 'WORRIED';
      case 'victory':
        return 'VICTORIOUS';
      case 'defeat':
        return 'DEFEATED';
      default:
        return 'WATCHING YOU';
    }
  }, [currentExpression]);

  // ==================== MOBILE VARIANT ====================
  if (variant === 'mobile') {
    return (
      <div className="w-full h-[84px] bg-[#090912] border-2 border-[#2727F5] px-3 py-1.5 shadow-[2px_2px_0px_#000] flex items-center justify-between gap-2 overflow-hidden shrink-0 relative">
        {/* Subtle grid background */}
        <div 
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'linear-gradient(rgba(39,39,245,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(39,39,245,0.3) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* Left Side: Bot Face Avatar (76px) + Details, NO inner box, frame or glow */}
        <div className="relative shrink-0 flex items-center gap-2 z-10 min-w-0">
          <motion.div
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.8,
              ease: 'easeInOut',
            }}
            className="relative flex items-center justify-center shrink-0"
          >
            <Icon
              size={76}
              expression={currentExpression}
              className={`${moodColor} transition-colors duration-300 overflow-visible`}
            />
          </motion.div>

          <div className="flex flex-col min-w-0 justify-center max-w-[130px] sm:max-w-[170px]">
            <span className="text-[11px] sm:text-xs font-black text-white uppercase leading-tight break-words">
              {config.name}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 leading-none">
                {config.rating}
              </span>
              <span className={`text-[8px] font-mono px-1 py-0.5 border border-black shadow-[1px_1px_0px_#000] font-black uppercase leading-none transition-colors duration-300 ${
                currentExpression === 'angry' || currentExpression === 'devil'
                  ? 'bg-red-600 text-white'
                  : currentExpression === 'thinking'
                  ? 'bg-[#2727F5] text-white'
                  : 'bg-black text-amber-400'
              }`}>
                {moodLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Reserved Dialogue Area */}
        <div className="flex-1 min-w-0 h-[64px] flex items-center justify-end z-10 relative">
          <AnimatePresence mode="wait">
            {activeSpeech ? (
              <motion.div
                key={activeSpeech}
                initial={{ opacity: 0, scale: 0.9, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 8 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-[200px] h-[56px] bg-white/10 dark:bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-[0_4px_16px_rgba(0,0,0,0.6)] flex items-center relative overflow-hidden"
              >
                <div className="flex items-start gap-1.5 w-full">
                  <MessageSquare className="w-3 h-3 text-[#2727F5] shrink-0 mt-0.5" />
                  <p 
                    className="text-[10px] font-bold text-white italic leading-tight line-clamp-2"
                    style={botId === 'bangla-bot' ? {
                      fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', 'Kalpurush', system-ui, sans-serif",
                      lineHeight: '1.4',
                    } : undefined}
                  >
                    "{activeSpeech}"
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle-badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 text-right px-2 py-1 border border-white/10 bg-black/40 rounded-lg"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-mono text-zinc-400 uppercase">STATUS</span>
                  <span className="text-[10px] font-mono font-black text-white">
                    {isThinking ? 'COMPUTING' : 'WATCHING'}
                  </span>
                </div>
                <Zap className="w-3.5 h-3.5 text-[#2727F5]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ==================== DESKTOP VARIANT ====================
  return (
    <div className="w-full aspect-square max-w-[300px] bg-[#090912] border-3 border-[#2727F5] p-3 shadow-[4px_4px_0px_#000000] flex flex-col items-center justify-between relative shrink-0 rounded-none">
      {/* Background Grid */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(39,39,245,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(39,39,245,0.3) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Top Header Row */}
      <div className="w-full flex items-center justify-between pb-1 mb-1 border-b border-white/10 relative z-10 shrink-0">
        <div className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-[#2727F5]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white">
            AI Punisher Core
          </span>
        </div>
        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] transition-colors duration-300 ${
          currentExpression === 'angry' || currentExpression === 'devil'
            ? 'bg-red-600 text-white' 
            : currentExpression === 'thinking' 
            ? 'bg-[#2727F5] text-white' 
            : 'bg-black text-amber-400'
        }`}>
          {moodLabel}
        </span>
      </div>

      {/* Center Avatar Arena: Face floats smoothly without any inner box, border, or glow */}
      <div className="relative flex-1 w-full flex items-center justify-center z-10 min-h-0 py-1 overflow-visible">
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.2,
            ease: 'easeInOut',
          }}
          className="relative cursor-pointer flex items-center justify-center"
          onClick={() => triggerSpeech('midgameTaunt', true)}
          title="Click to trigger bot line"
        >
          <Icon
            size={120}
            expression={currentExpression}
            className={`${moodColor} transition-colors duration-300 overflow-visible`}
          />
        </motion.div>
      </div>

      {/* Bot Info Block */}
      <div className="w-full text-center relative z-10 shrink-0 mb-1 px-1">
        <h3 className="text-sm font-black text-white uppercase tracking-tight break-words leading-tight">
          {config.name}
        </h3>
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono">
          <span className="text-amber-400 font-bold">ELO {config.rating}</span>
          <span className="text-white/40">·</span>
          <span className="text-zinc-400">Depth {config.depth}</span>
        </div>
      </div>

      {/* Glassmorphic Speech Bubble */}
      <div className="w-full h-[54px] flex items-center justify-center relative z-20 shrink-0">
        <AnimatePresence mode="wait">
          {activeSpeech ? (
            <motion.div
              key={activeSpeech}
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full bg-white/10 dark:bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center relative overflow-hidden"
            >
              <div className="flex items-start gap-1.5 w-full">
                <MessageSquare className="w-3.5 h-3.5 text-[#2727F5] shrink-0 mt-0.5" />
                <p 
                  className="text-[10px] font-bold text-white italic leading-tight line-clamp-2"
                  style={botId === 'bangla-bot' ? {
                    fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', 'Kalpurush', system-ui, sans-serif",
                    lineHeight: '1.4',
                  } : undefined}
                >
                  "{activeSpeech}"
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="standby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full border border-white/10 bg-white/5 rounded-xl flex items-center justify-between px-3 text-[10px] text-zinc-400 font-mono"
            >
              <span>TACTICAL STATUS:</span>
              <span className="text-white font-bold">{isThinking ? 'COMPUTING...' : 'ACTIVE'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
