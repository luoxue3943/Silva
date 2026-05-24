/**
 * 评论记录类型 / Comment record type
 */
export type Comment = {
  id: number;
  post_id: number;
  parent_id: number | null;
  author: string;
  floor: number;
  email: string;
  content: string;
  location: string;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
};
