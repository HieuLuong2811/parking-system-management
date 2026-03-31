import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', minWidth: 320 }}>
          <Typography variant="h4" gutterBottom>
            {t('notFound.title')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('notFound.description')}
          </Typography>
          <Button variant="contained" component={RouterLink} to="/">
            {t('notFound.backToHome')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
