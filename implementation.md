## Klusbaar MVP Implementation

This document explains how the Klusbaar local services marketplace MVP is implemented on top of the existing **Next.js + Supabase Starter** in this repo. It complements `README.md` by describing concrete files, flows, and decisions.

---

### 1. Overview & Assumptions

- **Base**: This project started from the `nextjs-supabase-starter` template.
- **Auth**: Supabase email/password auth is already wired with:
  - `lib/supabase/client.ts` (browser client via `@supabase/ssr`)
  - `lib/supabase/server.ts` (server-side client via `@supabase/ssr`)
  - `lib/supabase/proxy.ts` for middleware/session refresh
- **Goal**: Add the Klusbaar MVP:
  - AI-enriched **freelancer profiles**
  - **job requests** created by clients
  - **vector-based matching** (pgvector + Vercel AI SDK)
  - Basic **invites** and **bookings**
  - Documented flows and architecture

---

### 2. Environment & Keys

We use two classes of Supabase keys plus the OpenAI key:

- **Public keys** (already used by the starter):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Server-only key**:
  - `SUPABASE_SERVICE_ROLE_KEY` (never exposed to the browser)
- **AI key**:
  - `OPENAI_API_KEY`

Example `.env.local`:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_or_publishable_key

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-...On Vercel, configure the same variables under **Project Settings → Environment Variables**.

---

### 3. Database Schema (Supabase)

All SQL is applied in the Supabase SQL editor (or managed via migrations). The logical model matches `README.md`.

#### 3.1 Enable pgvector

CREATE EXTENSION IF NOT EXISTS "vector";#### 3.2 Tables

**profiles**

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('client', 'freelancer')) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);**freelancer_profiles**

CREATE TABLE freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,
  description TEXT NOT NULL,
  skills TEXT[],
  availability JSONB,
  location JSONB,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX freelancer_profiles_embedding_idx
ON freelancer_profiles
USING ivfflat (embedding vector_cosine_ops);**job_requests**

CREATE TABLE job_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  location JSONB,
  time_window JSONB,
  budget TEXT,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX job_requests_embedding_idx
ON job_requests
USING ivfflat (embedding vector_cosine_ops);**job_invites**

CREATE TABLE job_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);**bookings**

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  client_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming',
  scheduled_time JSONB,
  created_at TIMESTAMP DEFAULT now()
);---

### 4. Row-Level Security (RLS) & Policies

Enable RLS on all domain tables:

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;#### 4.1 `profiles` policies

User can see and update only their own profile:

CREATE POLICY "select_own_profile"
ON profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "update_own_profile"
ON profiles
FOR UPDATE
USING (user_id = auth.uid());#### 4.2 `freelancer_profiles` policies

Freelancer manages their own profile; everyone can read:

CREATE POLICY "freelancer_manage_own_profile"
ON freelancer_profiles
FOR ALL
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'freelancer'
  )
)
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'freelancer'
  )
);

CREATE POLICY "read_all_freelancers"
ON freelancer_profiles
FOR SELECT
USING (true);#### 4.3 `job_requests`, `job_invites`, `bookings` policies (conceptual)

- `job_requests`: client can read/manage only rows where `client_profile_id` is their profile.
- `job_invites`:
  - visible to the client (owner of the job) or the invited freelancer.
- `bookings`:
  - visible to the client or freelancer involved.

You can refine these as needed, but the principle is: **only involved parties see rows**.

---

### 5. Supabase Clients in Code

We separate:

- **SSR/browser clients** (already in the starter) for regular user-scoped operations.
- **Admin client** (new) for AI/matching flows requiring elevated access.

#### 5.1 Existing SSR clients

- `lib/supabase/client.ts` → `createBrowserClient` with `NEXT_PUBLIC_SUPABASE_*`.
- `lib/supabase/server.ts` → `createServerClient` with `cookies()`.

These are used in:

- `components/auth-button.tsx`
- `app/protected/page.tsx`
- Auth pages (`app/auth/*`)

#### 5.2 Admin client (service role)

Create `lib/supabase/admin.ts`:

// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});Usage:

- Only in server actions / route handlers (`'use server'` or `app/api/.../route.ts`).
- Never imported into client components.

---

### 6. AI Layer (Vercel AI SDK)

#### 6.1 Dependencies

In `package.json`:

npm install ai @ai-sdk/openai zod#### 6.2 `lib/ai.ts`

// lib/ai.ts
import { openai } from '@ai-sdk/openai';

export const aiProvider = openai;

export const embeddingModel = aiProvider.textEmbeddingModel(
  'text-embedding-3-small'
);

export const textModel = aiProvider('gpt-4o-mini');

export const FREELANCER_ANALYSIS_SYSTEM_PROMPT = `You are an expert marketplace assistant that analyzes freelancer profiles.
Your role is to:
1. Extract key skills and expertise
2. Generate concise, compelling headlines (max 10 words)
3. Suggest relevant skill tags (1–5 tags)
Be precise and remove redundancy.`;

export const MATCH_EXPLANATION_SYSTEM_PROMPT = `You explain why a freelancer is a good match for a job in 1–2 sentences, focusing on relevant skills and experience.`;#### 6.3 `lib/prompts.ts`

// lib/prompts.ts
import { z } from 'zod';
import { generateText } from 'ai';
import {
  textModel,
  FREELANCER_ANALYSIS_SYSTEM_PROMPT,
  MATCH_EXPLANATION_SYSTEM_PROMPT,
} from './ai';

export async function generateFreelancerHeadline(description: string) {
  const { text } = await generateText({
    model: textModel,
    system: FREELANCER_ANALYSIS_SYSTEM_PROMPT,
    prompt: `Generate a short, punchy headline (max 10 words) for this freelancer profile:\n\n${description}`,
  });

  return text.trim();
}

const SkillsSchema = z.object({
  skills: z.array(z.string()).min(1).max(5),
});

export async function generateSkillTags(description: string): Promise<string[]> {
  const { object } = await generateText({
    model: textModel,
    system: FREELANCER_ANALYSIS_SYSTEM_PROMPT,
    prompt: `Extract 1–5 concise skill tags (as an array of short strings) for this freelancer profile:\n\n${description}`,
    schema: SkillsSchema,
  });

  return object.skills.map((s) => s.trim());
}

export async function generateMatchExplanation(
  jobDescription: string,
  freelancerDescription: string,
  skills: string[]
): Promise<string> {
  const { text } = await generateText({
    model: textModel,
    system: MATCH_EXPLANATION_SYSTEM_PROMPT,
    prompt: `Job description:\n${jobDescription}\n\nFreelancer description:\n${freelancerDescription}\n\nFreelancer skills: ${skills.join(
      ', '
    )}\n\nExplain in 1–2 sentences why this freelancer is a good match.`,
  });

  return text.trim();
}---

### 7. Server Actions & Domain Logic

We use App Router **Server Actions** in `app/actions/*`.

#### 7.1 Profiles & roles (`app/actions/profile.ts`)

Responsibilities:

- Ensure a `profiles` row exists for the authenticated user.
- Set or update `role` to `'client'` or `'freelancer'`.

Sketch:

// app/actions/profile.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function ensureProfile(role: 'client' | 'freelancer') {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({ user_id: user.id, role })
    .select()
    .single();

  if (error) throw error;
  return data;
}#### 7.2 Freelancer profiles (`app/actions/freelancer.ts`)

Implements AI enrichment + upsert:

// app/actions/freelancer.ts
'use server';

import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  generateFreelancerHeadline,
  generateSkillTags,
} from '@/lib/prompts';

export async function upsertFreelancerProfile(params: {
  profileId: string;
  description: string;
  availability: any;
  location: any;
}) {
  const { profileId, description, availability, location } = params;

  const { embedding } = await embed({
    model: embeddingModel,
    value: description,
  });

  const [headline, skills] = await Promise.all([
    generateFreelancerHeadline(description),
    generateSkillTags(description),
  ]);

  const { data, error } = await supabaseAdmin
    .from('freelancer_profiles')
    .upsert(
      {
        profile_id: profileId,
        description,
        availability,
        location,
        embedding,
        headline,
        skills,
      },
      { onConflict: 'profile_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}#### 7.3 Job requests (`app/actions/job.ts`)

// app/actions/job.ts
'use server';

import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function createJobRequest(params: {
  clientProfileId: string;
  description: string;
  location: any;
  timeWindow: any;
  budget?: string;
}) {
  const { clientProfileId, description, location, timeWindow, budget } = params;

  const { data: job, error: insertError } = await supabaseAdmin
    .from('job_requests')
    .insert({
      client_profile_id: clientProfileId,
      description,
      location,
      time_window: timeWindow,
      budget,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  const { embedding } = await embed({
    model: embeddingModel,
    value: description,
  });

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('job_requests')
    .update({ embedding })
    .eq('id', job.id)
    .select()
    .single();

  if (updateError) throw updateError;
  return updated;
}#### 7.4 Matching (`app/actions/matching.ts`)

Supabase RPC:

CREATE OR REPLACE FUNCTION match_freelancers(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE(
  id uuid,
  profile_id uuid,
  description text,
  headline text,
  skills text[],
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    fp.id,
    fp.profile_id,
    fp.description,
    fp.headline,
    fp.skills,
    1 - (fp.embedding <=> query_embedding) AS similarity
  FROM freelancer_profiles AS fp
  WHERE fp.embedding IS NOT NULL
    AND 1 - (fp.embedding <=> query_embedding) > match_threshold
  ORDER BY fp.embedding <=> query_embedding
  LIMIT match_count;
$$;Server action:

// app/actions/matching.ts
'use server';

import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateMatchExplanation } from '@/lib/prompts';

export async function findMatchesForJob(params: {
  jobDescription: string;
  limit?: number;
  threshold?: number;
}) {
  const { jobDescription, limit = 5, threshold = 0.3 } = params;

  const { embedding } = await embed({
    model: embeddingModel,
    value: jobDescription,
  });

  const { data: rows, error } = await supabaseAdmin.rpc(
    'match_freelancers',
    {
      query_embedding: embedding,
      match_threshold: 1 - threshold,
      match_count: limit,
    }
  );

  if (error) throw error;

  const matches = await Promise.all(
    rows.map(async (row: any) => ({
      freelancerProfileId: row.id,
      headline: row.headline,
      skills: row.skills,
      similarity: row.similarity,
      explanation: await generateMatchExplanation(
        jobDescription,
        row.description,
        row.skills || []
      ),
    }))
  );

  return matches;
}#### 7.5 Invites & bookings (MVP-level)

- `createJobInvite(jobRequestId, freelancerProfileId)`
- `createBooking(jobRequestId, freelancerProfileId)`

Both are simple inserts into `job_invites` / `bookings` with basic validations and RLS handling.

---

### 8. Routes & UI Structure

We build on the existing `app` routes.

#### 8.1 Auth & base

- `app/page.tsx` – starter landing page (can later be branded as Klusbaar).
- `app/auth/*` – login/signup/reset flows from the starter.
- `app/protected/layout.tsx` – authenticated layout with nav/footer.
- `app/protected/page.tsx` – now acts as a simple **dashboard**:
  - Shows user info.
  - Lets user choose a role (client / freelancer) via `ensureProfile`.
  - Links to freelancer profile page and job request page.

#### 8.2 Freelancer flows

- `app/protected/freelancer/profile/page.tsx`:
  - Server component:
    - Loads the user’s `profiles` row (must be role = `freelancer`).
    - Loads existing `freelancer_profiles` if present.
  - Renders a `FreelancerProfileForm` client component:
    - Fields: description, availability (simple switches / select), location (city/postcode).
    - On submit: calls `upsertFreelancerProfile`.
    - Displays generated headline + tags and last updated time.

#### 8.3 Client job flows

- `app/protected/jobs/new/page.tsx`:
  - Server component ensures `role='client'`.
  - Renders `JobRequestForm`:
    - Description, location (Almere), time window, budget.
    - Optional “Refine with AI” chat (see below).
  - On submit: calls `createJobRequest` then redirects to `/protected/jobs/[id]`.

- `app/protected/jobs/[id]/page.tsx`:
  - Shows job details.
  - Button “Find matches”:
    - Either server-renders matches in the same page (calling `findMatchesForJob`),
    - Or redirects to `/protected/jobs/[id]/matches`.

- `app/protected/jobs/[id]/matches/page.tsx`:
  - Calls `findMatchesForJob`.
  - Renders cards: headline, skills, similarity, explanation, and “Invite” actions.

#### 8.4 Bookings overview

- `app/protected/bookings/page.tsx`:
  - Lists upcoming / completed bookings:
    - As **client**: bookings where `client_profile_id` is your profile.
    - As **freelancer**: bookings where `freelancer_profile_id` is your freelancer profile.
  - Simple table or cards with job summary and scheduled time.

---

### 9. Optional Chat-based Job Refinement

#### 9.1 API route

- `app/api/ai/refine-job/route.ts`:
  - Uses `streamText` from Vercel AI SDK.
  - Behaves like a small assistant helping refine job descriptions.

#### 9.2 Client component

- `components/JobRefinementChat.tsx`:
  - Uses `useChat({ api: '/api/ai/refine-job' })`.
  - Embedded in `JobRequestForm` as an optional helper.
  - Users can copy refined text into the main job description field.

---

### 10. Local Development & Testing

#### 10.1 Running locally

npm install

# ensure .env.local is set up (Supabase + OpenAI keys)
npm run dev
# open http://localhost:3000#### 10.2 Manual flow tests

- **Freelancer**:
  - Sign up / log in → go to `/protected`.
  - Choose role = freelancer → `/protected/freelancer/profile`.
  - Fill description, availability, location → save.
  - Confirm headline + tags are generated.

- **Client**:
  - Sign up / log in (or different user) → `/protected`.
  - Choose role = client → `/protected/jobs/new`.
  - Create a job → redirected to job detail page.
  - Trigger matching → see top freelancers + explanations.

- **Security**:
  - Confirm via Supabase Table Editor or APIs that:
    - Users can only see/update their own `profiles`.
    - `job_requests`, `job_invites`, `bookings` are not visible across users.

---

This `implementation.md` is a living document. As you refine field names, UI details, or policies, update the relevant sections so the file remains the single source of truth for how the Klusbaar MVP is actually implemented in this codebase.