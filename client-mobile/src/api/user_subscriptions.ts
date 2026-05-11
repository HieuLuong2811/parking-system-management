import { useQuery } from '@tanstack/react-query';

import { clientHttp, PaginatedResponse, requestWithContext, UserSubscriptionDetail } from './clientApi';

export const fetchUserSubscriptions = async (): Promise<UserSubscriptionDetail[]> => {
  return requestWithContext(
    clientHttp.get<UserSubscriptionDetail[]>('/subscriptions/me'),
    'Load user subscriptions'
  );
};

export const useUserSubscriptions = () => {
  return useQuery({
    queryKey: ['userSubscriptions'],
    queryFn: fetchUserSubscriptions,
    staleTime: 1000 * 60,
  });
};

export type UserSubscriptionsMeQuery = {
  page: number;
  limit: number;
  status?: string;
};

const fetchUserSubscriptionsPaginated = async (
  params: UserSubscriptionsMeQuery
): Promise<PaginatedResponse<UserSubscriptionDetail>> => {
  return requestWithContext(
    clientHttp.get<PaginatedResponse<UserSubscriptionDetail>>('/subscriptions/me/paginated', { params }),
    'Load user subscriptions'
  );
};

export const useUserSubscriptionsPaginated = (params: UserSubscriptionsMeQuery) => {
  return useQuery({
    queryKey: ['userSubscriptions', 'me', 'paginated', params],
    queryFn: () => fetchUserSubscriptionsPaginated(params),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};
