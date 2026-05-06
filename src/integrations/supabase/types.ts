export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          email: string
          created_at: string
          is_verified: boolean
          subscription_tier_id: string | null
        }
        Insert: {
          user_id: string
          email: string
          created_at?: string
          is_verified?: boolean
          subscription_tier_id?: string | null
        }
        Update: {
          user_id?: string
          email?: string
          created_at?: string
          is_verified?: boolean
          subscription_tier_id?: string | null
        }
      }
    }
    Functions: Record<string, unknown>
  }
}
