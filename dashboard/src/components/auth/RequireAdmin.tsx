import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/useAuth';
import { AUTH_STATUS } from '../../contexts/authContextCore';

export const RequireAdmin: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();

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

  return children ? <>{children}</> : <Outlet />;
};