import React, { useMemo, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { usePaymentTransactions } from '../api/paymentTransactions';
import type { PaymentTransactionRecord } from '../api/types';
import { formatTimestamp } from '../ultis/format';

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
    valueGetter: (value, row) => formatTimestamp(row.created_at),
  },
];

export const PaymentTransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data = [], isLoading, isError, error } = usePaymentTransactions();

  const searchKeys = useMemo(
    () => (row: PaymentTransactionRecord) => [row.id, row.invoice_id, row.transaction_code, row.status],
    []
  );

  return (
    <ResourceTableLayout
      title="Payment transactions"
      description="History of payment attempts for invoices."
      columns={columns}
      rows={data}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by invoice or code"
      searchKeys={searchKeys}
      emptyMessage="No payment transactions yet."
      getRowId={(row) => row.id}
      maxHeight={520}
    />
  );
};
