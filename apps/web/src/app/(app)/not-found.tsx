import { NotFoundContent } from '@/components/ui/NotFoundContent';

export const metadata = {
  title: '404 - Không tìm thấy trang | Tasks',
  description: 'Trang yêu cầu không tồn tại hoặc đã bị di chuyển.',
};

export default function AppNotFound() {
  return <NotFoundContent />;
}
