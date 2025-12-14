import { MOCK_POSTS } from "@/data/mock-posts";
import * as m from "@/paraglide/messages";
import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import styles from "./timeline.module.scss";

/**
 * 按年份分组的文章类型 / Posts grouped by year type
 */
interface PostsByYear {
  year: string;
  posts: Array<{
    id: string;
    title: string;
    date: string;
    category: string;
    monthDay: string;
  }>;
}

/**
 * 服务器端 loader：获取并按年份分组文章 / Server-side loader: Fetch and group posts by year
 */
export const useTimelinePosts = routeLoader$(() => {
  // 按年份分组文章 / Group posts by year
  const postsByYear: Record<string, PostsByYear["posts"]> = {};

  MOCK_POSTS.forEach((post) => {
    // 解析日期格式 (2025/12/14 或 2024/02/20) / Parse date format
    const dateParts = post.date.split("/");
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const monthDay = `${month}-${day}`;

    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }

    postsByYear[year].push({
      id: post.id,
      title: post.title,
      date: post.date,
      category: post.category,
      monthDay,
    });
  });

  // 转换为数组并按年份降序排序 / Convert to array and sort by year descending
  const groupedPosts: PostsByYear[] = Object.entries(postsByYear)
    .map(([year, posts]) => ({
      year,
      posts: posts.sort((a, b) => b.date.localeCompare(a.date)), // 按日期降序 / Sort by date descending
    }))
    .sort((a, b) => parseInt(b.year) - parseInt(a.year)); // 按年份降序 / Sort by year descending

  return {
    groupedPosts,
    totalCount: MOCK_POSTS.length,
  };
});

export default component$(() => {
  const data = useTimelinePosts();

  return (
    <section class={styles.timeline}>
      {/* 顶部标题区域 / Header section */}
      <div class={styles.header}>
        <h1 class={styles.title}>{m["Timeline.title"]()}</h1>
        <p class={styles.subtitle}>
          {m["Timeline.totalPosts"]({
            count: data.value.totalCount.toString(),
          })}
        </p>
      </div>

      {/* 时间线列表 / Timeline list */}
      <div class={styles.list}>
        {data.value.groupedPosts.map((yearGroup) => (
          <div key={yearGroup.year} class={styles["year-group"]}>
            {/* 年份标题 / Year header */}
            <div class={styles["year-header"]}>
              <h2 class={styles["year-title"]}>{yearGroup.year}</h2>
              <span class={styles["year-count"]}>
                {m["Timeline.postsCount"]({
                  count: yearGroup.posts.length.toString(),
                })}
              </span>
            </div>

            {/* 文章列表 / Posts list */}
            <div
              class={`${styles["posts-list"]} ${yearGroup.posts.length > 1 ? styles["has-line"] : ""}`}
            >
              {yearGroup.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  class={styles["post-item"]}
                >
                  <div class={styles["post-dot"]} />
                  <div class={styles["post-content"]}>
                    <span class={styles["post-date"]}>{post.monthDay}</span>
                    <span class={styles["post-title"]}>{post.title}</span>
                    <span class={styles["post-category"]}>
                      {typeof m[
                        `Categories.${post.category}` as keyof typeof m
                      ] === "function"
                        ? (
                            m[
                              `Categories.${post.category}` as keyof typeof m
                            ] as () => string
                          )()
                        : post.category}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
