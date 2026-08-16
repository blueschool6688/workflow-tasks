'use client';

import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanTask } from '../api/boardApi';
import { CheckSquare, Clock } from '@phosphor-icons/react';

interface KanbanCardProps {
  task: KanbanTask;
  onClickTask?: (task: KanbanTask) => void;
}

export function KanbanCard({ task, onClickTask }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    urgent: 'bg-red-500 text-red-500',
    high: 'bg-orange-500 text-orange-500',
    medium: 'bg-amber-500 text-amber-500',
    low: 'bg-zinc-400 text-zinc-400',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClickTask?.(task)}
      className={`p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing group ${
        isDragging ? 'opacity-40 scale-[0.98] border-accent-500' : ''
      }`}
    >
      {/* Top Row: Key & Priority */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-accent-600 dark:text-accent-400 group-hover:underline">
          {task.task_number || task.id}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority].split(' ')[0]}`} />
          <span className={`text-[10px] font-bold uppercase ${priorityColors[task.priority].split(' ')[1]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {task.labels.map((l) => (
            <span
              key={l}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 font-medium">
        <div className="flex items-center gap-3">
          {task.checklist_progress && (
            <span className="flex items-center gap-1 text-zinc-500">
              <CheckSquare size={13} />
              <span>
                {task.checklist_progress.completed}/{task.checklist_progress.total}
              </span>
            </span>
          )}
          {task.estimate && (
            <span className="flex items-center gap-1">
              <Clock size={13} />
              <span>{task.estimate}</span>
            </span>
          )}
        </div>

        {task.assignee && (
          <div
            className="w-5 h-5 rounded-full bg-accent-600 text-white font-bold flex items-center justify-center text-[10px]"
            title={task.assignee.name}
          >
            {task.assignee.name.substring(0, 1).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
