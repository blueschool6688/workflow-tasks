import { api } from '@/lib/axios';

export interface AppNotification {
  id: string;
  user_id: number | string;
  sender_id?: number | string | null;
  project_id?: string | null;
  task_id?: string | null;
  type: string;
  title: string;
  message: string;
  data?: {
    task_id?: string;
    task_number?: string;
    task_title?: string;
    project_key?: string;
    old_status?: string;
    new_status?: string;
    [key: string]: unknown;
  } | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  sender?: {
    id: number | string;
    name: string;
    avatar?: string | null;
  } | null;
  task?: {
    id: string;
    task_number: string;
    title: string;
    project_id: string;
  } | null;
  project?: {
    id: string;
    key: string;
    name: string;
  } | null;
}

export async function fetchNotificationsApi(): Promise<{ data: AppNotification[]; unread_count: number }> {
  const res = await api.get('/notifications');
  return res.data;
}

export async function fetchUnreadCountApi(): Promise<number> {
  const res = await api.get('/notifications/unread-count');
  return res.data?.unread_count ?? 0;
}

export async function markNotificationReadApi(id: string): Promise<AppNotification> {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data?.data;
}

export async function markAllNotificationsReadApi(): Promise<void> {
  await api.post('/notifications/read-all');
}

export async function deleteNotificationApi(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
