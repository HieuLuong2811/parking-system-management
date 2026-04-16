import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CalendarMonth, PeopleAlt, LocalAtm, ShowChart } from '@mui/icons-material';
import { useAuth } from '../contexts/useAuth';

const termOptions = ['Spring', 'Summer', 'Fall'];
const yearOptions = ['2023 - 2024', '2024 - 2025', '2025 - 2026'];
const statuses = ['All', 'Active', 'Expired'];

const summaryMetrics = [
  { key: 'activeUsers', value: '2,430', accent: '#1e88e5', icon: <PeopleAlt fontSize="large" /> },
  { key: 'revenue', value: '14.5B', accent: '#8e24aa', icon: <LocalAtm fontSize="large" /> },
  { key: 'sessions', value: '2,960', accent: '#f4511e', icon: <ShowChart fontSize="large" /> },
  { key: 'vehicles', value: '1,140', accent: '#43a047', icon: <CalendarMonth fontSize="large" /> },
];

const chartData = [
  { label: 'Week 1', value: 60 },
  { label: 'Week 2', value: 75 },
  { label: 'Week 3', value: 50 },
  { label: 'Week 4', value: 90 },
  { label: 'Week 5', value: 80 },
  { label: 'Week 6', value: 95 },
];

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const displayName = user?.full_name ?? t('home.fallbackName', { defaultValue: 'there' });
  const [term, setTerm] = useState(termOptions[0]);
  const [year, setYear] = useState(yearOptions[0]);
  const [status, setStatus] = useState(statuses[0]);
  const [search, setSearch] = useState('');

  const chartMax = useMemo(() => Math.max(...chartData.map((item) => item.value)), []);

  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t('home.description', {
          name: displayName,
          defaultValue: 'Welcome there, this overview section helps you reach the most important datasets fast.',
        })}
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {t('home.filters.title', { defaultValue: 'Quick filters' })}
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>{t('home.filters.termLabel', { defaultValue: 'Academic term' })}</InputLabel>
              <Select
                value={term}
                label={t('home.filters.termLabel', { defaultValue: 'Academic term' })}
                onChange={(event) => setTerm(event.target.value)}
              >
                {termOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('home.filters.yearLabel', { defaultValue: 'Academic year' })}</InputLabel>
              <Select
                value={year}
                label={t('home.filters.yearLabel', { defaultValue: 'Academic year' })}
                onChange={(event) => setYear(event.target.value)}
              >
                {yearOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('home.filters.statusLabel', { defaultValue: 'Status' })}</InputLabel>
              <Select
                value={status}
                label={t('home.filters.statusLabel', { defaultValue: 'Status' })}
                onChange={(event) => setStatus(event.target.value)}
              >
                {statuses.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('home.filters.searchLabel', { defaultValue: 'Search keyword' })}
              placeholder={t('home.filters.searchPlaceholder', {
                defaultValue: 'Student, vehicle, or invoice ID',
              })}
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {summaryMetrics.map((metric) => (
          <Card
            key={metric.key}
            variant="outlined"
            sx={{
              borderColor: metric.accent,
              position: 'relative',
              overflow: 'hidden',
              flex: '1 1 220px',
              minWidth: '220px',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="text.secondary">
                  {t(`home.cards.${metric.key}.title`, { defaultValue: metric.key })}
                </Typography>
                <Chip
                  label={t(`home.cards.${metric.key}.chip`, { defaultValue: 'Live' })}
                  size="small"
                  color="primary"
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                {metric.icon}
                <Box>
                  <Typography variant="h5">{metric.value}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(`home.cards.${metric.key}.subtitle`, { defaultValue: 'Overview' })}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Card
          variant="outlined"
          sx={{ flex: '1 1 420px', minWidth: '280px' }}
        >
          <CardContent>
            <Typography variant="h6">
              {t('home.charts.sessionTitle', { defaultValue: 'Sessions distribution' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('home.charts.sessionDescription', { defaultValue: 'Last 6 weeks' })}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 160 }}>
              {chartData.map((point) => (
                <Box key={point.label} sx={{ flex: 1, textAlign: 'center' }}>
                  <Box
                    sx={{
                      height: `${(point.value / chartMax) * 100}%`,
                      bgcolor: 'primary.main',
                      borderRadius: 2,
                      transition: 'height 0.3s',
                    }}
                  />
                  <Typography variant="caption" display="block">
                    {point.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
        <Card
          variant="outlined"
          sx={{ flex: '1 1 320px', minWidth: '260px' }}
        >
          <CardContent>
            <Typography variant="h6">
              {t('home.charts.revenueTitle', { defaultValue: 'Revenue overview' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('home.charts.revenueDescription', {
                defaultValue: 'Subscription revenue breakdown',
              })}
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {t('home.charts.revenueMetric.weekly', { defaultValue: 'Weekly snapshot' })}
                </Typography>
                <Typography variant="subtitle1">1.4B</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {t('home.charts.revenueMetric.monthly', { defaultValue: 'Monthly average' })}
                </Typography>
                <Typography variant="subtitle1">5.8B</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {t('home.charts.revenueMetric.yearly', { defaultValue: 'Yearly target' })}
                </Typography>
                <Typography variant="subtitle1">48B</Typography>
              </Box>
            </Stack>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('home.charts.revenueFooter', {
                  defaultValue: 'Conversion rate improved over the last quarter.',
                })}
              </Typography>
              <Box sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: '#e0e3ff' }}>
                <Box sx={{ width: '72%', height: '100%', borderRadius: 3, bgcolor: 'primary.main' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
