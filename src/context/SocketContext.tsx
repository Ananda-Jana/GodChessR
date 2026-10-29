import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { MatchState, Challenge, Position, ExpansionSide, PieceType, PieceTheme } from '../types/game';
import { sounds } from '../utils/audio';

interface SocketContextType {
  isConnected: boolean;
  onlineUserIds: string[];
  incomingChallenge: Challenge | null;
  activeMatch: MatchState | null;
  abandonedMatch: MatchState | null;
  matchError: string | null;
  resumeAbandonedMatch: () => void;
  resignAbandonedMatch: () => void;
  sendChallenge: (
    targetUserId: string,
    timeControl?: 120 | 300,
    moveSuggestions?: 'included' | 'excluded',
    craftingAllowed?: boolean,
    pieceTheme?: PieceTheme,
    gameMode?: 'standard' | 'crafted' | 'classic',
    expansionDisabled?: boolean
  ) => void;
  respondChallenge: (challengeId: string, action: 'accept' | 'decline') => void;
  cancelChallenge: (challengeId: string) => void;
  joinMatch: (matchId: string) => void;
  rollDice: () => void;
  makeMove: (from: Position, to: Position) => void;
  resignMatch: () => void;
  expandBoard: (side: ExpansionSide) => void;
  craftPiece: (pieceType: PieceType, position: Position) => void;
  cancelCraft: () => void;
  clearIncomingChallenge: () => void;
  clearActiveMatch: () => void;
  clearMatchError: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, logout } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [incomingChallenge, setIncomingChallenge] = useState<Challenge | null>(null);
  const [activeMatch, setActiveMatch] = useState<MatchState | null>(null);
  const [abandonedMatch, setAbandonedMatch] = useState<MatchState | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authRetryCountRef = useRef<number>(0);
  const activeMatchRef = useRef<MatchState | null>(null);
  const abandonedMatchRef = useRef<MatchState | null>(null);
  const isViewingActiveMatchRef = useRef<boolean>(false);

  useEffect(() => {
    activeMatchRef.current = activeMatch;
  }, [activeMatch]);

  useEffect(() => {
    abandonedMatchRef.current = abandonedMatch;
  }, [abandonedMatch]);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const connect = useCallback(() => {
    if (!token) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Authenticate socket connection
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'auth:success':
            authRetryCountRef.current = 0;
            if (activeMatchRef.current?.id && isViewingActiveMatchRef.current) {
              send({ type: 'match:join', matchId: activeMatchRef.current.id });
            }
            break;

          case 'auth:failed':
            setIsConnected(false);
            isViewingActiveMatchRef.current = false;
            setActiveMatch(null);
            activeMatchRef.current = null;
            setAbandonedMatch(null);
            abandonedMatchRef.current = null;
            if (authRetryCountRef.current < 1 && token) {
              authRetryCountRef.current += 1;
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'auth', token }));
              }
            } else {
              logout();
            }
            break;

          case 'presence:update':
            setOnlineUserIds(msg.onlineUserIds || []);
            break;

          case 'challenge:incoming':
            setIncomingChallenge(msg.challenge);
            sounds.playChallenge();
            break;

          case 'challenge:declined':
            setMatchError(`${msg.challengedName || 'Opponent'} declined your challenge.`);
            break;

          case 'challenge:cancelled':
            setIncomingChallenge((prev) => (prev?.id === msg.challengeId ? null : prev));
            break;

          case 'match:started':
            isViewingActiveMatchRef.current = true;
            setActiveMatch(msg.match);
            activeMatchRef.current = msg.match;
            setAbandonedMatch(null);
            abandonedMatchRef.current = null;
            setIncomingChallenge(null);
            send({ type: 'match:join', matchId: msg.matchId });
            sounds.playChallenge();
            break;

          case 'match:state': {
            const incomingMatch = msg.match as MatchState;
            if (!incomingMatch) break;

            if (incomingMatch.status === 'active') {
              // If player was already actively viewing this match in this session, keep updating
              if (isViewingActiveMatchRef.current && activeMatchRef.current?.id === incomingMatch.id) {
                setActiveMatch(incomingMatch);
                activeMatchRef.current = incomingMatch;
              } else {
                // Re-entry / reconnect discovered active match: prompt player with Resume/Resign
                setAbandonedMatch(incomingMatch);
                abandonedMatchRef.current = incomingMatch;
              }
            } else {
              if (abandonedMatchRef.current?.id === incomingMatch.id) {
                setAbandonedMatch(null);
                abandonedMatchRef.current = null;
              }
              if (isViewingActiveMatchRef.current && activeMatchRef.current?.id === incomingMatch.id) {
                setActiveMatch(incomingMatch);
                activeMatchRef.current = incomingMatch;
              }
            }
            break;
          }

          case 'match:dice_rolled':
            if (isViewingActiveMatchRef.current && activeMatchRef.current?.id === msg.match.id) {
              setActiveMatch(msg.match);
              activeMatchRef.current = msg.match;
              sounds.playDiceRoll();
            } else if (abandonedMatchRef.current?.id === msg.match.id) {
              setAbandonedMatch(msg.match);
              abandonedMatchRef.current = msg.match;
            }
            break;

          case 'match:moved':
            if (abandonedMatchRef.current?.id === msg.match.id) {
              if (msg.match.status === 'completed') {
                setAbandonedMatch(null);
                abandonedMatchRef.current = null;
              } else {
                setAbandonedMatch(msg.match);
                abandonedMatchRef.current = msg.match;
              }
            }
            if (isViewingActiveMatchRef.current && activeMatchRef.current?.id === msg.match.id) {
              setActiveMatch(msg.match);
              activeMatchRef.current = msg.match;
              if (msg.match.status === 'completed') {
                sounds.playGameOver();
              } else if (msg.lastMove?.captured) {
                sounds.playCapture();
              } else {
                sounds.playMove();
              }
            }
            break;

          case 'match:resigned':
            if (abandonedMatchRef.current?.id === msg.match.id) {
              setAbandonedMatch(null);
              abandonedMatchRef.current = null;
            }
            if (isViewingActiveMatchRef.current && activeMatchRef.current?.id === msg.match.id) {
              setActiveMatch(msg.match);
              activeMatchRef.current = msg.match;
              sounds.playGameOver();
            }
            break;

          case 'match:expanded':
          case 'match:craft_placed':
            if (isViewingActiveMatchRef.current && activeMatchRef.current?.id === msg.match.id) {
              setActiveMatch(msg.match);
              activeMatchRef.current = msg.match;
            } else if (abandonedMatchRef.current?.id === msg.match.id) {
              setAbandonedMatch(msg.match);
              abandonedMatchRef.current = msg.match;
            }
            break;

          case 'error': {
            setMatchError(msg.message);
            const lowerMsg = (msg.message || '').toLowerCase();
            if (
              lowerMsg.includes('match not found') ||
              lowerMsg.includes('match is not active') ||
              lowerMsg.includes('not active')
            ) {
              isViewingActiveMatchRef.current = false;
              setActiveMatch(null);
              activeMatchRef.current = null;
              setAbandonedMatch(null);
              abandonedMatchRef.current = null;
            }
            break;
          }
        }
      } catch (err) {
        console.error('Socket message parse error:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      // Reconnect after 3 seconds if token still present
      if (token) {
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = (err) => {
      console.warn('WebSocket encountered error:', err);
      ws.close();
    };
  }, [token, logout, send]);

  useEffect(() => {
    authRetryCountRef.current = 0;
    if (token) {
      connect();
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      isViewingActiveMatchRef.current = false;
      setOnlineUserIds([]);
      setIncomingChallenge(null);
      setActiveMatch(null);
      activeMatchRef.current = null;
      setAbandonedMatch(null);
      abandonedMatchRef.current = null;
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, connect]);

  const sendChallenge = (
    targetUserId: string,
    timeControl: 120 | 300 = 300,
    moveSuggestions: 'included' | 'excluded' = 'included',
    craftingAllowed: boolean = true,
    pieceTheme: PieceTheme = 'classic',
    gameMode: 'standard' | 'crafted' | 'classic' = 'standard',
    expansionDisabled: boolean = false
  ) => {
    setMatchError(null);
    send({ type: 'challenge:send', targetUserId, timeControl, moveSuggestions, craftingAllowed, pieceTheme, gameMode, expansionDisabled });
  };

  const respondChallenge = (challengeId: string, action: 'accept' | 'decline') => {
    setMatchError(null);
    send({ type: 'challenge:respond', challengeId, action });
    if (action === 'decline') {
      setIncomingChallenge(null);
    }
  };

  const cancelChallenge = (challengeId: string) => {
    send({ type: 'challenge:cancel', challengeId });
  };

  const joinMatch = (matchId: string) => {
    setMatchError(null);
    send({ type: 'match:join', matchId });
  };

  const rollDice = () => {
    setMatchError(null);
    send({ type: 'match:roll' });
  };

  const makeMove = (from: Position, to: Position) => {
    setMatchError(null);
    send({ type: 'match:move', from, to });
  };

  const resignMatch = () => {
    send({ type: 'match:resign' });
  };

  const resumeAbandonedMatch = useCallback(() => {
    const matchToResume = abandonedMatchRef.current;
    if (matchToResume) {
      setAbandonedMatch(null);
      abandonedMatchRef.current = null;
      isViewingActiveMatchRef.current = true;
      setActiveMatch(matchToResume);
      activeMatchRef.current = matchToResume;
      send({ type: 'match:join', matchId: matchToResume.id });
    }
  }, [send]);

  const resignAbandonedMatch = useCallback(() => {
    const matchToResign = abandonedMatchRef.current;
    if (matchToResign) {
      send({ type: 'match:resign', matchId: matchToResign.id });
      setAbandonedMatch(null);
      abandonedMatchRef.current = null;
      isViewingActiveMatchRef.current = false;
      setActiveMatch(null);
      activeMatchRef.current = null;
    }
  }, [send]);

  const expandBoard = (side: ExpansionSide) => {
    send({ type: 'match:expand', side });
  };

  const craftPiece = (pieceType: PieceType, position: Position) => {
    send({ type: 'match:craft_place', pieceType, position });
  };

  const cancelCraft = () => {
    send({ type: 'match:craft_cancel' });
  };

  const clearIncomingChallenge = () => setIncomingChallenge(null);
  const clearActiveMatch = () => {
    isViewingActiveMatchRef.current = false;
    setActiveMatch(null);
    activeMatchRef.current = null;
  };
  const clearMatchError = () => setMatchError(null);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        onlineUserIds,
        incomingChallenge,
        activeMatch,
        abandonedMatch,
        matchError,
        resumeAbandonedMatch,
        resignAbandonedMatch,
        sendChallenge,
        respondChallenge,
        cancelChallenge,
        joinMatch,
        rollDice,
        makeMove,
        resignMatch,
        expandBoard,
        craftPiece,
        cancelCraft,
        clearIncomingChallenge,
        clearActiveMatch,
        clearMatchError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
}
