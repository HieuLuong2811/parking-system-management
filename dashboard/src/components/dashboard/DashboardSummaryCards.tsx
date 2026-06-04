import React, { useMemo } from 'react';
import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  ConfirmationNumber,
  DirectionsBike,
  EventBusy,
  LocalAtm,
  ReceiptLong,
  ShowChart,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material';

import { useDashboardSummary } from '../../api/statistics';

const metricIconMap: Record<string, React.ReactNode> = {
  vehiclesInParking: <DirectionsBike fontSize="large" />,
  todayCheckins: <TrendingUp fontSize="large" />,
  todayCheckouts: <TrendingDown fontSize="large" />,
  todayRevenue: <LocalAtm fontSize="large" />,
  monthlyRevenue: <LocalAtm fontSize="large" />,
  pendingInvoices: <ReceiptLong fontSize="large" />,
  activeSubscriptionUsers: <ConfirmationNumber fontSize="large" />,
  expiringSubscriptions: <EventBusy fontSize="large" />,
};

const metricColorMap: Record<string, string> = {
  vehiclesInParking: '#22c55e',
  todayCheckins: '#0ea5e9',
  todayCheckouts: '#f97316',
  todayRevenue: '#7c3aed',
  monthlyRevenue: '#0f766e',
  pendingInvoices: '#dc2626',
  activeSubscriptionUsers: '#16a34a',
  expiringSubscriptions: '#e11d48',
};

const formatShortNumber = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
};

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
}) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      overflow: 'hidden',
      borderColor: `${accent}55`,
      height: '100%',
    }}
  >
    <Box sx={{ height: 4, bgcolor: accent }} />
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${accent}14`,
            color: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export const DashboardSummaryCards: React.FC = () => {
  const { data, isLoading, isError } = useDashboardSummary();
  const { t } = useTranslation();

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'vehiclesInParking',
        title: t('home.cards.vehiclesInParking.title', { defaultValue: 'Vehicles in parking' }),
        value: data.vehicles_in_parking.toLocaleString('vi-VN'),
        subtitle: t('home.cards.vehiclesInParking.subtitle', { defaultValue: 'Open parking sessions' }),
      },
      {
        key: 'todayCheckins',
        title: t('home.cards.todayCheckins.title', { defaultValue: 'Today check-ins' }),
        value: data.today_checkins.toLocaleString('vi-VN'),
        subtitle: t('home.cards.todayCheckins.subtitle', { defaultValue: 'By check-in time' }),
      },
      {
        key: 'todayCheckouts',
        title: t('home.cards.todayCheckouts.title', { defaultValue: 'Today check-outs' }),
        value: data.today_checkouts.toLocaleString('vi-VN'),
        subtitle: t('home.cards.todayCheckouts.subtitle', { defaultValue: 'By check-out time' }),
      },
      {
        key: 'todayRevenue',
        title: t('home.cards.todayRevenue.title', { defaultValue: 'Today revenue' }),
        value: formatShortNumber(data.today_revenue),
        subtitle: t('home.cards.todayRevenue.subtitle', { defaultValue: 'Paid invoices today' }),
      },
      {
        key: 'monthlyRevenue',
        title: t('home.cards.monthlyRevenue.title', { defaultValue: 'This month revenue' }),
        value: formatShortNumber(data.monthly_revenue),
        subtitle: t('home.cards.monthlyRevenue.subtitle', { defaultValue: 'Paid invoices' }),
      },
      {
        key: 'pendingInvoices',
        title: t('home.cards.pendingInvoices.title', { defaultValue: 'Pending invoices' }),
        value: data.pending_invoices.toLocaleString('vi-VN'),
        subtitle: t('home.cards.pendingInvoices.subtitle', { defaultValue: 'Invoice PENDING' }),
      },
      {
        key: 'activeSubscriptionUsers',
        title: t('home.cards.activeSubscriptionUsers.title', { defaultValue: 'Active subscriptions' }),
        value: data.active_subscription_users.toLocaleString('vi-VN'),
        subtitle: t('home.cards.activeSubscriptionUsers.subtitle', { defaultValue: 'Users with active subscriptions' }),
      },
      {
        key: 'expiringSubscriptions',
        title: t('home.cards.expiringSubscriptions.title', { defaultValue: 'Expiring subscriptions' }),
        value: data.expiring_subscriptions.toLocaleString('vi-VN'),
        subtitle: t('home.cards.expiringSubscriptions.subtitle', { defaultValue: 'Expiring in 7 days' }),
      },
    ];
  }, [data, t]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">{t('home.errors.summaryLoadFailed', { defaultValue: 'Unable to load summary data.' })}</Alert>;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
    >
      {cards.map((card) => {
        const accent = metricColorMap[card.key] ?? '#2563eb';
        return (
          <MetricCard
            key={card.key}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            accent={accent}
            icon={metricIconMap[card.key] ?? <ShowChart fontSize="large" />}
          />
        );
      })}
    </Box>
  );
};
