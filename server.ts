import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import type { UserRecord } from './server/db.ts';
import {
  hashPassword,
  verifyPassword,
  createSession,
  sanitizeUser,
  authMiddleware,
} from './server/auth.ts';
import type { AuthenticatedRequest } from './server/auth.ts';
import { initWebSocketServer } from './server/socket.ts';
import { processMatchEndLeagueTrophies } from './server/league.ts';
import {
  getRankFromTrophies,
  getNextRank,
  getRankProgress,
} from './src/league/rankConfig.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

// Parse --port / -p CLI args or default to PORT env var or 3000
const portArgIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : null;
const PORT = cliPort || (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  // Attach WebSocket Server
  initWebSocketServer(server);

  // Health check routes for Cloud Run / deployment health monitoring
  app.get(['/health', '/api/health'], (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { username, displayName, password, avatarId } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanUsername = username.trim();
    if (db.findUserByUsername(cleanUsername)) {
      return res.status(409).json({ error: 'Username is already taken. Please pick another.' });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { hash, salt } = hashPassword(password);

    const newUser: UserRecord = {
      id: userId,
      username: cleanUsername,
      displayName: (displayName && displayName.trim()) || cleanUsername,
      avatarId: avatarId || 'avatar_knight',
      passwordHash: hash,
      salt,
      stats: {
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
      },
      createdAt: Date.now(),
    };

    db.saveUser(newUser);
    const token = createSession(newUser.id);

    return res.status(201).json({
      token,
      user: sanitizeUser(newUser),
    });
  });

  // Auth: Guest Login
  app.post('/api/auth/guest', (_req, res) => {
    const baseUsername = 'MechaRuri';
    let username = baseUsername;
    let counter = 1;
    while (db.findUserByUsername(username)) {
      username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      counter++;
      if (counter > 100) break;
    }

    const userId = `usr_guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { hash, salt } = hashPassword('guest_pass_default');

    const guestUser: UserRecord = {
      id: userId,
      username,
      displayName: 'MechaRuri',
      avatarId: '/assets/aistudio/image_97317ea2.png',
      passwordHash: hash,
      salt,
      stats: {
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
      },
      createdAt: Date.now(),
    };

    db.saveUser(guestUser);
    const token = createSession(guestUser.id);

    return res.status(201).json({
      token,
      user: sanitizeUser(guestUser),
    });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = db.findUserByUsername(username.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = createSession(user.id);
    return res.json({
      token,
      user: sanitizeUser(user),
    });
  });

  // Auth: Current User
  app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
    return res.json({ user: req.user });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (token) {
      db.removeSession(token);
    }
    return res.json({ success: true });
  });

  // Auth: Update Profile
  app.put('/api/auth/profile', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { displayName, avatarId, bio } = req.body;
    const user = db.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (displayName && typeof displayName === 'string') {
      user.displayName = displayName.trim();
    }
    if (avatarId && typeof avatarId === 'string') {
      user.avatarId = avatarId;
    }
    if (typeof bio === 'string') {
      user.bio = bio.trim();
    }

    db.saveUser(user);
    return res.json({ user: sanitizeUser(user) });
  });

  // Players: Search / Discovery
  app.get('/api/players', authMiddleware, (req: AuthenticatedRequest, res) => {
    const query = ((req.query.q as string) || '').toLowerCase().trim();
    const currentUserId = req.user!.id;

    const results = Array.from(db.users.values())
      .filter((u) => u.id !== currentUserId)
      .filter((u) => !query || u.username.toLowerCase().includes(query) || u.displayName.toLowerCase().includes(query))
      .map(sanitizeUser)
      .slice(0, 20);

    return res.json({ players: results });
  });

  // Challenges: List active
  app.get('/api/challenges', authMiddleware, (req: AuthenticatedRequest, res) => {
    const currentUserId = req.user!.id;
    const now = Date.now();

    const incoming = Array.from(db.challenges.values()).filter(
      (c) => c.challenged.userId === currentUserId && c.status === 'pending' && c.expiresAt > now
    );

    const outgoing = Array.from(db.challenges.values()).filter(
      (c) => c.challenger.userId === currentUserId && c.status === 'pending' && c.expiresAt > now
    );

    return res.json({ incoming, outgoing });
  });

  // Matches: List active or recent
  app.get('/api/matches', authMiddleware, (req: AuthenticatedRequest, res) => {
    const currentUserId = req.user!.id;
    const userMatches = Array.from(db.matches.values())
      .filter((m) => m.whitePlayer.userId === currentUserId || m.blackPlayer.userId === currentUserId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 20);

    return res.json({ matches: userMatches });
  });

  // Matches: Get by ID
  app.get('/api/matches/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
    const match = db.matches.get(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    const currentUserId = req.user!.id;
    if (match.whitePlayer.userId !== currentUserId && match.blackPlayer.userId !== currentUserId) {
      return res.status(403).json({ error: 'You are not a participant in this match.' });
    }

    return res.json({ match });
  });

  // League: Get user rank
  app.get('/api/league/rank', authMiddleware, (req: AuthenticatedRequest, res) => {
    const user = db.findUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const trophies = user.trophies || 0;
    const rank = getRankFromTrophies(trophies);
    const nextRank = getNextRank(rank.id);
    const progress = getRankProgress(trophies);
    return res.json({
      trophies,
      leagueRank: user.leagueRank || rank.id,
      rank,
      nextRank,
      progress,
      shieldMatches: user.shieldMatches || 0,
      leagueStats: user.leagueStats || { wins: 0, losses: 0, draws: 0, peakTrophies: trophies },
    });
  });

  // League: Leaderboard
  app.get('/api/league/leaderboard', (_req, res) => {
    const topUsers = Array.from(db.users.values())
      .sort((a, b) => (b.trophies || 0) - (a.trophies || 0))
      .slice(0, 50)
      .map((u) => {
        const tr = u.trophies || 0;
        const rank = getRankFromTrophies(tr);
        return {
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarId: u.avatarId,
          trophies: tr,
          leagueRank: rank.id,
          rankName: rank.name,
          animationId: rank.animationId,
          primaryColor: rank.primaryColor,
          glowColor: rank.glowColor,
          tierNumber: rank.tierNumber,
        };
      });
    return res.json({ leaderboard: topUsers });
  });

  // League: Process Match (Client reporting for bot matches or offline matches)
  app.post('/api/league/process-match', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { matchId, mode, winner, isBotMatch, resignedUserId } = req.body;
    if (!matchId) {
      return res.status(400).json({ error: 'matchId is required' });
    }
    const result = processMatchEndLeagueTrophies({
      matchId,
      mode: mode || 'pvp',
      whiteUserId: req.user!.id,
      winnerColor: winner,
      isBotMatch: isBotMatch !== false,
      resignedUserId,
    });
    return res.json({ result: result.whiteResult });
  });

  // --- VITE DEV OR PRODUCTION STATIC SERVING ---
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[HTTP SERVER ERROR] Port ${PORT} already in use.`);
    } else {
      console.error('[HTTP SERVER ERROR]', err);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`> Custom Multiplayer Dice Chess server listening on http://0.0.0.0:${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
