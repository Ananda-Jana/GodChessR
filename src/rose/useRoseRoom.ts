import { useState, useEffect, useRef, useCallback } from 'react';
import type { RoseMatchState, RoseRole, RoseReaction, PublicRoseRoom, RoseSummonPieceType } from './types.ts';
import type { PieceColor, Position } from '../types/game.ts';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/audio';

export interface RoseChatMessage {
  id: string;
  senderUserId: string;
  senderDisplayName: string;
  text: string;
  timestamp: number;
}

export function useRoseRoom() {
  const { user, token } = useAuth();
  const [match, setMatch] = useState<RoseMatchState | null>(null);
  const matchRef = useRef<RoseMatchState | null>(null);
  matchRef.current = match;

  const [myColor, setMyColor] = useState<PieceColor | null>(null);
  const [myRole, setMyRole] = useState<RoseRole | null>(null);
  const [publicRooms, setPublicRooms] = useState<PublicRoseRoom[]>([]);
  const [hostedCode, setHostedCode] = useState<string | null>(null);
  const [isWaitingForPartner, setIsWaitingForPartner] = useState(false);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [isJoiningChallenge, setIsJoiningChallenge] = useState(false);
  const [joiningCode, setJoiningCode] = useState<string | null>(null);
  const [isQueueing, setIsQueueing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState(false);
  const [reactions, setReactions] = useState<RoseReaction[]>([]);
  const [chatMessages, setChatMessages] = useState<RoseChatMessage[]>([]);
  
  const userRef = useRef(user);
  userRef.current = user;
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    let isMounted = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      const currentToken = tokenRef.current;
      const currentUser = userRef.current;
      if (currentToken) {
        ws.send(JSON.stringify({ type: 'auth', token: currentToken }));
      }
      // Re-associate socket with any active match matching Culling Game resync logic
      if (matchRef.current) {
        ws.send(
          JSON.stringify({
            type: 'rose:resync',
            matchId: matchRef.current.id,
            userId: currentUser?.id,
          })
        );
      } else {
        ws.send(JSON.stringify({ type: 'rose:list_challenges' }));
        ws.send(JSON.stringify({ type: 'rose:list_rooms' }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'rose:rooms_list':
          case 'rose:challenges_list':
            setPublicRooms(data.challenges || data.rooms || []);
            break;

          case 'rose:created':
          case 'rose:challenge_created':
            setHostedCode(data.code);
            setIsWaitingForPartner(true);
            setIsCreatingChallenge(false);
            setStatusMessage('Waiting for partner to join...');
            if (data.yourColor) setMyColor(data.yourColor);
            if (data.yourRole) setMyRole(data.yourRole);
            setError(null);
            break;

          case 'rose:queued':
            setIsQueueing(true);
            setStatusMessage('Searching for Rose Partner in matchmaking queue...');
            break;

          case 'rose:match_started': {
            const currentMatch = data.match;
            const currentUser = userRef.current;
            const assignedColor = data.yourColor || (currentMatch?.whiteSeat?.userId === currentUser?.id ? 'white' : 'black');
            const assignedRole = data.yourRole || (assignedColor === 'white' ? 'boyfriend' : 'girlfriend');

            setStatusMessage('Opponent joined! Launching game...');
            setIsJoiningChallenge(false);
            setJoiningCode(null);
            setIsCreatingChallenge(false);
            setIsWaitingForPartner(false);
            setIsQueueing(false);
            setHostedCode(null);
            setPendingMove(false);
            setError(null);
            sounds.playChallenge();

            // Smooth 300ms transition matching Culling Game
            setTimeout(() => {
              setMatch(currentMatch);
              setMyColor(assignedColor);
              setMyRole(assignedRole);
              setStatusMessage(null);
            }, 300);
            break;
          }

          case 'rose:state':
            setMatch(data.match);
            if (data.yourColor) setMyColor(data.yourColor);
            if (data.yourRole) setMyRole(data.yourRole);
            setPendingMove(false);
            setError(null);
            break;

          case 'rose:moved':
            setMatch(data.match);
            if (data.yourColor) setMyColor(data.yourColor);
            if (data.yourRole) setMyRole(data.yourRole);
            setPendingMove(false);
            setError(null);
            if (data.match.status === 'completed') {
              sounds.playGameOver();
            } else if (data.lastMove?.captured) {
              sounds.playCapture();
            } else {
              sounds.playMove();
            }
            break;

          case 'rose:cancelled':
          case 'rose:challenge_cancelled':
            setIsWaitingForPartner(false);
            setIsCreatingChallenge(false);
            setIsJoiningChallenge(false);
            setIsQueueing(false);
            setJoiningCode(null);
            setStatusMessage(null);
            setHostedCode(null);
            break;

          case 'rose:error':
            setError(data.message || 'Operation failed');
            setIsCreatingChallenge(false);
            setIsJoiningChallenge(false);
            setIsQueueing(false);
            setJoiningCode(null);
            setStatusMessage(null);
            setPendingMove(false);
            break;

          case 'rose:reaction':
            setReactions((prev) => [...prev.slice(-8), data.reaction]);
            setTimeout(() => {
              setReactions((prev) => prev.filter((r) => r.id !== data.reaction.id));
            }, 3500);
            break;

          case 'rose:chat':
            setChatMessages((prev) => [...prev.slice(-30), data.message]);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Rose client message parse error:', err);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      setIsCreatingChallenge(false);
      setIsJoiningChallenge(false);
      setIsQueueing(false);
      setJoiningCode(null);
      if (isMounted) {
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      setIsCreatingChallenge(false);
      setIsJoiningChallenge(false);
      setIsQueueing(false);
      setJoiningCode(null);
    };
  }, []);

  // Send auth token when token becomes available on existing socket
  useEffect(() => {
    if (token && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'auth', token }));
    }
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !matchRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const createRoom = useCallback((role: RoseRole) => {
    setError(null);
    setStatusMessage('Creating challenge room...');
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Connecting to game server...');
      return;
    }
    setIsCreatingChallenge(true);
    const currentUser = userRef.current;
    send({
      type: 'rose:create_challenge',
      role,
      userId: currentUser?.id,
      displayName: currentUser?.displayName || currentUser?.username || 'Partner',
      avatarId: currentUser?.avatarId,
      token: tokenRef.current,
    });
  }, [send]);

  const joinQueue = useCallback((role: RoseRole) => {
    setError(null);
    setStatusMessage('Searching for Rose Partner in queue...');
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Connecting to game server...');
      return;
    }
    setIsQueueing(true);
    const currentUser = userRef.current;
    send({
      type: 'rose:join_queue',
      role,
      userId: currentUser?.id,
      displayName: currentUser?.displayName || currentUser?.username || 'Partner',
      avatarId: currentUser?.avatarId,
      token: tokenRef.current,
    });
  }, [send]);

  const cancelQueue = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      send({ type: 'rose:cancel_queue' });
    }
    setIsQueueing(false);
    setStatusMessage(null);
  }, [send]);

  const joinRoom = useCallback((code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter a room code.');
      return;
    }
    const cleanSuffix = cleanCode.replace(/^ROSE/, '');
    const hostedSuffix = hostedCode ? hostedCode.trim().toUpperCase().replace(/^ROSE/, '') : '';
    if (hostedCode && (cleanCode === hostedCode || cleanSuffix === hostedSuffix)) {
      setError('You cannot join your own room code.');
      return;
    }
    setError(null);
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Disconnected from server. Reconnecting...');
      return;
    }
    setIsJoiningChallenge(true);
    setJoiningCode(cleanCode);
    setStatusMessage('Connecting to room...');
    const currentUser = userRef.current;
    send({
      type: 'rose:join_challenge',
      code: cleanCode,
      userId: currentUser?.id,
      displayName: currentUser?.displayName || currentUser?.username || 'Partner',
      avatarId: currentUser?.avatarId,
      token: tokenRef.current,
    });
  }, [send, hostedCode]);

  const cancelRoom = useCallback(() => {
    const currentUser = userRef.current;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && hostedCode) {
      send({
        type: 'rose:cancel_challenge',
        code: hostedCode,
        userId: currentUser?.id,
      });
    } else {
      send({ type: 'rose:cancel_challenge' });
    }
    setIsCreatingChallenge(false);
    setIsJoiningChallenge(false);
    setIsQueueing(false);
    setJoiningCode(null);
    setIsWaitingForPartner(false);
    setStatusMessage(null);
    setHostedCode(null);
  }, [send, hostedCode]);

  const sendMove = useCallback((from: Position, to: Position) => {
    setError(null);
    setPendingMove(true);
    send({
      type: 'rose:move',
      roomId: match?.id,
      from,
      to,
      userId: userRef.current?.id,
    });
  }, [send, match?.id]);

  const sendSummon = useCallback((pieceType: RoseSummonPieceType, to: Position) => {
    setError(null);
    send({
      type: 'rose:summon',
      roomId: match?.id,
      pieceType,
      to,
      userId: userRef.current?.id,
    });
  }, [send, match?.id]);

  const sendReaction = useCallback((text: string) => {
    send({
      type: 'rose:reaction',
      roomId: match?.id,
      text,
      userId: userRef.current?.id,
    });
  }, [send, match?.id]);

  const sendChat = useCallback((text: string) => {
    if (!text.trim()) return;
    send({
      type: 'rose:chat',
      roomId: match?.id,
      text: text.trim(),
      userId: userRef.current?.id,
    });
  }, [send, match?.id]);

  const resignMatch = useCallback(() => {
    send({
      type: 'rose:resign',
      roomId: match?.id,
      userId: userRef.current?.id,
    });
  }, [send, match?.id]);

  const refreshRooms = useCallback(() => {
    send({ type: 'rose:list_challenges' });
  }, [send]);

  const clearMatch = useCallback(() => {
    setMatch(null);
    setHostedCode(null);
    setIsWaitingForPartner(false);
    setIsCreatingChallenge(false);
    setIsJoiningChallenge(false);
    setIsQueueing(false);
    setJoiningCode(null);
    setStatusMessage(null);
    setError(null);
    setChatMessages([]);
    refreshRooms();
  }, [refreshRooms]);

  return {
    match,
    myColor,
    myRole,
    publicRooms,
    hostedCode,
    isWaitingForPartner,
    isCreatingChallenge,
    isJoiningChallenge,
    isQueueing,
    joiningCode,
    statusMessage,
    error,
    setError,
    pendingMove,
    reactions,
    chatMessages,
    setChatMessages,
    createRoom,
    joinQueue,
    cancelQueue,
    joinRoom,
    cancelRoom,
    sendMove,
    sendSummon,
    sendReaction,
    sendChat,
    resignMatch,
    clearMatch,
    refreshRooms,
  };
}
