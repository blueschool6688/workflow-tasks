'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/authStore';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import {
  MagnifyingGlass,
  Bell,
  Sun,
  Moon,
  SignOut,
  User,
  CaretRight,
} from '@phosphor-icons/react';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  // Generate simple breadcrumbs from path
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, url };
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
        <span className="text-zinc-400">Apps</span>
        <CaretRight size={12} className="text-zinc-400" />
        {breadcrumbs.length === 0 ? (
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</span>
        ) : (
          breadcrumbs.map((b, i) => (
            <React.Fragment key={b.url}>
              {i > 0 && <CaretRight size={12} className="text-zinc-400" />}
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                    : 'hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer'
                }
                onClick={() => i < breadcrumbs.length - 1 && router.push(b.url)}
              >
                {b.label}
              </span>
            </React.Fragment>
          ))
        )}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Global Search Trigger */}
        <button
          onClick={() => {}}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors border border-zinc-200/50 dark:border-zinc-800/50"
        >
          <MagnifyingGlass size={14} />
          <span>Tìm kiếm nhanh...</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            /
          </kbd>
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Chuyển chế độ sáng/tối"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-8 h-8 rounded-full bg-accent-600 text-white font-bold text-xs flex items-center justify-center focus-ring hover:opacity-90 transition-opacity"
          >
            {user?.name ? user.name.substring(0, 1).toUpperCase() : 'U'}
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 space-y-1">
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <User size={14} />
                  <span>Hồ sơ cá nhân</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <SignOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
