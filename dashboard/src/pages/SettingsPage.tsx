import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/common/PageHeader';

export const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <PageHeader title={t('settingsPage.title')} subtitle={t('settingsPage.description')} />
    </Box>
  );
};
