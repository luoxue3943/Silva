import { defineRouting } from "next-intl/routing";

/**
 * next-intl 路由配置 / next-intl routing configuration
 *
 * 使用无前缀路由，并在请求阶段回退到简体中文。 / Use unprefixed routes and fall back to Simplified Chinese at request time
 */
export const routing = defineRouting({
  locales: ["en-US", "zh-CN"],
  defaultLocale: "zh-CN",
  localePrefix: "never",
});
