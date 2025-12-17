/**
 * 留言板页面 / Messages Page
 *
 * 展示留言评论区 / Display message board with comments
 */
import Comments from "@/components/comments/comments";
import { MOCK_COMMENTS } from "@/data/mock-comments";
import * as m from "@/paraglide/messages";
import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

/**
 * 加载留言数据 / Load messages data
 */
export const useMessages = routeLoader$(() => {
  return MOCK_COMMENTS;
});

export default component$(() => {
  const messages = useMessages();

  return (
    <div class="mx-auto max-w-7xl px-4 py-10">
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">
          {m["MessageBoard.title"]()}
        </h1>
        <p class="text-gray-400">{m["MessageBoard.welcome"]()}</p>
      </div>
      <Comments comments={messages.value} />
    </div>
  );
});
