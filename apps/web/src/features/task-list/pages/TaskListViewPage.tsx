'use client';

import * as React from 'react';
import { ListBullets, MagnifyingGlass, Funnel } from '@phosphor-icons/react';

export function TaskListViewPage({ projectKey }: { projectKey: string }) {
  const [tasks] = React.useState([
    { id: 'PROJ-101', title: 'Thiết kế Schema Multi-tenant Organization', status: 'Todo', priority: 'High', assignee: 'Alex K.', due: 'Hôm nay', points: 5 },
    { id: 'PROJ-102', title: 'Tích hợp Spatie Permission Shield & Policies', status: 'In Progress', priority: 'Urgent', assignee: 'Sarah T.', due: 'Hôm nay', points: 3 },
    { id: 'PROJ-103', title: 'Bảng Kanban kéo thả với dnd-kit & motion', status: 'In Progress', priority: 'High', assignee: 'David L.', due: 'Ngày mai', points: 8 },
    { id: 'PROJ-104', title: 'Cấu hình Scramble OpenAPI Generator', status: 'Done', priority: 'Low', due: '14/08', assignee: 'Elena R.', points: 2 },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ListBullets size={24} className="text-accent-500" />
            <span>Danh sách Công việc dạng Bảng ({projectKey.toUpperCase()})</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Xem công việc dưới dạng bảng dữ liệu mật độ cao, nhóm theo Trạng thái / Người thực hiện.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 font-semibold">Mã</th>
              <th className="py-3 px-4 font-semibold">Tên công việc</th>
              <th className="py-3 px-4 font-semibold">Trạng thái</th>
              <th className="py-3 px-4 font-semibold">Độ ưu tiên</th>
              <th className="py-3 px-4 font-semibold">Người thực hiện</th>
              <th className="py-3 px-4 font-semibold text-right">Story Points</th>
              <th className="py-3 px-4 font-semibold text-right">Hạn chót</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer">
                <td className="py-3.5 px-4 font-mono font-bold text-accent-600 dark:text-accent-400">{t.id}</td>
                <td className="py-3.5 px-4 text-zinc-900 dark:text-zinc-100 font-semibold">{t.title}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {t.status}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`text-[11px] font-bold uppercase ${t.priority === 'Urgent' ? 'text-red-500' : 'text-amber-500'}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">{t.assignee}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold">{t.points} pts</td>
                <td className="py-3.5 px-4 text-right font-mono text-zinc-500">{t.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
