import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  TablePagination,
  Typography,
  Tooltip,
} from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useTranslation } from 'react-i18next';

import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { UserIdentityCell } from '../components/common/UserIdentityCell';
import { useSubscriptionDetailsPaginated } from '../api/subscriptions';
import type {  UserSubscriptionDetailRecord } from '../api/types';
import { formatCurrency, formatDateTime } from '../ultis/format';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import { planTypeOptions, subscriptionStatusOptions } from '../constant/config';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { PageHeader } from '../components/common/PageHeader';

const statusOptions = ['ALL', ...Object.values(subscriptionStatusOptions)] as const;
const planType = ['ALL', ...Object.values(planTypeOptions)] as const;
const paymentTypeOptions = ['ALL', 'FULL', 'MONTHLY'] as const;

const statusColorMap: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  ACTIVE: 'success',
  PENDING: 'default',
  EXPIRED: 'warning',
  SUSPENDED: 'info',
};

const formatStatusLabel = (status: string, t: ReturnType<typeof useTranslation>['t']) =>
  t(`common.subscriptionStatus.${status}`, { defaultValue: status });

export const SubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();

  type FiltersState = {
    userCode: string;
    fullName: string;
    planType: typeof planType[number];
    paymentType: typeof paymentTypeOptions[number];
    status: typeof statusOptions[number];
  };

  const defaultFilters: FiltersState = {
    userCode: '',
    fullName: '',
    planType: 'ALL',
    paymentType: 'ALL',
    status: subscriptionStatusOptions.ACTIVE,
  };

  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const updateFilters = useCallback((updater: (prev: FiltersState) => FiltersState) => {
    setFilters((prev) => updater(prev));
    setPage(0);
  }, []);

  const debouncedSearch = useDebouncedValue(
    { userCode: filters.userCode, fullName: filters.fullName },
    450
  );

  const queryFilters = useMemo(
    () => ({
      user_code: debouncedSearch.userCode.trim() || undefined,
      full_name: debouncedSearch.fullName.trim() || undefined,
      plan_type: filters.planType === 'ALL' ? undefined : filters.planType,
      payment_type: filters.paymentType === 'ALL' ? undefined : filters.paymentType,
      status: filters.status === 'ALL' ? undefined : filters.status,
      page: page + 1,
      limit: rowsPerPage,
    }),
    [debouncedSearch.fullName, debouncedSearch.userCode, filters.paymentType, filters.planType, filters.status, page, rowsPerPage]
  );

  const { data: paginated, isLoading, isError } = useSubscriptionDetailsPaginated(queryFilters);

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const handleViewSubscriptions = useCallback((subscription_id: string) => {
    if (subscription_id) {
      navigate('/subscriptions/' + subscription_id + '/invoices');
    }
  }, [navigate]);

  const columns = useMemo<GridColDef<UserSubscriptionDetailRecord>[]>(() => {
    return [
      {
        field: 'user_code',
        headerName: t('subscriptionsPage.columns.user', 'User'),
        minWidth: 160,
        flex: 1,
        renderCell: (params) => {
          return <UserIdentityCell fullName={params.row.user?.full_name} userCode={String(params.value ?? '')} />;
        },
      },
      {
        field: 'subscription_plan',
        headerName: t('subscriptionsPage.columns.plan', 'Plan'),
        minWidth: 180,
        flex: 1,
        renderCell: (params) => (
          <Typography>{t('common.subscriptionPlans.' + params.row.subscription_plan?.plans_type, { defaultValue: '—' })}</Typography>
        ),
      },
      {
        field: 'payment_plan',
        headerName: t('subscriptionsPage.columns.paymentPlan', 'Payment plan'),
        minWidth: 170,
        renderCell: (params) => (
          <Typography>{t(`common.paymentPlan.${params.row.payment_plan?.payment_type}`)}</Typography>
        ),
      },
      {
        field: 'period',
        headerName: t('subscriptionsPage.columns.period', 'Period'),
        minWidth: 200,
        renderCell: (params) => (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">
              {t('subscriptionsPage.periodLabels.from', { defaultValue: 'From' })}:{' '}
              {formatDateTime(params.row.start_date)}
            </Typography>
            <Typography variant="subtitle2">
              {t('subscriptionsPage.periodLabels.to', { defaultValue: 'To' })}:{' '}
              {formatDateTime(params.row.end_date)}
            </Typography>
          </Stack>
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
        align: 'center',
        headerAlign: 'center',
        filterable: false,
        renderCell: (params) => (
          <Tooltip title={t('subscriptionsPage.viewInvoicesTooltip', 'View invoices')}>
           <IconButton
              size="small"
              onClick={() => handleViewSubscriptions(params.row.id)}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ];
  }, [t, handleViewSubscriptions]);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setPage(0);
  };

  return (
    <Box>
      <Stack direction="row" flexDirection="column" gap={2} sx={{ mb: 2 }}>
        <PageHeader title={t('subscriptionsPage.title')} subtitle={t('subscriptionsPage.description')} />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <FilterListIcon color="action" />
            <Typography variant="body2">{t('common.filters.search')}</Typography>
          </Box>
          <TextField
            size="small"
            variant="outlined"
            label={t('subscriptionsPage.filters.userCode', { defaultValue: 'User code' })}
            value={filters.userCode}
            onChange={(event) => {
              updateFilters((prev) => ({ ...prev, userCode: event.target.value }));
            }}
          />
          <TextField
            size="small"
            variant="outlined"
            label={t('subscriptionsPage.filters.fullName', { defaultValue: 'Full name' })}
            value={filters.fullName}
            onChange={(event) => {
              updateFilters((prev) => ({ ...prev, fullName: event.target.value }));
            }}
          />
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>{t('subscriptionsPage.filters.planType', { defaultValue: 'Plan type' })}</InputLabel>
            <Select
              value={filters.planType}
              label={t('subscriptionsPage.filters.planType', { defaultValue: 'Plan type' })}
              onChange={(event) => {
                updateFilters((prev) => ({ ...prev, planType: event.target.value as typeof planType[number] }));
              }}
            >
              {planType.map((value) => (
                <MenuItem key={value} value={value}>
                  {t(`common.subscriptionPlans.${value}`, { defaultValue: value })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t('subscriptionsPage.filters.paymentPlan', { defaultValue: 'Payment plan' })}</InputLabel>
            <Select
              value={filters.paymentType}
              label={t('subscriptionsPage.filters.paymentPlan', { defaultValue: 'Payment plan' })}
              onChange={(event) => {
                updateFilters((prev) => ({
                  ...prev,
                  paymentType: event.target.value as typeof paymentTypeOptions[number],
                }));
              }}
            >
              {paymentTypeOptions.map((value) => (
                <MenuItem key={value} value={value}>
                  {t(`common.paymentPlan.${value}`, { defaultValue: value })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel>{t('subscriptionsPage.filters.status')}</InputLabel>
            <Select
              value={filters.status}
              label={t('subscriptionsPage.filters.status')}
              onChange={(event) => {
                updateFilters((prev) => ({ ...prev, status: event.target.value as typeof statusOptions[number] }));
              }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(`common.subscriptionStatus.${status}`, { defaultValue: status })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="text" onClick={handleClearFilters}>
            {t('common.filters.reset')}
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
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          maxHeight={560}
          emptyMessage={t('subscriptionsPage.empty')}
        />
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          labelRowsPerPage={t('common.pagination.rowsPerPage', {
            defaultValue: 'Rows per page:',
          })}
          labelDisplayedRows={({ from, to, count }) =>
            t('common.pagination.displayedRows', {
              from,
              to,
              count,
              defaultValue: `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`,
            })
          }
        />
      </Box>
    </Box>
  );
};
