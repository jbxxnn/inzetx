# Reviews System

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Description

Implement a comprehensive reviews system where clients can leave reviews and ratings for freelancers after job completion. Reviews should be integrated into the matching algorithm to boost freelancers with high ratings in search results.

## Why

**Benefits:**
- **Quality Assurance**: Helps clients identify reliable, high-quality freelancers
- **Trust Building**: Reviews build credibility and trust in the platform
- **Better Matching**: High-rated freelancers get prioritized, improving overall service quality
- **Freelancer Motivation**: Encourages freelancers to maintain high service standards
- **Client Confidence**: Clients can make informed decisions based on past experiences

## Approach

### 1. Database Schema

Create a `reviews` table:

```sql
CREATE TABLE reviews (
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
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Constraints
  UNIQUE(booking_id), -- One review per booking
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Index for fast lookups
CREATE INDEX reviews_freelancer_idx ON reviews(freelancer_profile_id);
CREATE INDEX reviews_client_idx ON reviews(client_profile_id);
CREATE INDEX reviews_booking_idx ON reviews(booking_id);
```

### 2. Add Aggregated Ratings to Freelancer Profiles

Add computed fields to `freelancer_profiles`:

```sql
-- Add columns for aggregated ratings
ALTER TABLE freelancer_profiles
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_breakdown JSONB; -- e.g., {"5": 10, "4": 3, "3": 1, "2": 0, "1": 0}

-- Create function to update freelancer ratings
CREATE OR REPLACE FUNCTION update_freelancer_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE freelancer_profiles
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE freelancer_profile_id = NEW.freelancer_profile_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE freelancer_profile_id = NEW.freelancer_profile_id
    ),
    rating_breakdown = (
      SELECT jsonb_object_agg(rating::text, count)
      FROM (
        SELECT rating, COUNT(*) as count
        FROM reviews
        WHERE freelancer_profile_id = NEW.freelancer_profile_id
        GROUP BY rating
      ) sub
    )
  WHERE id = NEW.freelancer_profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update ratings
CREATE TRIGGER update_freelancer_ratings_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_freelancer_ratings();
```

### 3. Review Creation Flow

**When a booking is completed:**
1. Client receives notification/email to leave a review
2. Client can rate (1-5 stars) and optionally leave a comment
3. Optional: Detailed ratings (communication, quality, punctuality, value)
4. Review is saved and triggers rating aggregation update
5. Freelancer is notified of new review

**Server Action:**
```typescript
// app/actions/review.ts
export async function createReview(params: {
  bookingId: string;
  rating: number;
  comment?: string;
  communicationRating?: number;
  qualityRating?: number;
  punctualityRating?: number;
  valueRating?: number;
})
```

### 4. UI Components

**Review Form:**
- Star rating selector (1-5)
- Optional comment textarea
- Optional detailed ratings (communication, quality, punctuality, value)
- Submit button

**Review Display:**
- Show average rating on freelancer profile
- List of reviews with ratings and comments
- Rating breakdown (e.g., "5 stars: 10 reviews, 4 stars: 3 reviews...")
- Filter/sort reviews (newest, highest, lowest)

**Review Prompt:**
- Show review prompt after booking completion
- Reminder notifications for pending reviews
- Link to review form from booking history

### 5. Integration with Matching Algorithm

**Update Composite Embedding:**
Include average rating in freelancer embedding:

```typescript
// In app/actions/freelancer.ts
if (averageRating) {
  const ratingText = `Highly rated freelancer with ${averageRating.toFixed(1)} stars from ${totalReviews} reviews`;
  compositeTextParts.push(ratingText);
}
```

**Update Matching Function:**
Boost high-rated freelancers in ranking:

```typescript
// In app/actions/matching.ts
const relevanceScore = row.similarity;
if (hasExactAvailability) relevanceScore += 0.2;
if (hasLocationMatch) relevanceScore += 0.1;
// Boost for high ratings
if (row.average_rating >= 4.5) relevanceScore += 0.15;
else if (row.average_rating >= 4.0) relevanceScore += 0.10;
else if (row.average_rating >= 3.5) relevanceScore += 0.05;
// Boost for having many reviews (trust factor)
if (row.total_reviews >= 10) relevanceScore += 0.05;
```

**Update RPC Function (Future):**
When implementing enhanced RPC, add rating boost in SQL:

```sql
ORDER BY 
  -- Prioritize high-rated freelancers
  CASE 
    WHEN fp.average_rating >= 4.5 THEN 0
    WHEN fp.average_rating >= 4.0 THEN 1
    WHEN fp.average_rating >= 3.5 THEN 2
    ELSE 3
  END,
  -- Then by exact availability matches
  CASE 
    WHEN required_day IS NOT NULL AND required_time IS NOT NULL
         AND (fp.availability->'days'->required_day)::jsonb ? required_time
    THEN 0 
    ELSE 1 
  END,
  -- Finally by similarity
  fp.embedding <=> query_embedding
```

### 6. Review Moderation (Optional)

- Flag inappropriate reviews
- Allow freelancers to respond to reviews
- Admin moderation tools
- Review reporting system

## Dependencies

- [x] Bookings system (completed)
- [ ] Database migration for reviews table
- [ ] Rating aggregation triggers
- [ ] Review creation UI components
- [ ] Review display components
- [ ] Notification system for review prompts
- [ ] Update matching algorithm to include ratings

## Implementation Steps

1. **Database Setup**
   - Create `reviews` table migration
   - Add rating columns to `freelancer_profiles`
   - Create rating aggregation function and trigger
   - Test rating calculations

2. **Server Actions**
   - Create `app/actions/review.ts`
   - Implement `createReview()` function
   - Implement `getFreelancerReviews()` function
   - Implement `getReviewStats()` function

3. **UI Components**
   - Create `components/review/ReviewForm.tsx`
   - Create `components/review/ReviewList.tsx`
   - Create `components/review/ReviewCard.tsx`
   - Create `components/review/RatingDisplay.tsx`
   - Create `components/review/StarRating.tsx`

4. **Review Flow Integration**
   - Add review prompt after booking completion
   - Add review link in booking history
   - Add review section to freelancer profile page
   - Add review notification system

5. **Matching Integration**
   - Update composite embedding to include ratings
   - Update matching algorithm to boost high-rated freelancers
   - Test ranking with various rating scenarios
   - Update enhanced RPC function (when implemented)

6. **Testing**
   - Test review creation flow
   - Test rating aggregation
   - Test matching with ratings
   - Test edge cases (no reviews, all 5 stars, all 1 star, etc.)

## Notes

- **Minimum Reviews Threshold**: Consider requiring minimum number of reviews (e.g., 3) before showing average rating
- **Review Timing**: Allow reviews only after booking is marked as completed
- **Review Editing**: Allow clients to edit their reviews within a time window (e.g., 7 days)
- **Review Deletion**: Only allow deletion by admin or if booking is cancelled
- **Rating Display**: Show "No reviews yet" for new freelancers instead of 0 stars
- **Privacy**: Consider anonymizing reviews or showing only first name
- **Response System**: Allow freelancers to respond to reviews (future enhancement)
- **Review Categories**: Consider adding review categories (e.g., "Great communication", "On time", "Quality work")

## Related Files

- `app/actions/review.ts` - Review server actions (to be created)
- `app/actions/matching.ts` - Matching algorithm (needs update)
- `app/actions/freelancer.ts` - Composite embedding (needs update)
- `components/review/*` - Review UI components (to be created)
- `supabase/migrations/XXX_add_reviews.sql` - Database migration (to be created)

## Future Enhancements

- **Review Analytics**: Dashboard for freelancers to see review trends
- **Review Templates**: Pre-written review templates for common scenarios
- **Photo Reviews**: Allow clients to upload photos with reviews
- **Verified Reviews**: Mark reviews from verified clients
- **Review Recommendations**: AI-generated review suggestions based on job details
- **Review Badges**: Special badges for freelancers with exceptional ratings
- **Review Comparison**: Compare freelancer ratings side-by-side
- **Review Export**: Allow freelancers to export their reviews


