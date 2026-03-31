import { useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, PaymentPlan } from './clientApi';

const fetchPaymentPlans = async (): Promise<PaymentPlan[]> => {
  return requestWithContext(
    clientHttp.get<PaymentPlan[]>('/payment_plans'),
    'Load payment plans'
  );
};

export const usePaymentPlans = () => {
  return useQuery({
    queryKey: ['paymentPlans'],
    queryFn: fetchPaymentPlans,
    staleTime: 1000 * 60 * 5,
  });
};
