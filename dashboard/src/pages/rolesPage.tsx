import React, { useMemo, useState } from 'react';
import { Alert, Box, Paper, Stack, TextField, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { useAdminRoles } from '../api/roles';
import type { RoleRecord } from '../api/types';
import { formatDateTime } from '../ultis/format';

const columns: GridColDef<RoleRecord>[] = [
  { field: 'id', headerName: 'Role ID', width: 220, sortable: true },
  { field: 'role_code', headerName: 'Code', width: 180, sortable: true },
  {
    field: 'created_at',
    headerName: 'Created at',
    width: 220,
    sortable: true,
    renderCell: (params) => formatDateTime(params.row.created_at),
  },
];

export const RolesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data = [], isLoading, isError, error } = useAdminRoles();

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return data;
    return data.filter((row) => {
      const values = [row.id, row.role_code];
      return values.some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(normalizedSearch);
      });
    });
  }, [data, normalizedSearch]);

  const errorMessage = useMemo(() => {
    if (!isError) return '';
    if (error instanceof Error) return error.message;
    return String(error ?? '');
  }, [error, isError]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Roles</Typography>
        <Typography variant="body2" color="text.secondary">
          Danh sách vai trò và mã định danh.
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          value={searchTerm}
          label="Search"
          placeholder="Search by code"
          onChange={(event) => setSearchTerm(event.target.value)}
          sx={{ maxWidth: 420 }}
        />
      </Stack>

      {errorMessage && (
        <Alert severity="error" variant="filled">
          {errorMessage}
        </Alert>
      )}

      <Paper elevation={0}>
        <SoftDataGrid
          rows={filteredRows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => (row as RoleRecord).id}
          emptyMessage="No roles configured yet."
        />
      </Paper>
    </Box>
  );
};
