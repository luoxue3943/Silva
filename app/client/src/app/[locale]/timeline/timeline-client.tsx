"use client";

/**
 * 时间线客户端组件 / Timeline client component
 *
 * 按年份分组分页文章，并渲染带加载哨兵的时间线列表。 / Group paginated posts by year and render the timeline with a load-more sentinel
 */

import PulsatingDots from "@/components/loading/pulsating-dots";
import {
  useInfinitePagination,
  useLoadMoreSentinel,
} from "@/hooks/use-infinite-pagination";
import { getTimelinePosts } from "@/services/posts";
import type { Post } from "@/types/post";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import styles from "./timeline.module.scss";
import TimelineProgressClient from "./timeline-progress-client";

const TIMELINE_PAGE_SIZE = 15;

interface PostsByYear {
  year: string;
  posts: Array<{
    id: number;
    title: string;
    date: string;
    category: string | null;
    monthDay: string;
  }>;
}

/**
 * 按年份整理文章列表 / Group posts by year
 */
function groupPostsByYear(posts: Post[]) {
  const postsByYear: Record<string, PostsByYear["posts"]> = {};

  posts.forEach((post) => {
    const date = new Date(post.created_at);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    postsByYear[year] ??= [];

    postsByYear[year].push({
      id: post.id,
      title: post.title,
      date: `${year}/${month}/${day}`,
      category: post.category,
      monthDay: `${month}-${day}`,
    });
  });

  return Object.entries(postsByYear)
    .map(([year, yearPosts]) => ({
      year,
      posts: yearPosts.sort((left, right) =>
        right.date.localeCompare(left.date),
      ),
    }))
    .sort((left, right) => Number(right.year) - Number(left.year));
}

/**
 * 获取分类展示名称 / Get the display label for a category
 */
function getCategoryLabel(
  category: string | null,
  translateCategory: (key: string) => string,
) {
  if (!category) {
    return "";
  }

  try {
    return translateCategory(category);
  } catch {
    return category;
  }
}

export default function TimelineClient() {
  const t = useTranslations("Timeline");
  const tCategory = useTranslations("Categories");

  // 时间线始终请求所有分类文章 / Timeline always requests posts across all categories
  const getPage = useCallback(
    (page: number, pageSize: number) => getTimelinePosts(page, pageSize),
    [],
  );

  const { items, total, hasMore, loading, loadMore } =
    useInfinitePagination<Post>({
      pageSize: TIMELINE_PAGE_SIZE,
      getPage,
    });

  // 哨兵进入视口时追加下一页 / Append the next page when the sentinel enters the viewport
  const sentinelRef = useLoadMoreSentinel(hasMore && !loading, loadMore);

  // 已加载文章按年份重新分组 / Regroup loaded posts by year
  const groupedPosts = useMemo(() => groupPostsByYear(items), [items]);

  return (
    <section className={styles.timeline}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>

        <p className={styles.subtitle}>
          {t("totalPosts", {
            count: String(total ?? 0),
          })}
        </p>

        <TimelineProgressClient />

        <p className="mt-5 text-sm text-gray-500">{t("motto")}</p>
      </div>

      <div className={styles.list}>
        {groupedPosts.map((yearGroup) => (
          <div key={yearGroup.year} className={styles["year-group"]}>
            <div className={styles["year-header"]}>
              <h2 className={styles["year-title"]}>{yearGroup.year}</h2>

              <span className={styles["year-count"]}>
                {t("postsCount", {
                  count: yearGroup.posts.length.toString(),
                })}
              </span>
            </div>

            <div
              className={`${styles["posts-list"]} ${
                yearGroup.posts.length > 1 ? styles["has-line"] : ""
              }`}
            >
              {yearGroup.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className={styles["post-item"]}
                >
                  <div className={styles["post-dot"]} />

                  <div className={styles["post-content"]}>
                    <span className={styles["post-date"]}>{post.monthDay}</span>

                    <span className={styles["post-title"]}>{post.title}</span>

                    {post.category && (
                      <span className={styles["post-category"]}>
                        {getCategoryLabel(post.category, tCategory)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div ref={sentinelRef} className={styles.sentinel} />

        {loading && (
          <div className={styles.loading}>
            <PulsatingDots />
          </div>
        )}
      </div>
    </section>
  );
}
