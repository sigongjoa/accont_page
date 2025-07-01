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
    }
  }
}
