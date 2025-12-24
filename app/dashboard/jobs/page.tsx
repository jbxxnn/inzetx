import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getClientJobRequests } from '@/app/actions/job';
import { JobsPageContent } from '@/components/jobs/jobs-page-content';

export default async function JobsPage() {
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


