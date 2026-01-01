-- ============================================
-- PokeTracker - Enable Row Level Security
-- ============================================
-- This script enables RLS and creates security policies
-- Execute this in your Supabase SQL Editor AFTER deploying the backend API

-- ============================================
-- Enable RLS on Tables
-- ============================================

ALTER TABLE shiny_pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for shiny_pokemon
-- ============================================

-- Policy: Users can view only their own shiny Pokemon
CREATE POLICY "Users can view their own shinies"
  ON shiny_pokemon
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can insert only their own shiny Pokemon
CREATE POLICY "Users can insert their own shinies"
  ON shiny_pokemon
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can delete only their own shiny Pokemon
CREATE POLICY "Users can delete their own shinies"
  ON shiny_pokemon
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- RLS Policies for user_preferences
-- ============================================

-- Policy: Users can view only their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can insert only their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can update only their own preferences
CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can delete only their own preferences
CREATE POLICY "Users can delete their own preferences"
  ON user_preferences
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- Verification
-- ============================================

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('shiny_pokemon', 'user_preferences');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('shiny_pokemon', 'user_preferences')
ORDER BY tablename, policyname;

-- ============================================
-- Notes
-- ============================================
-- 
-- RLS is now enabled! The policies above ensure that:
-- 1. Users can only access their own data
-- 2. The backend API uses service role key to bypass RLS
-- 3. Direct client access (if anon key is exposed) is restricted by RLS
--
-- This provides defense-in-depth security:
-- - Primary security: Backend API with Clerk JWT verification
-- - Secondary security: RLS policies as a safety net
-- ============================================
