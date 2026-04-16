import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'react-i18next';

import type { AdminUser, SubscriptionSearchRow } from '../../api/types';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const formatCurrency = (value?: number) => (value === undefined ? '—' : currencyFormatter.format(value));

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '—');

interface DrawerUserSubscriptionProps {
  selectedUser: AdminUser | null;
  subscriptionRows: SubscriptionSearchRow[];
  isLoading: boolean;
  onViewSubscriptions: () => void;
}

export const DrawerUserSubscription: React.FC<DrawerUserSubscriptionProps> = ({
  selectedUser,
  subscriptionRows,
  isLoading,
  onViewSubscriptions,
}) => {
  const { t } = useTranslation();

  const latestSubscription = useMemo(() => {
    if (!selectedUser) return null;
    const rows = subscriptionRows.filter((row) => row.user_code === selectedUser.user_code);
    if (!rows.length) return null;
    return [...rows].sort(
      (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    )[0];
  }, [selectedUser, subscriptionRows]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h6">{t('usersPage.subscriptionDrawer.title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedUser ? selectedUser.full_name : t('usersPage.subscriptionDrawer.subtitle')}
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ flexGrow: 1, p: 2, borderRadius: 2 }}>
        {selectedUser ? (
          isLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', gap: 1 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                {t('usersPage.subscriptionDrawer.loading')}
              </Typography>
            </Stack>
          ) : latestSubscription ? (
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">{t('usersPage.subscriptionDrawer.current')}</Typography>
                <Chip
                  label={t(`usersPage.subscriptionDrawer.status.${latestSubscription.status}`)}
                  size="small"
                  color={
                    latestSubscription.status === 'ACTIVE'
                      ? 'success'
                      : latestSubscription.status === 'SUSPENDED'
                        ? 'warning'
                        : 'default'
                  }
                />
              </Stack>
              <Stack spacing={0.25}>
                <Typography variant="h6">{latestSubscription.plan?.plan_name ?? '—'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {latestSubscription.payment_plan?.plan_name ??
                    t('usersPage.subscriptionDrawer.noPaymentPlan')}
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  {t('usersPage.subscriptionDrawer.duration')}
                </Typography>
                <Typography variant="body2">
                  {formatDate(latestSubscription.start_date)} — {formatDate(latestSubscription.end_date)}
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {t('usersPage.subscriptionDrawer.total')}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(latestSubscription.total_amount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {t('usersPage.subscriptionDrawer.paid')}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(latestSubscription.paid_amount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {t('usersPage.subscriptionDrawer.balance')}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {latestSubscription.total_amount !== undefined &&
                      latestSubscription.paid_amount !== undefined
                      ? formatCurrency(latestSubscription.total_amount - latestSubscription.paid_amount)
                      : '—'}
                  </Typography>
                </Stack>
              </Stack>
              <Divider />
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  {t('usersPage.subscriptionDrawer.updated')}
                </Typography>
                <Typography variant="body2">
                  {formatDate(latestSubscription.updated_at)}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('usersPage.subscriptionDrawer.noSubscription')}
            </Typography>
          )
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('usersPage.subscriptionDrawer.selectUser')}
          </Typography>
        )}
      </Paper>
      <Button
        variant="contained"
        fullWidth
        endIcon={<OpenInNewIcon />}
        onClick={onViewSubscriptions}
      >
        {t('usersPage.subscriptionDrawer.viewAll')}
      </Button>
    </Box>
  );
};
