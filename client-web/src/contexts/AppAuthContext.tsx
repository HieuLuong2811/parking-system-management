import { Box, CircularProgress, Typography } from '@mui/material';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import AuthRequiredNotice from '../components/common/AuthRequiredNotice';
import { VITE_LOGIN_URL } from '../constant/config';
import { clientHttp, requestWithContext, UserInfo } from '../api/clientApi';
import { exchangeAuthCode } from '../api/auth';
import { useTranslation } from 'react-i18next';

const getAuthCodeFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  return code?.trim() || null;
};

const removeAuthCodeFromUrl = (): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  window.history.replaceState(null, '', url.toString());
};

export interface AppAuthContextValue {
  user: UserInfo | null;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  patchUser: (patch: Partial<UserInfo>) => void;
}

export const AppAuthContext = createContext<AppAuthContextValue | undefined>(undefined);

export const AppAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const patchUser = useCallback((patch: Partial<UserInfo>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const me = await requestWithContext(clientHttp.get<UserInfo>('/auth/me'), 'Load current user');
      setUser(me);
      setStatus('ready');
    } catch (err) {
      setUser(null);
      setStatus('error');
      const message =
        err instanceof Error ? err.message : 'Unable to authenticate the session';
      setError(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await clientHttp.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setUser(null);
      setStatus('error');
      window.location.href = VITE_LOGIN_URL;
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setError(null);
      const code = getAuthCodeFromUrl();
      if (code) {
        removeAuthCodeFromUrl();
        try {
          await exchangeAuthCode(code);
        } catch (error) {
          console.error('Failed to exchange auth code:', error);
          setStatus('error');
          setError(t('common.error'));
          return;
        }
      }

      await refresh();
    };

    void initialize();
  }, [refresh, t]);

  const value = useMemo(
    () => ({ user, status, error, refresh, logout, patchUser }),
    [user, status, error, refresh, logout, patchUser]
  );

  if (status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* <CircularProgress /> */}
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <AuthRequiredNotice onRetry={refresh} loginUrl={VITE_LOGIN_URL} />
    );
  }

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
};
