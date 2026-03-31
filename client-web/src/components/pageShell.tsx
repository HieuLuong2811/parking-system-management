import { Box, Button, Stack, Typography } from '@mui/material';
import React from 'react';

export type SectionLink = {
  id: string;
  label: string;
  description: string;
};

type PageShellProps = {
  title?: string;
  subtitle?: string;
  sections: SectionLink[];
  activeSection: string;
  onSectionChange: (value: string) => void;
  children: React.ReactNode;
};

export default function PageShell({ title, subtitle, sections, activeSection, onSectionChange, children }: PageShellProps) {
  return (
    <Box className="page-shell">
      <Box className="page-hero">
        <Box>
          {title && (
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} className="section-picker" flexWrap="wrap">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onSectionChange(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </Stack>
      </Box>
      <Box className="page-content">{children}</Box>
    </Box>
  );
}
