"use client";

import type { AlovaGenerics, Method } from "alova";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationResponse } from "@/types/pagination";

/**
 * 无限分页 Hook / Infinite pagination hook
 *
 * 统一处理分页状态、并发请求保护、错误状态和触底加载。 / Centralize pagination state, concurrent-request guards, errors, and load-more triggers
 */

type UseInfinitePaginationOptions<T> = {
  pageSize: number;
  getPage: (
    page: number,
    pageSize: number,
  ) => Method<AlovaGenerics<PaginationResponse<T>>>;
  enabled?: boolean;
};

/**
 * 管理分页加载状态 / Manage paginated loading state
 */
export function useInfinitePagination<T>({
  pageSize,
  getPage,
  enabled = true,
}: UseInfinitePaginationOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const requestIdRef = useRef(0);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const loadPage = useCallback(
    async (nextPage: number, replace = false) => {
      // 禁用状态或已有请求进行中时跳过 / Skip when disabled or when a request is already running
      if (!enabled || loadingRef.current) {
        return;
      }

      // 追加加载时没有更多数据则跳过 / Skip append loading when no more data exists
      if (!replace && !hasMoreRef.current) {
        return;
      }

      const requestId = requestIdRef.current + 1;

      requestIdRef.current = requestId;
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await getPage(nextPage, pageSize).send(true);

        // 丢弃过期请求结果 / Discard stale request results
        if (requestId !== requestIdRef.current) {
          return;
        }

        const nextHasMore =
          response.hasMore && response.data.length >= response.pageSize;

        setItems((currentItems) =>
          replace ? response.data : [...currentItems, ...response.data],
        );
        setPage(response.page);
        setTotal(response.total);
        setHasMore(nextHasMore);
        setInitialLoaded(true);
      } catch (caughtError) {
        if (requestId === requestIdRef.current) {
          setError(
            caughtError instanceof Error
              ? caughtError
              : new Error("Pagination request failed"),
          );
          setHasMore(false);
          setInitialLoaded(true);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    },
    [enabled, getPage, pageSize],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // getPage 或 enabled 变化时重置第一页 / Reset to the first page when getPage or enabled changes
    loadingRef.current = false;
    hasMoreRef.current = true;
    pageRef.current = 0;

    const timeoutId = globalThis.setTimeout(() => {
      void loadPage(1, true);
    }, 0);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [enabled, loadPage]);

  const loadMore = useCallback(() => {
    if (!enabled || loadingRef.current || !hasMoreRef.current) {
      return;
    }

    void loadPage(pageRef.current + 1, false);
  }, [enabled, loadPage]);

  const reload = useCallback(() => {
    if (!enabled) {
      return;
    }

    loadingRef.current = false;
    hasMoreRef.current = true;
    pageRef.current = 0;

    setItems([]);
    setPage(0);
    setTotal(null);
    setHasMore(true);
    setInitialLoaded(false);

    void loadPage(1, true);
  }, [enabled, loadPage]);

  return {
    items,
    page,
    total,
    hasMore,
    loading,
    initialLoading: loading && !initialLoaded,
    loadingMore: loading && initialLoaded,
    error,
    loadMore,
    reload,
  };
}

/**
 * 创建触底加载哨兵引用 / Create an intersection sentinel ref for load-more behavior
 */
export function useLoadMoreSentinel(
  canLoadMore: boolean,
  onLoadMore: () => void,
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !canLoadMore) {
      return;
    }

    // 提前 240px 触发，降低滚动到底部时的等待感 / Trigger 240px early to reduce perceived waiting at the bottom
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: "240px 0px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [canLoadMore, onLoadMore]);

  return sentinelRef;
}
