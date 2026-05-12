import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { useInvoices } from '../api/invoices';
import { formatCurrency, formatMeta, formatDateTime } from '../ultis/format';
import { PageHeader } from '../components/common/PageHeader';

type ToastState = { severity: 'error'; message: string } | null;

const columns: GridColDef[] = [
  { field: 'id', headerName: 'Invoice ID', width: 220, sortable: false },
  { field: 'user_code', headerName: 'User code', width: 160, sortable: false },
  { field: 'subscription_id', headerName: 'Subscription ID', width: 200, sortable: false },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 140,
    sortable: false,
    renderCell: (params) => (
      <Typography variant="body2">{formatCurrency(params.row.amount)}</Typography>
    ),
  },
  { field: 'payment_method', headerName: 'Payment method', width: 160, sortable: false },
  { field: 'status', headerName: 'Status', width: 140, sortable: false },
  {
    field: 'metadata',
    headerName: 'Meta data',
    flex: 1,
    sortable: false,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary" noWrap>
        {formatMeta(params.value)}
      </Typography>
    ),
  },
  {
    field: 'created_at',
    headerName: 'Created at',
    width: 200,
    sortable: false,
    valueGetter: (_value, row) => formatDateTime(row.created_at),
  },
];

export const InvoicesPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: invoices = [], isLoading, isError, error } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');

  const errorMessage = useMemo(() => {
    if (!isError) return '';
    return error instanceof Error ? error.message : 'Không thể tải danh sách hóa đơn';
  }, [error, isError]);

  const filteredInvoices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return invoices;
    return invoices.filter((invoice) => {
      const fieldsToCheck = [invoice.id, invoice.user_code, invoice.subscription_id, invoice.status];
      return fieldsToCheck.some((value) => (value ? String(value).toLowerCase().includes(term) : false));
    });
  }, [invoices, searchTerm]);

  const toast: ToastState = useMemo(() => {
    if (!errorMessage) return null;
    return { severity: 'error', message: errorMessage };
  }, [errorMessage]);

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <PageHeader title={t('resources.tables.invoices')} subtitle={t('invoicesPage.description')} />
        <Typography variant="h5" style={{ display: 'none' }}>{t('resources.tables.invoices')}</Typography>
        <Typography color="text.secondary" variant="body2">
          Danh sách tất cả invoices đang tồn tại trong hệ thống theo modal backend
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            pt: 1,
          }}
        >
          <TextField
            label="Invoice ID / User code"
            size="small"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            sx={{ minWidth: 260, flex: '1 1 260px' }}
          />
          <Button size="small" variant="contained">
            Import invoices
          </Button>
        </Box>
      </Stack>

      {toast && toast.severity && (
        <Alert severity={toast.severity} sx={{ mb: 2 }}>
          {toast.message}
        </Alert>
      )}

      {!isLoading && filteredInvoices.length === 0 && !isError && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          Không tồn tại invoices. Vui lòng kiểm tra lại dữ liệu phía server.
        </Alert>
      )}

      <SoftDataGrid
        rows={filteredInvoices}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.id}
        skeletonRowCount={6}
        maxHeight={360}
      />

    </Box>
  );
};
