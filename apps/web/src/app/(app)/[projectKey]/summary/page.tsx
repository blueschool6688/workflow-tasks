'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Badge, Avatar, Button } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FundOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

export default function ProjectSummaryPage() {
  const params = useParams();
  const projectKey = (params?.projectKey as string)?.toUpperCase() || 'CORE-ENG';

  const stats = {
    totalTasks: 42,
    completionRate: 64.3,
    todo: 8,
    inProgress: 15,
    inReview: 4,
    done: 15,
    sprintsCount: 4,
    epicsCount: 3,
    membersCount: 6,
  };

  const membersData = [
    { key: '1', name: 'Alex Rivera', role: 'Product Manager', tasksCount: 8, completed: 6 },
    { key: '2', name: 'Nguyen Van A', role: 'Senior Backend Dev', tasksCount: 12, completed: 8 },
    { key: '3', name: 'Tran Thi B', role: 'Frontend Engineer', tasksCount: 10, completed: 5 },
    { key: '4', name: 'Le Van C', role: 'QA Lead', tasksCount: 6, completed: 4 },
    { key: '5', name: 'Pham Van D', role: 'DevOps Specialist', tasksCount: 6, completed: 4 },
  ];

  const columns = [
    {
      title: 'Thành viên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <Avatar className="bg-indigo-600 font-bold">{text.substring(0, 1)}</Avatar>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{text}</span>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Công việc đảm nhận',
      dataIndex: 'tasksCount',
      key: 'tasksCount',
      render: (count: number) => <span>{count} tasks</span>,
    },
    {
      title: 'Tiến độ hoàn thành',
      key: 'progress',
      render: (_: any, record: any) => {
        const pct = Math.round((record.completed / record.tasksCount) * 100);
        return <Progress percent={pct} size="small" strokeColor="#6366f1" />;
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 m-0">
              Báo cáo & Tổng quan Dự án
            </h1>
            <Tag color="indigo" className="font-mono text-xs">{projectKey}</Tag>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Tổng hợp dữ liệu tiến độ, sprint, epic và khối lượng công việc của thành viên
          </p>
        </div>
        <Link href={`/projects/${projectKey.toLowerCase()}/board`}>
          <Button type="primary" icon={<ArrowRightOutlined />} size="large" className="bg-indigo-600">
            Đi tới Bảng Kanban
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs">
            <Statistic
              title="Tổng công việc (Tasks)"
              value={stats.totalTasks}
              prefix={<ProjectOutlined className="text-indigo-500" />}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Hoàn thành: {stats.done}</span>
              <span>Đang làm: {stats.inProgress}</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs">
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={stats.completionRate}
              suffix="%"
              prefix={<CheckCircleOutlined className="text-emerald-500" />}
            />
            <Progress percent={stats.completionRate} size="small" showInfo={false} strokeColor="#10b981" className="mt-2" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs">
            <Statistic
              title="Sprints & Epics"
              value={stats.sprintsCount}
              suffix={`/ ${stats.epicsCount} Epics`}
              prefix={<SyncOutlined className="text-amber-500" />}
            />
            <div className="mt-2 text-xs text-zinc-500">
              Active Sprint: Sprint 24 (End in 4 days)
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs">
            <Statistic
              title="Thành viên dự án"
              value={stats.membersCount}
              prefix={<UserOutlined className="text-blue-500" />}
            />
            <div className="mt-2 text-xs text-zinc-500">
              5 Developers, 1 Product Manager
            </div>
          </Card>
        </Col>
      </Row>

      {/* Task Status Breakdown */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Phân bổ trạng thái công việc" className="shadow-xs h-full">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span><Badge status="default" text="Cần làm (To Do)" /></span>
                  <span>{stats.todo} tasks ({Math.round((stats.todo / stats.totalTasks) * 100)}%)</span>
                </div>
                <Progress percent={Math.round((stats.todo / stats.totalTasks) * 100)} status="normal" strokeColor="#64748b" showInfo={false} />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span><Badge status="processing" text="Đang thực hiện (In Progress)" /></span>
                  <span>{stats.inProgress} tasks ({Math.round((stats.inProgress / stats.totalTasks) * 100)}%)</span>
                </div>
                <Progress percent={Math.round((stats.inProgress / stats.totalTasks) * 100)} status="active" strokeColor="#6366f1" showInfo={false} />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span><Badge status="warning" text="Đang kiểm thử (In Review)" /></span>
                  <span>{stats.inReview} tasks ({Math.round((stats.inReview / stats.totalTasks) * 100)}%)</span>
                </div>
                <Progress percent={Math.round((stats.inReview / stats.totalTasks) * 100)} strokeColor="#f59e0b" showInfo={false} />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span><Badge status="success" text="Đã hoàn thành (Done)" /></span>
                  <span>{stats.done} tasks ({Math.round((stats.done / stats.totalTasks) * 100)}%)</span>
                </div>
                <Progress percent={Math.round((stats.done / stats.totalTasks) * 100)} strokeColor="#10b981" showInfo={false} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Danh sách Epics trọng điểm" className="shadow-xs h-full">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">EP-1: Nền tảng Monorepo & Auth Core</span>
                  <Tag color="green">DONE</Tag>
                </div>
                <Progress percent={100} size="small" strokeColor="#10b981" />
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">EP-2: Bảng Kanban & Time Tracking</span>
                  <Tag color="indigo">IN PROGRESS</Tag>
                </div>
                <Progress percent={75} size="small" strokeColor="#6366f1" />
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">EP-3: Tự động hóa Workflow Rules</span>
                  <Tag color="orange">OPEN</Tag>
                </div>
                <Progress percent={25} size="small" strokeColor="#f59e0b" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Member Workload Table */}
      <Card title="Phân chia công việc theo thành viên" className="shadow-xs">
        <Table dataSource={membersData} columns={columns} pagination={false} />
      </Card>
    </div>
  );
}
