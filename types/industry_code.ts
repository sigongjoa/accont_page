export interface IndustryCode {
  id: string;
  code_category: string;
  category_name: string;
  code_range: string;
  kpi?: string | null;
  progress?: string | null;
  link?: string | null;
  created_at: string;
  updated_at: string;
}