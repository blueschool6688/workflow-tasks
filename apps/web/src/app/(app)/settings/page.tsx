'use client';

import * as React from 'react';
import { Card, Tabs, Form, Input, Button, Avatar, Switch, Tag, message } from 'antd';
import { UserOutlined, LockOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleProfileSubmit = (values: any) => {
    updateUser(values);
    message.success('Cập nhật hồ sơ thành công');
  };

  const handlePasswordSubmit = () => {
    passwordForm.resetFields();
    message.success('Đổi mật khẩu thành công');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Cài đặt hệ thống</h1>
        <p className="text-sm text-zinc-500">Quản lý hồ sơ cá nhân, mật khẩu và cấu hình tài khoản</p>
      </div>

      <Card className="shadow-sm">
        <Tabs
          defaultActiveKey="profile"
          items={[
            {
              key: 'profile',
              label: (
                <span>
                  <UserOutlined /> Hồ sơ cá nhân
                </span>
              ),
              children: (
                <div className="py-4 space-y-6 max-w-lg">
                  <div className="flex items-center gap-4">
                    <Avatar size={64} className="bg-indigo-600 font-bold text-xl">
                      {user?.name ? user.name.substring(0, 1).toUpperCase() : 'U'}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-base m-0 text-zinc-900 dark:text-zinc-100">
                        {user?.name}
                      </h3>
                      <p className="text-xs text-zinc-500 m-0">{user?.email}</p>
                      <Tag color="indigo" className="mt-1">
                        {user?.role?.toUpperCase() || 'MEMBER'}
                      </Tag>
                    </div>
                  </div>

                  <Form
                    form={profileForm}
                    layout="vertical"
                    initialValues={{
                      name: user?.name,
                      username: user?.username,
                      email: user?.email,
                    }}
                    onFinish={handleProfileSubmit}
                  >
                    <Form.Item label="Họ và tên" name="name" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                    <Form.Item label="Tên đăng nhập" name="username">
                      <Input size="large" disabled />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                      <Input size="large" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" className="bg-indigo-600">
                        Lưu thay đổi
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ),
            },
            {
              key: 'password',
              label: (
                <span>
                  <LockOutlined /> Đổi mật khẩu
                </span>
              ),
              children: (
                <div className="py-4 max-w-lg">
                  <Form form={passwordForm} layout="vertical" onFinish={handlePasswordSubmit}>
                    <Form.Item
                      label="Mật khẩu hiện tại"
                      name="current_password"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                      <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item
                      label="Mật khẩu mới"
                      name="new_password"
                      rules={[{ required: true, min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' }]}
                    >
                      <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item
                      label="Xác nhận mật khẩu mới"
                      name="confirm_password"
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('new_password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" className="bg-indigo-600">
                        Cập nhật mật khẩu
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ),
            },
            {
              key: 'notifications',
              label: (
                <span>
                  <BellOutlined /> Thông báo
                </span>
              ),
              children: (
                <div className="py-4 space-y-4 max-w-lg">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <h4 className="font-semibold text-sm m-0">Thông báo Email khi được giao task</h4>
                      <p className="text-xs text-zinc-500 m-0">Nhận email ngay khi bạn được gán công việc mới</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <h4 className="font-semibold text-sm m-0">Thông báo bình luận mới</h4>
                      <p className="text-xs text-zinc-500 m-0">Nhận thông báo khi ai đó bình luận vào task của bạn</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
