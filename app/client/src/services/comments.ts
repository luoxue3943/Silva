import { silvaAlova } from "@/lib/alova";
import type { Comment } from "@/types/comment";
import type { PaginationResponse } from "@/types/pagination";

/**
 * 评论数据服务 / Comment data service.
 *
 * 封装站点留言和文章评论的分页查询与提交请求。
 * Wraps paginated queries and submit requests for site and article comments.
 */
export const SITE_COMMENTS_URL = "/comments/site";
export const ARTICLE_COMMENTS_URL = "/comments/article";

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

type CreateCommentParams = {
  author: string;
  email: string;
  content: string;
  parentId?: number;
};

type CreateArticleCommentParams = CreateCommentParams & {
  postId: number;
};

/**
 * 获取站点留言分页数据 / Fetches paginated site-level comments.
 */
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

/**
 * 获取文章评论分页数据 / Fetches paginated article comments.
 */
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

/**
 * 提交站点留言 / Submits a site-level comment.
 */
export function createSiteComment(data: CreateCommentParams) {
  return silvaAlova.Post<Comment>(SITE_COMMENTS_URL, data);
}

/**
 * 提交文章评论或回复 / Submits an article comment or reply.
 */
export function createArticleComment(data: CreateArticleCommentParams) {
  return silvaAlova.Post<Comment>(ARTICLE_COMMENTS_URL, data);
}

/**
 * 评论分页大小常量 / Comment pagination size constants.
 */
export const COMMENT_PAGE_SIZE = ROOT_COMMENT_PAGE_SIZE;
export const COMMENT_REPLY_PAGE_SIZE = REPLY_PAGE_SIZE;
