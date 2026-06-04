import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AuthContext, AUTH_STATUS, type AuthContextValue, type AuthStatus } from './authContextCore';
import { fetchCurrentUser, exchangeAuthCode, logoutAuth } from '../api/auth';
import { VITE_LOGIN_URL } from '../constant/config';
import WarningIcon from '@mui/icons-material/Warning';

const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

const getAuthCodeFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code')?.trim() || null;
};

const removeAuthCodeFromUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  window.history.replaceState(null, '', url.toString());
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [status, setStatus] = useState<AuthStatus>(
    bypassAuth ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.LOADING
  );

  const refresh = useCallback(async () => {
    if (bypassAuth) {
      setStatus(AUTH_STATUS.AUTHENTICATED);
      return;
    }

    try {
      const me = await fetchCurrentUser();
      setUser(me);

      const roles = (me.roles || []).map(r => r?.trim().toUpperCase());
      if (!roles.includes('ADMIN') && !roles.includes('SECURITY') && !roles.includes('USER')) {
        setStatus(AUTH_STATUS.FORBIDDEN);
      } else {
        setStatus(AUTH_STATUS.AUTHENTICATED);
      }
    } catch {
      window.location.href = VITE_LOGIN_URL;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAuth();
    } finally {
      window.location.href = VITE_LOGIN_URL + '?logout=true';
    }
  }, []);

  useEffect(() => {
    if (bypassAuth) return;

    const init = async () => {
      const code = getAuthCodeFromUrl();

      if (code) {
        removeAuthCodeFromUrl();
        try {
          await exchangeAuthCode(code);
        } catch {
          window.location.href = VITE_LOGIN_URL;
          return;
        }
      }

      await refresh();
    };

    void init();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, status, refresh, logout }),
    [user, status, refresh, logout]
  );

  if (status === AUTH_STATUS.LOADING) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Đang xác thực quyền truy cập...</Typography>
        </Box>
      </Box>
    );
  }

  if (status === AUTH_STATUS.FORBIDDEN) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', bgcolor: '#fff', p: 2, borderRadius: 2, maxWidth: 400, mx: 'auto', border: '1px solid #eeeeee' }}>
          <WarningIcon sx={{ fontSize: 100, color: 'warning.main' }} />
          <Typography fontWeight={600}>Quyền truy cập bị từ chối.</Typography>
        </Box>
      </Box>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
