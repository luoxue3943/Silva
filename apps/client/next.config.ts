import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Next.js 运行配置 */
  reactCompiler: true,
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
