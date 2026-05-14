import { Alert, Box, Typography } from "@mui/material";
import { payment_plan } from "../../../constant/config";
import { PaymentModeId } from "../types";
import { SubscriptionPlanRecord } from "../../../api/clientApi";
import { useMyWallet } from "../../../api/wallets";

type Props = {
  plan?: SubscriptionPlanRecord | null;
  paymentModes: any[];
  selectedPaymentMode: string | null;
  selectPaymentMode: (mode: PaymentModeId | null) => void;
  planPricing: any;
  recurringModePricing: any;
  fullModePricing: any;
  planPricingBusy: boolean;
  t: any;
  formatCurrency: (n: number) => string;
};

export default function PaymentModeStep(props: Props) {
  const {
    plan,
    paymentModes,
    selectedPaymentMode,
    selectPaymentMode,
    planPricing,
    recurringModePricing,
    fullModePricing,
    planPricingBusy,
    t,
    formatCurrency,
  } = props;

  const allowMonthlyPayment = plan?.allow_monthly_payment;
  const allowFullPayment = plan?.allow_full_payment;
  const hasAnyPaymentAllowFlag =
    allowMonthlyPayment !== null &&
    allowMonthlyPayment !== undefined
      ? true
      : allowFullPayment !== null && allowFullPayment !== undefined;

  const visiblePaymentModes = paymentModes.filter((mode) => {
    if (!hasAnyPaymentAllowFlag) return true;

    if (mode.id === payment_plan.RECURRING) {
      if (typeof allowMonthlyPayment !== "boolean") return true;
      return allowMonthlyPayment === true;
    }

    if (mode.id === payment_plan.ONE_TIME) {
      if (typeof allowFullPayment !== "boolean") return true;
      return allowFullPayment === true;
    }

    return true;
  });

  const { data: wallet } = useMyWallet();
  const recurringAmount = recurringModePricing?.amount ?? null;
  const walletBalanceNumber = wallet ? Number(wallet.balance) : 0;
  const walletReadyForRecurring =
    Boolean(wallet) &&
    Boolean(recurringAmount) &&
    wallet?.status === "ACTIVE" &&
    walletBalanceNumber >= Number(recurringAmount);

  return (
    <Box className="checkout-step-plan">
      <Typography variant="subtitle1" className="checkout-payment-label">
        {t("plan.checkoutStepper.paymentPlanLabel")}
      </Typography>
      <Typography variant="body2" className="checkout-step-description">
        {t("plan.checkoutStepper.paymentPlanDescription")}
      </Typography>
      <Box className="checkout-payment-modes">
        {visiblePaymentModes.map((mode) => {
          const modePricing =
            mode.id === payment_plan.RECURRING
              ? recurringModePricing
              : fullModePricing;

          const badgeNumber =
            mode.id === payment_plan.ONE_TIME
              ? (modePricing?.discount_percent ?? null)
              : null;

          const shouldRenderBadge =
            Boolean(mode.badgeKey) &&
            (mode.id !== payment_plan.ONE_TIME ||
              (typeof badgeNumber === "number" && badgeNumber > 0));
          const isRecurring = mode.id === payment_plan.RECURRING;
          const disabledRecurring = isRecurring && !walletReadyForRecurring;
          return (
            <Box
              key={mode.id}
              className={`checkout-payment-card ${
                selectedPaymentMode === mode.id
                  ? "checkout-payment-card--active"
                  : ""
              }`}
              onClick={() => {
                if (disabledRecurring) return;
                if (!planPricing || !modePricing) {
                  return;
                }
                selectPaymentMode(mode.id);
              }}
              style={disabledRecurring ? { opacity: 0.55, pointerEvents: "auto" } : undefined}
            >
              <Box className="checkout-payment-header">
                <Typography variant="subtitle1">{t(mode.titleKey)}</Typography>
                {shouldRenderBadge && (
                  <span className="checkout-payment-badge">
                    {t(mode.badgeKey, { number: badgeNumber })}
                  </span>
                )}
              </Box>
              {modePricing && planPricing && !planPricingBusy ? (
                <Typography variant="h6" className="checkout-payment-price">
                  {formatCurrency(modePricing.amount)}{" "}
                  {mode.id === payment_plan.RECURRING
                    ? t("plan.paymentModes.recurring.suffix")
                    : t("plan.paymentModes.oneTime.suffix")}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  className="checkout-payment-calculating"
                >
                  {t("plan.calculatingPrice")}
                </Typography>
              )}
              {mode.id === payment_plan.ONE_TIME &&
                modePricing &&
                planPricing &&
                !planPricingBusy && (
                  <Typography className="checkout-payment-old-price">
                    {formatCurrency(modePricing.original_amount)}{" "}
                    {t("plan.paymentModes.oneTime.suffix")}
                  </Typography>
                )}
              <Typography
                variant="body2"
                className="checkout-payment-description"
              >
                {t(mode.descriptionKey)}
              </Typography>
              {disabledRecurring && (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  {t("wallet.insufficient", {
                    defaultValue:
                      "Số dư ví không đủ, vui lòng nạp thêm hoặc chọn MoMo",
                  })}
                </Alert>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
