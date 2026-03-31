import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { Box, Button, Link, Link as MuiLink, Stack, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useDropdown from '../../hooks/useDropdown';
import { languageOptions } from '../../ultis/languageOptions';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const navLinks = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.vehicles', to: '/vehicle' },
  { key: 'nav.plan', to: '/plan' },
  { key: 'nav.sessions', to: '/sessions' },
  { key: 'nav.invoices', to: '/invoices' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const languageDropdown = useDropdown();
  const profileDropdown = useDropdown();
  const location = useLocation();

  const currentLanguage =
    React.useMemo(() => languageOptions.find((option) => option.code === i18n.language) ?? languageOptions[0], [
      i18n.language,
    ]);

  const userName = t('nav.userName', { defaultValue: 'Hiếu' });

  const handleLanguageToggle = () => {
    profileDropdown.close();
    languageDropdown.toggle();
  };

  const handleProfileToggle = () => {
    languageDropdown.close();
    profileDropdown.toggle();
  };

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    languageDropdown.close();
  };

  const handleLogout = () => {
    alert('Logged out');
    profileDropdown.close();
  };

  return (
    <Box className="primary-navbar compact">
      <Box className="navbar-inner">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Link component={RouterLink} className="navbar-logo-block" to="/" underline="none">
            <Box component="img" src="/Logo.svg" alt="school logo" className="navbar-logo" />
            <Typography variant="h6" className="navbar-title">Parking System</Typography>
          </Link>

          <Box className="navbar-links">
            {navLinks.map((link) => (
              <MuiLink
                key={link.key}
                component={RouterLink}
                to={link.to}
                underline="none"
                className={`navbar-link ${link.to === location.pathname ? 'navbar-link--active' : ''}`}
                sx={{ color: '#0f172a' }}
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
              >
                <Box component="img" src={currentLanguage.flag} alt={currentLanguage.name} className="language-flag" />
                {currentLanguage.name}
                <ArrowDropDownIcon fontSize="small" />
              </Button>
              {languageDropdown.open && (
                <Box className="dropdown-panel dropdown-panel--language">
                  {languageOptions.map((option) => (
                    <Button
                      key={option.code}
                      fullWidth
                      className="dropdown-language-item"
                      onClick={() => handleLanguageSelect(option.code)}
                      sx={{ color: '#0f172a', textTransform: 'none' }}
                    >
                      <Box component="img" src={option.flag} alt={option.name} className="language-flag" />
                      <Typography variant="body2">{option.name}</Typography>
                    </Button>
                  ))}
                </Box>
              )}
            </Box>

            <Box ref={profileDropdown.containerRef} className="dropdown-container">
              <Button
                className="user-select"
                onClick={handleProfileToggle}
                variant="text"
                endIcon={<ArrowDropDownIcon fontSize="small" />}
                sx={{ color: '#0f172a' }}
              >
                {userName}
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
  );
}
