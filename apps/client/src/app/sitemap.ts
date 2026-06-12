import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { getPosts } from "@/services/posts";
import type { Post } from "@/types/post";

export const dynamic = "force-dynamic";

const SITEMAP_PAGE_SIZE = 100;

async function getAllPosts() {
  const posts: Post[] = [];
  let page = 1;

  while (true) {
    const result = await getPosts(page, SITEMAP_PAGE_SIZE).send(true);

    posts.push(...result.data);

    if (!result.hasMore) {
      break;
    }

    page += 1;
  }

  return posts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: getCanonicalUrl("/posts"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getCanonicalUrl("/timeline"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: getCanonicalUrl("/murmurs"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: getCanonicalUrl("/message"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const postRoutes = (await getAllPosts()).map((post) => ({
    url: getCanonicalUrl(`/posts/${post.id}`),
    lastModified: new Date(post.updated_at ?? post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes];
}
