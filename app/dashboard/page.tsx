import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getFreelancerProfile } from '@/app/actions/freelancer';
import { 
  getFreelancerDashboardStats, 
  getFreelancerUpcomingBookings 
} from '@/app/actions/freelancer';
import { getFreelancerPendingInvites } from '@/app/actions/invite';
import {
  getClientDashboardStats,
  getClientActiveJobs,
  getClientCompletedJobs,
} from '@/app/actions/client';
import FreelancerDashboard from "@/components/dashboard/freelancer-dashboard";
import ClientDashboard from "@/components/dashboard/client-dashboard";

export default async function Dashboard() {
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

  // Get user's name from profile or email
  const userName = (profile as { full_name?: string | null }).full_name || user.email?.split('@')[0] || 'User';

  // Handle freelancer dashboard
  if (profile.role === 'freelancer') {
    const freelancerProfile = await getFreelancerProfile(profile.id);
    if (!freelancerProfile) {
      redirect('/onboarding');
    }

    // Fetch dashboard data
    const [stats, upcomingJobs, pendingInvites] = await Promise.all([
      getFreelancerDashboardStats(freelancerProfile.id),
      getFreelancerUpcomingBookings(freelancerProfile.id, 10),
      getFreelancerPendingInvites(freelancerProfile.id, 5),
    ]);

    return (
      <FreelancerDashboard 
        stats={stats}
        upcomingJobs={upcomingJobs}
        pendingInvites={pendingInvites}
        userName={userName}
      />
    );
  }

  // Handle client dashboard
  if (profile.role === 'client') {
    // Fetch client dashboard data
    const [stats, activeJobs, completedJobs] = await Promise.all([
      getClientDashboardStats(profile.id),
      getClientActiveJobs(profile.id, 10),
      getClientCompletedJobs(profile.id, 10),
    ]);

    return (
      <ClientDashboard
        stats={stats}
        activeJobs={activeJobs}
        completedJobs={completedJobs}
        userName={userName}
      />
    );
  }

  // If no role, redirect to role selection
  redirect('/dashboard');
}