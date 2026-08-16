'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Tag, Space, Card } from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CompassOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

interface NotFoundContentProps {
  title?: string;
  description?: string;
  showBack?: boolean;
}

export function NotFoundContent({
  title = 'Không tìm thấy trang yêu cầu',
  description = 'Đường dẫn bạn đang truy cập có thể không tồn tại, đã bị thay đổi vị trí hoặc bạn không có quyền truy cập.',
  showBack = true,
}: NotFoundContentProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 text-center max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      {/* Primary Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {showBack && (
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="font-medium"
          >
            Quay lại trang trước
          </Button>
        )}
        <Link href="/dashboard">
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            className="bg-indigo-600 hover:bg-indigo-500 font-medium shadow-md shadow-indigo-500/20"
          >
            Về trang chủ Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
