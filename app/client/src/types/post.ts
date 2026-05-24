/**
 * 文章记录类型 / Post record type
 */
export type Post = {
  id: number;
  title: string;
  category: string | null;
  storage_path: string;
  views: number;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
};
