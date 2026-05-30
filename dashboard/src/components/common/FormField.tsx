import React from 'react';
import { Box, Typography } from '@mui/material';

export type FormFieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

export const FormField: React.FC<FormFieldProps> = ({ label, required = false, children }) => {
  return (
    <Box>
      <Typography variant="body2" component="label" className="required-label">
        {label} {required ? <span className="required-icon" style={{ color: '#d32f2f' }}>*</span> : null}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  );
};

