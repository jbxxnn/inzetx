# Verification & Trust System

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**MEDIUM** - Phase 3 (Scale)

## Description
Implement verification and trust features:
- Identity verification
- Background checks (optional)
- Verified badges
- Trust scores
- Safety features

## Why
Trust is critical for a marketplace. Verification helps:
- Build user confidence
- Reduce fraud
- Improve platform safety
- Attract quality users
- Enable premium features

## Approach

### Verification Types
1. **Identity Verification**
   - Email verification (already exists)
   - Phone verification
   - ID document verification
   - Address verification

2. **Background Checks** (Optional)
   - Criminal background check
   - Professional license verification
   - Reference checks

3. **Trust Indicators**
   - Verified badge
   - Trust score (based on reviews, completion rate, etc.)
   - Years on platform
   - Number of completed jobs

### Database Schema
```sql
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL, -- 'email', 'phone', 'id', 'address', 'background'
  status TEXT CHECK (status IN ('pending', 'verified', 'rejected', 'expired')) DEFAULT 'pending',
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score DECIMAL(3, 2) DEFAULT 0.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
```

### Features
1. **Verification Flow**
   - Request verification
   - Submit documents/info
   - Admin review (or automated)
   - Verification badge display
   - Verification expiry handling

2. **Trust Score Calculation**
   - Based on reviews (average rating)
   - Completion rate
   - Response time
   - Account age
   - Verification status

3. **UI Elements**
   - Verification badges
   - Trust score display
   - Verification status page
   - Verification requirements

## Dependencies
- Profile system (already exists)
- Reviews system (for trust score)
- Admin panel (for verification review)
- Third-party verification service (optional)

## Implementation Steps
1. Design verification schema
2. Create verification request flow
3. Build verification UI
4. Implement trust score calculation
5. Add verification badges
6. Create admin verification review
7. Add verification to search/filters
8. Test verification workflows

## Notes
- Start with basic verification (email, phone)
- Consider using third-party services (Onfido, Jumio) for ID verification
- Trust score algorithm should be transparent
- May want to add verification as a premium feature
- Should respect privacy (minimal data collection)
- Consider adding verification for businesses vs individuals

