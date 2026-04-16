import { httpPost } from './httpClient';

export type NotificationCreatePayload = {
  actor_id?: string;
  receiver_id: string;
  title: string;
  content: string;
};

export type NotificationRecord = NotificationCreatePayload & {
  id: string;
  created_at: string;
  deleted_at?: string | null;
};

export const createNotification = (payload: NotificationCreatePayload) =>
  httpPost<NotificationRecord>('/notifications', payload);
