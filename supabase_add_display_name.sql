-- Add display_name column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing users to use their Clerk username as default display name
-- (You'll need to run this manually if you want to migrate existing users)
-- UPDATE user_preferences SET display_name = NULL WHERE display_name IS NULL;
