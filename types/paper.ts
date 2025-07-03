export interface Paper {
  id: string;
  paper_id: string;
  external_id: string | null;
  platform: string;
  title: string;
  abstract: string;
  authors: any[]; // jsonb type
  categories: any[]; // jsonb type
  pdf_url: string | null;
  published_date: string;
  updated_date: string;
  year: number | null;
  references_ids: any[]; // jsonb type
  cited_by_ids: any[]; // jsonb type
  animation_url: string | null;
  created_at: string | null;
  updated_at: string | null;
} 