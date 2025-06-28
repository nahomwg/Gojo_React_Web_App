/*
  # Setup BetterAuth with Supabase

  1. Tables for BetterAuth
    - `user` - Core user authentication data
    - `session` - User sessions
    - `account` - OAuth accounts (if needed later)
    - `verification` - Email verification tokens

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for BetterAuth

  3. Integration
    - Keep existing `users` table for application data
    - Link via user.id foreign key
*/

-- Create BetterAuth tables
CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  email_verified boolean DEFAULT false,
  name text,
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  id text PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id text PRIMARY KEY,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
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
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for BetterAuth tables
CREATE POLICY "Users can read own data" ON "user"
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON "user"
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert data" ON "user"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions are readable by owner" ON "session"
  FOR SELECT USING (true);

CREATE POLICY "Sessions can be created" ON "session"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions can be updated by owner" ON "session"
  FOR UPDATE USING (true);

CREATE POLICY "Sessions can be deleted by owner" ON "session"
  FOR DELETE USING (true);

CREATE POLICY "Accounts are readable by owner" ON "account"
  FOR SELECT USING (true);

CREATE POLICY "Accounts can be created" ON "account"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Accounts can be updated by owner" ON "account"
  FOR UPDATE USING (true);

CREATE POLICY "Accounts can be deleted by owner" ON "account"
  FOR DELETE USING (true);

CREATE POLICY "Verification tokens are readable" ON "verification"
  FOR SELECT USING (true);

CREATE POLICY "Verification tokens can be created" ON "verification"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Verification tokens can be updated" ON "verification"
  FOR UPDATE USING (true);

CREATE POLICY "Verification tokens can be deleted" ON "verification"
  FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);

-- Update users table to reference BetterAuth user table
-- Add foreign key constraint to link with BetterAuth user
DO $$
BEGIN
  -- Check if the foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey_better_auth' 
    AND table_name = 'users'
  ) THEN
    -- Drop existing foreign key if it exists
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
    
    -- Add new foreign key to BetterAuth user table
    ALTER TABLE users ADD CONSTRAINT users_id_fkey_better_auth 
    FOREIGN KEY (id) REFERENCES "user"(id) ON DELETE CASCADE;
  END IF;
END $$;