-- PolyX Messages Table
-- Run this SQL in your Supabase SQL Editor to create the messages table

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_address);
CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_address);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted);

-- Drop existing policies if they exist (to make script idempotent)
DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to read their own messages
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  USING (
    from_address = current_setting('request.jwt.claims', true)::json->>'address' OR
    to_address = current_setting('request.jwt.claims', true)::json->>'address'
  );

-- Create policy to allow users to insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    from_address = current_setting('request.jwt.claims', true)::json->>'address'
  );

-- Create policy to allow users to update their own messages
CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (
    from_address = current_setting('request.jwt.claims', true)::json->>'address'
  );

-- For now, we'll use service role key, so we can disable RLS or use a simpler approach
-- If you want to use RLS, you'll need to set up authentication properly
-- For simplicity, let's disable RLS for now (you can enable it later with proper auth)
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Add read receipt tracking
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read_at);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_address TEXT NOT NULL,
  blocked_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_address, blocked_address)
);

CREATE INDEX IF NOT EXISTS idx_blocked_blocker ON blocked_users(blocker_address);
CREATE INDEX IF NOT EXISTS idx_blocked_blocked ON blocked_users(blocked_address);
ALTER TABLE blocked_users DISABLE ROW LEVEL SECURITY;

