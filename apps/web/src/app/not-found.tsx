import { NotFoundContent } from '@/components/ui/NotFoundContent';

export const metadata = {
  title: '404 - Không tìm thấy trang | Tasks',
  description: 'Trang yêu cầu không tồn tại hoặc đã bị di chuyển.',
};

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#09090b]">
      <NotFoundContent />
    </div>
  );
}
