import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@typingtyphon/contracts'],
  reactStrictMode: true,
};

export default nextConfig;
