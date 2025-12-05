import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
};

// 和列表页保持同一份数据（真实项目里你可以抽成单独的模块 import）/ Share the same mock data as list page (extract to shared module in real app)
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

// 根据 URL 里的 id 拿到对应文章 / Fetch the post matching id from URL
export const usePost = routeLoader$(async ({ params }) => {
  const { id } = params;

  const post = MOCK_POSTS.find((p) => p.id === id);

  return post;
});

export default component$(() => {
  const post = usePost();

  return (
    <article class="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <header>
        <p class="mb-2 text-sm text-gray-500">
          <Link href="/posts" class="hover:underline">
            ← 返回列表 / Back to list
          </Link>
        </p>
        <h1 class="mb-2 text-3xl font-bold">{post.value.title}</h1>
        <p class="text-sm text-gray-400">{post.value.excerpt}</p>
      </header>

      <hr class="border-gray-800" />

      <section class="leading-relaxed whitespace-pre-wrap text-gray-200">
        {post.value.content}
      </section>
    </article>
  );
});

// 可选：根据文章设置 <title> / Optional: set <title> based on post
export const head: DocumentHead = ({ resolveValue }) => {
  const post = resolveValue(usePost);
  return {
    title: `${post.title} | Posts`,
  };
};
