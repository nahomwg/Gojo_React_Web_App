/*
  # Initial Schema for Gojo Rental Platform

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `phone` (text)
      - `user_type` (enum: 'renter' or 'agent')
      - `created_at` (timestamp)
    
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `bedrooms` (integer)
      - `bathrooms` (integer)
      - `area_sqm` (numeric)
      - `location` (text)
      - `subcity` (text)
      - `property_type` (text)
      - `images` (text array)
      - `agent_id` (uuid, foreign key to profiles)
      - `is_featured` (boolean)
      - `is_scam_flagged` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to properties
    - Add policies for agents to manage their properties
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('renter', 'agent')),
  created_at timestamptz DEFAULT now()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  bedrooms integer NOT NULL CHECK (bedrooms >= 0),
  bathrooms integer NOT NULL CHECK (bathrooms >= 0),
  area_sqm numeric NOT NULL CHECK (area_sqm > 0),
  location text NOT NULL,
  subcity text NOT NULL,
  property_type text NOT NULL,
  images text[] DEFAULT '{}',
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_featured boolean DEFAULT false,
  is_scam_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can read properties"
  ON properties
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Agents can insert properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'agent'
    )
    AND agent_id = auth.uid()
  );

CREATE POLICY "Agents can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (agent_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_subcity ON properties(subcity);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);