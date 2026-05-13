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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      menopause_dashboard_state: {
        Row: {
          user_id: string
          date: string
          mood: string | null
          checked_actions: string[] | null
        }
        Insert: {
          user_id: string
          date?: string
          mood?: string | null
          checked_actions?: string[] | null
        }
        Update: {
          user_id?: string
          date?: string
          mood?: string | null
          checked_actions?: string[] | null
        }
        Relationships: []
      }
      menopause_cooling_plans: {
        Row: {
          user_id: string
          date: string
          symptom_focus: string | null
          time_of_day: string | null
          bothers: string[] | null
          support_style: string | null
          plan_items: string[] | null
          completed_items: string[] | null
        }
        Insert: {
          user_id: string
          date: string
          symptom_focus?: string | null
          time_of_day?: string | null
          bothers?: string[] | null
          support_style?: string | null
          plan_items?: string[] | null
          completed_items?: string[] | null
        }
        Update: {
          user_id?: string
          date?: string
          symptom_focus?: string | null
          time_of_day?: string | null
          bothers?: string[] | null
          support_style?: string | null
          plan_items?: string[] | null
          completed_items?: string[] | null
        }
        Relationships: []
      }
      menopause_calm_routines: {
        Row: {
          id: string
          user_id: string | null
          mood_state: string | null
          duration_minutes: number | null
          routine_type: string | null
          generated_steps: string[] | null
          completed: boolean | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id?: string | null
          mood_state?: string | null
          duration_minutes?: number | null
          routine_type?: string | null
          generated_steps?: string[] | null
          completed?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          mood_state?: string | null
          duration_minutes?: number | null
          routine_type?: string | null
          generated_steps?: string[] | null
          completed?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      menopause_brain_fog_notes: {
        Row: {
          id: string
          user_id: string | null
          note_text: string
          reminder_date: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id?: string | null
          note_text: string
          reminder_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          note_text?: string
          reminder_date?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      menopause_brain_fog_tasks: {
        Row: {
          id: string
          user_id: string | null
          task_text: string
          date: string
          completed: boolean | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id?: string | null
          task_text: string
          date: string
          completed?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          task_text?: string
          date?: string
          completed?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      menopause_trigger_logs: {
        Row: {
          user_id: string
          date: string
          triggers: string[] | null
          notes: string | null
        }
        Insert: {
          user_id: string
          date: string
          triggers?: string[] | null
          notes?: string | null
        }
        Update: {
          user_id?: string
          date?: string
          triggers?: string[] | null
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
