'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Creates a job invite from a client to a freelancer.
 * 
 * @param jobRequestId - The job request ID
 * @param freelancerProfileId - The freelancer profile ID
 * @returns The created invite
 * @throws Error if invite already exists or database operation fails
 */
export async function createJobInvite(
  jobRequestId: string,
  freelancerProfileId: string
) {
  // Check if invite already exists
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('job_invites')
    .select('id')
    .eq('job_request_id', jobRequestId)
    .eq('freelancer_profile_id', freelancerProfileId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    throw new Error('Invite already exists for this job and freelancer');
  }

  // Create the invite
  const { data, error } = await supabaseAdmin
    .from('job_invites')
    .insert({
      job_request_id: jobRequestId,
      freelancer_profile_id: freelancerProfileId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates the status of a job invite.
 * 
 * @param inviteId - The invite ID
 * @param status - New status ('pending', 'accepted', 'declined')
 * @returns The updated invite
 */
export async function updateJobInviteStatus(
  inviteId: string,
  status: 'pending' | 'accepted' | 'declined'
) {
  const { data, error } = await supabaseAdmin
    .from('job_invites')
    .update({ status })
    .eq('id', inviteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets all invites for a job request.
 * 
 * @param jobRequestId - The job request ID
 * @returns Array of invites
 */
export async function getJobInvites(jobRequestId: string) {
  const { data, error } = await supabaseAdmin
    .from('job_invites')
    .select('*')
    .eq('job_request_id', jobRequestId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Gets all invites for a freelancer.
 * 
 * @param freelancerProfileId - The freelancer profile ID
 * @returns Array of invites
 */
export async function getFreelancerInvites(freelancerProfileId: string) {
  const { data, error } = await supabaseAdmin
    .from('job_invites')
    .select('*, job_requests(id, description, location, time_window, budget, client_profile_id)')
    .eq('freelancer_profile_id', freelancerProfileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Gets pending invites for a freelancer (for dashboard display).
 * 
 * @param freelancerProfileId - The freelancer profile ID
 * @param limit - Maximum number of invites to return (default: 5)
 * @returns Array of pending invites with job and client information
 */
export async function getFreelancerPendingInvites(
  freelancerProfileId: string,
  limit: number = 5
) {
  const { data, error } = await supabaseAdmin
    .from('job_invites')
    .select(`
      *,
      job_requests(
        id,
        description,
        location,
        time_window,
        budget,
        client_profile_id,
        profiles!job_requests_client_profile_id_fkey(
          id,
          full_name,
          profile_photo
        )
      )
    `)
    .eq('freelancer_profile_id', freelancerProfileId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(invite => {
    const jobRequest = invite.job_requests as {
      id: string;
      description: string;
      location?: { city?: string; postcode?: string; address?: string } | null;
      time_window?: Record<string, unknown> | null;
      budget?: string | null;
      client_profile_id: string;
      profiles?: {
        id: string;
        full_name?: string | null;
        profile_photo?: string | null;
      } | null;
    } | null;

    const clientProfile = jobRequest?.profiles;

    // Format address
    const location = jobRequest?.location;
    let address = 'Location not specified';
    if (location) {
      const parts: string[] = [];
      if (location.address) parts.push(location.address);
      if (location.postcode) parts.push(location.postcode);
      if (location.city) parts.push(location.city);
      address = parts.length > 0 ? parts.join(', ') : address;
    }

    // Extract price from budget
    const extractPrice = (budget: string | null | undefined): number => {
      if (!budget) return 0;
      const match = budget.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    return {
      id: invite.id,
      jobRequestId: jobRequest?.id,
      title: jobRequest?.description?.substring(0, 50) + (jobRequest?.description && jobRequest.description.length > 50 ? '...' : '') || 'Job Request',
      client: clientProfile?.full_name || 'Client',
      address,
      price: extractPrice(jobRequest?.budget),
      clientProfileId: jobRequest?.client_profile_id,
      freelancerProfileId: invite.freelancer_profile_id,
      timeWindow: jobRequest?.time_window || {},
    };
  });
}

