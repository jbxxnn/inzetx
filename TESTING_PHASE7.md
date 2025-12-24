# Phase 7 Testing Checklist: Client Job Request Flow

## Prerequisites

- [ ] You have at least one freelancer profile created (for matching to work)
- [ ] You're logged in as a user with `role = 'client'`
- [ ] Database has the UNIQUE constraint on `freelancer_profiles.profile_id` (from earlier fix)
- [ ] Dev server is running (`npm run dev`)

---

## Test 1: Create Job Request

### Navigate to Create Job Page
- [ ] Go to `/protected/jobs/new`
- [ ] Verify page loads without errors
- [ ] Verify you see the "Post a Job" form

### Fill Out Job Request Form
- [ ] Enter a detailed description, e.g.:
  ```
  I need help assembling IKEA furniture this weekend. 
  I have a bookshelf and a desk that need to be put together. 
  Looking for someone with experience in furniture assembly.
  ```
- [ ] Verify city defaults to "Almere" (or set it)
- [ ] Enter a postcode (e.g., "1312 AB")
- [ ] Set a start time (datetime picker)
- [ ] Set an end time (datetime picker)
- [ ] Add time notes (optional, e.g., "Weekend preferred")
- [ ] Enter a budget (e.g., "€50-100" or "Negotiable")

### Submit Form
- [ ] Click "Create Job Request"
- [ ] Verify loading state appears ("Creating job request...")
- [ ] Verify you're redirected to `/protected/jobs/[id]` (job detail page)
- [ ] Verify no errors occurred

### Verify in Supabase
- [ ] Open Supabase Table Editor → `job_requests`
- [ ] Find your newly created job
- [ ] Verify:
  - `description` is saved correctly
  - `location` JSONB has city and postcode
  - `time_window` JSONB has start, end, and notes
  - `budget` is saved
  - `embedding` column has data (vector)
  - `client_profile_id` matches your profile

---

## Test 2: View Job Details

### Access Job Detail Page
- [ ] You should be on `/protected/jobs/[id]` after creating a job
- [ ] Verify page loads without errors
- [ ] Verify you see:
  - Job description
  - Location (city, postcode)
  - Time window (start, end, notes)
  - Budget
  - "Find Matches" button
  - "Back to Jobs" button

### Navigation
- [ ] Click "Back to Jobs"
- [ ] Verify you're redirected to `/protected/jobs`
- [ ] Verify you see your job in the list

---

## Test 3: Jobs Listing Page

### View All Jobs
- [ ] Navigate to `/protected/jobs`
- [ ] Verify page loads
- [ ] Verify you see:
  - "My Jobs" heading
  - "Post a Job" button
  - Your created job(s) displayed as cards

### Job Cards
- [ ] Verify each job card shows:
  - Truncated description
  - Location (city)
  - "View" button
  - "Find Matches" button

### Create Another Job
- [ ] Click "Post a Job" button
- [ ] Create a second job with different details
- [ ] Verify it appears in the jobs list

---

## Test 4: Find Matches (Requires Freelancer Profiles)

### Prerequisites for This Test
- [ ] You need at least one freelancer profile in the database
- [ ] The freelancer profile should have:
  - A description that matches your job description (for good matches)
  - An embedding generated
  - Headline and skills

### Access Matches Page
- [ ] Go to a job detail page (`/protected/jobs/[id]`)
- [ ] Click "Find Matches" button
- [ ] Verify you're redirected to `/protected/jobs/[id]/matches`

### View Matches
- [ ] Verify page loads (may take a few seconds for AI matching)
- [ ] If matches are found, verify you see:
  - Freelancer cards with:
    - Headline
    - Skills as badges
    - Similarity/match percentage
    - "Why this match" explanation
    - "Send Invite" button

### No Matches Scenario
- [ ] If no matches found, verify you see:
  - "No matching freelancers found at this time" message
  - Helpful text about adjusting description

---

## Test 5: Send Invites

### Send an Invite
- [ ] On the matches page, click "Send Invite" on a freelancer
- [ ] Verify loading state appears ("Sending...")
- [ ] Verify button changes to "Invited" with checkmark
- [ ] Verify button is disabled (can't invite twice)

### Verify in Supabase
- [ ] Open Supabase Table Editor → `job_invites`
- [ ] Find the invite you just created
- [ ] Verify:
  - `job_request_id` matches your job
  - `freelancer_profile_id` matches the freelancer
  - `status` = 'pending'

### Multiple Invites
- [ ] Send invites to multiple freelancers
- [ ] Verify all show as "Invited"
- [ ] Verify all are saved in `job_invites` table

---

## Test 6: Error Handling

### Form Validation
- [ ] Try submitting job form with empty description
- [ ] Verify error message appears
- [ ] Fill in description and submit
- [ ] Verify form submits successfully

### Unauthorized Access
- [ ] Try accessing `/protected/jobs/new` as a freelancer (not client)
- [ ] Verify you're redirected to `/protected`
- [ ] Try accessing another client's job: `/protected/jobs/[other-client-job-id]`
- [ ] Verify you're redirected (RLS should prevent access)

### Network Errors
- [ ] Disconnect internet (or block API calls)
- [ ] Try creating a job
- [ ] Verify error message appears
- [ ] Reconnect and verify it works

---

## Test 7: Edge Cases

### Very Long Description
- [ ] Create a job with a very long description (500+ words)
- [ ] Verify it saves correctly
- [ ] Verify embedding is generated
- [ ] Verify matching still works

### Special Characters
- [ ] Create a job with special characters in description
- [ ] Verify it saves and displays correctly

### Empty Optional Fields
- [ ] Create a job with only description and city (no postcode, time, budget)
- [ ] Verify it saves correctly
- [ ] Verify job detail page handles missing fields gracefully

---

## Test 8: Integration with Freelancer Flow

### End-to-End Test
1. [ ] Create a freelancer account and profile
2. [ ] Create a client account
3. [ ] As client, create a job that matches the freelancer's skills
4. [ ] Find matches for the job
5. [ ] Verify the freelancer appears in matches
6. [ ] Send invite to the freelancer
7. [ ] Verify invite is created in database

---

## Common Issues & Solutions

### Issue: "No matching freelancers found"
**Possible causes:**
- No freelancer profiles exist yet
- Freelancer profiles don't have embeddings
- Job description doesn't match any freelancer skills
- Similarity threshold is too high

**Solutions:**
- Create at least one freelancer profile first
- Make sure freelancer profile has a good description
- Try lowering the threshold in `findMatchesForJobRequest` (default is 0.3)

### Issue: Matches page takes too long to load
**Possible causes:**
- AI explanation generation is slow
- Many freelancers to match against
- Network latency

**Solutions:**
- This is expected - AI generation takes time
- Consider adding a loading skeleton
- Matches are generated in parallel, so it should be reasonable

### Issue: "Job request does not have an embedding"
**Possible causes:**
- Embedding generation failed during job creation
- Database issue

**Solutions:**
- Check Supabase logs
- Verify `OPENAI_API_KEY` is set correctly
- Try creating the job again

### Issue: Invite button doesn't update
**Possible causes:**
- Client-side state not updating
- Server action error

**Solutions:**
- Check browser console for errors
- Verify `createJobInvite` action is working
- Check network tab for failed requests

---

## Success Criteria

Phase 7 is successful if:
- ✅ Clients can create job requests
- ✅ Job requests are saved with embeddings
- ✅ Clients can view their jobs
- ✅ Matching finds relevant freelancers
- ✅ AI explanations are generated
- ✅ Invites can be sent to freelancers
- ✅ Invite status is tracked correctly

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Document any bugs found
2. ✅ Fix any issues
3. ✅ Move to Phase 8: Bookings Overview

---

## Test Results

**Date**: _______________
**Tester**: _______________

### Summary
- [ ] All tests passed
- [ ] Some tests failed (see notes below)
- [ ] Blocking issues found

### Notes
_________________________________________________
_________________________________________________
_________________________________________________


