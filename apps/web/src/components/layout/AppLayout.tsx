'use client';

import * as React from 'react';
import { Layout } from 'antd';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AuthGuard } from '../auth/AuthGuard';
import { GlobalTimerWidget } from '@/features/time-tracking/components/GlobalTimerWidget';
import { RealtimeProvider } from '@/components/providers/RealtimeProvider';
import { ProjectChatWidget } from '@/features/chat/components/ProjectChatWidget';

const { Content } = Layout;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);
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
      <RealtimeProvider>
        <Layout hasSider className="min-h-screen !flex-row bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
          <AppSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            isMobileOpen={isMobileDrawerOpen}
            onCloseMobile={() => setIsMobileDrawerOpen(false)}
          />
          <Layout className="flex-1 flex flex-col min-w-0 min-h-screen bg-transparent">
            <AppHeader onOpenMobile={() => setIsMobileDrawerOpen(true)} />
            <Content className="flex-1 p-3 sm:p-6 overflow-y-auto bg-transparent">{children}</Content>
          </Layout>
          <GlobalTimerWidget />
          <ProjectChatWidget />
        </Layout>
      </RealtimeProvider>
    </AuthGuard>
  );
}
