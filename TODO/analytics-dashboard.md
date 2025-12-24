# Analytics & Insights Dashboard

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**MEDIUM** - Phase 2 (Growth)

## Description
Create comprehensive analytics dashboards for:
- Freelancers: views, matches, conversion rates, earnings
- Clients: job performance, match quality, spending
- Platform: overall metrics, growth, user behavior

## Why
Currently, users have no visibility into:
- How their profile is performing
- What's working and what's not
- Conversion rates
- Earnings trends
- Platform health

Analytics help:
- Users optimize their profiles/jobs
- Identify trends and opportunities
- Make data-driven decisions
- Improve platform performance

## Approach

### Database Schema
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE SET NULL,
  job_request_id UUID REFERENCES job_requests(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_analytics_events_type_date ON analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_events_profile ON analytics_events(profile_id, created_at);
```

### Features

1. **Freelancer Dashboard**
   - Profile views (daily, weekly, monthly)
   - Match rate (invites received / views)
   - Conversion rate (bookings / invites)
   - Earnings overview (when payment integrated)
   - Top performing skills
   - Geographic distribution of views
   - Time-based trends

2. **Client Dashboard**
   - Jobs posted
   - Matches found per job
   - Invite acceptance rate
   - Booking completion rate
   - Average time to find match
   - Spending overview (when payment integrated)

3. **Platform Analytics** (Admin)
   - Total users (freelancers, clients)
   - Active users (daily, weekly, monthly)
   - Jobs posted
   - Bookings created
   - Revenue (when payment integrated)
   - Popular skills
   - Geographic distribution
   - User retention metrics

4. **Visualizations**
   - Charts (line, bar, pie)
   - Date range selectors
   - Export data (CSV)
   - Comparison periods

## Dependencies
- Event tracking system
- Database for storing analytics
- Charting library (e.g., Recharts, Chart.js)
- Payment system (for earnings data)

## Implementation Steps
1. Design analytics event schema
2. Create event tracking utility
3. Instrument key actions (views, matches, bookings)
4. Build analytics aggregation queries
5. Create freelancer dashboard page
6. Create client dashboard page
7. Create admin analytics page
8. Add chart visualizations
9. Add date range filtering
10. Add export functionality
11. Optimize queries for performance
12. Add caching for expensive queries

## Notes
- Consider using a dedicated analytics service (e.g., PostHog, Mixpanel) for advanced features
- Privacy: ensure user data is anonymized where appropriate
- Performance: aggregate data regularly, don't query raw events for dashboards
- May want to add email reports (weekly/monthly summaries)
- Consider adding A/B testing capabilities
- Should respect user privacy preferences

