-- ============================================
-- PokeTracker - Complete Supabase Schema
-- ============================================
-- This script creates all necessary tables for PokeTracker
-- Execute this in your Supabase SQL Editor

-- ============================================
-- Table 1: shiny_pokemon
-- ============================================
-- Stores which Pokemon each user has marked as shiny
CREATE TABLE IF NOT EXISTS shiny_pokemon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  pokemon_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pokemon_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shiny_pokemon_user_id ON shiny_pokemon(user_id);
CREATE INDEX IF NOT EXISTS idx_shiny_pokemon_pokemon_id ON shiny_pokemon(pokemon_id);

-- Add comment
COMMENT ON TABLE shiny_pokemon IS 'Tracks which Pokemon users have caught as shiny';

-- ============================================
-- Table 2: user_preferences
-- ============================================
-- Stores user preferences (language, owned games)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  preferred_language TEXT DEFAULT 'fr',
  owned_games TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Add comment
COMMENT ON TABLE user_preferences IS 'User preferences for language and owned games';

-- ============================================
-- Disable RLS (for MVP)
-- ============================================
-- Note: RLS is disabled for simplicity in MVP
-- Data is filtered client-side by user_id
-- Consider enabling RLS with proper policies for production

ALTER TABLE shiny_pokemon DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify tables were created successfully

-- Check shiny_pokemon table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'shiny_pokemon'
ORDER BY ordinal_position;

-- Check user_preferences table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_preferences'
ORDER BY ordinal_position;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- Uncomment to insert test data

-- INSERT INTO shiny_pokemon (user_id, pokemon_id) VALUES
--   ('test_user_1', '1'),
--   ('test_user_1', '25'),
--   ('test_user_1', '150');

-- INSERT INTO user_preferences (user_id, preferred_language, owned_games) VALUES
--   ('test_user_1', 'fr', ARRAY['r', 'b', 'g', 's']);

-- ============================================
-- Done!
-- ============================================
-- Your PokeTracker database is ready to use!
