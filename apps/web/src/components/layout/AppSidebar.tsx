'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Menu, Button, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  FolderOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { WorkspaceSwitcher } from '@/features/workspace/components/WorkspaceSwitcher';

const { Sider } = Layout;

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();

  // Extract active project key from pathname
  const segments = pathname.split('/').filter(Boolean);
  let currentProjectKey = 'core-eng';

  if (segments[0] === 'projects' && segments[1] && segments[1] !== 'new') {
    currentProjectKey = segments[1];
  } else if (segments.length >= 2 && !['dashboard', 'projects', 'settings', 'media', 'login'].includes(segments[0])) {
    currentProjectKey = segments[0];
  }

  const projectBase = `/projects/${currentProjectKey}`;

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard" onClick={onCloseMobile}>Tổng quan Workspace</Link>,
    },
    {
      key: '/projects',
      icon: <FolderOutlined />,
      label: <Link href="/projects" onClick={onCloseMobile}>Danh sách Dự án</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: `${projectBase}/summary`,
      icon: <ProjectOutlined />,
      label: <Link href={`${projectBase}/summary`} onClick={onCloseMobile}>Báo cáo Dự án</Link>,
    },
    {
      key: `${projectBase}/board`,
      icon: <AppstoreOutlined />,
      label: <Link href={`${projectBase}/board`} onClick={onCloseMobile}>Bảng Kanban</Link>,
    },
    {
      key: `${projectBase}/backlog`,
      icon: <UnorderedListOutlined />,
      label: <Link href={`${projectBase}/backlog`} onClick={onCloseMobile}>Backlog & Sprint</Link>,
    },
    {
      key: `${projectBase}/timeline`,
      icon: <LineChartOutlined />,
      label: <Link href={`${projectBase}/timeline`} onClick={onCloseMobile}>Roadmap & Gantt</Link>,
    },
    {
      key: `${projectBase}/time`,
      icon: <ClockCircleOutlined />,
      label: <Link href={`${projectBase}/time`} onClick={onCloseMobile}>Time Tracking</Link>,
    },
    {
      key: `${projectBase}/calendar`,
      icon: <CalendarOutlined />,
      label: <Link href={`${projectBase}/calendar`} onClick={onCloseMobile}>Lịch công việc</Link>,
    },
    {
      key: `${projectBase}/automation`,
      icon: <ThunderboltOutlined />,
      label: <Link href={`${projectBase}/automation`} onClick={onCloseMobile}>Tự động hóa</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings" onClick={onCloseMobile}>Cài đặt hệ thống</Link>,
    },
  ];

  // Match longest key first so specific project subroutes take precedence over general prefixes
  const sortedNavItems = [...menuItems]
    .filter((item): item is { key: string } & any => Boolean(item && 'key' in item))
    .sort((a, b) => (String(b.key).length - String(a.key).length));

  const selectedKey = sortedNavItems.find(
    (item) => pathname === item.key || pathname.startsWith(`${item.key}/`) || (item.key === '/projects' && pathname === '/projects')
  )?.key as string || pathname;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      <div className="flex flex-col gap-2 p-2.5 overflow-y-auto overflow-x-hidden">
        <div className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'} px-1 py-1`}>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                T
              </div>
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                Tasks<span className="text-indigo-500">.</span>
              </span>
            </div>
          )}
          {!isMobileOpen && (
            <Button
              type="text"
              icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={onToggleCollapse}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              title="Thu gọn / Mở rộng Sidebar"
            />
          )}
        </div>

        {(!isCollapsed || isMobileOpen) && <WorkspaceSwitcher />}

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          inlineCollapsed={isMobileOpen ? false : isCollapsed}
          items={menuItems}
          className="border-none bg-transparent text-xs font-medium"
        />
      </div>

      {(!isCollapsed || isMobileOpen) && (
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Phiên bản Enterprise</span>
            <span className="font-mono text-[10px] text-zinc-400">v1.0.0</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sider using Ant Design Sider */}
      <Sider
        collapsible
        collapsed={isCollapsed}
        trigger={null}
        width={250}
        collapsedWidth={72}
        theme="light"
        className="!sticky !top-0 !h-screen !border-r !border-zinc-200 dark:!border-zinc-800 !bg-white dark:!bg-[#09090b] !z-40 !hidden md:!block !shrink-0"
      >
        {sidebarContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        open={isMobileOpen}
        onClose={onCloseMobile}
        styles={{ body: { padding: 0 }, wrapper: { maxWidth: 280 } }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
