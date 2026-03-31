import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUsers } from '../api/users';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { data: users = [], isLoading, isError } = useUsers();

  if (isLoading) {
    return (
      <Box className="profile-page-shell">
        <Typography>{t('profile.loading')}</Typography>
      </Box>
    );
  }

  const profile = users[0];

  if (isError || !profile) {
    return (
      <Box className="profile-page-shell">
        <Typography color="error">{t('profile.sectionTitle')}</Typography>
      </Box>
    );
  }

  return (
    <Box className="profile-page-shell">
      <Box className="profile-page-layout">
        <Box className="profile-card profile-main-card">
          <Typography variant="overline" className="section-label">
            {t('profile.sectionTitle')}
          </Typography>
          <Typography variant="h4">{profile.full_name}</Typography>
          <Typography variant="body2">{t('profile.tagline', { id: profile.user_code })}</Typography>
          <Stack spacing={0.75} marginTop={2}>
            <Typography className="plan-detail">Email: {profile.email}</Typography>
            <Typography className="plan-detail">{t('profile.planLabel')} {profile.language_use ?? '—'}</Typography>
            <Typography className="plan-detail">
              Trạng thái: {profile.is_active ? 'Đang hoạt động' : 'Đã khoá'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} marginTop={3}>
            <Button variant="contained">{t('profile.update')}</Button>
            <Button variant="outlined">{t('profile.download')}</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
