import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Breadcrumbs,
  Box,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';

import { resourceConfigs } from '../../config/resources';
import { languageOptions } from '../../ultis/flags';
import { COLLAPSED_SIDEBAR_WIDTH, EXPANDED_SIDEBAR_WIDTH } from '../../constant/config';
import { useAuth } from '../../contexts/authContext';

const notificationTemplates = [
  {
    id: 'permissions',
    titleKey: 'notifications.items.permissions.title',
    detailKey: 'notifications.items.permissions.detail',
    senderKey: 'notifications.senders.system',
    timeKey: 'notifications.times.twoHours',
  },
  {
    id: 'vehicles',
    titleKey: 'notifications.items.vehicles.title',
    detailKey: 'notifications.items.vehicles.detail',
    senderKey: 'notifications.senders.system',
    timeKey: 'notifications.times.yesterday',
  },
];

const getBreadcrumbs = (resourceLabel: string | null, path: string, t: ReturnType<typeof useTranslation>['t']) => {
  const crumbs = [{ label: t('breadcrumb.home'), path: '/' }];
  if (resourceLabel) {
    crumbs.push({ label: resourceLabel, path });
  } else if (path === '/settings') {
    crumbs.push({ label: t('breadcrumb.settings'), path: '/settings' });
  }
  return crumbs;
};

export const Navbar: React.FC<{
  onMenuClick?: () => void;
  collapsed: boolean;
  onCollapseToggle: () => void;
}> = ({ onMenuClick, collapsed, onCollapseToggle }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const drawerWidth = collapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;
  const { user, logout } = useAuth();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const resourceEndpoint = pathSegments[0];
  const resource = resourceEndpoint ? resourceConfigs.find((entry) => entry.endpoint === resourceEndpoint) : undefined;
  const resourceLabel = resource ? (resource.translationKey ? t(resource.translationKey) : resource.label) : null;
  const crumbs = getBreadcrumbs(resourceLabel, location.pathname, t);

  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  const notifications = useMemo(
    () =>
      notificationTemplates.map((item) => ({
        ...item,
        title: t(item.titleKey),
        detail: t(item.detailKey),
        sender: t(item.senderKey),
        time: t(item.timeKey),
      })),
    [t]
  );

  const currentLanguage = useMemo(
    () => languageOptions.find((option) => option.code === i18n.language) ?? languageOptions[0],
    [i18n.language]
  );

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleLanguageOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const closeNotificationMenu = () => {
    setNotificationAnchor(null);
  };

  const closeLanguageMenu = () => {
    setLanguageAnchor(null);
  };

  const closeProfileMenu = () => {
    setProfileAnchor(null);
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    closeLanguageMenu();
  };

  let pageTitle = t('pageTitle.home');
  if (resourceLabel) {
    pageTitle = resourceLabel;
  } else if (location.pathname === '/settings') {
    pageTitle = t('pageTitle.settings');
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        backgroundColor: '#fff',
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0',
        transition: 'margin 0.3s ease, width 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
          {!isDesktop && onMenuClick && (
            <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          {isDesktop && (
            <Tooltip title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}>
              <IconButton size="small" onClick={onCollapseToggle}>
                {collapsed ? <LastPageIcon /> : <FirstPageIcon />}
              </IconButton>
            </Tooltip>
          )}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="h6" color="text.primary" noWrap sx={{ display: 'flex', alignItems: 'center' }}>
              {pageTitle}
            </Typography>
            <Breadcrumbs
              separator="›"
              aria-label="breadcrumb"
              sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary', overflow: 'hidden' }}
            >
              {crumbs.map((crumb, index) =>
                index === crumbs.length - 1 ? (
                  <Typography key={crumb.label + index} variant="body2">
                    {crumb.label}
                  </Typography>
                ) : (
                  <Link
                    key={crumb.label + index}
                    component={RouterLink}
                    to={crumb.path}
                    color="inherit"
                    underline="hover"
                    variant="body2"
                  >
                    {crumb.label}
                  </Link>
                )
              )}
            </Breadcrumbs>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            size="large"
            onClick={handleNotificationOpen}
            aria-label="notifications"
            color="inherit"
            sx={{ color: 'text.primary' }}
          >
            <Badge color="secondary" variant={notifications.length > 0 ? 'dot' : undefined} overlap="circular">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={closeNotificationMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 320 } }}
          >
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <MenuItem key={item.id} onClick={closeNotificationMenu} sx={{ alignItems: 'flex-start' }}>
                  <Stack spacing={0.35} sx={{ width: '100%' }}>
                    <Typography variant="subtitle2">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.detail}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('notifications.sendBy', { sender: item.sender })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.time}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))
            ) : (
              <MenuItem onClick={closeNotificationMenu}>
                <Typography variant="body2">{t('notifications.empty')}</Typography>
              </MenuItem>
            )}
          </Menu>
          <IconButton
            size="large"
            onClick={handleLanguageOpen}
            aria-label="language selector"
            color="inherit"
          >
            <Box
              component="img"
              src={currentLanguage.flag}
              alt={currentLanguage.name}
              sx={{ width: 26, height: 18, borderRadius: 0.5, objectFit: 'cover' }}
            />
          </IconButton>
          <Menu
            anchorEl={languageAnchor}
            open={Boolean(languageAnchor)}
            onClose={closeLanguageMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {languageOptions.map((option) => (
              <MenuItem
                key={option.code}
                selected={option.code === currentLanguage.code}
                onClick={() => changeLanguage(option.code)}
              >
                <Box
                  component="img"
                  src={option.flag}
                  alt={option.name}
                  sx={{ width: 24, height: 16, borderRadius: 0.5, mr: 1 }}
                />
                <Typography variant="body2">{option.name}</Typography>
              </MenuItem>
            ))}
          </Menu>
          <IconButton size="large" onClick={handleProfileOpen} color="inherit">
            <Avatar>{user?.full_name?.at(0) ?? user?.user_code?.at(0) ?? 'A'}</Avatar>
          </IconButton>
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={closeProfileMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">
                {user?.full_name ?? user?.user_code ?? 'Admin'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.roles?.join(', ') ?? 'Admin'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                logout();
                closeProfileMenu();
              }}
            >
              {t('button.logout')}
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
