import React, { useMemo, useState } from 'react';
import { type GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { useAdminVehicles } from '../api/vehicles';
import type { VehicleRecord } from '../api/types';
import { formatTimestamp } from '../ultis/format';

const columns: GridColDef<VehicleRecord>[] = [
  { field: 'id', headerName: 'Vehicle ID', width: 200, sortable: true },
  { field: 'user_code', headerName: 'User code', width: 160, sortable: true },
  { field: 'vehicle_type', headerName: 'Type', width: 160, sortable: true },
  { field: 'license_plate', headerName: 'License plate', width: 160, sortable: true },
  {
    field: 'qr_code',
    headerName: 'QR code',
    flex: 1,
    sortable: true,
    renderCell: (params) => (
      <span>{params.value ? String(params.value).slice(0, 64) : '-'}</span>
    ),
  },
  {
    field: 'is_active',
    headerName: 'Active',
    width: 120,
    sortable: true,
    renderCell: (params) => <span>{params.value ? 'Yes' : 'No'}</span>,
  },
  {
    field: 'created_at',
    headerName: 'Created at',
    width: 200,
    sortable: true,
    valueGetter: (value, row) => formatTimestamp(row.created_at),
  },
  {
    field: 'updated_at',
    headerName: 'Updated at',
    width: 200,
    sortable: true,
    valueGetter: (value, row) => formatTimestamp(row.updated_at),
  },
];

export const VehiclesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data = [], isLoading, isError, error } = useAdminVehicles();

  const searchKeys = useMemo(
    () => (row: VehicleRecord) => [
      row.id,
      row.user_code,
      row.license_plate,
      row.vehicle_type,
    ],
    []
  );

  return (
    <ResourceTableLayout
      title="Vehicles"
      description="Quản lý phương tiện đã đăng ký trong hệ thống."
      columns={columns}
      rows={data}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by id, code, plate"
      searchKeys={searchKeys}
      emptyMessage="No vehicles available."
      getRowId={(row) => row.id}
      maxHeight={420}
    />
  );
};
