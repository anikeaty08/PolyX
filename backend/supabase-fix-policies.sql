-- Quick Fix: Drop existing policies to resolve the error
-- Run this first, then run the main schema script

DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Now you can run the main schema script without errors


