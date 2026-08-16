'use client';

import * as React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { KanbanTask } from '@/features/board/api/boardApi';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const {
    subscribeToUserChannel,
    unsubscribeFromUserChannel,
    loadNotifications,
    activeTaskModalId,
    closeTaskDetailModal,
  } = useNotificationStore();

  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadNotifications();
      subscribeToUserChannel(user.id);
    }

    return () => {
      unsubscribeFromUserChannel();
    };
  }, [isAuthenticated, user?.id, subscribeToUserChannel, unsubscribeFromUserChannel, loadNotifications]);

  // Construct a minimal task object if modal is triggered by notification
  const modalTask: KanbanTask | null = activeTaskModalId
    ? ({
        id: activeTaskModalId,
        task_number: '',
        title: '',
        status_id: '',
        priority: 'medium',
        order: 0,
      } as unknown as KanbanTask)
    : null;

  return (
    <>
      {children}
      {modalTask && (
        <TaskDetailModal
          task={modalTask}
          onClose={closeTaskDetailModal}
          onTaskUpdated={() => {
            loadNotifications();
          }}
        />
      )}
    </>
  );
}
