'use client';

import * as React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme, App } from 'antd';
import { useTheme } from 'next-themes';
import viVN from 'antd/locale/vi_VN';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <AntdRegistry>
      <ConfigProvider
        locale={viVN}
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#6366f1',
            borderRadius: 8,
            fontFamily: 'inherit',
          },
          components: {
            Layout: {
              bodyBg: isDark ? '#09090b' : '#fafafa',
              headerBg: isDark ? '#09090b' : '#ffffff',
              siderBg: isDark ? '#09090b' : '#ffffff',
            },
            Card: {
              colorBgContainer: isDark ? '#141417' : '#ffffff',
            },
            Table: {
              colorBgContainer: isDark ? '#141417' : '#ffffff',
            },
          },
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
