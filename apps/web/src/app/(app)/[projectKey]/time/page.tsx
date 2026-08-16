'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Card, Table, Button, Modal, Form, Input, InputNumber, DatePicker, Statistic, Row, Col, Tag, App } from 'antd';
import { ClockCircleOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface WorkLogItem {
  id: string;
  task_number: string;
  task_title: string;
  user_name: string;
  minutes: number;
  description: string;
  logged_at: string;
}

export default function TimeTrackingPage() {
  const { message } = App.useApp();
  const params = useParams();
  const projectKey = (params?.projectKey as string)?.toUpperCase() || 'CORE-ENG';
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [form] = Form.useForm();

  const [logs, setLogs] = React.useState<WorkLogItem[]>([
    {
      id: '1',
      task_number: `${projectKey}-101`,
      task_title: 'Khởi tạo cấu trúc Turborepo Monorepo',
      user_name: 'Nguyen Van A',
      minutes: 240,
      description: 'Cấu hình workspace packages và dependencies',
      logged_at: '2026-08-16 09:30',
    },
    {
      id: '2',
      task_number: `${projectKey}-102`,
      task_title: 'Thiết kế REST API V1 Laravel Sanctum',
      user_name: 'Nguyen Van A',
      minutes: 180,
      description: 'Viết AuthController và token management',
      logged_at: '2026-08-16 14:00',
    },
    {
      id: '3',
      task_number: `${projectKey}-103`,
      task_title: 'Xây dựng giao diện Kanban Board với DnD',
      user_name: 'Tran Thi B',
      minutes: 300,
      description: 'Tích hợp Antd Card và drag and drop handlers',
      logged_at: '2026-08-15 16:45',
    },
  ]);

  const totalMinutes = logs.reduce((acc, curr) => acc + curr.minutes, 0);

  const handleAddLog = (values: any) => {
    const newLog: WorkLogItem = {
      id: Date.now().toString(),
      task_number: values.task_number,
      task_title: values.task_title || 'Work Log Entry',
      user_name: 'System Admin',
      minutes: values.minutes,
      description: values.description,
      logged_at: dayjs(values.logged_at).format('YYYY-MM-DD HH:mm'),
    };

    setLogs([newLog, ...logs]);
    setIsModalOpen(false);
    form.resetFields();
    message.success('Đã ghi nhận thời gian làm việc');
  };

  const columns = [
    {
      title: 'Mã công việc',
      dataIndex: 'task_number',
      key: 'task_number',
      render: (text: string) => <Tag color="indigo">{text}</Tag>,
    },
    {
      title: 'Tên công việc',
      dataIndex: 'task_title',
      key: 'task_title',
      render: (text: string) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{text}</span>,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text: string) => (
        <span>
          <UserOutlined className="mr-1 text-indigo-500" /> {text}
        </span>
      ),
    },
    {
      title: 'Thời gian log',
      dataIndex: 'minutes',
      key: 'minutes',
      render: (min: number) => (
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          {(min / 60).toFixed(1)}h ({min} phút)
        </span>
      ),
    },
    {
      title: 'Mô tả công việc',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ngày ghi nhận',
      dataIndex: 'logged_at',
      key: 'logged_at',
      render: (date: string) => <span className="text-xs text-zinc-400">{date}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Time Tracking — {projectKey}</h1>
          <p className="text-sm text-zinc-500">Quản lý và thống kê thời gian làm việc thực tế trên dự án</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-indigo-600"
          onClick={() => setIsModalOpen(true)}
        >
          Ghi nhận thời gian (Log Work)
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số giờ đã log"
              value={(totalMinutes / 60).toFixed(1)}
              suffix="giờ"
              prefix={<ClockCircleOutlined className="text-indigo-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số lượt log"
              value={logs.length}
              suffix="lượt"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Trung bình / Log"
              value={(totalMinutes / logs.length / 60).toFixed(1)}
              suffix="giờ"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Lịch sử Time Work Log" className="shadow-sm">
        <Table dataSource={logs} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="Ghi nhận thời gian làm việc (Log Work)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddLog} className="mt-4">
          <Form.Item label="Mã task (ví dụ: CORE-101)" name="task_number" rules={[{ required: true }]}>
            <Input placeholder={`${projectKey}-101`} />
          </Form.Item>
          <Form.Item label="Tên công việc" name="task_title">
            <Input placeholder="Nhập tên task..." />
          </Form.Item>
          <Form.Item label="Số phút làm việc" name="minutes" rules={[{ required: true }]}>
            <InputNumber min={1} max={1440} className="w-full" placeholder="120" />
          </Form.Item>
          <Form.Item label="Thời gian thực hiện" name="logged_at" initialValue={dayjs()}>
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item label="Ghi chú / Nội dung công việc" name="description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Mô tả công việc đã hoàn thành..." />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-indigo-600">
              Lưu Work Log
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
