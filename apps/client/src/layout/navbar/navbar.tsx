"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Modules from "./navbar.module.scss";

// 文章分类下拉菜单数据
const categories = [
  { slug: "tech", name: "技术" },
  { slug: "life", name: "生活" },
  { slug: "note", name: "笔记" },
];

// 普通导航项数据
const navItems = [
  {
    href: "/timeline",
    label: "时间线",
    icon: "icon-[meteor-icons--clock-rotate]",
  },
  { href: "/murmurs", label: "碎碎念", icon: "icon-[mynaui--chat-dots]" },
  { href: "/message", label: "留言", icon: "icon-[mynaui--message-dots]" },
];

// 更多菜单数据
const moreMenuItems = [{ title: "项目", href: "/more/project" }];

// 合并 className，自动过滤 false 和 undefined
const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function NavbarClient() {
  // 获取当前页面路径，用于判断导航高亮
  const pathname = usePathname() ?? "/";

  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // 判断当前导航项是否激活
  const isActive = useCallback(
    (href: string, exact = false) =>
      exact ? pathname === href : pathname.startsWith(href),
    [pathname],
  );

  // 监听页面滚动，滚动超过窗口高度 1/5 时给导航栏添加 scrolled 样式
  useEffect(() => {
    const updateScrolledState = () => {
      setIsScrolled(window.scrollY > window.innerHeight / 5);
    };

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrolledState);
    };
  }, []);

  // 渲染普通导航项
  const renderNavItem = (
    href: string,
    label: string,
    icon: string,
    exact = false,
  ) => {
    const active = isActive(href, exact);

    return (
      <Link key={href} href={href} className={Modules["link-button"]}>
        {/* 导航项内容 */}
        <div className={cx(Modules.title, active && Modules.active)}>
          {/* 当前页面对应的导航图标 */}
          <span
            className={cx(Modules["nav-icon"], icon, !active && "hidden")}
          />

          {/* 导航文字 */}
          <span className="inline">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    // 导航栏外层
    <nav className={cx(Modules.nav, isScrolled && Modules.scrolled)}>
      {/* 导航居中容器 */}
      <div className={Modules["nav-container"]}>
        {/* 胶囊导航栏主体 */}
        <div className={Modules.navbar}>
          {/* 首页导航项 */}
          {renderNavItem("/", "首页", "icon-[mynaui--home]", true)}

          {/* 文章导航项和分类下拉菜单 */}
          <div
            className={Modules["category-wrapper"]}
            onMouseEnter={() => setShowCategoryMenu(true)}
            onMouseLeave={() => setShowCategoryMenu(false)}
          >
            {/* 文章导航项 */}
            {renderNavItem("/posts", "文章", "icon-[mynaui--file-text]")}

            {/* 文章分类下拉菜单 */}
            {showCategoryMenu && (
              <div className={Modules["category-menu"]}>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/posts?category=${category.slug}`}
                    className={Modules["category-option"]}
                    onClick={() => setShowCategoryMenu(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 普通导航项：时间线、碎碎念、留言 */}
          {navItems.map((item) =>
            renderNavItem(item.href, item.label, item.icon),
          )}

          {/* 更多导航项和更多下拉菜单 */}
          <div
            className={Modules["category-wrapper"]}
            onMouseEnter={() => setShowMoreMenu(true)}
            onMouseLeave={() => setShowMoreMenu(false)}
          >
            {/* 更多导航项 */}
            {renderNavItem("/more", "更多", "icon-[mynaui--dots-circle]")}

            {/* 更多下拉菜单 */}
            {showMoreMenu && (
              <div className={Modules["category-menu"]}>
                {moreMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={Modules["category-option"]}
                    onClick={() => setShowMoreMenu(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
