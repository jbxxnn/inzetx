'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

export interface SavedFreelancer {
  id: string;
  freelancerProfileId: string;
  fullName?: string;
  profilePhoto?: string;
  headline?: string;
  description?: string;
  skills?: string[];
  location?: {
    city?: string;
    postcode?: string;
  };
  savedAt: string;
}

/**
 * Get all saved freelancers for a client
 */
export async function getSavedFreelancers(
  clientProfileId: string
): Promise<SavedFreelancer[]> {
  const { data, error } = await supabaseAdmin
    .from('saved_freelancers')
    .select(`
      id,
      created_at,
      freelancer_profiles!saved_freelancers_freelancer_profile_id_fkey(
        id,
        headline,
        description,
        skills,
        location,
        profile_id,
        profiles!freelancer_profiles_profile_id_fkey(
          id,
          full_name,
          profile_photo
        )
      )
    `)
    .eq('client_profile_id', clientProfileId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((saved) => {
    const freelancerProfile = Array.isArray(saved.freelancer_profiles)
      ? saved.freelancer_profiles[0]
      : saved.freelancer_profiles;
    
    const profile = freelancerProfile?.profiles
      ? (Array.isArray(freelancerProfile.profiles) 
          ? freelancerProfile.profiles[0] 
          : freelancerProfile.profiles)
      : null;

    return {
      id: saved.id,
      freelancerProfileId: freelancerProfile?.id || '',
      fullName: profile?.full_name || undefined,
      profilePhoto: profile?.profile_photo || undefined,
      headline: freelancerProfile?.headline || undefined,
      description: freelancerProfile?.description || undefined,
      skills: freelancerProfile?.skills || undefined,
      location: freelancerProfile?.location as { city?: string; postcode?: string } | undefined,
      savedAt: saved.created_at,
    };
  });
}

/**
 * Check if a freelancer is saved by a client
 */
export async function isFreelancerSaved(
  clientProfileId: string,
  freelancerProfileId: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('saved_freelancers')
    .select('id')
    .eq('client_profile_id', clientProfileId)
    .eq('freelancer_profile_id', freelancerProfileId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }

  return !!data;
}

/**
 * Save a freelancer for a client
 */
export async function saveFreelancer(
  clientProfileId: string,
  freelancerProfileId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('saved_freelancers')
    .insert({
      client_profile_id: clientProfileId,
      freelancer_profile_id: freelancerProfileId,
    });

  if (error) {
    // If it's a unique constraint violation, the freelancer is already saved
    if (error.code === '23505') {
      return; // Already saved, no error
    }
    throw error;
  }
}

/**
 * Unsave a freelancer for a client
 */
export async function unsaveFreelancer(
  clientProfileId: string,
  freelancerProfileId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('saved_freelancers')
    .delete()
    .eq('client_profile_id', clientProfileId)
    .eq('freelancer_profile_id', freelancerProfileId);

  if (error) throw error;
}

/**
 * Toggle save status of a freelancer
 */
export async function toggleSaveFreelancer(
  clientProfileId: string,
  freelancerProfileId: string
): Promise<boolean> {
  const isSaved = await isFreelancerSaved(clientProfileId, freelancerProfileId);
  
  if (isSaved) {
    await unsaveFreelancer(clientProfileId, freelancerProfileId);
    return false;
  } else {
    await saveFreelancer(clientProfileId, freelancerProfileId);
    return true;
  }
}

