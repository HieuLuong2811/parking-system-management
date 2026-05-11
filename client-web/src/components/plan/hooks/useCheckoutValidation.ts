// src/features/plan-checkout/hooks/useCheckoutValidation.ts
import { useMemo } from "react";
import { CheckoutState } from "./useCheckoutState";
import { payment_plan } from "../../../constant/config";
import { useTranslation } from "react-i18next";

type Props = {
  state: CheckoutState;
  plan: any;
  selectedVehicle: any;
  momoReady: boolean;
  isProcessing: boolean;
  checkoutSteps: string[];
};

export const useCheckoutValidation = ({
  state,
  plan,
  selectedVehicle,
  momoReady,
  isProcessing,
  checkoutSteps,
}: Props) => {
  const { t } = useTranslation();
  const primaryDisabled = useMemo(() => {
    if (!plan || isProcessing) return true;

    switch (state.activeStep) {
      case 0:
        return !selectedVehicle;
      case 1:
        return !state.selectedTermId;
      case 2:
        return !state.selectedPaymentMode;
      case 3:
        return state.selectedPaymentMode === payment_plan.RECURRING
          ? false
          : !momoReady;
      default:
        return true;
    }
  }, [
    state,
    plan,
    selectedVehicle,
    momoReady,
    isProcessing,
  ]);

  const getPrimaryLabel = () => {
    if (state.activeStep < checkoutSteps.length - 1)
      return t("common.button.next");
    if (state.selectedPaymentMode === payment_plan.RECURRING)
      return t("plan.checkoutConfirm");
    return t("plan.checkoutStepper.payMomo");
  };

  return { primaryDisabled, getPrimaryLabel };
};
