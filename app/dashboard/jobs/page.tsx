import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getClientJobRequests } from '@/app/actions/job';
import { JobsPageContent } from '@/components/jobs/jobs-page-content';

import { Suspense } from 'react';

async function JobsContainer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'client') {
    redirect('/dashboard');
  }

  const jobs = await getClientJobRequests(profile.id);

  return <JobsPageContent jobs={jobs} />;
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading jobs...</div>}>
      <JobsContainer />
    </Suspense>
  );
}


