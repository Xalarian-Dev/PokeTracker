-- PokeTracker Database Schema
-- Run this in Supabase SQL Editor

-- Create the shiny_pokemon table
CREATE TABLE shiny_pokemon (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  pokemon_id TEXT NOT NULL,
  caught_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries
  UNIQUE(user_id, pokemon_id)
);

-- Create index for faster queries
CREATE INDEX idx_shiny_pokemon_user_id ON shiny_pokemon(user_id);

-- Enable Row Level Security
ALTER TABLE shiny_pokemon ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own shinies
CREATE POLICY "Users can view own shinies"
  ON shiny_pokemon
  FOR SELECT
  USING (user_id = auth.jwt()->>'sub');

-- Policy: Users can insert their own shinies
CREATE POLICY "Users can insert own shinies"
  ON shiny_pokemon
  FOR INSERT
  WITH CHECK (user_id = auth.jwt()->>'sub');

-- Policy: Users can delete their own shinies
CREATE POLICY "Users can delete own shinies"
  ON shiny_pokemon
  FOR DELETE
  USING (user_id = auth.jwt()->>'sub');
