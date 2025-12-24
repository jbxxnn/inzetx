# Freelancer UX Implementation Plan

## Overview

Transform the freelancer profile creation from a single form to a **guided multi-step wizard** that collects all necessary information in a user-friendly way.

---

## Current State vs. New UX

### Current Flow
- Single form with all fields at once
- Description, location, availability in one screen
- AI enrichment happens on save

### New Flow
- Multi-step wizard (6 steps)
- Each step focuses on one aspect
- Progressive disclosure of information
- Preview before going live

---

## Implementation Steps

### Step 1: Basic Account Info
**Fields:**
- Full name (from profiles table or new field)
- Profile photo (upload)
- Phone number (new field)
- Languages spoken (new field, multi-select)

**Database Changes:**
- Add `phone_number` to `profiles` table
- Add `languages` to `profiles` table (TEXT[])

### Step 2: What Can You Help With
**Fields:**
- Large text area for description
- Example tasks as chips (clickable suggestions)
- User can add custom tasks

**Database:**
- Uses existing `description` field
- Add `example_tasks` to `freelancer_profiles` (TEXT[])

### Step 3: Location & Service Area
**Fields:**
- Postcode or district in Almere
- Travel radius (slider or options)
- Map preview (optional, can be static)

**Database:**
- Uses existing `location` JSONB field
- Add `travel_radius` to location object

### Step 4: Availability
**Fields:**
- Weekly grid (Mon-Sun × Morning/Afternoon/Evening)
- "Available on short notice?" toggle

**Database:**
- Uses existing `availability` JSONB field
- Structure: `{ days: { monday: ['morning', 'afternoon'], ... }, short_notice: boolean }`

### Step 5: Pricing Style
**Fields:**
- Radio: "Hourly rate" or "Per task, discussed with client"
- If hourly: number input for rate

**Database:**
- Add `pricing_style` to `freelancer_profiles` (TEXT)
- Add `hourly_rate` to `freelancer_profiles` (NUMERIC, nullable)

### Step 6: Profile Preview & Confirm
**Display:**
- Profile card preview (how clients will see it)
- All collected information
- Editable headline
- "Edit something" or "Looks good, go live" buttons

**Database:**
- Add `is_active` to `freelancer_profiles` (BOOLEAN, default false)

---

## Component Structure

```
components/
├── freelancer-wizard/
│   ├── FreelancerWizard.tsx (main wizard component)
│   ├── Step1BasicInfo.tsx
│   ├── Step2Description.tsx
│   ├── Step3Location.tsx
│   ├── Step4Availability.tsx
│   ├── Step5Pricing.tsx
│   └── Step6Preview.tsx
```

---

## Database Migration Needed

```sql
-- Add new fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[];

-- Add new fields to freelancer_profiles table
ALTER TABLE freelancer_profiles
ADD COLUMN IF NOT EXISTS example_tasks TEXT[],
ADD COLUMN IF NOT EXISTS pricing_style TEXT,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
```

---

## Implementation Order

1. Create wizard structure and navigation
2. Implement Step 1 (Basic Info)
3. Implement Step 2 (Description)
4. Implement Step 3 (Location)
5. Implement Step 4 (Availability)
6. Implement Step 5 (Pricing)
7. Implement Step 6 (Preview)
8. Update database schema
9. Update server actions
10. Test complete flow


