import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Snackbar,
  TablePagination,
  TextField,
  Chip,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/useAuth';

import { PageHeader } from '../components/common/PageHeader';
import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useDisableParkingAccessCard, useParkingAccessCardsPaginated } from '../api/parkingAccessCards';
import type { HolderType, ParkingAccessCardAdminRow, ParkingAccessCardStatus } from '../api/types';
import { parkingAccessCardStatusOptions } from '../constant/config';
import { UserIdentityCell } from '../components/common/UserIdentityCell';
import { CreateParkingAccessCardDialog } from '../components/parkingAccessCards/CreateParkingAccessCardDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

type FiltersState = {
  barcodeToken: string;
  holderType: '' | HolderType;
  status: '' | ParkingAccessCardStatus;
  userQuery: string;
};

export const ParkingAccessCardsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const roles = (user?.roles || []).map((r) => String(r || '').trim().toUpperCase());
  const isSecurityOnly = roles.includes('SECURITY') && !roles.includes('ADMIN');
  const disableMutation = useDisableParkingAccessCard();
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });
  const [confirm, setConfirm] = useState<{ open: boolean; cardId: string }>({
    open: false,
    cardId: '',
  });
  const [filters, setFilters] = useState<FiltersState>({
    barcodeToken: '',
    holderType: 'STUDENT',
    status: '',
    userQuery: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const debounced = useDebouncedValue(filters, 400);

  const queryFilters = useMemo(() => {
    return {
      page: page + 1,
      limit: rowsPerPage,
      barcode_token: debounced.barcodeToken.trim() || undefined,
      holder_type: (debounced.holderType || undefined) as HolderType,
      status: (debounced.status || undefined) as ParkingAccessCardStatus,
      user_query: debounced.userQuery.trim() || undefined,
    };
  }, [debounced, page, rowsPerPage]);

  const { data: paginated, isLoading, isError } = useParkingAccessCardsPaginated(queryFilters);
  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const columns = useMemo<GridColDef<ParkingAccessCardAdminRow>[]>(() => {
    return [
      {
        field: 'user_code',
        headerName: t('parkingAccessCardsPage.columns.user', { defaultValue: 'User' }),
        minWidth: 100,
        flex: 1,
        sortable: false,
        renderCell: (params) => {
          const fullName = params.row.user_full_name;
          const code = params.row.user_code;
          if (!fullName && !code) return <span>-</span>;
          return (
            <UserIdentityCell fullName={params.row.user_full_name} userCode={String(params.row.user_code ?? '')} />
          );
        },
      },
      {
        field: 'barcode_token',
        headerName: t('parkingAccessCardsPage.columns.barcode', { defaultValue: 'Card code' }),
        minWidth: 200,
        flex: 1,
      },
      {
        field: 'holder_type',
        headerName: t('parkingAccessCardsPage.columns.holderType', { defaultValue: 'Holder type' }),
        minWidth: 140,
        renderCell: (params) => {
          const value = params.value as string;
          return (
            <Typography>
              {t(`parkingAccessCardsPage.holderType.${value.toLowerCase()}`, { defaultValue: String(value) })}
            </Typography>
          );
        }
      },
      {
        field: 'status',
        headerName: t('parkingAccessCardsPage.columns.status', { defaultValue: 'Status' }),
        minWidth: 140,
        renderCell: (params) => {
          const value = params.value as string;
          return (
            <Typography>
              {t(`parkingAccessCardsPage.status.${value.toLowerCase()}`, { defaultValue: String(value) })}
            </Typography>
          );
        },
      },
      {
        field: 'is_in_use',
        headerName: t('parkingAccessCardsPage.columns.inUse', { defaultValue: 'In use' }),
        minWidth: 140,
        sortable: false,
        renderCell: (params) => {
          const isInUse = Boolean(params.value);

          return (
            <Chip
              size="small"
              label={
                isInUse
                  ? t('parkingAccessCardsPage.inUseStatus.using', { defaultValue: 'In use' })
                  : t('parkingAccessCardsPage.inUseStatus.notUsing', { defaultValue: 'Not in use' })
              }
              color={isInUse ? 'success' : 'default'}
              variant={isInUse ? 'filled' : 'outlined'}
            />
          );
        },
      },
      ...(isSecurityOnly
        ? []
        : [
            {
              field: 'actions',
              headerName: t('common.table.actions', { defaultValue: 'Actions' }),
              minWidth: 160,
              sortable: false,
              headerAlign: 'center',
              filterable: false,
              align: 'center',
              renderCell: (params) => {
                const row = params.row;
                const normalizedStatus = String(row.status ?? '').toUpperCase();
                const isDisabled = normalizedStatus === 'DISABLED';
                const hasUser = Boolean(String(row.user_code ?? '').trim());
                const canDisable = hasUser && !isDisabled;
                return (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    disabled={!canDisable || disableMutation.isPending}
                    onClick={() => {
                      if (!row.id) return;
                      setConfirm({ open: true, cardId: String(row.id) });
                    }}
                  >
                    {t('parkingAccessCardsPage.actions.disable', { defaultValue: 'Disable' })}
                  </Button>
                );
              },
            } as GridColDef<ParkingAccessCardAdminRow>,
          ]),
    ];
  }, [disableMutation, isSecurityOnly, t]);

  const handleClearFilters = () => {
    setFilters({ barcodeToken: '', holderType: 'STUDENT', status: '', userQuery: '' });
    setPage(0);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
        <PageHeader
          title={t('parkingAccessCardsPage.title', { defaultValue: 'Parking access cards' })}
          subtitle={t('parkingAccessCardsPage.description', { defaultValue: 'Browse and filter issued access cards.' })}
        />
      </Box>

      <Stack direction="row" flexWrap="wrap" justifyContent="space-between" alignItems="center">
        <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <FilterListIcon color="action" />
            <Typography variant="body2">{t('common.filters.search')}</Typography>
          </Box>
          <TextField
            size="small"
            label={t('parkingAccessCardsPage.filters.barcode', { defaultValue: 'Card code' })}
            value={filters.barcodeToken}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, barcodeToken: e.target.value }));
              setPage(0);
            }}
          />

          <TextField
            select
            size="small"
            label={t('parkingAccessCardsPage.filters.holderType', { defaultValue: 'Holder type' })}
            value={filters.holderType}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, holderType: e.target.value as FiltersState['holderType'] }));
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected) => {
                if (!selected) return t('common.filters.all', { defaultValue: 'All' });
                return t(`parkingAccessCardsPage.holderType.${String(selected).toLowerCase()}`, {
                  defaultValue: String(selected),
                });
              },
            }}
          >
            <MenuItem value="">{t('common.filters.all', { defaultValue: 'All' })}</MenuItem>
            <MenuItem value="STUDENT">{t('parkingAccessCardsPage.holderType.student', { defaultValue: 'Student' })}</MenuItem>
            <MenuItem value="TEACHER">{t('parkingAccessCardsPage.holderType.teacher', { defaultValue: 'Teacher' })}</MenuItem>
            <MenuItem value="GUEST">{t('parkingAccessCardsPage.holderType.guest', { defaultValue: 'Guest' })}</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label={t('parkingAccessCardsPage.filters.status', { defaultValue: 'Status' })}
            value={filters.status}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, status: e.target.value as FiltersState['status'] }));
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected) => {
                if (!selected) return t('common.filters.all', { defaultValue: 'All' });
                return t(`parkingAccessCardsPage.status.${String(selected).toLowerCase()}`, {
                  defaultValue: String(selected),
                });
              },
            }}
          >
            <MenuItem value="">{t('common.filters.all', { defaultValue: 'All' })}</MenuItem>
            {Object.values(parkingAccessCardStatusOptions).map((s) => (
              <MenuItem key={s} value={s}>
                {t(`parkingAccessCardsPage.status.${s.toLowerCase()}`, { defaultValue: s })}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            label={t('parkingAccessCardsPage.filters.userQuery', { defaultValue: 'User' })}
            placeholder={t('parkingAccessCardsPage.filters.userQueryPlaceholder', {
              defaultValue: 'Full name or user code',
            })}
            value={filters.userQuery}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, userQuery: e.target.value }));
              setPage(0);
            }}
          />

          <Button variant="text" onClick={handleClearFilters}>
            {t('common.filters.reset')}
          </Button>
        </Stack>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          {isSecurityOnly ? null : t('parkingAccessCardsPage.actions.create', { defaultValue: 'Create card' })}
        </Button>
      </Stack>

      {isError && (
        <Alert severity="error">
          {t('parkingAccessCardsPage.error', { defaultValue: 'Could not load access cards.' })}
        </Alert>
      )}

      <Paper elevation={0}>
        <SoftDataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => (row as ParkingAccessCardAdminRow).id}
          maxHeight={520}
          emptyMessage={t('parkingAccessCardsPage.empty', { defaultValue: 'No access cards found.' })}
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
      </Paper>

      <CreateParkingAccessCardDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setPage(0);
          setToast({
            open: true,
            severity: 'success',
            message: t('parkingAccessCardsPage.actions.createSuccess', { defaultValue: 'Created parking access card.' }),
          });
        }}
      />

      <ConfirmDialog
        open={confirm.open}
        title={t('parkingAccessCardsPage.actions.disable', { defaultValue: 'Disable' })}
        content={t('parkingAccessCardsPage.actions.confirmDisable', {
          defaultValue: 'Disable this card and notify the user by email?',
        })}
        confirmText={t('parkingAccessCardsPage.actions.disable', { defaultValue: 'Disable' })}
        loading={disableMutation.isPending}
        onClose={() => setConfirm({ open: false, cardId: '' })}
        onConfirm={async () => {
          try {
            await disableMutation.mutateAsync(confirm.cardId);
            setConfirm({ open: false, cardId: '' });
            setToast({
              open: true,
              severity: 'success',
              message: t('parkingAccessCardsPage.actions.disableSuccess', {
                defaultValue: 'Card disabled. Email notification sent (if configured).',
              }),
            });
          } catch {
            setConfirm({ open: false, cardId: '' });
            setToast({
              open: true,
              severity: 'error',
              message: t('parkingAccessCardsPage.actions.disableError', { defaultValue: 'Disable card failed.' }),
            });
          }
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
