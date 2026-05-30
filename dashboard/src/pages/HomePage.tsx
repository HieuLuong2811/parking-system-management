import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../contexts/useAuth';
import { PageHeader } from '../components/common/PageHeader';
import { DashboardSummaryCards } from '../components/dashboard/DashboardSummaryCards';
import { DashboardChartsSection } from '../components/dashboard/DashboardChartsSection';
import { DashboardRecentSection } from '../components/dashboard/DashboardRecentSection';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const displayName = user?.full_name ?? t('home.fallbackName', { defaultValue: 'Admin' });

  return (
    <Box sx={{ height: '100%' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <PageHeader
            title={t('home.title', { defaultValue: 'Trang chủ quản trị' })}
          />
          <Typography color="text.secondary">
            {t('home.description', {
              name: displayName,
              defaultValue: `Chào mừng ${displayName}, đây là khu vực tổng quan giúp bạn theo dõi tình hình vận hành.`,
            })}
          </Typography>
        </Box>

        <Chip
          label={t('home.liveData', { defaultValue: 'Dữ liệu thống kê' })}
          color="success"
          variant="outlined"
        />
      </Stack>

      <Stack spacing={3}>
        <DashboardSummaryCards />
        <DashboardChartsSection />
        <DashboardRecentSection />
      </Stack>
    </Box>
  );
};