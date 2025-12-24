# Klusbaar Local Services Marketplace (MVP)

AI-powered marketplace where people can offer any skill during their free time and clients can describe what they need in natural language. The system uses semantic search [search based on meaning instead of exact words] to match clients with freelancers.

This MVP is:

* **City-focused in practice** (initially only Almere),
* **Category-free in the UI** (no “Carpenter / Electrician” dropdowns),
* **AI-driven** for matching and profile enrichment.

---

## 1. Core Idea

* **Freelancers**: ordinary people who want to earn extra income by offering any skill they know.
* **Clients**: people who need help with any task (fixing furniture, moving boxes, babysitting, tutoring, etc.).
* **AI**:

  * Converts freelancer profiles into **embeddings** [lists of numbers representing the meaning of text].
  * Converts client job requests into embeddings.
  * Uses **vector search** [comparing embeddings to find similar meanings] to match them.
  * Generates headlines, tags, and “why this match” explanations.

No explicit categories, just text → meaning → matching.

---

## 2. High-Level Architecture

```text
Next.js (App Router)
│
├── Client UI (React components)
│     - Freelancer profile forms
│     - Client job request forms
│     - Match results pages
│
├── Server Actions & Route Handlers
│     - /actions/freelancer.ts
│     - /actions/matching.ts
│     - /api/ai/*
│
├── Vercel AI SDK (server-side only)
│     - Embeddings (text-embedding-3-small)
│     - Text generation (headlines, tags, explanations)
│     - Optional streaming chat for job refinement
│
└── Supabase (Postgres + Auth + pgvector)
      - Auth (users)
      - profiles
      - freelancer_profiles (with embedding)
      - job_requests (with embedding)
      - job_invites
      - bookings
      - RPC for matching via vector search
```

**Key principles:**

* All AI calls via **Vercel AI SDK** happen **server-side** [code that never runs in the browser] in Route Handlers [API endpoints in `app/api/.../route.ts`] and Server Actions [async functions marked `'use server'`].
* **Supabase** stores everything: users, profiles, embeddings, bookings.
* **pgvector** is used for semantic matching [Postgres extension and vector column type for storing and comparing embeddings].

---

## 3. Tech Stack

* **Framework**: Next.js (App Router) [file-based routing and layouts system].
* **Language**: TypeScript [JavaScript with types].
* **AI SDK**: `ai` + `@ai-sdk/openai` [Vercel AI SDK core + OpenAI provider].
* **Database**: Supabase (Postgres) [hosted Postgres with built-in APIs/UI].
* **Vector Search**: pgvector [Postgres extension for vector columns and similarity operators].
* **Auth**: Supabase Auth [email/password & OAuth user management].
* **Validation**: Zod [schema validation library for data structures] (for structured outputs).

---

## 4. Data Model

### 4.1 `profiles`

Link to Supabase Auth `auth.users` and store role.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('client', 'freelancer')) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

Use case:

* Every authenticated user gets one `profiles` row.
* `role` distinguishes clients vs freelancers.

---

### 4.2 `freelancer_profiles`

One row per freelancer, with embedding.

```sql
CREATE EXTENSION IF NOT EXISTS vector; -- pgvector

CREATE TABLE freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,                           -- AI-generated short title
  description TEXT NOT NULL,               -- raw profile text
  skills TEXT[],                           -- AI-generated tags
  availability JSONB,                      -- e.g. { "mon": ["evening"], ... }
  location JSONB,                          -- e.g. { "city": "Almere", "postcode": "..." }
  embedding vector(1536),                  -- text-embedding-3-small
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Index for vector search using ivfflat [approximate nearest neighbor index]
CREATE INDEX freelancer_profiles_embedding_idx
ON freelancer_profiles
USING ivfflat (embedding vector_cosine_ops);
```

Use case:

* When a freelancer saves their profile:

  * Description is stored.
  * AI generates `headline`, `skills`, and `embedding`.

---

### 4.3 `job_requests`

Client’s “I need help with…” text.

```sql
CREATE TABLE job_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  location JSONB,                      -- e.g. { "city": "Almere", "postcode": "..." }
  time_window JSONB,                   -- { "start": "...", "end": "..." }
  budget TEXT,                         -- free text for now
  embedding vector(1536),              -- job description embedding
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX job_requests_embedding_idx
ON job_requests
USING ivfflat (embedding vector_cosine_ops);
```

Use case:

* When client posts a job:

  * Text is saved.
  * AI generates `embedding`.
  * We later match freelancers based on this.

---

### 4.4 `job_invites`

Link from job → potential freelancers.

```sql
CREATE TABLE job_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);
```

Use case:

* After matching, system sends invites to top N freelancers.

---

### 4.5 `bookings`

Confirmed agreements.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  client_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming',
  scheduled_time JSONB,               -- agreed time window
  created_at TIMESTAMP DEFAULT now()
);
```

Use case:

* Created once client and freelancer both accept.

---

## 5. Supabase Setup

### 5.1 Create Project and Configure Env

1. Create a Supabase project.
2. Copy:

   * `SUPABASE_URL` [base URL for your Supabase project]
   * `SUPABASE_ANON_KEY` [public key for client-side use]
   * `SUPABASE_SERVICE_ROLE_KEY` [secret key with elevated permissions for server-side use].
3. Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5.2 Enable pgvector

In Supabase SQL editor:

```sql
CREATE EXTENSION IF NOT EXISTS "vector";
```

### 5.3 Install Supabase Client

```bash
npm install @supabase/supabase-js
```

Create `lib/supabase.ts`:

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Client for use in browser and server components with anon key
 * [restricted key safe for unprivileged operations].
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin client for server-side use only with service role key
 * [full access, use only in Server Actions / Route Handlers].
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
```

---

## 6. Row-Level Security (RLS)

RLS [row-level security = per-row access control rules] ensures users can only access their own data.

### 6.1 Enable RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

### 6.2 Example Policies

**Profiles** – user sees/edits only their own:

```sql
CREATE POLICY "select_own_profile"
ON profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "update_own_profile"
ON profiles
FOR UPDATE
USING (user_id = auth.uid());
```

**Freelancer profiles**:

```sql
-- Freelancer can manage their own profile
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

-- Clients can read all freelancer profiles (public info)
CREATE POLICY "clients_read_freelancers"
ON freelancer_profiles
FOR SELECT
USING (true);
```

You can fine-tune `job_requests`, `job_invites`, `bookings` similarly:

* Clients see their own requests and related invites/bookings.
* Freelancers see invites and bookings that involve them.

---

## 7. AI Layer: Vercel AI SDK

### 7.1 Install

```bash
npm install ai @ai-sdk/openai zod
```

### 7.2 Environment Variables

```bash
OPENAI_API_KEY=sk-...your-key...
```

Add this to Vercel project settings for production.

### 7.3 Shared AI Config (`lib/ai.ts`)

```ts
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

export const MATCH_EXPLANATION_SYSTEM_PROMPT = `You explain why a freelancer is a good match for a job in 1–2 sentences, focusing on relevant skills and experience.`;
```

`embeddingModel` is called whenever you need embeddings.
`textModel` is used for text generation and structured outputs.

---

## 8. Core Flows

### 8.1 Freelancer Creates/Updates Profile

1. User signs up (Supabase Auth).
2. You create or update `profiles` row with `role='freelancer'`.
3. Client submits profile form:

   * Description.
   * Availability.
   * Location (inside Almere).
4. Server Action:

   * Stores text in `freelancer_profiles`.
   * Uses Vercel AI SDK to:

     * Generate embedding.
     * Generate headline.
     * Generate skill tags.
   * Updates `freelancer_profiles` row with these AI fields.

Example Server Action:

```ts
// app/actions/freelancer.ts
'use server';

import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';
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

  // 1. Generate embedding
  const { embedding } = await embed({
    model: embeddingModel,
    value: description,
  });

  // 2. Headline + tags in parallel
  const [headline, tags] = await Promise.all([
    generateFreelancerHeadline(description),
    generateSkillTags(description),
  ]);

  // 3. Upsert into Supabase
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
        skills: tags,
      },
      { onConflict: 'profile_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

---

### 8.2 Client Creates Job Request

1. Client (role = `client`) fills:

   * Description.
   * Location in Almere.
   * Time window.
2. Server Action:

   * Inserts basic `job_requests` row.
   * Generates embedding for the description.
   * Updates row with `embedding`.

---

### 8.3 Matching: Find Freelancers for a Job

1. Given a `job_requests` row with embedding:
2. Supabase RPC (Postgres function) runs vector similarity search on `freelancer_profiles.embedding`.
3. Returns top N candidates with similarity score.
4. Server Action optionally calls AI to generate “why this match” explanation.

Example RPC:

```sql
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
$$;
```

Example Server Action:

```ts
// app/actions/matching.ts
'use server';

import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';
import { generateMatchExplanation } from '@/lib/prompts';

export async function findMatchesForJob(params: {
  jobDescription: string;
  limit?: number;
  threshold?: number;
}) {
  const { jobDescription, limit = 5, threshold = 0.3 } = params;

  // 1. Embed job description
  const { embedding } = await embed({
    model: embeddingModel,
    value: jobDescription,
  });

  // 2. Call Supabase RPC for matches
  const { data: rows, error } = await supabaseAdmin.rpc(
    'match_freelancers',
    {
      query_embedding: embedding,
      match_threshold: 1 - threshold,
      match_count: limit,
    }
  );

  if (error) throw error;

  // 3. Generate explanations
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
}
```

---

## 9. Optional: Chat-Style “Help Me Describe My Job”

You can use `streamText` [streaming LLM responses token-by-token] and `useChat` [React hook from AI SDK for chat UIs] to build a small assistant that helps clients refine the job description before embedding.

* API route: `app/api/ai/refine-job/route.ts`
* Client component: `JobRefinementChat.tsx` using `useChat({ api: '/api/ai/refine-job' })`

This is optional but can improve quality of requests.

---

## 10. Project Structure

```text
project-root/
├── app/
│   ├── api/
│   │   └── ai/
│   │       ├── refine-job/route.ts       # (optional) streaming chat for job description
│   │       └── ... (if you expose AI routes directly)
│   ├── actions/
│   │   ├── freelancer.ts                 # create/update freelancer profile, embeddings
│   │   └── matching.ts                   # job → freelancer matching logic
│   ├── (freelancer pages)                # e.g. /freelancer/profile
│   ├── (client pages)                    # e.g. /jobs/new, /jobs/[id]/matches
│   └── components/
│       └── JobRefinementChat.tsx         # optional chat-based refinement UI
├── lib/
│   ├── ai.ts                             # Vercel AI SDK configuration
│   ├── prompts.ts                        # headline, tags, explanation generators
│   ├── supabase.ts                       # Supabase clients
│   └── ...
├── .env.local                            # local env vars
└── package.json
```

---

## 11. Local Development

### 11.1 Prerequisites

* Node.js (LTS)
* Supabase project created
* OpenAI API key

### 11.2 Setup

```bash
git clone <repo>
cd <repo>

npm install

# create .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=..." >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=..." >> .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=..." >> .env.local
echo "OPENAI_API_KEY=..." >> .env.local

npm run dev
```

Then go to `http://localhost:3000`.

---

## 12. Deployment

### 12.1 Supabase

* Production database is already managed by Supabase.
* Run migrations (or paste SQL schema + RPC into Supabase SQL editor).

### 12.2 Vercel

1. Import the repo into Vercel.

2. Add env vars:

   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `OPENAI_API_KEY`

3. Deploy.

4. For long AI calls or streaming routes, set `export const maxDuration = 30;` near the top of those Route Handlers.

---

## 13. Implementation Checklist

**Supabase**

* [ ] Create project.
* [ ] Enable `vector` extension.
* [ ] Create tables: `profiles`, `freelancer_profiles`, `job_requests`, `job_invites`, `bookings`.
* [ ] Add vector columns and indexes.
* [ ] Enable RLS and add basic policies.
* [ ] Create `match_freelancers` RPC.

**Next.js + Vercel AI SDK**

* [ ] Install `ai`, `@ai-sdk/openai`, `@supabase/supabase-js`, `zod`.
* [ ] Create `lib/ai.ts` with `embeddingModel` and `textModel`.
* [ ] Create `lib/supabase.ts` with `supabaseClient` and `supabaseAdmin`.
* [ ] Create `lib/prompts.ts` with:

  * `generateFreelancerHeadline`
  * `generateSkillTags`
  * `generateMatchExplanation`
* [ ] Implement Server Actions:

  * `upsertFreelancerProfile`
  * `createJobRequest`
  * `findMatchesForJob`
* [ ] Wire forms in UI to these actions.
* [ ] (Optional) Implement `refine-job` chat route and component.

**Env & Security**

* [ ] Keep `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` server-only.
* [ ] Validate input before AI calls.
* [ ] Consider rate limiting for `/api/ai/*` routes.

---

This README gives you a single source of truth for:

* how the data is structured,
* where AI sits in the stack,
* how Supabase and Vercel AI SDK cooperate,
* and the concrete steps to go from idea → running MVP.

From here you can refine naming, add design, and start implementing screens on top of this backbone.
# inzetx
