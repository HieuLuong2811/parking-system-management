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
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { COLLAPSED_SIDEBAR_WIDTH, EXPANDED_SIDEBAR_WIDTH } from '../../constant/config';
import { managementItems, primaryItems, type SidebarItemConfig } from './menu';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
}

const SidebarItem = ({
  text,
  icon,
  path,
  onClick,
  collapsed,
  active,
}: {
  text: string;
  icon: React.ReactNode;
  path: string;
  onClick: () => void;
  collapsed: boolean;
  active: boolean;
}) => (
  <ListItem disablePadding sx={{ justifyContent: 'center', mb: 0.5 }}>
    <Tooltip title={collapsed ? text : ''} placement="right">
      <ListItemButton
        component={RouterLink}
        to={path}
        onClick={onClick}
        sx={{
          px: collapsed ? 1.5 : 2.5,
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'all 0.3s ease',
          backgroundColor: active ? '#5a3ebd' : 'transparent',
          '&:hover': {
            backgroundColor: active ? '#5a3ebd' : 'rgba(15, 23, 42, 0.06)',
          },
          borderRadius: 2,
          boxShadow: active ? '0px 1px 3px rgba(0, 0, 0, 0.2)' : 'none',
        }}
      >
        <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: active ? '#ffffff' : '#525252cc' }}>{icon}</ListItemIcon>
        {!collapsed && (
          <ListItemText primary={text} sx={{ ml: 2 }} primaryTypographyProps={{ noWrap: true }} />
        )}
      </ListItemButton>
    </Tooltip>
  </ListItem>
);

const buildItems = (
  items: SidebarItemConfig[],
  t: ReturnType<typeof useTranslation>['t']
) =>
  items.map((item) => ({
    id: item.id,
    text: t(item.translationKey),
    icon: item.icon,
    path: item.path,
  }));

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose, collapsed }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { t } = useTranslation();
  const location = useLocation();

  const primaryResourceItems = buildItems(primaryItems, t);
  const managementResourceItems = buildItems(managementItems, t);

  const drawerWidth = collapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

  const isPathActive = (target: string) => {
    if (target === '/') {
      return location.pathname === '/';
    }
    return location.pathname === target || location.pathname.startsWith(`${target}/`);
  };

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar sx={{ justifyContent: collapsed ? 'center' : 'space-between' }}>
        <img src="/Logo.png" alt="Logo" width={50} height={50}/>
        {!collapsed && (
          <Box sx={{ textAlign: collapsed ? 'center' : 'left' }}>
            <Typography variant="h6" sx={{ fontSize: 20 }}>
              Quản lý bãi đỗ xe
            </Typography>
          </Box>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 0, px: collapsed ? 0 : 1 }}>
        {!collapsed && (
          <ListItem>
            <ListItemText primary={t('sideBar.children.home')} />
          </ListItem>
        )}
        <SidebarItem
          key="home"
          text={t('sideBar.children.home')}
          icon={<HomeIcon />}
          path="/"
          onClick={onClose}
          collapsed={collapsed}
          active={isPathActive('/')}
        />
        {primaryResourceItems.map((resource) => (
          <SidebarItem
            key={resource.id}
            text={resource.text}
            icon={resource.icon}
            path={resource.path}
            onClick={onClose}
            collapsed={collapsed}
            active={isPathActive(resource.path)}
          />
        ))}
      </List>
      <List sx={{ flexGrow: 1, px: collapsed ? 0 : 1 }}>
        {!collapsed && (
          <ListItem>
            <ListItemText primary={t('sideBar.children.resources')} />
          </ListItem>
        )}
        {managementResourceItems.map((resource) => (
          <SidebarItem
            key={resource.id}
            text={resource.text}
            icon={resource.icon}
            path={resource.path}
            onClick={onClose}
            collapsed={collapsed}
            active={isPathActive(resource.path)}
          />
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={!isDesktop && mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            boxShadow: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: 'width 0.3s ease',
            borderRight: 'none',
            boxShadow: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
