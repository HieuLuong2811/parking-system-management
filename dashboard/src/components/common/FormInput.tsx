import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

type FormInputProps = {
  label: string;
  name: string;
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
  name,
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
      padding: '15px 12px',
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
      <Typography
        id={`${name}-label`}
        htmlFor={name}
        variant="body2"
        component="label"
        className="required-label"
      >
        {label} {required && <span className="required-icon" style={{ color: '#d32f2f'}}>*</span>}
      </Typography>

      <Box className="input-wrapper">
        {multiline ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            rows={minRows}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        ) : (
          <input
            id={name}
            name={name}
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
