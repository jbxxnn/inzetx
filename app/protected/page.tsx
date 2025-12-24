import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { RoleSelector } from '@/components/role-selector';
import { Suspense } from 'react';

async function DashboardContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect('/auth/login');
  }

  const user = data.claims;
  const profile = await getCurrentProfile();

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.email || 'User'}!
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <RoleSelector
          currentRole={profile?.role || null}
          userEmail={user.email as string}
        />
      </Suspense>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
          </Suspense>
    </div>
  );
}
