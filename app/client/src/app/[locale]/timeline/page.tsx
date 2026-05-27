import TimelineClient from "./timeline-client";
import { createPageMetadata } from "@/lib/seo";
import { SilvaConfig } from "@/lib/silva-config";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// 强制动态渲染以保持时间进度和分页数据实时 / Force dynamic rendering to keep time progress and paginated data current
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Timeline");

  return createPageMetadata({
    title: t("title"),
    description: t("motto") || SilvaConfig.seo.description,
    pathname: "/timeline",
  });
}

/**
 * 时间线页面 / Timeline page
 *
 * 将文章时间线交给客户端组件处理分页和滚动加载。
 * Delegate the post timeline to the client component for pagination and infinite loading
 */
export default function TimelinePage() {
  return <TimelineClient />;
}
