import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 配置 outputFileTracingRoot 解决多 lockfile 警告
  output: 'standalone',
};

export default nextConfig;
