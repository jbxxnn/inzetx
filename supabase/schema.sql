-- Klusbaar MVP Database Schema
-- Run this in Supabase SQL Editor
-- Phase 2: Database Schema & Security

-- ============================================
-- 0. ENABLE PGVECTOR EXTENSION (MUST BE FIRST!)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table: Links to auth.users and stores role
-- Note: role can be NULL initially, will be set when user selects their role
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('client', 'freelancer')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Freelancer profiles table: Stores freelancer info with AI-generated fields and embeddings
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,
  description TEXT NOT NULL,
  skills TEXT[],
  availability JSONB,
  location JSONB,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Job requests table: Client job postings with embeddings
CREATE TABLE IF NOT EXISTS job_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  location JSONB,
  time_window JSONB,
  budget TEXT,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Job invites table: Links jobs to potential freelancers
CREATE TABLE IF NOT EXISTS job_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

-- Bookings table: Confirmed agreements between clients and freelancers
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  client_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming',
  scheduled_time JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 2. CREATE VECTOR INDEXES
-- ============================================

-- Index for freelancer profile embeddings (vector similarity search)
CREATE INDEX IF NOT EXISTS freelancer_profiles_embedding_idx
ON freelancer_profiles
USING ivfflat (embedding vector_cosine_ops);

-- Index for job request embeddings (vector similarity search)
CREATE INDEX IF NOT EXISTS job_requests_embedding_idx
ON job_requests
USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- 3. ENABLE ROW-LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Profiles policies: Users can only see/update their own profile
CREATE POLICY "select_own_profile"
ON profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "update_own_profile"
ON profiles
FOR UPDATE
USING (user_id = auth.uid());

-- Allow users to insert their own profile (for initial creation)
-- Note: This is also handled by the trigger, but kept for compatibility
CREATE POLICY "insert_own_profile"
ON profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow the trigger function to insert profiles (SECURITY DEFINER)
-- The trigger runs with elevated privileges, so this policy ensures it can insert

-- Freelancer profiles policies: Freelancers manage their own, everyone can read
CREATE POLICY "freelancer_manage_own_profile"
ON freelancer_profiles
FOR ALL
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'freelancer'
  )
)
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'freelancer'
  )
);

CREATE POLICY "read_all_freelancers"
ON freelancer_profiles
FOR SELECT
USING (true);

-- Job requests policies: Clients can only see/manage their own jobs
CREATE POLICY "clients_manage_own_jobs"
ON job_requests
FOR ALL
USING (
  client_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'client'
  )
)
WITH CHECK (
  client_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'client'
  )
);

-- Job invites policies: Visible to job owner (client) or invited freelancer
CREATE POLICY "job_invites_for_participants"
ON job_invites
FOR SELECT
USING (
  -- Client can see invites for their jobs
  job_request_id IN (
    SELECT id FROM job_requests 
    WHERE client_profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  OR
  -- Freelancer can see invites sent to them
  freelancer_profile_id IN (
    SELECT id FROM freelancer_profiles 
    WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "clients_create_invites"
ON job_invites
FOR INSERT
WITH CHECK (
  job_request_id IN (
    SELECT id FROM job_requests 
    WHERE client_profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'client'
    )
  )
);

CREATE POLICY "freelancers_update_own_invites"
ON job_invites
FOR UPDATE
USING (
  freelancer_profile_id IN (
    SELECT id FROM freelancer_profiles 
    WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'freelancer'
    )
  )
);

-- Bookings policies: Visible to client or freelancer involved
CREATE POLICY "bookings_for_participants"
ON bookings
FOR SELECT
USING (
  -- Client can see their bookings
  client_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
  OR
  -- Freelancer can see their bookings
  freelancer_profile_id IN (
    SELECT id FROM freelancer_profiles 
    WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "clients_create_bookings"
ON bookings
FOR INSERT
WITH CHECK (
  client_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'client'
  )
);

CREATE POLICY "participants_update_bookings"
ON bookings
FOR UPDATE
USING (
  client_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
  OR
  freelancer_profile_id IN (
    SELECT id FROM freelancer_profiles 
    WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- ============================================
-- 5. CREATE MATCHING RPC FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION match_freelancers(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE(
  id uuid,
  profile_id uuid,
  description text,
  headline text,
  skills text[],
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    fp.id,
    fp.profile_id,
    fp.description,
    fp.headline,
    fp.skills,
    1 - (fp.embedding <=> query_embedding) AS similarity
  FROM freelancer_profiles AS fp
  WHERE fp.embedding IS NOT NULL
    AND 1 - (fp.embedding <=> query_embedding) > match_threshold
  ORDER BY fp.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================
-- 6. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================

/**
 * Function to automatically create a profile when a new user signs up.
 * The role will be NULL initially and set when the user selects their role.
 */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Trigger that fires when a new user is created in auth.users
 */
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

