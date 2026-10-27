import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MatchState, PieceColor, Position } from '../types/game';
import { SecretPlayerConfig, SecretChatMessage } from './types';
import { createInitialBoard, executeMove } from '../game/engine';
import { computeSecretBotTurn, getPlayerActionDialogue, respondToUserChat } from './secretBotEngine';
import { SecretChatOverlay } from './components/SecretChatOverlay';
import { ChessBoard } from '../components/ChessBoard';
import { sounds } from '../utils/audio';
import { RotateCcw, ArrowLeft, Swords, BookOpen, Trophy, Send, MessageSquare, Lock, Heart } from 'lucide-react';
import { usePredictor } from '../predictor/PredictorContext';
import { reportGameEnd } from '../chest/reportGameEnd';
import { extractStandardMetrics } from '../predictor/adapters/standardAdapter';

interface SecretMatchViewProps {
  botConfig: SecretPlayerConfig;
  playerColor?: PieceColor;
  onExit: () => void;
  onOpenRules: () => void;
}

export const SecretMatchView: React.FC<SecretMatchViewProps> = ({
  botConfig,
  playerColor = 'white',
  onExit,
  onOpenRules,
}) => {
  const { finalizeMatch } = usePredictor();
  const botColor: PieceColor = playerColor === 'white' ? 'black' : 'white';

  const [match, setMatch] = useState<MatchState>(() => {
    const now = Date.now();
    return {
      id: `secret_match_${now}`,
      whitePlayer: {
        userId: playerColor === 'white' ? 'player_human' : `bot_${botConfig.id}`,
        username: playerColor === 'white' ? botConfig.opponentAddressingName : botConfig.realName,
        displayName: playerColor === 'white' ? botConfig.opponentAddressingName : botConfig.realName,
        avatarId: 'avatar_prince',
      },
      blackPlayer: {
        userId: playerColor === 'black' ? 'player_human' : `bot_${botConfig.id}`,
        username: playerColor === 'black' ? botConfig.opponentAddressingName : botConfig.realName,
        displayName: playerColor === 'black' ? botConfig.opponentAddressingName : botConfig.realName,
        avatarId: 'avatar_prince',
      },
      board: createInitialBoard('standard'),
      gameMode: 'standard',
      craftingAllowed: false,
      pieceTheme: 'classic',
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
      moveSuggestions: 'included',
      totalCaptures: 0,
      diceActive: false, // Normal chess
      timeControl: 300,
      whiteTimeRemaining: 300,
      blackTimeRemaining: 300,
      lastTurnStartTime: now,
      createdAt: now,
      updatedAt: now,
    };
  });

  const [chatLog, setChatLog] = useState<SecretChatMessage[]>(() => [
    {
      id: 'init_msg',
      sender: 'bot',
      senderName: botConfig.realName,
      text: botConfig.dialogue.onMatchStart[0] || 'Let us begin!',
      timestamp: Date.now(),
    },
  ]);

  const [userInputText, setUserInputText] = useState('');
  const [currentMessage, setCurrentMessage] = useState<string | null>(
    botConfig.dialogue.onMatchStart[0] || null
  );
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [capturesByBotCount, setCapturesByBotCount] = useState(0);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll desktop chat log to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const addChatMessage = (sender: 'bot' | 'player' | 'system', senderName: string, text: string) => {
    const newMsg: SecretChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      sender,
      senderName,
      text,
      timestamp: Date.now(),
    };
    setChatLog((prev) => [...prev, newMsg]);
    if (sender === 'bot') {
      setCurrentMessage(text);
    }
  };

  // Bot Turn Execution
  const runBotTurn = useCallback(
    (currentMatch: MatchState) => {
      setIsBotThinking(true);

      setTimeout(() => {
        const decision = computeSecretBotTurn(
          currentMatch,
          botConfig,
          botColor,
          capturesByBotCount
        );

        if (decision.dialogueMessage) {
          addChatMessage('bot', botConfig.realName, decision.dialogueMessage);
        }

        if (decision.move) {
          const res = executeMove(currentMatch, decision.move.from, decision.move.to);
          if (res.success) {
            const nextMatch = res.state;
            if (decision.move.captured) {
              setCapturesByBotCount((prev) => prev + 1);
              sounds.playCapture();
            } else {
              sounds.playMove();
            }

            setMatch(nextMatch);

            if (nextMatch.status === 'completed') {
              sounds.playGameOver();
              if (nextMatch.result?.winner === (playerColor === 'white' ? 'white' : 'black')) {
                const winMsg = botConfig.dialogue.onDefeat[0] || 'You won!';
                addChatMessage('bot', botConfig.realName, winMsg);
              } else if (nextMatch.result?.winner === (botColor === 'white' ? 'white' : 'black')) {
                const loseMsg = botConfig.dialogue.onVictory[0] || 'I won!';
                addChatMessage('bot', botConfig.realName, loseMsg);
              }
            }
          }
        }

        setIsBotThinking(false);
      }, 700);
    },
    [botConfig, botColor, capturesByBotCount, playerColor]
  );

  // Initial Bot turn if Bot is White
  useEffect(() => {
    if (match.turn === botColor && match.status === 'active' && match.moveHistory.length === 0) {
      runBotTurn(match);
    }
  }, []);

  // Human Player Move
  const handlePlayerMove = (from: Position, to: Position) => {
    if (match.status !== 'active' || match.turn !== playerColor || isBotThinking) return;

    const res = executeMove(match, from, to);
    if (!res.success) return;

    const nextMatch = res.state;
    const lastMove = nextMatch.moveHistory[nextMatch.moveHistory.length - 1];
    const isCapture = Boolean(lastMove?.captured);
    const isCheckOnBot = nextMatch.inCheck === botColor;

    const actionMsg = getPlayerActionDialogue(botConfig, isCapture, isCheckOnBot);
    if (actionMsg) {
      addChatMessage('bot', botConfig.realName, actionMsg);
    }

    if (isCapture) {
      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    setMatch(nextMatch);

    if (nextMatch.status === 'completed') {
      sounds.playGameOver();
      const metrics = extractStandardMetrics(nextMatch, playerColor);
      const outcome = nextMatch.result?.winner === (playerColor === 'white' ? 'white' : 'black') ? 'win' : nextMatch.result?.winner === 'draw' ? 'draw' : 'loss';
      finalizeMatch(nextMatch.id, 'standard', playerColor, outcome, metrics, botConfig.realName, 'grandmaster');
      const myMoves = nextMatch.moveHistory.filter(m => m.piece.color === playerColor).length;
      reportGameEnd({ matchId: nextMatch.id, mode: 'secret', result: outcome, moves: myMoves, isTraining: false });

      if (nextMatch.result?.winner === (playerColor === 'white' ? 'white' : 'black')) {
        addChatMessage('bot', botConfig.realName, botConfig.dialogue.onDefeat[0] || 'You won!');
      } else {
        addChatMessage('bot', botConfig.realName, botConfig.dialogue.onVictory[0] || 'I won!');
      }
      return;
    }

    if (nextMatch.turn === botColor) {
      runBotTurn(nextMatch);
    }
  };

  // Interactive Player Chat Handler
  const handleSendUserMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputText.trim()) return;

    const userText = userInputText.trim();
    setUserInputText('');

    // Add user message to log
    addChatMessage('player', botConfig.opponentAddressingName, userText);

    // Bot generates response after brief delay
    setTimeout(() => {
      const reply = respondToUserChat(botConfig, userText);
      addChatMessage('bot', botConfig.realName, reply);
    }, 500);
  };

  // Restart match
  const handleRestartMatch = () => {
    const now = Date.now();
    const freshMatch: MatchState = {
      id: `secret_match_${now}`,
      whitePlayer: match.whitePlayer,
      blackPlayer: match.blackPlayer,
      board: createInitialBoard('standard'),
      gameMode: 'standard',
      craftingAllowed: false,
      pieceTheme: 'classic',
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
      moveSuggestions: 'included',
      totalCaptures: 0,
      diceActive: false,
      timeControl: 300,
      whiteTimeRemaining: 300,
      blackTimeRemaining: 300,
      lastTurnStartTime: now,
      createdAt: now,
      updatedAt: now,
    };

    setMatch(freshMatch);
    setCapturesByBotCount(0);
    const startMsg = botConfig.dialogue.onMatchStart[0] || 'Let us play!';
    setCurrentMessage(startMsg);
    setChatLog([
      {
        id: `start_${now}`,
        sender: 'bot',
        senderName: botConfig.realName,
        text: startMsg,
        timestamp: now,
      },
    ]);

    if (playerColor === 'black') {
      runBotTurn(freshMatch);
    }
  };

  const isPlayerTurn = match.turn === playerColor;

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between p-0 md:p-3 sm:p-5 font-sans select-none">
      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 px-2 md:px-0 mb-3 pb-2.5 border-b-2 border-slate-800">
        <button
          onClick={onExit}
          className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-xs font-black uppercase flex items-center gap-1.5 border-2 border-slate-200 text-white shadow-[3px_3px_0px_#ffffff] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Arena
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-amber-400" />
            Secret Arena · Playing vs {botConfig.realName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestartMatch}
            className="p-1.5 bg-neutral-900 hover:bg-amber-400 hover:text-black border-2 border-white text-white shadow-[2px_2px_0px_#ffffff] cursor-pointer"
            title="Restart Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenRules}
            className="p-1.5 bg-neutral-900 hover:bg-amber-400 hover:text-black border-2 border-white text-white shadow-[2px_2px_0px_#ffffff] cursor-pointer"
            title="Rules"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid: Desktop (3 columns: Left Sidebar Chat, Center Board, Right Sidebar Bot Info) vs Mobile (Single Column) */}
      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start my-auto">
        
        {/* DESKTOP LEFT SIDEBAR: Interactive Chat Window */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col h-[580px] bg-[#0c1017] border-3 border-slate-700 shadow-[6px_6px_0px_#000000] p-4 rounded-xl">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-800 mb-3">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Live Dialogue & Chat Log
            </h3>
          </div>

          {/* Scrollable Chat Log */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 font-sans text-xs">
            {chatLog.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 mb-0.5">
                    {msg.senderName}
                  </span>
                  <div
                    className={`p-2.5 rounded-lg max-w-[90%] leading-snug font-semibold ${
                      isBot
                        ? 'bg-neutral-900 border border-amber-500/40 text-amber-200/90 shadow-sm'
                        : 'bg-amber-400 text-black font-bold shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Interactive Player Chat Input Form */}
          <form onSubmit={handleSendUserMessage} className="mt-3 pt-3 border-t-2 border-slate-800 flex gap-2">
            <input
              type="text"
              value={userInputText}
              onChange={(e) => setUserInputText(e.target.value)}
              placeholder={`Message ${botConfig.realName}...`}
              className="flex-1 px-3 py-2 bg-neutral-900 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_#fff] cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-black" />
            </button>
          </form>
        </aside>

        {/* CENTER COLUMN: Chess Board & Mobile Live Message Box */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center w-full max-w-[100vw] lg:max-w-[540px] mx-auto">
          
          {/* MOBILE ONLY: Fixed Height Live Message Box */}
          <div className="block lg:hidden w-full px-2 md:px-0">
            <SecretChatOverlay
              botConfig={botConfig}
              currentMessage={currentMessage}
              isBotThinking={isBotThinking}
            />
          </div>

          {/* Status Bar */}
          <div className="w-full mb-2 px-2 md:px-3.5 py-2 bg-[#0c1017] border-2 border-slate-700 flex items-center justify-between text-xs font-black uppercase shadow-sm">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isPlayerTurn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isPlayerTurn ? 'Your Turn' : `${botConfig.realName}'s Turn`}</span>
            </div>

            {match.inCheck && (
              <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] animate-bounce">
                CHECK ON {match.inCheck.toUpperCase()}!
              </span>
            )}
          </div>

          {/* Crimson & Cream Chess Board (boardPalette="crimson") */}
          <ChessBoard
            board={match.board}
            turn={match.turn}
            myColor={playerColor}
            dice={null}
            lastMove={match.moveHistory[match.moveHistory.length - 1]}
            inCheck={match.inCheck}
            isInteractive={match.status === 'active' && isPlayerTurn && !isBotThinking}
            onMove={handlePlayerMove}
            flipped={playerColor === 'black'}
            diceActive={false} // Normal chess mode
            showMoveSuggestions={true}
            boardPalette="crimson" // Crimson (#BC1434) & Cream (#F2EFE4) square palette!
          />

          {/* Game Result Card */}
          {match.status === 'completed' && (
            <div className="w-full mt-3 p-4 bg-amber-400 text-black border-4 border-black shadow-[6px_6px_0px_#000] flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200 max-h-[85dvh] overflow-y-auto">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-black" />
                <h3 className="text-base font-black uppercase">
                  {match.result?.winner === 'draw'
                    ? 'Game Drawn!'
                    : `${match.result?.winner === playerColor ? 'You Won!' : `${botConfig.realName} Won!`}`}
                </h3>
              </div>
              <p className="text-xs font-bold text-neutral-900 text-center">
                {match.result?.reason}
              </p>
              <button
                onClick={handleRestartMatch}
                className="py-2.5 px-5 bg-black hover:bg-neutral-900 text-amber-400 font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* DESKTOP RIGHT SIDEBAR: Bot Large Profile Card & Info */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col bg-[#0c1017] border-3 border-slate-700 shadow-[6px_6px_0px_#000000] p-5 rounded-xl items-center text-center gap-4">
          {/* Large Profile Picture */}
          {botConfig.avatarSrc ? (
            <img
              src={botConfig.avatarSrc}
              alt={botConfig.realName}
              className="w-36 h-36 object-cover border-4 border-amber-400 shadow-[5px_5px_0px_#000000] my-1"
            />
          ) : (
            <div
              className={`w-36 h-36 ${botConfig.avatarBg} border-4 border-amber-400 shadow-[5px_5px_0px_#000000] flex items-center justify-center text-5xl my-1`}
            >
              {botConfig.avatarIcon}
            </div>
          )}

          <div className="flex flex-col items-center">
            <h2 className="text-xl font-black uppercase tracking-wide text-amber-400">
              {botConfig.realName}
            </h2>
            <p className="text-xs font-bold text-slate-300 mt-0.5">{botConfig.title}</p>
            <span className="text-[10px] font-black uppercase mt-1 px-2 py-0.5 bg-amber-400 text-black border border-black flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-600 fill-red-600" />
              Calls you: {botConfig.opponentAddressingName}
            </span>
          </div>

          <p className="text-xs text-slate-300 italic font-medium leading-relaxed px-2">
            "{botConfig.tagline}"
          </p>

          <div className="w-full border-t border-slate-800 pt-3 space-y-2 text-xs font-mono text-left">
            <div className="flex justify-between text-slate-400">
              <span>Passcode:</span>
              <span className="text-amber-300 font-bold">Secured</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mode:</span>
              <span className="text-white font-bold">Crimson Chess</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Moves Played:</span>
              <span className="text-white font-bold">{match.moveHistory.length}</span>
            </div>
          </div>

          <div className="w-full pt-2 flex flex-col gap-2">
            <button
              onClick={handleRestartMatch}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_#fff] cursor-pointer"
            >
              Restart Match
            </button>
            <button
              onClick={onExit}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase border border-slate-700 cursor-pointer"
            >
              Exit Arena
            </button>
          </div>
        </aside>

      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-7xl mx-auto mt-3 pt-2 border-t-2 border-slate-800 text-[10px] font-mono text-center text-slate-500 uppercase">
        MugenChessX Secret Players Arena · Crimson & Cream Board Palette · Babai & Golu
      </footer>
    </div>
  );
};
