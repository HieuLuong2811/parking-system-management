import { useQuery } from '@tanstack/react-query';

import { httpGet } from './httpClient';

export type NotificationRecord = {
  id: string;
  actor_id?: string | null;
  receiver_id: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  deleted_at?: string | null;
  link?: string | null;
};

const fetchNotifications = () => httpGet<NotificationRecord[]>('/notifications/me');

export const useNotifications = () => {
  return useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: fetchNotifications,
    staleTime: 1000 * 30,
  });
};

