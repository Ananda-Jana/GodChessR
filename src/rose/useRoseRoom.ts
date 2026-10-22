import { useState, useEffect, useRef, useCallback } from 'react';
import type { RoseMatchState, RoseRole, RoseReaction, PublicRoseRoom } from './types.ts';
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
  const [myColor, setMyColor] = useState<PieceColor | null>(null);
  const [myRole, setMyRole] = useState<RoseRole | null>(null);
  const [publicRooms, setPublicRooms] = useState<PublicRoseRoom[]>([]);
  const [hostedCode, setHostedCode] = useState<string | null>(null);
  const [isWaitingForPartner, setIsWaitingForPartner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState(false);
  const [reactions, setReactions] = useState<RoseReaction[]>([]);
  const [chatMessages, setChatMessages] = useState<RoseChatMessage[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
      // Request active open rooms for the lobby
      ws.send(JSON.stringify({ type: 'rose:list_rooms' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'rose:rooms_list':
            setPublicRooms(data.rooms || []);
            break;

          case 'rose:created':
            // CRITICAL FIX: Only save the hosted code and waiting state.
            // DO NOT set match yet so the UI stays on the same window and shows the generated code!
            setHostedCode(data.code);
            setIsWaitingForPartner(true);
            if (data.yourColor) setMyColor(data.yourColor);
            if (data.yourRole) setMyRole(data.yourRole);
            setError(null);
            break;

          case 'rose:match_started':
            // The match ONLY starts when the second player joins!
            setMatch(data.match);
            if (data.yourColor) setMyColor(data.yourColor);
            if (data.yourRole) setMyRole(data.yourRole);
            setIsWaitingForPartner(false);
            setHostedCode(null);
            setPendingMove(false);
            setError(null);
            sounds.playChallenge();
            break;

          case 'rose:state':
            setMatch(data.match);
            setPendingMove(false);
            setError(null);
            break;

          case 'rose:moved':
            setMatch(data.match);
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
            setIsWaitingForPartner(false);
            setHostedCode(null);
            break;

          case 'rose:error':
            setError(data.message || 'Operation failed');
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
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
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
    send({
      type: 'rose:create',
      role,
      userId: user?.id,
      displayName: user?.displayName,
      avatarId: user?.avatarId,
      token,
    });
  }, [send, user, token]);

  const joinRoom = useCallback((code: string) => {
    setError(null);
    send({
      type: 'rose:join',
      code: code.trim().toUpperCase(),
      userId: user?.id,
      displayName: user?.displayName,
      avatarId: user?.avatarId,
      token,
    });
  }, [send, user, token]);

  const cancelRoom = useCallback(() => {
    send({ type: 'rose:cancel' });
    setIsWaitingForPartner(false);
    setHostedCode(null);
  }, [send]);

  const sendMove = useCallback((from: Position, to: Position) => {
    setError(null);
    setPendingMove(true);
    send({
      type: 'rose:move',
      roomId: match?.id,
      from,
      to,
      userId: user?.id,
    });
  }, [send, match?.id, user?.id]);

  const sendSummon = useCallback((pieceType: 'priest' | 'communist' | 'supremeRook', to: Position) => {
    setError(null);
    send({
      type: 'rose:summon',
      roomId: match?.id,
      pieceType,
      to,
      userId: user?.id,
    });
  }, [send, match?.id, user?.id]);

  const sendReaction = useCallback((text: string) => {
    send({
      type: 'rose:reaction',
      roomId: match?.id,
      text,
      userId: user?.id,
    });
  }, [send, match?.id, user?.id]);

  const sendChat = useCallback((text: string) => {
    if (!text.trim()) return;
    send({
      type: 'rose:chat',
      roomId: match?.id,
      text: text.trim(),
      userId: user?.id,
    });
  }, [send, match?.id, user?.id]);

  const resignMatch = useCallback(() => {
    send({
      type: 'rose:resign',
      roomId: match?.id,
      userId: user?.id,
    });
  }, [send, match?.id, user?.id]);

  const refreshRooms = useCallback(() => {
    send({ type: 'rose:list_rooms' });
  }, [send]);

  const clearMatch = useCallback(() => {
    setMatch(null);
    setHostedCode(null);
    setIsWaitingForPartner(false);
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
    error,
    pendingMove,
    reactions,
    chatMessages,
    setChatMessages,
    createRoom,
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
