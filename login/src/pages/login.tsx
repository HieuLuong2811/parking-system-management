import React, { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { COOKIE_NAME, deleteCookie, setCookie } from '../utils/cookieUtils';
import { VITE_DASHBOARD_URL } from '../constant/config';
import {
  getStoredLanguage,
  languageLabels,
  Language,
  supportedLanguages,
  setStoredLanguage,
} from '../utils/language';
import { loginTranslations } from '../translations/login';

const mockLoginApi = (user: string, pass: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user === 'admin' && pass === 'password') {
        resolve('mock_jwt_token_1234567890');
      } else {
        reject(new Error('Sai tên đăng nhập hoặc mật khẩu.'));
      }
    }, 1500);
  });
};

const LoginPage: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const t = useMemo(
    () => (key: string) => loginTranslations[language][key] ?? key,
    [language]
  );

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      setStoredLanguage(lang);
    },
    [setLanguage, setStoredLanguage]
  );

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!username || !password) {
      setError(t('login.error.empty'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = await mockLoginApi(username, password);
      
      setCookie(COOKIE_NAME, token, 7);
      window.location.href = VITE_DASHBOARD_URL;

    } catch (e) {
      setError(t('login.error.invalid'));
      deleteCookie(COOKIE_NAME); 
      setIsLoading(false);
    }
  };

  const languageButtons = useMemo(
    () =>
      supportedLanguages.map(lang => (
        <Button
          key={lang}
          size="small"
          variant={language === lang ? 'contained' : 'outlined'}
          onClick={() => handleLanguageChange(lang)}
        >
          {languageLabels[lang]}
        </Button>
      )),
    [language, handleLanguageChange]
  );

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
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          {t('login.title')}
        </Typography>
        <ButtonGroup sx={{ mb: 2 }}>{languageButtons}</ButtonGroup>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('login.credentials-hint')}
        </Typography>

        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label={t('login.username')}
            name="username"
            autoFocus
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('login.password')}
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
            {isLoading ? t('login.loading') : t('login.button')}
          </Button>
          <Typography variant="body2">
            {t('login.no-account')}{' '}
            <RouterLink to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
              {t('login.register-link')}
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
