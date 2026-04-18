import React, { useMemo, useState } from 'react';
import { TablePagination } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { usePaymentTransactions } from '../api/paymentTransactions';
import type { PaginatedResponse, PaymentTransactionRecord } from '../api/types';
import { formatDateTime } from '../ultis/format';

const columns: GridColDef<PaymentTransactionRecord>[] = [
  { field: 'id', headerName: 'Transaction ID', width: 220, sortable: true },
  { field: 'invoice_id', headerName: 'Invoice ID', width: 220, sortable: true },
  {
    field: 'attempt_number',
    headerName: 'Attempt',
    width: 140,
    sortable: true,
  },
  {
    field: 'transaction_code',
    headerName: 'Code',
    width: 240,
    sortable: true,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 160,
    sortable: true,
  },
  {
    field: 'response_message',
    headerName: 'Response',
    flex: 1,
    sortable: false,
    renderCell: (params) => <span>{params.value ?? '-'}</span>,
  },
  {
    field: 'created_at',
    headerName: 'Created at',
    width: 200,
    sortable: true,
    valueGetter: (_value, row) => formatDateTime(row.created_at),
  },
];

export const PaymentTransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data: paginated, isLoading, isError, error } = usePaymentTransactions({
    search: searchTerm || undefined,
    page: page + 1,
    limit: rowsPerPage,
  }) as unknown as {
    data: PaginatedResponse<PaymentTransactionRecord> | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const searchKeys = useMemo(
    () => (row: PaymentTransactionRecord) => [row.id, row.invoice_id, row.transaction_code, row.status],
    []
  );

  return (
    <ResourceTableLayout
      title="Payment transactions"
      description="History of payment attempts for invoices."
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={(value) => {
        setSearchTerm(value);
        setPage(0);
      }}
      searchPlaceholder="Search by invoice or code"
      searchKeys={searchKeys}
      emptyMessage="No payment transactions yet."
      getRowId={(row) => row.id}
      maxHeight={520}
      footer={
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
      }
    />
  );
};
