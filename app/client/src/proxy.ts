import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next.js 代理中间件 / Next.js proxy middleware
 *
 * 将页面请求交给 next-intl 处理本地化上下文。
 * Delegates page requests to next-intl for locale context handling.
 */
export default createMiddleware(routing);

export const config = {
  // 排除 API、内部资源和静态文件路径 / Excludes API, internal assets, and static files.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
