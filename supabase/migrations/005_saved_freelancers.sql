-- Create saved_freelancers table for clients to bookmark freelancers
CREATE TABLE IF NOT EXISTS saved_freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(client_profile_id, freelancer_profile_id)
);

-- Enable RLS
ALTER TABLE saved_freelancers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Clients can only see their own saved freelancers
CREATE POLICY "clients_select_own_saved_freelancers"
ON saved_freelancers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = saved_freelancers.client_profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Clients can insert their own saved freelancers
CREATE POLICY "clients_insert_own_saved_freelancers"
ON saved_freelancers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = saved_freelancers.client_profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Clients can delete their own saved freelancers
CREATE POLICY "clients_delete_own_saved_freelancers"
ON saved_freelancers
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = saved_freelancers.client_profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS saved_freelancers_client_profile_id_idx
ON saved_freelancers(client_profile_id);

CREATE INDEX IF NOT EXISTS saved_freelancers_freelancer_profile_id_idx
ON saved_freelancers(freelancer_profile_id);

