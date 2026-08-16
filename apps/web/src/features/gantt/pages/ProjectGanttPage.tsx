'use client';

import * as React from 'react';
import { Card, Progress, Tag, Timeline, Row, Col, Segmented, Button, Tooltip } from 'antd';
import {
  LineChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

export function ProjectGanttPage({ projectKey }: { projectKey: string }) {
  const pKey = projectKey.toUpperCase();
  const [viewScale, setViewScale] = React.useState<'week' | 'month'>('week');

  const tasks = [
    {
      id: `${pKey}-101`,
      title: 'Thiết kế Schema Multi-tenant & Workspaces',
      startDay: 1,
      durationDays: 4,
      start: '15/08',
      due: '18/08',
      progress: 100,
      status: 'Done',
      assignee: 'Alex R.',
    },
    {
      id: `${pKey}-102`,
      title: 'Tích hợp Auth Sanctum & LDAP SSO Provider',
      startDay: 3,
      durationDays: 6,
      start: '17/08',
      due: '22/08',
      progress: 85,
      status: 'In Progress',
      assignee: 'Sarah T.',
    },
    {
      id: `${pKey}-103`,
      title: 'Kanban Board Drag-and-Drop & Task Details',
      startDay: 6,
      durationDays: 7,
      start: '20/08',
      due: '26/08',
      progress: 70,
      status: 'In Progress',
      assignee: 'David L.',
    },
    {
      id: `${pKey}-104`,
      title: 'Tự động hóa Workflow Rules & Trình thiết kế',
      startDay: 10,
      durationDays: 6,
      start: '24/08',
      due: '30/08',
      progress: 30,
      status: 'Todo',
      assignee: 'Elena R.',
    },
    {
      id: `${pKey}-105`,
      title: 'Kiểm thử hồi quy QA & Tối ưu hóa hiệu năng',
      startDay: 14,
      durationDays: 5,
      start: '28/08',
      due: '02/09',
      progress: 0,
      status: 'Todo',
      assignee: 'Sarah Connor',
    },
  ];

  const totalDays = 20;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
            <LineChartOutlined className="text-indigo-500" />
            <span>Roadmap & Biểu đồ Gantt — {pKey}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Dòng thời gian dự án, phụ thuộc công việc và tiến độ các giai đoạn triển khai
          </p>
        </div>

        <Segmented
          value={viewScale}
          onChange={(val) => setViewScale(val as 'week' | 'month')}
          options={[
            { label: 'Theo Tuần', value: 'week' },
            { label: 'Theo Tháng', value: 'month' },
          ]}
        />
      </div>

      {/* Visual Gantt Interactive View */}
      <Card
        title={
          <div className="flex items-center justify-between py-1">
            <span className="font-bold text-base">Dòng thời gian Gantt Chart</span>
            <span className="text-xs text-zinc-400 font-mono">Tháng 8 - Tháng 9, 2026</span>
          </div>
        }
        className="shadow-xs overflow-x-auto"
      >
        <div className="min-w-[700px] space-y-4">
          {/* Days Scale Header */}
          <div className="grid grid-cols-12 gap-1 pb-2 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-400 text-center">
            <div className="col-span-4 text-left font-bold text-zinc-700 dark:text-zinc-300">
              Công việc & Người thực hiện
            </div>
            <div className="col-span-8 grid grid-cols-8 text-center">
              <span>W1 (15/8)</span>
              <span>W1 (17/8)</span>
              <span>W2 (20/8)</span>
              <span>W2 (22/8)</span>
              <span>W3 (24/8)</span>
              <span>W3 (27/8)</span>
              <span>W4 (30/8)</span>
              <span>W4 (2/9)</span>
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="space-y-3">
            {tasks.map((t) => {
              const leftPercent = Math.min(Math.max(((t.startDay - 1) / totalDays) * 100, 0), 85);
              const widthPercent = Math.min((t.durationDays / totalDays) * 100, 100 - leftPercent);

              return (
                <div
                  key={t.id}
                  className="grid grid-cols-12 gap-1 items-center p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="col-span-4 pr-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <Tag color="indigo" className="font-mono text-[10px] m-0 shrink-0">
                        {t.id}
                      </Tag>
                      <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <UserOutlined /> {t.assignee}
                      </span>
                      <span>• {t.progress}%</span>
                    </div>
                  </div>

                  {/* Gantt Bar Lane */}
                  <div className="col-span-8 relative h-7 bg-zinc-100 dark:bg-zinc-800/50 rounded-md overflow-hidden flex items-center">
                    <div
                      className={`absolute h-5 rounded transition-all duration-300 flex items-center justify-between px-2 text-[10px] text-white font-medium shadow-sm ${
                        t.status === 'Done'
                          ? 'bg-emerald-600'
                          : t.status === 'In Progress'
                          ? 'bg-indigo-600'
                          : 'bg-zinc-500'
                      }`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(widthPercent, 18)}%`,
                      }}
                    >
                      <span className="truncate">{t.start} — {t.due}</span>
                      <span className="font-bold">{t.progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Milestone Timeline */}
      <Card title="Lịch trình cột mốc trọng điểm (Milestones)" className="shadow-xs">
        <Timeline
          mode="start"
          items={[
            {
              color: 'green',
              children: (
                <div>
                  <h4 className="font-bold text-sm m-0">Cột mốc 1: Nền tảng Monorepo & Backend Core</h4>
                  <p className="text-xs text-zinc-500 m-0">
                    Hoàn thành cấu hình Turborepo, Laravel API V1, Sanctum Auth & Multi-tenant Workspace.
                  </p>
                </div>
              ),
            },
            {
              color: 'blue',
              children: (
                <div>
                  <h4 className="font-bold text-sm m-0">Cột mốc 2: Ant Design UI & Feature Modules</h4>
                  <p className="text-xs text-zinc-500 m-0">
                    Bảng Kanban, Backlog Sprint, Time Tracking, Analytics Reports và Task SlideOver.
                  </p>
                </div>
              ),
            },
            {
              color: 'gray',
              children: (
                <div>
                  <h4 className="font-bold text-sm m-0">Cột mốc 3: Phân quyền LDAP & Production Release</h4>
                  <p className="text-xs text-zinc-500 m-0">
                    Tích hợp đăng nhập LDAP, tối ưu hóa truy vấn CSDL và hoàn thiện hệ thống Production.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
