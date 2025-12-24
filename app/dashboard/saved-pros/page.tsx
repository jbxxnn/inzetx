import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getSavedFreelancers } from '@/app/actions/saved-pros';
import SavedProsContent from '@/components/saved-pros/saved-pros-content';

import { Suspense } from 'react';

async function SavedProsContainer() {
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

  const savedFreelancers = await getSavedFreelancers(profile.id);

  return (
    <SavedProsContent savedFreelancers={savedFreelancers} role={profile.role} clientProfileId={profile.id} />
  );
}

export default function SavedProsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SavedProsContainer />
    </Suspense>
  );
}

