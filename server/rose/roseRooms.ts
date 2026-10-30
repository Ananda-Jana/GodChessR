import { WebSocket } from 'ws';
import type { RoseMatchState, RoseSeat, RoseRole, PublicRoseRoom } from '../../src/rose/types.ts';
import { createInitialRoseMatch } from '../../src/rose/roseRules.ts';

export interface RoseRoom {
  match: RoseMatchState;
  sockets: Set<WebSocket>;
  hostWs?: WebSocket;
  guestWs?: WebSocket;
  hostUserId: string;
  hostDisplayName: string;
  hostRole: RoseRole;
  hostAvatarId?: string;
  createdAt: number;
}

const rooms = new Map<string, RoseRoom>(); // roomId -> RoseRoom
const roomsByCode = new Map<string, string>(); // code (uppercase) -> roomId
const userActiveRoom = new Map<string, string>(); // userId -> roomId

export function generateRoseCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Unambiguous characters matching Culling Game
  for (let attempts = 0; attempts < 100; attempts++) {
    let code = 'ROSE';
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!roomsByCode.has(code)) return code;
  }
  return `ROSE${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

export function normalizeRoseCode(rawCode: string): string {
  const cleaned = rawCode.trim().toUpperCase().replace(/[\s-]/g, '');
  return cleaned;
}

export function getPublicRoseRooms(): PublicRoseRoom[] {
  const list: PublicRoseRoom[] = [];
  const now = Date.now();
  for (const room of rooms.values()) {
    // Only waiting rooms within 15 minutes where host socket is still alive (if available)
    if (room.match.status === 'waiting_guest') {
      if (now - room.createdAt > 15 * 60 * 1000) {
        destroyRoom(room.match.id);
        continue;
      }
      if (room.hostWs && room.hostWs.readyState !== WebSocket.OPEN) {
        destroyRoom(room.match.id);
        continue;
      }
      list.push({
        code: room.match.code,
        hostDisplayName: room.hostDisplayName,
        hostUserId: room.hostUserId,
        hostRole: room.hostRole,
        hostAvatarId: room.hostAvatarId,
        createdAt: room.createdAt,
      });
    }
  }
  return list;
}

export function createRoseRoom(
  hostUserId: string,
  hostUsername: string,
  hostDisplayName: string,
  hostAvatarId: string,
  hostRole: RoseRole,
  timeControl: number = 0,
  moveSuggestions: boolean = true,
  hostWs?: WebSocket
): RoseRoom {
  // Clean up any existing room hosted by this user
  const existingRoomId = userActiveRoom.get(hostUserId);
  if (existingRoomId) {
    destroyRoom(existingRoomId);
  }

  const code = generateRoseCode();
  const roomId = `rose_room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const resumeToken = Math.random().toString(36).slice(2);
  
  // Boyfriend defaults to white (Prince), Girlfriend defaults to black (Queen), or vice-versa
  const color = hostRole === 'boyfriend' ? 'white' : 'black';

  const hostSeat: RoseSeat = {
    userId: hostUserId,
    username: hostUsername,
    displayName: hostDisplayName,
    avatarId: hostAvatarId || 'avatar_prince',
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

  const sockets = new Set<WebSocket>();
  if (hostWs) sockets.add(hostWs);

  const room: RoseRoom = {
    match,
    sockets,
    hostWs,
    hostUserId,
    hostDisplayName,
    hostRole,
    hostAvatarId,
    createdAt: Date.now(),
  };

  rooms.set(roomId, room);
  const norm = normalizeRoseCode(code);
  roomsByCode.set(norm, roomId);
  if (norm.startsWith('ROSE')) {
    roomsByCode.set(norm.slice(4), roomId);
  }
  userActiveRoom.set(hostUserId, roomId);
  return room;
}

export function joinRoseRoom(
  code: string,
  guestUserId: string,
  guestUsername: string,
  guestDisplayName: string,
  guestAvatarId: string,
  guestWs?: WebSocket
): { success: boolean; room?: RoseRoom; hostSeat?: RoseSeat; guestSeat?: RoseSeat; error?: string } {
  const norm = normalizeRoseCode(code);
  let roomId = roomsByCode.get(norm);
  if (!roomId && !norm.startsWith('ROSE')) {
    roomId = roomsByCode.get(`ROSE${norm}`);
  }
  if (!roomId) {
    return { success: false, error: 'Rose room code not found or expired.' };
  }

  const room = rooms.get(roomId);
  if (!room) {
    roomsByCode.delete(norm);
    return { success: false, error: 'Room does not exist.' };
  }

  if (room.match.status !== 'waiting_guest') {
    return { success: false, error: 'This Rose room is no longer open for guests.' };
  }

  const hostSeat = room.match.whiteSeat || room.match.blackSeat;
  if (!hostSeat) {
    return { success: false, error: 'Invalid room configuration.' };
  }

  if (hostSeat.userId === guestUserId) {
    return { success: false, error: 'You cannot join your own room code.' };
  }

  // Expiration check (15 minutes)
  if (Date.now() - room.createdAt > 15 * 60 * 1000) {
    destroyRoom(room.match.id);
    return { success: false, error: 'This room code has expired.' };
  }

  // Live host connection check (matching Culling Game socket logic)
  if (room.hostWs && room.hostWs.readyState !== WebSocket.OPEN) {
    destroyRoom(room.match.id);
    return { success: false, error: 'Room host has disconnected.' };
  }

  // Remove code from pending lookups so no 3rd player can join
  roomsByCode.delete(norm);
  if (norm.startsWith('ROSE')) {
    roomsByCode.delete(norm.slice(4));
  } else {
    roomsByCode.delete(`ROSE${norm}`);
  }

  // Complementary role & opposite color for boyfriend vs girlfriend
  const guestRole: RoseRole = hostSeat.role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  const guestColor = hostSeat.color === 'white' ? 'black' : 'white';
  const resumeToken = Math.random().toString(36).slice(2);

  const guestSeat: RoseSeat = {
    userId: guestUserId,
    username: guestUsername,
    displayName: guestDisplayName,
    avatarId: guestAvatarId || (guestRole === 'boyfriend' ? 'avatar_prince' : 'avatar_queen'),
    role: guestRole,
    color: guestColor,
    petals: 0,
    summonsUsed: 0,
    lastLoveLinkTurn: 0,
    resumeToken,
    isConnected: true,
    lastSeen: Date.now(),
  };

  if (guestColor === 'white') {
    room.match.whiteSeat = guestSeat;
  } else {
    room.match.blackSeat = guestSeat;
  }

  // IMMEDIATELY ACTIVATE GAME: Zero handshake lag, zero stall!
  room.match.status = 'active';
  room.match.lastTurnStartTime = Date.now();
  room.match.updatedAt = Date.now();

  if (guestWs) {
    room.sockets.add(guestWs);
    room.guestWs = guestWs;
  }

  userActiveRoom.set(guestUserId, roomId);

  return {
    success: true,
    room,
    hostSeat,
    guestSeat,
  };
}

export function getRoomById(roomId: string): RoseRoom | undefined {
  return rooms.get(roomId);
}

export function getRoomByCode(code: string): RoseRoom | undefined {
  const norm = normalizeRoseCode(code);
  let roomId = roomsByCode.get(norm);
  if (!roomId && !norm.startsWith('ROSE')) {
    roomId = roomsByCode.get(`ROSE${norm}`);
  }
  return roomId ? rooms.get(roomId) : undefined;
}

export function getUserActiveRoomId(userId: string): string | undefined {
  return userActiveRoom.get(userId);
}

export function destroyRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (room) {
    const norm = normalizeRoseCode(room.match.code);
    roomsByCode.delete(norm);
    if (norm.startsWith('ROSE')) {
      roomsByCode.delete(norm.slice(4));
    } else {
      roomsByCode.delete(`ROSE${norm}`);
    }
    if (room.match.whiteSeat) userActiveRoom.delete(room.match.whiteSeat.userId);
    if (room.match.blackSeat) userActiveRoom.delete(room.match.blackSeat.userId);
    userActiveRoom.delete(room.hostUserId);
    rooms.delete(roomId);
  }
}

export function destroyRoomByHostWs(ws: WebSocket): boolean {
  for (const [roomId, room] of rooms.entries()) {
    if (room.hostWs === ws && room.match.status === 'waiting_guest') {
      destroyRoom(roomId);
      return true;
    }
  }
  return false;
}

export function destroyRoomByHostUserId(userId: string): boolean {
  const activeRoomId = userActiveRoom.get(userId);
  if (activeRoomId) {
    const room = rooms.get(activeRoomId);
    if (room && room.match.status === 'waiting_guest') {
      destroyRoom(activeRoomId);
      return true;
    }
  }
  return false;
}

// Sweeper: expire waiting rooms older than 15 minutes or completed rooms older than 5 minutes
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    if (room.match.status === 'waiting_guest' && now - room.createdAt > 15 * 60 * 1000) {
      destroyRoom(roomId);
    } else if (room.match.status === 'completed' && now - room.match.updatedAt > 5 * 60 * 1000) {
      destroyRoom(roomId);
    }
  }
}, 30000);
sweeper.unref();
