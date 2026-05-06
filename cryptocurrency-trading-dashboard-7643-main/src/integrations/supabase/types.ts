export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_features: {
        Row: {
          ai_feature_id: string
          description: string | null
          endpoint_url: string
          feature_name: string
          feature_type: string
        }
        Insert: {
          ai_feature_id: string
          description?: string | null
          endpoint_url: string
          feature_name: string
          feature_type: string
        }
        Update: {
          ai_feature_id?: string
          description?: string | null
          endpoint_url?: string
          feature_name?: string
          feature_type?: string
        }
        Relationships: []
      }
      event_meta: {
        Row: {
          event_id: string
          id: number
          key: string
          value: string
        }
        Insert: {
          event_id: string
          id?: number
          key: string
          value: string
        }
        Update: {
          event_id?: string
          id?: number
          key?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_meta_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_source_map: {
        Row: {
          event_id: string
          id: number
          source_id: number
        }
        Insert: {
          event_id: string
          id?: number
          source_id: number
        }
        Update: {
          event_id?: string
          id?: number
          source_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_source_map_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_source_map_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "event_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sources: {
        Row: {
          base_url: string | null
          id: number
          name: string
          reliability: number | null
        }
        Insert: {
          base_url?: string | null
          id?: number
          name: string
          reliability?: number | null
        }
        Update: {
          base_url?: string | null
          id?: number
          name?: string
          reliability?: number | null
        }
        Relationships: []
      }
      event_subscriptions: {
        Row: {
          channels: string[]
          created_at: string
          event_id: string
          id: string
          lead_times: number[]
          user_id: string
        }
        Insert: {
          channels?: string[]
          created_at?: string
          event_id: string
          id?: string
          lead_times?: number[]
          user_id: string
        }
        Update: {
          channels?: string[]
          created_at?: string
          event_id?: string
          id?: string
          lead_times?: number[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_subscriptions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          coins: string[] | null
          country: string | null
          created_at: string
          description: string | null
          end_ts_utc: string | null
          id: string
          impact: Database["public"]["Enums"]["impact_level"] | null
          last_checked_at: string | null
          location: string | null
          notes: string | null
          slug: string
          source_checksum: string | null
          source_url: string | null
          start_ts_utc: string
          status: Database["public"]["Enums"]["event_status"] | null
          symbols: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["event_category"]
          coins?: string[] | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_ts_utc?: string | null
          id?: string
          impact?: Database["public"]["Enums"]["impact_level"] | null
          last_checked_at?: string | null
          location?: string | null
          notes?: string | null
          slug: string
          source_checksum?: string | null
          source_url?: string | null
          start_ts_utc: string
          status?: Database["public"]["Enums"]["event_status"] | null
          symbols?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          coins?: string[] | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_ts_utc?: string | null
          id?: string
          impact?: Database["public"]["Enums"]["impact_level"] | null
          last_checked_at?: string | null
          location?: string | null
          notes?: string | null
          slug?: string
          source_checksum?: string | null
          source_url?: string | null
          start_ts_utc?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          symbols?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_access: {
        Row: {
          access_level: string
          created_at: string
          expires_at: string | null
          feature_name: string
          id: string
          user_id: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          expires_at?: string | null
          feature_name: string
          id?: string
          user_id: string
        }
        Update: {
          access_level?: string
          created_at?: string
          expires_at?: string | null
          feature_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          category: Database["public"]["Enums"]["event_category"] | null
          coin: string | null
          country: string | null
          created_at: string
          id: string
          impact: Database["public"]["Enums"]["impact_level"] | null
          symbol: string | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["event_category"] | null
          coin?: string | null
          country?: string | null
          created_at?: string
          id?: string
          impact?: Database["public"]["Enums"]["impact_level"] | null
          symbol?: string | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"] | null
          coin?: string | null
          country?: string | null
          created_at?: string
          id?: string
          impact?: Database["public"]["Enums"]["impact_level"] | null
          symbol?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          is_read: boolean | null
          message: string | null
          notification_id: string
          notification_type: string
          sent_at: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          is_read?: boolean | null
          message?: string | null
          notification_id: string
          notification_type: string
          sent_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          is_read?: boolean | null
          message?: string | null
          notification_id?: string
          notification_type?: string
          sent_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          added_at: string | null
          method_type: string
          payment_method_id: string
          provider: string
          tokenized_details: string
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          method_type: string
          payment_method_id: string
          provider: string
          tokenized_details: string
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          method_type?: string
          payment_method_id?: string
          provider?: string
          tokenized_details?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      roles: {
        Row: {
          role_name: string
        }
        Insert: {
          role_name: string
        }
        Update: {
          role_name?: string
        }
        Relationships: []
      }
      subscription_features: {
        Row: {
          description: string | null
          feature_id: string
          feature_name: string
        }
        Insert: {
          description?: string | null
          feature_id: string
          feature_name: string
        }
        Update: {
          description?: string | null
          feature_id?: string
          feature_name?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          name: string
          price_monthly: number
          price_yearly: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_monthly?: number
          price_yearly?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number
          price_yearly?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string | null
          description: string | null
          monthly_price: number
          tier_id: string
          tier_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          monthly_price: number
          tier_id: string
          tier_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          monthly_price?: number
          tier_id?: string
          tier_name?: string
        }
        Relationships: []
      }
      tier_feature_map: {
        Row: {
          feature_id: string
          tier_id: string
        }
        Insert: {
          feature_id: string
          tier_id: string
        }
        Update: {
          feature_id?: string
          tier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tier_feature_map_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "subscription_features"
            referencedColumns: ["feature_id"]
          },
          {
            foreignKeyName: "tier_feature_map_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["tier_id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          payment_provider: string | null
          status: string
          transaction_id: string
          transaction_reference: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          payment_provider?: string | null
          status: string
          transaction_id: string
          transaction_reference?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          payment_provider?: string | null
          status?: string
          transaction_id?: string
          transaction_reference?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_ai_access: {
        Row: {
          access_granted: boolean | null
          ai_feature_id: string
          granted_at: string | null
          user_id: string
        }
        Insert: {
          access_granted?: boolean | null
          ai_feature_id: string
          granted_at?: string | null
          user_id: string
        }
        Update: {
          access_granted?: boolean | null
          ai_feature_id?: string
          granted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ai_access_ai_feature_id_fkey"
            columns: ["ai_feature_id"]
            isOneToOne: false
            referencedRelation: "ai_features"
            referencedColumns: ["ai_feature_id"]
          },
          {
            foreignKeyName: "user_ai_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          role_name: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          role_name: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          role_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_name_fkey"
            columns: ["role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verifications: {
        Row: {
          document_url: string
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
          user_id: string | null
          verification_id: string
          verification_type: string
        }
        Insert: {
          document_url: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
          verification_id: string
          verification_type: string
        }
        Update: {
          document_url?: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
          verification_id?: string
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          is_verified: boolean | null
          password_hash: string | null
          sign_in_method: string
          subscription_tier_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          is_verified?: boolean | null
          password_hash?: string | null
          sign_in_method: string
          subscription_tier_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          is_verified?: boolean | null
          password_hash?: string | null
          sign_in_method?: string
          subscription_tier_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_subscription_tier_id_fkey"
            columns: ["subscription_tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["tier_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: { role_name: string; user_id: string }
        Returns: undefined
      }
      get_user_subscription_level: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          is_verified: boolean
          roles: string[]
          subscription_tier_id: string
          user_id: string
        }[]
      }
      has_feature_access: {
        Args: { feature: string; user_uuid: string }
        Returns: boolean
      }
      remove_user_role: {
        Args: { role_name: string; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      event_category: "macro" | "crypto" | "earnings" | "other"
      event_status:
        | "scheduled"
        | "tentative"
        | "postponed"
        | "canceled"
        | "complete"
      impact_level: "low" | "medium" | "high"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_category: ["macro", "crypto", "earnings", "other"],
      event_status: [
        "scheduled",
        "tentative",
        "postponed",
        "canceled",
        "complete",
      ],
      impact_level: ["low", "medium", "high"],
    },
  },
} as const
