import { Box, Typography } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

type TermCard = {
  id: string;
  termName: string;
  startDate: string;
  endDate: string;
};

type Props = {
  availableTermCards: TermCard[];
  selectedTermId: string;
  selectTerm: (id: string) => void;
  t: any;
};

const formatDate = (date?: string) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function TermStep({
  availableTermCards,
  selectedTermId,
  selectTerm,
  t,
}: Props) {
  return (
    <>
      <Typography variant="subtitle1" className="checkout-payment-label">
        {t("plan.checkoutStepper.termLabel")}
      </Typography>

      <Typography variant="body2" className="checkout-step-description">
        {t("plan.checkoutStepper.termHelper")}
      </Typography>

      {availableTermCards.length === 0 ? (
        <Typography variant="body2">
          {t("plan.checkoutStepper.termEmpty")}
        </Typography>
      ) : (
        <Box className="checkout-term-grid">
          {availableTermCards.map((card) => {
            const isSelected = selectedTermId === card.id;

            return (
              <Box
                key={card.id}
                className={`checkout-term-card ${
                  isSelected ? "checkout-term-card--active" : ""
                }`}
                onClick={() => selectTerm(card.id)}
              >
                <Box className="checkout-term-card-header">
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarMonthIcon/>
                    <Typography className="checkout-term-title">
                      {card.termName}
                    </Typography>
                  </Box>
                </Box>

                <Box className="checkout-term-validity-box">
                  <Box className="checkout-term-date-row">
                    <Typography className="checkout-term-date-label">
                      {t("plan.checkoutStepper.termStartDate", {
                        defaultValue: "Bắt đầu",
                      })}
                    </Typography>

                    <Typography className="checkout-term-date-value">
                      {formatDate(card.startDate)}
                    </Typography>
                  </Box>

                  <Box className="checkout-term-date-row">
                    <Typography className="checkout-term-date-label">
                      {t("plan.checkoutStepper.termEndDate", {
                        defaultValue: "Kết thúc",
                      })}
                    </Typography>

                    <Typography className="checkout-term-date-value">
                      {formatDate(card.endDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </>
  );
}