import React from 'react';
import { Stack, Typography } from '@mui/material';

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
};

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h5">{title}</Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
};

