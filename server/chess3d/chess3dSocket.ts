import { WebSocket, WebSocketServer } from 'ws';
import type { Chess3dMatchState, TimeControl3D, Team, Position3D, PieceType } from '../../src/chess3d/types';
import { createInitialMatchState, execute3dMove } from '../../src/chess3d/chess3dEngine';
import { getUserIdFromSession } from '../auth';
import { db } from '../db';

interface ExtendedSocket extends WebSocket {
  userId?: string;
  username?: string;
  displayName?: string;
  avatarId?: string;
  chess3dRoomCode?: string;
  isAlive?: boolean;
}

export interface Chess3dRoom {
  code: string;
  timeControl: TimeControl3D;
  host: {
    userId: string;
    displayName: string;
    avatarId: string;
    ws: ExtendedSocket;
    team: Team;
  };
  guest?: {
    userId: string;
    displayName: string;
    avatarId: string;
    ws: ExtendedSocket;
    team: Team;
  };
  state: Chess3dMatchState;
  createdAt: number;
}

const activeRooms = new Map<string, Chess3dRoom>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function broadcastToRoom(room: Chess3dRoom, message: any) {
  const payload = JSON.stringify(message);
  if (room.host.ws.readyState === WebSocket.OPEN) {
    try {
      room.host.ws.send(payload);
    } catch {}
  }
  if (room.guest?.ws.readyState === WebSocket.OPEN) {
    try {
      room.guest.ws.send(payload);
    } catch {}
  }
}

export function registerChess3dSocket(wss: WebSocketServer) {
  function broadcastOpenRooms() {
    const openRooms = Array.from(activeRooms.values())
      .filter((r) => !r.guest && r.state.status === 'active')
      .map((r) => ({
        code: r.code,
        hostName: r.host.displayName,
        hostAvatar: r.host.avatarId,
        timeControl: r.timeControl,
        createdAt: r.createdAt,
      }));

    const payload = JSON.stringify({
      type: '3d:open_rooms',
      rooms: openRooms,
    });

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch {}
      }
    }
  }

  wss.on('connection', (ws: ExtendedSocket) => {
    ws.on('message', async (raw) => {
      let data: any;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (data.type === '3d:get_rooms') {
        broadcastOpenRooms();
        return;
      }

      // Session auth handshake
      if (data.type === 'auth') {
        const userId = getUserIdFromSession(data.token);
        if (userId) {
          const user = db.findUserById(userId);
          if (user) {
            ws.userId = user.id;
            ws.username = user.username;
            ws.displayName = user.displayName;
            ws.avatarId = user.avatarId;
          }
        }
        return;
      }

      // Create 3D Multiplayer Room
      if (data.type === '3d:create_room') {
        const timeControl: TimeControl3D = data.timeControl || '5m';
        const hostTeam: Team = data.preferredTeam || 'orange';
        const code = generateRoomCode();

        const hostInfo = {
          userId: ws.userId || 'guest_host',
          displayName: ws.displayName || 'Player 1',
          avatarId: ws.avatarId || 'avatar_prince',
          ws,
          team: hostTeam,
        };

        const guestTeam: Team = hostTeam === 'orange' ? 'red' : 'orange';
        const guestPlaceholder = {
          userId: 'waiting',
          displayName: 'Waiting for opponent...',
          avatarId: 'avatar_prince',
          team: guestTeam,
        };

        const whitePlayer = hostTeam === 'orange' ? hostInfo : guestPlaceholder;
        const blackPlayer = hostTeam === 'red' ? hostInfo : guestPlaceholder;

        const matchState = createInitialMatchState(
          `3d_${code}`,
          whitePlayer,
          blackPlayer,
          timeControl,
          'multiplayer'
        );
        matchState.roomCode = code;

        const room: Chess3dRoom = {
          code,
          timeControl,
          host: hostInfo,
          state: matchState,
          createdAt: Date.now(),
        };

        activeRooms.set(code, room);
        ws.chess3dRoomCode = code;

        ws.send(
          JSON.stringify({
            type: '3d:room_created',
            code,
            match: matchState,
            yourTeam: hostTeam,
          })
        );
        broadcastOpenRooms();
        return;
      }

      // Join 3D Multiplayer Room
      if (data.type === '3d:join_room') {
        const code = (data.code || '').trim().toUpperCase();
        const room = activeRooms.get(code);

        if (!room) {
          ws.send(JSON.stringify({ type: '3d:error', message: 'Room code not found.' }));
          return;
        }

        if (room.guest) {
          ws.send(JSON.stringify({ type: '3d:error', message: 'Room is already full.' }));
          return;
        }

        const guestTeam: Team = room.host.team === 'orange' ? 'red' : 'orange';
        const guestInfo = {
          userId: ws.userId || 'guest_player',
          displayName: ws.displayName || 'Player 2',
          avatarId: ws.avatarId || 'avatar_prince',
          ws,
          team: guestTeam,
        };

        room.guest = guestInfo;
        ws.chess3dRoomCode = code;

        if (guestTeam === 'orange') {
          room.state.whitePlayer = guestInfo;
        } else {
          room.state.blackPlayer = guestInfo;
        }

        // Notify both players
        room.host.ws.send(
          JSON.stringify({
            type: '3d:match_start',
            code,
            match: room.state,
            yourTeam: room.host.team,
          })
        );
        guestInfo.ws.send(
          JSON.stringify({
            type: '3d:match_start',
            code,
            match: room.state,
            yourTeam: guestTeam,
          })
        );

        broadcastOpenRooms();
        return;
      }

      // Execute Move in Room
      if (data.type === '3d:make_move') {
        const code = ws.chess3dRoomCode || data.code;
        const room = activeRooms.get(code);
        if (!room || !room.guest) return;

        const from: Position3D = data.from;
        const to: Position3D = data.to;
        const promo: PieceType = data.promotion || 'queen';

        // Check player color authorization
        const isHost = ws === room.host.ws;
        const playerTeam = isHost ? room.host.team : room.guest.team;
        if (playerTeam !== room.state.turn) {
          ws.send(JSON.stringify({ type: '3d:error', message: 'Not your turn.' }));
          return;
        }

        const result = execute3dMove(room.state, from, to, promo);
        if (result.success) {
          room.state = result.state;
          broadcastToRoom(room, {
            type: '3d:move_executed',
            match: room.state,
          });
        } else {
          ws.send(JSON.stringify({ type: '3d:error', message: result.error || 'Illegal move.' }));
        }
        return;
      }

      // Resign
      if (data.type === '3d:resign') {
        const code = ws.chess3dRoomCode || data.code;
        const room = activeRooms.get(code);
        if (!room) return;

        const isHost = ws === room.host.ws;
        const resigningTeam = isHost ? room.host.team : room.guest?.team;
        const winningTeam: Team = resigningTeam === 'orange' ? 'red' : 'orange';

        room.state.status = 'resigned';
        room.state.winner = winningTeam;
        room.state.winReason = `${resigningTeam === 'orange' ? 'White' : 'Black'} resigned.`;

        broadcastToRoom(room, {
          type: '3d:game_over',
          match: room.state,
        });
        return;
      }
    });

    ws.on('close', () => {
      const code = ws.chess3dRoomCode;
      if (code && activeRooms.has(code)) {
        const room = activeRooms.get(code)!;
        if (ws === room.host.ws) {
          activeRooms.delete(code);
          broadcastOpenRooms();
        }
      }
    });
  });
}
