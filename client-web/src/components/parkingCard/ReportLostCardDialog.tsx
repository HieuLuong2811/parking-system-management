import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ReportLostCardDialog({
  open,
  busy,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t("presentCard.reportLostTitle", {
          defaultValue: "Xác nhận báo mất thẻ",
        })}
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ color: "#334155", lineHeight: 1.6, mt: 0.5 }}>
          {t("presentCard.reportLostMessage", {
            defaultValue:
              "Sau khi báo mất, thẻ hiện tại có thể không còn được sử dụng để ra / vào bãi gửi xe. Bạn có chắc chắn muốn tiếp tục?",
          })}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={Boolean(busy)}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {t("common.button.cancel", { defaultValue: "Huỷ" })}
        </Button>

        <Button
          onClick={onConfirm}
          disabled={Boolean(busy)}
          variant="contained"
          color="error"
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {t("parkingCards.actions.reportLost", {
            defaultValue: "Thông báo mất thẻ",
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

