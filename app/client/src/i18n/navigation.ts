import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * 本地化导航工具 / Localized navigation helpers
 *
 * 基于统一路由配置导出 Link、redirect、router 等工具。
 * Export Link, redirect, router, and pathname helpers from the shared routing config
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
