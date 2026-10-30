import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/game';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, displayName: string, password: string, avatarId: string) => Promise<boolean>;
  loginGuest: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (displayName: string, avatarId: string, bio?: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory fallback dictionary matching mugenStore.ts pattern
const userMemoryFallback: Record<string, UserProfile | null> = {};

function getCachedUser(): UserProfile | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem('dice_chess_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed as UserProfile;
        }
      }
    }
  } catch {
    // Fail silently to memory fallback
  }
  return userMemoryFallback['user'] || null;
}

function setCachedUser(user: UserProfile | null): void {
  userMemoryFallback['user'] = user;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        window.localStorage.setItem('dice_chess_user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('dice_chess_user');
      }
    }
  } catch {
    // Fail silently to memory fallback
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(() => getCachedUser());
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('dice_chess_token');
      }
    } catch {}
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const setUser = (userProfile: UserProfile | null) => {
    setUserState(userProfile);
    setCachedUser(userProfile);
  };

  // Request persistent storage on PWA / mobile Chrome
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            return;
          }
        } else if (res.status === 401) {
          // Token is genuinely invalid or expired on server (unrecoverable 401)
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.removeItem('dice_chess_token');
              window.localStorage.removeItem('dice_chess_user');
            }
          } catch {}
          setTokenState(null);
          setUser(null);
          return;
        }
      } catch (err) {
        // Network error (device offline or static host without backend): Retain cached session!
        console.warn('Network error checking session status, maintaining local cached session:', err);
      } finally {
        setIsLoading(false);
      }

      // If token exists (e.g. guest token or cached session on static host) but server is unreachable:
      const cached = getCachedUser();
      if (cached) {
        setUser(cached);
      } else if (token.startsWith('token_guest_') || token === 'guest_token') {
        const guestId = `usr_guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const guestUser: UserProfile = {
          id: guestId,
          username: `guest_${guestId.slice(-4)}`,
          displayName: 'Guest Player',
          avatarId: 'avatar_knight',
          stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 },
          createdAt: Date.now(),
        };
        setUser(guestUser);
      }
    }
    loadMe();
  }, [token]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        let errMessage = 'Accounts are unavailable offline. Continue as Guest to play.';
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => null);
          if (data?.error) errMessage = data.error;
        }
        setError(errMessage);
        return false;
      }
      const data = await res.json();
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('dice_chess_token', data.token);
        }
      } catch {}
      setTokenState(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError('Accounts are unavailable offline. Continue as Guest to play.');
      return false;
    }
  };

  const register = async (
    username: string,
    displayName: string,
    password: string,
    avatarId: string
  ): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName, password, avatarId }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        let errMessage = 'Accounts are unavailable offline. Continue as Guest to play.';
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => null);
          if (data?.error) errMessage = data.error;
        }
        setError(errMessage);
        return false;
      }
      const data = await res.json();
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('dice_chess_token', data.token);
        }
      } catch {}
      setTokenState(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError('Accounts are unavailable offline. Continue as Guest to play.');
      return false;
    }
  };

  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    try {
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('dice_chess_token');
        window.localStorage.removeItem('dice_chess_user');
      }
    } catch {}
    setTokenState(null);
    setUser(null);
  };

  const updateProfile = async (displayName: string, avatarId: string, bio?: string): Promise<boolean> => {
    if (!user) return false;
    if (user.id?.startsWith('usr_guest') || user.username?.toLowerCase().includes('mecharuri')) {
      const updated = {
        ...user,
        displayName: displayName.trim() || user.displayName,
        avatarId: avatarId || user.avatarId,
        bio: bio !== undefined ? bio.trim() : user.bio,
      };
      setUser(updated);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`dice_guest_profile_${user.id}`, JSON.stringify(updated));
        }
      } catch {}
      return true;
    }
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName, avatarId, bio }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const loginGuest = async (): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.token && data.user) {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem('dice_chess_token', data.token);
            }
          } catch {}
          setTokenState(data.token);
          setUser(data.user);
          return true;
        }
      }
    } catch (_) {
      // Offline / Static host fallback
    }

    // Fallback for static host / offline: create or reuse local guest profile
    const cached = getCachedUser();
    const guestId = (cached && cached.id?.startsWith('usr_guest'))
      ? cached.id
      : `usr_guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const guestToken = `token_guest_${guestId}`;

    const guestUser: UserProfile = {
      id: guestId,
      username: cached?.username || `guest_${guestId.slice(-4)}`,
      displayName: cached?.displayName || 'Guest Player',
      avatarId: cached?.avatarId || 'avatar_knight',
      stats: cached?.stats || { wins: 0, losses: 0, draws: 0, totalGames: 0 },
      createdAt: cached?.createdAt || Date.now(),
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('dice_chess_token', guestToken);
      }
    } catch {}
    setTokenState(guestToken);
    setUser(guestUser);
    return true;
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        loginGuest,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
