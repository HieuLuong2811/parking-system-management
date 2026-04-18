import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { AuthUser, StoredAuthSession } from './authStorage';
import { clearStoredSession, getStoredSession, isExpired, setStoredSession, updateStoredUser } from './authStorage';
import { setUnauthorizedHandler } from './authEvents';
import { exchangeCodeApi, loginApi, meApi } from '../api/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  accessToken: string | null;
  user: AuthUser | null;
  signIn: (payload: { user_code: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  const signOut = useCallback(async () => {
    clearExpiryTimer();
    await clearStoredSession();
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, [clearExpiryTimer]);

  const applySession = useCallback(
    (session: StoredAuthSession | null) => {
      clearExpiryTimer();

      if (!session) {
        setAccessToken(null);
        setUser(null);
        setStatus('unauthenticated');
        return;
      }

      setAccessToken(session.accessToken);
      setUser(session.user ?? null);
      setStatus('authenticated');

      const expMs = Date.parse(session.expiresAt);
      const nowMs = Date.now();
      const delayMs = Math.max(0, expMs - nowMs - 30_000);

      expiryTimerRef.current = setTimeout(() => {
        void signOut();
      }, delayMs);
    },
    [clearExpiryTimer, signOut]
  );

  const refreshUser = useCallback(async () => {
    const session = await getStoredSession();
    if (!session) return;
    if (isExpired(session.expiresAt)) {
      await signOut();
      return;
    }

    try {
      const me = await meApi();
      setUser(me);
      await updateStoredUser(me);
    } catch {
      // If /auth/me fails (e.g. 401), axios interceptor will signOut.
    }
  }, [signOut]);

  const signIn = useCallback(
    async (payload: { user_code: string; password: string }) => {
      const codeRes = await loginApi(payload);
      const tokenRes = await exchangeCodeApi({ code: codeRes.code });

      const nextSession: StoredAuthSession = {
        accessToken: tokenRes.access_token,
        expiresAt: new Date(tokenRes.expires_at).toISOString(),
        user: null,
      };

      await setStoredSession(nextSession);
      applySession(nextSession);
      await refreshUser();
    },
    [applySession, refreshUser]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const stored = await getStoredSession();
        if (cancelled) return;

        if (!stored || isExpired(stored.expiresAt)) {
          await clearStoredSession();
          if (!cancelled) applySession(null);
          return;
        }

        applySession(stored);
        await refreshUser();
      } catch {
        if (!cancelled) applySession(null);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [applySession, refreshUser]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, accessToken, user, signIn, signOut, refreshUser }),
    [status, accessToken, user, signIn, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
