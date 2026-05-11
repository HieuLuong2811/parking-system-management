import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Box, Typography } from "@mui/material";
import { DEFAULT_PASSWORD_RULES } from "../../utils/passwordRules";
import type { TFunction } from "i18next";

interface Props {
  password: string;
  t: TFunction;
  type_width?: boolean;
}

const ALLOWED_SPECIAL_CHARS = "!@#$%^&*()_-+=[]{}?/|";
const ALLOWED_PASSWORD_REGEX = /^[A-Za-z0-9!@#$%^&*()_\-+=\[\]{}?/|]*$/;

export default function PasswordChecklist({ password, t, type_width }: Props) {
  const checklistRules = [
    {
      key: "uppercase",
      text: String(
        t("validation.passwordRule.uppercase", {
          defaultValue: "Ít nhất 1 chữ cái viết hoa (A-Z)",
        }),
      ),
      valid: /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      text: String(
        t("validation.passwordRule.lowercase", {
          defaultValue: "Ít nhất 1 chữ cái viết thường (a-z)",
        }),
      ),
      valid: /[a-z]/.test(password),
    },
    {
      key: "number",
      text: String(
        t("validation.passwordRule.number", {
          defaultValue: "Ít nhất 1 số (0-9)",
        }),
      ),
      valid: /\d/.test(password),
    },
    {
      key: "special",
      text: String(
        t("validation.passwordRule.special", {
          defaultValue: "Ít nhất 1 ký tự đặc biệt",
        }),
      ),
      valid: /[!@#$%^&*()_\-+=\[\]{}?/|]/.test(password),
    },
    {
      key: "allowed-special",
      text: String(
        t("validation.passwordRule.allowedSpecial", {
          chars: ALLOWED_SPECIAL_CHARS,
          defaultValue: `Ký tự cho phép: ${ALLOWED_SPECIAL_CHARS}`,
        }),
      ),
      valid: password.length > 0 && ALLOWED_PASSWORD_REGEX.test(password),
    },
    {
      key: "min-length",
      text: String(
        t("validation.passwordRule.min", {
          min: DEFAULT_PASSWORD_RULES.min,
          defaultValue: `Ít nhất ${DEFAULT_PASSWORD_RULES.min} ký tự`,
        }),
      ),
      valid: password.length >= DEFAULT_PASSWORD_RULES.min,
    },
    {
      key: "max-length",
      text: String(
        t("validation.passwordRule.max", {
          max: DEFAULT_PASSWORD_RULES.max,
          defaultValue: `Tối đa ${DEFAULT_PASSWORD_RULES.max} ký tự`,
        }),
      ),
      valid: password.length <= DEFAULT_PASSWORD_RULES.max,
    },
  ];

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: type_width ? "max-content" : "100%",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        pt: 1,
        zIndex: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {checklistRules.map((rule) => (
        <Box
          key={rule.key}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1,
            mb: 0.5,
          }}
        >
          {rule.valid ? (
            <CheckCircleIcon
              style={{ color: "#28a745", fontSize: 12, paddingBottom: 1 }}
            />
          ) : (
            <CancelIcon
              style={{ color: "#ff0000", fontSize: 12, paddingBottom: 1 }}
            />
          )}

          <Typography
            sx={{
              fontSize: "13px",
              color: rule.valid ? "#28a745" : "#555",
              fontWeight: rule.valid ? 600 : 400,
            }}
          >
            {rule.text}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}