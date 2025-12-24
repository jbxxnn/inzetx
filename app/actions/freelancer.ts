'use server';

import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getFreelancerReviewStats } from '@/app/actions/review';
import {
  generateFreelancerHeadline,
  generateSkillTags,
} from '@/lib/prompts';

/**
 * Parameters for upserting a freelancer profile.
 */
export interface UpsertFreelancerProfileParams {
  profileId: string;
  description: string;
  availability: Record<string, unknown>;
  location: Record<string, unknown>;
  exampleTasks?: string[];
  pricingStyle?: 'hourly' | 'per_task';
  hourlyRate?: number;
  isActive?: boolean;
  shortNotice?: boolean;
  skills?: string[]; // User-selected skills (if provided, will be used instead of AI-generated)
}

/**
 * Creates or updates a freelancer profile with AI-generated enrichment.
 * 
 * This function:
 * 1. Generates an embedding from a composite text (description + skills + availability + location + pricing)
 * 2. Generates a headline and skill tags in parallel
 * 3. Upserts the profile with all AI-generated fields
 * 
 * The embedding includes multiple fields to enable more refined semantic matching:
 * - Description, skills, example tasks, availability, location, and pricing
 * 
 * @param params - Profile data including description, availability, and location
 * @returns The created/updated freelancer profile
 * @throws Error if embedding generation, AI generation, or database operation fails
 */
export async function upsertFreelancerProfile(
  params: UpsertFreelancerProfileParams
) {
  const { 
    profileId, 
    description, 
    availability, 
    location,
    exampleTasks,
    pricingStyle,
    hourlyRate,
    isActive,
    shortNotice,
    skills: providedSkills,
  } = params;

  // Validate description is not empty
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required');
  }

  // Build composite text for embedding that includes all relevant information
  const compositeTextParts: string[] = [];
  
  // Add description (most important)
  compositeTextParts.push(description.trim());
  
  // Add skills
  const skillsToAdd = providedSkills && providedSkills.length > 0 ? providedSkills : [];
  if (skillsToAdd.length > 0) {
    compositeTextParts.push(`Skills: ${skillsToAdd.join(', ')}`);
  }
  
  // Add example tasks
  if (exampleTasks && exampleTasks.length > 0) {
    compositeTextParts.push(`Can help with: ${exampleTasks.join(', ')}`);
  }
  
  // Add availability information
  if (availability && typeof availability === 'object') {
    const availParts: string[] = [];
    if (availability.days && typeof availability.days === 'object') {
      const days = availability.days as Record<string, string[]>;
      const dayLabels: Record<string, string> = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
      };
      const timeLabels: Record<string, string> = {
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
      };
      
      Object.entries(days).forEach(([day, times]) => {
        if (times && times.length > 0) {
          const dayName = dayLabels[day] || day;
          const timeNames = times.map(t => timeLabels[t] || t).join(', ');
          availParts.push(`${dayName} ${timeNames}`);
        }
      });
    }
    if (availability.shortNotice) {
      availParts.push('available on short notice');
    }
    if (availParts.length > 0) {
      compositeTextParts.push(`Available: ${availParts.join('; ')}`);
    }
  }
  
  // Add location information
  if (location && typeof location === 'object') {
    const locParts: string[] = [];
    if (location.postcode) {
      locParts.push(`postcode ${location.postcode}`);
    }
    if (location.travelRadius) {
      const radiusLabels: Record<string, string> = {
        nearby: 'within 2 km',
        city: 'whole city of Almere',
        city_plus: 'city and surroundings',
      };
      locParts.push(`travels ${radiusLabels[location.travelRadius as string] || location.travelRadius}`);
    }
    if (locParts.length > 0) {
      compositeTextParts.push(`Location: ${locParts.join(', ')}`);
    }
  }
  
  // Add pricing information
  if (pricingStyle) {
    if (pricingStyle === 'hourly' && hourlyRate) {
      compositeTextParts.push(`Pricing: €${hourlyRate} per hour`);
    } else if (pricingStyle === 'per_task') {
      compositeTextParts.push('Pricing: per task');
    }
  }
  
  // Combine all parts into a single text for embedding
  const compositeText = compositeTextParts.join('. ');
  
  // Generate embedding from composite text
  const { embedding } = await embed({
    model: embeddingModel,
    value: compositeText,
  });

  // Ensure embedding is an array (Supabase pgvector requires array format)
  const embeddingArray = Array.isArray(embedding) ? embedding : embedding;

  // Generate headline and tags in parallel for better performance
  // Use provided skills if available, otherwise generate from description
  const [headline, generatedSkills] = await Promise.all([
    generateFreelancerHeadline(description),
    providedSkills && providedSkills.length > 0 
      ? Promise.resolve(providedSkills) 
      : generateSkillTags(description),
  ]);
  
  const skills = providedSkills && providedSkills.length > 0 ? providedSkills : generatedSkills;

  // Upsert the profile
  // Supabase will automatically convert the array to vector type
  const upsertData: Record<string, unknown> = {
    profile_id: profileId,
    description: description.trim(),
    availability,
    location,
    embedding: embeddingArray,
    headline,
    skills,
    updated_at: new Date().toISOString(),
  };

  // Add optional fields if provided
  if (exampleTasks !== undefined) upsertData.example_tasks = exampleTasks;
  if (pricingStyle !== undefined) upsertData.pricing_style = pricingStyle;
  if (hourlyRate !== undefined) upsertData.hourly_rate = hourlyRate;
  if (isActive !== undefined) upsertData.is_active = isActive;
  if (shortNotice !== undefined) upsertData.short_notice = shortNotice;

  const { data, error } = await supabaseAdmin
    .from('freelancer_profiles')
    .upsert(upsertData, { onConflict: 'profile_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets a freelancer profile by profile ID.
 * 
 * @param profileId - The profile ID
 * @returns The freelancer profile or null if not found
 */
export async function getFreelancerProfile(profileId: string) {
  const { data, error } = await supabaseAdmin
    .from('freelancer_profiles')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Gets random freelancers for display.
 * 
 * @param limit - Number of freelancers to return (default: 3)
 * @returns Array of freelancer profiles with profile data
 */
export async function getRandomFreelancers(limit: number = 3) {
  // First get freelancer profiles
  const { data: freelancerData, error: freelancerError } = await supabaseAdmin
    .from('freelancer_profiles')
    .select('*')
    .not('description', 'is', null)
    .limit(limit * 2); // Fetch more to randomize

  if (freelancerError) {
    console.error('Error fetching freelancer profiles:', freelancerError);
    throw freelancerError;
  }

  if (!freelancerData || freelancerData.length === 0) {
    return [];
  }

  // Get profile IDs
  const profileIds = freelancerData
    .map((fp) => fp.profile_id)
    .filter((id): id is string => !!id);

  if (profileIds.length === 0) {
    return [];
  }

  // Fetch profiles with full_name and profile_photo
  const { data: profilesData, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, profile_photo')
    .in('id', profileIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }

  // Create a map of profile_id -> profile data
  const profileMap = new Map(
    (profilesData || []).map((p) => [p.id, p])
  );

  // Combine freelancer profiles with their profile data
  const combined = freelancerData.map((fp) => ({
    ...fp,
    profiles: profileMap.get(fp.profile_id) || null,
  }));

  // Randomize and limit to requested number
  const shuffled = combined.sort(() => Math.random() - 0.5);
  const result = shuffled.slice(0, limit);

  // Debug: log the structure
  console.log('Fetched freelancers:', result.map((f) => ({
    id: f.id,
    profileId: f.profile_id,
    hasProfiles: !!f.profiles,
    fullName: f.profiles?.full_name,
    profilePhoto: f.profiles?.profile_photo,
  })));

  return result;
}

/**
 * Gets dashboard statistics for a freelancer.
 * 
 * @param freelancerProfileId - The freelancer profile ID
 * @returns Dashboard stats including earnings, completed jobs, rating, and response rate
 */
export async function getFreelancerDashboardStats(freelancerProfileId: string) {
  // Get all bookings for this freelancer
  const { data: bookings, error: bookingsError } = await supabaseAdmin
    .from('bookings')
    .select('*, job_requests(budget)')
    .eq('freelancer_profile_id', freelancerProfileId);

  if (bookingsError) throw bookingsError;

  const allBookings = bookings || [];
  const completedBookings = allBookings.filter(b => b.status === 'completed');
  
  // Calculate total earnings from completed bookings
  // Extract numeric value from budget string (e.g., "€150" -> 150)
  const extractPrice = (budget: string | null | undefined): number => {
    if (!budget) return 0;
    const match = budget.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const totalEarnings = completedBookings.reduce((sum, booking) => {
    const jobRequest = booking.job_requests as { budget?: string } | null | undefined;
    // Handle case where job_requests might be an array (shouldn't happen, but just in case)
    const budget = Array.isArray(jobRequest) 
      ? jobRequest[0]?.budget 
      : jobRequest?.budget;
    return sum + extractPrice(budget);
  }, 0);

  // Calculate monthly earnings (current month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyCompleted = completedBookings.filter(b => {
    const completedAt = new Date(b.updated_at || b.created_at);
    return completedAt >= startOfMonth;
  });
  
  const monthlyEarnings = monthlyCompleted.reduce((sum, booking) => {
    const jobRequest = booking.job_requests as { budget?: string } | null | undefined;
    // Handle case where job_requests might be an array (shouldn't happen, but just in case)
    const budget = Array.isArray(jobRequest) 
      ? jobRequest[0]?.budget 
      : jobRequest?.budget;
    return sum + extractPrice(budget);
  }, 0);

  // Count completed jobs
  const completedJobs = completedBookings.length;

  // Get job invites to calculate response rate
  const { data: invites, error: invitesError } = await supabaseAdmin
    .from('job_invites')
    .select('status')
    .eq('freelancer_profile_id', freelancerProfileId);

  if (invitesError) throw invitesError;

  const allInvites = invites || [];
  const acceptedInvites = allInvites.filter(i => i.status === 'accepted').length;
  const responseRate = allInvites.length > 0 
    ? Math.round((acceptedInvites / allInvites.length) * 100)
    : 100;

  // Get rating from reviews system
  let rating = 0;
  try {
    const reviewStats = await getFreelancerReviewStats(freelancerProfileId);
    rating = reviewStats.averageRating > 0 ? reviewStats.averageRating : 0;
  } catch (error) {
    // If reviews system isn't set up yet or there's an error, default to 0
    console.error('Error fetching review stats:', error);
    rating = 0;
  }

  return {
    totalEarnings,
    monthlyEarnings,
    completedJobs,
    rating,
    responseRate,
  };
}

/**
 * Upcoming job for freelancer dashboard.
 */
export interface UpcomingJob {
  id: string;
  title: string;
  client: string;
  address: string;
  date: string;
  price: number;
  status: "confirmed" | "pending";
  jobRequestId?: string;
  clientProfileId?: string;
}

/**
 * Gets upcoming bookings for a freelancer with client and job details.
 * 
 * @param freelancerProfileId - The freelancer profile ID
 * @param limit - Maximum number of bookings to return (default: 10)
 * @returns Array of upcoming bookings with client and job information
 */
export async function getFreelancerUpcomingBookings(
  freelancerProfileId: string,
  limit: number = 10
): Promise<UpcomingJob[]> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      job_requests(
        id,
        description,
        location,
        budget,
        time_window
      ),
      profiles!bookings_client_profile_id_fkey(
        id,
        full_name,
        profile_photo
      )
    `)
    .eq('freelancer_profile_id', freelancerProfileId)
    .eq('status', 'upcoming')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(booking => {
    const jobRequest = booking.job_requests as {
      id: string;
      description: string;
      location?: { city?: string; postcode?: string; address?: string } | null;
      budget?: string | null;
      time_window?: Record<string, unknown> | null;
    } | null;

    const clientProfile = booking.profiles as {
      id: string;
      full_name?: string | null;
      profile_photo?: string | null;
    } | null;

    const scheduledTime = booking.scheduled_time as {
      date?: string;
      start?: string;
      end?: string;
      time?: string;
      notes?: string;
    } | null;

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

    // Format date/time
    let dateStr = 'Date not specified';
    if (scheduledTime) {
      if (scheduledTime.date) {
        try {
          const date = new Date(scheduledTime.date);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          if (date.toDateString() === today.toDateString()) {
            dateStr = `Today, ${scheduledTime.time || scheduledTime.start || ''}`;
          } else if (date.toDateString() === tomorrow.toDateString()) {
            dateStr = `Tomorrow, ${scheduledTime.time || scheduledTime.start || ''}`;
          } else {
            dateStr = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: scheduledTime.time ? undefined : '2-digit',
              minute: scheduledTime.time ? undefined : '2-digit'
            });
            if (scheduledTime.time) dateStr += `, ${scheduledTime.time}`;
          }
        } catch {
          dateStr = scheduledTime.date;
        }
      } else if (scheduledTime.start) {
        try {
          const date = new Date(scheduledTime.start);
          dateStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          dateStr = scheduledTime.start;
        }
      }
    }

    // Extract price from budget
    const extractPrice = (budget: string | null | undefined): number => {
      if (!budget) return 0;
      const match = budget.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    return {
      id: booking.id,
      title: jobRequest?.description?.substring(0, 50) + (jobRequest?.description && jobRequest.description.length > 50 ? '...' : '') || 'Job Request',
      client: clientProfile?.full_name || 'Client',
      address,
      date: dateStr,
      price: extractPrice(jobRequest?.budget),
      status: (booking.status === 'upcoming' ? 'confirmed' : 'pending') as "confirmed" | "pending",
      jobRequestId: jobRequest?.id,
      clientProfileId: clientProfile?.id,
    };
  });
}

