import { useMemo } from 'react';
import type { PlanPaymentModePricing, PlanPricing } from '../../../api/clientApi';
import { usePaymentPlanPricing } from '../../../api/payment_plan_pricing';

export type PlanCheckoutPricingResult = {
  planPricing: PlanPricing | null;
  planPricingBusy: boolean;
  planPricingReady: boolean;
  recurringModePricing: PlanPaymentModePricing | null;
  fullModePricing: PlanPaymentModePricing | null;
};

export const usePlanCheckoutPricing = (
  planId?: string,
  termId?: string,
  enabled = true
): PlanCheckoutPricingResult => {
  const { data: planPricing, isLoading, isFetching } = usePaymentPlanPricing(planId, termId, enabled);

  const recurringModePricing = useMemo(
    () =>
      planPricing?.payment_modes.find(
        (mode: PlanPaymentModePricing) => mode.payment_type === 'MONTHLY'
      ) ?? null,
    [planPricing]
  );

  const fullModePricing = useMemo(
    () =>
      planPricing?.payment_modes.find(
        (mode: PlanPaymentModePricing) => mode.payment_type === 'FULL'
      ) ?? null,
    [planPricing]
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
