'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Card, Form, Input, Select, Button, Switch, Tag, message } from 'antd';
import { SettingOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectKey = (params?.projectKey as string)?.toUpperCase() || 'CORE-ENG';
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    message.success(`Đã cập nhật cấu hình dự án ${projectKey}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Cài đặt dự án — {projectKey}
        </h1>
        <p className="text-sm text-zinc-500">Quản lý thông tin chung, quy trình workflow và phân quyền thành viên dự án</p>
      </div>

      <Card className="shadow-sm">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: `Core Product Engineering (${projectKey})`,
            key: projectKey,
            type: 'scrum',
            description: 'Dự án phát triển nền tảng quản lý công việc doanh nghiệp.',
            is_active: true,
          }}
          onFinish={handleSave}
          className="space-y-4"
        >
          <Form.Item label="Tên dự án" name="name" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>

          <Form.Item label="Mã dự án (Project Key)" name="key">
            <Input size="large" disabled prefix={<Tag color="indigo">{projectKey}</Tag>} />
          </Form.Item>

          <Form.Item label="Loại dự án" name="type" rules={[{ required: true }]}>
            <Select size="large">
              <Select.Option value="scrum">Agile Scrum (Sprint & Backlog)</Select.Option>
              <Select.Option value="kanban">Kanban (Continuous Flow)</Select.Option>
              <Select.Option value="waterfall">Waterfall (Phase Driven)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Mô tả dự án" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <div className="flex items-center justify-between py-3 border-t border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h4 className="font-semibold text-sm m-0">Trạng thái dự án</h4>
              <p className="text-xs text-zinc-500 m-0">Kích hoạt hoặc tạm lưu trữ dự án này</p>
            </div>
            <Form.Item name="is_active" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>

          <Form.Item className="pt-2">
            <Button type="primary" htmlType="submit" size="large" className="bg-indigo-600">
              Lưu thay đổi cấu hình
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
