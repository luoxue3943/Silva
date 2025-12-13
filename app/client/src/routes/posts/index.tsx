import { AnimatedList } from "@/components/ReactBits/animated-list/animated-list";
import { $, component$ } from "@builder.io/qwik";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import Modules from "./posts.module.scss";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  views: number;
};

// 模拟一些文章数据 / Fake posts data
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Hello Qwik",
    excerpt: "第一篇示例文章，介绍一下 Qwik 的基本用法。",
    content:
      "这是第一篇文章的完整内容。你可以在这里放真正的 Markdown 渲染结果或者接口返回的数据。",
    date: "2024/01/15",
    category: "教程",
    views: 1234,
  },
  {
    id: "2",
    title: "View Transitions in Qwik",
    excerpt: "如何在 Qwik 中使用视图过渡（View Transitions）。",
    content: "这里是第二篇文章内容，专门讲 view-transition 的各种姿势。",
    date: "2024/02/20",
    category: "进阶",
    views: 856,
  },
  {
    id: "3",
    title: "Paraglide JS + Qwik",
    excerpt: "在 Qwik 项目中集成 Paraglide JS 实现 i18n。",
    content: "这是第三篇文章内容，可以分享你现在正在做的 i18n 架构设计。",
    date: "2024/03/10",
    category: "国际化",
    views: 567,
  },
];

// 服务器端 loader：预取文章数据 / Server-side loader to prefetch post data
export const usePosts = routeLoader$(() => {
  return MOCK_POSTS;
});

export default component$(() => {
  const posts = usePosts();
  const nav = useNavigate();

  const handleItemSelect$ = $(async (post: Post) => {
    console.log("Selected:", post.title);
    // 导航到文章详情页
    await nav(`/posts/${post.id}`);
  });

  const renderPost$ = $((post: Post) => {
    return (
      <div class="flex w-full flex-col gap-3">
        <h3 class="m-0 text-xl font-bold text-white">{post.title}</h3>
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <span class={Modules.label}>
            <span class="icon-[mynaui--clock-four]" />
            <span>{post.date}</span>
          </span>
          <span class={Modules.label}>
            <span class="icon-[mynaui--hash-circle] h-4 w-3" />
            <span>{post.category}</span>
          </span>
          <span class={Modules.label}>
            <span class="icon-[mynaui--eye]" />
            <span>{post.views}</span>
          </span>
        </div>
      </div>
    );
  });

  return (
    <section class={Modules["posts-section"]}>
      <AnimatedList
        items={posts.value}
        onItemSelect$={handleItemSelect$}
        renderItem={renderPost$}
        showGradients={false}
        enableArrowNavigation={false}
        displayScrollbar={false}
        itemHeight="100px"
        class={Modules["animated-list"]}
      />
    </section>
  );
});
