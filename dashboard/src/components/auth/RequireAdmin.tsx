import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

import { VITE_LOGIN_URL } from '../../constant/config';
import { useAuth } from '../../contexts/useAuth';

const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

export const RequireAdmin: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  
  useEffect(() => {
    if (status === 'unauthorized') {
      window.location.href = VITE_LOGIN_URL;
    }
  }, [status]);

  if (bypassAuth) {
    return children ? <>{children}</> : <Outlet />;
  }

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

  if (status === 'forbidden') {
    return <Navigate to="/access-denied" replace />;
  }

  if (status === 'unauthorized') {
    return null;
  }

  return children ? <>{children}</> : <Outlet />;
};
