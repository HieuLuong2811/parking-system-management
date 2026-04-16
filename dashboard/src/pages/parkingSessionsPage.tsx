import React, { useCallback, useMemo, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { useParkingSessionSearch } from '../api/parkingSessions';
import type { ParkingSessionRecord } from '../api/types';
import { formatDateTime } from '../ultis/format';

const statusOptions = ['ALL', 'ACTIVE', 'DONE'];

const columns: GridColDef<ParkingSessionRecord>[] = [
  { field: 'id', headerName: 'Session ID', width: 220, sortable: true },
  { field: 'vehicle_id', headerName: 'Vehicle ID', width: 200, sortable: true },
  { field: 'license_plate', headerName: 'License plate', width: 200, sortable: true },
  { field: 'status', headerName: 'Status', width: 140 },
  { field: 'user_type', headerName: 'User type', width: 160, sortable: true },
  {
    field: 'check_in_time',
    headerName: 'Check in',
    width: 200,
    sortable: true,
    renderCell: (params) => formatDateTime(params.value),
  },
  {
    field: 'check_out_time',
    headerName: 'Check out',
    width: 200,
    sortable: true,
    renderCell: (params) => formatDateTime(params.value),
  },
  {
    field: 'total_amount',
    headerName: 'Amount',
    width: 160,
    sortable: true,
    renderCell: (params) =>
      params.value ? params.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-',
  },
];

export const ParkingSessionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { t } = useTranslation();

  const filters = useMemo(
    () => ({
      query: searchTerm,
      status: statusFilter === 'ALL' ? undefined : (statusFilter as 'ACTIVE' | 'DONE'),
    }),
    [searchTerm, statusFilter]
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('ALL');
  }, []);

  const { data = [], isLoading, isError } = useParkingSessionSearch(filters);

  const searchKeys = useMemo(
    () => (row: ParkingSessionRecord) => [row.id, row.vehicle_id, row.license_plate, row.status, row.user_type],
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
      title="Parking sessions"
      description="Danh sách phiên gửi xe hiện có."
      columns={columns}
      rows={data}
      loading={isLoading}
      error={isError ? 'Error occurred while fetching parking sessions.' : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by session, vehicle or plate"
      searchKeys={searchKeys}
      emptyMessage="No parking sessions yet."
      getRowId={(row) => row.id}
      filterControls={filterControls}
      onClearFilters={handleClearFilters}
      clearLabel={t('button.clear', { defaultValue: 'Clear' })}
      maxHeight={520}
    />
  );
};
