'use client';

import * as React from 'react';
import { X, CircleNotch, Kanban, ListChecks } from '@phosphor-icons/react';
import { createProjectApi } from '../api/projectApi';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [name, setName] = React.useState('');
  const [key, setKey] = React.useState('');
  const [type, setType] = React.useState<'scrum' | 'kanban'>('scrum');
  const [description, setDescription] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Auto-generate project key from name
  React.useEffect(() => {
    if (name.trim()) {
      const generated = name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 5);
      setKey(generated || 'PROJ');
    }
  }, [name]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) {
      setErrorMsg('Vui lòng nhập tên và mã dự án.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await createProjectApi({ name, key, type, description });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể tạo dự án. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Tạo dự án mới
            </h2>
            <p className="text-xs text-zinc-500">Bước {step} trên 2</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Tên dự án
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Core Engineering Platform"
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg focus-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Mã dự án (Key)
                  </label>
                  <input
                    type="text"
                    required
                    value={key}
                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg focus-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Mô hình làm việc
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('scrum')}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                        type === 'scrum'
                          ? 'border-accent-600 bg-accent-50 dark:bg-accent-950/60 text-accent-600 dark:text-accent-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <ListChecks size={14} />
                      <span>Scrum</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('kanban')}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                        type === 'kanban'
                          ? 'border-accent-600 bg-accent-50 dark:bg-accent-950/60 text-accent-600 dark:text-accent-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Kanban size={14} />
                      <span>Kanban</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Mô tả dự án
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả ngắn về mục tiêu dự án..."
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg focus-ring"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!name.trim() || !key.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-accent-600 hover:bg-accent-700 rounded-lg focus-ring tactile-btn disabled:opacity-50"
                >
                  Tiếp theo
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Quy trình Workflow mặc định
                </label>
                <div className="p-3 rounded-lg border border-accent-500 bg-accent-50/50 dark:bg-accent-950/40 space-y-1">
                  <p className="text-xs font-bold text-accent-700 dark:text-accent-300">
                    Standard Software Development Workflow
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Bao gồm các trạng thái: Todo → In Progress → In Review → Done. Có thể tùy chỉnh sau.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-accent-600 hover:bg-accent-700 rounded-lg focus-ring tactile-btn flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading && <CircleNotch size={14} className="animate-spin" />}
                  <span>Hoàn tất tạo dự án</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
