import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, CircularProgress, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export const COOKIE_NAME = 'access_token';

/**
 * Đặt một Cookie.
 * @param name Tên của cookie.
 * @param value Giá trị của cookie (access_token).
 * @param days Số ngày cookie có hiệu lực.
 */
const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
};

/**
 * Xóa một Cookie (bằng cách đặt thời gian hết hạn là quá khứ).
 * @param name Tên của cookie.
 */
const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax';  
};
// ===========================================
// KẾT THÚC KHỐI COOKIE UTILS
// ===========================================

// Hằng số chuyển hướng
const DASHBOARD_URL = 'http://localhost:2558/dashboard';

// Hàm giả lập API đăng nhập
const mockLoginApi = (user: string, pass: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user === 'admin' && pass === 'password') {
        // Trả về một token giả định
        resolve('mock_jwt_token_1234567890');
      } else {
        reject(new Error('Sai tên đăng nhập hoặc mật khẩu.'));
      }
    }, 1500);
  });
};

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Gọi API (giả lập)
      const token = await mockLoginApi(username, password);
      
      // 2. Lưu token vào Cookie (7 ngày)
      setCookie(COOKIE_NAME, token, 7); 
      
      // 3. Chuyển hướng đến Dashboard
      console.log('Đăng nhập thành công! Chuyển hướng đến Dashboard.');
      window.location.href = DASHBOARD_URL;

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Đã xảy ra lỗi không xác định.';
      setError(errorMessage);
      deleteCookie(COOKIE_NAME); 
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'white',
        }}
      >
        <LockOutlinedIcon color="primary" sx={{ m: 1, fontSize: 40 }} />
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Đăng nhập hệ thống (Port 8559)
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          (Tên đăng nhập: **admin**, Mật khẩu: **password**)
        </Typography>

        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Tên đăng nhập"
            name="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage; // Thêm default export