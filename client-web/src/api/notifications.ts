import { useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, Notification } from './clientApi';

const fetchNotifications = async (): Promise<Notification[]> => {
  return requestWithContext(
    clientHttp.get<Notification[]>('/notifications'),
    'Load notifications'
  );
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    staleTime: 1000 * 60,
  });
};
