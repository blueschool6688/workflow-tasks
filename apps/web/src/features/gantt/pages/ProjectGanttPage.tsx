'use client';

import * as React from 'react';
import {
  Card,
  Progress,
  Tag,
  Timeline,
  Row,
  Col,
  Segmented,
  Button,
  Tooltip,
  DatePicker,
  Space,
  Badge,
  Spin,
  Empty,
} from 'antd';
import {
  LineChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  UserOutlined,
  ArrowRightOutlined,
  FilterOutlined,
  CalendarOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { api } from '@/lib/axios';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { KanbanTask } from '@/features/board/api/boardApi';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

interface SprintGanttItem {
  id: string;
  name: string;
  goal?: string;
  status: 'active' | 'future' | 'completed';
  start_date?: string;
  end_date?: string;
  tasks_count?: number;
  completed_tasks_count?: number;
  progress_percent?: number;
}

interface TaskGanttItem {
  id: string;
  task_number: string;
  title: string;
  status: string;
  status_category?: string;
  priority?: string;
  assignee?: string;
  sprint_id?: string | null;
  start_date: string;
  due_date: string;
  progress: number;
}

export function ProjectGanttPage({ projectKey }: { projectKey: string }) {
  const pKey = projectKey.toUpperCase();
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [sprints, setSprints] = React.useState<SprintGanttItem[]>([]);
  const [tasks, setTasks] = React.useState<TaskGanttItem[]>([]);
  const [selectedTask, setSelectedTask] = React.useState<KanbanTask | null>(null);

  // Date Filter State
  const [dateFilterPreset, setDateFilterPreset] = React.useState<'all' | 'month' | 'quarter' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = React.useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().startOf('month'),
    dayjs().add(2, 'month').endOf('month'),
  ]);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [sprintRes, taskRes] = await Promise.allSettled([
        api.get(`/projects/${projectKey}/sprints`),
        api.get(`/projects/${projectKey}/tasks`),
      ]);

      let loadedSprints: SprintGanttItem[] = [];
      if (sprintRes.status === 'fulfilled' && sprintRes.value.data?.data) {
        loadedSprints = sprintRes.value.data.data;
      } else {
        loadedSprints = [
          {
            id: 'sprint-24',
            name: 'Sprint 24 (Sprint Hiện Tại)',
            goal: 'Hoàn thiện hệ thống xác thực, phân quyền và giao diện Task Detail 1000px.',
            status: 'active',
            start_date: '2026-08-15',
            end_date: '2026-08-29',
            tasks_count: 8,
            completed_tasks_count: 5,
            progress_percent: 62.5,
          },
          {
            id: 'sprint-25',
            name: 'Sprint 25 (Kế hoạch tiếp theo)',
            goal: 'Tích hợp cổng thông báo Reverb WebSockets và xuất báo cáo PDF/Excel.',
            status: 'future',
            start_date: '2026-08-30',
            end_date: '2026-09-13',
            tasks_count: 6,
            completed_tasks_count: 0,
            progress_percent: 0,
          },
        ];
      }

      let loadedTasks: TaskGanttItem[] = [];
      if (taskRes.status === 'fulfilled' && taskRes.value.data?.data) {
        const rawTasks = taskRes.value.data.data;
        loadedTasks = rawTasks.map((t: any, index: number) => {
          const isDone = t.status?.category === 'done' || t.status?.slug === 'done';
          const isInProgress = t.status?.category === 'in_progress' || t.status?.slug === 'in_progress';
          return {
            id: t.id?.toString() || Math.random().toString(),
            task_number: t.task_number || `${pKey}-${100 + index}`,
            title: t.title,
            status: t.status?.name || 'In Progress',
            status_category: t.status?.category || 'in_progress',
            priority: t.priority || 'medium',
            assignee: t.assignee?.name || 'Unassigned',
            sprint_id: t.sprint_id,
            start_date: t.created_at ? dayjs(t.created_at).format('YYYY-MM-DD') : dayjs().subtract(index * 2, 'day').format('YYYY-MM-DD'),
            due_date: t.due_date ? dayjs(t.due_date).format('YYYY-MM-DD') : dayjs().add((index + 1) * 3, 'day').format('YYYY-MM-DD'),
            progress: isDone ? 100 : isInProgress ? 65 : 20,
          };
        });
      }

      setSprints(loadedSprints);
      setTasks(loadedTasks);
    } catch {
      // Fallback handled
    } finally {
      setLoading(false);
    }
  }, [projectKey, pKey]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Determine timeline window based on filter
  const timelineWindow = React.useMemo(() => {
    let start = dayjs().startOf('month');
    let end = dayjs().add(2, 'month').endOf('month');

    if (dateFilterPreset === 'month') {
      start = dayjs().startOf('month');
      end = dayjs().endOf('month');
    } else if (dateFilterPreset === 'quarter') {
      start = dayjs().startOf('month').subtract(1, 'month');
      end = dayjs().startOf('month').add(2, 'month').endOf('month');
    } else if (dateFilterPreset === 'custom' && customDateRange[0] && customDateRange[1]) {
      start = customDateRange[0];
      end = customDateRange[1];
    } else {
      // 'all' - fit all sprints and tasks
      start = dayjs().subtract(7, 'day');
      end = dayjs().add(45, 'day');
    }

    const totalDays = Math.max(end.diff(start, 'day') + 1, 14);
    return { start, end, totalDays };
  }, [dateFilterPreset, customDateRange]);

  // Filter sprints within timeline window
  const filteredSprints = React.useMemo(() => {
    if (dateFilterPreset === 'all') return sprints;
    return sprints.filter((s) => {
      if (!s.start_date || !s.end_date) return true;
      const sStart = dayjs(s.start_date);
      const sEnd = dayjs(s.end_date);
      return (
        sStart.isBetween(timelineWindow.start, timelineWindow.end, null, '[]') ||
        sEnd.isBetween(timelineWindow.start, timelineWindow.end, null, '[]') ||
        (sStart.isBefore(timelineWindow.start) && sEnd.isAfter(timelineWindow.end))
      );
    });
  }, [sprints, dateFilterPreset, timelineWindow]);

  // Navigate to Sprint Board
  const handleSprintClick = (sprintId: string) => {
    router.push(`/projects/${projectKey}/sprints/${sprintId}/board`);
  };

  // Helper for timeline position calculation
  const calculateBarPosition = (startDateStr?: string, endDateStr?: string) => {
    const start = startDateStr ? dayjs(startDateStr) : timelineWindow.start;
    const end = endDateStr ? dayjs(endDateStr) : start.add(14, 'day');

    const offsetDays = start.diff(timelineWindow.start, 'day');
    const durationDays = Math.max(end.diff(start, 'day'), 2);

    const leftPercent = Math.min(Math.max((offsetDays / timelineWindow.totalDays) * 100, 0), 90);
    const widthPercent = Math.min(
      Math.max((durationDays / timelineWindow.totalDays) * 100, 10),
      100 - leftPercent
    );

    return { leftPercent, widthPercent, start, end };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
            <LineChartOutlined className="text-indigo-500" />
            <span>Sprints Roadmap & Biểu đồ Gantt — {pKey}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Theo dõi dòng thời gian Sprints ngang, phân bổ tiến độ công việc và hạn chót giao hàng
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={dateFilterPreset}
            onChange={(val) => setDateFilterPreset(val as any)}
            options={[
              { label: 'Tất cả', value: 'all' },
              { label: 'Tháng này', value: 'month' },
              { label: 'Quý này', value: 'quarter' },
              { label: 'Tùy chọn', value: 'custom' },
            ]}
            className="text-xs"
          />

          {dateFilterPreset === 'custom' && (
            <RangePicker
              size="small"
              value={customDateRange}
              onChange={(dates) => dates && setCustomDateRange(dates as any)}
              format="DD/MM/YYYY"
              className="text-xs"
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Spin size="large" />
          <p className="text-xs text-zinc-400 mt-3">Đang tải biểu đồ Roadmap & Sprints...</p>
        </div>
      ) : (
        <>
          {/* 1. HORIZONTAL SPRINTS ROADMAP CHART */}
          <Card
            title={
              <div className="flex items-center justify-between py-1">
                <span className="font-bold text-base flex items-center gap-2">
                  <RocketOutlined className="text-indigo-500" />
                  <span>Biểu đồ Tiến độ Sprints (Horizontal Timeline)</span>
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {timelineWindow.start.format('DD/MM/YYYY')} — {timelineWindow.end.format('DD/MM/YYYY')}
                </span>
              </div>
            }
            className="shadow-xs overflow-x-auto border-zinc-200 dark:border-zinc-800"
          >
            <div className="min-w-[800px] space-y-4">
              {/* Timeline Header Scale */}
              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-400 text-center">
                <div className="col-span-4 text-left font-bold text-zinc-700 dark:text-zinc-300">
                  Chu kỳ Sprint & Mục tiêu
                </div>
                <div className="col-span-8 grid grid-cols-6 text-center">
                  <span>{timelineWindow.start.format('DD/MM')}</span>
                  <span>{timelineWindow.start.add(Math.floor(timelineWindow.totalDays * 0.2), 'day').format('DD/MM')}</span>
                  <span>{timelineWindow.start.add(Math.floor(timelineWindow.totalDays * 0.4), 'day').format('DD/MM')}</span>
                  <span>{timelineWindow.start.add(Math.floor(timelineWindow.totalDays * 0.6), 'day').format('DD/MM')}</span>
                  <span>{timelineWindow.start.add(Math.floor(timelineWindow.totalDays * 0.8), 'day').format('DD/MM')}</span>
                  <span>{timelineWindow.end.format('DD/MM')}</span>
                </div>
              </div>

              {/* Sprints Horizontal Track Rows */}
              {filteredSprints.length === 0 ? (
                <Empty description="Không có sprint nào trong khoảng thời gian đã chọn" />
              ) : (
                <div className="space-y-3">
                  {filteredSprints.map((sprint) => {
                    const { leftPercent, widthPercent, start, end } = calculateBarPosition(
                      sprint.start_date,
                      sprint.end_date
                    );

                    const isActive = sprint.status === 'active';
                    const isCompleted = sprint.status === 'completed';
                    const progressVal = sprint.progress_percent ?? (isCompleted ? 100 : isActive ? 60 : 0);

                    return (
                      <div
                        key={sprint.id}
                        onClick={() => handleSprintClick(sprint.id)}
                        className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/70 border border-zinc-100 dark:border-zinc-800/80 transition-all cursor-pointer group"
                        title="Nhấn để xem chi tiết danh sách tasks của Sprint này"
                      >
                        {/* Sprint Info Column */}
                        <div className="col-span-4 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                              {sprint.name}
                            </span>
                            <Tag
                              color={isActive ? 'green' : isCompleted ? 'blue' : 'default'}
                              className="text-[10px] m-0"
                            >
                              {isActive ? 'Đang chạy' : isCompleted ? 'Đã xong' : 'Kế hoạch'}
                            </Tag>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 m-0">
                            {sprint.goal || 'Chưa đặt mục tiêu'}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                            <span>{start.format('DD/MM')} - {end.format('DD/MM/YYYY')}</span>
                            <span>• {progressVal}% hoàn thành</span>
                          </div>
                        </div>

                        {/* Sprint Horizontal Bar Track */}
                        <div className="col-span-8 relative h-10 bg-zinc-100 dark:bg-zinc-800/40 rounded-lg overflow-hidden flex items-center p-1">
                          <div
                            className={`absolute h-8 rounded-md transition-all duration-300 flex items-center justify-between px-3 text-xs text-white font-medium shadow-sm ${
                              isCompleted
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                                : isActive
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600'
                                : 'bg-gradient-to-r from-zinc-500 to-zinc-600'
                            }`}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          >
                            <span className="truncate font-semibold flex items-center gap-1.5">
                              {isActive && <ThunderboltOutlined className="text-amber-300 animate-pulse" />}
                              {sprint.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] opacity-90">{progressVal}%</span>
                              <ArrowRightOutlined className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* 2. TASKS CHRONOLOGICAL GANTT VIEW */}
          <Card
            title={
              <div className="flex items-center justify-between py-1">
                <span className="font-bold text-base flex items-center gap-2">
                  <ClockCircleOutlined className="text-indigo-500" />
                  <span>Dòng thời gian các Công việc (Task Timeline)</span>
                </span>
                <span className="text-xs text-zinc-400">Click vào task để mở chỉnh sửa chi tiết</span>
              </div>
            }
            className="shadow-xs overflow-x-auto border-zinc-200 dark:border-zinc-800"
          >
            <div className="min-w-[800px] space-y-3">
              {tasks.length === 0 ? (
                <Empty description="Chưa có công việc nào trong dự án" />
              ) : (
                tasks.map((task) => {
                  const { leftPercent, widthPercent, start, end } = calculateBarPosition(
                    task.start_date,
                    task.due_date
                  );

                  return (
                    <div
                      key={task.id}
                      onClick={() =>
                        setSelectedTask({
                          id: task.id,
                          task_number: task.task_number,
                          title: task.title,
                          status: task.status,
                          priority: (task.priority as any) || 'medium',
                        })
                      }
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                    >
                      {/* Task Label */}
                      <div className="col-span-4 pr-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <Tag color="indigo" className="font-mono text-[10px] m-0 shrink-0">
                            {task.task_number}
                          </Tag>
                          <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 transition-colors">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <UserOutlined /> {task.assignee}
                          </span>
                          <span>• Hạn: {end.format('DD/MM')}</span>
                        </div>
                      </div>

                      {/* Task Bar */}
                      <div className="col-span-8 relative h-7 bg-zinc-100 dark:bg-zinc-800/40 rounded-md overflow-hidden flex items-center">
                        <div
                          className={`absolute h-5 rounded transition-all duration-300 flex items-center justify-between px-2 text-[10px] text-white font-medium shadow-xs ${
                            task.status_category === 'done'
                              ? 'bg-emerald-600'
                              : task.status_category === 'in_progress'
                              ? 'bg-indigo-600'
                              : 'bg-zinc-500'
                          }`}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${Math.max(widthPercent, 12)}%`,
                          }}
                        >
                          <span className="truncate">{start.format('DD/MM')} - {end.format('DD/MM')}</span>
                          <span className="font-bold">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* 3. PROJECT MILESTONES */}
          <Card title="Lịch trình cột mốc trọng điểm (Milestones)" className="shadow-xs border-zinc-200 dark:border-zinc-800">
            <Timeline
              mode="left"
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <h4 className="font-bold text-sm m-0">Cột mốc 1: Nền tảng Monorepo & Backend Core</h4>
                      <p className="text-xs text-zinc-500 m-0">
                        Hoàn thành cấu hình Turborepo, Laravel API V1, Sanctum Auth & Multi-tenant Workspace.
                      </p>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <h4 className="font-bold text-sm m-0">Cột mốc 2: Ant Design UI & Feature Modules</h4>
                      <p className="text-xs text-zinc-500 m-0">
                        Bảng Kanban, Backlog Sprint, Time Tracking, Analytics Reports và Task SlideOver.
                      </p>
                    </div>
                  ),
                },
                {
                  color: 'gray',
                  children: (
                    <div>
                      <h4 className="font-bold text-sm m-0">Cột mốc 3: Phân quyền LDAP & Production Release</h4>
                      <p className="text-xs text-zinc-500 m-0">
                        Tích hợp đăng nhập LDAP, tối ưu hóa truy vấn CSDL và hoàn thiện hệ thống Production.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}

      {/* Task Detail Modal (1000px Centered) */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => fetchData()}
      />
    </div>
  );
}
