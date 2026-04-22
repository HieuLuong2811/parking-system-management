import React, { useMemo, useState } from 'react';
import { Alert, Box, Chip, Paper, Snackbar, Stack, TablePagination, TextField, Typography } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { useVehicles } from '../api/vehicles';
import type { PaginatedResponse, VehicleRecord } from '../api/types';
import { formatDateTime } from '../ultis/format';
import { vehicleTypeOptions } from '../constant/config';

export const VehiclesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { data: paginated, isLoading, isError, error } = useVehicles({
    search: searchTerm || undefined,
    page: page + 1,
    limit: rowsPerPage,
  }) as unknown as { data: PaginatedResponse<VehicleRecord> | undefined; isLoading: boolean; isError: boolean; error: unknown };
  const { t } = useTranslation();

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;
  const errorMessage = useMemo(() => {
    if (!isError) return '';
    if (error instanceof Error) return error.message;
    return String(error ?? '');
  }, [error, isError]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'user_code', headerName: t('vehiclesPage.columns.userCode'), width: 160, sortable: true },
      {
        field: 'vehicle_type',
        headerName: t('vehiclesPage.columns.type'),
        width: 160,
        sortable: true,
        renderCell: (params) => {
          switch (params.value) {
            case vehicleTypeOptions.MOTORBIKE:
              return <Chip size="small" label={t('vehiclesPage.vehicleTypes.motorbike')} color="primary" />;
            case vehicleTypeOptions.ELECTRIC_BICYCLE:
              return <Chip size="small" label={t('vehiclesPage.vehicleTypes.electricBicycle')} color="success" />;
            case vehicleTypeOptions.BICYCLE:
              return <Chip size="small" label={t('vehiclesPage.vehicleTypes.bicycle')} color="info" />;
            default:
              return <span>{String(params.value)}</span>;
          }
        },
      },
      { field: 'license_plate', headerName: t('vehiclesPage.columns.licensePlate'), width: 160, sortable: true },
      {
        field: 'qr_code',
        headerName: t('vehiclesPage.columns.qrCode'),
        flex: 1,
        sortable: true,
        renderCell: (params) => <span>{params.value ? String(params.value).slice(0, 64) : '-'}</span>,
      },
      {
        field: 'status',
        headerName: t('vehiclesPage.columns.status'),
        width: 140,
        sortable: true,
        valueGetter: (__value, row) => (row?.deleted_at == null ? 'deleted' : 'active'),
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row?.deleted_at == null
            ? t('vehiclesPage.status.active')
            : t('vehiclesPage.status.deleted')}
            color={params.row?.deleted_at == null ? 'success' : 'default'}
          />
        ),
      },
      {
        field: 'created_at',
        headerName: t('vehiclesPage.columns.createdAt'),
        width: 200,
        sortable: true,
        renderCell: (params) => formatDateTime(params.row.created_at),
      },
      {
        field: 'updated_at',
        headerName: t('vehiclesPage.columns.updatedAt'),
        width: 200,
        sortable: true,
        renderCell: (params) => formatDateTime(params.row.updated_at),
      },
    ],
    [t]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="h5">{t('vehiclesPage.title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('vehiclesPage.description')}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          value={searchTerm}
          label={t('vehiclesPage.searchLabel', { defaultValue: 'Search' })}
          placeholder={t('vehiclesPage.searchPlaceholder')}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setPage(0);
          }}
          sx={{ maxWidth: 420 }}
        />
      </Stack>

      <Paper elevation={0}>
        <SoftDataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => (row as VehicleRecord).id}
          maxHeight={420}
          emptyMessage={t('vehiclesPage.empty')}
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
        />
      </Paper>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={() => {}}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
