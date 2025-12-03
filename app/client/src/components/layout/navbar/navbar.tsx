/**
 * 导航栏组件 / Navigation Bar Component
 *
 * 提供网站主导航功能，包括页面链接、高亮与滚动检测。 / Provides primary site navigation with link highlighting and scroll detection.
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
  // 缓存导航文案，避免重渲染时语言回退 / Cache nav labels to avoid locale fallback on rerender
  const labels = useSignal({
    home: m["Navbar.home"](),
    posts: m["Navbar.posts"](),
    timeline: m["Navbar.timeline"](),
    messages: m["Navbar.messages"](),
    more: m["Navbar.more"](),
  });
  // 语言菜单状态信号 / Signals for locale menu state
  const showLocaleMenu = useSignal(false);
  const localeMenuClosing = useSignal(false);
  const localeMenuTimer = useSignal<ReturnType<typeof setTimeout>>();
  const localeSwitcherRef = useSignal<HTMLElement>();

  /**
   * 检查路径是否完全匹配 / Check if path matches exactly
   *
   * @param pName 路径名称 / Path name
   * @returns 是否匹配 / Whether it matches
   */
  const isActive = (pName: string) => loc.url.pathname === pName;

  /**
   * 检查路径是否以指定前缀开头 / Check if path starts with prefix
   *
   * @param pName 路径前缀 / Path prefix
   * @returns 是否匹配 / Whether it matches
   */
  const isStartWith = (pName: string) => loc.url.pathname.startsWith(pName);

  /**
   * 监听窗口滚动更新导航状态 / Listen to scroll to update navbar state
   *
   * 当滚动超过屏幕高度的 1/5 时，显示滚动样式 / Toggle scrolled styles once scroll passes 1/5 viewport height
   */
  useOnWindow(
    "scroll",
    $(() => {
      const scrollThreshold = window.innerHeight / 5;
      isScrolled.value = window.scrollY > scrollThreshold;
    }),
  );

  /**
   * 组件挂载时同步初始滚动状态 / Sync initial scroll state on mount
   *
   * 避免首次渲染时状态与滚动位置不一致 / Prevent mismatch between state and initial scroll position
   */
  useTask$(() => {
    if (!isBrowser) return;
    const scrollThreshold = window.innerHeight / 5;
    isScrolled.value = window.scrollY > scrollThreshold;
  });

  /**
   * 设置语言菜单为全关并清理状态 / Fully close locale menu and reset flags
   */
  const finishLocaleClose = $(() => {
    showLocaleMenu.value = false;
    localeMenuClosing.value = false;
    localeMenuTimer.value = undefined;
  });

  /**
   * 控制语言菜单开启与关闭延时 / Toggle locale menu with delayed close
   *
   * @param nextOpen 是否打开菜单 / Whether to open the menu
   */
  const setLocaleMenu = $((nextOpen: boolean) => {
    if (localeMenuTimer.value) clearTimeout(localeMenuTimer.value);
    localeMenuTimer.value = undefined;

    if (nextOpen) {
      localeMenuClosing.value = false;
      showLocaleMenu.value = true;
      return;
    }

    if (!showLocaleMenu.value) return;
    localeMenuClosing.value = true;
    localeMenuTimer.value = setTimeout(() => finishLocaleClose(), 180);
  });

  // 点击窗口空白区域关闭菜单 / Close menu when clicking outside
  useOnWindow(
    "click",
    $((event) => {
      const target = event.target as HTMLElement | null;
      if (
        showLocaleMenu.value &&
        localeSwitcherRef.value &&
        target &&
        !localeSwitcherRef.value.contains(target)
      ) {
        setLocaleMenu(false);
      }
    }),
  );

  return (
    <nav
      class={`${Modules.nav} ${isScrolled.value ? Modules.scrolled : ""}`.trim()}
    >
      <div class={Modules["nav-container"]}>
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
        {/* 语言切换入口 / Locale switch entry */}
        <div
          class={Modules["locale-switcher"]}
          onClick$={$(() => setLocaleMenu(!showLocaleMenu.value))}
          ref={localeSwitcherRef}
        >
          <div class={Modules["locale-icon-wrapper"]}>
            <span class={`icon-[mynaui--globe] ${Modules["locale-icon"]}`} />
          </div>
          {showLocaleMenu.value && (
            <div
              class={`${Modules["locale-menu"]} ${localeMenuClosing.value ? Modules.closing : ""}`.trim()}
            >
              <button class={Modules["locale-option"]} type="button">
                English
              </button>
              <button class={Modules["locale-option"]} type="button">
                简体中文
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
});
