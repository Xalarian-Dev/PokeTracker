-- TEMPORARY FIX: Disable RLS for testing
-- Run this in Supabase SQL Editor

-- Disable Row Level Security temporarily
ALTER TABLE shiny_pokemon DISABLE ROW LEVEL SECURITY;

-- NOTE: This makes the table accessible to everyone!
-- We'll fix this properly by integrating Clerk JWT with Supabase
