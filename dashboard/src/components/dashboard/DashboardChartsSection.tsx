import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';

import { useDashboardCharts } from '../../api/statistics';
import { formatCurrency } from '../../ultis/format';

const pieColors = ['#16a34a', '#f97316', '#2563eb', '#dc2626', '#7c3aed'];

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

const formatShortNumber = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
};

const EmptyChart = ({ text }: { text: string }) => (
  <Box
    sx={{
      height: 260,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'text.secondary',
    }}
  >
    <Typography variant="body2">{text}</Typography>
  </Box>
);

export const DashboardChartsSection: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useDashboardCharts();

  const formatInvoiceStatus = (value: React.ReactNode) =>
    t(`home.status.invoice.${String(value)}`, { defaultValue: String(value) });

  const formatSubscriptionStatus = (value: React.ReactNode) =>
    t(`home.status.subscription.${String(value)}`, { defaultValue: String(value) });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return <Alert severity="error">Không thể tải dữ liệu biểu đồ.</Alert>;
  }

  const hasSubscriptionAdoption = data.subscription_adoption.some((item) => Number(item.value) > 0);
  const hasMonthlySubscriptions = data.monthly_subscriptions.some((item) => Number(item.new_subscriptions) > 0);
  const hasMonthlyRevenue = data.monthly_revenue.some((item) => Number(item.revenue) > 0);
  const hasMonthlyParkingSessions = data.monthly_parking_sessions.some((item) => Number(item.sessions) > 0);

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tỷ lệ người dùng đăng ký vé gửi xe
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              So sánh người dùng đã đăng ký và chưa đăng ký vé gửi xe
            </Typography>

            {hasSubscriptionAdoption ? (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.subscription_adoption}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={4}
                      label
                    >
                      {data.subscription_adoption.map((_entry, index) => (
                        <Cell key={index} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <EmptyChart text="Chưa có dữ liệu đăng ký vé gửi xe." />
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Đăng ký vé gửi xe theo tháng
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Số lượng vé gửi xe được tạo mới trong 12 tháng gần nhất
            </Typography>

            {hasMonthlySubscriptions ? (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthly_subscriptions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="new_subscriptions"
                      name="vé gửi xe đăng ký mới"
                      stroke="#7c3aed"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <EmptyChart text="Chưa có dữ liệu đăng ký theo tháng." />
            )}
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Doanh thu theo tháng
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Doanh thu từ các hóa đơn đã thanh toán trong 12 tháng gần nhất
            </Typography>

            {hasMonthlyRevenue ? (
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthly_revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value: unknown) => formatShortNumber(Number(value))} />
                    <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      stroke="#0f766e"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <EmptyChart text="Chưa có dữ liệu doanh thu." />
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Lượt gửi xe theo tháng
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Số phiên gửi xe được tạo theo thời gian check-in
            </Typography>

            {hasMonthlyParkingSessions ? (
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthly_parking_sessions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      name="Lượt gửi xe"
                      stroke="#ea580c"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <EmptyChart text="Chưa có dữ liệu phiên gửi xe." />
            )}
          </CardContent>
        </Card>
      </Box>

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
              {t('home.charts.invoiceStatusTitle', { defaultValue: 'Trạng thái hóa đơn' })}
            </Typography>
            <Box sx={{ height: 280, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.invoice_status_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" tickFormatter={formatInvoiceStatus} />
                  <YAxis allowDecimals={false} />
                  <Tooltip labelFormatter={formatInvoiceStatus} />
                  <Bar dataKey="count" name={t('home.charts.invoiceCount', { defaultValue: 'Số hóa đơn' })} radius={[8, 8, 0, 0]}>
                    {data.invoice_status_distribution.map((entry, index) => (
                      <Cell key={index} fill={statusColorMap[entry.status] ?? '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('home.charts.subscriptionStatusTitle', { defaultValue: 'Trạng thái vé gửi xe đăng ký' })}
            </Typography>
            <Box sx={{ height: 280, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subscription_status_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" tickFormatter={formatSubscriptionStatus} />
                  <YAxis allowDecimals={false} />
                  <Tooltip labelFormatter={formatSubscriptionStatus} />
                  <Bar dataKey="count" name={t('home.charts.subscriptionCount', { defaultValue: 'Số vé gửi xe' })} radius={[8, 8, 0, 0]}>
                    {data.subscription_status_distribution.map((entry, index) => (
                      <Cell key={index} fill={statusColorMap[entry.status] ?? '#7c3aed'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
