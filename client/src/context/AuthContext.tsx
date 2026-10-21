import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../services/api';

export interface AuthUser { id: string; name: string; email: string }
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function authUrl(): string {
  return new URL('/api/auth', getApiBaseUrl()).toString();
}
function messageFrom(error: unknown): string {
  if (axios.isAxiosError(error)) return error.response?.data?.message ?? 'Could not reach the authentication service.';
  return 'Something went wrong. Please try again.';
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await axios.get<{ user: AuthUser }>(`${authUrl()}/me`, { withCredentials: true, timeout: 10000 });
      setUser(response.data.user);
    } catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axios.post<{ user: AuthUser }>(`${authUrl()}/login`, { email, password }, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) { throw new Error(messageFrom(error)); }
  }, []);
  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post<{ user: AuthUser }>(`${authUrl()}/signup`, { name, email, password }, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) { throw new Error(messageFrom(error)); }
  }, []);
  const logout = useCallback(async () => {
    try { await axios.post(`${authUrl()}/logout`, {}, { withCredentials: true }); }
    catch (error) { throw new Error(messageFrom(error)); }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
