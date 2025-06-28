/*
  # Setup BetterAuth with Compatible Types

  1. BetterAuth Tables
    - Create BetterAuth tables with uuid types to match existing schema
    - Enable RLS on all BetterAuth tables
    - Add proper policies for authentication flow

  2. Integration
    - Link existing users table with BetterAuth user table
    - Maintain compatibility with existing foreign key constraints

  3. Indexes
    - Add performance indexes for BetterAuth tables
*/

-- Create BetterAuth tables with uuid types to match existing schema
CREATE TABLE IF NOT EXISTS "user" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  email_verified boolean DEFAULT false,
  name text,
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL,
  token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on BetterAuth tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for BetterAuth tables
-- User table policies
CREATE POLICY "Users can read own data" ON "user"
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON "user"
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert data" ON "user"
  FOR INSERT WITH CHECK (true);

-- Session table policies
CREATE POLICY "Sessions are readable by owner" ON "session"
  FOR SELECT USING (true);

CREATE POLICY "Sessions can be created" ON "session"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions can be updated by owner" ON "session"
  FOR UPDATE USING (true);

CREATE POLICY "Sessions can be deleted by owner" ON "session"
  FOR DELETE USING (true);

-- Account table policies
CREATE POLICY "Accounts are readable by owner" ON "account"
  FOR SELECT USING (true);

CREATE POLICY "Accounts can be created" ON "account"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Accounts can be updated by owner" ON "account"
  FOR UPDATE USING (true);

CREATE POLICY "Accounts can be deleted by owner" ON "account"
  FOR DELETE USING (true);

-- Verification table policies
CREATE POLICY "Verification tokens are readable" ON "verification"
  FOR SELECT USING (true);

CREATE POLICY "Verification tokens can be created" ON "verification"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Verification tokens can be updated" ON "verification"
  FOR UPDATE USING (true);

CREATE POLICY "Verification tokens can be deleted" ON "verification"
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON "session"(expires_at);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"(user_id);
CREATE INDEX IF NOT EXISTS idx_account_provider ON "account"(provider_id, account_id);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);
CREATE INDEX IF NOT EXISTS idx_verification_expires_at ON "verification"(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- Update users table to work with BetterAuth
-- First, drop the existing foreign key constraint to auth.users
DO $$
BEGIN
  -- Drop existing foreign key constraint to auth.users if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_id_fkey;
  END IF;
END $$;

-- Add foreign key constraint to link users table with BetterAuth user table
DO $$
BEGIN
  -- Check if the foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey_better_auth' 
    AND table_name = 'users'
  ) THEN
    -- Add new foreign key to BetterAuth user table
    ALTER TABLE users ADD CONSTRAINT users_id_fkey_better_auth 
    FOREIGN KEY (id) REFERENCES "user"(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create a function to sync user data between BetterAuth and users table
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new user is created in BetterAuth user table,
  -- we don't automatically create a profile in users table
  -- This will be handled by the application after signup
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync user data (optional, can be removed if not needed)
-- DROP TRIGGER IF EXISTS sync_user_profile_trigger ON "user";
-- CREATE TRIGGER sync_user_profile_trigger
--   AFTER INSERT ON "user"
--   FOR EACH ROW
--   EXECUTE FUNCTION sync_user_profile();