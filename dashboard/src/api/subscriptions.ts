import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { PaginatedResponse, UserSubscriptionDetailRecord } from './types';
import type { subscriptionStatusOptions, planTypeOptions } from '../constant/config';

type SubscriptionDetailsQuery = {
  search?: string;
  user_code?: string;
  full_name?: string;
  plan_type?: typeof planTypeOptions[keyof typeof planTypeOptions];
  payment_type?: 'FULL' | 'MONTHLY';
  status?: typeof subscriptionStatusOptions[keyof typeof subscriptionStatusOptions];
  page: number;
  limit: number;
};

const fetchSubscriptionDetailsPaginated = async (params: SubscriptionDetailsQuery) => {
  const search = new URLSearchParams();
  if (params.search) search.append('search', params.search);
  if (params.user_code) search.append('user_code', params.user_code);
  if (params.full_name) search.append('full_name', params.full_name);
  if (params.plan_type) search.append('plan_type', params.plan_type);
  if (params.payment_type) search.append('payment_type', params.payment_type);
  if (params.status) search.append('status', params.status);
  search.append('page', String(params.page));
  search.append('limit', String(params.limit));
  const query = search.toString();
  return httpGet<PaginatedResponse<UserSubscriptionDetailRecord>>(
    `/subscriptions/details/paginated${query ? `?${query}` : ''}`
  );
};

export const useSubscriptionDetailsPaginated = (params: SubscriptionDetailsQuery) => {
  return useQuery({
    queryKey: ['admin', 'subscriptionDetails', 'paginated', params],
    queryFn: () => fetchSubscriptionDetailsPaginated(params),
    staleTime: 1000 * 30,
  });
};
