import { useState, useEffect, useRef, useCallback } from 'react';
import type { RoseMatchState, RoseRole, RoseReaction } from './types.ts';
import { useAuth } from '../context/AuthContext';

export function useRoseRoom() {
  const { user, token } = useAuth();
  const [match, setMatch] = useState<RoseMatchState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState(false);
  const [reactions, setReactions] = useState<RoseReaction[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingMoveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Send auth
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'rose:roomState':
          case 'rose:state':
          case 'rose:resuming':
            setMatch(data.match);
            setPendingMove(false);
            if (pendingMoveTimeoutRef.current) clearTimeout(pendingMoveTimeoutRef.current);
            setError(null);
            break;

          case 'rose:start':
            setMatch(data.match);
            // Send synced / ready ack
            ws.send(JSON.stringify({ type: 'rose:ready', roomId: data.match.id }));
            break;

          case 'rose:reject':
            setError(data.reason || 'Move rejected.');
            setPendingMove(false);
            if (pendingMoveTimeoutRef.current) clearTimeout(pendingMoveTimeoutRef.current);
            break;

          case 'rose:error':
            setError(data.message || 'Error in Rose room.');
            break;

          case 'rose:reaction':
            setReactions((prev) => [...prev.slice(-10), data.reaction]);
            setTimeout(() => {
              setReactions((prev) => prev.filter((r) => r.id !== data.reaction.id));
            }, 3500);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Rose client message parse error:', err);
      }
    };

    ws.onclose = () => {
      setError('WebSocket connection closed.');
    };

    return () => {
      ws.close();
      if (pendingMoveTimeoutRef.current) clearTimeout(pendingMoveTimeoutRef.current);
    };
  }, [user, token]);

  const createRoom = useCallback((role: RoseRole, timeControl: 60 | 120, moveSuggestions: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'rose:create', role, timeControl, moveSuggestions }));
    }
  }, []);

  const joinRoom = useCallback((code: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'rose:join', code }));
    }
  }, []);

  const sendMove = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setPendingMove(true);
      wsRef.current.send(JSON.stringify({ type: 'rose:move', from, to }));

      // Watchdog timeout for pending move
      pendingMoveTimeoutRef.current = setTimeout(() => {
        setPendingMove(false);
        wsRef.current?.send(JSON.stringify({ type: 'rose:resyncRequest' }));
      }, 1500);
    }
  }, []);

  const sendSummon = useCallback((pieceType: 'priest' | 'communist' | 'supremeRook', to: { x: number; y: number }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'rose:summon', pieceType, to }));
    }
  }, []);

  const sendReaction = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'rose:reaction', text }));
    }
  }, []);

  return {
    match,
    error,
    pendingMove,
    reactions,
    createRoom,
    joinRoom,
    sendMove,
    sendSummon,
    sendReaction,
  };
}
