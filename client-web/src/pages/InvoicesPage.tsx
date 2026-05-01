import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionCard from '../components/shared/SectionCard';
import { useInvoicesPaginated } from '../api/invoices';
import { invoices_status } from '../constant/config';
import { useCreateMomoPaymentForInvoice } from '../api/momo';

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { data: paginated, isLoading, isError } = useInvoicesPaginated({
    page: page + 1,
    limit: rowsPerPage,
    from_time: fromDate || undefined,
    to_time: toDate || undefined,
  });
  const invoices = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;
  const momoPaymentMutation = useCreateMomoPaymentForInvoice();
  const [payError, setPayError] = useState<string | null>(null);

  const theme = useTheme();

  useEffect(() => {
    setPage(0);
  }, [fromDate, toDate]);

  const handlePayInvoice = async (invoiceId: string) => {
    setPayError(null);
    try {
      const response = await momoPaymentMutation.mutateAsync({
        invoiceId,
        payload: {
          redirectUrl: `${window.location.origin}/profile`,
        },
      });
      const redirectUrl =
        (response.payUrl as string | undefined) ||
        (response.deeplink as string | undefined) ||
        (response.shortLink as string | undefined) ||
        (response.qrCodeUrl as string | undefined) ||
        (response.deeplinkWebInApp as string | undefined) ||
        (response.deeplinkMiniApp as string | undefined);
      if (!redirectUrl) {
        throw new Error(t('invoices.actions.momoMissingUrl'));
      }
      window.location.href = redirectUrl;
    } catch (error) {
      setPayError(error instanceof Error ? error.message : t('common.error'));
    }
  };

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
        {payError ? <Typography color="error">{payError}</Typography> : null}
        <TableContainer className="invoice-table-container" component={Box} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('invoices.table.invoiceId')}</TableCell>
                <TableCell>{t('invoices.table.created_at')}</TableCell>
                <TableCell align="right">{t('invoices.table.amount')}</TableCell>
                <TableCell align="right">{t('invoices.table.status')}</TableCell>
                <TableCell align="right">{t('invoices.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography>{t('invoices.loading')}</Typography>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="error">{t('invoices.error')}</Typography>
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{t('invoices.empty')}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                            const invoices_paid = invoices_status.PAID;
                            const invoices_pending = invoices_status.PENDING;
                            const isMomoPayable =
                              invoice.status === invoices_pending && invoice.payment_method === 'MOMO';
                            const statusKey =
                              invoice.status === invoices_paid
                                ? 'paid'
                                : invoice.status === invoices_pending
                                  ? 'pending'
                                  : 'overdue';
                            const chipColor =
                              invoice.status === invoices_paid
                                ? 'success'
                                : invoice.status === invoices_pending
                                  ? 'warning'
                                  : 'error';
                            return (
                              <TableRow key={invoice.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{invoice.id}</TableCell>
                                <TableCell>
                                  {new Date(invoice.created_at).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
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
                                <TableCell align="right">
                                  {isMomoPayable ? (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      color="warning"
                                      onClick={() => handlePayInvoice(invoice.id)}
                                      disabled={momoPaymentMutation.isPending}
                                      startIcon={momoPaymentMutation.isPending ? <CircularProgress size={14} /> : null}
                                    >
                                      {t('invoices.actions.payWithMomo')}
                                    </Button>
                                  ) : (
                                    <Typography color="text.secondary">—</Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
          sx={{
            '& .MuiTablePagination-toolbar': { justifyContent: 'flex-end' },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: theme.palette.text.secondary,
            },
          }}
        />
      </Stack>
      </SectionCard>
    );
}
