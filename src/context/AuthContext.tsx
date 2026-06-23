import axios from 'axios';
import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import apiClient from '@/api/axios';
import { publicService } from '@/api/services/publicService';

type User = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: Record<string, unknown>) => Promise<User | null>;
  register: (payload: Record<string, unknown>) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  loginWithSupabaseToken: (supabaseAccessToken: string) => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeRole(role: unknown): string {
  if (Array.isArray(role)) {
    for (const item of role) {
      const normalized = normalizeRole(item);
      if (normalized && normalized !== 'learner') {
        return normalized;
      }
    }

    return 'learner';
  }

  if (role && typeof role === 'object') {
    const record = role as Record<string, unknown>;
    const nestedRole = typeof record.name === 'string' ? record.name : typeof record.value === 'string' ? record.value : null;
    if (nestedRole) {
      return nestedRole.toLowerCase();
    }
  }

  if (typeof role === 'string') {
    return role.toLowerCase();
  }

  return 'learner';
}

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as Record<string, unknown>;
  return (
    (typeof data.token === 'string' && data.token) ||
    (typeof data.access_token === 'string' && data.access_token) ||
    (typeof data.accessToken === 'string' && data.accessToken) ||
    (typeof data.jwt === 'string' && data.jwt) ||
    null
  );
}

function extractUser(payload: unknown): User | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const nested = data.data as Record<string, unknown> | undefined;
  const user = (data.user as User | undefined) || (nested?.user as User | undefined) || (data.profile as User | undefined) || (nested?.profile as User | undefined) || (data.me as User | undefined) || (nested?.me as User | undefined) || null;

  if (user) {
    return user as User;
  }

  return (data as User) || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('konekdin_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token && user);

  const fetchCurrentUser = useCallback(async (authToken?: string | null) => {
    const activeToken = authToken ?? token;

    if (!activeToken) {
      setUser(null);
      return null;
    }

    try {
      const response = await apiClient.get('/user');
      const payload = response.data?.data ?? response.data;
      const currentUser = extractUser(payload) ?? (payload as User);

      if (currentUser) {
        setUser(currentUser);
        return currentUser;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('konekdin_token');
        setToken(null);
      }
    }

    return null;
  }, [token]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      await fetchCurrentUser(token);
      setLoading(false);
    };

    bootstrap();
  }, []);

  const login = useCallback(async (payload: Record<string, unknown>): Promise<User | null> => {
    const response = await publicService.login(payload);
    const payloadData = response?.data ?? response;
    const authToken = extractToken(payloadData);
    const currentUser = extractUser(payloadData) ?? null;

    if (authToken) {
      localStorage.setItem('konekdin_token', authToken);
      setToken(authToken);
    }

    if (currentUser) {
      setUser(currentUser);
      return currentUser;
    }

    return await fetchCurrentUser(authToken);
  }, [fetchCurrentUser]);

  const loginWithSupabaseToken = useCallback(async (supabaseAccessToken: string): Promise<User | null> => {
    const response = await publicService.loginWithSupabase(supabaseAccessToken);
    const payloadData = response?.data ?? response;
    const authToken = extractToken(payloadData);
    const currentUser = extractUser(payloadData) ?? null;

    if (authToken) {
      localStorage.setItem('konekdin_token', authToken);
      setToken(authToken);
    }

    if (currentUser) {
      setUser(currentUser);
      return currentUser;
    }

    return await fetchCurrentUser(authToken);
  }, [fetchCurrentUser]);

  const register = useCallback(async (payload: Record<string, unknown>): Promise<User | null> => {
    const response = await publicService.register(payload);
    const payloadData = response?.data ?? response;
    const authToken = extractToken(payloadData);
    const currentUser = extractUser(payloadData) ?? null;

    if (authToken) {
      localStorage.setItem('konekdin_token', authToken);
      setToken(authToken);
    }

    if (currentUser) {
      setUser(currentUser);
      return currentUser;
    }

    return await fetchCurrentUser(authToken);
  }, [fetchCurrentUser]);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/logout');
    } catch {
      // ignore logout errors
    } finally {
      localStorage.removeItem('konekdin_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (token) {
      return await fetchCurrentUser(token);
    }
    return null;
  }, [token, fetchCurrentUser]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser,
      loginWithSupabaseToken,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export function getRoleLabel(user: User | null) {
  const rawRole = user?.role ?? user?.roles?.[0];
  return normalizeRole(rawRole);
}

export function hasRole(user: User | null, roleName: string): boolean {
  if (!user) return false;
  if (Array.isArray(user.roles)) {
    return user.roles.some((r) => normalizeRole(r) === roleName);
  }
  return normalizeRole(user.role) === roleName;
}
