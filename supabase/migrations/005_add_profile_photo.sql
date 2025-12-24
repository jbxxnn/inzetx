-- Migration: Add profile_photo field to profiles table
-- Run this in Supabase SQL Editor

-- Add profile_photo column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_photo TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.profile_photo IS 'URL to the user profile photo stored in Supabase Storage';

