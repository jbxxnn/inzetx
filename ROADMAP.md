# Klusbaar MVP Implementation Roadmap

This roadmap breaks down the implementation into phases with checkable tasks. Work through them sequentially, checking off items as you complete them.

---

## Phase 1: Foundation & Environment Setup ✅

### Environment Variables
- [x] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [x] Add `OPENAI_API_KEY` to `.env.local`
- [x] Verify existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set
- [x] Document all required env vars in a `.env.example` file (optional but helpful)

### Supabase Project Setup
- [x] Open Supabase SQL Editor
- [x] Enable pgvector extension: `CREATE EXTENSION IF NOT EXISTS "vector";`
- [x] Verify extension is enabled (check in Supabase dashboard)

---

## Phase 2: Database Schema & Security ✅

### Create Tables
- [x] Create `profiles` table (see `implementation.md` section 3.2)
- [x] Create `freelancer_profiles` table with vector column
- [x] Create `job_requests` table with vector column
- [x] Create `job_invites` table
- [x] Create `bookings` table
- [x] Verify all tables exist in Supabase Table Editor

### Create Vector Indexes
- [x] Create `freelancer_profiles_embedding_idx` index (ivfflat, vector_cosine_ops)
- [x] Create `job_requests_embedding_idx` index (ivfflat, vector_cosine_ops)
- [x] Verify indexes are created (check in Supabase dashboard)

### Enable Row-Level Security
- [x] Enable RLS on `profiles` table
- [x] Enable RLS on `freelancer_profiles` table
- [x] Enable RLS on `job_requests` table
- [x] Enable RLS on `job_invites` table
- [x] Enable RLS on `bookings` table

### Create RLS Policies
- [x] Create `select_own_profile` policy on `profiles`
- [x] Create `update_own_profile` policy on `profiles`
- [x] Create `freelancer_manage_own_profile` policy on `freelancer_profiles`
- [x] Create `read_all_freelancers` policy on `freelancer_profiles`
- [x] Create policies for `job_requests` (client can only see/manage their own)
- [x] Create policies for `job_invites` (visible to client or invited freelancer)
- [x] Create policies for `bookings` (visible to client or freelancer involved)

### Create Matching RPC Function
- [x] Create `match_freelancers` RPC function in Supabase SQL Editor
- [x] Test the RPC function manually with a sample embedding (optional but recommended)

---

## Phase 3: Backend Infrastructure ✅

### Install Dependencies
- [x] Run `npm install ai @ai-sdk/openai zod`
- [x] Verify packages are added to `package.json`

### Supabase Admin Client
- [x] Create `lib/supabase/admin.ts` file
- [x] Implement `supabaseAdmin` client using service role key
- [x] Add JSDoc comments explaining when to use this client
- [x] Verify the file exports correctly

### AI Configuration
- [x] Create `lib/ai.ts` file
- [x] Configure `aiProvider` (OpenAI)
- [x] Configure `embeddingModel` (text-embedding-3-small)
- [x] Configure `textModel` (gpt-4o-mini)
- [x] Add `FREELANCER_ANALYSIS_SYSTEM_PROMPT` constant
- [x] Add `MATCH_EXPLANATION_SYSTEM_PROMPT` constant
- [x] Test that imports work (no TypeScript errors)

### Prompt Helpers
- [x] Create `lib/prompts.ts` file
- [x] Implement `generateFreelancerHeadline` function
- [x] Implement `generateSkillTags` function (with Zod schema)
- [x] Implement `generateMatchExplanation` function
- [x] Test each function with sample inputs (optional manual test)

---

## Phase 4: Server Actions ✅

### Profile Management
- [x] Create `app/actions/profile.ts` file
- [x] Implement `ensureProfile` server action
- [x] Add error handling for unauthenticated users
- [x] Test the action manually (create a test script or use a route handler temporarily)

### Freelancer Profile Actions
- [x] Create `app/actions/freelancer.ts` file
- [x] Implement `upsertFreelancerProfile` server action
- [x] Add embedding generation step
- [x] Add parallel headline and tags generation
- [x] Add error handling for Supabase operations
- [x] Test with a sample profile (description, availability, location)

### Job Request Actions
- [x] Create `app/actions/job.ts` file
- [x] Implement `createJobRequest` server action
- [x] Add embedding generation after initial insert
- [x] Add error handling for insert and update operations
- [x] Test with a sample job request

### Matching Actions
- [x] Create `app/actions/matching.ts` file
- [x] Implement `findMatchesForJob` server action
- [x] Add embedding generation for job description
- [x] Add RPC call to `match_freelancers`
- [x] Add parallel explanation generation for each match
- [x] Test with a sample job description and existing freelancer profiles

### Invite & Booking Actions (MVP-level)
- [x] Create `app/actions/invite.ts` file (or add to existing actions file)
- [x] Implement `createJobInvite` server action
- [x] Create `app/actions/booking.ts` file (or add to existing actions file)
- [x] Implement `createBooking` server action
- [x] Add basic validation (e.g., check if invite exists before creating booking)

---

## Phase 5: UI - Dashboard & Role Selection ✅

### Update Protected Dashboard
- [x] Update `app/protected/page.tsx` to show user info
- [x] Add role selection UI (client / freelancer buttons)
- [x] Integrate `ensureProfile` action on role selection
- [x] Add navigation links to freelancer profile and job creation pages
- [x] Test role selection flow (sign in → select role → see appropriate links)

---

## Phase 6: UI - Freelancer Profile Flow ✅

### Freelancer Profile Page
- [x] Create `app/protected/freelancer/profile/page.tsx` (server component)
- [x] Load user's profile and check role is 'freelancer'
- [x] Load existing `freelancer_profiles` data if present
- [x] Redirect to dashboard if role is not 'freelancer'

### Freelancer Profile Form Component
- [x] Create `components/FreelancerProfileForm.tsx` (client component)
- [x] Add description textarea field
- [x] Add availability input (JSONB structure - simple form fields)
- [x] Add location input (city, postcode - Almere focused)
- [x] Add form validation
- [x] Integrate `upsertFreelancerProfile` action on submit
- [x] Show loading state during submission
- [x] Display generated headline and tags after successful save
- [x] Show error messages if submission fails
- [x] Pre-fill form if profile already exists

### Test Freelancer Flow
- [ ] Sign up as a new user
- [ ] Select role = freelancer
- [ ] Navigate to freelancer profile page
- [ ] Fill out and submit profile
- [ ] Verify headline and tags are generated and displayed
- [ ] Verify profile is saved in Supabase
- [ ] Edit profile and verify update works

---

## Phase 7: UI - Client Job Request Flow ✅

### Job Request Creation Page
- [x] Create `app/protected/jobs/new/page.tsx` (server component)
- [x] Ensure user has role = 'client' (redirect if not)
- [x] Create `components/JobRequestForm.tsx` (client component)
- [x] Add description textarea field
- [x] Add location input (city, postcode - Almere)
- [x] Add time window input (start/end date-time or simple text)
- [x] Add budget input (text field for now)
- [x] Add form validation
- [x] Integrate `createJobRequest` action on submit
- [x] Show loading state during submission
- [x] Redirect to job detail page after successful creation
- [x] Show error messages if submission fails

### Job Detail Page
- [x] Create `app/protected/jobs/[id]/page.tsx` (server component)
- [x] Load job request data by ID
- [x] Verify user owns the job (RLS should handle this, but add UI check)
- [x] Display job details (description, location, time window, budget)
- [x] Add "Find Matches" button/link
- [x] Link to `/protected/jobs/[id]/matches` page

### Job Matches Page
- [x] Create `app/protected/jobs/[id]/matches/page.tsx` (server component)
- [x] Load job request data
- [x] Call `findMatchesForJobRequest` action
- [x] Display matches as cards with:
  - Headline
  - Skills (as badges/tags)
  - Similarity score (optional, or just show as "Good match")
  - Explanation text
  - "Invite" button
- [x] Handle empty matches state (no freelancers found)
- [x] Add loading state while fetching matches
- [x] Integrate `createJobInvite` action on "Invite" button click
- [x] Update UI to show invite status (pending/invited)

### Jobs Listing Page
- [x] Create `app/protected/jobs/page.tsx` (server component)
- [x] Display all jobs for the client
- [x] Add "Post a Job" button
- [x] Link to job detail and matches pages

### Test Client Flow
- [ ] Sign up as a new user (or use different account)
- [ ] Select role = client
- [ ] Navigate to create job page
- [ ] Fill out and submit job request
- [ ] Verify job is saved in Supabase
- [ ] Navigate to job detail page
- [ ] Click "Find Matches"
- [ ] Verify matches are displayed with explanations
- [ ] Click "Invite" on a freelancer
- [ ] Verify invite is created in Supabase

---

## Phase 8: UI - Bookings Overview ✅

### Bookings Page
- [x] Create `app/protected/bookings/page.tsx` (server component)
- [x] Load user's profile to determine role
- [x] Query bookings:
  - If client: where `client_profile_id` = user's profile
  - If freelancer: where `freelancer_profile_id` = user's freelancer profile
- [x] Display bookings in a list/table:
  - Job description (or link to job)
  - Other party (client name or freelancer name)
  - Scheduled time
  - Status (upcoming/completed/cancelled)
- [x] Add empty state if no bookings exist
- [x] Style bookings list appropriately

### Test Bookings Flow
- [ ] Create a booking manually in Supabase (or via action)
- [ ] View bookings page as client
- [ ] View bookings page as freelancer
- [ ] Verify only relevant bookings are shown

---

## Phase 9: Optional Features

### Job Refinement Chat (Optional)
- [ ] Create `app/api/ai/refine-job/route.ts` API route
- [ ] Implement `streamText` endpoint for job description refinement
- [ ] Create `components/JobRefinementChat.tsx` component
- [ ] Use `useChat` hook from Vercel AI SDK
- [ ] Integrate chat component into `JobRequestForm`
- [ ] Add "Copy refined text" functionality
- [ ] Test chat flow end-to-end

---

## Phase 10: Testing & Validation

### Security Testing
- [ ] Test RLS policies:
  - Try to access another user's profile (should fail)
  - Try to access another user's job requests (should fail)
  - Verify freelancer profiles are publicly readable
  - Verify invites/bookings are only visible to involved parties
- [ ] Test authentication:
  - Unauthenticated users cannot access protected routes
  - Authenticated users can only see their own data

### End-to-End Flow Testing
- [ ] **Complete freelancer flow:**
  - Sign up → select freelancer role → create profile → verify AI enrichment
- [ ] **Complete client flow:**
  - Sign up → select client role → create job → find matches → invite freelancer
- [ ] **Cross-user testing:**
  - Create multiple users (freelancers and clients)
  - Create multiple profiles and jobs
  - Verify matching works across different users
  - Verify invites work correctly

### Error Handling Testing
- [ ] Test with invalid inputs (empty descriptions, etc.)
- [ ] Test with missing environment variables
- [ ] Test with Supabase connection errors (graceful degradation)
- [ ] Test with OpenAI API errors (show user-friendly messages)

### Performance Testing (Basic)
- [ ] Test matching performance with 10+ freelancer profiles
- [ ] Verify vector search completes in reasonable time (< 2 seconds)
- [ ] Check AI generation times (headlines, tags, explanations)

---

## Phase 11: Documentation & Cleanup

### Code Documentation
- [ ] Add JSDoc comments to all server actions
- [ ] Add inline comments for complex logic
- [ ] Document any deviations from `implementation.md`

### Update Implementation.md
- [ ] Review `implementation.md` and update with actual implementation details
- [ ] Note any field name changes or schema adjustments
- [ ] Document any UI/UX decisions made during implementation

### README Updates
- [ ] Update `README.md` if needed (or keep as-is if it's already accurate)
- [ ] Add any additional setup steps discovered during implementation

### Code Cleanup
- [ ] Remove any temporary test files or console.logs
- [ ] Ensure consistent code formatting (run linter if available)
- [ ] Check for unused imports or dead code

---

## Phase 12: Deployment Preparation

### Environment Variables for Production
- [ ] Add all required env vars to Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
- [ ] Verify env vars are set correctly in Vercel dashboard

### Supabase Production Setup
- [ ] Apply all SQL schema changes to production Supabase project
- [ ] Enable pgvector extension in production
- [ ] Create all tables in production
- [ ] Create all indexes in production
- [ ] Enable RLS and create all policies in production
- [ ] Create `match_freelancers` RPC in production
- [ ] Test production database connection

### Vercel Configuration
- [ ] Set `maxDuration = 30` on any route handlers that use AI (if needed)
- [ ] Verify build succeeds: `npm run build`
- [ ] Check for any build warnings or errors

### Pre-Deployment Checklist
- [ ] All tests pass locally
- [ ] No console errors in browser
- [ ] All environment variables are configured
- [ ] Database schema is applied to production
- [ ] Build succeeds without errors

---

## Phase 13: Deployment & Post-Deployment

### Deploy to Vercel
- [ ] Push code to main branch (or trigger deployment)
- [ ] Monitor deployment logs for errors
- [ ] Verify deployment URL is accessible

### Post-Deployment Testing
- [ ] Test authentication flow on production
- [ ] Test freelancer profile creation on production
- [ ] Test job request creation on production
- [ ] Test matching functionality on production
- [ ] Verify AI generation works (headlines, tags, explanations)
- [ ] Test invites and bookings on production

### Monitor & Fix Issues
- [ ] Check Vercel function logs for errors
- [ ] Check Supabase logs for database errors
- [ ] Monitor OpenAI API usage and costs
- [ ] Fix any production-specific issues

---

## Notes

- **Order matters**: Complete phases sequentially, as later phases depend on earlier ones.
- **Testing**: Test each phase before moving to the next.
- **Documentation**: Update `implementation.md` as you make decisions or changes.
- **Flexibility**: Some tasks can be done in parallel (e.g., UI components can be built while testing server actions).

---

## Quick Reference

- **Database Schema**: See `implementation.md` section 3
- **RLS Policies**: See `implementation.md` section 4
- **Server Actions**: See `implementation.md` section 7
- **UI Routes**: See `implementation.md` section 8
- **AI Layer**: See `implementation.md` section 6

---

**Last Updated**: [Date when roadmap was created or last modified]

