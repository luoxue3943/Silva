import { AnimatedList } from "@/components/ReactBits/animated-list/animated-list";
import { MOCK_POSTS, type Post } from "@/data/mock-posts";
import { $, component$ } from "@builder.io/qwik";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import Modules from "./posts.module.scss";

/**
 * 服务器端 loader：预取文章数据 / Server-side loader: Prefetch post data
 */
export const usePosts = routeLoader$(({ query }) => {
  const category = query.get("category");

  // 如果有分类参数，筛选对应分类的文章 / Filter posts by category if parameter exists
  if (category) {
    return MOCK_POSTS.filter((post) => post.category === category);
  }

  return MOCK_POSTS;
});

export default component$(() => {
  const posts = usePosts();
  const nav = useNavigate();

  const handleItemSelect$ = $(async (post: Post) => {
    console.log("Selected:", post.title);
    // 导航到文章详情页 / Navigate to post detail page
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
