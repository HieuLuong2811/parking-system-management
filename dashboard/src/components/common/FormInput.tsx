import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

type FormInputProps = {
  label: string;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  multiline?: boolean;
  minRows?: number;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  pattern?: string;
  maxLength?: number;
};

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required = false,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  multiline = false,
  minRows = 3,
  placeholder,
  inputMode,
  pattern,
  maxLength,
}) => {

  const inputStyle = useMemo<React.CSSProperties>(
    () => ({
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${error ? '#d32f2f' : '#ccc'}`,
      borderRadius: 6,
      fontSize: 14,
      outline: 'none',
      background: disabled ? '#f6f7f9' : '#fff',
    }),
    [disabled, error]
  );

  return (
    <Box>
      <Typography variant="body2" component="label" sx={{ display: 'block', mb: 0.75 }}>
        {label}
        {required && (
          <Typography component="span" color="error" sx={{ ml: 0.25, fontWeight: 700 }}>
            *
          </Typography>
        )}
      </Typography>

      <Box sx={{ position: 'relative' }}>
        {multiline ? (
          <textarea
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            rows={minRows}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        ) : (
          <input
            type={'text'}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            inputMode={inputMode}
            pattern={pattern}
            maxLength={maxLength}
            style={inputStyle}
          />
        )}

      </Box>

      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
