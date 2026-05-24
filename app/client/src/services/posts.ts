import { silvaAlova } from "@/lib/alova";
import type { Post } from "@/data/mock-posts";
import type { PaginationResponse } from "@/types/pagination";

const POSTS_PAGE_SIZE = 15;

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

export function getTimelinePosts(page: number, pageSize = POSTS_PAGE_SIZE) {
  return silvaAlova.Get<PaginationResponse<Post>>("/mock/posts/timeline", {
    params: {
      page,
      pageSize,
    },
  });
}

export function getPostById(id: number) {
  return silvaAlova.Get<Post | null>(`/mock/posts/${id}`);
}
