-- Migration: Add UNIQUE constraint to freelancer_profiles.profile_id
-- This allows upsert to work with onConflict: 'profile_id'

-- Step 1: Check if there are any duplicate profile_ids (shouldn't happen, but safety check)
-- If there are duplicates, you'll need to clean them up first
-- SELECT profile_id, COUNT(*) 
-- FROM freelancer_profiles 
-- GROUP BY profile_id 
-- HAVING COUNT(*) > 1;

-- Step 2: Add UNIQUE constraint
-- Note: This will fail if there are duplicate profile_ids
ALTER TABLE freelancer_profiles
ADD CONSTRAINT freelancer_profiles_profile_id_key UNIQUE (profile_id);

-- If the above fails due to duplicates, you can drop the constraint first:
-- ALTER TABLE freelancer_profiles DROP CONSTRAINT IF EXISTS freelancer_profiles_profile_id_key;
-- Then clean up duplicates and re-run the ADD CONSTRAINT command

