import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Toolbar, Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  const menuItems = [
    { text: t('sideBar.children.home'), icon: <HomeIcon />, path: '/' },
    { text: t('sideBar.children.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('sideBar.children.user'), icon: <GroupIcon />, path: '/user' },
    { text: t('sideBar.children.settings'), icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between'}}>
        <Box sx={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="./Logo.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </Box>
        <Typography variant="h6" noWrap component="div">
          {t('sideBar.title')}
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};