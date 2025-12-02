/**
 * 导航栏组件 / Navigation Bar Component
 *
 * 提供网站主导航功能，包括页面链接、活跃状态指示和滚动检测
 * Provides primary site navigation with link highlighting and scroll detection
 */
import * as m from "@/paraglide/messages";
import {
  $,
  component$,
  isBrowser,
  useOnWindow,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import Modules from "./navbar.module.scss";

export default component$(() => {
  // 获取当前路由位置 / Get current route location
  const loc = useLocation();

  // 滚动状态信号 / Scroll state signal
  const isScrolled = useSignal(false);
  // 缓存导航文案，避免重新渲染时语言回退 / Cache nav labels to avoid locale fallback on rerender
  const labels = useSignal({
    home: m["Navbar.home"](),
    posts: m["Navbar.posts"](),
    timeline: m["Navbar.timeline"](),
    messages: m["Navbar.messages"](),
    more: m["Navbar.more"](),
  });

  /**
   * 检查路径是否完全匹配
   * Check if path matches exactly
   *
   * @param pName 路径名称 / Path name
   * @returns 是否匹配 / Whether it matches
   */
  const isActive = (pName: string) => loc.url.pathname === pName;

  /**
   * 检查路径是否以指定前缀开头
   * Check if path starts with specified prefix
   *
   * @param pName 路径前缀 / Path prefix
   * @returns 是否匹配 / Whether it matches
   */
  const isStartWith = (pName: string) => loc.url.pathname.startsWith(pName);

  /**
   * 监听窗口滚动事件
   * Listen to window scroll event
   *
   * 当滚动超过屏幕高度的 1/5 时更新状态
   * Update state when scroll exceeds 1/5 of the viewport height
   */
  useOnWindow(
    "scroll",
    $(() => {
      const scrollThreshold = window.innerHeight / 5;
      isScrolled.value = window.scrollY > scrollThreshold;
    }),
  );

  /**
   * 初始化滚动状态
   * Initialize scroll state
   *
   * 在组件挂载时检查初始滚动位置
   * Check initial scroll position when component mounts
   */
  useTask$(() => {
    if (!isBrowser) return;
    const scrollThreshold = window.innerHeight / 5;
    isScrolled.value = window.scrollY > scrollThreshold;
  });

  return (
    <nav
      class={`${Modules.nav} ${isScrolled.value ? Modules.scrolled : ""}`.trim()}
    >
      <div class={Modules.navbar}>
        {/* 首页链接 / Home link */}
        <Link href="/" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${isActive("/") ? Modules.active : ""}`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[mynaui--home] ${
                isActive("/") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="home">
              {labels.value.home}
            </span>
          </div>
        </Link>

        {/* 文章链接 / Posts link */}
        <Link href="/posts" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${
              isStartWith("/posts") ? Modules.active : ""
            }`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[mynaui--file-text] ${
                isStartWith("/posts") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="posts">
              {labels.value.posts}
            </span>
          </div>
        </Link>

        {/* 时间线链接 / Timeline link */}
        <Link href="/timeline" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${
              isStartWith("/timeline") ? Modules.active : ""
            }`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[meteor-icons--clock-rotate] ${
                isStartWith("/timeline") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="timeline">
              {labels.value.timeline}
            </span>
          </div>
        </Link>

        {/* 留言链接 / Messages link */}
        <Link href="/messages" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${
              isActive("/messages") ? Modules.active : ""
            }`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[mynaui--message-dots] ${
                isActive("/messages") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="messages">
              {labels.value.messages}
            </span>
          </div>
        </Link>

        {/* 更多链接 / More link */}
        <Link href="/more" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${
              isStartWith("/more") ? Modules.active : ""
            }`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[mynaui--dots-circle] ${
                isStartWith("/more") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="more">
              {labels.value.more}
            </span>
          </div>
        </Link>
      </div>
    </nav>
  );
});
