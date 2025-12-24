-- Migration: Auto-create profiles on user signup
-- Run this in Supabase SQL Editor if you already have the profiles table

-- Step 1: Make role nullable (if it's currently NOT NULL)
ALTER TABLE profiles 
ALTER COLUMN role DROP NOT NULL;

-- Step 2: Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, NULL)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create profiles for existing users who don't have one
INSERT INTO public.profiles (user_id, role)
SELECT id, NULL
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

