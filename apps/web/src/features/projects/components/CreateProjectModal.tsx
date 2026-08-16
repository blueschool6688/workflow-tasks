'use client';

import * as React from 'react';
import { Modal, Form, Input, Radio, Button, App } from 'antd';
import { createProjectApi } from '../api/projectApi';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleValuesChange = (changedValues: any) => {
    if (changedValues.name) {
      const generatedKey = changedValues.name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 5);
      form.setFieldsValue({ key: generatedKey || 'PROJ' });
    }
  };

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await createProjectApi(values);
      message.success(`Dự án "${values.name}" đã được tạo thành công`);
      onSuccess();
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tạo dự án. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo dự án mới"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        initialValues={{ type: 'scrum' }}
        className="mt-4 space-y-3"
      >
        <Form.Item
          label="Tên dự án"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
        >
          <Input size="large" placeholder="Ví dụ: Core Product Engineering" />
        </Form.Item>

        <Form.Item
          label="Mã dự án (Project Key)"
          name="key"
          rules={[{ required: true, message: 'Vui lòng nhập mã dự án' }]}
        >
          <Input size="large" maxLength={8} className="uppercase font-mono" placeholder="CORE" />
        </Form.Item>

        <Form.Item label="Mô hình làm việc" name="type" rules={[{ required: true }]}>
          <Radio.Group buttonStyle="solid" size="large" className="w-full grid grid-cols-2 text-center">
            <Radio.Button value="scrum">Agile Scrum</Radio.Button>
            <Radio.Button value="kanban">Kanban Board</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Mô tả dự án" name="description">
          <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về mục tiêu dự án..." />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button onClick={onClose} size="large">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading} size="large" className="bg-indigo-600">
            Tạo dự án
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
