import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getJobRequest } from '@/app/actions/job';
import { getFreelancerProfile } from '@/app/actions/freelancer';
import { getFreelancerInvites } from '@/app/actions/invite';
import { getFreelancerBookings } from '@/app/actions/booking';
import { JobDetailContent } from '@/components/jobs/job-detail-content';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
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

  // Get job request
  const job = await getJobRequest(id);

  if (!job) {
    redirect('/dashboard/jobs');
  }

  // Check access based on role
  if (profile.role === 'client') {
    // Clients can only see their own jobs
    if (job.client_profile_id !== profile.id) {
      redirect('/dashboard');
    }
  } else if (profile.role === 'freelancer') {
    // Freelancers can see jobs they're invited to or have bookings for
    const freelancerProfile = await getFreelancerProfile(profile.id);
    if (!freelancerProfile) {
      redirect('/onboarding');
    }

    // Check if freelancer has an invite for this job
    const invites = await getFreelancerInvites(freelancerProfile.id);
    const hasInvite = invites.some(inv => inv.job_request_id === id);

    // Check if freelancer has a booking for this job
    const bookings = await getFreelancerBookings(freelancerProfile.id);
    const hasBooking = bookings.some(booking => 
      booking.job_requests && (booking.job_requests as { id: string }).id === id
    );

    if (!hasInvite && !hasBooking) {
      redirect('/dashboard');
    }
  } else {
    redirect('/dashboard');
  }

  return <JobDetailContent job={job} jobId={id} role={profile.role} />;
}

