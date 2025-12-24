import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getFreelancerProfile } from '@/app/actions/freelancer';
import { getFreelancerInvites } from '@/app/actions/invite';
import InvitesPageContent from '@/components/invites/invites-page-content';
import { Suspense } from 'react';

async function InvitesContainer() {
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

  // Only freelancers can view invites
  if (profile.role !== 'freelancer') {
    redirect('/dashboard');
  }

  const freelancerProfile = await getFreelancerProfile(profile.id);

  if (!freelancerProfile) {
    redirect('/onboarding');
  }

  const invites = await getFreelancerInvites(freelancerProfile.id);

  return (
    <InvitesPageContent invites={invites} role={profile.role} />
  );
}

export default function InvitesPage() {
  return (
    <Suspense fallback={<div className="flex-1 w-full flex flex-col gap-12">Loading..</div>}>
      <InvitesContainer />
    </Suspense>
  );
}


