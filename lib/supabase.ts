import { createClient } from "@supabase/supabase-js"

// Supabase 클라이언트를 초기화합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          date: string
          item: string
          category: string
          amount: number
          payment_method: string
          status: string
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          item: string
          category: string
          amount: number
          payment_method: string
          status: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          item?: string
          category?: string
          amount?: number
          payment_method?: string
          status?: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          service_name: string
          amount: number
          currency: string
          billing_interval: string
          start_date: string
          category: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_name: string
          amount: number
          currency?: string
          billing_interval: string
          start_date: string
          category: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_name?: string
          amount?: number
          currency?: string
          billing_interval?: string
          start_date?: string
          category?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          is_subscribed: boolean
          usage: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          is_subscribed?: boolean
          usage: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          is_subscribed?: boolean
          usage?: string
          created_at?: string
          updated_at?: string
        }
      }
      papers: {
        Row: {
          id: string
          paper_id: string
          external_id: string | null
          platform: string
          title: string
          abstract: string
          authors: any
          categories: any
          pdf_url: string | null
          published_date: string
          updated_date: string
          year: number | null
          references_ids: any
          cited_by_ids: any
          animation_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          paper_id: string
          external_id?: string | null
          platform: string
          title: string
          abstract: string
          authors?: any
          categories?: any
          pdf_url?: string | null
          published_date: string
          updated_date: string
          year?: number | null
          references_ids?: any
          cited_by_ids?: any
          animation_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          paper_id?: string
          external_id?: string | null
          platform?: string
          title?: string
          abstract?: string
          authors?: any
          categories?: any
          pdf_url?: string | null
          published_date?: string
          updated_date?: string
          year?: number | null
          references_ids?: any
          cited_by_ids?: any
          animation_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      repos: {
        Row: {
          id: string
          repo_id: string
          created_at: string
          when_use?: string | null
          env?: string | null
          link?: string | null
        }
        Insert: {
          id?: string
          repo_id: string
          created_at?: string
          when_use?: string | null
          env?: string | null
          link?: string | null
        }
        Update: {
          id?: string
          repo_id?: string
          created_at?: string
          when_use?: string | null
          env?: string | null
          link?: string | null
        }
      }
      services: {
        Row: {
          id: string
          name: string
          category: string
          description: string
          pricing: string
          url: string
          connections?: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description: string
          pricing: string
          url: string
          connections?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string
          pricing?: string
          url?: string
          connections?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_models: {
        Row: {
          id: string
          created_at: string
          desc?: string | null
          link?: string | null
          use?: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          desc?: string | null
          link?: string | null
          use?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          desc?: string | null
          link?: string | null
          use?: string | null
        }
      },
      industry_codes: {
        Row: {
          id: string;
          code_category: string;
          category_name: string;
          code_range: string;
          kpi: string | null;
          progress: string | null;
          link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code_category: string;
          category_name: string;
          code_range: string;
          kpi?: string | null;
          progress?: string | null;
          link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code_category?: string;
          category_name?: string;
          code_range?: string;
          kpi?: string | null;
          progress?: string | null;
          link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      },
      mcp: {
        Row: {
          id: string;
          name: string;
          provider: string;
          region: string | null;
          status: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          provider: string;
          region?: string | null;
          status?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          provider?: string;
          region?: string | null;
          status?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      }
    }
  }
}
