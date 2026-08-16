'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Alert, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { loginApi } from '../api/authApi';

interface LoginFormValues {
  username: string;
  password?: string;
  remember?: boolean;
}

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form] = Form.useForm<LoginFormValues>();

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleFinish = async (values: LoginFormValues) => {
    const { username, password } = values;
    if (!username?.trim() || !password?.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginApi({ username: username.trim(), password: password.trim() });
      setAuth(
        {
          id: res.user.id,
          name: res.user.name,
          username: res.user.username,
          email: res.user.email,
          avatar_url: res.user.avatar || undefined,
          role: res.user.role,
          current_workspace_id: res.user.current_workspace_id,
        },
        res.token,
        res.workspaces
      );
      router.push('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string; errors?: { username?: string[] } } } };
      const msg =
        apiErr?.response?.data?.message ||
        apiErr?.response?.data?.errors?.username?.[0] ||
        'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {errorMsg && (
        <div className="mb-4">
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg(null)}
            className="rounded-lg text-xs"
          />
        </div>
      )}

      <Form<LoginFormValues>
        form={form}
        name="loginForm"
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ remember: true }}
        requiredMark={false}
        autoComplete="off"
        className="space-y-4"
      >
        <Form.Item
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Email / Username
            </span>
          }
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập email hoặc username' }]}
          className="mb-3"
        >
          <Input
            prefix={<UserOutlined className="text-zinc-400 mr-1" />}
            placeholder="name@company.com hoặc username"
            size="large"
            disabled={isLoading}
            className="rounded-lg bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-sm"
          />
        </Form.Item>

        <Form.Item
          label={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Mật khẩu
              </span>
            </div>
          }
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          className="mb-3"
        >
          <Input.Password
            prefix={<LockOutlined className="text-zinc-400 mr-1" />}
            placeholder="••••••••"
            size="large"
            disabled={isLoading}
            className="rounded-lg bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-sm"
          />
        </Form.Item>
        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
            block
            icon={!isLoading ? <LoginOutlined /> : undefined}
            className="h-11 rounded-lg font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 border-none shadow-sm transition-all"
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
