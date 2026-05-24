import TimelineClient from "./timeline-client";

// 强制动态渲染以保持时间进度和分页数据实时 / Force dynamic rendering to keep time progress and paginated data current
export const dynamic = "force-dynamic";

/**
 * 时间线页面 / Timeline page
 *
 * 将文章时间线交给客户端组件处理分页和滚动加载。
 * Delegate the post timeline to the client component for pagination and infinite loading
 */
export default function TimelinePage() {
  return <TimelineClient />;
}
