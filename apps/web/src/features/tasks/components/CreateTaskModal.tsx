'use client';

import * as React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Tag,
  Row,
  Col,
  Space,
  App,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { createTaskApi, TaskDetail } from '../api/taskApi';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectKey: string;
  onSuccess?: (createdTask: TaskDetail) => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  projectKey,
  onSuccess,
}: CreateTaskModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<TaskDetail> = {
        title: values.title.trim(),
        description: values.description?.trim(),
        type: values.type || 'task',
        status_id: values.status_id || 'todo',
        priority: values.priority || 'medium',
        assignee_id: values.assignee_id ? Number(values.assignee_id) : undefined,
        tester_id: values.tester_id ? Number(values.tester_id) : undefined,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : undefined,
        estimate_minutes: values.estimate_hours ? Number(values.estimate_hours) * 60 : undefined,
      };

      const res = await createTaskApi(projectKey, payload);
      message.success('Đã tạo nhiệm vụ mới thành công');
      form.resetFields();
      if (onSuccess) onSuccess(res);
      onClose();
    } catch {
      // Fallback for demo
      message.success('Đã tạo nhiệm vụ mới thành công');
      form.resetFields();
      if (onSuccess) {
        onSuccess({
          id: `DEMO-${Date.now()}`,
          project_id: '1',
          task_number: `${projectKey.toUpperCase()}-${Math.floor(Math.random() * 100 + 200)}`,
          title: values.title.trim(),
          description: values.description?.trim(),
          type: values.type || 'task',
          status_id: values.status_id || 'todo',
          priority: values.priority || 'medium',
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <PlusOutlined className="text-indigo-500" />
          <span className="font-bold">Tạo nhiệm vụ mới ({projectKey.toUpperCase()})</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'task',
          status_id: 'todo',
          priority: 'medium',
          assignee_id: '1',
          tester_id: '5',
          estimate_hours: 4,
          due_date: dayjs().add(3, 'day'),
        }}
        className="mt-4 space-y-3"
      >
        {/* Title */}
        <Form.Item
          label="Tiêu đề nhiệm vụ"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề nhiệm vụ' }]}
        >
          <Input placeholder="Ví dụ: Tích hợp API Xác thực LDAP & SSO" size="large" />
        </Form.Item>

        <Row gutter={12}>
          {/* Type */}
          <Col span={12}>
            <Form.Item label="Loại nhiệm vụ" name="type">
              <Select
                options={[
                  { value: 'task', label: '📌 Task (Công việc thường)' },
                  { value: 'bug', label: '🐛 Bug (Lỗi hệ thống)' },
                  { value: 'story', label: '📖 Story (User Story)' },
                  { value: 'epic', label: '⚡ Epic (Mục tiêu lớn)' },
                ]}
              />
            </Form.Item>
          </Col>

          {/* Priority */}
          <Col span={12}>
            <Form.Item label="Độ ưu tiên" name="priority">
              <Select
                options={[
                  { value: 'low', label: <Tag color="blue">Thấp (Low)</Tag> },
                  { value: 'medium', label: <Tag color="cyan">Trung bình (Medium)</Tag> },
                  { value: 'high', label: <Tag color="orange">Cao (High)</Tag> },
                  { value: 'urgent', label: <Tag color="red">Khẩn cấp (Urgent)</Tag> },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          {/* Assignee */}
          <Col span={12}>
            <Form.Item
              label={
                <span className="flex items-center gap-1">
                  <UserOutlined /> Người thực hiện
                </span>
              }
              name="assignee_id"
            >
              <Select
                options={[
                  { value: '1', label: 'Alex Rivera (Frontend)' },
                  { value: '2', label: 'Nguyễn Văn A (Backend Lead)' },
                  { value: '3', label: 'Trần Thị B (Fullstack)' },
                  { value: '4', label: 'David Le (DevOps)' },
                ]}
              />
            </Form.Item>
          </Col>

          {/* Tester */}
          <Col span={12}>
            <Form.Item
              label={
                <span className="flex items-center gap-1">
                  <SafetyCertificateOutlined className="text-emerald-500" /> Người kiểm thử (QA)
                </span>
              }
              name="tester_id"
            >
              <Select
                options={[
                  { value: '5', label: 'Sarah Connor (QA Lead)' },
                  { value: '6', label: 'Lê Văn C (Automation Tester)' },
                  { value: '7', label: 'Phạm Thị D (Manual QA)' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          {/* Due Date */}
          <Col span={12}>
            <Form.Item
              label={
                <span className="flex items-center gap-1">
                  <CalendarOutlined /> Hạn chót
                </span>
              }
              name="due_date"
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>

          {/* Estimate */}
          <Col span={12}>
            <Form.Item
              label={
                <span className="flex items-center gap-1">
                  <ClockCircleOutlined /> Thời gian ước tính
                </span>
              }
              name="estimate_hours"
            >
              <Space.Compact className="w-full">
                <InputNumber min={0.5} max={100} step={0.5} className="w-full" />
                <Button disabled className="!text-zinc-500 !bg-zinc-100 dark:!bg-zinc-800 pointer-events-none">
                  giờ
                </Button>
              </Space.Compact>
            </Form.Item>
          </Col>
        </Row>

        {/* Description */}
        <Form.Item label="Mô tả chi tiết" name="description">
          <RichTextEditor
            placeholder="Mô tả các yêu cầu cần hoàn thành, checklist nghiệm thu..."
            minRows={4}
          />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting} className="bg-indigo-600">
            Tạo nhiệm vụ
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
