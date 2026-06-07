/**
 * 分页响应数据结构 / Paginated response shape
 */
export type PaginationResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
