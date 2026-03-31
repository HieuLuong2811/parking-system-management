import React, { useMemo, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { useAdminRoles } from '../api/roles';
import type { RoleRecord } from '../api/types';
import { formatTimestamp } from '../ultis/format';

const columns: GridColDef<RoleRecord>[] = [
  { field: 'id', headerName: 'Role ID', width: 220, sortable: true },
  { field: 'role_code', headerName: 'Code', width: 180, sortable: true },
  { field: 'role_name', headerName: 'Name', width: 260, sortable: true },
  {
    field: 'created_at',
    headerName: 'Created at',
    width: 220,
    sortable: true,
    valueGetter: (value, row) => formatTimestamp(row.created_at),
  },
];

export const RolesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data = [], isLoading, isError, error } = useAdminRoles();

  const searchKeys = useMemo(
    () => (row: RoleRecord) => [row.id, row.role_code, row.role_name],
    []
  );

  return (
    <ResourceTableLayout
      title="Roles"
      description="Danh sách vai trò và mã định danh."
      columns={columns}
      rows={data}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by code or name"
      searchKeys={searchKeys}
      emptyMessage="No roles configured yet."
      getRowId={(row) => row.id}
    />
  );
};
