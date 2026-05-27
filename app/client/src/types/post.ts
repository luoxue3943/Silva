/**
 * 文章记录类型 / Post record type
 */
export type Post = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  cover_image: string | null;
  keywords: string[];
  category: string | null;
  storage_path: string;
  views: number;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
};
