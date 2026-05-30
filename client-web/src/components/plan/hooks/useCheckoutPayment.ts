import { useCallback } from "react";
import { useCheckoutMomo, useCheckoutRecurring } from "../../../api/momo";
import { useCheckoutWalletFull } from "../../../api/checkout";
import { paymentType, paymentMethod } from "../../../constant/config";

type UseCheckoutPaymentProps = {
  plan: any;
  selectedTermRecord: any;
  recurringModePricing: any;
  fullModePricing: any;
  recurringPlanId: string | null;
  fullPlanId: string | null;
  currentUser: any;
  selectedFullPaymentMethod: "WALLET" | "MOMO" | null;
  t: any;
  setProcessing: (loading: boolean) => void;
  setProcessingError: (error: string | null) => void;
};

export const useCheckoutPayment = (props: UseCheckoutPaymentProps) => {
  const { mutateAsync: checkoutMomo } = useCheckoutMomo();
  const { mutateAsync: checkoutRecurring } = useCheckoutRecurring();
  const { mutateAsync: checkoutWalletFull } = useCheckoutWalletFull();

  const {
    plan,
    selectedTermRecord,
    recurringModePricing,
    fullModePricing,
    recurringPlanId,
    fullPlanId,
    currentUser,
    selectedFullPaymentMethod,
    t,
    setProcessing,
    setProcessingError,
  } = props;

  const handleRecurringSetup = useCallback(async () => {
    if (
      !currentUser ||
      !selectedTermRecord ||
      !recurringPlanId
    ) {
      setProcessingError(t("plan.checkoutStepper.setupError"));
      return;
    }

    setProcessing(true);
    setProcessingError(null);

    try {
      const amount = recurringModePricing?.amount;
      if (!amount) {
        throw new Error(t("plan.checkoutStepper.setupError"));
      }

      await checkoutRecurring({
        sub_plan_id: plan.id,
        term_id: selectedTermRecord.id,
        payment_plan_id: recurringPlanId,
        start_date: selectedTermRecord.start_date,
        end_date: selectedTermRecord.end_date,
        amount,
      });

      window.location.assign("/profile");

    } catch (error: any) {
      const raw = error?.payload?.detail ?? error?.message;
      if (raw === "insufficient_balance") {
        setProcessingError(
          t("wallet.insufficient", {
            defaultValue:
              "Số dư ví không đủ, vui lòng nạp thêm hoặc chọn MoMo",
          })
        );
      } else {
        setProcessingError(
          error.message || t("plan.checkoutStepper.generalError")
        );
      }
    } finally {
      setProcessing(false);
    }
  }, [currentUser, selectedTermRecord, recurringPlanId, recurringModePricing, plan, t, setProcessing, setProcessingError, checkoutRecurring,]);

  const handleFullPayment = useCallback(async () => {
    if (
      !currentUser ||
      !selectedTermRecord ||
      !fullPlanId
    ) {
      setProcessingError(t("plan.checkoutStepper.momoSetupError"));
      return;
    }

    setProcessing(true);
    setProcessingError(null);

    try {
      const amount = fullModePricing?.amount;
      if (!amount) {
        throw new Error(t("plan.checkoutStepper.momoSetupError"));
      }

      if (selectedFullPaymentMethod === paymentMethod.WALLET) {
        await checkoutWalletFull({
          sub_plan_id: plan.id,
          term_id: selectedTermRecord.id,
          payment_plan_id: fullPlanId,
          start_date: selectedTermRecord.start_date,
          end_date: selectedTermRecord.end_date,
          amount,
        });

        window.location.assign("/profile");
      } else {
        const res = await checkoutMomo({
          sub_plan_id: plan.id,
          term_id: selectedTermRecord.id,
          payment_plan_id: fullPlanId,
          payment_type: paymentType.FULL_PAYMENT,
          start_date: selectedTermRecord.start_date,
          end_date: selectedTermRecord.end_date,
          amount,
          redirect_url: `${window.location.origin}/profile`,
          lang: currentUser.language_use || "vi",
        });

        const checkoutUrl =
          res.payUrl || res.deeplink || res.shortLink;

        if (!checkoutUrl) {
          throw new Error(t("plan.checkoutStepper.momoUrlMissing"));
        }

        window.location.assign(checkoutUrl);
      }

    } catch (error: any) {
      const raw = error?.payload?.detail ?? error?.message;
      if (raw === "insufficient_balance") {
        setProcessingError(
          t("wallet.insufficient", {
            defaultValue:
              "Số dư ví không đủ, vui lòng nạp thêm hoặc chọn MoMo",
          })
        );
      } else {
        setProcessingError(
          error.message || t("plan.checkoutStepper.momoGeneralError")
        );
      }
    } finally {
      setProcessing(false);
    }
  }, [currentUser, selectedTermRecord, fullPlanId, setProcessing, setProcessingError, t, fullModePricing?.amount, checkoutMomo, plan.id, selectedFullPaymentMethod, checkoutWalletFull]);

  return {
    handleRecurringSetup,
    handleFullPayment,
  };
};
