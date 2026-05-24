"use client";

import type { AlovaGenerics, Method } from "alova";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationResponse } from "@/types/pagination";

type UseInfinitePaginationOptions<T> = {
  pageSize: number;
  getPage: (
    page: number,
    pageSize: number,
  ) => Method<AlovaGenerics<PaginationResponse<T>>>;
  enabled?: boolean;
};

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
      if (!enabled || loadingRef.current) {
        return;
      }

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
  };
}

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
