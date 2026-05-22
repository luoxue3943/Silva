/**
 * 留言板页面 / Messages Page
 *
 * 展示留言评论区 / Display message board with comments
 */

import Comments from "@/components/comments/comments";
import { MOCK_COMMENTS } from "@/data/mock-comments";
import { getTranslations } from "next-intl/server";

/**
 * 加载留言数据 / Load messages data
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
