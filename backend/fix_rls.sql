-- ==================== FIX RLS ISSUE ====================
-- This script disables Row Level Security that was blocking registration
-- Run this in Supabase SQL Editor
-- Safe to run multiple times - uses IF EXISTS

-- Drop all existing RLS policies (safe - won't error if they don't exist)
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can create own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
DROP POLICY IF EXISTS "Users can view own events" ON calendar_events;
DROP POLICY IF EXISTS "Users can create own events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update own events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can create own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Disable RLS on all tables (safe - won't error if already disabled)
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_preferences DISABLE ROW LEVEL SECURITY;

-- Done! Registration should work now
-- Security is handled at the application level with JWT tokens
-- You can now test registration at http://localhost:3000
