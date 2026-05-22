import Comments from "@/components/comments/comments";
import { MOCK_COMMENTS } from "@/data/mock-comments";
import { MOCK_POSTS, getPostContent } from "@/data/mock-posts";
import { getLocalizedName, SilvaConfig } from "@/lib/silva-config";
import { markdownToHtml } from "@/lib/markdown";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import Modules from "../posts.module.scss";
import PostDetailClient, { type TocItem } from "./post-detail-client";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function extractTocItems(htmlContent: string): TocItem[] {
  const tocItems: TocItem[] = [];
  const headingRegex = /<h([1-4])(?:\s[^>]*)?>(.*?)<\/h\1>/g;

  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = Number.parseInt(match[1] ?? "1", 10);
    const text = (match[2] ?? "").replace(/<[^>]*>/g, "").trim();
    const id = `heading-${index}`;

    tocItems.push({
      id,
      text,
      level,
    });

    index += 1;
  }

  return tocItems;
}

/**
 * 文章详情页面 / Post detail page
 *
 * 获取文章、编译 Markdown，并传递给客户端组件处理目录交互。
 * Fetches post, compiles Markdown, and passes it to the client component for TOC interactions.
 */
export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);

  const t = await getTranslations("PostDetail");
  const locale = await getLocale();

  const post = MOCK_POSTS.find((item) => item.id === postId);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <h1 className="mb-4 text-3xl font-bold">404 - {t("notFound")}</h1>

        <Link href="/posts" className="text-blue-500 hover:underline">
          ← {t("backToList")}
        </Link>
      </div>
    );
  }

  const content = getPostContent(post.storage_path);
  const htmlContent = await markdownToHtml(content);
  const tocItems = extractTocItems(htmlContent);

  const baseUrl =
    SilvaConfig.seo.canonical ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const fullUrl = new URL(`/posts/${post.id}`, baseUrl).toString();

  const siteOwnerName = getLocalizedName(SilvaConfig.site, locale);

  return (
    <>
      <PostDetailClient
        post={{
          ...post,
          htmlContent,
          fullUrl,
          tocItems,
        }}
        siteOwnerName={siteOwnerName}
        locale={locale}
        labels={{
          author: t("author"),
          link: t("link"),
          commercialLicense: t("commercialLicense"),
          licenseText: t("licenseText"),
          licenseName: t("licenseName"),
        }}
        modulesClassNames={{
          label: Modules.label,
        }}
      />

      <div className="mt-12">
        <Comments comments={MOCK_COMMENTS} postId={String(post.id)} />
      </div>
    </>
  );
}
