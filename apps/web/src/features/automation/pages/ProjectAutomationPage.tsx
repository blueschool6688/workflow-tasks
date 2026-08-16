'use client';

import * as React from 'react';
import { Lightning, Plus, CheckCircle, ToggleLeft, ToggleRight } from '@phosphor-icons/react';

export function ProjectAutomationPage({ projectKey }: { projectKey: string }) {
  const [rules, setRules] = React.useState([
    {
      id: 1,
      name: 'Tự động gán người kiểm thử khi Task chuyển sang Review',
      trigger: 'Khi trạng thái đổi thành In Review',
      action: 'Gán Assignee = Elena R. & Thêm label "Review-Needed"',
      active: true,
    },
    {
      id: 2,
      name: 'Cảnh báo khi Task cận hạn 24h',
      trigger: 'Khi hạn chót còn dưới 24 giờ',
      action: 'Gửi thông báo Telegram Bot & đổi Priority = Urgent',
      active: true,
    },
    {
      id: 3,
      name: 'Tự động tạo Checklist kiểm thử khi tạo Story',
      trigger: 'Khi tạo Task dạng Story',
      action: 'Thêm 4 mục Checklist mặc định',
      active: false,
    },
  ]);

  const toggleRule = (id: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Lightning size={24} className="text-accent-500" />
            <span>Tự động hóa Quy trình (Automation) — {projectKey.toUpperCase()}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Thiết lập các quy tắc Trigger → Condition → Action tự động cho dự án.
          </p>
        </div>

        <button className="px-3.5 py-2 text-xs font-semibold text-white bg-accent-600 hover:bg-accent-700 rounded-lg focus-ring tactile-btn flex items-center gap-1.5 shadow-xs cursor-pointer">
          <Plus size={16} />
          <span>Tạo quy tắc mới</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-4 shadow-2xs"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {rule.name}
                </h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                    rule.active
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {rule.active ? 'Đang bật' : 'Đã tắt'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-medium">
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 font-mono">
                  Khi: {rule.trigger}
                </span>
                <span>→</span>
                <span className="bg-accent-50 dark:bg-accent-950/60 text-accent-700 dark:text-accent-300 px-2 py-0.5 rounded font-mono">
                  Thì: {rule.action}
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleRule(rule.id)}
              className="text-zinc-400 hover:text-accent-500 transition-colors shrink-0"
              title="Bật/Tắt quy tắc"
            >
              {rule.active ? (
                <ToggleRight size={32} className="text-accent-500" />
              ) : (
                <ToggleLeft size={32} className="text-zinc-400" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
