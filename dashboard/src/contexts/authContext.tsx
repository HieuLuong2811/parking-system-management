import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

import { AuthContext,type AuthContextValue,type AuthStatus } from './authContextCore';
import AuthRequiredNotice from '../components/common/AuthRequiredNotice';
import { fetchCurrentUser, exchangeAuthCode } from '../api/auth';
import { VITE_LOGIN_URL } from '../constant/config';

const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [status, setStatus] = useState<AuthStatus>(bypassAuth ? 'authenticated' : 'loading');

  const refresh = useCallback(async () => {
    if (bypassAuth) {
      setStatus('authenticated');
      return;
    }

    setStatus('loading');
    try {
      const me = await fetchCurrentUser();
      setUser(me);
      const normalizedRoles = (me.roles || []).map((role) => role?.trim().toUpperCase());
      if (!normalizedRoles.includes('ADMIN')) {
        setStatus('forbidden');
      } else {
        setStatus('authenticated');
      }
    } catch (error) {
      setUser(null);
      setStatus('unauthorized');
      console.error('Failed to fetch current user:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${VITE_LOGIN_URL.replace(/\/$/, '')}/auth/logout`, null, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      setUser(null);
      setStatus('unauthorized');
      window.location.href = VITE_LOGIN_URL;
    }
  }, []);

  useEffect(() => {
    if (bypassAuth) {
      return;
    }

    const initialize = async () => {
      const code = getAuthCodeFromUrl();
      if (code) {
        removeAuthCodeFromUrl();
        try {
          await exchangeAuthCode(code);
        } catch (error) {
          console.error('Failed to exchange auth code:', error);
          setUser(null);
          setStatus('unauthorized');
          return;
        }
      }

      await refresh();
    };

    void initialize();
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

  if (status === 'loading') {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Đang xác thực quyền truy cập...</Typography>
        </Box>
      </Box>
    );
  }

  if (status === 'unauthorized') {
    return (
      <AuthRequiredNotice onRetry={refresh} loginUrl={VITE_LOGIN_URL} />
    );
  }

  if (status === 'forbidden') {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Quyền truy cập bị từ chối.</Typography>
      </Box>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
