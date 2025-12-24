# Advanced Search & Filters

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**MEDIUM** - Phase 3 (Scale)

## Description
Enhance search functionality with:
- Advanced filters (price, availability, ratings, location)
- Search suggestions and autocomplete
- Saved searches
- Search history
- Filter presets

## Why
Currently, search is basic (semantic matching). Advanced filters help:
- Users find exactly what they need
- Reduce time to find matches
- Improve search relevance
- Better user experience

## Approach

### Features
1. **Filter Options**
   - **Location**: Postcode, city, travel radius
   - **Price**: Hourly rate range, pricing style
   - **Availability**: Day of week, time of day
   - **Ratings**: Minimum star rating, number of reviews
   - **Skills**: Multi-select skill tags
   - **Languages**: Languages spoken
   - **Verified**: Verified freelancers only
   - **Response time**: Average response time

2. **Search Enhancements**
   - Autocomplete suggestions
   - Search history
   - Recent searches
   - Popular searches
   - Search suggestions based on context

3. **Saved Searches**
   - Save filter combinations
   - Get notified of new matches
   - Quick access to saved searches

4. **Filter Presets**
   - "Available this weekend"
   - "Under €30/hour"
   - "Highly rated"
   - "Near me"

5. **UI Components**
   - Filter sidebar/panel
   - Active filters display
   - Clear all filters
   - Filter count badges
   - Mobile-friendly filter drawer

## Dependencies
- Search infrastructure (already exists)
- Freelancer profiles with all filterable fields
- Reviews system (for ratings filter)
- Location data

## Implementation Steps
1. Design filter schema
2. Build filter UI components
3. Implement filter logic in search
4. Add filter persistence (URL params)
5. Create saved searches functionality
6. Add search autocomplete
7. Build filter presets
8. Add search history
9. Optimize filter queries
10. Add mobile filter drawer
11. Test all filter combinations

## Notes
- Filters should work with semantic search (combine both)
- Consider using URL query params for shareable filtered searches
- Should cache popular filter combinations
- May want to add filter analytics (what filters are used most)
- Consider adding "smart filters" (AI-suggested filters based on search)

