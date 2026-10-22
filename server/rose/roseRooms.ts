import { WebSocket } from 'ws';
import type { RoseMatchState, RoseSeat, RoseRole } from '../../src/rose/types.ts';
import { createInitialRoseMatch } from '../../src/rose/roseRules.ts';

export interface RoseRoom {
  match: RoseMatchState;
  sockets: Set<WebSocket>;
  hostWs?: WebSocket;
  guestWs?: WebSocket;
  readySockets: Set<string>; // userId set for handshake ready
}

const rooms = new Map<string, RoseRoom>();
const userActiveRoom = new Map<string, string>(); // userId -> roomId

export function generateRoseCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Crockford without ambiguous chars
  for (let attempts = 0; attempts < 100; attempts++) {
    let code = 'ROSE-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    let exists = false;
    for (const r of rooms.values()) {
      if (r.match.code === code) {
        exists = true;
        break;
      }
    }
    if (!exists) return code;
  }
  return `ROSE-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

export function createRoseRoom(
  hostUserId: string,
  hostUsername: string,
  hostDisplayName: string,
  hostAvatarId: string,
  hostRole: RoseRole,
  timeControl: 60 | 120,
  moveSuggestions: boolean
): RoseRoom {
  const code = generateRoseCode();
  const roomId = `room_${Math.random().toString(36).slice(2, 10)}`;
  const resumeToken = Math.random().toString(36).slice(2);
  const color = Math.random() < 0.5 ? 'white' : 'black';

  const hostSeat: RoseSeat = {
    userId: hostUserId,
    username: hostUsername,
    displayName: hostDisplayName,
    avatarId: hostAvatarId,
    role: hostRole,
    color,
    petals: 0,
    summonsUsed: 0,
    lastLoveLinkTurn: 0,
    resumeToken,
    isConnected: true,
    lastSeen: Date.now(),
  };

  const match = createInitialRoseMatch(roomId, code, hostSeat, timeControl, moveSuggestions);
  match.status = 'waiting_guest';

  const room: RoseRoom = {
    match,
    sockets: new Set(),
    readySockets: new Set(),
  };

  rooms.set(roomId, room);
  userActiveRoom.set(hostUserId, roomId);
  return room;
}

export function getRoomById(roomId: string): RoseRoom | undefined {
  return rooms.get(roomId);
}

export function getRoomByCode(code: string): RoseRoom | undefined {
  const upper = code.toUpperCase();
  for (const r of rooms.values()) {
    if (r.match.code.toUpperCase() === upper) return r;
  }
  return undefined;
}

export function getUserActiveRoomId(userId: string): string | undefined {
  return userActiveRoom.get(userId);
}

export function destroyRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (room) {
    if (room.match.whiteSeat) userActiveRoom.delete(room.match.whiteSeat.userId);
    if (room.match.blackSeat) userActiveRoom.delete(room.match.blackSeat.userId);
    rooms.delete(roomId);
  }
}

// Sweeper: expire waiting rooms after 10 minutes or inactive finished matches after 5 minutes
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    if (room.match.status === 'waiting_guest' && now - room.match.createdAt > 10 * 60 * 1000) {
      destroyRoom(roomId);
    } else if (room.match.status === 'completed' && now - room.match.updatedAt > 5 * 60 * 1000) {
      destroyRoom(roomId);
    }
  }
}, 30000);
sweeper.unref();
