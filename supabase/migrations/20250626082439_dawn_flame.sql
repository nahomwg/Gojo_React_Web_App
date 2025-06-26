/*
  # Complete Property Rental Platform Schema

  1. New Tables
    - `users` (extends Supabase Auth)
      - `id` (uuid, primary key, references auth.users)
      - `role` (enum: 'agent' or 'renter')
      - `name` (text)
      - `phone` (text)
      - `photo_url` (text)
      - `created_at` (timestamp)
    
    - `listings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `price` (integer)
      - `bedrooms` (integer)
      - `features` (text array)
      - `photos` (text array)
      - `created_at` (timestamp)
    
    - `saved_listings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `listing_id` (uuid, foreign key to listings)
      - `created_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, foreign key to users)
      - `to_user_id` (uuid, foreign key to users)
      - `listing_id` (uuid, foreign key to listings)
      - `content` (text)
      - `timestamp` (timestamp)
    
    - `search_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `location` (text)
      - `min_price` (integer)
      - `max_price` (integer)
      - `bedrooms` (integer)
      - `features` (text array)
      - `created_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `listing_id` (uuid, foreign key to listings)
      - `message` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Storage
    - Create bucket for listing photos

  3. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Agents can only manage their own listings
    - Public read access to listings for browsing
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS search_preferences CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS saved_listings CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('agent', 'renter')),
  name text NOT NULL,
  phone text NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  bedrooms integer NOT NULL CHECK (bedrooms >= 0),
  features text[] DEFAULT '{}',
  photos text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create saved_listings table
CREATE TABLE IF NOT EXISTS saved_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  content text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create search_preferences table
CREATE TABLE IF NOT EXISTS search_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location text,
  min_price integer,
  max_price integer,
  bedrooms integer,
  features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read other users for messaging"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Listings policies
CREATE POLICY "Anyone can read listings"
  ON listings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Agents can insert listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'agent'
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Agents can update own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents can delete own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Saved listings policies
CREATE POLICY "Users can manage own saved listings"
  ON saved_listings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can read messages they sent or received"
  ON messages
  FOR SELECT
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

-- Search preferences policies
CREATE POLICY "Users can manage own search preferences"
  ON search_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_bedrooms ON listings(bedrooms);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id ON saved_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_listing_id ON saved_listings(listing_id);

CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_listing ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing photos
CREATE POLICY "Anyone can view listing photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated users can upload listing photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-photos');

CREATE POLICY "Users can update own listing photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own listing photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);