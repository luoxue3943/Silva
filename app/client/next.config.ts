import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* Next.js 运行时配置 / Next.js runtime configuration */
  reactCompiler: true,
  experimental: {
    viewTransition: true,
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
