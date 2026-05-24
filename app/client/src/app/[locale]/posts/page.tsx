import PostsListClient from "./posts-list-client";

type PostsPageProps = {
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { category } = await searchParams;
  const selectedCategory = Array.isArray(category) ? category[0] : category;

  return <PostsListClient category={selectedCategory} />;
}
