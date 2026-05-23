/**
 * 留言板页面 / Message board page
 *
 * 展示留言标题和评论区。
 * Displays the message board title and comments area.
 */

import Comments from "@/components/comments/comments";
import { MOCK_COMMENTS } from "@/data/mock-comments";
import { getTranslations } from "next-intl/server";

/**
 * 加载留言板评论数据 / Loads message board comment data
 */
function getMessages() {
  return MOCK_COMMENTS;
}

export default async function MessagePage() {
  const t = await getTranslations("MessageBoard");
  const messages = getMessages();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">{t("title")}</h1>

        <p className="text-gray-400">{t("welcome")}</p>
      </div>

      <Comments comments={messages} />
    </div>
  );
}
