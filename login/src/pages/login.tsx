import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import axios from "axios";

import {
  Role,
  VITE_CLIENT_WEB_URL,
  VITE_DASHBOARD_URL,
  AUTH_ME_URL,
} from "../constant/config";
import {
  getStoredLanguage,
  supportedLanguages,
  setStoredLanguage,
} from "../ultis/language";
import { loginTranslations } from "../translations/login";
import { RuleTranslations } from "../translations/rule";
import { FormInput } from "../components/FormInput";
import { languageOptions } from "../ultis/flags";
import { useLogin } from "../hooks/useLogin";

type Language = (typeof supportedLanguages)[number];

const appendCodeParam = (baseUrl: string, code: string) => {
  if (!baseUrl) return baseUrl;
  const sanitizedBase = baseUrl.trim();
  try {
    const url = typeof window !== "undefined"
      ? new URL(sanitizedBase, window.location.origin)
      : new URL(sanitizedBase);
    url.searchParams.set("code", code);
    return url.toString();
  } catch {
    const separator = sanitizedBase.includes("?") ? "&" : "?";
    return `${sanitizedBase}${separator}code=${encodeURIComponent(code)}`;
  }
};

const LoginPage: React.FC = () => {
  useEffect(() => {
    const redirectIfAuthenticated = async () => {
      try {
        const response = await axios.get(AUTH_ME_URL, { withCredentials: true });
        const roles = (response.data.roles || []).map((role: string) => role.toLowerCase());
        if (roles.includes(Role.ADMIN)) {
          window.location.href = VITE_DASHBOARD_URL;
        } else {
          window.location.href = VITE_CLIENT_WEB_URL;
        }
      } catch (error) {
        console.error('Check auth failed:', error);
      }
    };

    redirectIfAuthenticated();
  }, []);

  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  const [usercode, setUsercode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{
    usercode?: string;
    password?: string;
  }>({});

  const { mutate, isPending } = useLogin();

  const t = useMemo(
    () => (key: string) => loginTranslations[language][key] ?? key,
    [language],
  );

  const tRule = useMemo(
    () => (key: string) => RuleTranslations[language][key] ?? key,
    [language],
  );

  const handleLanguageChange = useCallback(
    (event: SelectChangeEvent<Language>) => {
      const lang = event.target.value as Language;
      setLanguage(lang);
      setStoredLanguage(lang);
    },
    [],
  );

  const handleLogin = async (usercode: string, password: string) => {
    const requiredUsercode = t("login.required-first.usercode");
    const requiredPassword = t("login.required-first.password");

    const requiredMessage = tRule("login.rule.required-field");
    const nextFieldErrors: typeof fieldErrors = {};
    if (!usercode) {
      nextFieldErrors.usercode = [requiredUsercode, requiredMessage].join(" ");
    }
    if (!password) {
      nextFieldErrors.password = [requiredPassword, requiredMessage].join(" ");
    }

    if (nextFieldErrors.usercode || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors);
      setError("");
      return;
    }

    setFieldErrors({});
    setError("");

    const resolveLoginErrorMessage = (err: unknown) => {
      if (!axios.isAxiosError(err)) {
        return err instanceof Error ? err.message : t("login.error.invalid");
      }

      // Network / CORS / no response
      if (!err.response) {
        return t("login.error.network");
      }

      const status = err.response.status;
      if (status === 401 || status === 400) return t("login.error.invalid");
      if (status === 404) return t("login.error.notFound");
      if (status >= 500) return t("login.error.server");
      return t("login.error.invalid");
    };

    try {
      mutate(
        { user_code: usercode, password },
        {
          onSuccess: (data) => {
          if (!data.code) {
            setError(t("login.error.invalid"));
            return;
          }
          const role = (data.roles || []).map((r) => r.toLowerCase());
          if (role.includes(Role.ADMIN)) {
            window.location.href = appendCodeParam(VITE_DASHBOARD_URL, data.code);
          } else {
            window.location.href = appendCodeParam(VITE_CLIENT_WEB_URL, data.code);
          }
        },
        onError: (error) => {
          setError(resolveLoginErrorMessage(error));
        },
        }
      );
    } catch (error) {
      setFieldErrors({});
      setError(resolveLoginErrorMessage(error));
    }
  };

  const handleChange = (field: "usercode" | "password", setter: (v: string) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);

      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
  };

  return (
    <Box className="login-shell">
      <Box className="login-card">
        <Box className="login-grid">
          <Box className="login-gradient">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box component="img" src="/Logo.png" alt={t("login.logo-alt")} />
              <Typography className="login-gradient-title" variant="h6">
                {t("login.subtitle")}
              </Typography>
            </Box>
            <Typography className="login-gradient-title" variant="h4">
              {t("login.title")}
            </Typography>
            <Typography className="login-gradient-description">
              {t("login.description")}
            </Typography>
            <Box className="login-gap" />
            <Typography variant="subtitle1" color="rgba(255,255,255,0.6)">
              {t("login.subtitle")} — 2026
            </Typography>
          </Box>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(usercode, password);
            }}
            noValidate
            className="login-form"
          >
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#0c1f4b", textAlign: "center" }}>
              {t("login.form-title")}
            </Typography>
            {error && (
              <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert severity="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              </Snackbar>
            )}

            <FormInput
              label={t("login.usercode")}
              required
              value={usercode}
              onChange={handleChange("usercode", setUsercode)}
              error={fieldErrors.usercode}
              disabled={isPending}
            />

            <FormInput
              label={t("login.password")}
              type="password"
              required
              value={password}
              onChange={handleChange("password", setPassword)}
              error={fieldErrors.password}
              disabled={isPending}
            />

            <Button
              variant="contained"
              type="submit"
              size="large"
              disabled={isPending}
              sx={{ mt: 1, borderRadius: 2, width: "100%" }}
              className="auth-button"
            >
              {isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                t("login.button")
              )}
            </Button>
            <Typography
              className="login-footer-link"
              variant="body2"
              component="a"
              href="#"
            >
              {t("login.forgot-password")}
            </Typography>
            <FormControl
              fullWidth
              variant="standard"
              className="login-language"
            >
              <InputLabel id="language-select-label">
                {t("login.language-label")}
              </InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                onChange={handleLanguageChange}
                disabled={isPending}
                label={t("login.language-label")}
              >
                {languageOptions.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box component="img" src={lang.flag} alt={lang.name} sx={{ width: 20, height: 14, objectFit: "cover" }}/>
                      {lang.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
