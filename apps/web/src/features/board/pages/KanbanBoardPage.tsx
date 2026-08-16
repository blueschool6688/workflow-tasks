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
import { arrayMove } from '@dnd-kit/sortable';
import { getKanbanBoardApi, KanbanColumnData, KanbanTask } from '../api/boardApi';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import { BoardFilterBar } from '../components/BoardFilterBar';
import { TaskDetailSlideOver } from '@/features/tasks/components/TaskDetailSlideOver';
import { CircleNotch, Kanban } from '@phosphor-icons/react';

export function KanbanBoardPage({ projectKey }: { projectKey: string }) {
  const [columns, setColumns] = React.useState<KanbanColumnData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTask, setActiveTask] = React.useState<KanbanTask | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<KanbanTask | null>(null);

  const [search, setSearch] = React.useState('');
  const [selectedPriority, setSelectedPriority] = React.useState<string | null>(null);

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
    } finally {
      setIsLoading(false);
    }
  }, [projectKey]);

  React.useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    for (const col of columns) {
      const found = col.tasks.find((t) => t.id === active.id);
      if (found) {
        setActiveTask(found);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find source and target column
    let sourceColIndex = -1;
    let targetColIndex = -1;

    columns.forEach((col, idx) => {
      if (col.tasks.some((t) => t.id === activeId)) sourceColIndex = idx;
      if (col.id === overId || col.tasks.some((t) => t.id === overId)) targetColIndex = idx;
    });

    if (sourceColIndex === -1 || targetColIndex === -1) return;

    setColumns((prevCols) => {
      const newCols = [...prevCols];
      const sourceTasks = [...newCols[sourceColIndex].tasks];
      const targetTasks =
        sourceColIndex === targetColIndex ? sourceTasks : [...newCols[targetColIndex].tasks];

      const activeTaskIndex = sourceTasks.findIndex((t) => t.id === activeId);
      const [movedTask] = sourceTasks.splice(activeTaskIndex, 1);

      if (sourceColIndex === targetColIndex) {
        const overTaskIndex = targetTasks.findIndex((t) => t.id === overId);
        const reordered = arrayMove(targetTasks, activeTaskIndex, overTaskIndex);
        newCols[sourceColIndex].tasks = reordered;
      } else {
        movedTask.status = newCols[targetColIndex].id;
        const overTaskIndex = targetTasks.findIndex((t) => t.id === overId);
        if (overTaskIndex >= 0) {
          targetTasks.splice(overTaskIndex, 0, movedTask);
        } else {
          targetTasks.push(movedTask);
        }
        newCols[sourceColIndex].tasks = sourceTasks;
        newCols[targetColIndex].tasks = targetTasks;
      }

      return newCols;
    });
  };

  // Filter tasks based on search and priority
  const filteredColumns = columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = !selectedPriority || t.priority === selectedPriority;
      return matchesSearch && matchesPriority;
    }),
  }));

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Kanban size={22} className="text-accent-500" />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
            Bảng Kanban ({projectKey.toUpperCase()})
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <BoardFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        onClear={() => {
          setSearch('');
          setSelectedPriority(null);
        }}
      />

      {/* Board Scroll Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <CircleNotch size={28} className="animate-spin text-accent-500" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto pb-4 flex gap-4 items-start">
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

      {/* Slide-over Detail */}
      <TaskDetailSlideOver task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}
