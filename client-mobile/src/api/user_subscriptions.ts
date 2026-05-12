import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

import { clientHttp, PaginatedResponse, requestWithContext, UserSubscriptionDetail } from './clientApi';

export type UserSubscriptionsMeQuery = {
  page: number;
  limit: number;
  status?: string;
};

export type RegistrationWarningSubscription = {
  id: string;
  status: string;
  total_amount?: number | string | null;
  paid_amount?: number | string | null;
  subscription_plan?: {
    id?: string;
    plans_type?: string;
  } | null;
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

export const subscriptionWarningKeys = {
  all: ['subscriptionWarning'] as const,
  registration: () => [...subscriptionWarningKeys.all, 'registration'] as const,
};

export const fetchRegistrationWarningSubscriptions = async (): Promise<
  RegistrationWarningSubscription[]
> => {
  return requestWithContext(
    clientHttp.get<RegistrationWarningSubscription[]>('/subscriptions/me'),
    'Load registration warning subscriptions',
  );
};

export const fetchRegistrationWarningSubscriptionsQuery = (
  queryClient: QueryClient,
) => {
  return queryClient.fetchQuery({
    queryKey: subscriptionWarningKeys.registration(),
    queryFn: fetchRegistrationWarningSubscriptions,
    staleTime: 0,
  });
};

export const useRegistrationWarningFetcher = () => {
  const queryClient = useQueryClient();

  return () => fetchRegistrationWarningSubscriptionsQuery(queryClient);
};