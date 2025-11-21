export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          password: string
          full_name: string
          role: 'guest' | 'member' | 'admin'
          balance: number
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          username: string
          email: string
          password: string
          full_name: string
          role?: 'guest' | 'member' | 'admin'
          balance?: number
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          password?: string
          full_name?: string
          role?: 'guest' | 'member' | 'admin'
          balance?: number
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          product_name: string
          product_type: 'RMSO_NEW' | 'PERSONAL_TUA' | 'RM_NEW' | 'RM_TUA' | 'J202_VERIFIED_BM'
          quantity: number
          total_amount: number
          status: 'BERHASIL' | 'PENDING' | 'GAGAL'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_name: string
          product_type: 'RMSO_NEW' | 'PERSONAL_TUA' | 'RM_NEW' | 'RM_TUA' | 'J202_VERIFIED_BM'
          quantity?: number
          total_amount: number
          status?: 'BERHASIL' | 'PENDING' | 'GAGAL'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_name?: string
          product_type?: 'RMSO_NEW' | 'PERSONAL_TUA' | 'RM_NEW' | 'RM_TUA' | 'J202_VERIFIED_BM'
          quantity?: number
          total_amount?: number
          status?: 'BERHASIL' | 'PENDING' | 'GAGAL'
          created_at?: string
          updated_at?: string
        }
      }
      topups: {
        Row: {
          id: string
          user_id: string
          amount: number
          payment_method: string
          status: 'PENDING' | 'COMPLETED' | 'FAILED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          payment_method: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          payment_method?: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED'
          created_at?: string
          updated_at?: string
        }
      }
      claims: {
        Row: {
          id: string
          user_id: string
          transaction_id: string
          reason: string
          description: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          response_note: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          transaction_id: string
          reason: string
          description: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          response_note?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          transaction_id?: string
          reason?: string
          description?: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          response_note?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      tutorials: {
        Row: {
          id: string
          title: string
          description: string
          content: string
          category: string
          tags: string[]
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          content: string
          category: string
          tags?: string[]
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          content?: string
          category?: string
          tags?: string[]
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      admin_audit_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_type: string
          target_id: string
          changes: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_type: string
          target_id: string
          changes: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_type?: string
          target_id?: string
          changes?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_user_balance: {
        Args: {
          user_id: string
          amount_change: number
        }
        Returns: void
      }
      increment_tutorial_views: {
        Args: {
          tutorial_id: string
        }
        Returns: void
      }
      get_transaction_statistics: {
        Args: {
          p_user_id: string | null
          p_start_date: string | null
          p_end_date: string | null
        }
        Returns: {
          total_transactions: number
          total_amount: number
          by_status: Array<{
            status: string
            count: number
            total_amount: number
          }>
          by_product_type: Array<{
            product_type: string
            count: number
            total_amount: number
          }>
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
