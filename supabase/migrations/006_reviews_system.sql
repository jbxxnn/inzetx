-- Reviews System Migration
-- Creates reviews table and rating aggregation system

-- ============================================
-- 1. CREATE REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  client_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Optional: Detailed ratings
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  UNIQUE(booking_id), -- One review per booking
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS reviews_freelancer_idx ON reviews(freelancer_profile_id);
CREATE INDEX IF NOT EXISTS reviews_client_idx ON reviews(client_profile_id);
CREATE INDEX IF NOT EXISTS reviews_booking_idx ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS reviews_job_request_idx ON reviews(job_request_id);

-- ============================================
-- 2. ADD RATING COLUMNS TO FREELANCER_PROFILES
-- ============================================

ALTER TABLE freelancer_profiles
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_breakdown JSONB;

-- ============================================
-- 3. CREATE RATING AGGREGATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_freelancer_ratings()
RETURNS TRIGGER AS $$
DECLARE
  target_freelancer_id UUID;
BEGIN
  -- Determine which freelancer profile to update
  IF TG_OP = 'DELETE' THEN
    target_freelancer_id := OLD.freelancer_profile_id;
  ELSE
    target_freelancer_id := NEW.freelancer_profile_id;
  END IF;

  -- Update aggregated ratings for the freelancer
  UPDATE freelancer_profiles
  SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
      FROM reviews
      WHERE freelancer_profile_id = target_freelancer_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE freelancer_profile_id = target_freelancer_id
    ),
    rating_breakdown = (
      SELECT COALESCE(jsonb_object_agg(rating::text, count), '{}'::jsonb)
      FROM (
        SELECT rating, COUNT(*) as count
        FROM reviews
        WHERE freelancer_profile_id = target_freelancer_id
        GROUP BY rating
        ORDER BY rating DESC
      ) sub
    ),
    updated_at = now()
  WHERE id = target_freelancer_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE TRIGGER TO AUTO-UPDATE RATINGS
-- ============================================

DROP TRIGGER IF EXISTS update_freelancer_ratings_trigger ON reviews;

CREATE TRIGGER update_freelancer_ratings_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_freelancer_ratings();

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES
-- ============================================

-- Clients can create reviews for their own bookings
CREATE POLICY "clients_create_own_reviews"
ON reviews FOR INSERT
WITH CHECK (
  client_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'client'
  )
  AND booking_id IN (
    SELECT id FROM bookings 
    WHERE client_profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Everyone can read reviews (for displaying on profiles)
CREATE POLICY "everyone_read_reviews"
ON reviews FOR SELECT
USING (true);

-- Clients can update their own reviews (within time limit - handled in application)
CREATE POLICY "clients_update_own_reviews"
ON reviews FOR UPDATE
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

-- Clients can delete their own reviews (within time limit - handled in application)
CREATE POLICY "clients_delete_own_reviews"
ON reviews FOR DELETE
USING (
  client_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'client'
  )
);

-- ============================================
-- 7. CREATE FUNCTION TO GET REVIEW STATS
-- ============================================

CREATE OR REPLACE FUNCTION get_freelancer_review_stats(freelancer_id UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  total_reviews BIGINT,
  rating_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating,
    COUNT(*)::BIGINT as total_reviews,
    COALESCE(
      jsonb_object_agg(r.rating::text, count) FILTER (WHERE r.rating IS NOT NULL),
      '{}'::jsonb
    ) as rating_breakdown
  FROM reviews r
  WHERE r.freelancer_profile_id = freelancer_id
  GROUP BY r.freelancer_profile_id;
END;
$$ LANGUAGE plpgsql;

