'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Ensures a profile exists for the authenticated user and sets/updates their role.
 * If role is 'freelancer', also creates a minimal freelancer_profiles row.
 * 
 * @param role - Either 'client' or 'freelancer'
 * @returns The profile data
 * @throws Error if user is not authenticated or database operation fails
 */
export async function ensureProfile(role: 'client' | 'freelancer') {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Check if profile already exists
  const { data: existing, error: selectError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  let profileId: string;

  if (existing) {
    // Update existing profile with new role
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    profileId = data.id;
  } else {
    // Create new profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({ user_id: user.id, role })
      .select()
      .single();

    if (error) throw error;
    profileId = data.id;
  }

  // If role is 'freelancer', ensure freelancer_profiles row exists
  if (role === 'freelancer') {
    const { data: existingFreelancerProfile } = await supabaseAdmin
      .from('freelancer_profiles')
      .select('id')
      .eq('profile_id', profileId)
      .maybeSingle();

    // Only create if it doesn't exist
    if (!existingFreelancerProfile) {
      // Create minimal freelancer profile with placeholder description
      // User will update this when they fill out the form
      await supabaseAdmin
        .from('freelancer_profiles')
        .insert({
          profile_id: profileId,
          description: 'Please complete your profile by describing your skills and services.',
          availability: { flexible: true, notes: '' },
          location: { city: 'Almere', postcode: '' },
        })
        .select()
        .single();
    }
  }

  // Return the profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  return profile!;
}

/**
 * Gets the current user's profile.
 * 
 * @returns The profile data or null if not found
 * @throws Error if user is not authenticated
 */
export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Updates the current user's profile with additional information.
 * 
 * @param data - Profile data to update (fullName, phoneNumber, languages, profilePhoto)
 * @returns The updated profile
 * @throws Error if user is not authenticated or update fails
 */
export async function updateProfile(data: {
  fullName?: string;
  phoneNumber?: string;
  languages?: string[];
  profilePhoto?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    throw new Error('Profile not found');
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.fullName !== undefined) updateData.full_name = data.fullName;
  if (data.phoneNumber !== undefined) updateData.phone_number = data.phoneNumber;
  if (data.languages !== undefined) updateData.languages = data.languages;
  if (data.profilePhoto !== undefined) updateData.profile_photo = data.profilePhoto;

  const { data: updated, error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', profile.id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

