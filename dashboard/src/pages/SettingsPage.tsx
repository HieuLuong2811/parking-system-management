import { Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h5">{t('settingsPage.title')}</Typography>
      <Typography paragraph sx={{ mt: 2 }}>
        {t('settingsPage.description')}
      </Typography>
    </Box>
  );
};
