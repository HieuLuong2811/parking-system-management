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

import type { AdminUser, UserSubscriptionDetailRecord, SubscriptionSearchRow } from '../../api/types';
import { formatCurrency, formatDateTime } from '../../ultis/format';

interface DrawerUserSubscriptionProps {
  selectedUser: (Pick<AdminUser, 'user_code' | 'full_name'> | UserSubscriptionDetailRecord) | null;
  subscriptionRows?: SubscriptionSearchRow[];
  subscriptionDetails?: UserSubscriptionDetailRecord[];
  isLoading: boolean;
  onViewSubscriptions: (subscription_id: string) => void;
}

export const DrawerUserSubscription: React.FC<DrawerUserSubscriptionProps> = ({
  selectedUser,
  subscriptionRows = [],
  subscriptionDetails = [],
  isLoading,
  onViewSubscriptions,
}) => {
  const { t } = useTranslation();

  const selectedUserName = useMemo(() => {
    if (!selectedUser) return null;
    const direct = (selectedUser as Pick<AdminUser, 'full_name'>).full_name;
    if (direct) return direct;
    const nested = (selectedUser as UserSubscriptionDetailRecord).user?.full_name;
    return nested ?? null;
  }, [selectedUser]);

  const latestSubscription = useMemo(() => {
    if (!selectedUser) return null;

    if (subscriptionDetails.length) {
      const rows = subscriptionDetails.filter((row) => row.user_code === selectedUser.user_code);
      if (!rows.length) return null;
      return [...rows].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0];
    }

    if (subscriptionRows.length) {
      const rows = subscriptionRows.filter((row) => row.user_code === selectedUser.user_code);
      if (!rows.length) return null;
      return [...rows].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0];
    }

    return selectedUser;
  }, [selectedUser, subscriptionDetails, subscriptionRows]);

  const normalized = useMemo(() => {
    if (!latestSubscription) return null;

    const isSearchRow = (latestSubscription as SubscriptionSearchRow).plan !== undefined;
    if (isSearchRow) {
      const row = latestSubscription as SubscriptionSearchRow;
      return {
        id: row.id,
        status: row.status,
        start_date: row.start_date,
        end_date: row.end_date,
        total_amount: row.total_amount,
        paid_amount: row.paid_amount,
        updated_at: row.updated_at,
        plan_type: row.plan?.plans_type,
        payment_plan_type: row.payment_plan?.payment_type,
      };
    }

    const row = latestSubscription as UserSubscriptionDetailRecord;
    return {
      id: row.id,
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      total_amount: row.total_amount,
      paid_amount: row.paid_amount,
      updated_at: row.updated_at,
      plan_type: row.subscription_plan?.plans_type ?? undefined,
      payment_plan_type: row.payment_plan?.payment_type ?? undefined,
    };
  }, [latestSubscription]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h6">{t('usersPage.subscriptionDrawer.title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedUser
            ? `${selectedUserName ?? selectedUser.user_code} • ${selectedUser.user_code}`
            : t('usersPage.subscriptionDrawer.subtitle')}
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
          ) : normalized ? (
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">{t('usersPage.subscriptionDrawer.current')}</Typography>
                <Chip
                  label={t(`usersPage.subscriptionDrawer.status.${normalized.status}`)}
                  size="small"
                  color={
                    normalized.status === 'ACTIVE'
                      ? 'success'
                      : normalized.status === 'SUSPENDED'
                        ? 'warning'
                        : 'default'
                  }
                />
              </Stack>
              <Stack spacing={0.25}>
                <Typography variant="h6">{normalized.plan_type ?? '—'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {normalized.payment_plan_type ??
                    t('usersPage.subscriptionDrawer.noPaymentPlan')}
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  {t('usersPage.subscriptionDrawer.duration')}
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(normalized.start_date)} — {formatDateTime(normalized.end_date)}
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {t('usersPage.subscriptionDrawer.total')}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(normalized.total_amount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {t('usersPage.subscriptionDrawer.paid')}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(normalized.paid_amount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {t('usersPage.subscriptionDrawer.balance')}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {normalized.total_amount !== undefined &&
                      normalized.paid_amount !== undefined
                      ? formatCurrency(normalized.total_amount - normalized.paid_amount)
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
                  {formatDateTime(normalized.updated_at)}
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
        onClick={() => onViewSubscriptions(normalized?.id ?? '')}
      >
        {t('usersPage.subscriptionDrawer.viewAll')}
      </Button>
    </Box>
  );
};
