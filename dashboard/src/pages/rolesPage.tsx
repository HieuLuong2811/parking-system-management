import React, { useMemo } from 'react';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { useAdminRoles } from '../api/roles';
import type { RoleRecord } from '../api/types';
import { formatDateTime } from '../ultis/format';
import { PageHeader } from '../components/common/PageHeader';

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
  const { t } = useTranslation();
  const { data = [], isLoading, isError, error } = useAdminRoles();

  const filteredRows = useMemo(() => {
    return data;
  }, [data]);

  const errorMessage = useMemo(() => {
    if (!isError) return '';
    if (error instanceof Error) return error.message;
    return String(error ?? '');
  }, [error, isError]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PageHeader title={t('rolesPage.title')} subtitle={t('rolesPage.description')} />
      <Stack spacing={0.5} sx={{ display: 'none' }}>
        <Typography variant="h5">Roles</Typography>
        <Typography variant="body2" color="text.secondary">
          Danh sách vai trò và mã định danh.
        </Typography>
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
          emptyMessage={t('rolesPage.empty')}
        />
      </Paper>
    </Box>
  );
};
