'use client';

import * as React from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Timeline,
  Tag,
  Button,
  Badge,
  Spin,
  Empty,
  Input,
  Select,
  Avatar,
  Space,
} from 'antd';
import {
  UnorderedListOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  UserOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  ProjectOutlined,
  BarChartOutlined,
  PieChartOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { api } from '@/lib/axios';
import {
  ResponsiveContainer,
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
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { KanbanTask } from '@/features/board/api/boardApi';

export function MyWorkDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<any>(null);
  const [allTasks, setAllTasks] = React.useState<any[]>([]);
  const [projectsList, setProjectsList] = React.useState<any[]>([]);
  const [selectedTask, setSelectedTask] = React.useState<KanbanTask | null>(null);

  // Table filters
  const [search, setSearch] = React.useState('');
  const [selectedProject, setSelectedProject] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, projRes, myRes] = await Promise.allSettled([
        api.get('/dashboard/summary'),
        api.get('/projects'),
        api.get('/dashboard/my-work'),
      ]);

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value.data.data || sumRes.value.data);
      } else {
        setSummary({
          total_projects: 3,
          total_tasks: 34,
          completion_rate: 68.5,
          active_sprints: 2,
          total_estimate_hours: 180,
          total_logged_hours: 124.5,
          by_category: { todo: 6, in_progress: 10, in_review: 4, done: 14 },
        });
      }

      if (projRes.status === 'fulfilled' && projRes.value.data?.data) {
        setProjectsList(projRes.value.data.data);
      } else {
        setProjectsList([
          { id: '1', name: 'Core Task Engine API', key: 'TASK', tasks_count: 14, completed_count: 10 },
          { id: '2', name: 'Mobile App (iOS & Android)', key: 'MOBI', tasks_count: 8, completed_count: 3 },
          { id: '3', name: 'Core Product Engineering', key: 'CORE-ENG', tasks_count: 12, completed_count: 6 },
        ]);
      }

      if (myRes.status === 'fulfilled' && myRes.value.data?.data) {
        const raw = myRes.value.data.data;
        const rawList = [...(raw.my_tasks || []), ...(raw.due_today || []), ...(raw.overdue || [])];
        const seen = new Set<string>();
        const uniqueList = rawList.filter((task: any) => {
          const id = task?.id?.toString();
          if (!id || seen.has(id)) {
            return false;
          }
          seen.add(id);
          return true;
        });
        setAllTasks(uniqueList);
      }
    } catch {
      // Fallback handled
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Analytics Chart Data
  const projectComparisonData = [
    { name: 'TASK', total: 14, done: 10 },
    { name: 'MOBI', total: 8, done: 3 },
    { name: 'CORE-ENG', total: 12, done: 6 },
  ];

  const statusPieData = [
    { name: 'Hoàn thành', value: summary?.by_category?.done || 14, color: '#10b981' },
    { name: 'Đang làm', value: summary?.by_category?.in_progress || 10, color: '#6366f1' },
    { name: 'Cần làm', value: summary?.by_category?.todo || 6, color: '#94a3b8' },
    { name: 'Đang review', value: summary?.by_category?.in_review || 4, color: '#f59e0b' },
  ];

  const teamWorkloadData = [
    { name: 'Alex Rivera', tasks: 8, hours: 32 },
    { name: 'Nguyễn Văn A', tasks: 7, hours: 28 },
    { name: 'Trần Thị B', tasks: 6, hours: 24 },
    { name: 'David Le', tasks: 5, hours: 18 },
    { name: 'Sarah Connor', tasks: 3, hours: 12 },
  ];

  const defaultMasterTasks = [
    { id: '1', task_number: 'CORE-ENG-101', project_key: 'CORE-ENG', title: 'Thiết kế Schema Multi-tenant & Workspaces', status: 'Done', priority: 'high', assignee: 'Alex Rivera', due: 'Hôm nay' },
    { id: '2', task_number: 'CORE-ENG-102', project_key: 'CORE-ENG', title: 'Tích hợp Auth Sanctum & LDAP SSO Provider', status: 'In Progress', priority: 'urgent', assignee: 'Nguyễn Văn A', due: 'Hôm nay' },
    { id: '3', task_number: 'CORE-ENG-103', project_key: 'CORE-ENG', title: 'Bảng Kanban Ant Design & Task Detail Modal 1000px', status: 'In Progress', priority: 'high', assignee: 'Trần Thị B', due: 'Ngày mai' },
    { id: '4', task_number: 'TASK-1', project_key: 'TASK', title: 'Setup PostgreSQL multi-tenant schema with workspace scoping', status: 'Done', priority: 'high', assignee: 'Alex Rivera', due: '12/08' },
    { id: '5', task_number: 'TASK-2', project_key: 'TASK', title: 'Sanctum Bearer Token Auth & Session Rotation', status: 'Done', priority: 'urgent', assignee: 'Nguyễn Văn A', due: '14/08' },
    { id: '6', task_number: 'MOBI-101', project_key: 'MOBI', title: 'Khởi tạo Flutter mobile app framework & Navigation', status: 'In Progress', priority: 'medium', assignee: 'David Le', due: '24/08' },
  ];

  const masterListToDisplay = React.useMemo(() => {
    if (allTasks.length === 0) {
      return defaultMasterTasks;
    }
    const seen = new Set<string>();
    const list: typeof defaultMasterTasks = [];
    for (const t of allTasks) {
      const id = t.id?.toString();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      list.push({
        id,
        task_number: t.task_number || t.id,
        project_key: t.project?.key || 'CORE-ENG',
        title: t.title,
        status: t.status?.name || 'In Progress',
        priority: t.priority || 'medium',
        assignee: t.assignee?.name || 'Chưa giao',
        due: t.due_date ? t.due_date.substring(0, 10) : 'Chưa đặt',
      });
    }
    return list;
  }, [allTasks]);

  const filteredMasterList = masterListToDisplay.filter((item) => {
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.task_number.toLowerCase().includes(search.toLowerCase());
    const matchProj = !selectedProject || item.project_key === selectedProject;
    const matchStatus =
      !selectedStatus || item.status.toLowerCase().includes(selectedStatus.toLowerCase());
    const matchPriority = !selectedPriority || item.priority === selectedPriority;

    return matchSearch && matchProj && matchStatus && matchPriority;
  });

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'task_number',
      key: 'task_number',
      width: 140,
      render: (text: string) => <Tag color="indigo" className="font-mono font-bold">{text}</Tag>,
    },
    {
      title: 'Dự án',
      dataIndex: 'project_key',
      key: 'project_key',
      width: 120,
      render: (key: string) => <Tag color="blue">{key}</Tag>,
    },
    {
      title: 'Tên nhiệm vụ',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <span className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 cursor-pointer transition-colors">
          {text}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        let color = 'default';
        if (status.toLowerCase().includes('done') || status.toLowerCase().includes('hoàn')) color = 'success';
        if (status.toLowerCase().includes('progress') || status.toLowerCase().includes('đang')) color = 'processing';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (p: string) => {
        let color = 'blue';
        const pl = (p || '').toLowerCase();
        if (pl === 'urgent' || pl === 'critical') color = 'red';
        if (pl === 'high') color = 'orange';
        return <Tag color={color}>{p.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Người làm',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 160,
      render: (name: string) => (
        <span className="text-xs text-zinc-500 flex items-center gap-1.5">
          <Avatar size="small" className="bg-indigo-600 font-bold shrink-0">
            {name.substring(0, 1).toUpperCase()}
          </Avatar>
          <span className="truncate">{name}</span>
        </span>
      ),
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 m-0 flex items-center gap-2">
            <ProjectOutlined className="text-indigo-500" />
            <span>Tổng quan Toàn bộ Workspace</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tổng hợp các chỉ số KPI, biểu đồ tiến độ dự án và bảng công việc đa dự án
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
          <Link href="/projects/core-eng/board">
            <Button type="primary" icon={<PlusOutlined />} className="bg-indigo-600">
              Đi tới Board
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Global KPI Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
            <Statistic
              title="Tổng số Dự án"
              value={summary?.total_projects ?? 3}
              prefix={<ProjectOutlined className="text-indigo-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
            <Statistic
              title="Tổng số Nhiệm vụ"
              value={summary?.total_tasks ?? 34}
              prefix={<UnorderedListOutlined className="text-indigo-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
            <Statistic
              title="Tỷ lệ hoàn thành chung"
              value={`${summary?.completion_rate ?? 68.5}%`}
              valueStyle={{ color: '#10b981' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
            <Statistic
              title="Sprints đang kích hoạt"
              value={summary?.active_sprints ?? 2}
              valueStyle={{ color: '#6366f1' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 2. Visual Analytics Charts */}
      <Row gutter={[16, 16]}>
        {/* Project Comparison Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <BarChartOutlined className="text-indigo-500" />
                <span>Tiến độ và Khối lượng Công việc theo Dự án</span>
              </div>
            }
            className="shadow-xs border-zinc-200 dark:border-zinc-800"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectComparisonData}>
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
                  <Bar dataKey="total" name="Tổng nhiệm vụ" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="done" name="Đã hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Workload by Team Member */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-indigo-500" />
                <span>Phân bổ Khối lượng Nhân sự Toàn Workspace</span>
              </div>
            }
            className="shadow-xs border-zinc-200 dark:border-zinc-800"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamWorkloadData}>
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
                  <Bar dataKey="tasks" name="Tasks đảm nhận" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hours" name="Giờ làm (h)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3. Status Donut Chart & Timeline */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <PieChartOutlined className="text-indigo-500" />
                <span>Phân loại Trạng thái Toàn Workspace</span>
              </div>
            }
            className="shadow-xs border-zinc-200 dark:border-zinc-800 text-center"
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
              {summary?.by_category?.done ?? 14} / {summary?.total_tasks ?? 34} nhiệm vụ hoàn tất ({summary?.completion_rate ?? 68.5}%)
            </p>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Hoạt động gần đây" className="shadow-xs border-zinc-200 dark:border-zinc-800 h-full">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <p className="text-xs font-semibold m-0 text-zinc-800 dark:text-zinc-200">
                        Bạn đã hoàn thành công việc CORE-ENG-104: Quản lý chu kỳ Sprints
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
                        Nguyễn Văn A đã gán CORE-ENG-102 cho bạn
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
                        Trần Thị B đã thêm bình luận vào CORE-ENG-101
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

      {/* 4. WORKSPACE MASTER TASKS TABLE */}
      <Card
        title={
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-1">
            <span className="font-bold text-base">
              Bảng Danh sách Công việc Chi tiết Toàn Workspace ({filteredMasterList.length})
            </span>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Tìm mã hoặc tên task..."
                prefix={<SearchOutlined className="text-zinc-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                className="w-44 text-xs"
                allowClear
              />

              <Select
                placeholder="Dự án"
                value={selectedProject || undefined}
                onChange={setSelectedProject}
                size="small"
                allowClear
                className="w-32 text-xs"
                options={projectsList.map((p) => ({ value: p.key, label: p.key }))}
              />

              <Select
                placeholder="Trạng thái"
                value={selectedStatus || undefined}
                onChange={setSelectedStatus}
                size="small"
                allowClear
                className="w-32 text-xs"
                options={[
                  { value: 'done', label: 'Hoàn thành' },
                  { value: 'in progress', label: 'Đang làm' },
                  { value: 'todo', label: 'Cần làm' },
                ]}
              />

              <Select
                placeholder="Ưu tiên"
                value={selectedPriority || undefined}
                onChange={setSelectedPriority}
                size="small"
                allowClear
                className="w-32 text-xs"
                options={[
                  { value: 'urgent', label: 'Khẩn cấp' },
                  { value: 'high', label: 'Cao' },
                  { value: 'medium', label: 'Trung bình' },
                  { value: 'low', label: 'Thấp' },
                ]}
              />
            </div>
          </div>
        }
        className="shadow-xs border-zinc-200 dark:border-zinc-800"
      >
        <Table
          dataSource={filteredMasterList}
          columns={columns}
          rowKey={(record) => record.id}
          pagination={{ pageSize: 8, showSizeChanger: true }}
          size="middle"
          scroll={{ x: 750 }}
          onRow={(record) => ({
            onClick: () =>
              setSelectedTask({
                id: record.id,
                task_number: record.task_number,
                title: record.title,
                status: record.status,
                priority: (record.priority as any) || 'medium',
              }),
          })}
          locale={{ emptyText: <Empty description="Không có công việc nào khớp với bộ lọc" /> }}
        />
      </Card>

      {/* 1000px Centered Modal for Task Detail */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => fetchData()}
      />
    </div>
  );
}
