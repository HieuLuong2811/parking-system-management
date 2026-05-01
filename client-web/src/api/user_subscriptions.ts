import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  clientHttp,
  PaginatedResponse,
  requestWithContext,
  UserSubscriptionDetail,
  UserSubscriptionInfo,
  UserSubscriptionPayload,
} from './clientApi';

const createUserSubscription = async (
  payload: UserSubscriptionPayload
): Promise<UserSubscriptionInfo> => {
  return requestWithContext(
    clientHttp.post<UserSubscriptionInfo>('/user_subscriptions', payload),
    'Create subscription'
  );
};

export const useCreateUserSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserSubscriptionPayload) => createUserSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
    },
  });
};

const fetchUserSubscriptions = async (): Promise<UserSubscriptionDetail[]> => {
  return requestWithContext(
    clientHttp.get<UserSubscriptionDetail[]>('/subscriptions/me'),
    'Load user subscriptions'
  );
};

export const useUserSubscriptions = () => {
  return useQuery({
    queryKey: ['userSubscriptions'],
    queryFn: fetchUserSubscriptions,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
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

type UpdateSubscriptionArgs = {
  subscriptionId: string;
  payload: {
    vehicle_id?: string;
  };
};

const updateSubscription = async ({ subscriptionId, payload }: UpdateSubscriptionArgs): Promise<UserSubscriptionInfo> => {
  return requestWithContext(
    clientHttp.patch<UserSubscriptionInfo>(`/subscriptions/${subscriptionId}`, payload),
    'Update subscription'
  );
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: UpdateSubscriptionArgs) => updateSubscription(args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
    },
  });
};
