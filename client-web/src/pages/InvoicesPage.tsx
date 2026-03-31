import {
  Box,
  Chip,
  Divider,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionCard from '../components/shared/SectionCard';
import { useInvoices } from '../api/invoices';

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { data: invoices = [], isLoading, isError } = useInvoices();

  const theme = useTheme();

  const filteredInvoices = useMemo(() => {
    return invoices
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .filter((invoice) => {
        const issued = new Date(invoice.created_at);
        if (fromDate && new Date(fromDate) > issued) return false;
        if (toDate && new Date(toDate) < issued) return false;
        return true;
      });
  }, [fromDate, invoices, toDate]);

  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, filteredInvoices.length]);

  const pageSize = 5;
  const [page, setPage] = useState(1);
  const pageInvoices = filteredInvoices.slice((page - 1) * pageSize, page * pageSize);

  return (
    <SectionCard>
      <Typography variant="subtitle2" className="section-label">
        {t('invoices.sectionTitle')}
      </Typography>

      <Stack spacing={1}>
        <Typography variant="h5">{t('invoices.headerTitle')}</Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mt: 3, mb: 2 }}
        flexWrap="wrap"
        alignItems="center"
      >
        <TextField
          label={t('invoices.filters.from')}
          type="datetime-local"
          value={fromDate}
          onChange={(event) => setFromDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 230 }}
          disabled={isLoading || isError}
        />
        <TextField
          label={t('invoices.filters.to')}
          type="datetime-local"
          value={toDate}
          onChange={(event) => setToDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 230 }}
          disabled={isLoading || isError}
        />
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        {t('invoices.resultsTitle')}
      </Typography>

      <Stack spacing={2}>
          {filteredInvoices.length === 0 ? (
            <Typography color="text.secondary">{t('invoices.empty')}</Typography>
          ) : (
            <>
              <TableContainer className="invoice-table-container" component={Box} sx={{ borderRadius: 3 }}>
                {isLoading ? (
                  <SectionCard>
                    <Typography>{t('invoices.loading')}</Typography>
                  </SectionCard>
                ) : isError ? (
                  <SectionCard>
                    <Typography color="error">{t('invoices.error')}</Typography>
                  </SectionCard>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('invoices.table.invoiceId')}</TableCell>
                          <TableCell>{t('invoices.table.period')}</TableCell>
                          <TableCell>{t('invoices.table.issuedOn')}</TableCell>
                          <TableCell>{t('invoices.table.dueOn')}</TableCell>
                          <TableCell align="right">{t('invoices.table.amount')}</TableCell>
                          <TableCell align="right">{t('invoices.table.status')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pageInvoices.map((invoice) => {
                          const dueAt = typeof invoice.metadata?.due_at === 'string' ? invoice.metadata.due_at : undefined;
                          const period = typeof invoice.metadata?.period === 'string' ? invoice.metadata.period : '';
                          const statusKey =
                            invoice.status === 'PAID'
                              ? 'paid'
                              : invoice.status === 'PENDING'
                              ? 'pending'
                              : 'overdue';
                          const chipColor =
                            invoice.status === 'PAID'
                              ? 'success'
                              : invoice.status === 'PENDING'
                              ? 'warning'
                              : 'error';
                          return (
                            <TableRow key={invoice.id} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{invoice.id}</TableCell>
                              <TableCell>{period || t('plan.notChosen')}</TableCell>
                              <TableCell>
                                {new Date(invoice.created_at).toLocaleString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </TableCell>
                              <TableCell>
                                {dueAt
                                  ? new Date(dueAt).toLocaleString(undefined, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : t('sessions.notProvided')}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                  invoice.amount
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={t(`invoices.status.${statusKey}`)}
                                  color={chipColor}
                                  size="small"
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )
                }
              </TableContainer>
              {filteredInvoices.length > pageSize && (
                <Box display="flex" justifyContent="center" mt={1}>
                  <Pagination
                    color="primary"
                    count={Math.ceil(filteredInvoices.length / pageSize)}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: theme.palette.text.primary,
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Stack>
      </SectionCard>
    );
}
