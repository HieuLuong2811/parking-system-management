// src/features/plan-checkout/hooks/useCheckoutValidation.ts
import { useMemo } from "react";
import { CheckoutState } from "./useCheckoutState";
import { payment_plan } from "../../../constant/config";
import { useTranslation } from "react-i18next";

type Props = {
  state: CheckoutState;
  plan: any;
  momoReady: boolean;
  walletReady: boolean;
  walletReadyRecurring: boolean;
  isProcessing: boolean;
  checkoutSteps: string[];
};

export const useCheckoutValidation = ({
  state,
  plan,
  momoReady,
  walletReady,
  walletReadyRecurring,
  isProcessing,
  checkoutSteps,
}: Props) => {
  const { t } = useTranslation();
  const primaryDisabled = useMemo(() => {
    if (!plan || isProcessing) return true;

    switch (state.activeStep) {
      case 0:
        return !state.selectedTermId;
      case 1:
        return !state.selectedPaymentMode;
      case 2:
        if (state.selectedPaymentMode === payment_plan.RECURRING) return !walletReadyRecurring;
        if (state.selectedFullPaymentMethod === "WALLET") return !walletReady;
        return !momoReady;
      default:
        return true;
    }
  }, [
    state,
    plan,
    momoReady,
    walletReady,
    walletReadyRecurring,
    isProcessing,
  ]);

  const getPrimaryLabel = () => {
    if (state.activeStep < checkoutSteps.length - 1)
      return t("common.button.next");
    if (state.selectedPaymentMode === payment_plan.RECURRING)
      return t("plan.checkoutConfirm");
    return t("plan.checkoutStepper.pay");
  };

  return { primaryDisabled, getPrimaryLabel };
};
