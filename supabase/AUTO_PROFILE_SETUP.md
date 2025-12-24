# Auto-Create Profiles on User Signup

## Problem
By default, Supabase only creates a row in `auth.users` when a user signs up. It doesn't automatically create a corresponding row in the `profiles` table.

## Solution
We've added a database trigger that automatically creates a profile row (with `role = NULL`) whenever a new user signs up.

## Changes Made

### 1. Schema Update (`supabase/schema.sql`)
- Made `role` column nullable in `profiles` table (was `NOT NULL`, now allows `NULL`)
- Added `handle_new_user()` function that creates a profile on signup
- Added `on_auth_user_created` trigger that fires after user creation

### 2. Migration Script (`supabase/migrations/001_auto_create_profiles.sql`)
- For existing databases, run this to:
  - Make role nullable
  - Create the trigger function
  - Create the trigger
  - Backfill profiles for existing users

## How It Works

1. **User signs up** → Row created in `auth.users`
2. **Trigger fires** → `handle_new_user()` function executes
3. **Profile created** → Row created in `profiles` with `role = NULL`
4. **User selects role** → `ensureProfile()` updates the profile with the selected role

## Applying the Changes

### For New Databases
If you're setting up a fresh database, just run the updated `supabase/schema.sql` file. It includes everything.

### For Existing Databases
Run the migration script in Supabase SQL Editor:

```sql
-- Run: supabase/migrations/001_auto_create_profiles.sql
```

This will:
- Make role nullable
- Create the trigger
- Create profiles for any existing users who don't have one

## Testing

1. **Sign up a new user**
2. **Check Supabase Table Editor** → `profiles` table
3. **Verify** a profile row was created automatically with:
   - `user_id` matching the new user
   - `role` = `NULL`
4. **Select a role** in the app
5. **Verify** the role is updated in the profile

## Notes

- The profile is created with `role = NULL` initially
- Users must select their role (client or freelancer) in the app
- The `ensureProfile()` server action handles updating the role
- The trigger uses `ON CONFLICT DO NOTHING` to prevent errors if a profile already exists

