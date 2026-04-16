import React, { useMemo, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { useBillingEvents } from '../api/billingEvents';
import type { BillingEventLogRecord } from '../api/types';
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
  const { data = [], isLoading, isError, error } = useBillingEvents();

  const searchKeys = useMemo(
    () => (row: BillingEventLogRecord) => [row.id, row.user_code, row.subscription_id, row.event_type],
    []
  );

  return (
    <ResourceTableLayout
      title="Billing events"
      description="Theo dõi các sự kiện thanh toán."
      columns={columns}
      rows={data}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by event or user"
      searchKeys={searchKeys}
      emptyMessage="No billing events yet."
      getRowId={(row) => row.id}
      maxHeight={520}
    />
  );
};
