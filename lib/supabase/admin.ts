import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Admin Supabase client with service role key.
 * 
 * ⚠️ IMPORTANT: This client has elevated permissions and should ONLY be used:
 * - In Server Actions (files with 'use server')
 * - In Route Handlers (app/api/.../route.ts)
 * - NEVER in Client Components or browser code
 * 
 * This client bypasses Row-Level Security (RLS) policies, so use it carefully
 * and always validate user permissions in your server-side code.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
  },
});

