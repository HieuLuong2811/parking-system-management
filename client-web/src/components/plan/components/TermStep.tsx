import { Box, Typography } from "@mui/material";

type Props = {
  availableTermCards: any[];
  selectedTermId: string;
  selectTerm: (id: string) => void;
  t: any;
};

export default function TermStep({ availableTermCards, selectedTermId, selectTerm, t }: Props) {
  return (
    <>
      <Typography variant="subtitle1" className="checkout-payment-label">
        {t("plan.checkoutStepper.termLabel")}
      </Typography>
      <Typography variant="body2" className="checkout-step-description">
        {t("plan.checkoutStepper.termHelper")}
      </Typography>

      {availableTermCards.length === 0 ? (
        <Typography variant="body2">{t("plan.checkoutStepper.termEmpty")}</Typography>
      ) : (
        <Box className="checkout-term-grid">
          {availableTermCards.map((card: any) => (
            <Box
              key={card.id}
              className={`checkout-term-card ${selectedTermId === card.id ? "checkout-term-card--active" : ""}`}
              onClick={() => selectTerm(card.id)}
            >
              <Typography className="checkout-term-title">{card.termName}</Typography>
              <Typography variant="body2" className="checkout-term-meta">
                {t("plan.checkoutStepper.termRange", { start: card.startDate, end: card.endDate })}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}