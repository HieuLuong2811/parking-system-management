import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';
import type { PaginatedResponse, UserSubscriptionDetailRecord } from './types';

const fetchSubscriptionDetails = () => httpGet<UserSubscriptionDetailRecord[]>('/subscriptions/details');

export const useSubscriptionDetails = () => {
  const query = useQuery({
    queryKey: ['admin', 'subscriptionDetails'],
    queryFn: fetchSubscriptionDetails,
    staleTime: 1000 * 60,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

type SubscriptionDetailsQuery = {
  search?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  page: number;
  limit: number;
};

const fetchSubscriptionDetailsPaginated = async (params: SubscriptionDetailsQuery) => {
  const search = new URLSearchParams();
  if (params.search) search.append('search', params.search);
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
