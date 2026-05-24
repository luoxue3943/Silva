import {
  MOCK_ARTICLE_COMMENTS,
  MOCK_SITE_COMMENTS,
  type Comment,
} from "@/data/mock-comments";
import { MOCK_POSTS } from "@/data/mock-posts";
import type { PaginationResponse } from "@/types/pagination";

/**
 * 本地 mock API 路由器 / Local mock API router
 *
 * 将 mock URL 映射到内存文章与评论数据，供 alova 适配器调用。
 * Maps mock URLs to in-memory post and comment data for the alova adapter.
 */

export type MockApiResult = {
  status?: number;
  body: unknown;
};

/**
 * 将查询参数解析为正整数 / Parses query parameters into positive integers.
 */
function toPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

/**
 * 对数组执行分页切片 / Applies pagination slicing to an array.
 */
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

/**
 * 从 URL 查询参数读取分页设置 / Reads pagination settings from URL search params.
 */
function getPaging(searchParams: URLSearchParams) {
  return {
    page: toPositiveInteger(searchParams.get("page"), 1),
    pageSize: toPositiveInteger(searchParams.get("pageSize"), 10),
  };
}

/**
 * 获取按创建时间倒序排列的有效文章 / Gets active posts sorted by creation time descending.
 */
function getSortedPosts() {
  return MOCK_POSTS.filter((post) => post.deleted_at == null).sort(
    (left, right) => right.created_at - left.created_at,
  );
}

/**
 * 按分类筛选并分页文章列表 / Filters posts by category and paginates the result.
 */
function getPosts(searchParams: URLSearchParams) {
  const { page, pageSize } = getPaging(searchParams);
  const category = searchParams.get("category");
  const posts = getSortedPosts().filter(
    (post) => !category || post.category === category,
  );

  return paginate(posts, page, pageSize);
}

/**
 * 从 mock 路径中解析文章详情 / Resolves a post detail from the mock pathname.
 */
function getPostById(pathname: string) {
  const id = Number(pathname.split("/").at(-1));

  if (!Number.isInteger(id)) {
    return null;
  }

  return (
    MOCK_POSTS.find((post) => post.id === id && post.deleted_at == null) ?? null
  );
}

/**
 * 按父级和文章范围筛选评论并分页 / Filters comments by parent and post scope before pagination.
 */
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

  // 文章列表和时间线共享同一分页数据源 / Post list and timeline share the same paginated source.
  if (pathname === "/mock/posts" || pathname === "/mock/posts/timeline") {
    return {
      body: getPosts(searchParams),
    };
  }

  // 文章详情通过路径末尾 ID 查询 / Post detail is looked up by the trailing path ID.
  if (pathname.startsWith("/mock/posts/")) {
    return {
      body: getPostById(pathname),
    };
  }

  // 站点留言不要求 postId / Site-level comments do not require a postId.
  if (pathname === "/mock/comments/site") {
    return {
      body: getComments(MOCK_SITE_COMMENTS, searchParams),
    };
  }

  // 文章评论必须匹配 postId / Article comments must match the postId.
  if (pathname === "/mock/comments/article") {
    return {
      body: getComments(MOCK_ARTICLE_COMMENTS, searchParams, {
        requirePostId: true,
      }),
    };
  }

  // 未声明的 mock 路径返回 404 / Undeclared mock paths return 404.
  return {
    status: 404,
    body: {
      message: `Mock endpoint not found: ${pathname}`,
    },
  };
}
