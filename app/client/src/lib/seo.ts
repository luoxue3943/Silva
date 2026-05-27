import "server-only";

import type { Metadata } from "next";
import { SilvaConfig } from "./silva-config";

const DEFAULT_SITE_URL = "http://localhost:3000";
const DEFAULT_SUMMARY_LENGTH = 160;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function stripMarkdownSyntax(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/^>\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateSummary(value: string, maxLength = DEFAULT_SUMMARY_LENGTH) {
  const summary = value.trim();

  if (summary.length <= maxLength) {
    return summary;
  }

  return `${summary.slice(0, maxLength).trimEnd()}...`;
}

export function getSiteBaseUrl() {
  const configuredUrl =
    SilvaConfig.seo.canonical || process.env.NEXT_PUBLIC_SITE_URL || "";

  return trimTrailingSlash(configuredUrl || DEFAULT_SITE_URL);
}

export function getCanonicalUrl(pathname = "/") {
  return new URL(
    normalizePathname(pathname),
    `${getSiteBaseUrl()}/`,
  ).toString();
}

export function getAbsoluteImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return undefined;
  }

  return new URL(imageUrl, `${getSiteBaseUrl()}/`).toString();
}

export function getSeoTitle(title?: string | null) {
  const siteTitle = SilvaConfig.seo.title || SilvaConfig.seo.site_name;

  if (!title || title === siteTitle) {
    return siteTitle;
  }

  return `${title} | ${siteTitle}`;
}

export function getSeoKeywords(keywords?: string[] | null) {
  const uniqueKeywords = new Set<string>();

  for (const keyword of keywords ?? []) {
    const normalizedKeyword = keyword.trim();

    if (normalizedKeyword) {
      uniqueKeywords.add(normalizedKeyword);
    }
  }

  return [...uniqueKeywords];
}

export function extractMarkdownSummary(markdown: string) {
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];
  let inCodeFence = false;

  const flushParagraph = () => {
    if (currentParagraph.length === 0) {
      return;
    }

    const paragraph = stripMarkdownSyntax(currentParagraph.join(" "));

    if (paragraph) {
      paragraphs.push(paragraph);
    }

    currentParagraph = [];
  };

  for (const line of markdown.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (/^(```|~~~)/.test(trimmedLine)) {
      inCodeFence = !inCodeFence;
      flushParagraph();
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    if (!trimmedLine) {
      flushParagraph();
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmedLine) || /^[-*_]{3,}$/.test(trimmedLine)) {
      flushParagraph();
      continue;
    }

    if (/^!\[[^\]]*]\([^)]*\)$/.test(trimmedLine)) {
      continue;
    }

    currentParagraph.push(trimmedLine);
  }

  flushParagraph();

  return truncateSummary(paragraphs[0] ?? SilvaConfig.seo.description);
}

export function createDefaultMetadata(pathname = "/"): Metadata {
  const canonicalUrl = getCanonicalUrl(pathname);
  const imageUrl = getAbsoluteImageUrl(SilvaConfig.seo.og.image);
  const title = SilvaConfig.seo.title;
  const description = SilvaConfig.seo.description;

  return {
    metadataBase: new URL(getSiteBaseUrl()),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    authors: [{ name: SilvaConfig.seo.author }],
    creator: SilvaConfig.seo.author,
    publisher: SilvaConfig.seo.site_name,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: SilvaConfig.seo.og.title || title,
      description: SilvaConfig.seo.og.description || description,
      url: canonicalUrl,
      siteName: SilvaConfig.seo.site_name,
      locale: SilvaConfig.seo.locale,
      type: "website",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card:
        SilvaConfig.seo.twitter.card === "summary"
          ? "summary"
          : "summary_large_image",
      site: SilvaConfig.seo.twitter.site || undefined,
      creator: SilvaConfig.seo.twitter.creator || undefined,
      title: SilvaConfig.seo.og.title || title,
      description: SilvaConfig.seo.og.description || description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

type PageMetadataInput = {
  title: string;
  description: string;
  pathname: string;
  imageUrl?: string;
};

export function createPageMetadata({
  title,
  description,
  pathname,
  imageUrl,
}: PageMetadataInput): Metadata {
  const canonicalUrl = getCanonicalUrl(pathname);
  const normalizedImageUrl = getAbsoluteImageUrl(
    imageUrl ?? SilvaConfig.seo.og.image,
  );

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SilvaConfig.seo.site_name,
      locale: SilvaConfig.seo.locale,
      type: "website",
      images: normalizedImageUrl ? [{ url: normalizedImageUrl }] : undefined,
    },
    twitter: {
      card:
        SilvaConfig.seo.twitter.card === "summary"
          ? "summary"
          : "summary_large_image",
      site: SilvaConfig.seo.twitter.site || undefined,
      creator: SilvaConfig.seo.twitter.creator || undefined,
      title,
      description,
      images: normalizedImageUrl ? [normalizedImageUrl] : undefined,
    },
  };
}
