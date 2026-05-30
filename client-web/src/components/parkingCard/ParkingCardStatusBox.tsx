import {
  Box,
  Button,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Alert from "@mui/material/Alert";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ParkingAccessCard,
  useReportLostParkingAccessCard,
} from "../../api/parkingAccessCards";
import { getCardStatusColor, getCardStatusLabel } from "../../ultis/formatters";
import ReportLostCardDialog from "./ReportLostCardDialog";

type ParkingCardStatusBoxProps = {
  card?: ParkingAccessCard;
  onOpenRules: () => void;
};

export const ParkingCardStatusBox: React.FC<ParkingCardStatusBoxProps> = ({
  card,
  onOpenRules,
}) => {
  const { t } = useTranslation();

  const status = card?.status;
  const color = getCardStatusColor(status);

  const lostMutation = useReportLostParkingAccessCard();
  const busy = lostMutation.isPending;

  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({
    open: false,
    severity: "success",
    message: "",
  });

  const handleConfirmLost = async () => {
    if (!card) return;
    try {
      await lostMutation.mutateAsync(card.id);
      setLostDialogOpen(false);
      setToast({
        open: true,
        severity: "success",
        message: t("parkingCards.toast.lostReported", {
          defaultValue: "Đã báo mất thẻ.",
        }),
      });
    } catch (e) {
      setToast({
        open: true,
        severity: "error",
        message: e instanceof Error ? e.message : t("common.error"),
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          borderRadius: "18px",
          bgcolor: "#fff",
          border: "1px solid #eef2f7",
          p: 2,
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            {t("parkingCards.infoTitle", { defaultValue: "Thông tin thẻ" })}
          </Typography>

          <Tooltip
            title={t("presentCard.warning.title", {
              defaultValue: "Quy định sử dụng thẻ gửi xe sinh viên",
            })}
          >
            <IconButton
              size="small"
              onClick={onOpenRules}
              sx={{
                width: 34,
                height: 34,
                color: "#c2410c",
                bgcolor: "#fff7ed",
                border: "1px solid #fed7aa",
                "&:hover": {
                  bgcolor: "#ffedd5",
                },
              }}
            >
              <WarningAmberRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Stack spacing={1.25}>
          <StatusRow
            label={t("parkingCards.statusLabel", {
              defaultValue: "Trạng thái",
            })}
            value={getCardStatusLabel(status)}
            color={color}
          />

          <StatusRow
            label={t("parkingCards.cardCode", { defaultValue: "Mã thẻ" })}
            value={card?.barcode_token || "—"}
          />
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          onClick={onOpenRules}
          sx={{
            mt: 2,
            height: 40,
            borderRadius: "12px",
            borderColor: "#dbe7dd",
            color: "#0f172a",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": {
              borderColor: "#b7d7bd",
              bgcolor: "#f3f7f4",
            },
          }}
        >
          {t("presentCard.viewRules", { defaultValue: "Xem quy định sử dụng" })}
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="error"
          disabled={busy}
          onClick={() => setLostDialogOpen(true)}
          sx={{
            mt: 2,
            height: 42,
            borderRadius: "12px",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          {t("parkingCards.actions.reportLost", {
            defaultValue: "Thông báo mất thẻ",
          })}
        </Button>
      </Box>

      <ReportLostCardDialog
        open={lostDialogOpen}
        busy={busy}
        onClose={() => setLostDialogOpen(false)}
        onConfirm={() => void handleConfirmLost()}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((p) => ({ ...p, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

const StatusRow: React.FC<{
  label: string;
  value: string;
  color?: string;
}> = ({ label, value, color }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography sx={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          color: color || "#0f172a",
          fontWeight: 700,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};
