import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { NewJobContent } from '@/components/jobs/new-job-content';

import { Suspense } from 'react';

async function NewJobContainer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user's profile
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/dashboard');
  }

  // Ensure user is a client
  if (profile.role !== 'client') {
    redirect('/dashboard');
  }

  return <NewJobContent clientProfileId={profile.id} />;
}

export default function NewJobPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewJobContainer />
    </Suspense>
  );
}


