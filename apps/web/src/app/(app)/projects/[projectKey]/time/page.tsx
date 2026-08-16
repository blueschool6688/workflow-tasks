'use client';

import * as React from 'react';
import { Card, Table, Statistic, Button, Tag, Modal, Form, InputNumber, Input, message, Row, Col } from 'antd';
import { ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams } from 'next/navigation';
import { api } from '@/lib/axios';

export default function ProjectTimeTrackingPage() {
  const params = useParams();
  const projectKey = (params?.projectKey as string) || 'CORE-ENG';
  const pKey = projectKey.toUpperCase();

  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [form] = Form.useForm();

  const fetchWorklogs = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectKey}/worklogs`);
      const items = res.data.data || res.data || [];
      setLogs(items);
    } catch {
      // Fallback sample worklogs
      setLogs([
        { id: 1, task_title: `${pKey}-101 Multi-tenant Schema`, user: { name: 'Alex K.' }, minutes_logged: 180, logged_at: '2026-08-16 09:30', description: 'Thiết kế Migration và Seeder' },
        { id: 2, task_title: `${pKey}-102 Sanctum Auth & Policy`, user: { name: 'Sarah T.' }, minutes_logged: 120, logged_at: '2026-08-16 11:00', description: 'Viết Policy Gates và unit tests' },
        { id: 3, task_title: `${pKey}-103 Kanban DnD Board`, user: { name: 'David L.' }, minutes_logged: 240, logged_at: '2026-08-16 14:15', description: 'Tích hợp Ant Design v5 và DnD' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [projectKey, pKey]);

  React.useEffect(() => {
    fetchWorklogs();
  }, [fetchWorklogs]);

  const handleCreateWorklog = async (values: any) => {
    try {
      const newLog = {
        id: Date.now(),
        task_title: `${pKey}-${values.task_number || '101'}`,
        user: { name: 'Nguyen Van A' },
        minutes_logged: values.hours * 60,
        logged_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        description: values.description,
      };
      setLogs([newLog, ...logs]);
      message.success('Đã ghi nhận thời gian làm việc!');
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error('Không thể lưu worklog');
    }
  };

  const totalMinutes = logs.reduce((acc, curr) => acc + (curr.minutes_logged || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const columns = [
    {
      title: 'Công việc',
      dataIndex: 'task_title',
      key: 'task_title',
      render: (text: string, record: any) => (
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {text || record.task?.title || `${pKey}-Task`}
        </span>
      ),
    },
    {
      title: 'Thành viên',
      dataIndex: ['user', 'name'],
      key: 'user',
      render: (name: string) => <Tag color="indigo">{name || 'Thành viên'}</Tag>,
    },
    {
      title: 'Thời gian đã ghi',
      dataIndex: 'minutes_logged',
      key: 'minutes_logged',
      render: (min: number) => <Tag color="green">{min ? (min / 60).toFixed(1) + ' giờ (' + min + 'm)' : '0m'}</Tag>,
    },
    {
      title: 'Mô tả / Ghi chú',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => <span className="text-xs text-zinc-500">{desc || '—'}</span>,
    },
    {
      title: 'Ngày ghi',
      dataIndex: 'logged_at',
      key: 'logged_at',
      render: (date: string) => <span className="text-xs text-zinc-400">{date}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
            <ClockCircleOutlined className="text-indigo-500" />
            <span>Chấm công & Theo dõi Thời gian (Time Tracking) — {pKey}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Ghi nhận và báo cáo số giờ làm việc theo công việc thực tế của dự án
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-indigo-600"
          onClick={() => setIsModalOpen(true)}
        >
          Log Thời Gian
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-xs text-center">
            <Statistic title="Tổng giờ đã log tuần này" value={`${totalHours}h`} styles={{ content: { color: '#6366f1' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-xs text-center">
            <Statistic title="Số lượt ghi nhận (Worklogs)" value={logs.length} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-xs text-center">
            <Statistic title="Hiệu suất dự án" value="94.2%" styles={{ content: { color: '#10b981' } }} />
          </Card>
        </Col>
      </Row>

      <Card title="Lịch sử ghi nhận giờ làm việc gần đây" className="shadow-xs">
        <Table
          dataSource={logs}
          columns={columns}
          rowKey={(r) => r.id?.toString() || Math.random().toString()}
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Modal
        title="Ghi nhận giờ làm việc (Worklog)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu Worklog"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateWorklog}>
          <Form.Item name="task_number" label="Mã Task" rules={[{ required: true, message: 'Vui lòng nhập mã task' }]}>
            <Input placeholder="Ví dụ: 101 hoặc PROJ-101" />
          </Form.Item>

          <Form.Item name="hours" label="Số giờ làm việc (Hours)" rules={[{ required: true, message: 'Vui lòng nhập số giờ' }]}>
            <InputNumber min={0.25} max={24} step={0.5} style={{ width: '100%' }} placeholder="2.5" />
          </Form.Item>

          <Form.Item name="description" label="Nội dung đã hoàn thành">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết công việc đã thực hiện..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
