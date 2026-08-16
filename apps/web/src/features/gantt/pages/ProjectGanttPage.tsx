'use client';

import * as React from 'react';
import { ChartLine, Calendar, Clock } from '@phosphor-icons/react';

export function ProjectGanttPage({ projectKey }: { projectKey: string }) {
  const tasks = [
    { id: 'PROJ-101', title: 'Thiết kế Schema Multi-tenant', start: '15/08', due: '18/08', progress: 80, width: '40%' },
    { id: 'PROJ-102', title: 'Tích hợp Auth Sanctum & LDAP', start: '17/08', due: '22/08', progress: 50, width: '50%' },
    { id: 'PROJ-103', title: 'Kanban Board Drag-and-Drop', start: '20/08', due: '26/08', progress: 20, width: '60%' },
    { id: 'PROJ-104', title: 'Realtime Reverb Broadcasting', start: '24/08', due: '30/08', progress: 0, width: '55%' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ChartLine size={24} className="text-accent-500" />
            <span>Timeline & Gantt Chart ({projectKey.toUpperCase()})</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Theo dõi tiến độ tổng thể dự án theo dòng thời gian.
          </p>
        </div>
      </div>

      {/* Gantt Container */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-2xs overflow-x-auto">
        {/* Timeline Header scale */}
        <div className="grid grid-cols-6 gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 text-xs font-mono font-bold text-zinc-400">
          <div>Tên nhiệm vụ</div>
          <div>15 Aug</div>
          <div>18 Aug</div>
          <div>22 Aug</div>
          <div>26 Aug</div>
          <div>30 Aug</div>
        </div>

        {/* Task Rows */}
        <div className="space-y-3 text-xs font-medium">
          {tasks.map((t) => (
            <div key={t.id} className="grid grid-cols-6 gap-2 items-center py-1">
              <div className="truncate font-mono font-bold text-accent-600 dark:text-accent-400">
                {t.id}: <span className="font-sans text-zinc-800 dark:text-zinc-200 font-medium">{t.title}</span>
              </div>
              <div className="col-span-5 relative h-7 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg overflow-hidden flex items-center">
                <div
                  className="h-full bg-accent-500/80 border border-accent-600 rounded-lg flex items-center px-2 text-[10px] font-bold text-white shadow-xs"
                  style={{ width: t.width }}
                >
                  <span>{t.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
