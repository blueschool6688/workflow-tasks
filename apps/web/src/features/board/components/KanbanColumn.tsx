'use client';

import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumnData, KanbanTask } from '../api/boardApi';
import { KanbanCard } from './KanbanCard';
import { Plus, Warning } from '@phosphor-icons/react';

interface KanbanColumnProps {
  column: KanbanColumnData;
  onClickTask?: (task: KanbanTask) => void;
  onAddTask?: (statusId: string) => void;
}

export function KanbanColumn({ column, onClickTask, onAddTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  const isWipExceeded =
    column.wip_limit && column.wip_limit > 0 && column.tasks.length > column.wip_limit;

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 p-3.5 border space-y-3 flex flex-col max-h-full ${
        isWipExceeded
          ? 'border-amber-500/80 dark:border-amber-500/80 bg-amber-500/5'
          : 'border-zinc-200/60 dark:border-zinc-800/60'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            {column.title}
          </h3>
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
              isWipExceeded
                ? 'bg-amber-500 text-white'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {column.tasks.length}
            {column.wip_limit ? `/${column.wip_limit}` : ''}
          </span>
          {isWipExceeded && (
            <span title="Vượt giới hạn WIP Limit">
              <Warning size={14} className="text-amber-500" />
            </span>
          )}
        </div>

        <button
          onClick={() => onAddTask?.(column.id)}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
          title="Thêm công việc mới"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Task List (Sortable Area) */}
      <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClickTask={onClickTask} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
