import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/useAuth';
import { AUTH_STATUS } from '../../contexts/authContextCore';

export const RequireAdmin: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === AUTH_STATUS.LOADING) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === AUTH_STATUS.FORBIDDEN) {
    return <Navigate to="/access-denied" replace />;
  }

  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return null;
  }

  const roles = (user?.roles || []).map((r) => String(r || '').trim().toUpperCase());
  const isAdmin = roles.includes('ADMIN');
  const isSecurity = roles.includes('SECURITY');
  const isUser = roles.includes('USER');

  if (!isAdmin && isUser && !isSecurity) {
    const allowed = location.pathname === '/notifications' || location.pathname === '/profile';
    if (!allowed) {
      return <Navigate to="/notifications" replace />;
    }
  }

  if (!isAdmin && isSecurity) {
    // Security users can access parking sessions and access cards screens.
    const allowed =
      location.pathname === '/parking_sessions' ||
      location.pathname === '/parking_access_cards';
    if (!allowed) {
      return <Navigate to="/parking_sessions" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
