'use client';

import * as React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Spin, Empty } from 'antd';
import {
  DashboardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  UserOutlined,
  LineChartOutlined,
  PieChartOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useParams } from 'next/navigation';
import { api } from '@/lib/axios';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export default function ProjectSummaryPage() {
  const params = useParams();
  const projectKey = (params?.projectKey as string) || 'CORE-ENG';
  const pKey = projectKey.toUpperCase();

  const [loading, setLoading] = React.useState(true);
  const [summaryData, setSummaryData] = React.useState<any>(null);

  const fetchSummary = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectKey}/summary`);
      setSummaryData(res.data.data || res.data);
    } catch {
      // Fallback
      setSummaryData({
        project: { name: 'Core Product Engineering', key: pKey },
        tasks_count: 28,
        completed_tasks_count: 16,
        in_progress_tasks_count: 8,
        todo_tasks_count: 4,
        total_time_spent_hours: 142.5,
        sprints_count: 3,
        members_count: 6,
        completion_rate: 62.5,
      });
    } finally {
      setLoading(false);
    }
  }, [projectKey, pKey]);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Chart 1: Sprint Burndown Data
  const burndownData = [
    { day: 'Day 1', ideal: 40, actual: 40 },
    { day: 'Day 3', ideal: 32, actual: 35 },
    { day: 'Day 5', ideal: 24, actual: 28 },
    { day: 'Day 7', ideal: 16, actual: 18 },
    { day: 'Day 9', ideal: 8, actual: 10 },
    { day: 'Day 12', ideal: 0, actual: 4 },
  ];

  // Chart 2: Workload Distribution by Member
  const workloadData = [
    { name: 'Alex R.', tasks: 8, hours: 32 },
    { name: 'Nguyen A', tasks: 7, hours: 28 },
    { name: 'Tran B', tasks: 6, hours: 24 },
    { name: 'David L.', tasks: 4, hours: 18 },
    { name: 'Sarah C.', tasks: 3, hours: 12 },
  ];

  // Chart 3: Status Distribution
  const statusPieData = [
    { name: 'Hoàn thành', value: summaryData?.completed_tasks_count || 16, color: '#10b981' },
    { name: 'Đang làm', value: summaryData?.in_progress_tasks_count || 8, color: '#6366f1' },
    { name: 'Cần làm', value: summaryData?.todo_tasks_count || 4, color: '#94a3b8' },
  ];

  const recentTasks = [
    { key: '1', id: `${pKey}-101`, title: 'Thiết kế Schema Multi-tenant & RBAC Gate', status: 'Done', priority: 'High', assignee: 'Alex K.' },
    { key: '2', id: `${pKey}-102`, title: 'Tích hợp Auth Sanctum & LDAP SSO Provider', status: 'In Progress', priority: 'Urgent', assignee: 'Sarah T.' },
    { key: '3', id: `${pKey}-103`, title: 'Bảng Kanban Ant Design UI & SlideOver', status: 'In Progress', priority: 'Urgent', assignee: 'David L.' },
    { key: '4', id: `${pKey}-104`, title: 'Realtime Activity Logs & Reverb WebSockets', status: 'Todo', priority: 'Medium', assignee: 'Elena R.' },
  ];

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Tag color="indigo">{text}</Tag>,
    },
    {
      title: 'Nhiệm vụ',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-semibold text-zinc-900 dark:text-zinc-100">{text}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        let color = 'default';
        if (st === 'In Progress') color = 'processing';
        if (st === 'Done') color = 'success';
        return <Tag color={color}>{st}</Tag>;
      },
    },
    {
      title: 'Người làm',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (name: string) => <span className="text-xs text-zinc-500">{name}</span>,
    },
  ];

  if (loading && !summaryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spin size="large" />
        <span className="text-xs text-zinc-500 font-medium">Đang tải dữ liệu tổng quan dự án...</span>
      </div>
    );
  }

  const completionRate = summaryData?.completion_rate ?? 62.5;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
            <DashboardOutlined className="text-indigo-500" />
            <span>Tổng quan & Báo cáo Dự án — {summaryData?.project?.name || pKey}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Báo cáo tiến độ, biểu đồ Burndown, phân bổ khối lượng công việc và sức khỏe dự án
          </p>
        </div>

        <Button icon={<ReloadOutlined />} onClick={fetchSummary} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs">
            <Statistic
              title="Tổng số công việc"
              value={summaryData?.tasks_count ?? 28}
              prefix={<DashboardOutlined className="text-indigo-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs">
            <Statistic
              title="Đã hoàn thành"
              value={summaryData?.completed_tasks_count ?? 16}
              styles={{ content: { color: '#10b981' } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs">
            <Statistic
              title="Đang thực hiện"
              value={summaryData?.in_progress_tasks_count ?? 8}
              styles={{ content: { color: '#6366f1' } }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs">
            <Statistic
              title="Tổng giờ đã log (Hours)"
              value={`${summaryData?.total_time_spent_hours ?? 142.5}h`}
              styles={{ content: { color: '#f59e0b' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Visual Analytics Charts Row */}
      <Row gutter={[16, 16]}>
        {/* Burndown Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <LineChartOutlined className="text-indigo-500" />
                <span>Biểu đồ Burndown Sprint (Story Points)</span>
              </div>
            }
            className="shadow-xs"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={burndownData}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="Thực tế còn lại"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActual)"
                  />
                  <Area
                    type="monotone"
                    dataKey="ideal"
                    name="Kế hoạch lý tưởng"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Workload Distribution Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <BarChartOutlined className="text-indigo-500" />
                <span>Phân bổ Khối lượng Công việc theo Nhân sự</span>
              </div>
            }
            className="shadow-xs"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="tasks" name="Số nhiệm vụ" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hours" name="Giờ làm việc" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Progress & Breakdown */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <PieChartOutlined className="text-indigo-500" />
                <span>Tỷ lệ Trạng thái Công việc</span>
              </div>
            }
            className="shadow-xs text-center"
          >
            <div className="h-[180px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-zinc-500 m-0 mt-2">
              {summaryData?.completed_tasks_count ?? 16} / {summaryData?.tasks_count ?? 28} nhiệm vụ đã hoàn thành ({completionRate}%)
            </p>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Nhiệm vụ trọng tâm gần đây"
            className="shadow-xs"
          >
            <Table
              dataSource={recentTasks}
              columns={columns}
              pagination={false}
              size="middle"
              scroll={{ x: 500 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
