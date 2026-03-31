import React, { useMemo, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { useAdminSubscriptionPlans } from '../api/subscriptionPlans';
import type { SubscriptionPlanRecord } from '../api/types';
import { formatCurrency, formatTimestamp } from '../ultis/format';

const columns: GridColDef<SubscriptionPlanRecord>[] = [
  { field: 'id', headerName: 'Plan ID', width: 220, sortable: true },
  { field: 'plan_name', headerName: 'Plan name', width: 240, sortable: true },
  {
    field: 'price_per_day',
    headerName: 'Price/day',
    width: 160,
    sortable: true,
    renderCell: (params) => <span>{formatCurrency(params.value as number)}</span>,
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 1,
    sortable: false,
    renderCell: (params) => <span>{params.value ?? '-'}</span>,
  },
  {
    field: 'deleted_at',
    headerName: 'Deleted at',
    width: 200,
    sortable: true,
    valueGetter: (value, row) => formatTimestamp(row.deleted_at),
  },
];

export const SubscriptionPlansPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data = [], isLoading, isError, error } = useAdminSubscriptionPlans();

  const searchKeys = useMemo(
    () => (row: SubscriptionPlanRecord) => [row.id, row.plan_name],
    []
  );

  return (
    <ResourceTableLayout
      title="Subscription plans"
      description="Danh sách gói đăng ký hiện có."
      columns={columns}
      rows={data}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by plan name or id"
      searchKeys={searchKeys}
      emptyMessage="No plans defined yet."
      getRowId={(row) => row.id}
    />
  );
};
