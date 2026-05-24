import {
  MOCK_ARTICLE_COMMENTS,
  MOCK_SITE_COMMENTS,
  type Comment,
} from "@/data/mock-comments";
import { MOCK_POSTS } from "@/data/mock-posts";
import type { PaginationResponse } from "@/types/pagination";

export type MockApiResult = {
  status?: number;
  body: unknown;
};

function toPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginationResponse<T> {
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  const hasMore = start + data.length < items.length;

  return {
    data,
    page,
    pageSize,
    total: items.length,
    hasMore,
  };
}

function getPaging(searchParams: URLSearchParams) {
  return {
    page: toPositiveInteger(searchParams.get("page"), 1),
    pageSize: toPositiveInteger(searchParams.get("pageSize"), 10),
  };
}

function getSortedPosts() {
  return MOCK_POSTS.filter((post) => post.deleted_at == null).sort(
    (left, right) => right.created_at - left.created_at,
  );
}

function getPosts(searchParams: URLSearchParams) {
  const { page, pageSize } = getPaging(searchParams);
  const category = searchParams.get("category");
  const posts = getSortedPosts().filter(
    (post) => !category || post.category === category,
  );

  return paginate(posts, page, pageSize);
}

function getPostById(pathname: string) {
  const id = Number(pathname.split("/").at(-1));

  if (!Number.isInteger(id)) {
    return null;
  }

  return (
    MOCK_POSTS.find((post) => post.id === id && post.deleted_at == null) ?? null
  );
}

function getComments(
  comments: Comment[],
  searchParams: URLSearchParams,
  options?: {
    requirePostId?: boolean;
  },
) {
  const { page, pageSize } = getPaging(searchParams);
  const postId = Number(searchParams.get("postId"));
  const parentIdValue = searchParams.get("parentId");
  const parentId = parentIdValue == null ? null : Number(parentIdValue);

  const filteredComments = comments
    .filter((comment) => comment.deleted_at == null)
    .filter((comment) => {
      if (options?.requirePostId && comment.post_id !== postId) {
        return false;
      }

      return comment.parent_id === parentId;
    })
    .sort((left, right) => left.floor - right.floor);

  return paginate(filteredComments, page, pageSize);
}

export function resolveMockApi(url: URL): MockApiResult {
  const { pathname, searchParams } = url;

  if (pathname === "/mock/posts" || pathname === "/mock/posts/timeline") {
    return {
      body: getPosts(searchParams),
    };
  }

  if (pathname.startsWith("/mock/posts/")) {
    return {
      body: getPostById(pathname),
    };
  }

  if (pathname === "/mock/comments/site") {
    return {
      body: getComments(MOCK_SITE_COMMENTS, searchParams),
    };
  }

  if (pathname === "/mock/comments/article") {
    return {
      body: getComments(MOCK_ARTICLE_COMMENTS, searchParams, {
        requirePostId: true,
      }),
    };
  }

  return {
    status: 404,
    body: {
      message: `Mock endpoint not found: ${pathname}`,
    },
  };
}
