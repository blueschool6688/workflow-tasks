'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WorkspaceSwitcher } from '@/features/workspace/components/WorkspaceSwitcher';
import {
  Kanban,
  SquaresFour,
  FolderSimple,
  ListChecks,
  ClockAfternoon,
  Gear,
  SidebarSimple,
  ChartLine,
} from '@phosphor-icons/react';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();

  // Navigation Items
  const navItems = [
    { label: 'Tổng quan', href: '/dashboard', icon: SquaresFour },
    { label: 'Dự án', href: '/projects', icon: FolderSimple },
    { label: 'Bảng công việc', href: '/projects/core-eng/board', icon: Kanban },
    { label: 'Backlog & Sprint', href: '/projects/core-eng/backlog', icon: ListChecks },
    { label: 'Timeline & Gantt', href: '/projects/core-eng/timeline', icon: ChartLine },
    { label: 'Time Tracking', href: '/projects/core-eng/time', icon: ClockAfternoon },
    { label: 'Cài đặt hệ thống', href: '/settings', icon: Gear },
  ];

  return (
    <aside
      className={`h-[100dvh] bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between transition-all duration-200 sticky top-0 z-40 shrink-0 ${
        isCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Top Section */}
      <div className="p-3 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-accent-600 flex items-center justify-center text-white text-xs font-bold">
                T
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                Tasks<span className="text-accent-500">.</span>
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors mx-auto"
            title="Thu gọn Sidebar (Ctrl+B)"
          >
            <SidebarSimple size={18} />
          </button>
        </div>

        {/* Workspace Switcher */}
        {!isCollapsed && <WorkspaceSwitcher />}

        {/* Nav Links */}
        <nav className="space-y-1 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-accent-50 dark:bg-accent-950/50 text-accent-600 dark:text-accent-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className={isActive ? 'text-accent-500' : 'text-zinc-500'} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-900">
        {!isCollapsed && (
          <div className="px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Phiên bản Enterprise</span>
            <span className="font-mono text-[10px] text-zinc-400">v1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
