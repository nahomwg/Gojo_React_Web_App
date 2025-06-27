import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a placeholder client if environment variables are not set
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: 'agent' | 'renter';
          name: string;
          phone: string;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: 'agent' | 'renter';
          name: string;
          phone: string;
          photo_url?: string | null;
        };
        Update: {
          name?: string;
          phone?: string;
          photo_url?: string | null;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          location: string;
          price: number;
          bedrooms: number;
          features: string[];
          photos: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description: string;
          location: string;
          price: number;
          bedrooms: number;
          features?: string[];
          photos?: string[];
        };
        Update: {
          title?: string;
          description?: string;
          location?: string;
          price?: number;
          bedrooms?: number;
          features?: string[];
          photos?: string[];
        };
      };
      saved_listings: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          listing_id: string;
        };
        Update: {};
      };
      messages: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          listing_id: string | null;
          content: string;
          timestamp: string;
        };
        Insert: {
          from_user_id: string;
          to_user_id: string;
          listing_id?: string | null;
          content: string;
        };
        Update: {};
      };
      search_preferences: {
        Row: {
          id: string;
          user_id: string;
          location: string | null;
          min_price: number | null;
          max_price: number | null;
          bedrooms: number | null;
          features: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          location?: string | null;
          min_price?: number | null;
          max_price?: number | null;
          bedrooms?: number | null;
          features?: string[];
        };
        Update: {
          location?: string | null;
          min_price?: number | null;
          max_price?: number | null;
          bedrooms?: number | null;
          features?: string[];
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          listing_id?: string | null;
          message: string;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
  };
};