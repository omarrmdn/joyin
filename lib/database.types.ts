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
      attendees: {
        Row: {
          event_id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendees_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendees_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bug_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          images: string[] | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bug_reports_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      currencies: {
        Row: {
          code: string
          country_codes: string[] | null
          created_at: string | null
          decimal_places: number | null
          is_active: boolean | null
          name: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          code: string
          country_codes?: string[] | null
          created_at?: string | null
          decimal_places?: number | null
          is_active?: boolean | null
          name: string
          symbol: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          country_codes?: string[] | null
          created_at?: string | null
          decimal_places?: number | null
          is_active?: boolean | null
          name?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      event_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          created_at: string | null
          event_id: string
          id: string
          organizer_id: string
          question: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          organizer_id: string
          question: string
          user_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          organizer_id?: string
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_questions_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_questions_organizer_id_fkey"
            columns: ["organizer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_questions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      event_tags: {
        Row: {
          event_id: string
          tag_id: number
        }
        Insert: {
          event_id: string
          tag_id: number
        }
        Update: {
          event_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_tags_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          average_rating: number | null
          cancellation_reason: string | null
          created_at: string | null
          currency_code: string
          date: string
          description: string | null
          end_date: string | null
          end_time: string | null
          gender: string | null
          id: string
          image_url: string | null
          is_online: boolean | null
          is_recurring: boolean | null
          latitude: number | null
          link: string | null
          location: string | null
          longitude: number | null
          max_capacity: number | null
          organizer_id: string | null
          parent_event_id: string | null
          price: number | null
          recurrence_days: number[] | null
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          status: string | null
          time: string
          title: string
          total_ratings: number | null
        }
        Insert: {
          average_rating?: number | null
          cancellation_reason?: string | null
          created_at?: string | null
          currency_code?: string
          date: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          is_online?: boolean | null
          is_recurring?: boolean | null
          latitude?: number | null
          link?: string | null
          location?: string | null
          longitude?: number | null
          max_capacity?: number | null
          organizer_id?: string | null
          parent_event_id?: string | null
          price?: number | null
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          status?: string | null
          time: string
          title: string
          total_ratings?: number | null
        }
        Update: {
          average_rating?: number | null
          cancellation_reason?: string | null
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          is_online?: boolean | null
          is_recurring?: boolean | null
          latitude?: number | null
          link?: string | null
          location?: string | null
          longitude?: number | null
          max_capacity?: number | null
          organizer_id?: string | null
          parent_event_id?: string | null
          price?: number | null
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          status?: string | null
          time?: string
          title?: string
          total_ratings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_currency_fk"
            columns: ["currency_code"]
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_parent_event_fkey"
            columns: ["parent_event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ratings: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          rating: number
          review: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          rating: number
          review?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          rating?: number
          review?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          category: string
          created_at: string | null
          id: number
          language: string | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: number
          language?: string | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: number
          language?: string | null
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          country_code: string | null
          created_at: string | null
          currency_auto_detected: boolean | null
          currency_code: string
          currency_updated_at: string | null
          date_signed_in: string | null
          email: string | null
          id: string
          image_url: string | null
          interested_tags: string[] | null
          last_location: string | null
          name: string | null
          total_revenue: number | null
          total_spend: number | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          currency_auto_detected?: boolean | null
          currency_code?: string
          currency_updated_at?: string | null
          date_signed_in?: string | null
          email?: string | null
          id: string
          image_url?: string | null
          interested_tags?: string[] | null
          last_location?: string | null
          name?: string | null
          total_revenue?: number | null
          total_spend?: number | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          currency_auto_detected?: boolean | null
          currency_code?: string
          currency_updated_at?: string | null
          date_signed_in?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          interested_tags?: string[] | null
          last_location?: string | null
          name?: string | null
          total_revenue?: number | null
          total_spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_currency_fk"
            columns: ["currency_code"]
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          }
        ]
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
