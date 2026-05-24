"use client";

import type { Post } from "@/types/post";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./posts.module.scss";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

type PostDetailData = Post & {
  htmlContent: string;
  fullUrl: string;
  tocItems: TocItem[];
};

type PostDetailLabels = {
  author: string;
  link: string;
  commercialLicense: string;
  licenseText: string;
  licenseName: string;
};

type PostDetailClientProps = {
  post: PostDetailData;
  siteOwnerName: string;
  locale: string;
  labels: PostDetailLabels;
  modulesClassNames: {
    label: string;
  };
};

function formatPostDate(
  date: string | number | Date | null | undefined,
  locale: string,
) {
  if (date == null) {
    return "";
  }

  const normalizedDate =
    typeof date === "number" && date < 1_000_000_000_000 ? date * 1000 : date;

  const parsedDate = new Date(normalizedDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostDetailClient({
  post,
  siteOwnerName,
  locale,
  labels,
  modulesClassNames,
}: PostDetailClientProps) {
  const firstTocId = post.tocItems[0]?.id ?? "";
  const postKey = post.fullUrl;

  const [activeIdState, setActiveIdState] = useState({
    postKey,
    value: firstTocId,
  });

  const [scrollProgress, setScrollProgress] = useState(0);

  const activeId =
    activeIdState.postKey === postKey ? activeIdState.value : firstTocId;

  const isProgrammaticScrollRef = useRef(false);
  const articleEndPositionRef = useRef(0);

  const updateActiveId = useCallback(
    (value: string) => {
      setActiveIdState((current) => {
        if (current.postKey === postKey && current.value === value) {
          return current;
        }

        return {
          postKey,
          value,
        };
      });
    },
    [postKey],
  );

  /**
   * 为 Markdown 标题补充 id，并绑定代码块复制按钮。
   * Adds IDs to Markdown headings and binds code-copy buttons.
   */
  useEffect(() => {
    if (!post.tocItems.length) {
      return;
    }

    const article = document.querySelector("article");

    if (!article) {
      return;
    }

    const articleRect = article.getBoundingClientRect();
    articleEndPositionRef.current = articleRect.bottom + window.scrollY;

    const markdownSection = article.querySelector(`.${styles.markdown}`);

    if (markdownSection) {
      const headings = markdownSection.querySelectorAll("h1, h2, h3, h4");

      headings.forEach((heading, index) => {
        const tocItem = post.tocItems[index];

        if (!heading.id && tocItem) {
          heading.id = tocItem.id;
        }
      });
    }

    const copyButtons =
      article.querySelectorAll<HTMLButtonElement>(".code-block-copy");

    const cleanups: Array<() => void> = [];

    copyButtons.forEach((button) => {
      const handleClick = async () => {
        let code =
          button.getAttribute("data-code") ?? button.getAttribute("datacode");

        if (!code) {
          const wrapper = button.closest(".code-block-wrapper");
          const pre = wrapper?.querySelector("pre");

          code = pre?.textContent ?? "";
        }

        if (!code) {
          console.error("无法获取代码内容");
          return;
        }

        try {
          await navigator.clipboard.writeText(code);

          const icon = button.querySelector("span");

          if (icon) {
            icon.className = "icon-[mynaui--check-solid]";
          }

          button.classList.add("copied");

          window.setTimeout(() => {
            if (icon) {
              icon.className = "icon-[mynaui--copy-solid]";
            }

            button.classList.remove("copied");
          }, 2000);
        } catch (error) {
          console.error("复制失败:", error);
        }
      };

      button.addEventListener("click", handleClick);

      cleanups.push(() => {
        button.removeEventListener("click", handleClick);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [post.tocItems]);

  /**
   * 监听滚动，更新阅读进度和当前目录高亮。
   * Listens to scrolling and updates reading progress plus the active TOC item.
   */
  useEffect(() => {
    const handleScroll = () => {
      if (!post.tocItems.length || isProgrammaticScrollRef.current) {
        return;
      }

      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const scrollBottom = scrollTop + windowHeight;

      if (articleEndPositionRef.current > 0) {
        const progress = (scrollBottom / articleEndPositionRef.current) * 100;
        const nextProgress = Math.min(100, Math.max(0, progress));

        setScrollProgress((currentProgress) =>
          currentProgress === nextProgress ? currentProgress : nextProgress,
        );
      } else {
        const documentHeight = document.documentElement.scrollHeight;
        const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
        const nextProgress = Math.min(100, Math.max(0, progress));

        setScrollProgress((currentProgress) =>
          currentProgress === nextProgress ? currentProgress : nextProgress,
        );
      }

      const headings = post.tocItems.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      let currentId = "";

      for (let index = headings.length - 1; index >= 0; index -= 1) {
        const heading = headings[index];

        if (!heading?.element) {
          continue;
        }

        const rect = heading.element.getBoundingClientRect();

        if (rect.top <= 150) {
          currentId = heading.id;
          break;
        }
      }

      if (!currentId && headings.length > 0) {
        currentId = headings[0]?.id ?? "";
      }

      updateActiveId(currentId);
    };

    const frameId = window.requestAnimationFrame(handleScroll);

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [post.tocItems, updateActiveId]);

  const handleTocClick = useCallback(
    (id: string) => {
      const element = document.getElementById(id);

      if (!element) {
        return;
      }

      isProgrammaticScrollRef.current = true;

      const top = element.getBoundingClientRect().top + window.scrollY - 100;

      window.scrollTo({
        top,
        behavior: "smooth",
      });

      updateActiveId(id);

      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 150);
    },
    [updateActiveId],
  );

  const displayDate = formatPostDate(
    post.updated_at ?? post.created_at,
    locale,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex gap-8">
        <article className="mx-auto max-w-4xl flex-1 space-y-4">
          <div className="mb-6 text-center">
            <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span className={modulesClassNames.label}>
                <span className="icon-[mynaui--clock-four]" />
                <span>{displayDate}</span>
              </span>

              <span className={modulesClassNames.label}>
                <span className="icon-[mynaui--hash-circle] h-4 w-3" />
                <span>{post.category}</span>
              </span>

              <span className={modulesClassNames.label}>
                <span className="icon-[mynaui--eye]" />
                <span>{post.views}</span>
              </span>
            </div>
          </div>

          <hr className="border-gray-800" />

          <section
            className={styles.markdown}
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />
        </article>

        {post.tocItems.length > 0 && (
          <aside className={styles.toc}>
            <div className={styles.progress}>
              <div
                className={styles["progress-bar"]}
                style={{
                  height: `${scrollProgress}%`,
                }}
              />
            </div>

            <nav className={styles.nav}>
              {post.tocItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    styles.item,
                    styles[`level-${item.level}`],
                    activeId === item.id ? styles.active : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleTocClick(item.id)}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </aside>
        )}
      </div>

      <div className="mt-12 w-full border-t border-gray-800 pt-8 text-center">
        <div className="mb-4 text-sm text-gray-400">
          <p>
            {labels.author}：{siteOwnerName}
          </p>

          <p>
            {labels.link}：
            <a
              href={post.fullUrl}
              className="hover:underline"
              style={{
                color: "rgb(122.77 241.32 167.54)",
              }}
            >
              {post.fullUrl}
            </a>
          </p>
        </div>

        <div className="text-xs leading-relaxed text-gray-500">
          <p>{labels.commercialLicense}</p>

          <p className="mt-2">
            {labels.licenseText}{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{
                color: "rgb(122.77 241.32 167.54)",
              }}
            >
              CC BY-NC-SA 4.0
            </a>{" "}
            - {labels.licenseName}
          </p>
        </div>
      </div>
    </div>
  );
}
