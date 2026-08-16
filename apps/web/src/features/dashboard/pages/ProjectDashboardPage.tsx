'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartLineUp, CheckCircle, Clock, WarningCircle } from '@phosphor-icons/react';

export function ProjectDashboardPage({ projectKey }: { projectKey: string }) {
  // Burndown chart data
  const burndownData = [
    { day: 'Day 1', ideal: 40, actual: 40 },
    { day: 'Day 2', ideal: 35, actual: 38 },
    { day: 'Day 3', ideal: 30, actual: 32 },
    { day: 'Day 4', ideal: 25, actual: 28 },
    { day: 'Day 5', ideal: 20, actual: 20 },
    { day: 'Day 6', ideal: 15, actual: 16 },
    { day: 'Day 7', ideal: 10, actual: 10 },
  ];

  // Status breakdown data
  const statusData = [
    { name: 'Cần làm', value: 8, color: '#a1a1aa' },
    { name: 'Đang làm', value: 12, color: '#6366f1' },
    { name: 'Review', value: 4, color: '#f59e0b' },
    { name: 'Hoàn thành', value: 16, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ChartLineUp size={24} className="text-accent-500" />
            <span>Báo cáo & Dashboard ({projectKey.toUpperCase()})</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Biểu đồ Burndown, phân bổ khối lượng công việc và tiến độ Sprint.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Tổng công việc</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">40 tasks</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Tỷ lệ hoàn thành</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">40%</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Quá hạn</p>
          <p className="text-2xl font-bold text-red-500 mt-1">2 tasks</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Story Points đã xong</p>
          <p className="text-2xl font-bold text-indigo-500 mt-1">30 pts</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Burndown Chart (Left 2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Biểu đồ Sprint Burndown (Story Points)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Line type="monotone" dataKey="ideal" stroke="#a1a1aa" strokeDasharray="5 5" name="Lý thuyết" />
                <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={3} name="Thực tế" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart (Right 1 col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-2xs flex flex-col justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Phân bổ Trạng thái
          </h2>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-zinc-600 dark:text-zinc-400 truncate">{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
