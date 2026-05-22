"use client";

/**
 * 导航栏组件 / Navigation Bar Component
 *
 * 提供网站主导航功能，包括页面链接、高亮、滚动检测、分类菜单与语言切换。
 * Provides primary site navigation with link highlighting, scroll detection,
 * category menu, and locale switcher.
 */

import { Link } from "next-view-transitions";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const router = useRouter();
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

  const changeLocale = useCallback(
    (nextLocale: string) => {
      /**
       * 如果你使用 next-intl middleware，这个 cookie 通常会被用于记住语言。
       * 如果你的项目使用 /zh-CN、/en-US 这种路由前缀，可以后续改成 router.replace 对应路径。
       */
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

      setLocaleMenu(false);
      router.refresh();
    },
    [router, setLocaleMenu],
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
          {/* 首页链接 / Home link */}
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

          {/* 文章链接 / Posts link */}
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

          {/* 时间线链接 / Timeline link */}
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

          {/* 留言链接 / Message link */}
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

          {/* 更多链接 / More link */}
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

        {/* 语言切换入口 / Locale switch entry */}
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
                <button
                  key={option.locale}
                  className={Modules["locale-option"]}
                  type="button"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    changeLocale(option.locale);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
