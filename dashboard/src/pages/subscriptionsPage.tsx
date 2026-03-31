import React, { useMemo, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { useSubscriptionSearch } from '../api/subscriptions';
import type { SubscriptionSearchRow } from '../api/types';
import { formatCurrency } from '../ultis/format';

const statusOptions = ['ALL', 'ACTIVE', 'EXPIRED', 'SUSPENDED'];

const columns: GridColDef<SubscriptionSearchRow>[] = [
  { field: 'id', headerName: 'Subscription ID', width: 220, sortable: true },
  { field: 'user_code', headerName: 'User code', width: 180, sortable: true },
  {
    field: 'full_name',
    headerName: 'User name',
    width: 220,
    sortable: true,
    valueGetter: (params: { row: SubscriptionSearchRow }) => params.row.user?.full_name ?? '-',
  },
  {
    field: 'plan_name',
    headerName: 'Plan',
    width: 220,
    sortable: true,
    valueGetter: (params: { row: SubscriptionSearchRow }) => params.row.plan?.plan_name ?? '-',
  },
  {
    field: 'term_id',
    headerName: 'Term ID',
    width: 180,
    sortable: true,
  },
  {
    field: 'payment_plan',
    headerName: 'Payment plan',
    width: 220,
    sortable: true,
    valueGetter: (params: { row: SubscriptionSearchRow }) => params.row.payment_plan?.plan_name ?? '-',
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 140,
    sortable: true,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 160,
    sortable: true,
    renderCell: (params) => <span>{formatCurrency(params.value as number | null | undefined)}</span>,
  },
  {
    field: 'paid_amount',
    headerName: 'Paid',
    width: 140,
    sortable: true,
    renderCell: (params) => <span>{formatCurrency(params.value as number | null | undefined)}</span>,
  },
  {
    field: 'start_date',
    headerName: 'Start date',
    width: 170,
    sortable: true,
  },
  {
    field: 'end_date',
    headerName: 'End date',
    width: 170,
    sortable: true,
  },
];

export const SubscriptionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filters = useMemo(
    () => ({
      query: searchTerm,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
    [searchTerm, statusFilter]
  );

  const { data = [], isLoading, isError } = useSubscriptionSearch(filters);

  const searchKeys = useMemo(
    () => (row: SubscriptionSearchRow) => [
      row.id,
      row.user_code,
      row.user?.full_name,
      row.plan?.plan_name,
      row.payment_plan?.plan_name,
    ],
    []
  );

  const filterControls = (
    <FormControl size="small">
      <InputLabel>Status</InputLabel>
      <Select value={statusFilter} label="Status" onChange={(event: SelectChangeEvent<string>) => setStatusFilter(event.target.value)}>
        {statusOptions.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <ResourceTableLayout
      title="User subscriptions"
      description="Danh sách đăng ký của người dùng."
      columns={columns}
      rows={data}
      loading={isLoading}
      error={isError ? 'Error occurred while fetching subscriptions.' : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by user, plan or ID"
      searchKeys={searchKeys}
      emptyMessage="No subscriptions yet."
      getRowId={(row) => row.id}
      filterControls={filterControls}
      maxHeight={520}
    />
  );
};
