import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en-US", "zh-CN"],
  defaultLocale: "zh-CN",
  localePrefix: "never",
});
