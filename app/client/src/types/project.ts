export type Project = {
  id: number;
  name: string;
  summary: string;
  link: string;
  sort_order: number;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
};
