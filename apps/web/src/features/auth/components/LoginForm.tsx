'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { loginApi } from '../api/authApi';
import { Lock, User, CircleNotch, WarningCircle } from '@phosphor-icons/react';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginApi({ username, password });
      setAuth(
        {
          id: res.user.id,
          name: res.user.name,
          username: res.user.username,
          email: res.user.email,
          avatar_url: res.user.avatar || undefined,
          role: res.user.role,
          current_workspace_id: res.user.current_workspace_id,
        },
        res.token,
        res.workspaces
      );
      router.push('/dashboard');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.username?.[0] ||
        'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm">
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg text-sm bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60">
          <WarningCircle size={18} className="shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Email / LDAP Username
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <User size={18} />
          </div>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 rounded-lg focus-ring disabled:opacity-60 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Mật khẩu
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Lock size={18} />
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 rounded-lg focus-ring disabled:opacity-60 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-accent-600 hover:bg-accent-700 active:bg-accent-800 rounded-lg focus-ring tactile-btn disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
      >
        {isLoading ? (
          <>
            <CircleNotch size={18} className="animate-spin" />
            <span>Đang xác thực...</span>
          </>
        ) : (
          <span>Đăng nhập</span>
        )}
      </button>
    </form>
  );
}
