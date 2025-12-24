'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Interface for creating a review
 */
export interface CreateReviewParams {
  bookingId: string;
  rating: number;
  comment?: string;
  communicationRating?: number;
  qualityRating?: number;
  punctualityRating?: number;
  valueRating?: number;
}

/**
 * Interface for a review
 */
export interface Review {
  id: string;
  bookingId: string;
  freelancerProfileId: string;
  clientProfileId: string;
  jobRequestId: string;
  rating: number;
  comment?: string;
  communicationRating?: number;
  qualityRating?: number;
  punctualityRating?: number;
  valueRating?: number;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  editCount?: number;
  freelancerResponse?: string;
  responseCreatedAt?: string;
  // Related data
  clientName?: string;
  clientPhoto?: string;
  jobDescription?: string;
}

/**
 * Interface for review statistics
 */
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    [key: string]: number; // e.g., { "5": 10, "4": 3, "3": 1, "2": 0, "1": 0 }
  };
}

/**
 * Creates a review for a completed booking.
 * 
 * @param params - Review data
 * @returns The created review
 * @throws Error if review already exists, booking not found, or validation fails
 */
export async function createReview(params: CreateReviewParams) {
  const { bookingId, rating, comment, communicationRating, qualityRating, punctualityRating, valueRating } = params;

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Get booking details to verify it exists and is completed
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select(`
      id,
      status,
      freelancer_profile_id,
      client_profile_id,
      job_request_id
    `)
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Verify booking is completed
  if (booking.status !== 'completed') {
    throw new Error('Can only review completed bookings');
  }

  // Check if review already exists
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing) {
    throw new Error('Review already exists for this booking');
  }

  // Create the review
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      booking_id: bookingId,
      freelancer_profile_id: booking.freelancer_profile_id,
      client_profile_id: booking.client_profile_id,
      job_request_id: booking.job_request_id,
      rating,
      comment: comment?.trim() || null,
      communication_rating: communicationRating || null,
      quality_rating: qualityRating || null,
      punctuality_rating: punctualityRating || null,
      value_rating: valueRating || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets all reviews for a freelancer.
 * 
 * @param freelancerProfileId - The freelancer profile ID
 * @param limit - Maximum number of reviews to return (default: 50)
 * @returns Array of reviews with client and job information
 */
export async function getFreelancerReviews(
  freelancerProfileId: string,
  limit: number = 50
): Promise<Review[]> {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(`
      *,
      profiles!reviews_client_profile_id_fkey(
        id,
        full_name,
        profile_photo
      ),
      job_requests(
        id,
        description
      )
    `)
    .eq('freelancer_profile_id', freelancerProfileId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((review) => {
    const clientProfile = review.profiles as {
      id: string;
      full_name?: string | null;
      profile_photo?: string | null;
    } | null;

    const jobRequest = review.job_requests as {
      id: string;
      description?: string | null;
    } | null;

    return {
      id: review.id,
      bookingId: review.booking_id,
      freelancerProfileId: review.freelancer_profile_id,
      clientProfileId: review.client_profile_id,
      jobRequestId: review.job_request_id,
      rating: review.rating,
      comment: review.comment || undefined,
      communicationRating: review.communication_rating || undefined,
      qualityRating: review.quality_rating || undefined,
      punctualityRating: review.punctuality_rating || undefined,
      valueRating: review.value_rating || undefined,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      editedAt: review.edited_at || undefined,
      editCount: review.edit_count || 0,
      freelancerResponse: review.freelancer_response || undefined,
      responseCreatedAt: review.response_created_at || undefined,
      clientName: clientProfile?.full_name || undefined,
      clientPhoto: clientProfile?.profile_photo || undefined,
      jobDescription: jobRequest?.description || undefined,
    };
  });
}

/**
 * Gets review statistics for a freelancer.
 * 
 * @param freelancerProfileId - The freelancer profile ID
 * @returns Review statistics including average rating, total reviews, and breakdown
 */
export async function getFreelancerReviewStats(
  freelancerProfileId: string
): Promise<ReviewStats> {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('freelancer_profiles')
    .select('average_rating, total_reviews, rating_breakdown')
    .eq('id', freelancerProfileId)
    .single();

  if (profileError) throw profileError;

  return {
    averageRating: profile?.average_rating ? Number(profile.average_rating) : 0,
    totalReviews: profile?.total_reviews || 0,
    ratingBreakdown: (profile?.rating_breakdown as Record<string, number>) || {},
  };
}

/**
 * Checks if a booking has been reviewed.
 * 
 * @param bookingId - The booking ID
 * @returns True if reviewed, false otherwise
 */
export async function isBookingReviewed(bookingId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Gets a review by booking ID.
 * 
 * @param bookingId - The booking ID
 * @returns The review if it exists, null otherwise
 */
export async function getReviewByBookingId(bookingId: string): Promise<Review | null> {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(`
      *,
      profiles!reviews_client_profile_id_fkey(
        id,
        full_name,
        profile_photo
      ),
      job_requests(
        id,
        description
      )
    `)
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const clientProfile = data.profiles as {
    id: string;
    full_name?: string | null;
    profile_photo?: string | null;
  } | null;

  const jobRequest = data.job_requests as {
    id: string;
    description?: string | null;
  } | null;

  return {
    id: data.id,
    bookingId: data.booking_id,
    freelancerProfileId: data.freelancer_profile_id,
    clientProfileId: data.client_profile_id,
    jobRequestId: data.job_request_id,
    rating: data.rating,
    comment: data.comment || undefined,
    communicationRating: data.communication_rating || undefined,
    qualityRating: data.quality_rating || undefined,
    punctualityRating: data.punctuality_rating || undefined,
    valueRating: data.value_rating || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    clientName: clientProfile?.full_name || undefined,
    clientPhoto: clientProfile?.profile_photo || undefined,
    jobDescription: jobRequest?.description || undefined,
    editedAt: data.edited_at || undefined,
    editCount: data.edit_count || 0,
    freelancerResponse: data.freelancer_response || undefined,
    responseCreatedAt: data.response_created_at || undefined,
  };
}

/**
 * Updates an existing review.
 * Only allowed within 7 days of creation and by the original reviewer.
 * 
 * @param reviewId - The review ID
 * @param params - Updated review data
 * @returns The updated review
 * @throws Error if review not found, time window expired, or validation fails
 */
export async function updateReview(
  reviewId: string,
  params: {
    rating?: number;
    comment?: string;
    communicationRating?: number;
    qualityRating?: number;
    punctualityRating?: number;
    valueRating?: number;
  }
) {
  const { rating, comment, communicationRating, qualityRating, punctualityRating, valueRating } = params;

  // Get existing review
  const { data: existingReview, error: fetchError } = await supabaseAdmin
    .from('reviews')
    .select('id, created_at, client_profile_id')
    .eq('id', reviewId)
    .single();

  if (fetchError) throw fetchError;
  if (!existingReview) {
    throw new Error('Review not found');
  }

  // Check if review is within edit window (7 days)
  const createdAt = new Date(existingReview.created_at);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceCreation > 7) {
    throw new Error('Review can only be edited within 7 days of creation');
  }

  // Validate rating if provided
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Build update object
  const updateData: Record<string, unknown> = {};
  if (rating !== undefined) updateData.rating = rating;
  if (comment !== undefined) updateData.comment = comment?.trim() || null;
  if (communicationRating !== undefined) updateData.communication_rating = communicationRating || null;
  if (qualityRating !== undefined) updateData.quality_rating = qualityRating || null;
  if (punctualityRating !== undefined) updateData.punctuality_rating = punctualityRating || null;
  if (valueRating !== undefined) updateData.value_rating = valueRating || null;

  // Update the review
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update(updateData)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Adds a response to a review from the freelancer.
 * 
 * @param reviewId - The review ID
 * @param response - The freelancer's response text
 * @returns The updated review
 * @throws Error if review not found or validation fails
 */
export async function addReviewResponse(
  reviewId: string,
  response: string
) {
  if (!response.trim()) {
    throw new Error('Response cannot be empty');
  }

  // Get existing review
  const { data: existingReview, error: fetchError } = await supabaseAdmin
    .from('reviews')
    .select('id, freelancer_response')
    .eq('id', reviewId)
    .single();

  if (fetchError) throw fetchError;
  if (!existingReview) {
    throw new Error('Review not found');
  }

  // Check if response already exists
  if (existingReview.freelancer_response) {
    throw new Error('Response already exists. You can edit your existing response.');
  }

  // Update the review with response
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update({
      freelancer_response: response.trim(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates an existing review response.
 * 
 * @param reviewId - The review ID
 * @param response - The updated response text
 * @returns The updated review
 * @throws Error if review not found or validation fails
 */
export async function updateReviewResponse(
  reviewId: string,
  response: string
) {
  if (!response.trim()) {
    throw new Error('Response cannot be empty');
  }

  // Get existing review
  const { data: existingReview, error: fetchError } = await supabaseAdmin
    .from('reviews')
    .select('id, freelancer_response')
    .eq('id', reviewId)
    .single();

  if (fetchError) throw fetchError;
  if (!existingReview) {
    throw new Error('Review not found');
  }

  // Update the review response
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update({
      freelancer_response: response.trim(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Flags a review for moderation.
 * 
 * @param reviewId - The review ID
 * @param flaggedByProfileId - The profile ID of the user flagging
 * @param reason - Reason for flagging
 * @param description - Optional description
 * @returns The created flag
 * @throws Error if review not found or flag already exists
 */
export async function flagReview(
  reviewId: string,
  flaggedByProfileId: string,
  reason: string,
  description?: string
) {
  if (!reason.trim()) {
    throw new Error('Reason is required');
  }

  // Verify review exists
  const { data: review, error: reviewError } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('id', reviewId)
    .single();

  if (reviewError) throw reviewError;
  if (!review) {
    throw new Error('Review not found');
  }

  // Check if already flagged by this user
  const { data: existingFlag, error: checkError } = await supabaseAdmin
    .from('review_flags')
    .select('id')
    .eq('review_id', reviewId)
    .eq('flagged_by_profile_id', flaggedByProfileId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existingFlag) {
    throw new Error('You have already flagged this review');
  }

  // Create the flag
  const { data, error } = await supabaseAdmin
    .from('review_flags')
    .insert({
      review_id: reviewId,
      flagged_by_profile_id: flaggedByProfileId,
      reason: reason.trim(),
      description: description?.trim() || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets all flags for a review (admin only).
 * 
 * @param reviewId - The review ID
 * @returns Array of flags
 */
export async function getReviewFlags(reviewId: string) {
  const { data, error } = await supabaseAdmin
    .from('review_flags')
    .select(`
      *,
      profiles!review_flags_flagged_by_profile_id_fkey(
        id,
        full_name
      )
    `)
    .eq('review_id', reviewId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Gets all pending flags (admin only).
 * 
 * @returns Array of pending flags
 */
export async function getPendingFlags() {
  const { data, error } = await supabaseAdmin
    .from('review_flags')
    .select(`
      *,
      reviews(
        id,
        rating,
        comment,
        freelancer_response,
        created_at,
        profiles!reviews_client_profile_id_fkey(
          id,
          full_name,
          profile_photo
        )
      ),
      profiles!review_flags_flagged_by_profile_id_fkey(
        id,
        full_name
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Checks if a review can be edited (within 7 days).
 * 
 * @param reviewId - The review ID
 * @returns True if review can be edited, false otherwise
 */
export async function canEditReview(reviewId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('created_at')
    .eq('id', reviewId)
    .single();

  if (error || !data) return false;

  const createdAt = new Date(data.created_at);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceCreation <= 7;
}

/**
 * Updates the status of a review flag.
 * 
 * @param flagId - The flag ID
 * @param status - New status
 * @param reviewedByProfileId - Profile ID of the admin reviewing
 * @param resolutionNotes - Optional notes about the resolution
 * @returns The updated flag
 * @throws Error if flag not found or update fails
 */
export async function updateFlagStatus(
  flagId: string,
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
  reviewedByProfileId: string,
  resolutionNotes?: string
) {
  const updateData: Record<string, unknown> = {
    status,
    reviewed_by_profile_id: reviewedByProfileId,
    reviewed_at: new Date().toISOString(),
  };

  if (resolutionNotes) {
    updateData.resolution_notes = resolutionNotes.trim();
  }

  const { data, error } = await supabaseAdmin
    .from('review_flags')
    .update(updateData)
    .eq('id', flagId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets a single flag by ID with all related data.
 * 
 * @param flagId - The flag ID
 * @returns The flag with review and profile data
 */
export async function getFlagById(flagId: string) {
  const { data, error } = await supabaseAdmin
    .from('review_flags')
    .select(`
      *,
      reviews(
        id,
        rating,
        comment,
        freelancer_response,
        created_at,
        profiles!reviews_client_profile_id_fkey(
          id,
          full_name,
          profile_photo
        )
      ),
      profiles!review_flags_flagged_by_profile_id_fkey(
        id,
        full_name
      ),
      reviewed_by:profiles!review_flags_reviewed_by_profile_id_fkey(
        id,
        full_name
      )
    `)
    .eq('id', flagId)
    .single();

  if (error) throw error;
  return data;
}

