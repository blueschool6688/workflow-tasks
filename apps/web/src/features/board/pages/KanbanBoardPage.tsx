'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { getKanbanBoardFullApi, updateTaskStatusApi, KanbanColumnData, KanbanTask } from '../api/boardApi';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import { BoardFilterBar } from '../components/BoardFilterBar';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { ProjectWorkflowModal } from '@/features/workflow/components/ProjectWorkflowModal';
import { Spin, Button, App, Tag, Select, Progress, Space } from 'antd';
import {
  AppstoreOutlined,
  PlusOutlined,
  BranchesOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
  ArrowRightOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';

interface SprintOption {
  id: string;
  name: string;
  goal?: string;
  status: 'active' | 'future' | 'completed';
  start_date?: string;
  end_date?: string;
}

interface KanbanBoardPageProps {
  projectKey: string;
  sprintId?: string;
}

export function KanbanBoardPage({ projectKey, sprintId }: KanbanBoardPageProps) {
  const { message } = App.useApp();
  const router = useRouter();
  const pKey = projectKey.toUpperCase();

  const [sprints, setSprints] = React.useState<SprintOption[]>([]);
  const [currentSprintId, setCurrentSprintId] = React.useState<string>(sprintId || 'sprint-24');

  const [columns, setColumns] = React.useState<KanbanColumnData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTask, setActiveTask] = React.useState<KanbanTask | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<KanbanTask | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [canManageWorkflow, setCanManageWorkflow] = React.useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = React.useState(false);

  // Filters
  const [search, setSearch] = React.useState('');
  const [selectedPriority, setSelectedPriority] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = React.useState<string | null>(null);
  const [selectedTester, setSelectedTester] = React.useState<string | null>(null);

  // Sync sprintId prop with state
  React.useEffect(() => {
    if (sprintId) {
      setCurrentSprintId(sprintId);
    }
  }, [sprintId]);

  // Fetch Sprints for this project
  const fetchSprints = React.useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectKey}/sprints`);
      const list = res.data?.data || [];
      if (list.length > 0) {
        setSprints(list);
        if (!sprintId) {
          const active = list.find((s: any) => s.status === 'active') || list[0];
          setCurrentSprintId(active.id);
        }
      }
    } catch {
      // Fallback sample sprints
      setSprints([
        {
          id: 'sprint-24',
          name: 'Sprint 24 (Sprint Hiện Tại)',
          goal: 'Hoàn thiện hệ thống xác thực, phân quyền và giao diện Task Detail.',
          status: 'active',
          start_date: '2026-08-15',
          end_date: '2026-08-29',
        },
        {
          id: 'sprint-25',
          name: 'Sprint 25 (Kế hoạch tiếp theo)',
          goal: 'Tích hợp cổng thông báo Reverb WebSockets và xuất báo cáo PDF/Excel.',
          status: 'future',
          start_date: '2026-08-30',
          end_date: '2026-09-13',
        },
      ]);
    }
  }, [projectKey, sprintId]);

  React.useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const activeSprintInfo = sprints.find((s) => s.id === currentSprintId) || {
    id: currentSprintId,
    name: currentSprintId === 'backlog' ? '📦 Backlog (Chưa phân Sprint)' : `Sprint ${currentSprintId}`,
    status: currentSprintId === 'sprint-24' ? 'active' : 'future',
    goal: 'Tập trung triển khai các tính năng cốt lõi theo kế hoạch của Sprint.',
    start_date: '15/08/2026',
    end_date: '29/08/2026',
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const fetchBoard = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getKanbanBoardFullApi(projectKey, currentSprintId);
      setColumns(res.columns);
      setCanManageWorkflow(res.can_manage_workflow);
    } catch {
      message.error('Không thể tải dữ liệu Kanban Board');
    } finally {
      setIsLoading(false);
    }
  }, [projectKey, currentSprintId, message]);

  React.useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleSprintChange = (newSprintId: string | null) => {
    if (newSprintId) {
      setCurrentSprintId(newSprintId);
      router.push(`/projects/${projectKey}/sprints/${newSprintId}/board`);
    } else {
      setCurrentSprintId('');
      router.push(`/projects/${projectKey}/board`);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);
    for (const col of columns) {
      const found = col.tasks.find((t) => String(t.id) === activeId);
      if (found) {
        setActiveTask(found);
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    let sourceColIndex = -1;
    let targetColIndex = -1;
    let taskToMove: KanbanTask | undefined;

    columns.forEach((col, idx) => {
      const found = col.tasks.find((t) => String(t.id) === activeId);
      if (found) {
        sourceColIndex = idx;
        taskToMove = { ...found };
      }
      if (String(col.id) === overId || col.tasks.some((t) => String(t.id) === overId)) {
        targetColIndex = idx;
      }
    });

    if (sourceColIndex === -1 || targetColIndex === -1 || !taskToMove) return;

    const targetStatusId = columns[targetColIndex].id;

    setColumns((prevCols) => {
      const newCols = prevCols.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const sourceTasks = newCols[sourceColIndex].tasks;
      const targetTasks = newCols[targetColIndex].tasks;

      const activeIndex = sourceTasks.findIndex((t) => String(t.id) === activeId);
      if (activeIndex === -1) return prevCols;

      sourceTasks.splice(activeIndex, 1);

      taskToMove!.status = targetStatusId;

      const overIndex = targetTasks.findIndex((t) => String(t.id) === overId);
      if (overIndex >= 0) {
        targetTasks.splice(overIndex, 0, taskToMove!);
      } else {
        targetTasks.push(taskToMove!);
      }

      return newCols;
    });

    try {
      await updateTaskStatusApi(activeId, targetStatusId);
      message.success(`Đã chuyển task sang "${columns[targetColIndex].title}"`);
    } catch {
      message.error('Không thể cập nhật trạng thái task trên máy chủ');
      fetchBoard();
    }
  };

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    fetchBoard();
    message.success('Đã tạo nhiệm vụ mới');
  };

  const handleTaskUpdated = () => {
    fetchBoard();
  };

  const handleTaskDeleted = () => {
    setSelectedTask(null);
    fetchBoard();
  };

  // Compute metrics
  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const doneTasks = columns
    .filter((col) => col.category === 'done' || col.title.toLowerCase().includes('hoàn'))
    .reduce((acc, col) => acc + col.tasks.length, 0);
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Filter columns
  const filteredColumns = columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.task_number || t.id).toLowerCase().includes(search.toLowerCase());
      const matchesPriority = !selectedPriority || t.priority === selectedPriority;
      const matchesStatus = !selectedStatus || col.id === selectedStatus;
      const matchesAssignee =
        !selectedAssignee ||
        (t.assignee?.name && t.assignee.name.toLowerCase().includes(selectedAssignee.toLowerCase()));
      return matchesSearch && matchesPriority && matchesStatus && matchesAssignee;
    }),
  }));

  return (
    <div className="space-y-4 h-full flex flex-col max-w-7xl mx-auto">
      {/* 1. Workflow Header: Project -> Sprints -> Tasks Board */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <span>Dự án ({pKey})</span>
              <span>➔</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Chu kỳ Sprint</span>
              <span>➔</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">Bảng Tasks Board</span>
            </div>

            {/* Sprint Switcher Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BranchesOutlined className="text-indigo-500" />
                <span>Bảng Kanban:</span>
              </span>

              <Select
                value={currentSprintId}
                onChange={handleSprintChange}
                size="middle"
                className="min-w-[240px] font-bold"
                options={[
                  ...sprints.map((s) => ({
                    value: s.id,
                    label: (
                      <div className="flex items-center justify-between gap-2 py-0.5">
                        <span className="font-semibold">{s.name}</span>
                        <Tag color={s.status === 'active' ? 'green' : s.status === 'completed' ? 'blue' : 'default'} className="m-0 text-[10px]">
                          {s.status === 'active' ? 'Đang chạy' : s.status === 'completed' ? 'Đã xong' : 'Kế hoạch'}
                        </Tag>
                      </div>
                    ),
                  })),
                  {
                    value: 'backlog',
                    label: <span className="text-zinc-500">📦 Backlog (Chưa phân Sprint)</span>,
                  },
                ]}
              />

              <Tag
                color={activeSprintInfo.status === 'active' ? 'green' : activeSprintInfo.status === 'completed' ? 'blue' : 'default'}
                className="font-bold text-xs py-0.5 px-2.5"
              >
                {activeSprintInfo.status === 'active' ? '● ĐANG DIỄN RA' : activeSprintInfo.status === 'completed' ? '✓ ĐÃ HOÀN THÀNH' : '○ KẾ HOẠCH'}
              </Tag>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {canManageWorkflow && (
              <Button
                icon={<ApartmentOutlined className="text-indigo-500" />}
                onClick={() => setIsWorkflowModalOpen(true)}
                className="font-medium hover:border-indigo-500"
              >
                Thiết lập Quy trình
              </Button>
            )}
            <Button
              icon={<UnorderedListOutlined />}
              onClick={() => router.push(`/projects/${projectKey}/backlog?sprintId=${currentSprintId}`)}
            >
              Quản lý Backlog
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-indigo-600 font-medium"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Tạo nhiệm vụ
            </Button>
          </div>
        </div>

        {/* Sprint Goal & Progress Mini-Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="text-zinc-500 max-w-xl truncate">
            <strong>Mục tiêu:</strong> {activeSprintInfo.goal || 'Tập trung hoàn thành các nhiệm vụ theo kế hoạch.'}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-zinc-400 flex items-center gap-1 font-mono">
              <CalendarOutlined />
              <span>{activeSprintInfo.start_date || '15/08'} → {activeSprintInfo.end_date || '29/08'}</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-bold">
                Tiến độ:
              </span>
              <div className="w-24">
                <Progress
                  percent={progressPercent}
                  size="small"
                  strokeColor={{
                    '0%': '#6366f1',
                    '100%': '#10b981',
                  }}
                  showInfo={false}
                />
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                {doneTasks}/{totalTasks}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Board Filter Bar */}
      <BoardFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        selectedTester={selectedTester}
        onTesterChange={setSelectedTester}
        selectedSprint={currentSprintId}
        onSprintChange={handleSprintChange}
        onClear={() => {
          setSearch('');
          setSelectedPriority(null);
          setSelectedStatus(null);
          setSelectedAssignee(null);
          setSelectedTester(null);
        }}
      />

      {/* 3. Board Drag-and-Drop Area */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-2">
          <Spin size="large" />
          <span className="text-xs text-zinc-400">Đang tải bảng Kanban cho {activeSprintInfo.name}...</span>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto pb-4 flex gap-4 items-start min-h-[500px]">
            {filteredColumns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                onClickTask={(task) => setSelectedTask(task)}
              />
            ))}
          </div>

          <DragOverlay>{activeTask ? <KanbanCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      )}

      {/* 1000px Centered Modal for Task Detail */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectKey={projectKey}
        onSuccess={handleTaskCreated}
      />

      {/* Project Workflow Configuration Modal */}
      <ProjectWorkflowModal
        open={isWorkflowModalOpen}
        projectKey={projectKey}
        onClose={() => setIsWorkflowModalOpen(false)}
        onWorkflowUpdated={fetchBoard}
      />
    </div>
  );
}
