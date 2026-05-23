import { MOCK_POSTS } from "@/data/mock-posts";
import PostsListClient from "./posts-list-client";

type PostsPageProps = {
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

/**
 * 文章列表页面 / Posts page
 *
 * 根据 category 查询参数筛选文章。
 * Filters posts by the category query parameter.
 */
export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { category } = await searchParams;

  const selectedCategory = Array.isArray(category) ? category[0] : category;

  const posts = selectedCategory
    ? MOCK_POSTS.filter((post) => post.category === selectedCategory)
    : MOCK_POSTS;

  return <PostsListClient posts={posts} />;
}
