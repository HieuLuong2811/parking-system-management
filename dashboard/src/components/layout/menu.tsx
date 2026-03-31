import TableChartIcon from '@mui/icons-material/TableChart';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
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
];

export const managementItems: SidebarItemConfig[] = [
  {
    id: 'vehicles',
    icon: <TwoWheelerIcon />,
    path: '/vehicles',
    translationKey: 'vehiclesPage.title',
  },
  {
    id: 'users',
    icon: <PeopleIcon />,
    path: '/users',
    translationKey: 'usersPage.title',
  },
  {
    id: 'roles',
    icon: <GroupIcon />,
    path: '/roles',
    translationKey: 'rolesPage.title',
  },
  {
    id: 'user_roles',
    icon: <PersonIcon />,
    path: '/user_roles',
    translationKey: 'userRolesPage.title',
  },
  {
    id: 'terms',
    icon: <DescriptionIcon />,
    path: '/terms',
    translationKey: 'termsPage.title',
  },
  {
    id: 'plans',
    icon: <StarIcon />,
    path: '/plans',
    translationKey: 'plansPage.title',
  },
  {
    id: 'subscriptions',
    icon: <SubscriptionsIcon />,
    path: '/subscriptions',
    translationKey: 'subscriptionsPage.title',
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
