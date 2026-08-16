'use client';

import * as React from 'react';
import { CaretUpDown, Check, Plus, SquaresFour } from '@phosphor-icons/react';

interface Workspace {
  id: number;
  name: string;
  slug: string;
}

export function WorkspaceSwitcher() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [workspaces] = React.useState<Workspace[]>([
    { id: 1, name: 'Core Engineering', slug: 'core-eng' },
    { id: 2, name: 'Product & Design', slug: 'product-design' },
  ]);
  const [activeWorkspace, setActiveWorkspace] = React.useState<Workspace>(workspaces[0]);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-lg text-left bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors focus-ring border border-zinc-200/60 dark:border-zinc-800/60"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-accent-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {activeWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {activeWorkspace.name}
            </p>
            <p className="text-[10px] text-zinc-500 truncate uppercase tracking-wider font-mono">
              Workspace
            </p>
          </div>
        </div>
        <CaretUpDown size={14} className="text-zinc-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl space-y-1">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Chuyển Workspace
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setActiveWorkspace(ws);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <SquaresFour size={14} className="text-zinc-500" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{ws.name}</span>
                </div>
                {ws.id === activeWorkspace.id && <Check size={14} className="text-accent-500" />}
              </button>
            ))}

            <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950/40 transition-colors"
              >
                <Plus size={14} />
                <span>Tạo Workspace mới</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
