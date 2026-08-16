import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tasks/ui', '@tasks/api-types', 'recharts', 'es-toolkit'],
  reactStrictMode: true,
};

export default nextConfig;
