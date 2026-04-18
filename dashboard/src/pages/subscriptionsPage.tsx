import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useTranslation } from 'react-i18next';

import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { DrawerUserSubscription } from '../components/users/DrawerUserSubscription';
import { useSubscriptionDetails } from '../api/subscriptions';
import type {  UserSubscriptionDetailRecord } from '../api/types';
import { formatCurrency, formatDateTime } from '../ultis/format';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const statusOptions = ['ALL', 'ACTIVE', 'EXPIRED', 'SUSPENDED'] as const;

const statusColorMap: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  ACTIVE: 'success',
  EXPIRED: 'warning',
  SUSPENDED: 'info',
};

const formatStatusLabel = (status: string, t: ReturnType<typeof useTranslation>['t']) =>
  t(`profile.subscriptions.status.${status.toLowerCase()}`, { defaultValue: status });

export const SubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof statusOptions[number]>('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSubscriptionDetailRecord | null>(null);
  const navigate = useNavigate();

  const { data: subscriptionDetails = [], isLoading, isError } = useSubscriptionDetails();

  const normalizedQuery = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptionDetails.filter((subscription) => {
      if (statusFilter !== 'ALL' && subscription.status !== statusFilter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = [
        subscription.user_code,
        subscription.subscription_plan?.plan_name,
        subscription.payment_plan?.plan_name,
        subscription.term?.term_name,
        subscription.vehicle?.license_plate,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
        .join('|');
      return haystack.includes(normalizedQuery);
    });
  }, [subscriptionDetails, normalizedQuery, statusFilter]);

  const openDrawerForUser = useCallback((user: UserSubscriptionDetailRecord) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedUser(null);
  }, []);

  const handleViewSubscriptions = useCallback((subscription_id: string) => {
    closeDrawer();
    if (subscription_id) {
      navigate('/subscriptions/' + subscription_id + '/invoices');
    }
  }, [closeDrawer, navigate]);

  const columns = useMemo<GridColDef<UserSubscriptionDetailRecord>[]>(() => {
    return [
      {
        field: 'user_code',
        headerName: t('subscriptionsPage.columns.user', 'User'),
        minWidth: 160,
        flex: 1,
        renderCell: (params) => {
          return (
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">{params.value}</Typography>
            </Stack>
          );
        },
      },
      {
        field: 'subscription_plan',
        headerName: t('subscriptionsPage.columns.plan', 'Plan'),
        minWidth: 180,
        flex: 1,
        renderCell: (params) => (
          <Typography>{params.row.subscription_plan?.plan_name ?? '—'}</Typography>
        ),
      },
      {
        field: 'payment_plan',
        headerName: t('subscriptionsPage.columns.paymentPlan', 'Payment plan'),
        minWidth: 170,
        renderCell: (params) => (
          <Typography>{params.row.payment_plan?.plan_name ?? '—'}</Typography>
        ),
      },
      {
        field: 'term',
        headerName: t('subscriptionsPage.columns.term', 'Term'),
        minWidth: 150,
        renderCell: (params) => (
          <Typography>{params.row.term?.term_name ?? '—'}</Typography>
        ),
      },
      {
        field: 'period',
        headerName: t('subscriptionsPage.columns.period', 'Period'),
        minWidth: 200,
        renderCell: (params) => (
          <Typography>
            {formatDateTime(params.row.start_date)} – {formatDateTime(params.row.end_date)}
          </Typography>
        ),
      },
      {
        field: 'amount',
        headerName: t('subscriptionsPage.columns.amount', 'Amount'),
        minWidth: 140,
        renderCell: (params) => (
          <Stack direction="column" spacing={0.25}>
            <Typography>{formatCurrency(params.row.total_amount)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t('subscriptionsPage.columns.paid', 'Paid')}: {formatCurrency(params.row.paid_amount)}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'vehicle',
        headerName: t('subscriptionsPage.columns.vehicle', 'Vehicle'),
        minWidth: 150,
        renderCell: (params) => (
          <Typography>{params.row.vehicle?.license_plate ?? '—'}</Typography>
        ),
      },
      {
        field: 'status',
        headerName: t('subscriptionsPage.columns.status', 'Status'),
        minWidth: 120,
        renderCell: (params) => (
          <Chip
            label={formatStatusLabel(params.row.status, t)}
            color={statusColorMap[params.row.status] ?? 'default'}
            size="small"
          />
        ),
      },
      {
        field: 'actions',
        headerName: t('subscriptionsPage.columns.actions', 'Actions'),
        minWidth: 120,
        sortable: false,
        renderCell: (params) => (
           <IconButton
              size="small"
              onClick={() => openDrawerForUser(params.row as UserSubscriptionDetailRecord)}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
        ),
      },
    ];
  }, [t, openDrawerForUser]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">{t('subscriptionsPage.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('subscriptionsPage.description')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder={t('subscriptionsPage.searchPlaceholder')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <FormControl size="small">
            <InputLabel>{t('subscriptionsPage.filters.status')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('subscriptionsPage.filters.status')}
              onChange={(event) =>
                setStatusFilter(event.target.value as typeof statusOptions[number])
              }
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(`profile.subscriptions.status.${status.toLowerCase()}`, { defaultValue: status })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button onClick={handleClearFilters} variant="outlined" size="small">
            {t('button.clear')}
          </Button>
        </Stack>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('subscriptionsPage.error')}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <SoftDataGrid
          rows={filteredSubscriptions}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          maxHeight={560}
          emptyMessage={t('subscriptionsPage.empty')}
        />
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
        <Box
          sx={{
            width: { xs: 320, sm: 380 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 3,
          }}
        >
          <DrawerUserSubscription
            selectedUser={selectedUser}
            subscriptionRows={subscriptionRows || []}
            isLoading={isSubscriptionsLoading}
            onViewSubscriptions={handleViewSubscriptions}
          />
        </Box>
      </Drawer>
    </Box>
  );
};
