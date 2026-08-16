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
import { getKanbanBoardApi, updateTaskStatusApi, KanbanColumnData, KanbanTask } from '../api/boardApi';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import { BoardFilterBar } from '../components/BoardFilterBar';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { Spin, Button, App } from 'antd';
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';

export function KanbanBoardPage({ projectKey }: { projectKey: string }) {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const sprintIdParam = searchParams.get('sprintId');

  const [columns, setColumns] = React.useState<KanbanColumnData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTask, setActiveTask] = React.useState<KanbanTask | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<KanbanTask | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Filters
  const [search, setSearch] = React.useState('');
  const [selectedPriority, setSelectedPriority] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = React.useState<string | null>(null);
  const [selectedTester, setSelectedTester] = React.useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = React.useState<string | null>(sprintIdParam);

  React.useEffect(() => {
    if (sprintIdParam) {
      setSelectedSprint(sprintIdParam);
    }
  }, [sprintIdParam]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const fetchBoard = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getKanbanBoardApi(projectKey);
      setColumns(data);
    } catch {
      message.error('Không thể tải dữ liệu Kanban Board');
    } finally {
      setIsLoading(false);
    }
  }, [projectKey]);

  React.useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

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

    // Locate source and target column index
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

    // Apply optimistic state update
    setColumns((prevCols) => {
      const newCols = prevCols.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const sourceTasks = newCols[sourceColIndex].tasks;
      const targetTasks = newCols[targetColIndex].tasks;

      const activeIndex = sourceTasks.findIndex((t) => String(t.id) === activeId);
      if (activeIndex === -1) return prevCols;

      const [removed] = sourceTasks.splice(activeIndex, 1);
      if (!removed) return prevCols;

      if (sourceColIndex === targetColIndex) {
        const overIndex = targetTasks.findIndex((t) => String(t.id) === overId);
        const insertIndex = overIndex >= 0 ? overIndex : targetTasks.length;
        targetTasks.splice(insertIndex, 0, removed);
      } else {
        removed.status = targetStatusId;
        const overIndex = targetTasks.findIndex((t) => String(t.id) === overId);
        if (overIndex >= 0) {
          targetTasks.splice(overIndex, 0, removed);
        } else {
          targetTasks.push(removed);
        }
      }

      return newCols;
    });

    // Sync with backend API
    try {
      await updateTaskStatusApi(activeId, targetStatusId);
    } catch {
      // Keep optimistic UI update
    }
  };

  const handleTaskUpdated = (updatedFields: any) => {
    if (!selectedTask) return;
    setColumns((prevCols) =>
      prevCols.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) =>
          t.id === selectedTask.id ? { ...t, ...updatedFields } : t
        ),
      }))
    );
  };

  const handleTaskDeleted = (deletedTaskId: string) => {
    setColumns((prevCols) =>
      prevCols.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== deletedTaskId),
      }))
    );
  };

  const handleTaskCreated = () => {
    fetchBoard();
  };

  // Filter tasks based on search, status, priority, assignee, and tester
  const filteredColumns = columns
    .filter((col) => !selectedStatus || col.id === selectedStatus)
    .map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.task_number || t.id).toLowerCase().includes(search.toLowerCase());
        const matchesPriority = !selectedPriority || t.priority === selectedPriority;
        const matchesAssignee =
          !selectedAssignee ||
          (t.assignee?.name && t.assignee.name.toLowerCase().includes(selectedAssignee.toLowerCase()));
        return matchesSearch && matchesPriority && matchesAssignee;
      }),
    }));

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <AppstoreOutlined className="text-indigo-500 text-xl" />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight m-0">
            Bảng Kanban ({projectKey.toUpperCase()})
          </h1>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-indigo-600"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Tạo nhiệm vụ mới
        </Button>
      </div>

      {/* Filter Bar */}
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
        selectedSprint={selectedSprint}
        onSprintChange={setSelectedSprint}
        onClear={() => {
          setSearch('');
          setSelectedPriority(null);
          setSelectedStatus(null);
          setSelectedAssignee(null);
          setSelectedTester(null);
          setSelectedSprint(null);
        }}
      />

      {/* Board Scroll Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
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
    </div>
  );
}
