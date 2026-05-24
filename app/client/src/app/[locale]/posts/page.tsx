import PostsListClient from "./posts-list-client";

/**
 * 文章列表页面 / Posts list page
 *
 * 从 URL 查询参数解析分类，并将筛选条件交给客户端分页列表。
 * Read category from URL search params and pass the filter into the client paginated list
 */

type PostsPageProps = {
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { category } = await searchParams;

  // Next.js 查询参数可能是数组，这里只使用第一个分类值 / Next.js search params can be arrays; only the first category is used
  const selectedCategory = Array.isArray(category) ? category[0] : category;

  return <PostsListClient category={selectedCategory} />;
}
