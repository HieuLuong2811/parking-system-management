import { useMemo } from 'react';
import type {
  PaymentPlanPricingDetail,
  PaymentPlanPricingResponse,
} from '../../../api/clientApi';
import { usePaymentPlanPricing } from '../../../api/payment_plan_pricing';

export type PlanCheckoutPricingResult = {
  planPricing: PaymentPlanPricingResponse | null;
  planPricingBusy: boolean;
  planPricingReady: boolean;
  recurringModePricing: PaymentPlanPricingDetail | null;
  fullModePricing: PaymentPlanPricingDetail | null;
};

export const usePlanCheckoutPricing = (
  planId?: string,
  termId?: string,
  enabled = true
): PlanCheckoutPricingResult => {
  const {
    data: planPricing,
    isLoading,
    isFetching,
  } = usePaymentPlanPricing(planId, termId, enabled);

  const paymentPlanDetails = useMemo(() => planPricing?.payment_plan_details ?? [], [planPricing]);

  const recurringModePricing = useMemo(
    () =>
      paymentPlanDetails.find(
        (mode) => mode.payment_type === 'MONTHLY' && mode.is_active
      ) ?? null,
    [paymentPlanDetails]
  );

  const fullModePricing = useMemo(
    () =>
      paymentPlanDetails.find(
        (mode) => mode.payment_type === 'FULL' && mode.is_active
      ) ?? null,
    [paymentPlanDetails]
  );

  const planPricingBusy = isLoading || isFetching;
  const planPricingReady = Boolean(planPricing);

  return {
    planPricing: planPricing ?? null,
    planPricingBusy,
    planPricingReady,
    recurringModePricing,
    fullModePricing,
  };
};