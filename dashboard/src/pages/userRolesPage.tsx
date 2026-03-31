import React, { useMemo, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { useAdminUserRoles } from '../api/userRoles';
import type { UserRoleRecord } from '../api/types';
import { formatTimestamp } from '../ultis/format';

const columns: GridColDef<UserRoleRecord>[] = [
  { field: 'id', headerName: 'Role link', width: 220, sortable: true },
  { field: 'user_code', headerName: 'User code', width: 180, sortable: true },
  { field: 'role_id', headerName: 'Role ID', width: 180, sortable: true },
  {
    field: 'created_at',
    headerName: 'Assigned at',
    width: 220,
    sortable: true,
    valueGetter: (value, row) => formatTimestamp(row.created_at),
  },
];

export const UserRolesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data = [], isLoading, isError, error } = useAdminUserRoles();

  const searchKeys = useMemo(
    () => (row: UserRoleRecord) => [row.id, row.user_code, row.role_id],
    []
  );

  return (
    <ResourceTableLayout
      title="User roles"
      description="Mối liên kết giữa người dùng và vai trò."
      columns={columns}
      rows={data}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by user or role"
      searchKeys={searchKeys}
      emptyMessage="No user roles assigned yet."
      getRowId={(row) => row.id}
    />
  );
};
