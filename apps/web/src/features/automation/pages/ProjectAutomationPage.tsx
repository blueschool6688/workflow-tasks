'use client';

import * as React from 'react';
import { Card, Switch, Tag, Button, App } from 'antd';
import { ThunderboltOutlined, PlusOutlined } from '@ant-design/icons';

export function ProjectAutomationPage({ projectKey }: { projectKey: string }) {
  const { message } = App.useApp();
  const pKey = projectKey.toUpperCase();

  const [rules, setRules] = React.useState([
    {
      id: 1,
      name: 'Tự động gán người kiểm thử khi Task chuyển sang Review',
      trigger: 'Khi trạng thái đổi thành In Review',
      action: 'Gán Assignee = Le Van C & Thêm label "Review-Needed"',
      active: true,
    },
    {
      id: 2,
      name: 'Cảnh báo khi Task cận hạn 24h',
      trigger: 'Khi hạn chót còn dưới 24 giờ',
      action: 'Gửi thông báo Slack/Email & đổi Priority = Urgent',
      active: true,
    },
    {
      id: 3,
      name: 'Tự động tạo Checklist kiểm thử khi tạo Story',
      trigger: 'Khi tạo Task dạng Story',
      action: 'Thêm 4 mục Checklist mặc định',
      active: false,
    },
  ]);

  const toggleRule = (id: number, checked: boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: checked } : r))
    );
    message.success(checked ? 'Đã bật quy tắc tự động hóa' : 'Đã tắt quy tắc tự động hóa');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
            <ThunderboltOutlined className="text-indigo-500" />
            <span>Tự động hóa Quy trình (Automation) — {pKey}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Thiết lập các quy tắc Trigger → Condition → Action tự động cho dự án
          </p>
        </div>

        <Button type="primary" icon={<PlusOutlined />} size="large" className="bg-indigo-600">
          Tạo quy tắc mới
        </Button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id} className="shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold m-0 text-zinc-900 dark:text-zinc-100">
                    {rule.name}
                  </h3>
                  <Tag color={rule.active ? 'green' : 'default'}>
                    {rule.active ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                  </Tag>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Tag color="blue">KHI: {rule.trigger}</Tag>
                  <span>→</span>
                  <Tag color="indigo">THÌ: {rule.action}</Tag>
                </div>
              </div>

              <Switch
                checked={rule.active}
                onChange={(checked) => toggleRule(rule.id, checked)}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
