import React from 'react';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { COLLAPSED_SIDEBAR_WIDTH, EXPANDED_SIDEBAR_WIDTH } from '../../constant/config';
import {
  logoutItem,
  overviewItems,
  subscriptionItems,
  systemItems,
  type SidebarItemConfig,
} from './menu';
import { ActiveIndicator } from '../ActiveIndicator';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapseToggle: () => void; 
}

interface SidebarItemProps {
  text: string;
  icon: React.ReactNode;
  path: string;
  onClick: () => void;
  collapsed: boolean;
  active: boolean;
  isDanger?: boolean;
}

const SidebarItem = ({
  text,
  icon,
  path,
  onClick,
  collapsed,
  active,
  isDanger = false,
}: SidebarItemProps) => {
  const [hover, setHover] = React.useState(false);

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <Tooltip title={collapsed ? text : ''} placement="right">
        <ListItemButton
          component={path !== '#' ? RouterLink : 'button'}
          to={path !== '#' ? path : undefined}
          onClick={onClick}
          onMouseEnter={() => isDanger && setHover(true)}
          onMouseLeave={() => isDanger && setHover(false)}
          sx={{
            position: 'relative',
            px: collapsed ? 1.5 : 2,
            py: 1,
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 2,

            color: isDanger
              ? '#dc2626'
              : active
              ? '#1e1b4b'
              : '#475569',

            backgroundColor: active
              ? 'rgba(107,79,208,0.08)'
              : isDanger && hover
              ? 'rgba(220,38,38,0.08)'
              : 'transparent',

            '&:hover': {
              backgroundColor: isDanger
                ? 'rgba(220,38,38,0.08)'
                : active
                ? 'rgba(107,79,208,0.12)'
                : 'rgba(15,23,42,0.04)',
            },
          }}
        >
          <ActiveIndicator
            active={active || (isDanger && hover)}
            color={isDanger ? '#dc2626' : '#6b4fd0'}
          />

          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 2,
              justifyContent: 'center',
              color: isDanger
                ? '#dc2626'
                : active
                ? '#6b4fd0'
                : '#64748b',
            }}
          >
            {icon}
          </ListItemIcon>

          {!collapsed && (
            <ListItemText
              primary={text}
              primaryTypographyProps={{
                noWrap: true,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

const buildItems = (items: SidebarItemConfig[], t: (key: string) => string) =>
  items.map((item) => ({
    id: item.id,
    text: t(item.translationKey),
    icon: item.icon,
    path: item.path,
  }));

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose, collapsed, onCollapseToggle }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { t } = useTranslation();
  const location = useLocation();
  const drawerWidth = collapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

  const isPathActive = (target: string) => {
    if (target === '/') return location.pathname === '/';
    return location.pathname === target || location.pathname.startsWith(`${target}/`);
  };

  const logout = () => {
    window.location.href = '/logout';
  };

  const renderSection = (titleKey: string, items: SidebarItemConfig[]) => (
    <List sx={{ px: collapsed ? 0 : 1 }}>
      {!collapsed && (
        <ListItem sx={{ px: 2, py: 0.5 }}>
          <ListItemText
            primary={t(titleKey)}
            primaryTypographyProps={{
              fontSize: 12,
              color: '#94a3b8',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          />
        </ListItem>
      )}

      {buildItems(items, t).map((item) => (
        <SidebarItem
          key={item.id}
          text={item.text}
          icon={item.icon}
          path={item.path}
          onClick={onClose}
          collapsed={collapsed}
          active={isPathActive(item.path)}
        />
      ))}
    </List>
  );

  const drawerContent = (
    <Box sx={{ width: drawerWidth, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <Toolbar sx={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: 1 }}>
        <img src="/Logo.png" alt="Logo" width={36} height={36} />
        {!collapsed && (
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Parking Admin
          </Typography>
        )}
      </Toolbar>

      <Divider />

      <List sx={{ px: collapsed ? 0 : 1 }}>
        <SidebarItem
          text={collapsed ? t('sideBar.expand') : t('sideBar.collapse')}
          icon={collapsed ? <LastPageIcon /> : <FirstPageIcon />}
          path="#"
          onClick={onCollapseToggle}
          collapsed={collapsed}
          active={false}
        />
      </List>

      {renderSection('sideBar.subMenu.General', overviewItems)}
      {renderSection('sideBar.subMenu.Subscriptions', subscriptionItems)}
      {renderSection('sideBar.subMenu.System', systemItems)}


      <List sx={{ mt: 'auto', px: collapsed ? 0 : 1 }}>
        <SidebarItem
          text={t(logoutItem.translationKey)}
          icon={logoutItem.icon}
          path="#"
          onClick={logout}
          collapsed={collapsed}
          active={false}
          isDanger
        />
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={!isDesktop && mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxShadow: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            transition: 'width 0.3s',
            borderRight: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};