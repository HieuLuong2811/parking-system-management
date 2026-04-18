import React, { useMemo, useState } from 'react';
import { TablePagination } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ResourceTableLayout } from '../components/resource/resourceTableLayout';
import { useVehicles } from '../api/vehicles';
import type { PaginatedResponse, VehicleRecord } from '../api/types';
import { formatDateTime } from '../ultis/format';

export const VehiclesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data: paginated, isLoading, isError, error } = useVehicles({
    search: searchTerm || undefined,
    page: page + 1,
    limit: rowsPerPage,
  }) as unknown as { data: PaginatedResponse<VehicleRecord> | undefined; isLoading: boolean; isError: boolean; error: unknown };
  const { t } = useTranslation();

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const columns = useMemo<GridColDef<VehicleRecord>[]>(
    () => [
      { field: 'id', headerName: t('vehiclesPage.columns.id'), width: 200, sortable: true },
      { field: 'user_code', headerName: t('vehiclesPage.columns.userCode'), width: 160, sortable: true },
      { field: 'vehicle_type', headerName: t('vehiclesPage.columns.type'), width: 160, sortable: true },
      { field: 'license_plate', headerName: t('vehiclesPage.columns.licensePlate'), width: 160, sortable: true },
      {
        field: 'qr_code',
        headerName: t('vehiclesPage.columns.qrCode'),
        flex: 1,
        sortable: true,
        renderCell: (params) => <span>{params.value ? String(params.value).slice(0, 64) : '-'}</span>,
      },
      {
        field: 'status',
        headerName: t('vehiclesPage.columns.status'),
        width: 140,
        sortable: true,
        valueGetter: (__value, row) => (row.deleted_at ? 'deleted' : 'active'),
        renderCell: (params) => (
          <span>{params.value === 'active' ? t('vehiclesPage.status.active') : t('vehiclesPage.status.deleted')}</span>
        ),
      },
      {
        field: 'created_at',
        headerName: t('vehiclesPage.columns.createdAt'),
        width: 200,
        sortable: true,
        renderCell: (params) => formatDateTime(params.row.created_at),
      },
      {
        field: 'updated_at',
        headerName: t('vehiclesPage.columns.updatedAt'),
        width: 200,
        sortable: true,
        renderCell: (params) => formatDateTime(params.row.updated_at),
      },
    ],
    [t]
  );

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
      title={t('vehiclesPage.title')}
      description={t('vehiclesPage.description')}
      columns={columns}
      rows={rows}
      loading={isLoading}
      error={isError ? error : undefined}
      searchTerm={searchTerm}
      onSearchChange={(value) => {
        setSearchTerm(value);
        setPage(0);
      }}
      searchPlaceholder={t('vehiclesPage.searchPlaceholder')}
      searchKeys={searchKeys}
      emptyMessage={t('vehiclesPage.empty')}
      getRowId={(row) => row.id}
      maxHeight={420}
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
