import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { SoftDataGrid } from '../components/common/SoftDataGrid';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { ParkingSessionAdminRow } from '../api/types';
import { formatCurrency, formatDateTime } from '../ultis/format';
import { useParkingSessionsPaginated } from '../api/parkingSessions';

const pad2 = (value: number) => String(value).padStart(2, '0');
const toLocalDateTimeInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

type TimePreset = 'CUSTOM' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS';

export const ParkingSessionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [userCode, setUserCode] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [status, setStatus] = useState('');
  const [timePreset, setTimePreset] = useState<TimePreset>('CUSTOM');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const dQuery = useDebouncedValue(query, 400);
  const dUserCode = useDebouncedValue(userCode, 400);
  const dVehicleType = useDebouncedValue(vehicleType, 400);
  const dStatus = useDebouncedValue(status, 200);
  const dFromTime = useDebouncedValue(fromTime, 400);
  const dToTime = useDebouncedValue(toTime, 400);

  const filters = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      query: dQuery.trim() || undefined,
      user_code: dUserCode.trim() || undefined,
      vehicle_type: dVehicleType || undefined,
      status: (dStatus || undefined) as 'ACTIVE' | 'DONE' | undefined,
      from_time: dFromTime || undefined,
      to_time: dToTime || undefined,
    }),
    [dFromTime, dQuery, dStatus, dToTime, dUserCode, dVehicleType, page, rowsPerPage]
  );

  const { data: paginated, isLoading, isError } = useParkingSessionsPaginated(filters);
  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const columns = useMemo<GridColDef<ParkingSessionAdminRow>[]>(() => {
    return [
      {
        field: 'user_code',
        headerName: 'User',
        minWidth: 220,
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <Stack spacing={0.25}>
            <Typography variant="subtitle2">
              {params.row.user_full_name ?? params.row.user_code ?? '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.user_code ?? 'Guest'}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'license_plate',
        headerName: 'Vehicle',
        minWidth: 200,
        sortable: false,
        renderCell: (params) => (
          <Stack spacing={0.25}>
            <Typography variant="subtitle2">{params.row.license_plate ?? '—'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.vehicle_type ?? '—'}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'check_in_time',
        headerName: 'Check in',
        minWidth: 180,
        renderCell: (p) => <span>{formatDateTime(p.value)}</span>,
      },
      {
        field: 'check_out_time',
        headerName: 'Check out',
        minWidth: 180,
        renderCell: (p) => <span>{formatDateTime(p.value)}</span>,
      },
      {
        field: 'duration',
        headerName: 'Duration',
        minWidth: 140,
        sortable: false,
        renderCell: (params) => {
          const start = params.row.check_in_time ? new Date(params.row.check_in_time) : null;
          const end = params.row.check_out_time ? new Date(params.row.check_out_time) : null;
          if (!start || Number.isNaN(start.getTime())) return <span>—</span>;
          if (!end || Number.isNaN(end.getTime())) return <span>Running</span>;
          const seconds = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          return <span>{hours ? `${hours}h ${minutes}m` : `${minutes}m`}</span>;
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.status}
            color={params.row.status === 'ACTIVE' ? 'success' : 'default'}
          />
        ),
      },
      {
        field: 'total_amount',
        headerName: 'Amount',
        minWidth: 140,
        sortable: false,
        renderCell: (params) => <span>{formatCurrency(params.row.total_amount)}</span>,
      },
      { field: 'id', headerName: 'Session ID', minWidth: 220 },
    ];
  }, []);

  const handleClearFilters = () => {
    setQuery('');
    setUserCode('');
    setVehicleType('');
    setStatus('');
    setTimePreset('CUSTOM');
    setFromTime('');
    setToTime('');
    setPage(0);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="h5">{t('parkingSessionsPage.title')}</Typography>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
        <TextField
          size="small"
          label={t('parkingSessionsPage.search.label')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
        <TextField
          size="small"
          label={t('parkingSessionsPage.search.userCode')}
          value={userCode}
          onChange={(e) => {
            setUserCode(e.target.value);
            setPage(0);
          }}
        />
        <TextField
          select
          size="small"
          label={t('parkingSessionsPage.search.vehicleType')}
          value={vehicleType}
          onChange={(e) => {
            setVehicleType(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="MOTORBIKE">Motorbike</MenuItem>
          <MenuItem value="BICYCLE">Bicycle</MenuItem>
          <MenuItem value="ELECTRIC_BICYCLE">Electric bicycle</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="DONE">Done</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Time range"
          value={timePreset}
          onChange={(e) => {
            const next = e.target.value as TimePreset;
            setTimePreset(next);
            setPage(0);

            const now = new Date();
            if (next === 'CUSTOM') return;

            const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

            if (next === 'TODAY') {
              setFromTime(toLocalDateTimeInputValue(startOfDay(now)));
              setToTime(toLocalDateTimeInputValue(endOfDay(now)));
              return;
            }
            if (next === 'YESTERDAY') {
              const yesterday = new Date(now);
              yesterday.setDate(now.getDate() - 1);
              setFromTime(toLocalDateTimeInputValue(startOfDay(yesterday)));
              setToTime(toLocalDateTimeInputValue(endOfDay(yesterday)));
              return;
            }
            if (next === 'LAST_7_DAYS') {
              const from = new Date(now);
              from.setDate(now.getDate() - 6);
              setFromTime(toLocalDateTimeInputValue(startOfDay(from)));
              setToTime(toLocalDateTimeInputValue(endOfDay(now)));
            }
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="CUSTOM">Custom</MenuItem>
          <MenuItem value="TODAY">Today</MenuItem>
          <MenuItem value="YESTERDAY">Yesterday</MenuItem>
          <MenuItem value="LAST_7_DAYS">Last 7 days</MenuItem>
        </TextField>

        <TextField
          size="small"
          label="From"
          type="datetime-local"
          value={fromTime}
          onChange={(e) => {
            setFromTime(e.target.value);
            setTimePreset('CUSTOM');
            setPage(0);
          }}
          inputProps={{ step: 1 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="To"
          type="datetime-local"
          value={toTime}
          onChange={(e) => {
            setToTime(e.target.value);
            setTimePreset('CUSTOM');
            setPage(0);
          }}
          inputProps={{ step: 1 }}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" size="small" onClick={handleClearFilters}>
          {t('button.clear')}
        </Button>
      </Stack>

      {isError && (
        <Alert severity="error">
          {t('parkingSessionsPage.error', { defaultValue: 'Could not load parking sessions.' })}
        </Alert>
      )}

      <Paper elevation={0}>
        <SoftDataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => (row as ParkingSessionAdminRow).id}
          maxHeight={520}
          emptyMessage="No parking sessions yet."
        />
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
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
        />
      </Paper>
    </Box>
  );
};
