import { Alert, Box, Button, Snackbar, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useActivateParkingAccessCard,
  useMyParkingAccessCards,
} from "../../api/parkingAccessCards";
import { ParkingCardRulesDialog } from "../../components/parkingCard/ParkingCardRulesDialog";
import { ParkingCardStatusBox } from "../../components/parkingCard/ParkingCardStatusBox";
import { StudentParkingCard } from "../../components/parkingCard/StudentParkingCard";
import useModal from "../../hooks/useModal";
import { canActivateCard, PRIMARY } from "../../ultis/formatters";
import { parkingCardStatus } from "../../constant/config";

export const ParkingCardsPanel: React.FC = () => {
  const { t } = useTranslation();

  const {
    data: cards = [],
    isLoading,
    isError,
    refetch,
  } = useMyParkingAccessCards();

  const rulesModal = useModal(false);

  const activateMutation = useActivateParkingAccessCard();

  const [toast, setToast] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({
    open: false,
    severity: "success",
    message: "",
  });

  const busy = activateMutation.isPending;

  const activeCard = useMemo(() => {
    return (
      cards.find((card) => card.status === parkingCardStatus.ACTIVE) ||
      cards.find((card) => card.status === parkingCardStatus.DISABLED) ||
      cards[0]
    );
  }, [cards]);

  const handleActivate = async (cardId: string) => {
    try {
      await activateMutation.mutateAsync(cardId);
      setToast({
        open: true,
        severity: "success",
        message: t("parkingCards.toast.activated", {
          defaultValue: "Thẻ đã được kích hoạt.",
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

  if (isError) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {t("parkingCards.toast.loadError", {
            defaultValue: "Không thể tải thẻ gửi xe.",
          })}
        </Alert>

        <Button onClick={() => refetch()} variant="contained">
          {t("common.button.submit", { defaultValue: "Thử lại" })}
        </Button>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(420px, 0.95fr) minmax(300px, 0.55fr)",
          },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Stack spacing={2.25}>
          <StudentParkingCard card={activeCard} isLoading={isLoading} />

          {canActivateCard(activeCard) && (
            <Box
              sx={{
                borderRadius: "18px",
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                p: 2,
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
              }}
            >
              <Button
                fullWidth
                variant="contained"
                disabled={busy}
                onClick={() => activeCard && handleActivate(activeCard.id)}
                sx={{
                  height: 48,
                  borderRadius: "14px",
                  bgcolor: PRIMARY,
                  color: "#fff",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#278a32",
                    boxShadow: "none",
                  },
                }}
              >
                {t("parkingCards.actions.activate", {
                  defaultValue: "Kích hoạt thẻ",
                })}
              </Button>
            </Box>
          )}
        </Stack>

        <ParkingCardStatusBox card={activeCard} onOpenRules={rulesModal.openModal} />
      </Box>

      <ParkingCardRulesDialog open={rulesModal.open} onClose={rulesModal.closeModal} />

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
    </Box>
  );
};

