import { useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, UserSubscriptionDetail } from './clientApi';

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

