import { useQuery } from '@tanstack/react-query';
import {
  clientHttp,
  requestWithContext,
  SubscriptionPlanRecord,
} from './clientApi';
import { isMockMode, mockSubscriptionPlans } from '../mocks/mockData';

const fetchSubscriptionPlans = async (): Promise<SubscriptionPlanRecord[]> => {
  if (isMockMode) {
    return mockSubscriptionPlans;
  }
  return requestWithContext(clientHttp.get<SubscriptionPlanRecord[]>('/subscription_plans'), 'Load subscription plans');
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: fetchSubscriptionPlans,
    staleTime: 1000 * 60 * 5,
  });
};
