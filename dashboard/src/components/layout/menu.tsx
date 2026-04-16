import TableChartIcon from '@mui/icons-material/TableChart';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import StarIcon from '@mui/icons-material/Star';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';

export type SidebarItemConfig = {
  id: string;
  icon: React.ReactNode;
  path: string;
  translationKey: string;
};

export const primaryItems: SidebarItemConfig[] = [
  {
    id: 'parking_sessions',
    icon: <TableChartIcon />,
    path: '/parking_sessions',
    translationKey: 'parkingSessionsPage.title',
  },
  {
    id: 'subscriptions',
    icon: <SubscriptionsIcon />,
    path: '/subscriptions',
    translationKey: 'subscriptionsPage.title',
  },
];

export const managementItems: SidebarItemConfig[] = [
  {
    id: 'users',
    icon: <PeopleIcon />,
    path: '/users',
    translationKey: 'usersPage.title',
  },
  {
    id: 'terms',
    icon: <DescriptionIcon />,
    path: '/terms',
    translationKey: 'termsPage.title',
  },
  {
    id: 'roles',
    icon: <GroupIcon />,
    path: '/roles',
    translationKey: 'rolesPage.title',
  },
  {
    id: 'plans',
    icon: <StarIcon />,
    path: '/plans',
    translationKey: 'plansPage.title',
  },
  {
    id: 'vehicles',
    icon: <TwoWheelerIcon />,
    path: '/vehicles',
    translationKey: 'vehiclesPage.title',
  },
  {
    id: 'billing_event_logs',
    icon: <ReceiptIcon />,
    path: '/billing_event_logs',
    translationKey: 'billingEventLogsPage.title',
  },
  {
    id: 'payment_transactions',
    icon: <ReceiptLongIcon />,
    path: '/payment_transactions',
    translationKey: 'resources.tables.paymentTransactions',
  },
];
