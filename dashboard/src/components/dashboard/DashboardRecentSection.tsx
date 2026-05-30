import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { useDashboardRecent } from '../../api/statistics';
import { formatCurrency, formatDateTime } from '../../ultis/format';

const statusColorMap: Record<string, string> = {
  ACTIVE: '#16a34a',
  PENDING: '#f97316',
  PAID: '#16a34a',
  FAILED: '#dc2626',
  CANCELED: '#64748b',
  CANCELLED: '#64748b',
  EXPIRED: '#f97316',
  SUSPENDED: '#7c3aed',
  OVERDUE: '#dc2626',
  PAYMENT_DUE: '#eab308',
};

export const DashboardRecentSection: React.FC = () => {
  const { data, isLoading, isError } = useDashboardRecent();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return <Alert severity="error">Không thể tải dữ liệu gần đây.</Alert>;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 2,
      }}
    >
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Hóa đơn gần đây
          </Typography>
          <Typography variant="body2" color="text.secondary">
            5 hóa đơn mới nhất trong hệ thống
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {data.invoices.length ? (
              data.invoices.map((invoice) => (
                <Paper key={invoice.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {invoice.user_full_name ?? invoice.user_code ?? '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(invoice.created_at)}
                      </Typography>
                    </Box>

                    <Box textAlign="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(invoice.amount)}
                      </Typography>
                      <Chip
                        size="small"
                        label={invoice.status}
                        sx={{
                          mt: 0.5,
                          bgcolor: `${statusColorMap[invoice.status] ?? '#64748b'}22`,
                          color: statusColorMap[invoice.status] ?? '#64748b',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Chưa có hóa đơn gần đây.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Phiên gửi xe gần đây
          </Typography>
          <Typography variant="body2" color="text.secondary">
            5 phiên gửi xe mới nhất theo thời gian check-in
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {data.sessions.length ? (
              data.sessions.map((session) => (
                <Paper key={session.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {session.user_full_name ?? session.user_code ?? 'Khách'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(session.license_plate || 'Không biển số')}{' '}
                        • {formatDateTime(session.check_in_time)}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={session.status}
                      sx={{
                        bgcolor: `${statusColorMap[session.status] ?? '#64748b'}22`,
                        color: statusColorMap[session.status] ?? '#64748b',
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Chưa có phiên gửi xe gần đây.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};