'use client';

import * as React from 'react';
import { X, CheckSquare, Paperclip, Clock, ChatCircleText, Calendar, User, Warning } from '@phosphor-icons/react';
import { KanbanTask } from '../../board/api/boardApi';

interface TaskDetailSlideOverProps {
  task: KanbanTask | null;
  onClose: () => void;
}

export function TaskDetailSlideOver({ task, onClose }: TaskDetailSlideOverProps) {
  const [activeTab, setActiveTab] = React.useState<'desc' | 'checklist' | 'attachments' | 'activity'>('desc');
  const [title, setTitle] = React.useState(task?.title || '');
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
    }
  }, [task]);

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-2xs transition-opacity" onClick={onClose} />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-[100dvh] z-10 transition-transform duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/60 px-2 py-0.5 rounded">
              {task.id}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Chi tiết công việc
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Title Click-to-Edit */}
          <div className="space-y-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
                className="w-full text-lg font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-accent-500 focus:outline-none"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 p-1 -ml-1 rounded transition-colors cursor-pointer"
                title="Click để chỉnh sửa tiêu đề"
              >
                {title}
              </h2>
            )}
          </div>

          {/* Quick Metadata Bar */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Trạng thái</span>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-500" />
                <span className="capitalize">{task.status}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Độ ưu tiên</span>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                {task.priority}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Người thực hiện</span>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <User size={14} className="text-zinc-400" />
                <span>{task.assignee?.name || 'Chưa gán'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Hạn hoàn thành</span>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Calendar size={14} className="text-zinc-400" />
                <span>Chưa đặt</span>
              </div>
            </div>
          </div>

          {/* Body Tabs Header */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold gap-4">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 transition-colors border-b-2 -mb-px ${
                activeTab === 'desc'
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Mô tả
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`pb-2 transition-colors border-b-2 -mb-px ${
                activeTab === 'checklist'
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Checklist ({task.checklist_progress?.completed || 0}/{task.checklist_progress?.total || 0})
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`pb-2 transition-colors border-b-2 -mb-px ${
                activeTab === 'attachments'
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Đính kèm
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-2 transition-colors border-b-2 -mb-px ${
                activeTab === 'activity'
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Lịch sử
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'desc' && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Đây là mô tả chi tiết nhiệm vụ. Hỗ trợ định dạng Markdown và chỉnh sửa trực tiếp.
                </p>
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="space-y-3">
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-accent-500 h-full transition-all duration-300"
                    style={{
                      width: `${
                        task.checklist_progress
                          ? (task.checklist_progress.completed / task.checklist_progress.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-500">Danh sách các đầu việc nhỏ cần hoàn thành.</p>
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-2">
                <Paperclip size={24} className="mx-auto text-zinc-400" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Kéo thả file đính kèm vào đây
                </p>
                <p className="text-[11px] text-zinc-400">Hỗ trợ hình ảnh, tài liệu PDF, zip (Tối đa 20MB)</p>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-3 text-xs">
                <div className="flex gap-2.5 items-start">
                  <div className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Nguyễn Văn A đã tạo nhiệm vụ này
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">2 giờ trước</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
