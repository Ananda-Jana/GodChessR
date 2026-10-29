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
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
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
        } else {
          // Server returned non-401 error (500, 502, 503, gateway glitch): Keep cached user session!
          console.warn('Non-401 response from /api/auth/me during session check:', res.status);
        }
      } catch (err) {
        // Network error (device offline or weak mobile connectivity): Retain cached user session!
        console.warn('Network error checking session status, maintaining local cached session:', err);
      } finally {
        setIsLoading(false);
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
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        return false;
      }
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('dice_chess_token', data.token);
        }
      } catch {}
      setTokenState(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError('Network error. Unable to reach server.');
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
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        return false;
      }
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('dice_chess_token', data.token);
        }
      } catch {}
      setTokenState(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError('Network error. Unable to reach server.');
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
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Guest login failed.');
        return false;
      }
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('dice_chess_token', data.token);
        }
      } catch {}
      setTokenState(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError('Network error. Unable to reach server.');
      return false;
    }
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
