# Freelancer Discovery & Browsing

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**MEDIUM-HIGH** - Phase 2 (Growth)

## Description
Allow clients to browse and search for freelancers directly, rather than only seeing matches for their specific jobs. This includes:
- Browse all available freelancers
- Search by keywords, skills, location
- Filter by ratings, pricing, availability
- View detailed freelancer profiles
- Save/favorite freelancers

## Why
Currently, clients can only see freelancers through job matching. This limits:
- Discovery of available freelancers
- Ability to explore options before posting a job
- Comparison shopping
- Building relationships with preferred freelancers

Adding discovery features will:
- Increase platform engagement
- Help clients make better decisions
- Give freelancers more visibility
- Improve overall user experience

## Approach

### Database Schema
```sql
-- Add to existing freelancer_profiles or create new table
CREATE TABLE freelancer_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  viewer_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT now()
);

CREATE TABLE saved_freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(client_profile_id, freelancer_profile_id)
);
```

### Features
1. **Browse Page**
   - Grid/list view of freelancers
   - Pagination or infinite scroll
   - Sort by: newest, highest rated, most popular, price
   - Display: headline, photo, skills, rating, price

2. **Search Functionality**
   - Full-text search on description, skills, headline
   - Semantic search using embeddings (leverage existing)
   - Search suggestions/autocomplete
   - Search history

3. **Filters**
   - Location (postcode, city, travel radius)
   - Skills/tags
   - Availability (day/time)
   - Pricing (hourly rate range)
   - Ratings (minimum stars)
   - Languages spoken
   - Verified status (future)

4. **Freelancer Profile View**
   - Full profile details
   - Reviews and ratings
   - Portfolio/images (when implemented)
   - Availability calendar
   - Contact/invite button
   - Save to favorites

5. **Favorites/Saved**
   - Save freelancers for later
   - Create lists/categories
   - Quick access from dashboard

## Dependencies
- Freelancer profiles (already exists)
- Reviews system (for ratings display)
- Search infrastructure (can use existing embedding search)
- Authentication (already exists)

## Implementation Steps
1. Create browse page route (`/protected/freelancers`)
2. Build freelancer card component
3. Implement search functionality (semantic + text)
4. Add filter UI components
5. Create detailed freelancer profile view
6. Implement save/favorite functionality
7. Add view tracking (for analytics)
8. Add sorting options
9. Optimize for performance (pagination, caching)
10. Add mobile responsiveness

## Notes
- Can reuse existing `match_freelancers` RPC for semantic search
- Consider adding "trending" or "featured" freelancers
- May want to add search analytics
- Consider adding map view for location-based browsing
- Should respect freelancer privacy settings (if added)

