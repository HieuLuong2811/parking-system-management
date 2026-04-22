import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { clientHttp, requestWithContext, Notification } from './clientApi';

export type NotificationPageParams = {
  limit: number;
  offset: number;
};

const fetchNotifications = async (): Promise<Notification[]> => {
  return requestWithContext(clientHttp.get<Notification[]>('/notifications/me'), 'Load notifications');
};

export const fetchNotificationsPage = async (params: NotificationPageParams): Promise<Notification[]> => {
  return requestWithContext(
    clientHttp.get<Notification[]>('/notifications/me', { params }),
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

export const useInfiniteNotifications = (limit = 10, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ['notifications', 'infinite', limit],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }): Promise<Notification[]> =>
      fetchNotificationsPage({ limit, offset: typeof pageParam === 'number' ? pageParam : 0 }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      const loaded = allPages.reduce((sum, page) => sum + page.length, 0);
      return loaded;
    },
    staleTime: 1000 * 60,
  });
};
