import React from 'react';
import { Box, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ResourceId } from '../../types/admin';
import { PageHeader } from '../../components/common/PageHeader';

interface ResourceExplorerPageProps {
  resourceId: ResourceId;
}

export const ResourceExplorerPage: React.FC<ResourceExplorerPageProps> = ({ resourceId }) => {
  const { t } = useTranslation();
  const subtitle = t('resource.underConstruction', { resource: resourceId });
  const title = t(`resources.tables.${resourceId}`, { defaultValue: String(resourceId) });

  return (
    <Box>
      <PageHeader title={title} subtitle={subtitle} />
      <Alert severity="info" sx={{ maxWidth: 640 }}>
        {subtitle}
      </Alert>
    </Box>
  );
};
