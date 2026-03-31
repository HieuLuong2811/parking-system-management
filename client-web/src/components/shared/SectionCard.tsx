import { Card, CardContent, SxProps, Theme } from '@mui/material';
import React from 'react';

type SectionCardProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  className?: string;
};

export default function SectionCard({ children, sx, className }: SectionCardProps) {
  const classes = ['section-card'];
  if (className) {
    classes.push(className);
  }

  return (
    <Card className={classes.join(' ')} elevation={0} sx={{ ...sx }}>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
