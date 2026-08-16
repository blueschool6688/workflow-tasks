'use client';

import * as React from 'react';
import { ListChecks, Plus, Play, CheckCircle } from '@phosphor-icons/react';

export function BacklogPage({ projectKey }: { projectKey: string }) {
  const [tasks, setTasks] = React.useState([
    { id: 'PROJ-110', title: 'Thiết kế Schema Workflow Status Engine', points: 5, status: 'In Progress', assignee: 'Alex K.' },
    { id: 'PROJ-111', title: 'Tạo API CRUD cho Sprint & Epic Lifecycle', points: 3, status: 'Todo', assignee: 'Sarah T.' },
    { id: 'PROJ-112', title: 'Tích hợp Tiptap Markdown & Mention Editor', points: 8, status: 'Todo', assignee: 'David L.' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newId = `PROJ-${Math.floor(100 + Math.random() * 900)}`;
    setTasks((prev) => [
      ...prev,
      { id: newId, title: newTaskTitle, points: 2, status: 'Todo', assignee: 'Alex K.' },
    ]);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ListChecks size={24} className="text-accent-500" />
            <span>Backlog & Sprint ({projectKey.toUpperCase()})</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Lập kế hoạch Sprint, sắp xếp thứ tự ưu tiên backlog và theo dõi Story Points.
          </p>
        </div>
      </div>

      {/* Active Sprint Section */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Sprint 1 (15 Tháng 8 - 29 Tháng 8)
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 uppercase">
              Đang diễn ra
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500">
              Tổng điểm: <strong className="text-zinc-900 dark:text-zinc-100">16pts</strong>
            </span>
            <button className="px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-1">
              <CheckCircle size={14} className="text-emerald-500" />
              <span>Hoàn tất Sprint</span>
            </button>
          </div>
        </div>

        {/* Task Rows in Sprint */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
          {tasks.slice(0, 2).map((t) => (
            <div
              key={t.id}
              className="py-2.5 px-2 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono font-bold text-accent-600 dark:text-accent-400 shrink-0">
                  {t.id}
                </span>
                <span className="text-zinc-900 dark:text-zinc-100 truncate font-medium">
                  {t.title}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                  {t.points} pts
                </span>
                <div className="w-5 h-5 rounded-full bg-accent-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {t.assignee.slice(0, 1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backlog Section */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Backlog ({tasks.length - 1} công việc chưa phân sprint)
          </h2>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
          {tasks.slice(1).map((t) => (
            <div
              key={t.id}
              className="py-2.5 px-2 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono font-bold text-accent-600 dark:text-accent-400 shrink-0">
                  {t.id}
                </span>
                <span className="text-zinc-900 dark:text-zinc-100 truncate font-medium">
                  {t.title}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                  {t.points} pts
                </span>
                <div className="w-5 h-5 rounded-full bg-accent-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {t.assignee.slice(0, 1)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inline Create Input */}
        <form onSubmit={handleAddTask} className="pt-2">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Tạo công việc mới (Nhấn Enter để lưu)..."
              className="w-full text-xs bg-transparent border-none focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
