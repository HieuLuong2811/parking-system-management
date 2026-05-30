import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import StarIcon from '@mui/icons-material/Star';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export type SidebarItemConfig = {
  id: string;
  icon: React.ReactNode;
  path: string;
  translationKey: string;
};

export type SidebarGroupConfig = {
  id: string;
  icon: React.ReactNode;
  translationKey: string;
  children: SidebarItemConfig[];
};

export const overviewItems: SidebarItemConfig[] = [
  { id: 'dashboard', icon: <DashboardIcon />, path: '/', translationKey: 'sideBar.children.dashboard' },
  { id: 'parking_sessions', icon: <TableChartIcon />, path: '/parking_sessions', translationKey: 'sideBar.children.parkingSessions' },
  { id: 'parking_access_cards', icon: <CreditCardIcon />, path: '/parking_access_cards', translationKey: 'sideBar.children.parkingAccessCards' },
];

export const billingGroup: SidebarGroupConfig = {
  id: 'billing',
  icon: <AccountBalanceWalletIcon />,
  translationKey: 'sideBar.parents.billing',
  children: [
    { id: 'subscriptions', icon: <SubscriptionsIcon />, path: '/subscriptions', translationKey: 'sideBar.children.subscriptions' },
    { id: 'payment_transactions', icon: <ReceiptLongIcon />, path: '/payment_transactions', translationKey: 'sideBar.children.paymentTransactions' },
  ],
};

export const userManagementGroup: SidebarGroupConfig = {
  id: 'user_management',
  icon: <ManageAccountsIcon />,
  translationKey: 'sideBar.parents.userManagement',
  children: [
    { id: 'users', icon: <PeopleIcon />, path: '/users', translationKey: 'sideBar.children.users' },
    { id: 'roles', icon: <GroupIcon />, path: '/roles', translationKey: 'sideBar.children.roles' },
  ],
};

export const systemItems: SidebarItemConfig[] = [
  { id: 'payment_plans', icon: <PaymentIcon />, path: '/payment_plans', translationKey: 'sideBar.children.paymentPlans' },
  { id: 'plans', icon: <StarIcon />, path: '/plans', translationKey: 'sideBar.children.plans' },
  { id: 'terms', icon: <DescriptionIcon />, path: '/terms', translationKey: 'sideBar.children.terms' },
];

export const footerItems: SidebarItemConfig[] = [
  { id: 'notifications', icon: <NotificationsIcon />, path: '/notifications', translationKey: 'sideBar.children.notifications' },
  { id: 'profile', icon: <PeopleIcon />, path: '/profile', translationKey: 'sideBar.children.profile' },
];

export const logoutItem: SidebarItemConfig = {
  id: 'logout',
  icon: <LogoutIcon />,
  path: '#',
  translationKey: 'sideBar.children.logout',
};
