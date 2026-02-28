import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
import { Link as RouterLink } from 'react-router-dom';
import PasswordChecklist from '../components/PasswordChecklist';
import { emailRegex, isPasswordComplex } from '../utils/passwordRegex';
import {
  getStoredLanguage,
  languageLabels,
  type Language,
  setStoredLanguage,
  supportedLanguages,
} from '../utils/language';
import { registerTranslations } from '../translations/register';

const initialFormState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const RegisterPage: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  const [formState, setFormState] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);

  const t = useCallback(
    (key: string) => registerTranslations[language][key] ?? key,
    [language]
  );

  const handleInputChange = (
    field: keyof typeof initialFormState
  ) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const validateForm = () => {
    const validationErrors: string[] = [];

    if (!formState.username.trim()) {
      validationErrors.push(t('register.error.username-required'));
    }

    if (!formState.email.trim()) {
      validationErrors.push(t('register.error.email-required'));
    } else if (!emailRegex.test(formState.email.trim())) {
      validationErrors.push(t('register.error.invalid-email'));
    }

    if (!formState.password) {
      validationErrors.push(t('register.error.password-required'));
    }

    if (!formState.confirmPassword) {
      validationErrors.push(t('register.error.confirm-password-required'));
    }

    if (
      formState.password &&
      formState.confirmPassword &&
      formState.password !== formState.confirmPassword
    ) {
      validationErrors.push(t('register.error.passwords-mismatch'));
    }

    if (formState.password && !isPasswordComplex(formState.password)) {
      validationErrors.push(t('register.error.password-weak'));
    }

    return validationErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (validationErrors.length) {
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSuccessMessage(t('register.success'));
      setFormState(initialFormState);
    } finally {
      setIsLoading(false);
    }
  };

  const checklistVisible = Boolean(formState.password) && showChecklist;

  useEffect(() => {
    if (!formState.password) {
      setShowChecklist(false);
    }
  }, [formState.password]);

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      setStoredLanguage(lang);
    },
    [setLanguage, setStoredLanguage]
  );

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
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          {t('register.title')}
        </Typography>

        <ButtonGroup sx={{ mb: 2 }}>{languageButtons}</ButtonGroup>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {errors.map((message, idx) => (
              <Box key={idx}>{message}</Box>
            ))}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="register-username"
            label={t('register.username')}
            name="username"
            autoFocus
            value={formState.username}
            onChange={handleInputChange('username')}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="register-email"
            label={t('register.email')}
            name="email"
            value={formState.email}
            onChange={handleInputChange('email')}
            disabled={isLoading}
          />

          <Box sx={{ position: 'relative', width: '100%', mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('register.password')}
              type="password"
              id="register-password"
              value={formState.password}
              onChange={handleInputChange('password')}
              onFocus={() => setShowChecklist(true)}
              onBlur={() => setShowChecklist(false)}
              disabled={isLoading}
            />
            {checklistVisible && (
              <PasswordChecklist password={formState.password} t={t} type_width />
            )}
          </Box>

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label={t('register.confirm-password')}
            type="password"
            id="register-confirm-password"
            value={formState.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
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
            {isLoading ? t('register.loading') : t('register.submit')}
          </Button>
        </Box>

        <Typography variant="body2">
          <RouterLink to="/" style={{ textDecoration: 'none', color: '#1976d2' }}>
            {t('register.back-to-login')}
          </RouterLink>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;
