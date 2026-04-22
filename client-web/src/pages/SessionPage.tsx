import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Pagination,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionCard from '../components/shared/SectionCard';
import { exportMyParkingSessionsXlsx, useParkingSessions } from '../api/parking_sessions';
import useDebouncedValue from '../hooks/useDebouncedValue';

const formatDateValue = (value?: string | null) =>
  value ? new Date(value).toLocaleString('vi-VN', { hour12: false }) : null;

const currencyFormat = (amount?: number | null) =>
  amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '-';

const statusColor = (status?: string | null) => {
  switch (status) {
    case 'ACTIVE':
      return 'info';
    case 'DONE':
      return 'success';
    default:
      return 'default';
  }
};

export default function SessionPage() {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 420);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { data: paginated, isLoading, isError } = useParkingSessions({
    page,
    limit: pageSize,
    query: debouncedQuery.trim() || undefined,
    from_time: fromDate || undefined,
    to_time: toDate || undefined,
  });
  const sessions = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalPages = paginated?.total_pages ?? 0;

  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, debouncedQuery]);

  const filterFields = [
    { key: 'from', type: 'datetime-local', value: fromDate, setter: setFromDate },
    { key: 'to', type: 'datetime-local', value: toDate, setter: setToDate },
    {
      key: 'search',
      type: 'text',
      value: query,
      setter: setQuery,
      flex: 1,
      placeholder: t('sessions.filters.searchPlaceholder'),
    },
  ];

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setQuery('');
    setPage(1);
  };

  const [exportOpen, setExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState<'today' | 'last7' | 'custom'>('today');
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const formatLocalDateTime = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}`;
  };

  const openExportDialog = () => {
    setExportError(null);
    setExportBusy(false);
    setExportRange('today');
    setExportFrom(fromDate);
    setExportTo(toDate);
    setExportOpen(true);
  };

  const closeExportDialog = () => {
    if (exportBusy) return;
    setExportOpen(false);
  };

  const handleExport = async () => {
    setExportError(null);
    setExportBusy(true);
    try {
      const now = new Date();
      let resolvedFrom = exportFrom;
      let resolvedTo = exportTo;

      if (exportRange === 'today') {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        resolvedFrom = formatLocalDateTime(start);
        resolvedTo = formatLocalDateTime(now);
      } else if (exportRange === 'last7') {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        resolvedFrom = formatLocalDateTime(start);
        resolvedTo = formatLocalDateTime(now);
      } else if (exportRange === 'custom') {
        if (!resolvedFrom || !resolvedTo) {
          setExportError(t('common.error'));
          return;
        }
      }

      const { blob, filename } = await exportMyParkingSessionsXlsx({
        query: debouncedQuery.trim() || undefined,
        from_time: resolvedFrom || undefined,
        to_time: resolvedTo || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportOpen(false);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setExportBusy(false);
    }
  };

  const tableColumns = ['vehicle', 'checkIn', 'checkOut', 'status', 'amount'];

  const pagedSessions = useMemo(() => sessions, [sessions]);

  return (
    <SectionCard>
      <Typography variant="h5" gutterBottom>
        {t('sessions.sectionTitle')}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems="flex-end">
        {filterFields.map(({ key, type, value, setter, flex, placeholder }) => (
          <TextField
            key={key}
            label={t(`sessions.filters.${key}`)}
            type={type}
            value={value}
            onChange={(event) => setter(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={flex ? { flex } : undefined}
            placeholder={placeholder}
            disabled={isLoading || isError}
          />
        ))}
        <Button
          variant="outlined"
          color="primary"
          onClick={clearFilters}
          disabled={!fromDate && !toDate && !query}
          sx={{ height: 40, alignSelf: 'flex-start' }}
        >
          {t('sessions.filters.clear')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={openExportDialog}
          sx={{ height: 40, alignSelf: 'flex-start' }}
        >
          {t('sessions.actions.exportExcel', { defaultValue: 'Export Excel' })}
        </Button>
      </Stack>

      {pagedSessions.length === 0 ? (
        <Typography color="text.secondary">{t('sessions.empty')}</Typography>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0}>
            {isLoading ? (
              <SectionCard>
                <Typography>{t('sessions.loading')}</Typography>
              </SectionCard>
            ) : isError ? (
              <SectionCard>
                <Typography color="error">{t('sessions.error')}</Typography>
              </SectionCard>
            ) : (
              <Table>
                <TableHead>
                      <TableRow>
                        {tableColumns.map((column) => (
                          <TableCell key={column}>{t(`sessions.table.${column}`)}</TableCell>
                        ))}
                      </TableRow>
                </TableHead>
                <TableBody>
                  {pagedSessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">{t('sessions.empty')}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {pagedSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <Typography fontWeight={600}>{session.license_plate ?? session.vehicle_id}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('sessions.sessionId', { id: session.id })}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDateValue(session.check_in_time) ?? t('sessions.notProvided')}</TableCell>
                        <TableCell>{formatDateValue(session.check_out_time) ?? t('sessions.notProvided')}</TableCell>
                        <TableCell>
                          <Chip
                            label={session.status ?? t('sessions.statusUnknown')}
                            color={statusColor(session.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{currencyFormat(session.total_amount)}</TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                color="primary"
                onChange={(_, value) => setPage(value)}
                sx={{ '& .MuiPaginationItem-root': { minWidth: 32 } }}
              />
            </Box>
          )}
        </>
      )}

      <Dialog open={exportOpen} onClose={closeExportDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('sessions.actions.exportTitle', { defaultValue: 'Export check in/out history' })}</DialogTitle>
        <DialogContent>
          {exportError ? (
            <Typography color="error" sx={{ mb: 1 }}>
              {exportError}
            </Typography>
          ) : null}

          <FormControl component="fieldset" sx={{ mt: 1 }}>
            <FormLabel>{t('sessions.actions.rangeLabel', { defaultValue: 'Time range' })}</FormLabel>
            <RadioGroup
              value={exportRange}
              onChange={(event) => setExportRange(event.target.value as 'today' | 'last7' | 'custom')}
            >
              <FormControlLabel
                value="today"
                control={<Radio />}
                label={t('sessions.actions.today', { defaultValue: 'Today' })}
              />
              <FormControlLabel
                value="last7"
                control={<Radio />}
                label={t('sessions.actions.last7Days', { defaultValue: 'Last 7 days' })}
              />
              <FormControlLabel
                value="custom"
                control={<Radio />}
                label={t('sessions.actions.customRange', { defaultValue: 'Custom range' })}
              />
            </RadioGroup>
          </FormControl>

          {exportRange === 'custom' ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
              <TextField
                label={t('sessions.filters.from')}
                type="datetime-local"
                value={exportFrom}
                onChange={(event) => setExportFrom(event.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={exportBusy}
                sx={{ flex: 1 }}
              />
              <TextField
                label={t('sessions.filters.to')}
                type="datetime-local"
                value={exportTo}
                onChange={(event) => setExportTo(event.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={exportBusy}
                sx={{ flex: 1 }}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeExportDialog} disabled={exportBusy}>
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleExport} variant="contained" disabled={exportBusy}>
            {t('sessions.actions.export', { defaultValue: 'Export' })}
          </Button>
        </DialogActions>
      </Dialog>

    </SectionCard>
  );
}
