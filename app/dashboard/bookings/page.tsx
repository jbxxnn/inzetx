import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getClientBookings, getFreelancerBookings } from '@/app/actions/booking';
import { getFreelancerProfile } from '@/app/actions/freelancer';
import { BookingsPageContent } from '@/components/bookings/bookings-page-content';

interface JobRequest {
  id: string;
  description: string;
  location?: {
    city?: string;
    postcode?: string;
  } | null;
}

interface Booking {
  id: string;
  status: string;
  scheduled_time?: {
    start?: string;
    end?: string;
    notes?: string;
  } | null;
  created_at: string;
  job_requests?: JobRequest | null;
}

export default async function BookingsPage() {
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

  let bookings: Booking[] = [];

  if (profile.role === 'client') {
    bookings = await getClientBookings(profile.id);
  } else if (profile.role === 'freelancer') {
    const freelancerProfile = await getFreelancerProfile(profile.id);
    if (freelancerProfile) {
      bookings = await getFreelancerBookings(freelancerProfile.id);
    }
  }

  return (
    <BookingsPageContent 
      bookings={bookings} 
      role={profile.role as 'client' | 'freelancer'} 
    />
  );
}


