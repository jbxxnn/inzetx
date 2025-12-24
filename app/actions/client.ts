'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { isBookingReviewed } from '@/app/actions/review';

/**
 * Dashboard statistics for a client.
 */
export interface ClientDashboardStats {
  activeJobs: number;
  completedJobs: number;
  totalSpent: number;
  savedFreelancers: number;
}

/**
 * Active job for client dashboard.
 */
export interface ActiveJob {
  id: string;
  title: string;
  freelancer: string;
  freelancerImage?: string;
  rating: number;
  status: 'in_progress' | 'scheduled';
  startDate: string;
  estimatedEnd: string;
  price: number;
  jobRequestId: string;
  freelancerProfileId: string;
}

/**
 * Completed job for client dashboard.
 */
export interface CompletedJob {
  id: string;
  title: string;
  freelancer: string;
  freelancerImage?: string;
  rating: number;
  completedDate: string;
  price: number;
  reviewed: boolean;
  jobRequestId: string;
  freelancerProfileId: string;
}

/**
 * Gets dashboard statistics for a client.
 * 
 * @param clientProfileId - The client profile ID
 * @returns Dashboard stats including active jobs, completed jobs, total spent, and saved freelancers
 */
export async function getClientDashboardStats(clientProfileId: string): Promise<ClientDashboardStats> {
  // Get all bookings for this client
  const { data: bookings, error: bookingsError } = await supabaseAdmin
    .from('bookings')
    .select('status, job_requests(budget)')
    .eq('client_profile_id', clientProfileId);

  if (bookingsError) throw bookingsError;

  const allBookings = bookings || [];
  const activeBookings = allBookings.filter(b => b.status === 'upcoming');
  const completedBookings = allBookings.filter(b => b.status === 'completed');

  // Calculate total spent from completed bookings
  const extractPrice = (budget: string | null | undefined): number => {
    if (!budget) return 0;
    const match = budget.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const totalSpent = completedBookings.reduce((sum, booking) => {
    const jobRequest = booking.job_requests as { budget?: string } | null | undefined;
    const budget = Array.isArray(jobRequest) 
      ? jobRequest[0]?.budget 
      : jobRequest?.budget;
    return sum + extractPrice(budget);
  }, 0);

  // Count saved freelancers (for now, return 0 - this would need a favorites/saved table)
  const savedFreelancers = 0;

  return {
    activeJobs: activeBookings.length,
    completedJobs: completedBookings.length,
    totalSpent,
    savedFreelancers,
  };
}

/**
 * Gets active jobs (upcoming bookings) for a client.
 * 
 * @param clientProfileId - The client profile ID
 * @param limit - Maximum number of jobs to return (default: 10)
 * @returns Array of active jobs with freelancer and job details
 */
export async function getClientActiveJobs(
  clientProfileId: string,
  limit: number = 10
): Promise<ActiveJob[]> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      id,
      status,
      scheduled_time,
      created_at,
      job_requests(
        id,
        description,
        budget
      ),
      freelancer_profiles(
        id,
        headline,
        profile_id,
        profiles!freelancer_profiles_profile_id_fkey(
          id,
          full_name,
          profile_photo
        )
      )
    `)
    .eq('client_profile_id', clientProfileId)
    .in('status', ['upcoming'])
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;

  const jobs = (data || []).map((booking) => {
    const jobRequest = booking.job_requests as { id?: string; description?: string; budget?: string } | null | undefined;
    const freelancerProfile = booking.freelancer_profiles as {
      id?: string;
      headline?: string;
      profile_id?: string;
      profiles?: { id?: string; full_name?: string; profile_photo?: string } | null;
    } | null | undefined;
    const profile = freelancerProfile?.profiles 
      ? (Array.isArray(freelancerProfile.profiles) ? freelancerProfile.profiles[0] : freelancerProfile.profiles)
      : null;

    // Extract price from budget
    const extractPrice = (budget: string | null | undefined): number => {
      if (!budget) return 0;
      const match = budget.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    // Format scheduled time
    const scheduledTime = booking.scheduled_time as Record<string, unknown> | null;
    let startDate: string;
    let estimatedEnd: string;
    
    if (scheduledTime?.date) {
      try {
        const date = new Date(String(scheduledTime.date));
        startDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        startDate = new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } else {
      startDate = new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    if (scheduledTime?.endDate) {
      try {
        const endDate = new Date(String(scheduledTime.endDate));
        estimatedEnd = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        estimatedEnd = new Date(new Date(booking.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } else {
      estimatedEnd = new Date(new Date(booking.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return {
      id: booking.id,
      title: jobRequest?.description?.substring(0, 50) || 'Untitled Job',
      freelancer: profile?.full_name || 'Unknown Freelancer',
      freelancerImage: profile?.profile_photo || undefined,
      rating: 0, // Will be fetched separately
      status: 'scheduled' as const, // All upcoming bookings are scheduled
      startDate,
      estimatedEnd,
      price: extractPrice(jobRequest?.budget),
      jobRequestId: jobRequest?.id || '',
      freelancerProfileId: freelancerProfile?.id || '',
    };
  });

  // Fetch ratings for all freelancers
  const jobsWithRatings = await Promise.all(
    jobs.map(async (job) => {
      if (job.freelancerProfileId) {
        const { data: freelancerProfile } = await supabaseAdmin
          .from('freelancer_profiles')
          .select('average_rating')
          .eq('id', job.freelancerProfileId)
          .single();
        
        if (freelancerProfile?.average_rating) {
          job.rating = Number(freelancerProfile.average_rating);
        }
      }
      return job;
    })
  );

  return jobsWithRatings;
}

/**
 * Gets completed jobs for a client.
 * 
 * @param clientProfileId - The client profile ID
 * @param limit - Maximum number of jobs to return (default: 10)
 * @returns Array of completed jobs with freelancer and job details
 */
export async function getClientCompletedJobs(
  clientProfileId: string,
  limit: number = 10
): Promise<CompletedJob[]> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      id,
      status,
      created_at,
      job_requests(
        id,
        description,
        budget
      ),
      freelancer_profiles(
        id,
        headline,
        profile_id,
        profiles!freelancer_profiles_profile_id_fkey(
          id,
          full_name,
          profile_photo
        )
      )
    `)
    .eq('client_profile_id', clientProfileId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Check which bookings have reviews
  const bookingIds = (data || []).map(b => b.id);
  const reviewChecks = await Promise.all(
    bookingIds.map(id => isBookingReviewed(id))
  );
  const reviewedMap = new Map(
    bookingIds.map((id, index) => [id, reviewChecks[index]])
  );

  return (data || []).map((booking) => {
    const jobRequest = booking.job_requests as { id?: string; description?: string; budget?: string } | null | undefined;
    const freelancerProfile = booking.freelancer_profiles as {
      id?: string;
      headline?: string;
      profile_id?: string;
      profiles?: { id?: string; full_name?: string; profile_photo?: string } | null;
    } | null | undefined;
    const profile = freelancerProfile?.profiles 
      ? (Array.isArray(freelancerProfile.profiles) ? freelancerProfile.profiles[0] : freelancerProfile.profiles)
      : null;

    // Extract price from budget
    const extractPrice = (budget: string | null | undefined): number => {
      if (!budget) return 0;
      const match = budget.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    // Format completed date
    const completedDate = new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      id: booking.id,
      title: jobRequest?.description?.substring(0, 50) || 'Untitled Job',
      freelancer: profile?.full_name || 'Unknown Freelancer',
      freelancerImage: profile?.profile_photo || undefined,
      rating: 4.9, // TODO: Get actual rating from reviews
      completedDate,
      price: extractPrice(jobRequest?.budget),
      reviewed: reviewedMap.get(booking.id) || false,
      jobRequestId: jobRequest?.id || '',
      freelancerProfileId: freelancerProfile?.id || '',
    };
  });
}

