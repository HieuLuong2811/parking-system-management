import { useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, SubscriptionPlanRecord } from './clientApi';

const fetchSubscriptionPlans = async (): Promise<SubscriptionPlanRecord[]> => {
  return requestWithContext(
    clientHttp.get<SubscriptionPlanRecord[]>('/subscription_plans/me'),
    'Load subscription plans'
  );
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: fetchSubscriptionPlans,
    staleTime: 1000 * 60 * 5,
  });
};

