'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Parameters for creating a booking.
 */
export interface CreateBookingParams {
  jobRequestId: string;
  freelancerProfileId: string;
  clientProfileId: string;
  scheduledTime: Record<string, any>;
}

/**
 * Creates a booking (confirmed agreement between client and freelancer).
 * 
 * @param params - Booking data
 * @returns The created booking
 * @throws Error if booking already exists or database operation fails
 */
export async function createBooking(params: CreateBookingParams) {
  const { jobRequestId, freelancerProfileId, clientProfileId, scheduledTime } =
    params;

  // Check if booking already exists
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('job_request_id', jobRequestId)
    .eq('freelancer_profile_id', freelancerProfileId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    throw new Error('Booking already exists for this job and freelancer');
  }

  // Create the booking
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .insert({
      job_request_id: jobRequestId,
      freelancer_profile_id: freelancerProfileId,
      client_profile_id: clientProfileId,
      status: 'upcoming',
      scheduled_time: scheduledTime,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates the status of a booking.
 * 
 * @param bookingId - The booking ID
 * @param status - New status ('upcoming', 'completed', 'cancelled')
 * @returns The updated booking
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'upcoming' | 'completed' | 'cancelled'
) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets all bookings for a client.
 * 
 * @param clientProfileId - The client's profile ID
 * @returns Array of bookings with related job and freelancer data
 */
export async function getClientBookings(clientProfileId: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(
      '*, job_requests(*), freelancer_profiles(id, headline, skills)'
    )
    .eq('client_profile_id', clientProfileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Gets all bookings for a freelancer.
 * 
 * @param freelancerProfileId - The freelancer profile ID
 * @returns Array of bookings with related job and client data
 */
export async function getFreelancerBookings(freelancerProfileId: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*, job_requests(*), profiles!bookings_client_profile_id_fkey(*)')
    .eq('freelancer_profile_id', freelancerProfileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Updates the scheduled time of a booking.
 * 
 * @param bookingId - The booking ID
 * @param scheduledTime - New scheduled time object
 * @returns The updated booking
 */
export async function updateBookingScheduledTime(
  bookingId: string,
  scheduledTime: Record<string, any>
) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ scheduled_time: scheduledTime })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets a booking by ID.
 * 
 * @param bookingId - The booking ID
 * @returns The booking with related data or null if not found
 */
export async function getBooking(bookingId: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(
      '*, job_requests(*), freelancer_profiles(id, headline, skills), profiles!bookings_client_profile_id_fkey(*)'
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

