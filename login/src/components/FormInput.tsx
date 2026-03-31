import { Box, Typography } from "@mui/material";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type FormInputProps = {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
};

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <Box>
      <Typography component="label" className="required-label">
        {label} {required && <span className="required-icon">*</span>}
      </Typography>

      <Box className="input-wrapper">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`auth-input ${error ? "input-error" : ""}`}
        />

        {isPassword && (
          <span
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <VisibilityOff fontSize="small" focusable /> : <Visibility fontSize="small" />}
          </span>
        )}
      </Box>

      {error && <Typography className="auth-error">{error}</Typography>}
    </Box>
  );
};