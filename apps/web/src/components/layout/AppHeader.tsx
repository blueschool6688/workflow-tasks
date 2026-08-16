'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Breadcrumb, Input, Dropdown, Avatar, Button, Switch } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

interface AppHeaderProps {
  onOpenMobile?: () => void;
}

export function AppHeader({ onOpenMobile }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const isDark = theme === 'dark';

  // Build Antd Breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { title: <span className="text-zinc-400">Workspace</span> },
    ...pathSegments.map((segment, index) => {
      const url = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = index === pathSegments.length - 1;

      return {
        title: isLast ? (
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{label}</span>
        ) : (
          <a onClick={() => router.push(url)} className="text-zinc-500 hover:text-indigo-600">
            {label}
          </a>
        ),
      };
    }),
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile-header',
      label: (
        <div className="px-1 py-1">
          <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 m-0">
            {user?.name || 'User'}
          </p>
          <p className="text-[11px] text-zinc-400 m-0">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => router.push('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left Mobile Menu Button + Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onOpenMobile}
          className="flex md:hidden text-zinc-600 dark:text-zinc-300"
          aria-label="Mở menu"
        />
        <div className="hidden sm:block truncate">
          <Breadcrumb items={breadcrumbItems} className="text-xs" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Input */}
        <Input
          prefix={<SearchOutlined className="text-zinc-400" />}
          placeholder="Tìm kiếm công việc, dự án..."
          size="middle"
          className="hidden md:flex w-56 lg:w-64 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 border-none"
        />

        {/* Notifications */}
        <NotificationBell />

        {/* Theme Switcher */}
        <Switch
          checked={isDark}
          onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          className="bg-zinc-300 dark:bg-zinc-700"
        />

        {/* User Profile Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Avatar
            className="cursor-pointer bg-indigo-600 font-bold hover:opacity-90 transition-opacity"
            size={32}
          >
            {user?.name ? user.name.substring(0, 1).toUpperCase() : 'U'}
          </Avatar>
        </Dropdown>
      </div>
    </header>
  );
}
