# Klusbaar MVP Testing Checklist

This document helps you test all the features we've implemented so far.

## Prerequisites

- [ ] Dev server is running (`npm run dev`)
- [ ] Environment variables are set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
- [ ] Database schema is applied in Supabase (all tables, RLS policies, RPC function)

---

## Test 1: Authentication Flow

### Sign Up
- [ ] Navigate to `http://localhost:3000`
- [ ] Click "Sign up"
- [ ] Enter email and password
- [ ] Submit form
- [ ] Verify you're redirected to `/protected` or `/auth/sign-up-success`
- [ ] Check that you can see the dashboard

### Sign In
- [ ] Log out if logged in
- [ ] Navigate to `/auth/login`
- [ ] Enter credentials
- [ ] Submit form
- [ ] Verify you're redirected to `/protected`
- [ ] Check that you can see the dashboard

---

## Test 2: Dashboard & Role Selection

### Access Dashboard
- [ ] Navigate to `/protected` while logged in
- [ ] Verify you see "Dashboard" heading
- [ ] Verify you see your email address

### Role Selection (New User)
- [ ] If you don't have a role yet, you should see two cards:
  - "I need help" (Client)
  - "I want to offer services" (Freelancer)
- [ ] Click on "I want to offer services"
- [ ] Verify loading state appears
- [ ] Verify role is set and you see navigation links:
  - "Manage Your Profile"
  - "View Bookings"

### Role Selection (Client)
- [ ] Log out and create a new account OR manually set role to 'client' in Supabase
- [ ] Log in and go to `/protected`
- [ ] Verify you see "Your Role: client"
- [ ] Verify you see navigation links:
  - "Post a Job"
  - "My Jobs"
  - "View Bookings"

---

## Test 3: Freelancer Profile Flow

### Access Profile Page
- [ ] Log in as a freelancer (or select freelancer role)
- [ ] Click "Manage Your Profile" from dashboard
- [ ] Verify you're on `/protected/freelancer/profile`
- [ ] Verify page loads without errors

### Create Profile
- [ ] Fill in the description field with a detailed description, e.g.:
  ```
  Experienced handyman with 10 years of experience in home repairs, 
  furniture assembly, and general maintenance. I specialize in 
  fixing broken furniture, mounting TVs, and small electrical work. 
  Available evenings and weekends.
  ```
- [ ] Verify city defaults to "Almere" (or set it)
- [ ] Enter a postcode (e.g., "1312 AB")
- [ ] Add availability notes (e.g., "Available evenings and weekends")
- [ ] Click "Save Profile"
- [ ] Verify loading state appears
- [ ] Verify success message appears
- [ ] Verify AI-generated content card appears with:
  - Headline (should be a short, compelling title)
  - Skills (should be 1-5 skill tags as badges)

### Verify in Supabase
- [ ] Open Supabase dashboard
- [ ] Go to Table Editor → `freelancer_profiles`
- [ ] Find your profile
- [ ] Verify:
  - `description` is saved
  - `headline` is populated (AI-generated)
  - `skills` array has items (AI-generated)
  - `embedding` column has data (vector)
  - `location` JSONB has city and postcode
  - `availability` JSONB has your notes

### Edit Profile
- [ ] Go back to `/protected/freelancer/profile`
- [ ] Verify form is pre-filled with your data
- [ ] Modify the description
- [ ] Click "Save Profile"
- [ ] Verify updated headline and skills appear
- [ ] Verify data is updated in Supabase

---

## Test 4: Server Actions (Manual Testing)

### Test Profile Action
- [ ] In browser console or a test route, try calling:
  ```typescript
  // This should work if you're authenticated
  const { ensureProfile } = await import('@/app/actions/profile');
  const profile = await ensureProfile('freelancer');
  console.log(profile);
  ```

### Test Freelancer Profile Action
- [ ] Verify `upsertFreelancerProfile` works:
  - Creates embedding
  - Generates headline
  - Generates skills
  - Saves to database

---

## Test 5: Error Handling

### Authentication Errors
- [ ] Try accessing `/protected` without being logged in
- [ ] Verify you're redirected to `/auth/login`

### Role Errors
- [ ] Try accessing `/protected/freelancer/profile` as a client
- [ ] Verify you're redirected to `/protected`

### Form Validation
- [ ] Try submitting freelancer profile form with empty description
- [ ] Verify error message appears
- [ ] Fill in description and submit
- [ ] Verify form submits successfully

---

## Test 6: Database & RLS

### Row-Level Security
- [ ] Create two different user accounts
- [ ] As User A, create a freelancer profile
- [ ] As User B, try to access User A's profile via Supabase client
- [ ] Verify RLS prevents unauthorized access

### Vector Search (Manual)
- [ ] In Supabase SQL Editor, test the `match_freelancers` function:
  ```sql
  -- You'll need a sample embedding vector (1536 dimensions)
  -- This is just to verify the function exists and works
  SELECT * FROM match_freelancers(
    (SELECT embedding FROM freelancer_profiles LIMIT 1),
    0.3,
    5
  );
  ```

---

## Common Issues & Solutions

### Issue: "Not authenticated" error
- **Solution**: Check that you're logged in and session is valid
- **Check**: Verify Supabase auth is working

### Issue: AI generation fails
- **Solution**: Verify `OPENAI_API_KEY` is set correctly
- **Check**: Check browser console for API errors
- **Check**: Verify you have OpenAI API credits

### Issue: Database errors
- **Solution**: Verify all tables exist in Supabase
- **Solution**: Check RLS policies are created
- **Solution**: Verify `match_freelancers` RPC function exists

### Issue: TypeScript errors
- **Solution**: Run `npx tsc --noEmit` to check for type errors
- **Solution**: Verify all imports are correct

### Issue: Form doesn't submit
- **Solution**: Check browser console for errors
- **Solution**: Verify server actions are properly exported
- **Solution**: Check network tab for failed requests

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Fix any bugs found
2. ✅ Document any issues
3. ✅ Move to Phase 7: Client Job Request Flow

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

