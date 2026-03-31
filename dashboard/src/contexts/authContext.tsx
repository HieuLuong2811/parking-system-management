import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCurrentUser } from '../api/auth';
import type { CurrentUser } from '../api/auth';
import { clearSessionToken, getSessionToken } from '../ultis/tokenStorage';
import { VITE_LOGIN_URL } from '../constant/config';

const bypassAuth = import.meta.env.VITE_BYPASS_AUTH !== 'false';

export type AuthStatus = 'loading' | 'unauthorized' | 'authenticated' | 'forbidden';

interface AuthContextValue {
  user: CurrentUser | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(bypassAuth ? 'authenticated' : 'loading');

  const refresh = useCallback(async () => {
    if (bypassAuth) {
      setStatus('authenticated');
      return;
    }

    const token = getSessionToken();
    if (!token) {
      setStatus('unauthorized');
      setUser(null);
      return;
    }

    setStatus('loading');
    try {
      const me = await fetchCurrentUser(token);
      setUser(me);
      if (!me.roles.includes('ADMIN')) {
        setStatus('forbidden');
      } else {
        setStatus('authenticated');
      }
    } catch (error) {
      clearSessionToken();
      setUser(null);
      setStatus('unauthorized');
      console.error('Failed to fetch current user:', error);
    }
  }, []);

  const logout = useCallback(() => {
    clearSessionToken();
    window.location.href = VITE_LOGIN_URL;
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      status,
      refresh,
      logout,
    }),
    [user, status, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
};
