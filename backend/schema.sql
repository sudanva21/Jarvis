-- JARVIS Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ==================== TASKS TABLE ====================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_for ON tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- ==================== NOTES TABLE ====================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);

-- ==================== CALENDAR EVENTS TABLE ====================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON calendar_events(start_time);

-- ==================== USER PREFERENCES TABLE ====================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  voice_enabled BOOLEAN DEFAULT TRUE,
  voice_speed FLOAT DEFAULT 0.9,
  volume FLOAT DEFAULT 0.8,
  theme VARCHAR(50) DEFAULT 'dark',
  location VARCHAR(255),
  news_sources TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON user_preferences(user_id);

-- ==================== ROW LEVEL SECURITY ====================
-- DISABLE RLS for custom JWT authentication
-- We're using application-level security with JWT tokens
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Note: Security is handled at the application level
-- The backend checks JWT tokens and filters data by user_id
-- All queries include WHERE user_id = <authenticated_user_id>

-- ==================== FUNCTIONS ====================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA (Optional) ====================
-- Uncomment to insert sample data for testing

/*
-- Insert a test user
INSERT INTO users (email, password_hash, name) VALUES
  ('tony@stark.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgEjqy', 'Tony Stark');

-- Get the user ID (replace with actual UUID after running above)
-- INSERT INTO tasks (user_id, text, completed, scheduled_for) VALUES
--   ('user-uuid-here', 'Test JARVIS systems', false, NOW() + INTERVAL '1 hour');
*/

-- ==================== DONE ====================
-- Your JARVIS database is now ready!
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Verify all tables are created
-- 3. Test the connection from your backend
