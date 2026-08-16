'use client';

import * as React from 'react';
import {
  CheckCircle,
  Clock,
  WarningCircle,
  ListNumbers,
  Plus,
  ArrowUpRight,
  UserCheck,
} from '@phosphor-icons/react';

export function MyWorkDashboard() {
  const stats = [
    { label: 'Công việc mở', value: '14', icon: ListNumbers, color: 'text-indigo-500' },
    { label: 'Hạn hôm nay', value: '3', icon: Clock, color: 'text-amber-500' },
    { label: 'Quá hạn', value: '1', icon: WarningCircle, color: 'text-red-500' },
    { label: 'Hoàn thành tuần này', value: '28', icon: CheckCircle, color: 'text-emerald-500' },
  ];

  const myTasks = [
    { id: 'PROJ-101', title: 'Thiết kế giao diện Dashboard theo chuẩn taste-skill', status: 'In Progress', priority: 'High', due: 'Hôm nay' },
    { id: 'PROJ-102', title: 'Tích hợp Sanctum token authentication & User Store', status: 'In Progress', priority: 'Urgent', due: 'Hôm nay' },
    { id: 'PROJ-103', title: 'Xây dựng Kanban Board kéo thả với dnd-kit', status: 'Todo', priority: 'Medium', due: 'Ngày mai' },
    { id: 'PROJ-104', title: 'Cấu hình OpenAPI Scramble & TypeScript generator', status: 'Done', priority: 'Low', due: '14/08' },
  ];

  const recentActivities = [
    { id: 1, text: 'Bạn đã hoàn thành công việc PROJ-104', time: '10 phút trước' },
    { id: 2, text: 'Nguyễn Văn A đã gán PROJ-102 cho bạn', time: '1 giờ trước' },
    { id: 3, text: 'Trần Thị B đã thêm bình luận vào PROJ-101', time: '3 giờ trước' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Tổng quan công việc
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Theo dõi nhiệm vụ cá nhân và hoạt động gần đây của dự án.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-xs font-semibold text-white bg-accent-600 hover:bg-accent-700 active:bg-accent-800 rounded-lg focus-ring tactile-btn flex items-center gap-1.5 shadow-xs cursor-pointer">
            <Plus size={16} />
            <span>Nhiệm vụ mới</span>
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between shadow-2xs"
            >
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {item.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 ${item.color}`}>
                <Icon size={22} weight="bold" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: My Tasks (left 2/3) + Activity Feed (right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - My Tasks Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <UserCheck size={18} className="text-accent-500" />
              <span>Công việc đang được giao ({myTasks.length})</span>
            </h2>
            <button className="text-xs font-semibold text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1">
              <span>Xem tất cả</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4 font-semibold">Mã</th>
                  <th className="py-2.5 px-4 font-semibold">Tên công việc</th>
                  <th className="py-2.5 px-4 font-semibold">Trạng thái</th>
                  <th className="py-2.5 px-4 font-semibold">Độ ưu tiên</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Hạn chót</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                {myTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-accent-600 dark:text-accent-400">
                      {t.id}
                    </td>
                    <td className="py-3 px-4 text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          t.status === 'Done'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : t.status === 'In Progress'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold ${
                          t.priority === 'Urgent'
                            ? 'text-red-600 dark:text-red-400'
                            : t.priority === 'High'
                            ? 'text-orange-500'
                            : 'text-zinc-500'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 font-mono text-[11px]">
                      {t.due}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Hoạt động gần đây
          </h2>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 space-y-4 shadow-2xs">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 items-start text-xs">
                <div className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                    {act.text}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
