import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Kanban, ShieldCheck, Lightning, Users } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'Đăng nhập — Tasks Management System',
  description: 'Đăng nhập hệ thống quản lý công việc và quy trình doanh nghiệp.',
};

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] w-full grid grid-cols-1 bg-[#fafafa] dark:bg-[#09090b]">
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div className="my-auto py-12 max-w-sm w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-lg sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
              Đăng nhập bằng tài khoản nội bộ hoặc LDAP
            </h2>
          </div>
          <LoginForm />
        </div>

      </div>

      {/* <div className="hidden lg:flex flex-col justify-between p-16 bg-zinc-900 text-white relative overflow-hidden border-l border-zinc-800">
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
      </div> */}
    </div>
  );
}
