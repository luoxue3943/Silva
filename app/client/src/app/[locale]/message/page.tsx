import Comments from "@/components/comments/comments";
import { getTranslations } from "next-intl/server";

export default async function MessagePage() {
  const t = await getTranslations("MessageBoard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">{t("title")}</h1>

        <p className="text-gray-400">{t("welcome")}</p>
      </div>

      <Comments source="site" />
    </div>
  );
}
