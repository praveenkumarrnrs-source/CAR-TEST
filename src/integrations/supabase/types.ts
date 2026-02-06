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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      auctions: {
        Row: {
          admin_approved: boolean | null
          bid_count: number | null
          car_brand: string
          car_condition: Database["public"]["Enums"]["car_condition"] | null
          car_fuel_type: string
          car_id: string | null
          car_model: string
          car_year: number
          created_at: string
          creator_id: string | null
          current_price: number
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          reserve_price: number | null
          start_time: string
          starting_price: number
          status: Database["public"]["Enums"]["auction_status"] | null
          title: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          admin_approved?: boolean | null
          bid_count?: number | null
          car_brand: string
          car_condition?: Database["public"]["Enums"]["car_condition"] | null
          car_fuel_type: string
          car_id?: string | null
          car_model: string
          car_year: number
          created_at?: string
          creator_id?: string | null
          current_price: number
          description?: string | null
          end_time: string
          id?: string
          image_url?: string | null
          reserve_price?: number | null
          start_time: string
          starting_price: number
          status?: Database["public"]["Enums"]["auction_status"] | null
          title: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          admin_approved?: boolean | null
          bid_count?: number | null
          car_brand?: string
          car_condition?: Database["public"]["Enums"]["car_condition"] | null
          car_fuel_type?: string
          car_id?: string | null
          car_model?: string
          car_year?: number
          created_at?: string
          creator_id?: string | null
          current_price?: number
          description?: string | null
          end_time?: string
          id?: string
          image_url?: string | null
          reserve_price?: number | null
          start_time?: string
          starting_price?: number
          status?: Database["public"]["Enums"]["auction_status"] | null
          title?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["bid_status"] | null
        }
        Insert: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bid_status"] | null
        }
        Update: {
          amount?: number
          auction_id?: string
          bidder_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bid_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          body_type: string | null
          brand: string
          condition: Database["public"]["Enums"]["car_condition"] | null
          created_at: string
          description: string | null
          engine_cc: number | null
          ex_showroom_price: number | null
          features: string[] | null
          fuel_type: string
          id: string
          image_url: string | null
          image_urls: string[] | null
          mileage: string | null
          model: string
          on_road_price: number | null
          rating: number | null
          scraped_at: string | null
          seating_capacity: number | null
          slug: string | null
          source: string | null
          source_url: string | null
          specifications: Json | null
          transmission: string | null
          updated_at: string
          variant: string | null
          year: number
        }
        Insert: {
          body_type?: string | null
          brand: string
          condition?: Database["public"]["Enums"]["car_condition"] | null
          created_at?: string
          description?: string | null
          engine_cc?: number | null
          ex_showroom_price?: number | null
          features?: string[] | null
          fuel_type: string
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          mileage?: string | null
          model: string
          on_road_price?: number | null
          rating?: number | null
          scraped_at?: string | null
          seating_capacity?: number | null
          slug?: string | null
          source?: string | null
          source_url?: string | null
          specifications?: Json | null
          transmission?: string | null
          updated_at?: string
          variant?: string | null
          year: number
        }
        Update: {
          body_type?: string | null
          brand?: string
          condition?: Database["public"]["Enums"]["car_condition"] | null
          created_at?: string
          description?: string | null
          engine_cc?: number | null
          ex_showroom_price?: number | null
          features?: string[] | null
          fuel_type?: string
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          mileage?: string | null
          model?: string
          on_road_price?: number | null
          rating?: number | null
          scraped_at?: string | null
          seating_capacity?: number | null
          slug?: string | null
          source?: string | null
          source_url?: string | null
          specifications?: Json | null
          transmission?: string | null
          updated_at?: string
          variant?: string | null
          year?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          auction_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          auction_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          auction_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          kyc_verified: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          kyc_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          kyc_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scraped_prices: {
        Row: {
          brand: string
          fuel_type: string | null
          id: string
          model: string
          price: number | null
          scraped_at: string
          source: string
          source_url: string | null
          variant: string | null
          year: number | null
        }
        Insert: {
          brand: string
          fuel_type?: string | null
          id?: string
          model: string
          price?: number | null
          scraped_at?: string
          source: string
          source_url?: string | null
          variant?: string | null
          year?: number | null
        }
        Update: {
          brand?: string
          fuel_type?: string | null
          id?: string
          model?: string
          price?: number | null
          scraped_at?: string
          source?: string
          source_url?: string | null
          variant?: string | null
          year?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      valuations: {
        Row: {
          car_brand: string
          car_model: string
          car_year: number | null
          created_at: string
          demand_score: number | null
          estimated_value: number | null
          fuel_type: string | null
          id: string
          max_value: number | null
          min_value: number | null
          registration_number: string | null
          sources: Json | null
          user_id: string | null
        }
        Insert: {
          car_brand: string
          car_model: string
          car_year?: number | null
          created_at?: string
          demand_score?: number | null
          estimated_value?: number | null
          fuel_type?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          registration_number?: string | null
          sources?: Json | null
          user_id?: string | null
        }
        Update: {
          car_brand?: string
          car_model?: string
          car_year?: number | null
          created_at?: string
          demand_score?: number | null
          estimated_value?: number | null
          fuel_type?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          registration_number?: string | null
          sources?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "auction_creator" | "admin"
      auction_status: "pending" | "active" | "ended" | "cancelled"
      bid_status: "active" | "outbid" | "won" | "cancelled"
      car_condition: "new" | "excellent" | "good" | "fair" | "poor"
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
      app_role: ["user", "auction_creator", "admin"],
      auction_status: ["pending", "active", "ended", "cancelled"],
      bid_status: ["active", "outbid", "won", "cancelled"],
      car_condition: ["new", "excellent", "good", "fair", "poor"],
    },
  },
} as const
