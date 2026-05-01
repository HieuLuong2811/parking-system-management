import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';

export type FormInputProps = {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  autoComplete?: string;
  name?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  requiredMarkerClassName?: string;
  requiredFirst?: string;
};

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  required = false,
  type = 'text',
  value,
  onChange,
  error,
  disabled = false,
  readOnly = false,
  placeholder,
  autoComplete,
  name,
  containerClassName,
  labelClassName,
  inputClassName = 'plain-input',
  requiredMarkerClassName,
  requiredFirst,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const resolvedType = useMemo(() => {
    if (!isPassword) return type;
    return showPassword ? 'text' : 'password';
  }, [isPassword, showPassword, type]);

  return (
    <Box className={containerClassName}>
      <Typography component="label" htmlFor={id} className={labelClassName}>
        {label}{' '}
        {required && (
          <span className={requiredMarkerClassName ?? undefined} aria-hidden="true">
            *
          </span>
        )}
      </Typography>

      <Box className="input-wrapper">
        <input
          id={id}
          name={name}
          type={resolvedType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          data-required-first={requiredFirst}
          className={`${inputClassName}${error ? ' input-error' : ''}`}
        />

        {isPassword && (
          <span
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setShowPassword((prev) => !prev);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </span>
        )}
      </Box>

      {error && (
        <span id={`${id}-error`} className="required-error-msg">
          {error}
        </span>
      )}
    </Box>
  );
};
