import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppAuth } from '../contexts/useAppAuth';
import { ProfileInformationPanel } from './profile/ProfileInformationPanel';
import { UserWalletPanel } from './profile/UserWalletPanel';
import { ParkingCardsPanel } from './profile/ParkingCardsPanel';
import { avatarText } from '../ultis/formatters';
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WalletIcon from '@mui/icons-material/Wallet';

type TabKey = 'profile' | 'wallet' | 'cards';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, status } = useAppAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const panel = useMemo(() => {
    if (activeTab === 'wallet') return <UserWalletPanel />;
    if (activeTab === 'cards') return <ParkingCardsPanel />;
    return <ProfileInformationPanel />;
  }, [activeTab]);

  if (status === 'loading') {
    return (
      <Box className="profile-page-shell">
        <Typography>{t('profile.loading')}</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="profile-page-shell">
        <Typography color="error">{t('profile.title')}</Typography>
      </Box>
    );
  }

  return (
    <Box className="profile-page-shell">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ width: { xs: '100%', md: 250, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: 8, height: 'max-content' }, flexShrink: 0 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Avatar sx={{ width: 40, height: 40 }}>{avatarText(user?.full_name)}</Avatar>
              <Box sx={{ minHeight: 48 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {user.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.user_code}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List disablePadding>
              <ListItemButton selected={activeTab === 'profile'} onClick={() => setActiveTab('profile')} className='profile-menu-item'>
                <PersonIcon />
                <ListItemText primary={t('profile.menu.profileInfo', { defaultValue: 'Profile Information' })} />
              </ListItemButton>
              <ListItemButton selected={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} className='profile-menu-item'>
                <WalletIcon />
                <ListItemText primary={t('profile.menu.wallet', { defaultValue: 'User Wallet' })} />
              </ListItemButton>
              <ListItemButton selected={activeTab === 'cards'} onClick={() => setActiveTab('cards')} className='profile-menu-item'>
                <CreditCardIcon />
                <ListItemText primary={t('profile.menu.parkingCards', { defaultValue: 'Parking Cards' })} />
              </ListItemButton>
            </List>
          </CardContent>
        </Card>

        <Box sx={{ flex: 1, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: 2, p: '16px 24px 24px' }} className="profile-card">
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {activeTab === 'wallet'
                ? t('wallet.title', { defaultValue: 'User Wallet' })
                : activeTab === 'cards'
                  ? t('parkingCards.title', { defaultValue: 'Parking Cards' })
                  : t('profile.title', { defaultValue: 'Profile' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 'wallet'
                ? t('wallet.subtitle', { defaultValue: 'Manage your wallet balance and deposits.' })
                : activeTab === 'cards'
                  ? t('parkingCards.subtitle', { defaultValue: 'Manage your parking access cards.' })
                  : t('profile.subtitle', { defaultValue: 'Manage your account information and password.' })}
            </Typography>
          </Box>

          {panel}
        </Box>
      </Stack>

      {statusMessage ? (
        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open autoHideDuration={3000} onClose={() => setStatusMessage(null)}>
          <Alert severity="error" onClose={() => setStatusMessage(null)}>
            {statusMessage}
          </Alert>
        </Snackbar>
      ) : null}
    </Box>
  );
}

