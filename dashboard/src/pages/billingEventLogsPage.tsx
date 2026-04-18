import React, { useMemo, useState } from 'react';
import { TablePagination } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
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

  const searchKeys = useMemo(
    () => (row: BillingEventLogRecord) => [row.id, row.user_code, row.subscription_id, row.event_type],
    []
  );

  return (
    <ResourceTableLayout
      title="Billing events"
      description="Theo dõi các sự kiện thanh toán."
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={(value) => {
        setSearchTerm(value);
        setPage(0);
      }}
      searchPlaceholder="Search by event or user"
      searchKeys={searchKeys}
      emptyMessage="No billing events yet."
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
