"use server";
import { getLocale, getTranslations } from "next-intl/server";
import Navbar from "./navbar";

export default async function NavbarWrapper() {
  const t = await getTranslations("Navbar");
  const locale: string = await getLocale();
  // 在服务器端直接取出翻译的字符串
  const labels = {
    home: t("home"),
    posts: t("posts"),
    timeline: t("timeline"),
    messages: t("messages"),
    more: t("more"),
  };

  return <Navbar labels={labels} locale={locale} />;
}
