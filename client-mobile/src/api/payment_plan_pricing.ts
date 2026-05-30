import { useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, PaymentPlanPricingResponse } from './clientApi';

const fetchPaymentPlanPricing = async (planId: string, termId: string): Promise<PaymentPlanPricingResponse> => {
  return requestWithContext(
    clientHttp.get<PaymentPlanPricingResponse>('/payment_plans/pricing', {
      params: {
        plan_id: planId,
        term_id: termId,
      },
    }),
    'Load payment plans with pricing'
  );
};

export const usePaymentPlanPricing = (planId?: string, termId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['paymentPlanPricing', planId, termId],
    queryFn: () => fetchPaymentPlanPricing(planId!, termId!),
    enabled: enabled && Boolean(planId && termId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
