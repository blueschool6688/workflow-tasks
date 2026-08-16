'use client';

import * as React from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  message,
  Divider,
  Tabs,
  Table,
  Tag,
  Modal,
  Popconfirm,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  BranchesOutlined,
  PlusOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useParams } from 'next/navigation';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectKey = (params?.projectKey as string) || 'CORE-ENG';
  const pKey = projectKey.toUpperCase();

  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  // Workflow Statuses
  const [statuses, setStatuses] = React.useState([
    { id: '1', name: 'Cần làm (To Do)', category: 'todo', color: '#94a3b8', isDefault: true },
    { id: '2', name: 'Đang thực hiện (In Progress)', category: 'in_progress', color: '#6366f1', isDefault: true },
    { id: '3', name: 'Đang kiểm thử (QA Review)', category: 'in_progress', color: '#f59e0b', isDefault: false },
    { id: '4', name: 'Hoàn thành (Done)', category: 'done', color: '#10b981', isDefault: true },
  ]);
  const [isAddStatusModalOpen, setIsAddStatusModalOpen] = React.useState(false);

  const handleSaveGeneral = (values: any) => {
    message.success('Đã lưu cấu hình dự án thành công!');
  };

  const handleAddStatus = (values: any) => {
    const newStatus = {
      id: `st-${Date.now()}`,
      name: values.name.trim(),
      category: values.category,
      color: values.color || '#6366f1',
      isDefault: false,
    };
    setStatuses((prev) => [...prev, newStatus]);
    message.success(`Đã thêm trạng thái "${newStatus.name}" vào quy trình workflow!`);
    statusForm.resetFields();
    setIsAddStatusModalOpen(false);
  };

  const handleDeleteStatus = (id: string) => {
    setStatuses((prev) => prev.filter((s) => s.id !== id));
    message.success('Đã xóa trạng thái khỏi quy trình');
  };

  const statusColumns = [
    {
      title: 'Tên trạng thái',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <Tag color={record.color} className="font-semibold">
            {text}
          </Tag>
          {record.isDefault && <span className="text-[10px] text-zinc-400 font-mono">(Mặc định)</span>}
        </div>
      ),
    },
    {
      title: 'Phân loại (Category)',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => {
        let label = 'Cần làm';
        let color = 'default';
        if (cat === 'in_progress') {
          label = 'Đang xử lý';
          color = 'processing';
        } else if (cat === 'done') {
          label = 'Hoàn tất';
          color = 'success';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) =>
        record.isDefault ? (
          <span className="text-xs text-zinc-400">Cố định</span>
        ) : (
          <Popconfirm
            title="Xóa trạng thái này?"
            description="Các task thuộc trạng thái này sẽ chuyển về To Do."
            onConfirm={() => handleDeleteStatus(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        ),
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
          Quản lý thông tin chung, quy trình trạng thái (Workflow Statuses) và phân quyền
        </p>
      </div>

      <Card className="shadow-xs">
        <Tabs
          defaultActiveKey="general"
          items={[
            {
              key: 'general',
              label: (
                <span>
                  <SettingOutlined /> Cài đặt chung
                </span>
              ),
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    name: 'Core Product Engineering',
                    key: pKey,
                    description: 'Nền tảng quản lý công việc và quy trình doanh nghiệp tập trung.',
                    type: 'scrum',
                    visibility: 'public',
                    notifications: true,
                  }}
                  onFinish={handleSaveGeneral}
                  className="space-y-3 pt-2"
                >
                  <Form.Item
                    label="Tên Dự án"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
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
                    <Select size="large">
                      <Select.Option value="scrum">Scrum (Sprints, Epics, Story Points)</Select.Option>
                      <Select.Option value="kanban">Kanban (Continuous Flow, WIP Limits)</Select.Option>
                      <Select.Option value="waterfall">Waterfall (Gantt, Milestones)</Select.Option>
                    </Select>
                  </Form.Item>

                  <Divider />

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                        Gửi thông báo Telegram / Slack / Reverb
                      </div>
                      <div className="text-xs text-zinc-500">
                        Tự động báo tin khi có task mới được tạo, gán hoặc đổi trạng thái
                      </div>
                    </div>
                    <Form.Item name="notifications" valuePropName="checked" noStyle>
                      <Switch defaultChecked />
                    </Form.Item>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      size="large"
                      className="bg-indigo-600"
                    >
                      Lưu Thay Đổi
                    </Button>
                  </div>
                </Form>
              ),
            },
            {
              key: 'workflow',
              label: (
                <span>
                  <BranchesOutlined /> Quy trình & Trạng thái Workflow
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 m-0">
                        Danh sách trạng thái công việc (Workflow Statuses)
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5 m-0">
                        Chủ sở hữu hoặc Project Lead có thể thêm các cột trạng thái tùy biến cho Bảng Kanban & Quy trình
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      className="bg-indigo-600"
                      onClick={() => setIsAddStatusModalOpen(true)}
                    >
                      Thêm trạng thái mới
                    </Button>
                  </div>

                  <Table dataSource={statuses} columns={statusColumns} pagination={false} size="middle" />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Add Status Modal */}
      <Modal
        title="Thêm trạng thái Workflow mới"
        open={isAddStatusModalOpen}
        onCancel={() => setIsAddStatusModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleAddStatus}
          initialValues={{ category: 'in_progress', color: '#f59e0b' }}
          className="mt-4 space-y-3"
        >
          <Form.Item
            label="Tên trạng thái"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên trạng thái' }]}
          >
            <Input placeholder="Ví dụ: Đang kiểm thử QA, Đã đóng gói (Release)..." />
          </Form.Item>

          <Form.Item label="Phân loại trạng thái" name="category">
            <Select
              options={[
                { value: 'todo', label: 'Cần làm (To Do)' },
                { value: 'in_progress', label: 'Đang xử lý (In Progress)' },
                { value: 'done', label: 'Hoàn tất (Done)' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Màu sắc hiển thị" name="color">
            <Select
              options={[
                { value: '#6366f1', label: 'Indigo (Chàm)' },
                { value: '#f59e0b', label: 'Amber (Vàng hổ phách)' },
                { value: '#10b981', label: 'Emerald (Xanh lục)' },
                { value: '#ef4444', label: 'Red (Đỏ)' },
                { value: '#8b5cf6', label: 'Purple (Tím)' },
                { value: '#06b6d4', label: 'Cyan (Xanh ngọc)' },
              ]}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button onClick={() => setIsAddStatusModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-indigo-600">
              Lưu trạng thái
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
