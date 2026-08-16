import { create } from 'zustand';
import { toast } from 'sonner';
import {
  AppNotification,
  fetchNotificationsApi,
  fetchUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
} from '@/features/notifications/api/notificationApi';
import { getEcho } from '@/lib/echoService';
import { useAuthStore } from './authStore';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  activeTaskModalId: string | null;
  subscribedUserId: string | number | null;

  // Actions
  loadNotifications: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addRealtimeNotification: (notification: AppNotification) => void;
  openTaskDetailModal: (taskId: string) => void;
  closeTaskDetailModal: () => void;
  subscribeToUserChannel: (userId: string | number) => void;
  unsubscribeFromUserChannel: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  activeTaskModalId: null,
  subscribedUserId: null,

  loadNotifications: async () => {
    try {
      set({ isLoading: true });
      const res = await fetchNotificationsApi();
      set({
        notifications: res.data || [],
        unreadCount: res.unread_count ?? (res.data || []).filter((n) => !n.is_read).length,
      });
    } catch {
      // Fallback
    } finally {
      set({ isLoading: false });
    }
  },

  loadUnreadCount: async () => {
    try {
      const count = await fetchUnreadCountApi();
      set({ unreadCount: count });
    } catch {
      // Fallback
    }
  },

  markRead: async (id: string) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await markNotificationReadApi(id);
    } catch {
      // Rollback or reload
    }
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      })),
      unreadCount: 0,
    }));

    try {
      await markAllNotificationsReadApi();
    } catch {
      // Ignore
    }
  },

  deleteNotification: async (id: string) => {
    const current = get().notifications.find((n) => n.id === id);
    const wasUnread = current && !current.is_read;

    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }));

    try {
      await deleteNotificationApi(id);
    } catch {
      // Ignore
    }
  },

  addRealtimeNotification: (item: AppNotification) => {
    set((state) => {
      // Avoid duplicates
      if (state.notifications.some((n) => n.id === item.id)) {
        return state;
      }

      return {
        notifications: [item, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    });

    // Show high-taste toast notification
    const senderName = item.sender?.name || 'Thành viên';
    const taskNumber = item.data?.task_number || item.task?.task_number || '';
    const newStatus = item.data?.new_status || '';

    toast.info(item.title, {
      description: `${senderName}: ${taskNumber} ➔ ${newStatus}`,
      action: item.task_id
        ? {
            label: 'Xem chi tiết',
            onClick: () => {
              if (item.task_id) {
                get().openTaskDetailModal(item.task_id);
              }
            },
          }
        : undefined,
      duration: 5000,
    });
  },

  openTaskDetailModal: (taskId: string) => {
    set({ activeTaskModalId: taskId });
  },

  closeTaskDetailModal: () => {
    set({ activeTaskModalId: null });
  },

  subscribeToUserChannel: (userId: string | number) => {
    if (get().subscribedUserId === userId) {
      return;
    }

    const echo = getEcho();
    const channelName = `user.${userId}`;
    set({ subscribedUserId: userId });

    if (echo) {
      echo
        .private(channelName)
        .listen('.TaskStatusChanged', (e: unknown) => {
          get().addRealtimeNotification(e as AppNotification);
        })
        .listen('TaskStatusChanged', (e: unknown) => {
          get().addRealtimeNotification(e as AppNotification);
        })
        .listen('.App\\Events\\TaskStatusChanged', (e: unknown) => {
          get().addRealtimeNotification(e as AppNotification);
        })
        .listen('App\\Events\\TaskStatusChanged', (e: unknown) => {
          get().addRealtimeNotification(e as AppNotification);
        });
    }
  },

  unsubscribeFromUserChannel: () => {
    const { subscribedUserId } = get();
    if (!subscribedUserId) return;

    const echo = getEcho();
    if (echo) {
      echo.leave(`private-user.${subscribedUserId}`);
      echo.leave(`user.${subscribedUserId}`);
    }
    set({ subscribedUserId: null });
  },
}));
