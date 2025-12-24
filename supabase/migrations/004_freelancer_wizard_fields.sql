-- Migration: Add fields for freelancer wizard UX
-- Adds fields needed for the guided multi-step profile setup

-- Add fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add fields to freelancer_profiles table
ALTER TABLE freelancer_profiles
ADD COLUMN IF NOT EXISTS example_tasks TEXT[],
ADD COLUMN IF NOT EXISTS pricing_style TEXT CHECK (pricing_style IN ('hourly', 'per_task')),
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS short_notice BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.phone_number IS 'Phone number for bookings and verification. Not visible to clients.';
COMMENT ON COLUMN profiles.languages IS 'Languages spoken by the user';
COMMENT ON COLUMN profiles.full_name IS 'Full name of the user';
COMMENT ON COLUMN freelancer_profiles.example_tasks IS 'Example tasks the freelancer can do (e.g., "Mount TV", "Assemble furniture")';
COMMENT ON COLUMN freelancer_profiles.pricing_style IS 'How the freelancer prefers to be paid: hourly or per_task';
COMMENT ON COLUMN freelancer_profiles.hourly_rate IS 'Typical hourly rate (if pricing_style is hourly)';
COMMENT ON COLUMN freelancer_profiles.is_active IS 'Whether the profile is active and visible to clients';
COMMENT ON COLUMN freelancer_profiles.short_notice IS 'Whether the freelancer is available on short notice';


