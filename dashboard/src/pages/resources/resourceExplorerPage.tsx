import React from 'react';
import { Box, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ResourceId } from '../../types/admin';

interface ResourceExplorerPageProps {
  resourceId: ResourceId;
}

export const ResourceExplorerPage: React.FC<ResourceExplorerPageProps> = ({ resourceId }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Alert severity="info" sx={{ maxWidth: 640 }}>
        {t('resource.underConstruction', { resource: resourceId })}
      </Alert>
    </Box>
  );
};
