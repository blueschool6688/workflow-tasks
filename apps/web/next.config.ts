import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tasks/ui', '@tasks/api-types'],
  reactStrictMode: true,
};

export default nextConfig;
