"use client";

import PulsatingDots from "@/components/loading/pulsating-dots";
import type { Post } from "@/data/mock-posts";
import {
  useInfinitePagination,
  useLoadMoreSentinel,
} from "@/hooks/use-infinite-pagination";
import { getPosts } from "@/services/posts";
import Link from "next/link";
import { useCallback } from "react";
import Modules from "./posts.module.scss";

type PostsListClientProps = {
  category?: string;
};

const POSTS_PAGE_SIZE = 15;

function formatPostDate(dateString: number) {
  const date = new Date(dateString);

  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}/${String(date.getDate()).padStart(2, "0")}`;
}

export default function PostsListClient({ category }: PostsListClientProps) {
  const getPage = useCallback(
    (page: number, pageSize: number) => getPosts(page, pageSize, category),
    [category],
  );

  const { items, hasMore, loading, initialLoading, error, loadMore } =
    useInfinitePagination<Post>({
      pageSize: POSTS_PAGE_SIZE,
      getPage,
    });

  const sentinelRef = useLoadMoreSentinel(hasMore && !loading, loadMore);

  return (
    <section className={Modules["posts-section"]}>
      <div className={Modules["posts-list"]}>
        {items.map((post) => {
          const formattedDate = formatPostDate(post.created_at);

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className={Modules["post-card"]}
            >
              <div className="flex w-full flex-col gap-3">
                <h3 className="m-0 text-xl font-bold text-white">
                  {post.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                  <span className={Modules.label}>
                    <span className="icon-[mynaui--clock-four]" />
                    <span>{formattedDate}</span>
                  </span>

                  <span className={Modules.label}>
                    <span className="icon-[mynaui--hash-circle] h-4 w-3" />
                    <span>{post.category}</span>
                  </span>

                  <span className={Modules.label}>
                    <span className="icon-[mynaui--eye]" />
                    <span>{post.views}</span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {!initialLoading && items.length === 0 && (
          <div className={Modules["empty-state"]}>
            {error ? error.message : "No posts found."}
          </div>
        )}

        <div ref={sentinelRef} className={Modules.sentinel} />

        {loading && (
          <div className={Modules.loading}>
            <PulsatingDots />
          </div>
        )}
      </div>
    </section>
  );
}
