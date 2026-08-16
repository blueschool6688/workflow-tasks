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
      {/* Visual Badge / Glow Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 blur-2xl rounded-full" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500/10 via-zinc-100 to-indigo-50 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-zinc-800 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center shadow-lg shadow-indigo-500/5">
          <CompassOutlined className="text-4xl text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>
      </div>

      {/* 404 Error Code */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-3">
        <span>ERROR 404</span>
        <span>•</span>
        <span>PAGE NOT FOUND</span>
      </div>

      {/* Main Title & Subtitle */}
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

      {/* Helpful Shortcuts Card */}
      <div className="w-full text-left p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xs">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">
          Lối tắt đề xuất
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50 hover:border-indigo-500 dark:hover:border-indigo-500 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
              <AppstoreOutlined />
            </div>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/projects/core-eng/board"
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50 hover:border-indigo-500 dark:hover:border-indigo-500 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <ProjectOutlined />
            </div>
            <span>Bảng Kanban</span>
          </Link>

          <Link
            href="/projects/core-eng/backlog"
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50 hover:border-indigo-500 dark:hover:border-indigo-500 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
              <UnorderedListOutlined />
            </div>
            <span>Quản lý Backlog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
