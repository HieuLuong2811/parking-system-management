import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Popover,
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
import { formatCurrency, formatDateTime, toLocalDateTimeInputValue } from '../ultis/format';
import { useParkingSessionsPaginated } from '../api/parkingSessions';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { userTypes, vehicleTypeOptions } from '../constant/config';

type TimePreset = 'CUSTOM' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS';

type ParkingSessionsFiltersState = {
  userCode: string;
  vehicleType: string;
  status: string;
};

type ParkingSessionsTimeState = {
  preset: TimePreset;
  from: string;
  to: string;
};

export const ParkingSessionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ParkingSessionsFiltersState>({
    userCode: '',
    vehicleType: '',
    status: '',
  });
  const [time, setTime] = useState<ParkingSessionsTimeState>({
    preset: 'CUSTOM',
    from: '',
    to: '',
  });
  const [timeRangeAnchorEl, setTimeRangeAnchorEl] = useState<HTMLElement | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const updateFilters = (updater: (prev: ParkingSessionsFiltersState) => ParkingSessionsFiltersState) => {
    setFilters((prev) => updater(prev));
    setPage(0);
  };

  const updateTime = (updater: (prev: ParkingSessionsTimeState) => ParkingSessionsTimeState) => {
    setTime((prev) => updater(prev));
    setPage(0);
  };

  const debouncedFields = useDebouncedValue(
    {
      userCode: filters.userCode,
      vehicleType: filters.vehicleType,
      status: filters.status,
      from: time.from,
      to: time.to,
    },
    400
  );

  const queryFilters = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      user_code: debouncedFields.userCode.trim() || undefined,
      vehicle_type: debouncedFields.vehicleType || undefined,
      status: (debouncedFields.status || undefined) as 'ACTIVE' | 'DONE' | undefined,
      from_time: debouncedFields.from || undefined,
      to_time: debouncedFields.to || undefined,
    }),
    [debouncedFields, page, rowsPerPage]
  );

  const { data: paginated, isLoading, isError } = useParkingSessionsPaginated(queryFilters);
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
        renderCell: (params) => {
          const userType = String(params.row.user_type || '').toUpperCase();
          const isGuess = userType === userTypes.GUEST || !params.row.user_code;

          if (isGuess) {
            return (
              <Stack spacing={0.25}>
                <Typography variant="subtitle2">
                  GUESS
                </Typography>
              </Stack>
            );
          }

          return (
            <Stack spacing={0.25}>
              <Typography variant="subtitle2">
                {params.row.user_full_name ?? params.row.user_code ?? '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.user_code ?? '-'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'vehicle_type',
        headerName: 'Vehicle type',
        minWidth: 160,
        sortable: false,
        renderCell: (params) => <span>{params.row.vehicle_type ?? '-'}</span>,
      },
      {
        field: 'license_plate',
        headerName: 'License plate',
        minWidth: 160,
        sortable: false,
        renderCell: (params) => <span>{params.row.license_plate === '' ? '-' : params.row.license_plate}</span>,
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
    ];
  }, []);

  const handleClearFilters = () => {
    setFilters({ userCode: '', vehicleType: '', status: '' });
    setTime({ preset: 'CUSTOM', from: '', to: '' });
    setTimeRangeAnchorEl(null);
    setPage(0);
  };

  const timeRangeDisplay = useMemo(() => {
    const presetLabel =
      time.preset === 'TODAY'
        ? 'Today'
        : time.preset === 'YESTERDAY'
          ? 'Yesterday'
          : time.preset === 'LAST_7_DAYS'
            ? 'Last 7 days'
            : 'Custom';
    if (time.preset !== 'CUSTOM') return presetLabel;
    if (!time.from && !time.to) return presetLabel;
    const fromLabel = time.from ? formatDateTime(time.from) : '-';
    const toLabel = time.to ? formatDateTime(time.to) : '-';
    return `${fromLabel} → ${toLabel}`;
  }, [time.from, time.preset, time.to]);

  const applyTimePreset = (next: TimePreset) => {
    const now = new Date();
    if (next === 'CUSTOM') {
      updateTime((prev) => ({ ...prev, preset: 'CUSTOM' }));
      return;
    }

    const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    if (next === 'TODAY') {
      updateTime(() => ({
        preset: 'TODAY',
        from: toLocalDateTimeInputValue(startOfDay(now)),
        to: toLocalDateTimeInputValue(endOfDay(now)),
      }));
      return;
    }
    if (next === 'YESTERDAY') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      updateTime(() => ({
        preset: 'YESTERDAY',
        from: toLocalDateTimeInputValue(startOfDay(yesterday)),
        to: toLocalDateTimeInputValue(endOfDay(yesterday)),
      }));
      return;
    }
    if (next === 'LAST_7_DAYS') {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      updateTime(() => ({
        preset: 'LAST_7_DAYS',
        from: toLocalDateTimeInputValue(startOfDay(from)),
        to: toLocalDateTimeInputValue(endOfDay(now)),
      }));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="h5">{t('parkingSessionsPage.title')}</Typography>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <FilterListIcon color="action" />
          <Typography variant="body2">{t('common.filters.search')}</Typography>
        </Box>
        <TextField
          size="small"
          label={t('parkingSessionsPage.search.userCode')}
          value={filters.userCode}
          onChange={(e) => {
            updateFilters((prev) => ({ ...prev, userCode: e.target.value }));
          }}
        />
        <TextField
          select
          size="small"
          label={t('parkingSessionsPage.search.vehicleType')}
          value={filters.vehicleType}
          onChange={(e) => {
            updateFilters((prev) => ({ ...prev, vehicleType: e.target.value }));
          }}
          sx={{ minWidth: 170 }}
        >
          {Object.keys(vehicleTypeOptions).map((option) => (
            <MenuItem key={option} value={option}>
              {t(`comon.vehicleTypeOptions.${option}`, { defaultValue: option })}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => {
            updateFilters((prev) => ({ ...prev, status: e.target.value }));
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="DONE">Done</MenuItem>
        </TextField>

        <TextField
          size="small"
          label={t('parkingSessionsPage.search.timeRange', { defaultValue: 'Search time range' })}
          value={timeRangeDisplay}
          onClick={(event) => setTimeRangeAnchorEl(event.currentTarget)}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <KeyboardArrowDownIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 260 }}
        />

        <Popover
          open={Boolean(timeRangeAnchorEl)}
          anchorEl={timeRangeAnchorEl}
          onClose={() => setTimeRangeAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <Box sx={{ p: 2, maxWidth: 'calc(100vw - 32px)' }}>
            <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
              <TextField
                select
                size="small"
                label="Time range"
                value={time.preset}
                onChange={(e) => applyTimePreset(e.target.value as TimePreset)}
                sx={{ minWidth: 180 }}
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
                value={time.from}
                onChange={(e) => {
                  updateTime((prev) => ({ ...prev, preset: 'CUSTOM', from: e.target.value }));
                }}
                inputProps={{ step: 1 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                label="To"
                type="datetime-local"
                value={time.to}
                onChange={(e) => {
                  updateTime((prev) => ({ ...prev, preset: 'CUSTOM', to: e.target.value }));
                }}
                inputProps={{ step: 1 }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>
        </Popover>
        <Button variant="text" onClick={handleClearFilters}>
          {t('common.filters.reset')}
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
