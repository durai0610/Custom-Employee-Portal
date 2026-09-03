import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/endpoints';
import { setAccessToken, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  // On first load, try to silently resume a session via the httpOnly
  // refresh cookie (if the user still has one from a previous visit).
  useEffect(() => {
    (async () => {
      try {
        const { data } = await authApi.me().catch(async () => {
          // /auth/me needs an access token; if we don't have one yet the
          // request interceptor's 401 handler will attempt a refresh.
          throw new Error('no-session');
        });
        setUser(data.user);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login(email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const hasRole = useCallback((...roles) => Boolean(user) && (user.roles.includes('Admin') || roles.some((r) => user.roles.includes(r))), [user]);

  const value = { user, isLoading, isAuthenticated: Boolean(user), login, logout, hasRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
