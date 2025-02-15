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
      manifest_items: {
        Row: {
          created_at: string
          id: string
          loaded_quantity: number
          manifest_id: string
          product_id: string
          quantity: number
          scanned_at: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          loaded_quantity?: number
          manifest_id: string
          product_id: string
          quantity: number
          scanned_at?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          loaded_quantity?: number
          manifest_id?: string
          product_id?: string
          quantity?: number
          scanned_at?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "manifest_items_manifest_id_fkey"
            columns: ["manifest_id"]
            isOneToOne: false
            referencedRelation: "shipping_manifests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifest_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifest_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "warehouse_occupation_report"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_movements: {
        Row: {
          created_at: string
          created_by: string
          date: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          type: Database["public"]["Enums"]["movement_type"]
        }
        Insert: {
          created_at?: string
          created_by: string
          date?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          type: Database["public"]["Enums"]["movement_type"]
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          type?: Database["public"]["Enums"]["movement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "product_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "warehouse_occupation_report"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string
          created_at: string
          id: string
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          barcode: string
          created_at?: string
          id?: string
          name: string
          unit: string
          updated_at?: string
        }
        Update: {
          barcode?: string
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
          email: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
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
        }
        Insert: {
          created_at?: string
          id?: string
          manifest_id: string
          product_id: string
          quantity: number
          scanned_at?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          manifest_id?: string
          product_id?: string
          quantity?: number
          scanned_at?: string[] | null
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
          {
            foreignKeyName: "shipping_manifest_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "warehouse_occupation_report"
            referencedColumns: ["product_id"]
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
          status: string
          vehicle_plate: string
        }
        Insert: {
          client_name: string
          created_at?: string
          created_by: string
          driver_name: string
          id?: string
          number: string
          status?: string
          vehicle_plate: string
        }
        Update: {
          client_name?: string
          created_at?: string
          created_by?: string
          driver_name?: string
          id?: string
          number?: string
          status?: string
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
      warehouse_occupations: {
        Row: {
          created_at: string
          created_by: string
          entry_date: string
          id: string
          position_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          created_by: string
          entry_date?: string
          id?: string
          position_id: string
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          created_by?: string
          entry_date?: string
          id?: string
          position_id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_occupations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_occupations_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "warehouse_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_occupations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_occupations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "warehouse_occupation_report"
            referencedColumns: ["product_id"]
          },
        ]
      }
      warehouse_positions: {
        Row: {
          created_at: string
          floor: Database["public"]["Enums"]["warehouse_floor"]
          id: string
          position_number: number
        }
        Insert: {
          created_at?: string
          floor: Database["public"]["Enums"]["warehouse_floor"]
          id?: string
          position_number: number
        }
        Update: {
          created_at?: string
          floor?: Database["public"]["Enums"]["warehouse_floor"]
          id?: string
          position_number?: number
        }
        Relationships: []
      }
    }
    Views: {
      daily_production_view: {
        Row: {
          product_id: string | null
          production_date: string | null
          total_production: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "warehouse_occupation_report"
            referencedColumns: ["product_id"]
          },
        ]
      }
      warehouse_occupation_report: {
        Row: {
          entry_date: string | null
          floor: Database["public"]["Enums"]["warehouse_floor"] | null
          position_number: number | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          stored_by: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      find_best_position: {
        Args: {
          product_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      update_manifest_status: {
        Args: {
          manifest_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "operator"
      movement_type: "input" | "output"
      warehouse_floor: "A" | "B" | "C"
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
