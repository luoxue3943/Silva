"use client";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Modules from "@/styles/navbar.module.scss";
import LanguageSwitcher from "../i18n/language-switcher";

interface NavbarProps {
  labels: {
    home: string;
    posts: string;
    timeline: string;
    messages: string;
    more: string;
  };
  locale: string;
}

/**
 * Primary navigation component that syncs active links and exposes a locale switcher.
 * 主导航组件，同步路由激活状态并提供语言切换入口。
 */
export default function Navbar({ labels, locale }: NavbarProps) {
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isScrolled, setIsScrolled] = useState(false);
  const isActive = (pName: string) => pathname === pName;
  const isStartWith = (pName: string) => pathname.startsWith(pName);

  useEffect(() => {
    // Toggle the active styling once the user scrolls beyond 20% viewport height ｜ 当滚动超过视口 20% 时切换导航样式
    const scrollThreshold = window.innerHeight / 5;
    const handleScroll = () => setIsScrolled(window.scrollY > scrollThreshold);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <div className={Modules.navbar}>
        {/* Home entry ｜ 首页入口 */}
        <Link href="/" className={Modules["link-button"]}>
          <div
            className={`${Modules.title} ${isActive("/") ? Modules.active : ""}`}
          >
            <span
              className={`${Modules["nav-icon"]} icon-[mynaui--home] ${isActive("/") ? "" : "hidden"}`}
            />
            <span className={Modules["nav-text"]} data-page="home">
              {labels.home}
            </span>
          </div>
        </Link>

        {/* Posts hub ｜ 文稿入口 */}
        <Link href="/posts" className={Modules["link-button"]}>
          <div
            className={`${Modules.title} ${isStartWith("/posts") ? Modules.active : ""}`}
          >
            <span
              className={`${Modules["nav-icon"]} icon-[mynaui--file-text] ${isStartWith("/posts") ? "" : "hidden"}`}
            />
            <span className={Modules["nav-text"]} data-page="posts">
              {labels.posts}
            </span>
          </div>
        </Link>

        {/* Timeline section ｜ 时间轴入口 */}
        <Link href="/timeline" className={Modules["link-button"]}>
          <div
            className={`${Modules.title} ${isStartWith("/timeline") ? Modules.active : ""}`}
          >
            <span
              className={`${Modules["nav-icon"]} icon-[meteor-icons--clock-rotate] ${isStartWith("/timeline") ? "" : "hidden"}`}
            />
            <span className={Modules["nav-text"]} data-page="timeline">
              {labels.timeline}
            </span>
          </div>
        </Link>

        {/* Guestbook section ｜ 留言入口 */}
        <Link href="/messages" className={Modules["link-button"]}>
          <div
            className={`${Modules.title} ${isActive("/messages") ? Modules.active : ""}`}
          >
            <span
              className={`${Modules["nav-icon"]} icon-[mynaui--message-dots] ${isActive("/messages") ? "" : "hidden"}`}
            />
            <span className={Modules["nav-text"]} data-page="messages">
              {labels.messages}
            </span>
          </div>
        </Link>

        {/* More menu ｜ 更多入口 */}
        <Link href="/more" className={Modules["link-button"]}>
          <div
            className={`${Modules.title} ${isStartWith("/more") ? Modules.active : ""}`}
          >
            <span
              className={`${Modules["nav-icon"]} icon-[mynaui--dots-circle] ${isStartWith("/more") ? "" : "hidden"}`}
            />
            <span className={Modules["nav-text"]} data-page="more">
              {labels.more}
            </span>
          </div>
        </Link>
      </div>
      <LanguageSwitcher locale={locale} />
    </header>
  );
}
