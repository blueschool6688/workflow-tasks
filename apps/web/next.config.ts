import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tasks/ui', '@tasks/api-types', 'recharts', 'es-toolkit', 'antd', '@ant-design/icons', '@ant-design/icons-svg'],
  reactStrictMode: true,
};

export default nextConfig;
