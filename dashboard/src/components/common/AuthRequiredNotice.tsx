import { Box, Button, Typography } from '@mui/material';
import React from 'react';

interface AuthRequiredNoticeProps {
  onRetry: () => void;
  loginUrl: string;
}

const AuthRequiredNotice: React.FC<AuthRequiredNoticeProps> = ({ onRetry, loginUrl }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      px: 2,
    }}
  >
    <Typography variant="h6" color="error" align="center">
      Bạn cần đăng nhập để truy cập dashboard. Vui lòng đăng nhập trước khi tiếp tục.
    </Typography>
    <Button variant="contained" onClick={onRetry}>
      Thử lại
    </Button>
    <Button variant="text" onClick={() => (window.location.href = loginUrl)}>
      Quay lại đăng nhập
    </Button>
  </Box>
);

export default AuthRequiredNotice;
