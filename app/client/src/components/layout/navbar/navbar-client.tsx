"use client";

/**
 * 导航栏客户端组件 / Navigation bar client component
 *
 * 处理主导航高亮、滚动状态、分类菜单和语言切换。
 * Handles primary nav highlighting, scroll state, category menu, and locale switching.
 */

import Link from "next/link";
import { Link as I18nLink } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modules from "./navbar.module.scss";

export type NavbarCategory = {
  slug: string;
  name: string;
  names?: Record<string, string>;
};

const localeOptions = [
  {
    locale: "en-US",
    label: "English",
  },
  {
    locale: "zh-CN",
    label: "简体中文",
  },
] as const;

function normalizeLocale(locale: string): string {
  return locale.trim().replace(/_/g, "-").toLowerCase();
}

function getLocalizedName(item: NavbarCategory, locale: string): string {
  const names = item.names;

  if (!names) {
    return item.name;
  }

  const normalizedLocale = normalizeLocale(locale);
  const langCode = normalizedLocale.split("-")[0];

  const entries = Object.entries(names);

  const findByNormalizedKey = (target: string) =>
    entries.find(([key]) => normalizeLocale(key) === target)?.[1];

  return (
    findByNormalizedKey(normalizedLocale) ??
    findByNormalizedKey(langCode) ??
    entries.find(([key]) =>
      normalizeLocale(key).startsWith(`${langCode}-`),
    )?.[1] ??
    names.default ??
    item.name
  );
}

function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return "/";
  }

  const firstSegment = normalizeLocale(segments[0]);

  const isLocaleSegment = localeOptions.some((option) => {
    const optionLocale = normalizeLocale(option.locale);
    const optionLang = optionLocale.split("-")[0];

    return firstSegment === optionLocale || firstSegment === optionLang;
  });

  if (!isLocaleSegment) {
    return pathname;
  }

  const stripped = `/${segments.slice(1).join("/")}`;

  return stripped === "/" ? "/" : stripped.replace(/\/$/, "");
}

type NavbarClientProps = {
  categories: NavbarCategory[];
};

export default function NavbarClient({ categories }: NavbarClientProps) {
  const pathname = usePathname() ?? "/";
  const locale = useLocale();
  const t = useTranslations("Navbar");

  const normalizedPathname = useMemo(
    () => stripLocaleFromPathname(pathname),
    [pathname],
  );

  const [isScrolled, setIsScrolled] = useState(false);

  const [showLocaleMenu, setShowLocaleMenuState] = useState(false);
  const [localeMenuClosing, setLocaleMenuClosing] = useState(false);
  const localeMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localeSwitcherRef = useRef<HTMLDivElement | null>(null);

  const [showCategoryMenu, setShowCategoryMenuState] = useState(false);
  const [categoryMenuClosing, setCategoryMenuClosing] = useState(false);
  const categoryMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  const isActive = useCallback(
    (targetPathname: string) => normalizedPathname === targetPathname,
    [normalizedPathname],
  );

  const isStartWith = useCallback(
    (targetPathname: string) => normalizedPathname.startsWith(targetPathname),
    [normalizedPathname],
  );

  const finishLocaleClose = useCallback(() => {
    setShowLocaleMenuState(false);
    setLocaleMenuClosing(false);
    localeMenuTimerRef.current = null;
  }, []);

  const setLocaleMenu = useCallback(
    (nextOpen: boolean) => {
      if (localeMenuTimerRef.current) {
        clearTimeout(localeMenuTimerRef.current);
        localeMenuTimerRef.current = null;
      }

      if (nextOpen) {
        setLocaleMenuClosing(false);
        setShowLocaleMenuState(true);
        return;
      }

      if (!showLocaleMenu) {
        return;
      }

      setLocaleMenuClosing(true);
      localeMenuTimerRef.current = setTimeout(finishLocaleClose, 180);
    },
    [finishLocaleClose, showLocaleMenu],
  );

  const finishCategoryClose = useCallback(() => {
    setShowCategoryMenuState(false);
    setCategoryMenuClosing(false);
    categoryMenuTimerRef.current = null;
  }, []);

  const setCategoryMenu = useCallback(
    (nextOpen: boolean) => {
      if (categoryMenuTimerRef.current) {
        clearTimeout(categoryMenuTimerRef.current);
        categoryMenuTimerRef.current = null;
      }

      if (nextOpen) {
        setCategoryMenuClosing(false);
        setShowCategoryMenuState(true);
        return;
      }

      if (!showCategoryMenu) {
        return;
      }

      setCategoryMenuClosing(true);
      categoryMenuTimerRef.current = setTimeout(finishCategoryClose, 180);
    },
    [finishCategoryClose, showCategoryMenu],
  );

  useEffect(() => {
    const updateScrolledState = () => {
      const scrollThreshold = window.innerHeight / 5;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    updateScrolledState();

    window.addEventListener("scroll", updateScrolledState, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateScrolledState);
    };
  }, []);

  useEffect(() => {
    const handleWindowClick = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        showLocaleMenu &&
        localeSwitcherRef.current &&
        target &&
        !localeSwitcherRef.current.contains(target)
      ) {
        setLocaleMenu(false);
      }

      if (
        showCategoryMenu &&
        categoryMenuRef.current &&
        target &&
        !categoryMenuRef.current.contains(target)
      ) {
        setCategoryMenu(false);
      }
    };

    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [setCategoryMenu, setLocaleMenu, showCategoryMenu, showLocaleMenu]);

  useEffect(() => {
    return () => {
      if (localeMenuTimerRef.current) {
        clearTimeout(localeMenuTimerRef.current);
      }

      if (categoryMenuTimerRef.current) {
        clearTimeout(categoryMenuTimerRef.current);
      }
    };
  }, []);

  return (
    <nav
      className={`${Modules.nav} ${isScrolled ? Modules.scrolled : ""}`.trim()}
    >
      <div className={Modules["nav-container"]}>
        <div className={Modules.navbar}>
          {/* 首页导航项 / Home navigation item */}
          <Link href="/" className={Modules["link-button"]}>
            <div
              className={`${Modules.title} ${
                isActive("/") ? Modules.active : ""
              }`}
            >
              <span
                className={`${Modules["nav-icon"]} icon-[mynaui--home] ${
                  isActive("/") ? "" : "hidden"
                }`}
              />
              <span className={Modules["nav-text"]} data-page="home">
                {t("home")}
              </span>
            </div>
          </Link>

          {/* 文章导航项与分类菜单 / Posts navigation item with category menu */}
          <div
            className={Modules["category-wrapper"]}
            onMouseEnter={() => setCategoryMenu(true)}
            onMouseLeave={() => setCategoryMenu(false)}
            ref={categoryMenuRef}
          >
            <Link href="/posts" className={Modules["link-button"]}>
              <div
                className={`${Modules.title} ${
                  isStartWith("/posts") ? Modules.active : ""
                }`}
              >
                <span
                  className={`${Modules["nav-icon"]} icon-[mynaui--file-text] ${
                    isStartWith("/posts") ? "" : "hidden"
                  }`}
                />
                <span className={Modules["nav-text"]} data-page="posts">
                  {t("posts")}
                </span>
              </div>
            </Link>

            {showCategoryMenu && (
              <div
                className={`${Modules["category-menu"]} ${
                  categoryMenuClosing ? Modules.closing : ""
                }`.trim()}
                onMouseEnter={() => setCategoryMenu(true)}
                onMouseLeave={() => setCategoryMenu(false)}
              >
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/posts?category=${category.slug}`}
                    className={Modules["category-option"]}
                    onClick={() => setCategoryMenu(false)}
                  >
                    {getLocalizedName(category, locale)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 时间线导航项 / Timeline navigation item */}
          <Link href="/timeline" className={Modules["link-button"]}>
            <div
              className={`${Modules.title} ${
                isStartWith("/timeline") ? Modules.active : ""
              }`}
            >
              <span
                className={`${Modules["nav-icon"]} icon-[meteor-icons--clock-rotate] ${
                  isStartWith("/timeline") ? "" : "hidden"
                }`}
              />
              <span className={Modules["nav-text"]} data-page="timeline">
                {t("timeline")}
              </span>
            </div>
          </Link>

          {/* 留言导航项 / Message navigation item */}
          <Link href="/message" className={Modules["link-button"]}>
            <div
              className={`${Modules.title} ${
                isStartWith("/message") ? Modules.active : ""
              }`}
            >
              <span
                className={`${Modules["nav-icon"]} icon-[mynaui--message-dots] ${
                  isStartWith("/message") ? "" : "hidden"
                }`}
              />
              <span className={Modules["nav-text"]} data-page="message">
                {t("message")}
              </span>
            </div>
          </Link>

          {/* 更多导航项占位 / More navigation placeholder */}
          <div className={Modules["link-button"]}>
            <div
              className={`${Modules.title} ${
                isStartWith("/more") ? Modules.active : ""
              }`}
            >
              <span
                className={`${Modules["nav-icon"]} icon-[mynaui--dots-circle] ${
                  isStartWith("/more") ? "" : "hidden"
                }`}
              />
              <span className={Modules["nav-text"]} data-page="more">
                {t("more")}
              </span>
            </div>
          </div>
        </div>

        {/* 语言切换器入口 / Locale switcher entry */}
        <div
          className={Modules["locale-switcher"]}
          onClick={() => setLocaleMenu(!showLocaleMenu)}
          ref={localeSwitcherRef}
        >
          <div className={Modules["locale-icon-wrapper"]}>
            <span
              className={`icon-[mynaui--globe] ${Modules["locale-icon"]}`}
            />
          </div>

          {showLocaleMenu && (
            <div
              className={`${Modules["locale-menu"]} ${
                localeMenuClosing ? Modules.closing : ""
              }`.trim()}
            >
              {localeOptions.map((option) => (
                <I18nLink
                  href={pathname}
                  locale={option.locale}
                  key={option.locale}
                  className={Modules["locale-option"]}
                >
                  {option.label}
                </I18nLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
