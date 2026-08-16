import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Kanban, ShieldCheck, Lightning, Users } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'Đăng nhập — Tasks Management System',
  description: 'Đăng nhập hệ thống quản lý công việc và quy trình doanh nghiệp.',
};

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-2 bg-[#fafafa] dark:bg-[#09090b]">
      {/* Left Column - Form */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        {/* Top Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent-600 flex items-center justify-center text-white shadow-xs">
            <Kanban size={22} weight="bold" />
          </div>
          <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
            Tasks<span className="text-accent-500">.</span>
          </span>
        </div>

        {/* Center Login Card */}
        <div className="my-auto py-12 max-w-sm w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
              Chào mừng trở lại
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Đăng nhập bằng tài khoản nội bộ hoặc LDAP doanh nghiệp để bắt đầu công việc.
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Bottom Footer Text */}
        <div className="text-xs text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Tasks System. Enterprise Project & Workflow Management.
        </div>
      </div>

      {/* Right Column - Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-zinc-900 text-white relative overflow-hidden border-l border-zinc-800">
        {/* Gradient Mesh Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-900 to-zinc-950 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-400">
          <Lightning size={16} weight="fill" />
          <span>Next-Gen Enterprise Workflow</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-3xl font-bold tracking-tight leading-snug">
            Tối ưu hóa quy trình làm việc & theo dõi tiến độ dự án theo thời gian thực.
          </h2>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-xs">
              <ShieldCheck size={24} className="text-accent-400 mb-2" />
              <h3 className="font-semibold text-sm mb-1">LDAP & SSO Ready</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tích hợp xác thực tập trung an toàn cho toàn bộ nhân sự.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-xs">
              <Users size={24} className="text-accent-400 mb-2" />
              <h3 className="font-semibold text-sm mb-1">Agile & Kanban</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Quản lý Sprint, Backlog và Board kéo thả 60fps mượt mà.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          Được thiết kế theo chuẩn Linear & Notion Interface.
        </div>
      </div>
    </div>
  );
}
