"use server";
import { getLocale, getTranslations } from "next-intl/server";
import Navbar from "./navbar";

/**
 * Server component that injects localized labels into the client-side navbar.
 * 服务端组件，用于为客户端导航注入本地化标签。
 */
export default async function NavbarWrapper() {
  const t = await getTranslations("Navbar");
  const locale: string = await getLocale();
  // Resolve translated labels on the server to skip client waterfalls ｜ 服务端预取导航文案，避免客户端额外请求
  const labels = {
    home: t("home"),
    posts: t("posts"),
    timeline: t("timeline"),
    messages: t("messages"),
    more: t("more"),
  };

  return <Navbar labels={labels} locale={locale} />;
}
