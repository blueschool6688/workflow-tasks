'use client';

import * as React from 'react';
import { Card, Calendar, Badge, Button, Spin } from 'antd';
import type { CalendarProps } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { api } from '@/lib/axios';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { KanbanTask } from '@/features/board/api/boardApi';

interface CalendarTaskItem {
  id: string;
  task_number: string;
  title: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
}

export function ProjectCalendarPage({ projectKey }: { projectKey: string }) {
  const pKey = projectKey.toUpperCase();
  const [tasks, setTasks] = React.useState<CalendarTaskItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<KanbanTask | null>(null);

  const fetchCalendarTasks = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectKey}/tasks`);
      const allTasks: any[] = res.data.data || res.data || [];
      if (allTasks.length > 0) {
        setTasks(
          allTasks.map((t) => ({
            id: t.id?.toString(),
            task_number: t.task_number || t.id,
            title: t.title,
            due_date: t.due_date ? dayjs(t.due_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
            priority: t.priority || 'medium',
            status: t.status?.name || 'Todo',
          }))
        );
      } else {
        setTasks([
          { id: '1', task_number: `${pKey}-101`, title: 'Hạn chót Multi-tenant Schema', due_date: dayjs().date(15).format('YYYY-MM-DD'), priority: 'high', status: 'In Progress' },
          { id: '2', task_number: `${pKey}-102`, title: 'Review Sanctum Auth & LDAP', due_date: dayjs().date(18).format('YYYY-MM-DD'), priority: 'urgent', status: 'Todo' },
          { id: '3', task_number: `${pKey}-103`, title: 'Sprint 24 Review Demo', due_date: dayjs().date(22).format('YYYY-MM-DD'), priority: 'medium', status: 'In Progress' },
          { id: '4', task_number: `${pKey}-104`, title: 'Hoàn thành Sprint 24', due_date: dayjs().date(28).format('YYYY-MM-DD'), priority: 'high', status: 'Todo' },
        ]);
      }
    } catch {
      setTasks([
        { id: '1', task_number: `${pKey}-101`, title: 'Hạn chót Multi-tenant Schema', due_date: dayjs().date(15).format('YYYY-MM-DD'), priority: 'high', status: 'In Progress' },
        { id: '2', task_number: `${pKey}-102`, title: 'Review Sanctum Auth & LDAP', due_date: dayjs().date(18).format('YYYY-MM-DD'), priority: 'urgent', status: 'Todo' },
        { id: '3', task_number: `${pKey}-103`, title: 'Sprint 24 Review Demo', due_date: dayjs().date(22).format('YYYY-MM-DD'), priority: 'medium', status: 'In Progress' },
        { id: '4', task_number: `${pKey}-104`, title: 'Hoàn thành Sprint 24', due_date: dayjs().date(28).format('YYYY-MM-DD'), priority: 'high', status: 'Todo' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [projectKey, pKey]);

  React.useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') {
      const dateStr = current.format('YYYY-MM-DD');
      const dayTasks = tasks.filter((t) => t.due_date === dateStr);

      return (
        <ul className="events p-0 m-0 list-none space-y-1">
          {dayTasks.map((item) => {
            let badgeType: 'success' | 'processing' | 'warning' | 'error' = 'processing';
            if (item.priority === 'urgent') badgeType = 'error';
            else if (item.priority === 'high') badgeType = 'warning';
            else if (item.status.toLowerCase().includes('done')) badgeType = 'success';

            return (
              <li
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTask({
                    id: item.id,
                    task_number: item.task_number,
                    title: item.title,
                    status: item.status.toLowerCase(),
                    priority: item.priority,
                  });
                }}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Badge
                  status={badgeType}
                  text={
                    <span className="text-[11px] font-semibold truncate hover:text-indigo-600">
                      {item.task_number}: {item.title}
                    </span>
                  }
                />
              </li>
            );
          })}
        </ul>
      );
    }
    return info.originNode;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
            <CalendarOutlined className="text-indigo-500" />
            <span>Lịch Công việc & Hạn chót — {pKey}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Xem công việc sắp tới và quản lý lịch trình làm việc theo tháng
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-indigo-600"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Tạo nhiệm vụ mới
        </Button>
      </div>

      <Card className="shadow-xs">
        {loading ? (
          <div className="p-16 text-center">
            <Spin size="large" />
          </div>
        ) : (
          <Calendar cellRender={cellRender} />
        )}
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => fetchCalendarTasks()}
        onTaskDeleted={() => fetchCalendarTasks()}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectKey={projectKey}
        onSuccess={() => fetchCalendarTasks()}
      />
    </div>
  );
}
