import { MOCK_POSTS } from "@/data/mock-posts";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import styles from "./timeline.module.scss";
import TimelineProgressClient from "./timeline-progress-client";

export const dynamic = "force-dynamic";

/**
 * 按年份分组的文章类型 / Posts grouped by year type
 */
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
 * 获取并按年份分组文章 / Fetch and group posts by year
 */
function getTimelinePosts() {
  const postsByYear: Record<string, PostsByYear["posts"]> = {};

  MOCK_POSTS.forEach((post) => {
    const date = new Date(post.created_at);

    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const monthDay = `${month}-${day}`;
    const dateString = `${year}/${month}/${day}`;

    postsByYear[year] ??= [];

    postsByYear[year].push({
      id: post.id,
      title: post.title,
      date: dateString,
      category: post.category,
      monthDay,
    });
  });

  const groupedPosts: PostsByYear[] = Object.entries(postsByYear)
    .map(([year, posts]) => ({
      year,
      posts: posts.sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => Number.parseInt(b.year) - Number.parseInt(a.year));

  return {
    groupedPosts,
    totalCount: MOCK_POSTS.length,
  };
}

/**
 * 计算今年进度和今天进度 / Calculate year and day progress
 */
function getTimeProgress() {
  const now = new Date();

  const year = now.getFullYear();

  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  const yearElapsed = now.getTime() - startOfYear.getTime();
  const yearTotal = startOfNextYear.getTime() - startOfYear.getTime();

  const dayElapsed = now.getTime() - startOfToday.getTime();
  const dayTotal = startOfTomorrow.getTime() - startOfToday.getTime();

  const dayOfYear =
    Math.floor((startOfToday.getTime() - startOfYear.getTime()) / 86_400_000) +
    1;

  const yearPercentage = ((yearElapsed / yearTotal) * 100).toFixed(2);
  const dayPercentage = ((dayElapsed / dayTotal) * 100).toFixed(2);

  return {
    year,
    dayOfYear,
    yearPercentage,
    dayPercentage,
  };
}

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

export default async function TimelinePage() {
  const t = await getTranslations("Timeline");
  const tCategory = await getTranslations("Categories");

  const data = getTimelinePosts();

  return (
    <section className={styles.timeline}>
      {/* 顶部标题区域 / Header section */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>

        <p className={styles.subtitle}>
          {t("totalPosts", {
            count: data.totalCount.toString(),
          })}
        </p>

        <TimelineProgressClient />

        <p className="mt-5 text-sm text-gray-500">{t("motto")}</p>
      </div>

      {/* 时间线列表 / Timeline list */}
      <div className={styles.list}>
        {data.groupedPosts.map((yearGroup) => (
          <div key={yearGroup.year} className={styles["year-group"]}>
            {/* 年份标题 / Year header */}
            <div className={styles["year-header"]}>
              <h2 className={styles["year-title"]}>{yearGroup.year}</h2>

              <span className={styles["year-count"]}>
                {t("postsCount", {
                  count: yearGroup.posts.length.toString(),
                })}
              </span>
            </div>

            {/* 文章列表 / Posts list */}
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
      </div>
    </section>
  );
}
