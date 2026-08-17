'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { CircleNotch } from '@phosphor-icons/react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token, _hasHydrated, setHasHydrated } = useAuthStore();

  // Fallback: check localStorage immediately on mount in case hydration callback was delayed
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !_hasHydrated) {
      try {
        const persisted = localStorage.getItem('tasks-auth');
        if (persisted) {
          const parsed = JSON.parse(persisted);
          if (parsed?.state?.token && parsed?.state?.user) {
            useAuthStore.setState({
              user: parsed.state.user,
              token: parsed.state.token,
              workspaces: parsed.state.workspaces || [],
              isAuthenticated: true,
              _hasHydrated: true,
            });
            return;
          }
        }
      } catch {
        // Ignore
      }
      setHasHydrated(true);
    }
  }, [_hasHydrated, setHasHydrated]);

  React.useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated || !token) {
      router.replace('/login');
    }
  }, [_hasHydrated, isAuthenticated, token, router]);

  if (!_hasHydrated || !isAuthenticated || !token) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#fafafa] dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <CircleNotch size={28} className="animate-spin text-accent-500" />
          <span className="text-xs font-medium tracking-wide">Đang tải hệ thống...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
