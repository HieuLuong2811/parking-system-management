import {
  Box,
  Button,
  Chip,
  Pagination,
  Paper,
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
import { useParkingSessions } from '../api/parking_sessions';
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
  const { data: sessions = [], isLoading, isError } = useParkingSessions();

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

  const tableColumns = ['vehicle', 'checkIn', 'checkOut', 'status', 'amount'];

  const filtered = useMemo(() => {
    return sessions.filter((session) => {
      const checkIn = session.check_in_time ? new Date(session.check_in_time) : null;
      if (fromDate && checkIn && new Date(fromDate) > checkIn) return false;
      if (toDate && checkIn && new Date(toDate) < checkIn) return false;
      const keyword = debouncedQuery.trim().toLowerCase();
      if (keyword) {
        const text = `${session.license_plate ?? ''} ${session.vehicle_id}`.toLowerCase();
        if (!text.includes(keyword)) return false;
      }
      return true;
    });
  }, [fromDate, toDate, debouncedQuery, sessions]);

  const pageSize = 5;
  const pagedSessions = filtered.slice((page - 1) * pageSize, page * pageSize);

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
      </Stack>

      {filtered.length === 0 ? (
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
                  {filtered.length === 0 && (
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
          {filtered.length > pageSize && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={Math.ceil(filtered.length / pageSize)}
                page={page}
                color="primary"
                onChange={(_, value) => setPage(value)}
                sx={{ '& .MuiPaginationItem-root': { minWidth: 32 } }}
              />
            </Box>
          )}
        </>
      )}

    </SectionCard>
  );
}
