import { silvaAlova } from "@/lib/alova";
import type { Post } from "@/data/mock-posts";
import type { PaginationResponse } from "@/types/pagination";

/**
 * 文章数据服务 / Post data service
 *
 * 封装文章列表、时间线列表和文章详情的 mock API 请求。
 * Wraps mock API requests for post lists, timeline lists, and post details.
 */

const POSTS_PAGE_SIZE = 15;

/**
 * 获取分页文章列表 / Fetches a paginated post list.
 */
export function getPosts(
  page: number,
  pageSize = POSTS_PAGE_SIZE,
  category?: string,
) {
  return silvaAlova.Get<PaginationResponse<Post>>("/mock/posts", {
    params: {
      page,
      pageSize,
      category,
    },
  });
}

/**
 * 获取时间线分页文章列表 / Fetches paginated posts for the timeline.
 */
export function getTimelinePosts(page: number, pageSize = POSTS_PAGE_SIZE) {
  return silvaAlova.Get<PaginationResponse<Post>>("/mock/posts/timeline", {
    params: {
      page,
      pageSize,
    },
  });
}

/**
 * 获取单篇文章详情 / Fetches one post by ID.
 */
export function getPostById(id: number) {
  return silvaAlova.Get<Post | null>(`/mock/posts/${id}`);
}
