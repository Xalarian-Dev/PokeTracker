-- Migration: Add trainer_id to user_preferences
-- Run this in the Supabase SQL editor

ALTER TABLE user_preferences
    ADD COLUMN IF NOT EXISTS trainer_id TEXT UNIQUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_trainer_id
    ON user_preferences (trainer_id)
    WHERE trainer_id IS NOT NULL;
