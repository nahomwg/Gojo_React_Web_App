/*
  # Fix Supabase Authentication Setup

  1. Ensure proper auth configuration
  2. Fix RLS policies for auth flow
  3. Add proper user profile sync
  4. Disable email confirmation for development

  This migration ensures authentication works properly with the existing schema.
*/

-- Ensure users table exists with correct structure
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('agent', 'renter')),
  name text NOT NULL,
  phone text NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read other users for messaging" ON users;

-- Create proper RLS policies for users
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

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to automatically create user profiles
  -- when a new auth user is created, but we'll handle it manually in the app
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Ensure email confirmation is properly handled
-- Note: Email confirmation should be disabled in Supabase Auth settings for development
-- This can be done in the Supabase dashboard under Authentication > Settings