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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          project_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          project_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ngo_members: {
        Row: {
          ngo_id: string
          role: Database["public"]["Enums"]["ngo_member_role"]
          user_id: string
        }
        Insert: {
          ngo_id: string
          role?: Database["public"]["Enums"]["ngo_member_role"]
          user_id: string
        }
        Update: {
          ngo_id?: string
          role?: Database["public"]["Enums"]["ngo_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ngo_members_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ngo_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ngos: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      project_interests: {
        Row: {
          created_at: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_interests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_ngos: {
        Row: {
          is_lead: boolean
          ngo_id: string
          project_id: string
        }
        Insert: {
          is_lead?: boolean
          ngo_id: string
          project_id: string
        }
        Update: {
          is_lead?: boolean
          ngo_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_ngos_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_ngos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: Database["public"]["Enums"]["project_category"]
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
        }
        Insert: {
          category: Database["public"]["Enums"]["project_category"]
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
        }
        Update: {
          category?: Database["public"]["Enums"]["project_category"]
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_ngo_member: {
        Args: {
          _email: string
          _ngo_id: string
          _role?: Database["public"]["Enums"]["ngo_member_role"]
        }
        Returns: boolean
      }
      can_view_profile: { Args: { _user_id: string }; Returns: boolean }
      create_project: {
        Args: {
          _category: Database["public"]["Enums"]["project_category"]
          _description?: string
          _end_date?: string
          _latitude?: number
          _longitude?: number
          _name: string
          _ngo_id: string
          _start_date?: string
          _status?: Database["public"]["Enums"]["project_status"]
        }
        Returns: string
      }
      get_interest_counts: {
        Args: never
        Returns: {
          interest_count: number
          project_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_lead_admin: { Args: { _project_id: string }; Returns: boolean }
      is_ngo_admin: { Args: { _ngo_id: string }; Returns: boolean }
      is_ngo_member: { Args: { _ngo_id: string }; Returns: boolean }
      is_project_admin: { Args: { _project_id: string }; Returns: boolean }
      is_project_member: { Args: { _project_id: string }; Returns: boolean }
      set_user_role: {
        Args: {
          _email: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      ngo_member_role: "ngo_admin" | "member"
      project_category:
        | "infrastructure_engineering"
        | "health_relief_welfare"
        | "education_kids_youth"
        | "economic_development_empowerment"
        | "human_rights_data"
      project_status: "in_planning" | "running" | "done" | "canceled"
      user_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      ngo_member_role: ["ngo_admin", "member"],
      project_category: [
        "infrastructure_engineering",
        "health_relief_welfare",
        "education_kids_youth",
        "economic_development_empowerment",
        "human_rights_data",
      ],
      project_status: ["in_planning", "running", "done", "canceled"],
      user_role: ["admin", "user"],
    },
  },
} as const
