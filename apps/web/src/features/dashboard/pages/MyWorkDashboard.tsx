'use client';

import * as React from 'react';
import { Card, Row, Col, Statistic, Table, Timeline, Tag, Button, Badge, Spin, Empty } from 'antd';
import {
  UnorderedListOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  UserOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { api } from '@/lib/axios';

export function MyWorkDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<any>(null);
  const [myTasks, setMyTasks] = React.useState<any[]>([]);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, tasksRes] = await Promise.allSettled([
        api.get('/dashboard/summary'),
        api.get('/tasks/my-tasks'),
      ]);

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value.data.data || sumRes.value.data);
      }
      if (tasksRes.status === 'fulfilled') {
        const rawTasks = tasksRes.value.data.data || tasksRes.value.data || [];
        setMyTasks(
          rawTasks.map((t: any) => ({
            key: t.id?.toString() || Math.random().toString(),
            id: t.task_number || t.id,
            title: t.title,
            status: t.status?.name || 'In Progress',
            priority: t.priority || 'Medium',
            due: t.due_date ? t.due_date.substring(0, 10) : 'Chưa đặt',
          }))
        );
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const defaultTasks = [
    { key: '1', id: 'CORE-101', title: 'Thiết kế giao diện Dashboard theo chuẩn Ant Design v5', status: 'In Progress', priority: 'High', due: 'Hôm nay' },
    { key: '2', id: 'CORE-102', title: 'Tích hợp Sanctum token authentication & User Store', status: 'In Progress', priority: 'Urgent', due: 'Hôm nay' },
    { key: '3', id: 'CORE-103', title: 'Xây dựng Kanban Board kéo thả với dnd-kit', status: 'Todo', priority: 'Medium', due: 'Ngày mai' },
    { key: '4', id: 'CORE-104', title: 'Cấu hình OpenAPI Scramble & TypeScript generator', status: 'Done', priority: 'Low', due: '14/08' },
  ];

  const tasksToDisplay = myTasks.length > 0 ? myTasks : defaultTasks;

  const stats = [
    {
      label: 'Tổng công việc',
      value: summary?.overview?.total_tasks ?? 24,
      icon: <UnorderedListOutlined className="text-indigo-500" />,
    },
    {
      label: 'Đang thực hiện',
      value: summary?.overview?.in_progress_tasks ?? 7,
      icon: <ClockCircleOutlined className="text-amber-500" />,
    },
    {
      label: 'Đã hoàn thành',
      value: summary?.overview?.completed_tasks ?? 14,
      icon: <CheckCircleOutlined className="text-emerald-500" />,
    },
    {
      label: 'Dự án đang chạy',
      value: summary?.overview?.active_projects ?? 2,
      icon: <CheckCircleOutlined className="text-indigo-500" />,
    },
  ];

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (text: string) => <Tag color="indigo">{text}</Tag>,
    },
    {
      title: 'Tên công việc',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-semibold text-zinc-900 dark:text-zinc-100">{text}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        let color = 'default';
        if (status.toLowerCase().includes('done')) color = 'success';
        if (status.toLowerCase().includes('progress')) color = 'processing';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
      render: (p: string) => {
        let color = 'blue';
        const pl = (p || '').toLowerCase();
        if (pl === 'urgent' || pl === 'critical') color = 'red';
        if (pl === 'high') color = 'orange';
        return <Tag color={color}>{p}</Tag>;
      },
    },
    {
      title: 'Hạn chót',
      dataIndex: 'due',
      key: 'due',
      width: 110,
      render: (text: string) => <span className="text-xs text-zinc-400 font-mono">{text}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 m-0">
            Tổng quan công việc Workspace
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Theo dõi nhiệm vụ cá nhân, tiến độ dự án và hoạt động gần đây
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
          <Link href="/projects/core-eng/board">
            <Button type="primary" icon={<PlusOutlined />} size="large" className="bg-indigo-600">
              Công việc mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Strip */}
      <Row gutter={[16, 16]}>
        {stats.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.label}>
            <Card className="shadow-xs">
              <Statistic
                title={item.label}
                value={item.value}
                prefix={item.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Grid: My Tasks + Activity Timeline */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span className="flex items-center gap-2">
                <UserOutlined className="text-indigo-500" />
                Công việc đang được giao ({tasksToDisplay.length})
              </span>
            }
            extra={
              <Link href="/projects/core-eng/board">
                <Button type="link" icon={<ArrowRightOutlined />}>
                  Xem Bảng Kanban
                </Button>
              </Link>
            }
            className="shadow-xs"
          >
            <Table
              dataSource={tasksToDisplay}
              columns={columns}
              pagination={false}
              size="middle"
              loading={loading}
              scroll={{ x: 550 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Hoạt động gần đây" className="shadow-xs h-full">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <p className="text-xs font-semibold m-0 text-zinc-800 dark:text-zinc-200">
                        Bạn đã hoàn thành công việc CORE-104
                      </p>
                      <span className="text-[10px] text-zinc-400">10 phút trước</span>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <p className="text-xs font-semibold m-0 text-zinc-800 dark:text-zinc-200">
                        Nguyễn Văn A đã gán CORE-102 cho bạn
                      </p>
                      <span className="text-[10px] text-zinc-400">1 giờ trước</span>
                    </div>
                  ),
                },
                {
                  color: 'orange',
                  children: (
                    <div>
                      <p className="text-xs font-semibold m-0 text-zinc-800 dark:text-zinc-200">
                        Trần Thị B đã thêm bình luận vào CORE-101
                      </p>
                      <span className="text-[10px] text-zinc-400">3 giờ trước</span>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
