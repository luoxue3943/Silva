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

export default function Navbar({ labels, locale }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isActive = (pName: string) => pathname === pName;
  const isStartWith = (pName: string) => pathname.startsWith(pName);

  useEffect(() => {
    const scrollThreshold = window.innerHeight / 5;
    const handleScroll = () => setIsScrolled(window.scrollY > scrollThreshold);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <div className={Modules.navbar}>
        {/* 首页 */}
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

        {/* 文稿 */}
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

        {/* 时间轴 */}
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

        {/* 留言 */}
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

        {/* 更多 */}
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
