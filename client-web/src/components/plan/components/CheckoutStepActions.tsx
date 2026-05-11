import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
  activeStep: number;
  onBack: () => void;
  onPrimary: () => void;
  disabled: boolean;
  label: string;
  processingError?: string | null;
  t?: any;
};

export default function CheckoutStepActions({
  activeStep,
  onBack,
  onPrimary,
  disabled,
  label,
  processingError,
}: Props) {
  const { t } = useTranslation();
  return (
    <Box className="checkout-step-actions">
      <Box sx={{ flex: "1 1 auto" }} />

      <Button variant="contained" onClick={onBack} disabled={activeStep === 0}>
        {t("common.button.back")}
      </Button>

      <Button variant="contained" onClick={onPrimary} disabled={disabled}>
        {label}
      </Button>

      {processingError && (
        <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
          {processingError}
        </Typography>
      )}
    </Box>
  );
}

export {};
