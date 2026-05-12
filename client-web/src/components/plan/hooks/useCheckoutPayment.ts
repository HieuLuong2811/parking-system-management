import { useCallback } from "react";
import { useCheckoutMomo, useCheckoutRecurring } from "../../../api/momo";
import { clientHttp } from "../../../api/clientApi";

const getActivePlanLabel = (sub: any): string => {
  return (
    sub?.subscription_plan?.plans_type ??
    sub?.plan ??
    "gói hiện tại"
  );
};

type UseCheckoutPaymentProps = {
  plan: any;
  selectedTermRecord: any;
  selectedLicensedVehicle: any;
  selectedUnlicensedVehicle: any;
  recurringModePricing: any;
  fullModePricing: any;
  recurringPlanId: string | null;
  fullPlanId: string | null;
  currentUser: any;
  t: any;
  setProcessing: (loading: boolean) => void;
  setProcessingError: (error: string | null) => void;
};

export const useCheckoutPayment = (props: UseCheckoutPaymentProps) => {
  const { mutateAsync: checkoutMomo } = useCheckoutMomo();
  const { mutateAsync: checkoutRecurring } = useCheckoutRecurring();

  const {
    plan,
    selectedTermRecord,
    selectedLicensedVehicle,
    selectedUnlicensedVehicle,
    recurringModePricing,
    fullModePricing,
    recurringPlanId,
    fullPlanId,
    currentUser,
    t,
    setProcessing,
    setProcessingError,
  } = props;

  const confirmOverrideActivePlan = useCallback(async () => {
    try {
      const res = await clientHttp.get<any[]>("/subscriptions/me", {
        params: { status: "ACTIVE" },
      });
      const active = Array.isArray(res.data) ? res.data[0] : null;
      if (!active) return true;

      const activeLabel = getActivePlanLabel(active);
      return window.confirm(
        `Hiện tại bạn đang sử dụng gói ${activeLabel}. Nếu đăng ký gói mới thì gói cũ sẽ bị huỷ. Bạn có muốn tiếp tục?`
      );
    } catch {
      // If we can't check, don't block checkout.
      return true;
    }
  }, []);

  const buildVehicleIds = useCallback(() => {
    const ids = [selectedLicensedVehicle?.id, selectedUnlicensedVehicle?.id].filter(Boolean);
    return Array.from(new Set(ids));
  }, [selectedLicensedVehicle, selectedUnlicensedVehicle]);

  const handleRecurringSetup = useCallback(async () => {
    if (
      !currentUser ||
      !selectedTermRecord ||
      !recurringPlanId
    ) {
      setProcessingError(t("plan.checkoutStepper.setupError"));
      return;
    }

    const vehicle_ids = buildVehicleIds();
    if (vehicle_ids.length === 0) {
      setProcessingError(t("plan.checkoutStepper.setupError"));
      return;
    }

    const confirmed = await confirmOverrideActivePlan();
    if (!confirmed) {
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
        vehicle_ids,
        payment_plan_id: recurringPlanId,
        start_date: selectedTermRecord.start_date,
        end_date: selectedTermRecord.end_date,
        amount,
      });

      window.location.assign("/profile");

    } catch (error: any) {
      setProcessingError(
        error.message || t("plan.checkoutStepper.generalError")
      );
    } finally {
      setProcessing(false);
    }
  }, [currentUser, selectedTermRecord, recurringPlanId, recurringModePricing, plan, t, setProcessing, setProcessingError, checkoutRecurring, confirmOverrideActivePlan, buildVehicleIds]);

  const handleMomoCheckout = useCallback(async () => {
    if (
      !currentUser ||
      !selectedTermRecord ||
      !fullPlanId
    ) {
      setProcessingError(t("plan.checkoutStepper.momoSetupError"));
      return;
    }

    const vehicle_ids = buildVehicleIds();
    if (vehicle_ids.length === 0) {
      setProcessingError(t("plan.checkoutStepper.momoSetupError"));
      return;
    }

    const confirmed = await confirmOverrideActivePlan();
    if (!confirmed) {
      return;
    }

    setProcessing(true);
    setProcessingError(null);

    try {
      const amount = fullModePricing?.amount;
      if (!amount) {
        throw new Error(t("plan.checkoutStepper.momoSetupError"));
      }

      const res = await checkoutMomo({
        sub_plan_id: plan.id,
        term_id: selectedTermRecord.id,
        vehicle_ids,
        payment_plan_id: fullPlanId,
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

    } catch (error: any) {
      setProcessingError(
        error.message || t("plan.checkoutStepper.momoGeneralError")
      );
    } finally {
      setProcessing(false);
    }
  }, [currentUser, selectedTermRecord, fullPlanId, buildVehicleIds, confirmOverrideActivePlan, setProcessing, setProcessingError, t, fullModePricing?.amount, checkoutMomo, plan.id]);

  return {
    handleRecurringSetup,
    handleMomoCheckout,
  };
};
