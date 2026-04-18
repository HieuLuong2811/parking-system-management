import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { Backdrop,Box, Button, Link, Link as MuiLink, Stack, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useDropdown from '../../hooks/useDropdown';
import { languageOptions } from '../../ultis/languageOptions';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAppAuth } from '../../contexts/useAppAuth';
import { useUpdateUser } from '../../api/users';

const navLinks = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.vehicles', to: '/vehicle' },
  { key: 'nav.sessions', to: '/sessions' },
  { key: 'nav.invoices', to: '/invoices' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const languageDropdown = useDropdown();
  const profileDropdown = useDropdown();
  const location = useLocation();

  const [isLanguageChanging, setLanguageChanging] = React.useState(false);
  const currentLanguage =
    React.useMemo(() => languageOptions.find((option) => option.code === i18n.language) ?? languageOptions[0], [
      i18n.language,
    ]);

  const { user, logout, patchUser } = useAppAuth();
  const userName = user?.full_name ?? t('nav.userName', { defaultValue: 'User' });
  const userRole = user?.user_code ?? t('nav.userRole', { defaultValue: 'User' });
  const { mutateAsync: updateUserLanguage } = useUpdateUser();

  const handleLanguageToggle = () => {
    profileDropdown.close();
    languageDropdown.toggle();
  };

  const handleProfileToggle = () => {
    languageDropdown.close();
    profileDropdown.toggle();
  };

  const handleLanguageSelect = async (code: string) => {
    if (isLanguageChanging) return;
    if (code === i18n.language) {
      languageDropdown.close();
      return;
    }

    languageDropdown.close();
    setLanguageChanging(true);

    try {
      await i18n.changeLanguage(code);

      if (user) {
        await updateUserLanguage({
          userCode: user.user_code,
          payload: {
            language_use: code,
          },
          skipInvalidate: true,
        });

        patchUser({ language_use: code });
      }
    } catch (err) {
      console.error('Failed to persist language change', err);
    } finally {
      setLanguageChanging(false);
    }
  };

  const handleLogout = async () => {
    profileDropdown.close();
    await logout();
  };

return (
  <>
    <Backdrop
      open={isLanguageChanging}
      sx={{
        zIndex: 9999,
        color: '#fff',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        sx={{
          background: '#ffffff',
          color: '#0f172a',
          px: 4,
          py: 3,
          borderRadius: 3,
          minWidth: 280,
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.2)',
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            border: '4px solid #dbeafe',
            borderTop: '4px solid #1846ff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('common.changingLanguage', { defaultValue: 'Đang thay đổi ngôn ngữ...' })}
        </Typography>
        <Typography variant="body2" sx={{ color: '#475569', textAlign: 'center' }}>
          {t('common.pleaseWait', { defaultValue: 'Vui lòng chờ trong giây lát.' })}
        </Typography>
      </Stack>
    </Backdrop>

    <Box className="primary-navbar compact">
      <Box className="navbar-inner">
        <Stack className='navbar-content' direction="row" alignItems="center" justifyContent="space-between">
          <Link component={RouterLink} className="navbar-logo-block" to="/" underline="none">
            <Box component="img" src="/Logo.svg" alt="school logo" className="navbar-logo" />
            <Typography variant="h6" className="navbar-title">Parking System UTEHY</Typography>
          </Link>

          <Box className="navbar-links">
            {navLinks.map((link) => (
              <MuiLink
                key={link.key}
                component={RouterLink}
                to={link.to}
                underline="none"
                className={`navbar-link ${link.to === location.pathname ? 'navbar-link--active' : ''}`}
                sx={{ color: '#0f172a', pointerEvents: isLanguageChanging ? 'none' : 'auto' }}
              >
                <Typography variant="body2" sx={{ color: 'inherit', fontSize: '1rem' }}>
                  {t(link.key)}
                </Typography>
              </MuiLink>
            ))}
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" className="nav-actions">
            <Box ref={languageDropdown.containerRef} className="dropdown-container">
              <Button
                className="language-select compact"
                onClick={handleLanguageToggle}
                variant="text"
                sx={{ color: '#0f172a' }}
                disabled={isLanguageChanging}
              >
                <Box component="img" src={currentLanguage.flag} alt={currentLanguage.name} className="language-flag" />
                <ArrowDropDownIcon fontSize="small" />
              </Button>

              {languageDropdown.open && (
                <Box className="dropdown-panel dropdown-panel--language">
                  {languageOptions.map((option) => {
                    const isSelected = option.code === currentLanguage.code;
                    return (
                      <Button
                        key={option.code}
                        fullWidth
                        className={`dropdown-language-item ${isSelected ? 'dropdown-language-item--selected' : ''}`}
                        onClick={() => handleLanguageSelect(option.code)}
                        disabled={isLanguageChanging}
                        sx={{
                          color: '#0f172a',
                          textTransform: 'none',
                          justifyContent: 'flex-start',
                          display: 'flex',
                        }}
                      >
                        <Box component="img" src={option.flag} alt={option.name} className="language-flag" />
                        <Typography variant="body2">{option.name}</Typography>
                      </Button>
                    );
                  })}
                </Box>
              )}
            </Box>

            <Box ref={profileDropdown.containerRef} className="dropdown-container">
            <Button
              className="user-select"
              onClick={handleProfileToggle}
              variant="text"
              endIcon={<ArrowDropDownIcon fontSize="small" />}
              disabled={isLanguageChanging}
            >
              <span className="user-select-content">
                <span className="user-select-name">{userName}</span>
                <span className="user-select-role">{userRole}</span>
              </span>
            </Button>

              {profileDropdown.open && (
                <Box className="dropdown-panel dropdown-panel--profile">
                  <Button
                    component={RouterLink}
                    to="/profile"
                    className="dropdown-profile-item"
                    startIcon={<PersonIcon fontSize="small" />}
                    sx={{ justifyContent: 'flex-start', color: '#0f172a', textTransform: 'none' }}
                    fullWidth
                    disabled={isLanguageChanging}
                  >
                    {t('nav.profile')}
                  </Button>

                  <Button
                    className="dropdown-profile-item logout-button"
                    onClick={handleLogout}
                    startIcon={<LogoutIcon fontSize="small" />}
                    sx={{
                      justifyContent: 'flex-start',
                      color: '#0f172a',
                      textTransform: 'none',
                      '&:hover': {
                        color: 'red',
                      },
                    }}
                    fullWidth
                    disabled={isLanguageChanging}
                  >
                    {t('profile.logout')}
                  </Button>
                </Box>
              )}
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Box>
  </>
);
}
