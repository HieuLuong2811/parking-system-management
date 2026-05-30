import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { getBooleanLabel, getPlanDisplayKey } from "../../../ultis/formatters";
import { getPlanIcon } from "../../../ultis/status";

type Props = {
  plan: any;
  planTitle: string;
  planSubtitle: string;
  formatCurrency: (value: number) => string;
  t: any;
};

export default function CheckoutSummaryPanel({
  plan,
  planTitle,
  planSubtitle,
  formatCurrency,
  t,
}: Props) {
  const dailyFee = plan?.price_per_day ?? 0;
  const after18Fee = plan?.after_18_fee;
  const waiveAfter18 = Boolean(plan?.waive_after_18_fee);

  const features = [
    getBooleanLabel(
      plan?.allow_monthly_payment,
      t("plan.features.monthlyPayment"),
      t("plan.features.noMonthlyPayment")
    ),
    getBooleanLabel(
      plan?.allow_full_payment,
      t("plan.features.fullPayment"),
      t("plan.features.noFullPayment")
    ),
    {
      enabled: true,
      label: t("plan.features.dailyFee", {
        amount: formatCurrency(dailyFee),
      }),
    },
    {
      enabled: true,
      label: waiveAfter18
        ? t("plan.features.after18Waived")
        : t("plan.features.after18Fee", {
            amount: formatCurrency(after18Fee),
          }),
    },
  ];

  return (
    <Box className="checkout-summary-panel">
      {/* <Typography variant="subtitle2">{t("plan.checkoutPlanNote")}</Typography> */}

      <Box className="plan-option-card" minHeight="100%" padding='1rem 2rem' sx={{ cursor: "default" }}>
        <Box className="plan-card-icon">
          {getPlanIcon(plan?.plans_type)}

          {planTitle ? (
            <Typography className="plan-card-title" fontSize={20} fontWeight={700} lineHeight={1.25}>
              {t(`plan.cards.${getPlanDisplayKey(planTitle)}`)}
            </Typography>
          ) : null}
        </Box>

        <Box className="plan-card-price-line">
          <Typography component="span" fontWeight={700} fontSize="2rem" className="plan-card-price">
            {formatCurrency(dailyFee)}
          </Typography>
          <Typography component="span" className="plan-card-per-day">
            {t("plan.perDay")}
          </Typography>
        </Box>

        {planSubtitle ? (
          <Typography variant="body2" className="plan-detail" sx={{ mt: 1 }}>
            {planSubtitle}
          </Typography>
        ) : null}

        <Box className="plan-card-feature-list" sx={{ mt: 1 }}>
          {features.map((feature, featureIndex) => (
            <Box
              key={`checkout-plan-feature-${featureIndex}`}
              className="plan-card-feature-item"
            >
              {feature.enabled ? (
                <CheckCircleIcon className="plan-card-feature-icon" fontSize="medium" color="success" />
              ) : (
                <CancelIcon className="plan-card-feature-icon plan-card-feature-icon--disabled" fontSize="medium" color="disabled" />
              )}

              <Typography className="plan-card-feature-text" fontSize={16} lineHeight={1.9} fontWeight={600}>
                {feature.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
