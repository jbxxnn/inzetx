import { redirect } from 'next/navigation';


import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getPendingFlags } from '@/app/actions/review';
import ModerationDashboard from '@/components/admin/moderation-dashboard';
import { Suspense } from 'react';

async function AdminModerationContainer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/dashboard');
  }

  // Check if user is admin (for now, we'll check if they have admin metadata)
  // In production, you'd want a proper admin role in the profiles table
  const { data: userData } = await supabase.auth.getUser();
  const isAdmin = userData?.user?.user_metadata?.role === 'admin' ||
    userData?.user?.email?.endsWith('@klusbaar.com'); // Temporary: allow @klusbaar.com emails

  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Fetch pending flags
  const pendingFlags = await getPendingFlags();

  return (
    <ModerationDashboard
      pendingFlags={pendingFlags}
      adminProfileId={profile.id}
    />
  );
}

export default function AdminModerationPage() {
  return (
    <Suspense fallback={<div className="flex-1 w-full flex flex-col gap-12">Loading..</div>}>
      <AdminModerationContainer />
    </Suspense>
  );
}
