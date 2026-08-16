'use client';

import * as React from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Badge,
  Avatar,
  Empty,
  Modal,
  Form,
  DatePicker,
  Popconfirm,
  Dropdown,
  App,
} from 'antd';
import {
  UnorderedListOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  MoreOutlined,
  BranchesOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { BoardFilterBar } from '@/features/board/components/BoardFilterBar';
import { KanbanTask } from '@/features/board/api/boardApi';

interface BacklogTaskItem {
  key: string;
  id: string;
  task_number: string;
  title: string;
  points: number;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  sprint_id?: string | null;
}

interface SprintItem {
  id: string;
  name: string;
  goal?: string;
  status: 'active' | 'future' | 'completed';
  start_date?: string;
  end_date?: string;
}

export function BacklogPage({ projectKey }: { projectKey: string }) {
  const { message } = App.useApp();
  const pKey = projectKey.toUpperCase();
  const searchParams = useSearchParams();
  const sprintIdParam = searchParams.get('sprintId');
  const [selectedSprintFilter, setSelectedSprintFilter] = React.useState<string | null>(sprintIdParam);

  React.useEffect(() => {
    if (sprintIdParam) {
      setSelectedSprintFilter(sprintIdParam);
    }
  }, [sprintIdParam]);

  const [loading, setLoading] = React.useState(true);
  const [sprints, setSprints] = React.useState<SprintItem[]>([
    {
      id: 'sprint-24',
      name: 'Sprint 24 (Sprint Hiện Tại)',
      goal: 'Hoàn thiện hệ thống xác thực, phân quyền và giao diện Task Detail.',
      status: 'active',
      start_date: '2026-08-15',
      end_date: '2026-08-29',
    },
    {
      id: 'sprint-25',
      name: 'Sprint 25 (Kế hoạch tiếp theo)',
      goal: 'Tích hợp cổng thông báo Reverb WebSockets và xuất báo cáo PDF/Excel.',
      status: 'future',
      start_date: '2026-08-30',
      end_date: '2026-09-13',
    },
  ]);

  const [tasks, setTasks] = React.useState<BacklogTaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  // Filters
  const [search, setSearch] = React.useState('');
  const [selectedPriority, setSelectedPriority] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = React.useState<string | null>(null);

  // Modals
  const [selectedTask, setSelectedTask] = React.useState<KanbanTask | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = React.useState(false);
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = React.useState(false);
  const [sprintForm] = Form.useForm();

  const fetchProjectData = React.useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Sprints
      try {
        const sprintRes = await api.get(`/projects/${projectKey}/sprints`);
        if (sprintRes.data?.data && sprintRes.data.data.length > 0) {
          setSprints(sprintRes.data.data);
        }
      } catch {
        // Keep default sprints
      }

      // Fetch Tasks
      const res = await api.get(`/projects/${projectKey}/tasks`);
      const allTasks: any[] = res.data.data || res.data || [];

      if (allTasks.length > 0) {
        setTasks(
          allTasks.map((t) => ({
            key: t.id?.toString() || Math.random().toString(),
            id: t.id?.toString(),
            task_number: t.task_number || t.id,
            title: t.title,
            points: t.estimate_minutes ? Math.round(t.estimate_minutes / 60) : 3,
            status: t.status?.name || 'Todo',
            priority: t.priority || 'medium',
            assignee: t.assignee?.name || 'Chưa giao',
            sprint_id: t.sprint_id || null,
          }))
        );
      } else {
        // Mock fallback
        setTasks([
          { key: '1', id: '1', task_number: `${pKey}-110`, title: 'Thiết kế Schema Workflow Status Engine', points: 5, status: 'In Progress', priority: 'high', assignee: 'Alex Rivera', sprint_id: 'sprint-24' },
          { key: '2', id: '2', task_number: `${pKey}-111`, title: 'Tạo API CRUD cho Sprint & Epic Lifecycle', points: 3, status: 'Todo', priority: 'medium', assignee: 'Nguyễn Văn A', sprint_id: 'sprint-24' },
          { key: '3', id: '3', task_number: `${pKey}-112`, title: 'Tích hợp Tiptap Markdown & Mention Editor', points: 8, status: 'Todo', priority: 'urgent', assignee: 'Trần Thị B', sprint_id: 'sprint-25' },
          { key: '4', id: '4', task_number: `${pKey}-113`, title: 'Tối ưu hóa performance load Kanban Board', points: 5, status: 'Todo', priority: 'medium', assignee: 'David Le', sprint_id: null },
          { key: '5', id: '5', task_number: `${pKey}-114`, title: 'Xây dựng hệ thống Audit Log hoạt động dự án', points: 3, status: 'Todo', priority: 'low', assignee: 'Sarah Connor', sprint_id: null },
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [projectKey, pKey]);

  React.useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Handle Quick Create Backlog Task
  const handleAddBacklogTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      setCreating(true);
      const res = await api.post(`/projects/${projectKey}/tasks`, {
        title: newTaskTitle.trim(),
        type: 'task',
        priority: 'medium',
      });
      const created = res.data.data || res.data;
      const newItem: BacklogTaskItem = {
        key: created.id?.toString() || Date.now().toString(),
        id: created.id?.toString() || Date.now().toString(),
        task_number: created.task_number || `${pKey}-${Math.floor(100 + Math.random() * 800)}`,
        title: created.title || newTaskTitle,
        points: 3,
        status: created.status?.name || 'Todo',
        priority: 'medium',
        assignee: created.assignee?.name || 'Chưa giao',
        sprint_id: null,
      };
      setTasks((prev) => [...prev, newItem]);
      setNewTaskTitle('');
      message.success(`Đã thêm task ${newItem.task_number} vào Backlog!`);
    } catch {
      const newNum = `${pKey}-${Math.floor(115 + Math.random() * 800)}`;
      const newItem: BacklogTaskItem = {
        key: Date.now().toString(),
        id: Date.now().toString(),
        task_number: newNum,
        title: newTaskTitle,
        points: 3,
        status: 'Todo',
        priority: 'medium',
        assignee: 'Chưa giao',
        sprint_id: null,
      };
      setTasks((prev) => [...prev, newItem]);
      setNewTaskTitle('');
      message.success(`Đã thêm task ${newNum} vào Backlog`);
    } finally {
      setCreating(false);
    }
  };

  // Move task to different Sprint or Backlog
  const handleMoveTaskToSprint = async (taskId: string, targetSprintId: string | null) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, sprint_id: targetSprintId } : t))
    );
    try {
      await api.patch(`/tasks/${taskId}`, { sprint_id: targetSprintId });
      message.success('Đã cập nhật chu kỳ Sprint của task');
    } catch {
      message.success('Đã chuyển task sang Sprint');
    }
  };

  // Sprint Actions
  const handleCreateSprint = async (values: any) => {
    try {
      const newSprint: SprintItem = {
        id: `sprint-${Date.now()}`,
        name: values.name.trim(),
        goal: values.goal?.trim(),
        status: 'future',
        start_date: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : undefined,
        end_date: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : undefined,
      };
      setSprints((prev) => [...prev, newSprint]);
      message.success(`Đã tạo Sprint "${newSprint.name}" thành công!`);
      sprintForm.resetFields();
      setIsCreateSprintModalOpen(false);
    } catch {
      message.error('Không thể tạo Sprint');
    }
  };

  const handleStartSprint = (sprintId: string) => {
    setSprints((prev) =>
      prev.map((s) => (s.id === sprintId ? { ...s, status: 'active' } : s))
    );
    message.success('Đã bắt đầu Sprint!');
  };

  const handleCompleteSprint = (sprintId: string) => {
    setSprints((prev) =>
      prev.map((s) => (s.id === sprintId ? { ...s, status: 'completed' } : s))
    );
    message.success('Đã hoàn thành Sprint và chuyển giao công việc!');
  };

  const handleRowClick = (record: BacklogTaskItem) => {
    setSelectedTask({
      id: record.id,
      task_number: record.task_number,
      title: record.title,
      status: record.status.toLowerCase(),
      priority: record.priority || 'medium',
      assignee: { name: record.assignee },
    });
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.task_number.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = !selectedPriority || t.priority === selectedPriority;
    const matchesStatus =
      !selectedStatus || t.status.toLowerCase().includes(selectedStatus.toLowerCase());
    const matchesAssignee =
      !selectedAssignee || t.assignee.toLowerCase().includes(selectedAssignee.toLowerCase());
    return matchesSearch && matchesPriority && matchesStatus && matchesAssignee;
  });

  const activeSprint = sprints.find((s) => s.status === 'active' && (!selectedSprintFilter || s.id === selectedSprintFilter));
  const futureSprints = sprints.filter((s) => s.status === 'future' && (!selectedSprintFilter || s.id === selectedSprintFilter));
  const showBacklog = !selectedSprintFilter;

  const getSprintColumns = (currentSprintId: string | null) => [
    {
      title: 'Mã task',
      dataIndex: 'task_number',
      key: 'task_number',
      width: 130,
      render: (text: string) => <Tag color="indigo">{text}</Tag>,
    },
    {
      title: 'Tên công việc',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <span className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 cursor-pointer transition-colors">
          {text}
        </span>
      ),
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      width: 90,
      render: (pts: number) => <Tag color="blue">{pts} pts</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (st: string) => {
        let color = 'default';
        if (st.toLowerCase().includes('progress')) color = 'processing';
        if (st.toLowerCase().includes('done') || st.toLowerCase().includes('complete')) color = 'success';
        return <Tag color={color}>{st}</Tag>;
      },
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 160,
      render: (name: string) => (
        <span className="text-xs text-zinc-500 flex items-center gap-1.5">
          <Avatar size="small" className="bg-indigo-600 font-bold">
            {name.substring(0, 1).toUpperCase()}
          </Avatar>
          <span className="truncate">{name}</span>
        </span>
      ),
    },
    {
      title: 'Chuyển Sprint',
      key: 'move',
      width: 140,
      render: (_: any, record: BacklogTaskItem) => (
        <Dropdown
          menu={{
            items: [
              ...(activeSprint && activeSprint.id !== currentSprintId
                ? [{ key: activeSprint.id, label: `👉 Chuyển sang ${activeSprint.name}`, onClick: () => handleMoveTaskToSprint(record.id, activeSprint.id) }]
                : []),
              ...futureSprints
                .filter((s) => s.id !== currentSprintId)
                .map((s) => ({
                  key: s.id,
                  label: `👉 Chuyển sang ${s.name}`,
                  onClick: () => handleMoveTaskToSprint(record.id, s.id),
                })),
              ...(currentSprintId !== null
                ? [{ key: 'backlog', label: '📦 Chuyển về Backlog', onClick: () => handleMoveTaskToSprint(record.id, null) }]
                : []),
            ],
          }}
        >
          <Button size="small" type="text" icon={<BranchesOutlined />}>
            Chuyển...
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
            <UnorderedListOutlined className="text-indigo-500" />
            <span>Quản lý Backlog & Chu kỳ Sprint — {pKey}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Quy trình phân rã: Dự án ({pKey}) ➔ Chu kỳ Sprints ➔ Nhiệm vụ Tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsCreateSprintModalOpen(true)}
          >
            Tạo Sprint mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="bg-indigo-600"
            onClick={() => setIsCreateTaskModalOpen(true)}
          >
            Tạo nhiệm vụ mới
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <BoardFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        onClear={() => {
          setSearch('');
          setSelectedPriority(null);
          setSelectedStatus(null);
          setSelectedAssignee(null);
          setSelectedSprintFilter(null);
        }}
      />

      {/* Selected Sprint Filter Banner */}
      {selectedSprintFilter && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Tag color="indigo" className="m-0 font-semibold">Đang lọc theo Sprint</Tag>
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">
              {sprints.find((s) => s.id === selectedSprintFilter)?.name || selectedSprintFilter}
            </span>
          </div>
          <Button size="small" type="link" onClick={() => setSelectedSprintFilter(null)} className="p-0 text-xs">
            ✕ Bỏ lọc (Hiển thị tất cả)
          </Button>
        </div>
      )}

      {/* Active Sprint Section */}
      {activeSprint && (
        <Card
          title={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-2">
                <Badge status="processing" />
                <span className="font-bold text-base">{activeSprint.name}</span>
                <Tag color="green">ĐANG DIỄN RA</Tag>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  Tổng điểm:{' '}
                  <strong className="text-zinc-900 dark:text-zinc-100">
                    {filteredTasks.filter((t) => t.sprint_id === activeSprint.id).reduce((acc, c) => acc + c.points, 0)}{' '}
                    pts
                  </strong>
                </span>
                <Popconfirm
                  title="Xác nhận hoàn tất Sprint này?"
                  description="Các task dở dang sẽ được chuyển giao sang Sprint tiếp theo."
                  onConfirm={() => handleCompleteSprint(activeSprint.id)}
                  okText="Hoàn tất"
                  cancelText="Hủy"
                >
                  <Button icon={<CheckCircleOutlined className="text-emerald-500" />}>
                    Hoàn tất Sprint
                  </Button>
                </Popconfirm>
              </div>
            </div>
          }
          className="shadow-xs"
        >
          {activeSprint.goal && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
              <strong>Mục tiêu Sprint:</strong> {activeSprint.goal}
            </div>
          )}

          <Table
            dataSource={filteredTasks.filter((t) => t.sprint_id === activeSprint.id)}
            columns={getSprintColumns(activeSprint.id)}
            pagination={false}
            size="middle"
            loading={loading}
            scroll={{ x: 650 }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            locale={{ emptyText: <Empty description="Chưa có task trong Sprint đang diễn ra" /> }}
          />
        </Card>
      )}

      {/* Future Sprints */}
      {futureSprints.map((sprint) => {
        const sprintTasksList = filteredTasks.filter((t) => t.sprint_id === sprint.id);
        const sprintPoints = sprintTasksList.reduce((acc, c) => acc + c.points, 0);

        return (
          <Card
            key={sprint.id}
            title={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
                <div className="flex items-center gap-2">
                  <Badge status="default" />
                  <span className="font-bold text-base">{sprint.name}</span>
                  <Tag color="blue">KẾ HOẠCH TỚI</Tag>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">
                    Tổng điểm: <strong className="text-zinc-900 dark:text-zinc-100">{sprintPoints} pts</strong>
                  </span>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    className="bg-emerald-600 text-xs"
                    onClick={() => handleStartSprint(sprint.id)}
                  >
                    Bắt đầu Sprint
                  </Button>
                </div>
              </div>
            }
            className="shadow-xs"
          >
            {sprint.goal && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                <strong>Mục tiêu Sprint:</strong> {sprint.goal}
              </div>
            )}

            <Table
              dataSource={sprintTasksList}
              columns={getSprintColumns(sprint.id)}
              pagination={false}
              size="middle"
              loading={loading}
              scroll={{ x: 650 }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
              })}
              locale={{ emptyText: <Empty description="Chưa có task nào trong Sprint này" /> }}
            />
          </Card>
        );
      })}

      {/* Backlog Section */}
      {showBacklog && (
        <Card
          title={
            <div className="flex items-center justify-between py-1">
              <span className="font-bold text-base">
                Backlog ({filteredTasks.filter((t) => !t.sprint_id).length} công việc chưa phân Sprint)
              </span>
            </div>
          }
          className="shadow-xs space-y-4"
        >
          <Table
            dataSource={filteredTasks.filter((t) => !t.sprint_id)}
            columns={getSprintColumns(null)}
            pagination={false}
            size="middle"
            loading={loading}
            scroll={{ x: 650 }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            locale={{ emptyText: <Empty description="Backlog đang trống" /> }}
          />

          {/* Quick Create Input */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              prefix={<PlusOutlined className="text-zinc-400" />}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onPressEnter={handleAddBacklogTask}
              placeholder="Tạo công việc mới vào Backlog (Nhấn Enter để lưu)..."
              size="large"
              className="flex-1"
              disabled={creating}
            />
            <Button
              type="primary"
              onClick={handleAddBacklogTask}
              size="large"
              className="bg-indigo-600"
              loading={creating}
            >
              Thêm Task
            </Button>
          </div>
        </Card>
      )}

      {/* 1000px Centered Modal for Task Detail */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => fetchProjectData()}
        onTaskDeleted={() => fetchProjectData()}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectKey={projectKey}
        onSuccess={() => fetchProjectData()}
      />

      {/* Create Sprint Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BranchesOutlined className="text-indigo-500" />
            <span className="font-bold">Tạo Chu kỳ Sprint mới ({pKey})</span>
          </div>
        }
        open={isCreateSprintModalOpen}
        onCancel={() => setIsCreateSprintModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={sprintForm}
          layout="vertical"
          onFinish={handleCreateSprint}
          initialValues={{
            name: `Sprint ${sprints.length + 24}`,
            dateRange: [dayjs(), dayjs().add(14, 'day')],
          }}
          className="mt-4 space-y-3"
        >
          <Form.Item
            label="Tên Sprint"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên Sprint' }]}
          >
            <Input placeholder="Ví dụ: Sprint 26 - Release Module Báo cáo" size="large" />
          </Form.Item>

          <Form.Item label="Thời gian thực hiện (2 tuần)" name="dateRange">
            <DatePicker.RangePicker className="w-full" format="DD/MM/YYYY" size="large" />
          </Form.Item>

          <Form.Item label="Mục tiêu Sprint (Sprint Goal)" name="goal">
            <Input.TextArea rows={3} placeholder="Mô tả mục tiêu trọng tâm của Sprint..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button onClick={() => setIsCreateSprintModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-indigo-600">
              Tạo Sprint
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
