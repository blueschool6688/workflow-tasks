'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, CaretLeft, CaretRight } from '@phosphor-icons/react';

export function ProjectCalendarPage({ projectKey }: { projectKey: string }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthName = 'Tháng 8, 2026';

  const scheduledTasks: Record<number, Array<{ id: string; title: string; color: string }>> = {
    15: [{ id: 'PROJ-101', title: 'Hạn chót Schema Multi-tenant', color: 'bg-indigo-500' }],
    18: [{ id: 'PROJ-102', title: 'Review Sanctum Auth', color: 'bg-amber-500' }],
    22: [{ id: 'PROJ-103', title: 'Sprint 1 Review Demo', color: 'bg-emerald-500' }],
    28: [{ id: 'PROJ-104', title: 'Complete Sprint 1', color: 'bg-red-500' }],
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarIcon size={24} className="text-accent-500" />
            <span>Lịch Công việc & Hạn chót ({projectKey.toUpperCase()})</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Xem công việc sắp tới và quản lý lịch trình làm việc theo tháng.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <CaretLeft size={16} />
          </button>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 px-2">
            {monthName}
          </span>
          <button className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <CaretRight size={16} />
          </button>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center py-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
          <div>CN</div>
          <div>Thứ 2</div>
          <div>Thứ 3</div>
          <div>Thứ 4</div>
          <div>Thứ 5</div>
          <div>Thứ 6</div>
          <div>Thứ 7</div>
        </div>

        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-xs">
          {days.map((day) => (
            <div
              key={day}
              className="min-h-[100px] p-2 space-y-1 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <span
                className={`font-mono text-xs font-bold inline-block px-1.5 py-0.5 rounded ${
                  day === 16
                    ? 'bg-accent-600 text-white'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {day}
              </span>

              {scheduledTasks[day]?.map((t) => (
                <div
                  key={t.id}
                  className={`p-1.5 rounded text-[10px] font-semibold text-white truncate shadow-2xs cursor-pointer ${t.color}`}
                  title={t.title}
                >
                  {t.id}: {t.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
