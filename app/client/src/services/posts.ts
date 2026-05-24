import { silvaAlova } from "@/lib/alova";
import type { PaginationResponse } from "@/types/pagination";
import type { Post } from "@/types/post";

/**
 * 文章数据服务 / Post data service.
 *
 * 封装文章列表、时间线列表和文章详情的后端请求。
 * Wraps backend requests for post lists, timeline lists, and post details.
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
  return silvaAlova.Get<PaginationResponse<Post>>("/posts", {
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
  return silvaAlova.Get<PaginationResponse<Post>>("/posts/timeline", {
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
  return silvaAlova.Get<Post | null>(`/posts/${id}`);
}
