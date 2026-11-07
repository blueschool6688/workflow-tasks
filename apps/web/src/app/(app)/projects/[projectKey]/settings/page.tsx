"use client";

import * as React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Tabs,
  Table,
  Tag,
  Popconfirm,
  Spin,
  Empty,
  App,
} from "antd";
import {
  SettingOutlined,
  SaveOutlined,
  BranchesOutlined,
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/axios";
import { ProjectWorkflowModal } from "@/features/workflow/components/ProjectWorkflowModal";

interface ProjectInfo {
  id: string;
  workspace_id: string;
  name: string;
  key: string;
  description?: string | null;
  type: string;
  status: "active" | "completed" | "archived";
}

interface Member {
  id: number;
  name: string;
  email: string;
  role_in_project: string;
  is_lead: boolean;
}

interface Epic {
  id: string;
  title: string;
  description?: string | null;
  color: string;
  tasks_count?: number;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

const ROLE_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
  { value: "developer", label: "Developer" },
  { value: "reporter", label: "Reporter" },
  { value: "viewer", label: "Viewer" },
];

const COLOR_OPTIONS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
];

export default function ProjectSettingsPage() {
  const { message } = App.useApp();
  const params = useParams();
  const projectKey = params?.projectKey as string;
  const pKey = projectKey.toUpperCase();

  const [project, setProject] = React.useState<ProjectInfo | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [candidates, setCandidates] = React.useState<
    { id: number; name: string; email: string }[]
  >([]);
  const [canManageMembers, setCanManageMembers] = React.useState(false);
  const [epics, setEpics] = React.useState<Epic[]>([]);
  const [labels, setLabels] = React.useState<Label[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = React.useState(false);

  const [generalForm] = Form.useForm();
  const [memberForm] = Form.useForm();
  const [epicForm] = Form.useForm();
  const [labelForm] = Form.useForm();

  const loadMembers = React.useCallback(async () => {
    const res = await api.get(`/projects/${projectKey}/members`);
    setMembers(res.data.data);
    setCandidates(res.data.candidates);
    setCanManageMembers(res.data.can_manage);
  }, [projectKey]);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const [projectRes, epicRes] = await Promise.all([
        api.get(`/projects/${projectKey}`),
        api.get(`/projects/${projectKey}/epics`),
        loadMembers(),
      ]);
      const p: ProjectInfo = projectRes.data.data;
      setProject(p);
      generalForm.setFieldsValue(p);
      setEpics(epicRes.data.data);
      const labelRes = await api.get(`/workspaces/${p.workspace_id}/labels`);
      setLabels(labelRes.data.data);
    } catch (error) {
      message.error(apiErrorMessage(error, "Không tải được cấu hình dự án"));
    } finally {
      setLoading(false);
    }
  }, [projectKey, generalForm, loadMembers, message]);

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  const run = async (
    action: () => Promise<unknown>,
    success: string,
    fallbackError: string
  ) => {
    try {
      setSaving(true);
      await action();
      message.success(success);
      return true;
    } catch (error) {
      message.error(apiErrorMessage(error, fallbackError));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = (
    values: Pick<ProjectInfo, "name" | "description" | "status">
  ) =>
    run(
      async () => {
        const res = await api.patch(`/projects/${projectKey}`, values);
        setProject(res.data.data);
      },
      "Đã lưu cấu hình dự án",
      "Không thể lưu cấu hình dự án"
    );

  const handleAddMember = async (values: {
    user_id: number;
    role_in_project: string;
  }) => {
    const ok = await run(
      () => api.post(`/projects/${projectKey}/members`, values),
      "Đã thêm thành viên",
      "Không thể thêm thành viên"
    );
    if (ok) {
      memberForm.resetFields();
      loadMembers();
    }
  };

  const handleChangeRole = async (member: Member, role: string) => {
    const ok = await run(
      () =>
        api.post(`/projects/${projectKey}/members`, {
          user_id: member.id,
          role_in_project: role,
        }),
      `Đã đổi vai trò của ${member.name}`,
      "Không thể đổi vai trò"
    );
    if (ok) loadMembers();
  };

  const handleRemoveMember = async (member: Member) => {
    const ok = await run(
      () => api.delete(`/projects/${projectKey}/members/${member.id}`),
      `Đã xóa ${member.name} khỏi dự án`,
      "Không thể xóa thành viên"
    );
    if (ok) loadMembers();
  };

  const handleAddEpic = async (values: {
    title: string;
    description?: string;
    color: string;
  }) => {
    const ok = await run(
      async () => {
        const res = await api.post(`/projects/${projectKey}/epics`, values);
        setEpics((prev) => [...prev, { ...res.data.data, tasks_count: 0 }]);
      },
      "Đã tạo Epic",
      "Không thể tạo Epic"
    );
    if (ok) epicForm.resetFields();
  };

  const handleDeleteEpic = (epic: Epic) =>
    run(
      async () => {
        await api.delete(`/projects/${projectKey}/epics/${epic.id}`);
        setEpics((prev) => prev.filter((e) => e.id !== epic.id));
      },
      `Đã xóa Epic "${epic.title}"`,
      "Không thể xóa Epic"
    );

  const handleAddLabel = async (values: { name: string; color: string }) => {
    if (!project) return;
    const ok = await run(
      async () => {
        const res = await api.post(
          `/workspaces/${project.workspace_id}/labels`,
          values
        );
        setLabels((prev) => [...prev, res.data.data]);
      },
      "Đã tạo Label",
      "Không thể tạo Label (cần quyền quản trị workspace)"
    );
    if (ok) labelForm.resetFields();
  };

  const handleDeleteLabel = (label: Label) =>
    project &&
    run(
      async () => {
        await api.delete(
          `/workspaces/${project.workspace_id}/labels/${label.id}`
        );
        setLabels((prev) => prev.filter((l) => l.id !== label.id));
      },
      `Đã xóa Label "${label.name}"`,
      "Không thể xóa Label"
    );

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <Empty description="Không tìm thấy dự án hoặc bạn không có quyền truy cập" />
    );
  }

  const memberColumns = [
    {
      title: "Thành viên",
      key: "name",
      render: (_: unknown, m: Member) => (
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            {m.name} {m.is_lead && <Tag color="gold">Trưởng dự án</Tag>}
          </div>
          <div className="text-xs text-zinc-500">{m.email}</div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      key: "role",
      width: 180,
      render: (_: unknown, m: Member) =>
        canManageMembers && !m.is_lead ? (
          <Select
            size="small"
            className="w-36"
            value={m.role_in_project}
            options={ROLE_OPTIONS}
            onChange={(role) => handleChangeRole(m, role)}
          />
        ) : (
          <Tag>{m.role_in_project}</Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 90,
      render: (_: unknown, m: Member) =>
        canManageMembers && !m.is_lead ? (
          <Popconfirm
            title={`Xóa ${m.name} khỏi dự án?`}
            onConfirm={() => handleRemoveMember(m)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
          <SettingOutlined className="text-indigo-500" />
          <span>Cấu hình Dự án — {pKey}</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Thông tin chung, quy trình, thành viên, Epic và Label của dự án
        </p>
      </div>

      <Card className="shadow-xs">
        <Tabs
          defaultActiveKey="general"
          items={[
            {
              key: "general",
              label: (
                <span>
                  <SettingOutlined /> Cài đặt chung
                </span>
              ),
              children: (
                <Form
                  form={generalForm}
                  layout="vertical"
                  onFinish={handleSaveGeneral}
                  className="space-y-3 pt-2"
                >
                  <Form.Item
                    label="Tên Dự án"
                    name="name"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên dự án" },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item label="Mã Khóa (Key)" name="key">
                    <Input size="large" disabled />
                  </Form.Item>
                  <Form.Item label="Mô tả dự án" name="description">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Form.Item label="Loại hình Dự án" name="type">
                    <Select
                      size="large"
                      disabled
                      options={[
                        { value: "scrum", label: "Scrum" },
                        { value: "kanban", label: "Kanban" },
                        { value: "freeform", label: "Freeform" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="Trạng thái" name="status">
                    <Select
                      size="large"
                      options={[
                        { value: "active", label: "Đang hoạt động" },
                        { value: "completed", label: "Đã hoàn thành" },
                        { value: "archived", label: "Lưu trữ" },
                      ]}
                    />
                  </Form.Item>
                  <div className="mt-6 flex justify-end">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      size="large"
                      className="bg-indigo-600"
                      loading={saving}
                    >
                      Lưu Thay Đổi
                    </Button>
                  </div>
                </Form>
              ),
            },
            {
              key: "workflow",
              label: (
                <span>
                  <BranchesOutlined /> Quy trình Workflow
                </span>
              ),
              children: (
                <div className="py-6 text-center space-y-3">
                  <p className="text-sm text-zinc-500 m-0">
                    Thêm, sửa, xóa trạng thái và quy tắc chuyển trạng thái của
                    Bảng Kanban.
                  </p>
                  <Button
                    type="primary"
                    icon={<BranchesOutlined />}
                    className="bg-indigo-600"
                    onClick={() => setIsWorkflowOpen(true)}
                  >
                    Mở trình quản lý Workflow
                  </Button>
                </div>
              ),
            },
            {
              key: "members",
              label: (
                <span>
                  <TeamOutlined /> Thành viên ({members.length})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  {canManageMembers && (
                    <Form
                      form={memberForm}
                      layout="inline"
                      onFinish={handleAddMember}
                      initialValues={{ role_in_project: "developer" }}
                      className="gap-2"
                    >
                      <Form.Item
                        name="user_id"
                        rules={[{ required: true, message: "Chọn người dùng" }]}
                        className="flex-1 min-w-56"
                      >
                        <Select
                          showSearch
                          placeholder={
                            candidates.length
                              ? "Chọn thành viên trong workspace"
                              : "Không còn ai trong workspace để thêm"
                          }
                          disabled={!candidates.length}
                          optionFilterProp="label"
                          options={candidates.map((c) => ({
                            value: c.id,
                            label: `${c.name} (${c.email})`,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item name="role_in_project">
                        <Select className="w-36" options={ROLE_OPTIONS} />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        className="bg-indigo-600"
                        loading={saving}
                        disabled={!candidates.length}
                      >
                        Thêm
                      </Button>
                    </Form>
                  )}
                  <Table
                    dataSource={members}
                    columns={memberColumns}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                </div>
              ),
            },
            {
              key: "epics",
              label: (
                <span>
                  <FlagOutlined /> Epic & Label
                </span>
              ),
              children: (
                <div className="space-y-8 pt-2">
                  <section className="space-y-3">
                    <h3 className="text-sm font-bold m-0">Epic của dự án</h3>
                    <Form
                      form={epicForm}
                      layout="inline"
                      onFinish={handleAddEpic}
                      initialValues={{ color: "#6366f1" }}
                      className="gap-2"
                    >
                      <Form.Item
                        name="title"
                        rules={[{ required: true, message: "Nhập tên Epic" }]}
                        className="flex-1 min-w-56"
                      >
                        <Input placeholder="Tên Epic, ví dụ: Thanh toán v2" />
                      </Form.Item>
                      <Form.Item name="color">
                        <Select className="w-32" options={COLOR_OPTIONS} />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        className="bg-indigo-600"
                        loading={saving}
                      >
                        Thêm Epic
                      </Button>
                    </Form>
                    <Table
                      dataSource={epics}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      locale={{ emptyText: "Chưa có Epic" }}
                      columns={[
                        {
                          title: "Epic",
                          key: "title",
                          render: (_: unknown, e: Epic) => (
                            <Tag color={e.color}>{e.title}</Tag>
                          ),
                        },
                        {
                          title: "Số task",
                          dataIndex: "tasks_count",
                          key: "tasks_count",
                          width: 100,
                        },
                        {
                          title: "",
                          key: "actions",
                          width: 60,
                          render: (_: unknown, e: Epic) => (
                            <Popconfirm
                              title={`Xóa Epic "${e.title}"? Các task sẽ bị gỡ khỏi Epic.`}
                              onConfirm={() => handleDeleteEpic(e)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                              />
                            </Popconfirm>
                          ),
                        },
                      ]}
                    />
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-bold m-0">
                      Label của workspace
                    </h3>
                    <Form
                      form={labelForm}
                      layout="inline"
                      onFinish={handleAddLabel}
                      initialValues={{ color: "#6366f1" }}
                      className="gap-2"
                    >
                      <Form.Item
                        name="name"
                        rules={[{ required: true, message: "Nhập tên Label" }]}
                        className="flex-1 min-w-56"
                      >
                        <Input placeholder="Tên Label, ví dụ: Backend" />
                      </Form.Item>
                      <Form.Item name="color">
                        <Select className="w-32" options={COLOR_OPTIONS} />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        className="bg-indigo-600"
                        loading={saving}
                      >
                        Thêm Label
                      </Button>
                    </Form>
                    <div className="flex flex-wrap gap-2">
                      {labels.length === 0 && (
                        <span className="text-xs text-zinc-400">
                          Chưa có Label
                        </span>
                      )}
                      {labels.map((l) => (
                        <Tag
                          key={l.id}
                          color={l.color}
                          closable
                          onClose={(e) => {
                            e.preventDefault();
                            handleDeleteLabel(l);
                          }}
                        >
                          {l.name}
                        </Tag>
                      ))}
                    </div>
                  </section>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <ProjectWorkflowModal
        open={isWorkflowOpen}
        projectKey={projectKey}
        onClose={() => setIsWorkflowOpen(false)}
      />
    </div>
  );
}
