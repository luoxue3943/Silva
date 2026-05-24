import type { Comment } from "@/data/mock-comments";
import { silvaAlova } from "@/lib/alova";
import type { PaginationResponse } from "@/types/pagination";

export const SITE_COMMENTS_URL = "/mock/comments/site";
export const ARTICLE_COMMENTS_URL = "/mock/comments/article";

const ROOT_COMMENT_PAGE_SIZE = 10;
const REPLY_PAGE_SIZE = 5;

type CommentsParams = {
  page: number;
  pageSize?: number;
  parentId?: number;
};

type ArticleCommentsParams = CommentsParams & {
  postId: number;
};

export function getSiteComments({
  page,
  pageSize = ROOT_COMMENT_PAGE_SIZE,
  parentId,
}: CommentsParams) {
  return silvaAlova.Get<PaginationResponse<Comment>>(SITE_COMMENTS_URL, {
    params: {
      page,
      pageSize,
      parentId,
    },
  });
}

export function getArticleComments({
  postId,
  page,
  pageSize = ROOT_COMMENT_PAGE_SIZE,
  parentId,
}: ArticleCommentsParams) {
  return silvaAlova.Get<PaginationResponse<Comment>>(ARTICLE_COMMENTS_URL, {
    params: {
      postId,
      page,
      pageSize,
      parentId,
    },
  });
}

export const COMMENT_PAGE_SIZE = ROOT_COMMENT_PAGE_SIZE;
export const COMMENT_REPLY_PAGE_SIZE = REPLY_PAGE_SIZE;
