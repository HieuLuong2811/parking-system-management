import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import StarIcon from '@mui/icons-material/Star';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';

export type SidebarItemConfig = {
  id: string;
  icon: React.ReactNode;
  path: string;
  translationKey: string;
};

export const overviewItems: SidebarItemConfig[] = [
  { id: 'dashboard', icon: <DashboardIcon />, path: '/', translationKey: 'sideBar.children.dashboard' },
  { id: 'parking_sessions', icon: <TableChartIcon />, path: '/parking_sessions', translationKey: 'sideBar.children.parkingSessions' },
];

export const subscriptionItems: SidebarItemConfig[] = [
  { id: 'subscriptions', icon: <SubscriptionsIcon />, path: '/subscriptions', translationKey: 'sideBar.children.subscriptions' },
  { id: 'plans', icon: <StarIcon />, path: '/plans', translationKey: 'sideBar.children.plans' },
  { id: 'payment_transactions', icon: <ReceiptLongIcon />, path: '/payment_transactions', translationKey: 'sideBar.children.paymentTransactions' },
];

export const systemItems: SidebarItemConfig[] = [
  { id: 'users', icon: <PeopleIcon />, path: '/users', translationKey: 'sideBar.children.users' },
  { id: 'roles', icon: <GroupIcon />, path: '/roles', translationKey: 'sideBar.children.roles' },
  { id: 'vehicles', icon: <TwoWheelerIcon />, path: '/vehicles', translationKey: 'sideBar.children.vehicles' },
  { id: 'terms', icon: <DescriptionIcon />, path: '/terms', translationKey: 'sideBar.children.terms' },
  { id: 'notifications', icon: <NotificationsIcon />, path: '/notifications', translationKey: 'sideBar.children.notifications' },
  { id: 'profile', icon: <PeopleIcon />, path: '/profile', translationKey: 'sideBar.children.profile' },
];

export const logoutItem: SidebarItemConfig = {
  id: 'logout',
  icon: <LogoutIcon />,
  path: '#',
  translationKey: 'sideBar.children.logout',
};