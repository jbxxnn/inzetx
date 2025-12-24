

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { JobCreationChat } from '@/components/JobCreationChat';
import { Header } from '@/components/hero/header';
import { Suspense } from 'react';

export default async function ChatJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/chat/job');
  }

  // Get user's profile to ensure they have one
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/dashboard');
  }

  // Ensure user is a client (or allow them to switch)
  if (profile.role !== 'client') {
    redirect('/dashboard');
  }

  return (
    
      <Suspense fallback={<div>Loading..</div>}>
    <div className="flex flex-col h-screen bg-secondary overflow-hidden overscroll-none" style={{ overscrollBehavior: 'none' }}>
      <Header />
      <JobCreationChat clientProfileId={profile.id} />
    </div>
      </Suspense>
  );
}

