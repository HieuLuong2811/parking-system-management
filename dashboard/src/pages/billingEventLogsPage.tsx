import React, { useMemo, useState } from 'react';
import { Alert, Box, Paper, Snackbar, Stack, TablePagination, TextField, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { useBillingEvents } from '../api/billingEvents';
import type { BillingEventLogRecord, PaginatedResponse } from '../api/types';
import { formatDateTime } from '../ultis/format';

const renderMeta = (value: Record<string, unknown> | null | undefined) => {
  if (!value) return '-';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const columns: GridColDef<BillingEventLogRecord>[] = [
  { field: 'id', headerName: 'Log ID', width: 220, sortable: true },
  { field: 'user_code', headerName: 'User code', width: 180, sortable: true },
  { field: 'subscription_id', headerName: 'Subscription ID', width: 220, sortable: true },
  { field: 'event_type', headerName: 'Event', width: 200, sortable: true },
  {
    field: 'meta_data',
    headerName: 'Meta data',
    flex: 1,
    sortable: false,
    renderCell: (params) => <span>{renderMeta(params.value as Record<string, unknown> | null | undefined)}</span>,
  },
  {
    field: 'created_at',
    headerName: 'Created at',
    width: 200,
    sortable: true,
    valueGetter: (__value, row) => formatDateTime(row.created_at),
  },
];

export const BillingEventLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data: paginated, isLoading, isError, error } = useBillingEvents({
    search: searchTerm || undefined,
    page: page + 1,
    limit: rowsPerPage,
  }) as unknown as {
    data: PaginatedResponse<BillingEventLogRecord> | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;
  const errorMessage = useMemo(() => {
    if (!isError) return '';
    if (error instanceof Error) return error.message;
    return String(error ?? '');
  }, [error, isError]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Billing events</Typography>
        <Typography variant="body2" color="text.secondary">
          Theo dõi các sự kiện thanh toán.
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          value={searchTerm}
          label="Search"
          placeholder="Search by event or user"
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
          getRowId={(row) => (row as BillingEventLogRecord).id}
          maxHeight={520}
          emptyMessage="No billing events yet."
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
          rowsPerPageOptions={[10, 20, 50, 100]}
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

