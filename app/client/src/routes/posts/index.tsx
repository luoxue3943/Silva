import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
};

// 模拟一些文章数据 / Fake posts data
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Hello Qwik",
    excerpt: "第一篇示例文章，介绍一下 Qwik 的基本用法。",
    content:
      "这是第一篇文章的完整内容。你可以在这里放真正的 Markdown 渲染结果或者接口返回的数据。",
  },
  {
    id: "2",
    title: "View Transitions in Qwik",
    excerpt: "如何在 Qwik 中使用视图过渡（View Transitions）。",
    content: "这里是第二篇文章内容，专门讲 view-transition 的各种姿势。",
  },
  {
    id: "3",
    title: "Paraglide JS + Qwik",
    excerpt: "在 Qwik 项目中集成 Paraglide JS 实现 i18n。",
    content: "这是第三篇文章内容，可以分享你现在正在做的 i18n 架构设计。",
  },
];

// 服务器端 loader：预取文章数据 / Server-side loader to prefetch post data
export const usePosts = routeLoader$(() => {
  return MOCK_POSTS;
});

export default component$(() => {
  const posts = usePosts();

  return (
    <section class="mx-auto max-w-3xl px-4 py-10">
      <h1 class="mb-6 text-3xl font-bold">文章列表 / Posts</h1>

      <ul class="space-y-4">
        {posts.value.map((post) => (
          <li
            key={post.id}
            class="rounded-xl border border-gray-700 p-4 transition-colors hover:bg-gray-900/40"
          >
            <h2 class="mb-1 text-xl font-semibold">
              <Link href={`/posts/${post.id}`} class="hover:underline">
                {post.title}
              </Link>
            </h2>

            <p class="mb-2 text-sm text-gray-400">{post.excerpt}</p>

            <Link
              href={`/posts/${post.id}`}
              class="text-sm text-blue-400 hover:underline"
            >
              阅读更多 →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
});
