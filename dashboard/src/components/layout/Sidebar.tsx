import React, { useEffect } from 'react';
import {
  Box,
  Divider,
  Drawer,
  List,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/useAuth';

import { COLLAPSED_SIDEBAR_WIDTH, EXPANDED_SIDEBAR_WIDTH } from '../../constant/config';
import {
  logoutItem,
  overviewItems,
  billingGroup,
  userManagementGroup,
  systemItems,
  footerItems,
  type SidebarItemConfig,
  type SidebarGroupConfig,
} from './menu';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { buildItems } from '../../ultis/format';
import { SidebarGroup, SidebarItem } from './sidebarItem';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapseToggle: () => void; 
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose, collapsed, onCollapseToggle }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const drawerWidth = collapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

  const isPathActive = (target: string) => {
    if (target === '/') return location.pathname === '/';
    return location.pathname === target || location.pathname.startsWith(`${target}/`);
  };

  const isGroupActive = (group: SidebarGroupConfig) =>
    group.children.some((child) => isPathActive(child.path));

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => ({
    [billingGroup.id]: isGroupActive(billingGroup),
    [userManagementGroup.id]: isGroupActive(userManagementGroup),
  }));

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      if (isGroupActive(billingGroup)) next[billingGroup.id] = true;
      if (isGroupActive(userManagementGroup)) next[userManagementGroup.id] = true;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const logout = () => {
    window.location.href = '/logout';
  };

  const renderSection = (items: SidebarItemConfig[]) => (
    <>
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
    </>
  );


  const renderGroup = (group: SidebarGroupConfig) => (
    <SidebarGroup
      key={group.id}
      group={group}
      collapsed={collapsed}
      open={!!openGroups[group.id]}
      onToggle={() =>
        setOpenGroups((prev) => ({
          ...prev,
          [group.id]: !prev[group.id],
        }))
      }
      onClose={onClose}
      isPathActive={isPathActive}
      isGroupActive={isGroupActive}
      t={t}
    />
  );
  
  const roles = (user?.roles || []).map((r) => String(r || '').trim().toUpperCase());
  const isSecurityOnly = roles.includes('SECURITY') && !roles.includes('ADMIN');
  const isUserOnly = roles.includes('USER') && !roles.includes('ADMIN') && !roles.includes('SECURITY');

  const visibleOverviewItems = isSecurityOnly
    ? overviewItems.filter((item) => item.id === 'parking_sessions' || item.id === 'parking_access_cards')
    : overviewItems;

  const visibleBillingGroup = isSecurityOnly
    ? null
    : billingGroup;

  const visibleUserManagementGroup = isSecurityOnly
    ? null
    : userManagementGroup;

  const visibleSystemItems = isSecurityOnly ? [] : systemItems;
  const visibleFooterItems = isUserOnly
    ? footerItems.filter((item) => item.id === 'notifications' || item.id === 'profile')
    : footerItems;

  const drawerContent = (
    <Box sx={{ width: drawerWidth, minHeight: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: '#e2e8f0' }}>
      
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

      <List disablePadding sx={{ px: collapsed ? 0 : 1, py: 0 }}>
        {renderSection(visibleOverviewItems)}
        {visibleBillingGroup ? renderGroup(visibleBillingGroup) : null}
        {visibleUserManagementGroup ? renderGroup(visibleUserManagementGroup) : null}
        {renderSection(visibleSystemItems)}
      </List>


      <List sx={{ mt: 'auto', px: collapsed ? 0 : 1 }}>
        <Divider sx={{ mb: 1 }} />
        {renderSection(visibleFooterItems)}
        <Divider sx={{ my: 1 }} />
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
