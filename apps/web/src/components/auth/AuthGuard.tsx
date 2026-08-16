'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { CircleNotch } from '@phosphor-icons/react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    // Give Zustand hydrator a tick to load persisted auth state from localStorage
    const timeout = setTimeout(() => {
      if (!isAuthenticated || !token) {
        router.replace('/login');
      } else {
        setIsChecking(false);
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, token, router]);

  if (isChecking) {
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
