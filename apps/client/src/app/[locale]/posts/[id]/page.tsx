import Comments from "@/components/comments/comments";
import { readArticleMarkdown } from "@/lib/articles";
import {
  extractMarkdownSummary,
  getAbsoluteImageUrl,
  getCanonicalUrl,
  getSeoKeywords,
} from "@/lib/seo";
import { getLocalizedName, SilvaConfig } from "@/lib/silva-config";
import { markdownToHtml } from "@/lib/markdown";
import { getPostById } from "@/services/posts";
import type { Post } from "@/types/post";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { cache } from "react";
import Modules from "../posts.module.scss";
import PostDetailClient, { type TocItem } from "./post-detail-client";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const getCachedPostById = cache(async (id: number) => {
  return getPostById(id).send(true);
});

const readCachedArticleMarkdown = cache(async (postId: number) => {
  return readArticleMarkdown(postId);
});

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
 * 获取文章内容、编译 Markdown，并交给客户端组件处理目录交互。 / Fetch post content, compile Markdown, and delegate TOC interactions to the client component
 */
async function getPostDescription(post: Post) {
  const summary = post.summary?.trim();

  if (summary) {
    return summary;
  }

  const content = await readCachedArticleMarkdown(post.id);

  return extractMarkdownSummary(content);
}

function toIsoDate(timestamp: number | null | undefined) {
  if (timestamp == null) {
    return undefined;
  }

  return new Date(timestamp).toISOString();
}

function parsePostId(id: string) {
  const postId = Number(id);

  if (!Number.isSafeInteger(postId) || postId <= 0) {
    notFound();
  }

  return postId;
}

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const postId = parsePostId(id);

  const post = await getCachedPostById(postId);

  if (!post) {
    notFound();
  }

  const description = await getPostDescription(post);
  const canonicalUrl = getCanonicalUrl(`/posts/${post.id}`);
  const imageUrl = getAbsoluteImageUrl(
    post.cover_image || SilvaConfig.seo.og.image,
  );
  const keywords = getSeoKeywords([
    ...post.keywords,
    ...(post.category ? [post.category] : []),
  ]);
  const publishedTime = toIsoDate(post.created_at);
  const modifiedTime = toIsoDate(post.updated_at ?? post.created_at);

  return {
    title: post.title,
    description,
    keywords,
    authors: [{ name: SilvaConfig.seo.author }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      siteName: SilvaConfig.seo.site_name,
      locale: SilvaConfig.seo.locale,
      type: "article",
      publishedTime,
      modifiedTime,
      authors: [SilvaConfig.seo.author],
      section: post.category ?? undefined,
      tags: keywords,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card:
        SilvaConfig.seo.twitter.card === "summary"
          ? "summary"
          : "summary_large_image",
      site: SilvaConfig.seo.twitter.site || undefined,
      creator: SilvaConfig.seo.twitter.creator || undefined,
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const postId = parsePostId(id);

  const t = await getTranslations("PostDetail");
  const locale = await getLocale();

  const post = await getCachedPostById(postId);

  if (!post) {
    notFound();
  }

  const content = await readCachedArticleMarkdown(post.id);
  const htmlContent = await markdownToHtml(content);
  const tocItems = extractTocItems(htmlContent);
  const fullUrl = getCanonicalUrl(`/posts/${post.id}`);
  const description = await getPostDescription(post);
  const keywords = getSeoKeywords([
    ...post.keywords,
    ...(post.category ? [post.category] : []),
  ]);
  const imageUrl = getAbsoluteImageUrl(
    post.cover_image || SilvaConfig.seo.og.image,
  );
  const siteOwnerName = getLocalizedName(SilvaConfig.site, locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": fullUrl,
    },
    headline: post.title,
    description,
    author: {
      "@type": "Person",
      name: SilvaConfig.seo.author || siteOwnerName,
    },
    publisher: {
      "@type": "Organization",
      name: SilvaConfig.seo.site_name,
      ...(imageUrl
        ? {
            logo: {
              "@type": "ImageObject",
              url: imageUrl,
            },
          }
        : {}),
    },
    datePublished: toIsoDate(post.created_at),
    dateModified: toIsoDate(post.updated_at ?? post.created_at),
    articleSection: post.category ?? undefined,
    keywords,
    image: imageUrl ? [imageUrl] : undefined,
    url: fullUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

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
        <Comments source="article" postId={post.id} />
      </div>
    </>
  );
}
