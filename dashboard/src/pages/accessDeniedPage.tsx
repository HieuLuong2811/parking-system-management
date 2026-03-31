import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AccessDeniedPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', minWidth: 320 }}>
          <Typography variant="h5" gutterBottom>
            {t('accessDenied.title')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('accessDenied.description')}
          </Typography>
          <Button variant="contained" component={RouterLink} to="/" sx={{ mr: 1 }}>
            {t('accessDenied.backToHome')}
          </Button>
          <Button variant="text" component={RouterLink} to="/users">
            {t('accessDenied.viewUsers')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
