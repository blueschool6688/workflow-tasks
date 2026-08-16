'use client';

import * as React from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AuthGuard } from '../auth/AuthGuard';
import { GlobalTimerWidget } from '@/features/time-tracking/components/GlobalTimerWidget';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-[100dvh] flex bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
        <AppSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh]">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
        </div>
        <GlobalTimerWidget />
      </div>
    </AuthGuard>
  );
}
