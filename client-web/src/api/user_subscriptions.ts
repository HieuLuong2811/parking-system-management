import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  clientHttp,
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
