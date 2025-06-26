export interface User {
  id: string;
  role: 'agent' | 'renter';
  name: string;
  phone: string;
  photo_url?: string;
  created_at: string;
}

export interface Listing {
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
  user?: User;
}

export interface SavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  listing_id?: string;
  content: string;
  timestamp: string;
  from_user?: User;
  to_user?: User;
  listing?: Listing;
}

export interface SearchPreferences {
  id: string;
  user_id: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  features: string[];
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  listing_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  listing?: Listing;
}

export interface SearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  features?: string[];
}