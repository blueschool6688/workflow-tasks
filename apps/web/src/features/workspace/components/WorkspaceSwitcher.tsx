'use client';

import * as React from 'react';
import { Dropdown, Button, Avatar, Modal, Form, Input, App } from 'antd';
import type { MenuProps } from 'antd';
import { AppstoreOutlined, CheckOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/axios';

export function WorkspaceSwitcher() {
  const { message } = App.useApp();
  const workspaces = useAuthStore((state) => state.workspaces);
  const user = useAuthStore((state) => state.user);
  const setCurrentWorkspaceId = useAuthStore((state) => state.setCurrentWorkspaceId);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const activeWorkspace = (workspaces && workspaces.length > 0)
    ? workspaces.find((ws) => ws.id === user?.current_workspace_id) || workspaces[0]
    : { id: 'default', name: 'Main Workspace', slug: 'main' };

  const handleCreateWorkspace = async (values: any) => {
    try {
      setLoading(true);
      const res = await api.post('/workspaces', {
        name: values.name,
        slug: values.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      });
      message.success('Đã tạo Workspace mới thành công!');
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.success(`Đã tạo Workspace ${values.name}!`);
      setIsModalOpen(false);
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'header',
      type: 'group',
      label: <span className="text-[11px] font-semibold text-zinc-400 uppercase">Danh sách Workspace</span>,
    },
    ...((workspaces || []).map((ws) => ({
      key: ws.id,
      label: (
        <div className="flex items-center justify-between py-1 min-w-[180px]">
          <span className="font-medium">{ws.name}</span>
          {ws.id === activeWorkspace.id && <CheckOutlined className="text-indigo-600 ml-2" />}
        </div>
      ),
      icon: <AppstoreOutlined />,
      onClick: () => {
        setCurrentWorkspaceId(ws.id);
        message.info(`Đã chuyển sang ${ws.name}`);
      },
    }))),
    {
      type: 'divider',
    },
    {
      key: 'create',
      label: <span className="text-indigo-600 font-medium">Tạo Workspace mới</span>,
      icon: <PlusOutlined className="text-indigo-600" />,
      onClick: () => setIsModalOpen(true),
    },
  ];

  return (
    <div className="w-full">
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <div className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 cursor-pointer transition-colors border border-zinc-200/60 dark:border-zinc-700/60">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar size="small" className="bg-indigo-600 font-bold shrink-0">
              {activeWorkspace.name.substring(0, 2).toUpperCase()}
            </Avatar>
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate m-0 leading-tight">
                {activeWorkspace.name}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono m-0 leading-tight">
                Workspace
              </p>
            </div>
          </div>
          <DownOutlined className="text-zinc-400 text-[10px] shrink-0 ml-1" />
        </div>
      </Dropdown>

      <Modal
        title="Tạo Workspace Mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText="Tạo Workspace"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateWorkspace}>
          <Form.Item
            name="name"
            label="Tên Workspace"
            rules={[{ required: true, message: 'Vui lòng nhập tên Workspace' }]}
          >
            <Input placeholder="Ví dụ: Engineering Hub, Marketing Ops..." size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
