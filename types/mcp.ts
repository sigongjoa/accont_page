export interface Mcp {
  id: string;
  name: string;
  provider: string;
  region?: string | null;
  status?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}