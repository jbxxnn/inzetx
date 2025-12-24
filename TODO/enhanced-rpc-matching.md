# Enhanced RPC Function for Matching

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Description

Enhance the `match_freelancers` PostgreSQL RPC function to support exact filtering for availability and location at the database level, rather than post-filtering in the application layer.

## Why

**Current Implementation:**
- We use composite embeddings (description + skills + availability + location + pricing) for semantic matching
- Post-filtering is done in the application layer after fetching results
- This works but has limitations:
  - Requires fetching more results than needed (3x limit) to account for filtering
  - Multiple database queries (RPC call + profile data fetch)
  - Filtering happens in application memory, not optimized at DB level

**Benefits of Enhanced RPC:**
- **Performance**: Filtering at database level is faster and more efficient
- **Precision**: Exact availability/location matching happens before similarity ranking
- **Scalability**: Better performance as data grows
- **Single Query**: One database call instead of multiple
- **Better Ranking**: Can boost exact matches in SQL, improving result quality

## Approach

### 1. Update RPC Function Signature

Add optional parameters for filtering:

```sql
CREATE OR REPLACE FUNCTION match_freelancers(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  -- New optional filter parameters
  required_day TEXT DEFAULT NULL,      -- e.g., 'saturday'
  required_time TEXT DEFAULT NULL,     -- e.g., 'evening'
  job_postcode TEXT DEFAULT NULL,      -- e.g., '1312AB'
  max_distance_km INT DEFAULT NULL     -- for location filtering
)
```

### 2. Add Filtering Logic in SQL

```sql
WHERE fp.embedding IS NOT NULL
  AND 1 - (fp.embedding <=> query_embedding) > match_threshold
  -- Exact availability filter
  AND (
    required_day IS NULL OR 
    required_time IS NULL OR
    (fp.availability->'days'->required_day)::jsonb ? required_time
  )
  -- Location filter (if postcode distance calculation is needed)
  AND (
    job_postcode IS NULL OR
    max_distance_km IS NULL OR
    -- Calculate distance between postcodes
    calculate_postcode_distance(
      fp.location->>'postcode',
      job_postcode
    ) <= max_distance_km
  )
```

### 3. Enhanced Ranking

Boost exact matches in the ORDER BY clause:

```sql
ORDER BY 
  -- Prioritize exact availability matches
  CASE 
    WHEN required_day IS NOT NULL AND required_time IS NOT NULL
         AND (fp.availability->'days'->required_day)::jsonb ? required_time
    THEN 0 
    ELSE 1 
  END,
  -- Then by similarity
  fp.embedding <=> query_embedding
LIMIT match_count;
```

### 4. Update Application Code

Modify `app/actions/matching.ts` to:
- Pass filter parameters to RPC function
- Remove post-filtering logic (keep as fallback for edge cases)
- Simplify result processing

### 5. Postcode Distance Calculation

**Option A**: Simple numeric difference (current approach)
- Extract numeric part of Dutch postcode (first 4 digits)
- Calculate absolute difference
- Works for approximate distance within same city

**Option B**: Proper geocoding (future enhancement)
- Store lat/lng coordinates for postcodes
- Use PostGIS for accurate distance calculation
- More accurate but requires additional data

## Dependencies

- [x] Composite embedding implementation (completed)
- [x] Post-filtering implementation (completed - current approach)
- [ ] Postcode geocoding data (optional, for accurate distance)
- [ ] Performance testing to validate improvements

## Implementation Steps

1. **Create migration file** for updated RPC function
   - `supabase/migrations/XXX_enhance_match_freelancers_rpc.sql`

2. **Test RPC function** with various filter combinations
   - Availability filters
   - Location filters
   - Combined filters
   - Edge cases (null values, missing data)

3. **Update TypeScript interfaces** in `app/actions/matching.ts`
   - Add filter parameters to function signatures

4. **Refactor matching functions**
   - Update `findMatchesForJob()` to pass filters
   - Update `findMatchesForJobRequest()` to pass filters
   - Remove post-filtering logic (or keep as fallback)

5. **Performance testing**
   - Compare query times before/after
   - Test with large datasets
   - Monitor database load

6. **Update documentation**
   - Update README with new approach
   - Document RPC function parameters

## Notes

- **Backward Compatibility**: Keep old RPC function signature working (with defaults) for gradual migration
- **Fallback Strategy**: Keep post-filtering as fallback if RPC filtering fails
- **Testing**: Test thoroughly with real data to ensure filtering works correctly
- **Performance**: Monitor query performance, especially with indexes on JSONB fields
- **Indexing**: Consider adding GIN indexes on `availability` and `location` JSONB columns if needed

## Related Files

- `supabase/schema.sql` - Current RPC function definition
- `app/actions/matching.ts` - Matching logic (needs update)
- `app/actions/freelancer.ts` - Composite embedding generation
- `app/actions/job.ts` - Job embedding generation

## Future Enhancements

- **PostGIS Integration**: For accurate geographic distance calculation
- **Flexible Time Matching**: Support for "flexible" time windows
- **Multiple Time Slots**: Support matching multiple availability slots
- **Travel Radius Calculation**: More sophisticated location matching based on actual travel radius
- **Weighted Scoring**: Configurable weights for different match factors


