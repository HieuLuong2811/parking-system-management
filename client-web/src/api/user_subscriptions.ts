import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  clientHttp,
  requestWithContext,
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
