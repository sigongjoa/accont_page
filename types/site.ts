export interface Site {
  id: string;
  name: string;
  description: string;
  url: string; // Add URL field
  category: string;
  isSubscribed: boolean;
  usage: string;
  createdAt: string;
  updatedAt: string;
  sub_category?: string | null; // Add new field
  is_review?: boolean | null; // Add new field
  is_benckmark?: boolean | null; // Add new field (Note: Typo in original schema 'benckmark' kept for consistency)
}