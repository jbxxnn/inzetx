import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getJobRequest } from '@/app/actions/job';
import { findMatchesForJobRequest } from '@/app/actions/matching';
import { getJobInvites } from '@/app/actions/invite';
import { JobMatchesContent } from '@/components/jobs/job-matches-content';

interface JobMatchesPageProps {
  params: Promise<{ id: string }>;
}

import { Suspense } from 'react';

async function JobMatchesContainer({ id }: { id: string }) {
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

  // Get job request
  const job = await getJobRequest(id);

  if (!job) {
    redirect('/dashboard/jobs');
  }

  // Verify user owns this job
  if (job.client_profile_id !== profile.id) {
    redirect('/dashboard');
  }

  // Find matches
  const matches = await findMatchesForJobRequest(id);

  // Get existing invites to show which freelancers are already invited
  const invites = await getJobInvites(id);
  const invitedFreelancerIds = new Set(
    invites.map((invite) => invite.freelancer_profile_id)
  );

  return (
    <JobMatchesContent
      matches={matches}
      jobRequestId={id}
      invitedFreelancerIds={invitedFreelancerIds}
      clientProfileId={profile.id}
    />
  );
}

async function JobMatchesWrapper({ params }: JobMatchesPageProps) {
  const { id } = await params;
  return <JobMatchesContainer id={id} />;
}

export default function JobMatchesPage({ params }: JobMatchesPageProps) {
  return (
    <Suspense fallback={<div>Loading matches...</div>}>
      <JobMatchesWrapper params={params} />
    </Suspense>
  );
}
