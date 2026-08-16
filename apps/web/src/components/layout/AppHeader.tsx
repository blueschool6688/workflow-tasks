'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Breadcrumb, Input, Dropdown, Avatar, Button, Switch, Select, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { useProjectChatStore } from '@/stores/projectChatStore';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { getProjectsApi, Project } from '@/features/projects/api/projectApi';
import { ChatCircleDots } from '@phosphor-icons/react';

interface AppHeaderProps {
  onOpenMobile?: () => void;
}

export function AppHeader({ onOpenMobile }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { switchProject } = useProjectChatStore();

  const [projects, setProjects] = React.useState<Project[]>([]);

  const isDark = theme === 'dark';

  // Load available projects
  React.useEffect(() => {
    getProjectsApi().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
      }
    });
  }, []);

  // Extract active project key and sub-tab from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const isProjectRoute = pathSegments[0] === 'projects' && pathSegments[1] && pathSegments[1] !== 'new';
  const currentProjectKey = isProjectRoute ? pathSegments[1].toUpperCase() : null;
  const currentSubTab = isProjectRoute && pathSegments[2] ? pathSegments.slice(2).join('/') : 'board';

  // Handle dynamic project switch across tabs
  const handleProjectSwitch = (newKey: string) => {
    const selectedProj = projects.find((p) => p.key.toUpperCase() === newKey.toUpperCase());
    if (selectedProj) {
      switchProject(String(selectedProj.id), selectedProj.key);
    }

    if (isProjectRoute) {
      router.push(`/projects/${newKey.toLowerCase()}/${currentSubTab}`);
    } else {
      router.push(`/projects/${newKey.toLowerCase()}/board`);
    }
  };

  // Build Antd Breadcrumb items from pathname
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
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onOpenMobile}
          className="flex md:hidden text-zinc-600 dark:text-zinc-300"
          aria-label="Mở menu"
        />

        {/* Dynamic Project Quick Switcher Dropdown */}
        {projects.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Select
              value={currentProjectKey || projects[0]?.key?.toUpperCase()}
              onChange={handleProjectSwitch}
              size="middle"
              className="w-36 sm:w-48 font-semibold text-xs rounded-lg"
              options={projects.map((p) => ({
                value: p.key.toUpperCase(),
                label: (
                  <div className="flex items-center gap-1.5 truncate">
                    <FolderOutlined className="text-indigo-500 shrink-0" />
                    <span className="font-mono font-bold text-xs">{p.key.toUpperCase()}</span>
                    <span className="text-zinc-400 text-xs truncate hidden sm:inline">
                      - {p.name}
                    </span>
                  </div>
                ),
              }))}
            />
          </div>
        )}

        <div className="hidden lg:block truncate border-l border-zinc-200 dark:border-zinc-800 pl-3">
          <Breadcrumb items={breadcrumbItems} className="text-xs" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Input
          prefix={<SearchOutlined className="text-zinc-400" />}
          placeholder="Tìm kiếm công việc, dự án..."
          size="middle"
          className="hidden md:flex w-44 lg:w-56 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 border-none"
        />

        <Tooltip title="Mở Chat Nhóm Dự Án">
          <button
            onClick={() => useProjectChatStore.getState().toggleChat()}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center"
            aria-label="Chat nhóm"
          >
            <ChatCircleDots size={19} />
          </button>
        </Tooltip>

        <NotificationBell />
        <Switch
          checked={isDark}
          onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          className="bg-zinc-300 dark:bg-zinc-700"
        />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Avatar
            className="cursor-pointer bg-indigo-600 font-bold hover:opacity-90 transition-opacity"
            size={36}
          >
            {user?.name ? user.name.substring(0, 1).toUpperCase() : 'U'}
          </Avatar>
        </Dropdown>
      </div>
    </header>
  );
}
