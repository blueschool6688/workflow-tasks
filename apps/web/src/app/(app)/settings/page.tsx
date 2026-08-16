'use client';

import * as React from 'react';
import { Card, Tabs, Form, Input, Button, Avatar, Switch, Tag, App, Alert } from 'antd';
import { UserOutlined, LockOutlined, BellOutlined, CheckOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { updateProfileApi, changePasswordApi } from '@/features/auth/api/authApi';

interface ProfileFormValues {
  name: string;
  username: string;
  email: string;
}

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function SettingsPage() {
  const { message } = App.useApp();
  const { user, updateUser } = useAuthStore();
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();

  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  const [isSavingPassword, setIsSavingPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  // Sync user state with form initial values
  React.useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user, profileForm]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    setIsSavingProfile(true);
    setProfileError(null);

    try {
      const res = await updateProfileApi({
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
      });

      updateUser({
        name: res.user.name,
        username: res.user.username,
        email: res.user.email,
        avatar_url: res.user.avatar || undefined,
        role: res.user.role,
        current_workspace_id: res.user.current_workspace_id,
      });

      message.success(res.message || 'Cập nhật hồ sơ thành công');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const errorText =
        apiErr?.response?.data?.message ||
        apiErr?.response?.data?.errors?.username?.[0] ||
        apiErr?.response?.data?.errors?.email?.[0] ||
        'Không thể cập nhật hồ sơ. Vui lòng thử lại.';
      setProfileError(errorText);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    setIsSavingPassword(true);
    setPasswordError(null);

    try {
      const res = await changePasswordApi({
        current_password: values.current_password,
        password: values.new_password,
        password_confirmation: values.confirm_password,
      });

      passwordForm.resetFields();
      message.success(res.message || 'Đổi mật khẩu thành công');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const errorText =
        apiErr?.response?.data?.errors?.current_password?.[0] ||
        apiErr?.response?.data?.errors?.password?.[0] ||
        apiErr?.response?.data?.message ||
        'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại thông tin.';
      message.error(errorText);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 m-0">Cài đặt hệ thống</h1>
        <p className="text-sm text-zinc-500 mt-1">Quản lý hồ sơ cá nhân, mật khẩu và cấu hình tài khoản</p>
      </div>

      <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
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
                        {user?.name || 'Tài khoản'}
                      </h3>
                      <p className="text-xs text-zinc-500 m-0">{user?.email}</p>
                      <Tag color="indigo" className="mt-1">
                        {user?.role?.toUpperCase() || 'MEMBER'}
                      </Tag>
                    </div>
                  </div>

                  {profileError && (
                    <Alert
                      type="error"
                      message={profileError}
                      showIcon
                      closable
                      onClose={() => setProfileError(null)}
                      className="rounded-lg text-xs"
                    />
                  )}

                  <Form<ProfileFormValues>
                    form={profileForm}
                    layout="vertical"
                    initialValues={{
                      name: user?.name || '',
                      username: user?.username || '',
                      email: user?.email || '',
                    }}
                    onFinish={handleProfileSubmit}
                    requiredMark={false}
                  >
                    <Form.Item
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          Họ và tên
                        </span>
                      }
                      name="name"
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                    >
                      <Input size="large" placeholder="Nhập họ và tên..." className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          Tên đăng nhập
                        </span>
                      }
                      name="username"
                      rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                    >
                      <Input size="large" placeholder="Nhập username..." className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          Email
                        </span>
                      }
                      name="email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Địa chỉ email không hợp lệ' },
                      ]}
                    >
                      <Input size="large" readOnly placeholder="name@company.com" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item className="mb-0">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={isSavingProfile}
                        icon={<SaveOutlined />}
                        className="bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold"
                      >
                        {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
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
                <div className="py-4 max-w-lg space-y-4">
                  {passwordError && (
                    <Alert
                      type="error"
                      message={passwordError}
                      showIcon
                      closable
                      onClose={() => setPasswordError(null)}
                      className="rounded-lg text-xs"
                    />
                  )}

                  <Form<PasswordFormValues>
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordSubmit}
                    requiredMark={false}
                  >
                    <Form.Item
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          Mật khẩu hiện tại
                        </span>
                      }
                      name="current_password"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                      <Input.Password size="large" placeholder="••••••••" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          Mật khẩu mới
                        </span>
                      }
                      name="new_password"
                      rules={[{ required: true, min: 8, message: 'Mật khẩu mới tối thiểu 8 ký tự' }]}
                    >
                      <Input.Password size="large" placeholder="••••••••" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          Xác nhận mật khẩu mới
                        </span>
                      }
                      name="confirm_password"
                      dependencies={['new_password']}
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
                      <Input.Password size="large" placeholder="••••••••" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item className="mb-0">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={isSavingPassword}
                        icon={<CheckOutlined />}
                        className="bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold"
                      >
                        {isSavingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
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
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <h4 className="font-semibold text-sm m-0">Thông báo trạng thái Task thay đổi</h4>
                      <p className="text-xs text-zinc-500 m-0">Nhận âm thanh & toast realtime khi task liên quan chuyển status</p>
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
