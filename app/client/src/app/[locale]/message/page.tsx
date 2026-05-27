import Comments from "@/components/comments/comments";
import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MessageBoard");

  return createPageMetadata({
    title: t("title"),
    description: t("welcome"),
    pathname: "/message",
  });
}

/**
 * 留言板页面 / Message board page
 *
 * 渲染页面标题、欢迎文案和站点级评论组件。
 * Render the page title, welcome text, and site-level comments component
 */
export default async function MessagePage() {
  const t = await getTranslations("MessageBoard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">{t("title")}</h1>

        <p className="text-gray-400">{t("welcome")}</p>
      </div>

      <Comments source="site" />
    </div>
  );
}
