export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      product_movements: {
        Row: {
          created_by: string
          floor: string | null
          id: string
          movement_date: string
          notes: string | null
          position_number: number | null
          product_id: string
          quantity: number
          type: string
        }
        Insert: {
          created_by: string
          floor?: string | null
          id?: string
          movement_date?: string
          notes?: string | null
          position_number?: number | null
          product_id: string
          quantity: number
          type: string
        }
        Update: {
          created_by?: string
          floor?: string | null
          id?: string
          movement_date?: string
          notes?: string | null
          position_number?: number | null
          product_id?: string
          quantity?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean | null
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shipping_manifest_items: {
        Row: {
          created_at: string
          id: string
          manifest_id: string
          product_id: string
          quantity: number
          scanned_at: string[] | null
          warehouse_floor: string | null
          warehouse_position: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          manifest_id: string
          product_id: string
          quantity: number
          scanned_at?: string[] | null
          warehouse_floor?: string | null
          warehouse_position?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          manifest_id?: string
          product_id?: string
          quantity?: number
          scanned_at?: string[] | null
          warehouse_floor?: string | null
          warehouse_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_manifest_items_manifest_id_fkey"
            columns: ["manifest_id"]
            isOneToOne: false
            referencedRelation: "shipping_manifests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_manifest_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_manifests: {
        Row: {
          client_name: string
          created_at: string
          created_by: string
          driver_name: string
          id: string
          number: string
          status: string | null
          vehicle_plate: string
        }
        Insert: {
          client_name: string
          created_at?: string
          created_by: string
          driver_name: string
          id?: string
          number: string
          status?: string | null
          vehicle_plate: string
        }
        Update: {
          client_name?: string
          created_at?: string
          created_by?: string
          driver_name?: string
          id?: string
          number?: string
          status?: string | null
          vehicle_plate?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_manifests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      all_stock_movements_view: {
        Row: {
          created_by_name: string | null
          floor: string | null
          id: string | null
          movement_date: string | null
          movement_type: string | null
          notes: string | null
          position_number: number | null
          product_name: string | null
          product_unit: string | null
          quantity: number | null
        }
        Relationships: []
      }
      oldest_warehouse_positions: {
        Row: {
          age_rank: number | null
          available_quantity: number | null
          entry_date: string | null
          floor: string | null
          position_number: number | null
          product_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_occupation_report: {
        Row: {
          entry_date: string | null
          floor: string | null
          id: string | null
          position_number: number | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          stored_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_next_warehouse_position: {
        Args: {
          p_product_id: string
        }
        Returns: {
          floor: string
          position_number: number
        }[]
      }
      get_oldest_position: {
        Args: {
          p_product_id: string
        }
        Returns: {
          floor: string
          position_number: number
          available_quantity: number
        }[]
      }
      update_warehouse_position_quantity: {
        Args: {
          p_product_id: string
          p_floor: string
          p_position: number
          p_quantity: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_permission:
        | "dashboard"
        | "stock"
        | "products"
        | "loading"
        | "reports"
        | "users_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
