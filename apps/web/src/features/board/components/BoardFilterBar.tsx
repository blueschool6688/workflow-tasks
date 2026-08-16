'use client';

import * as React from 'react';
import { MagnifyingGlass, Funnel, X } from '@phosphor-icons/react';

interface BoardFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedPriority: string | null;
  onPriorityChange: (priority: string | null) => void;
  onClear: () => void;
}

export function BoardFilterBar({
  search,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  onClear,
}: BoardFilterBarProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Focus search input on Slash key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasFilter = search.trim().length > 0 || selectedPriority !== null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Lọc công việc... (Nhấn /)"
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg focus-ring text-zinc-900 dark:text-zinc-100"
          />
        </div>

        {/* Priority Filter Chips */}
        <div className="hidden md:flex items-center gap-1">
          {['urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => onPriorityChange(selectedPriority === p ? null : p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors ${
                selectedPriority === p
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {hasFilter && (
        <button
          onClick={onClear}
          className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
        >
          <X size={14} />
          <span>Xóa bộ lọc</span>
        </button>
      )}
    </div>
  );
}
