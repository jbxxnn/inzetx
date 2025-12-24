'use server';

import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateMatchExplanation } from '@/lib/prompts';

/**
 * Parameters for finding matches for a job.
 */
export interface FindMatchesForJobParams {
  jobDescription: string;
  limit?: number;
  threshold?: number;
  timeWindow?: Record<string, unknown>;
  location?: Record<string, unknown>;
}

/**
 * Result of a freelancer match.
 */
export interface MatchResult {
  freelancerProfileId: string;
  headline: string | null;
  skills: string[] | null;
  similarity: number;
  explanation: string;
  hasExactAvailabilityMatch?: boolean;
  hasLocationMatch?: boolean;
  profilePhoto?: string | null;
  fullName?: string | null;
  location?: Record<string, unknown> | null;
}

/**
 * Helper function to check if a freelancer is available for a specific time window.
 */
function checkAvailability(
  freelancerAvailability: Record<string, unknown> | null,
  jobTimeWindow: Record<string, unknown> | undefined
): boolean {
  if (!jobTimeWindow || !freelancerAvailability) return true; // No filter if not specified

  // Extract day and time from job time window
  let requiredDay: string | null = null;
  let requiredTime: string | null = null;

  // Try to extract day from date or other fields
  if (jobTimeWindow.date) {
    const date = new Date(jobTimeWindow.date as string);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    requiredDay = dayNames[date.getDay()];
  }

  // Extract time of day
  if (jobTimeWindow.timeOfDay) {
    requiredTime = (jobTimeWindow.timeOfDay as string).toLowerCase();
  } else if (jobTimeWindow.time) {
    // Try to infer time of day from time string
    const timeStr = (jobTimeWindow.time as string).toLowerCase();
    if (timeStr.includes('morning') || timeStr.includes('am')) {
      requiredTime = 'morning';
    } else if (timeStr.includes('afternoon')) {
      requiredTime = 'afternoon';
    } else if (timeStr.includes('evening') || timeStr.includes('pm') || timeStr.includes('night')) {
      requiredTime = 'evening';
    }
  }

  // If we can't determine required day/time, don't filter
  if (!requiredDay || !requiredTime) return true;

  // Check if freelancer has availability for this day and time
  const days = freelancerAvailability.days;
  if (!days || typeof days !== 'object') return false;

  const dayAvailability = days[requiredDay as keyof typeof days];
  if (!Array.isArray(dayAvailability)) return false;

  return (dayAvailability as string[]).includes(requiredTime as string);
}

/**
 * Helper function to check if a freelancer can service a job location.
 */
function checkLocation(
  freelancerLocation: Record<string, unknown> | null,
  jobLocation: Record<string, unknown> | undefined
): boolean {
  if (!jobLocation || !freelancerLocation) return true; // No filter if not specified

  const jobPostcode = jobLocation.postcode;
  const freelancerPostcode = freelancerLocation.postcode;
  const travelRadius = freelancerLocation.travelRadius;

  if (!jobPostcode || !freelancerPostcode) return true; // Can't filter without postcodes

  // Extract numeric parts of postcodes (Dutch postcodes are 4 digits + 2 letters, e.g., "1312AB")
  const jobPostcodeNum = parseInt((jobPostcode as string).substring(0, 4));
  const freelancerPostcodeNum = parseInt((freelancerPostcode as string).substring(0, 4));

  if (isNaN(jobPostcodeNum) || isNaN(freelancerPostcodeNum)) return true; // Invalid postcodes

  const distance = Math.abs(jobPostcodeNum - freelancerPostcodeNum);

  // Check based on travel radius
  switch (travelRadius) {
    case 'nearby':
      // Within 2km - approximate as postcode difference <= 2
      return distance <= 2;
    case 'city':
      // Whole city of Almere - all Almere postcodes start with 13
      return jobPostcodeNum >= 1300 && jobPostcodeNum < 1400;
    case 'city_plus':
      // City and surroundings - more lenient
      return distance <= 10;
    default:
      return true; // Unknown radius, don't filter
  }
}

/**
 * Finds matching freelancers for a job description using vector similarity search with post-filtering.
 * 
 * This function:
 * 1. Generates an embedding from the job description (or uses composite text if timeWindow/location provided)
 * 2. Calls the Supabase RPC function to find similar freelancer profiles
 * 3. Filters results by exact availability and location matches
 * 4. Re-ranks results to prioritize exact matches
 * 5. Generates AI explanations for each match in parallel
 * 
 * @param params - Job description and matching parameters
 * @returns Array of matched freelancers with explanations, sorted by relevance
 * @throws Error if embedding generation, RPC call, or AI generation fails
 */
export async function findMatchesForJob(
  params: FindMatchesForJobParams
): Promise<MatchResult[]> {
  const { jobDescription, limit = 5, threshold = 0.2, timeWindow, location } = params;

  if (!jobDescription || jobDescription.trim().length === 0) {
    throw new Error('Job description is required');
  }

  // Build composite text for embedding (same as job creation)
  const compositeTextParts: string[] = [];
  compositeTextParts.push(jobDescription.trim());
  
  if (timeWindow && typeof timeWindow === 'object') {
    const timeParts: string[] = [];
    if (timeWindow.date) timeParts.push(`date: ${timeWindow.date}`);
    if (timeWindow.start) timeParts.push(`start: ${timeWindow.start}`);
    if (timeWindow.end) timeParts.push(`end: ${timeWindow.end}`);
    if (timeWindow.time) timeParts.push(`time: ${timeWindow.time}`);
    if (timeWindow.timeOfDay) timeParts.push(`time: ${timeWindow.timeOfDay}`);
    if (timeWindow.flexible) timeParts.push('flexible timing');
    if (timeWindow.notes) timeParts.push(`notes: ${timeWindow.notes}`);
    if (timeParts.length > 0) {
      compositeTextParts.push(`When: ${timeParts.join(', ')}`);
    }
  }
  
  if (location && typeof location === 'object') {
    const locParts: string[] = [];
    if (location.postcode) locParts.push(`postcode ${location.postcode}`);
    if (location.address) locParts.push(location.address as string);
    if (locParts.length > 0) {
      compositeTextParts.push(`Location: ${locParts.join(', ')}`);
    }
  }
  
  const compositeText = compositeTextParts.join('. ');

  // Generate embedding from composite text
  const { embedding } = await embed({
    model: embeddingModel,
    value: compositeText,
  });

  // Call Supabase RPC function to find matches (get more results for filtering)
  // Request more results than needed to account for filtering
  const { data: rows, error } = await supabaseAdmin.rpc('match_freelancers', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit * 3, // Get 3x results to filter down
  });

  if (error) throw error;

  // If no matches found, return empty array
  if (!rows || rows.length === 0) {
    return [];
  }

  // Fetch full profile data including availability and location for filtering
  const profileIds = rows.map((row: { id: string }) => row.id);
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('freelancer_profiles')
    .select('id, availability, location')
    .in('id', profileIds);

  if (profilesError) throw profilesError;

  // Create a map of profile data for quick lookup
  const profileMap = new Map(
    (profiles || []).map((p: { id: string, availability: Record<string, unknown>, location: Record<string, unknown> }) => [p.id, { availability: p.availability, location: p.location }])
  );

  // Filter and score matches
  const scoredMatches = rows
    .map((row: { id: string, similarity: number, description: string, skills: string[] }) => {
      const profileData = profileMap.get(row.id);
      const hasExactAvailability = checkAvailability(profileData?.availability as Record<string, unknown> | null, timeWindow as Record<string, unknown> | undefined);
      const hasLocationMatch = checkLocation(profileData?.location as Record<string, unknown> | null, location as Record<string, unknown> | undefined);

      // Calculate relevance score (higher is better)
      // Exact matches get boost, then similarity score
      let relevanceScore = row.similarity;
      if (hasExactAvailability) relevanceScore += 0.2; // Boost for exact availability
      if (hasLocationMatch) relevanceScore += 0.1; // Boost for location match

      return {
        row,
        hasExactAvailability,
        hasLocationMatch,
        relevanceScore,
      };
    })
    // Filter out matches that don't meet availability/location requirements
    .filter((match: { hasExactAvailability: boolean, hasLocationMatch: boolean }) => {
      // If timeWindow is specified, require exact availability match
      if (timeWindow && !match.hasExactAvailability) return false;
      // If location is specified, require location match
      if (location && !match.hasLocationMatch) return false;
      return true;
    })
    // Sort by relevance score (descending)
    .sort((a: { relevanceScore: number }, b: { relevanceScore: number }) => b.relevanceScore - a.relevanceScore)
    // Take top N results
    .slice(0, limit);

  // Generate explanations for each match in parallel
  const matches = await Promise.all(
    scoredMatches.map(async (match: { row: { id: string, headline: string | null, skills: string[] | null, similarity: number, description: string }, hasExactAvailability: boolean, hasLocationMatch: boolean }) => {
      const explanation = await generateMatchExplanation(
        jobDescription,
        match.row.description || '',
        match.row.skills || []
      );

      return {
        freelancerProfileId: match.row.id,
        headline: match.row.headline,
        skills: match.row.skills,
        similarity: match.row.similarity,
        explanation,
        hasExactAvailabilityMatch: match.hasExactAvailability,
        hasLocationMatch: match.hasLocationMatch,
      };
    })
  );

  return matches;
}

/**
 * Finds matches for an existing job request (uses stored embedding) with post-filtering.
 * 
 * @param jobRequestId - The job request ID
 * @param limit - Maximum number of matches to return (default: 5)
 * @param threshold - Minimum similarity threshold (default: 0.2)
 * @returns Array of matched freelancers with explanations, sorted by relevance
 */
export async function findMatchesForJobRequest(
  jobRequestId: string,
  limit: number = 5,
  threshold: number = 0.2
): Promise<MatchResult[]> {
  // First, get the job request with its embedding and full data
  const { data: job, error: jobError } = await supabaseAdmin
    .from('job_requests')
    .select('id, description, embedding, time_window, location')
    .eq('id', jobRequestId)
    .single();

  if (jobError) throw jobError;
  if (!job) throw new Error('Job request not found');
  if (!job.embedding) {
    throw new Error('Job request does not have an embedding');
  }

  // Call Supabase RPC function with stored embedding (get more results for filtering)
  const { data: rows, error } = await supabaseAdmin.rpc('match_freelancers', {
    query_embedding: job.embedding,
    match_threshold: threshold,
    match_count: limit * 3, // Get 3x results to filter down
  });

  if (error) {
    console.error('RPC match_freelancers error:', error);
    throw error;
  }

  if (!rows || rows.length === 0) {
    return [];
  }

  // Fetch full profile data including availability and location for filtering
  const profileIds = rows.map((row: { id: string }) => row.id);
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('freelancer_profiles')
    .select('id, availability, location')
    .in('id', profileIds);

  if (profilesError) throw profilesError;

  // Debug: log fetched profiles to verify location data
  console.log('[findMatchesForJobRequest] Fetched freelancer profiles:', profiles?.map((p: { id: string, location: Record<string, unknown> }) => ({
    id: p.id,
    location: p.location,
    locationType: typeof p.location,
    hasLocation: !!p.location,
    locationKeys: p.location ? Object.keys(p.location) : [],
  })));

  // Create a map of profile data for quick lookup
  const profileMap = new Map(
    (profiles || []).map((p: { id: string, availability: Record<string, unknown>, location: Record<string, unknown> }) => [p.id, { availability: p.availability, location: p.location }])
  );

  // Fetch profile data (full_name and profile_photo) from profiles table
  // Get profile_ids from rows (which come from RPC function)
  const profileIdsForProfiles = Array.from(new Set(
    rows.map((row: { profile_id: string }) => row.profile_id).filter((id: string) => !!id)
  ));
  
  const { data: profileData, error: profileDataError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, profile_photo')
    .in('id', profileIdsForProfiles);

  if (profileDataError) throw profileDataError;

  // Create a map of profile_id -> profile data (full_name, profile_photo)
  const profileDataMap = new Map(
    (profileData || []).map((p: { id: string, full_name?: string, profile_photo?: string }) => [p.id, { full_name: p.full_name, profile_photo: p.profile_photo }])
  );

  // Filter and score matches
  const scoredMatches = rows
    .map((row: { id: string, profile_id: string, similarity: number, description: string, skills: string[] }) => {
      const freelancerProfileData = profileMap.get(row.id);
      
      // Debug: log location lookup for each row
      if (!freelancerProfileData?.location) {
        console.log('No location found for freelancer_profile.id:', row.id, 'profileMap has key:', profileMap.has(row.id));
      }
      
      const hasExactAvailability = checkAvailability(freelancerProfileData?.availability as Record<string, unknown> | null, job.time_window as Record<string, unknown> | undefined);
      const hasLocationMatch = checkLocation(freelancerProfileData?.location as Record<string, unknown> | null, job.location as Record<string, unknown> | undefined);

      // Calculate relevance score (higher is better)
      let relevanceScore = row.similarity;
      if (hasExactAvailability) relevanceScore += 0.2; // Boost for exact availability
      if (hasLocationMatch) relevanceScore += 0.1; // Boost for location match

      return {
        row,
        hasExactAvailability,
        hasLocationMatch,
        relevanceScore,
        location: freelancerProfileData?.location || null, // Include location in scored match
      };
    })
    // Filter out matches that don't meet availability/location requirements
    .filter((match: { hasExactAvailability: boolean, hasLocationMatch: boolean }) => {
      // If timeWindow is specified, require exact availability match
      if (job.time_window && !match.hasExactAvailability) return false;
      // If location is specified, require location match
      if (job.location && !match.hasLocationMatch) return false;
      return true;
    })
    // Sort by relevance score (descending)
    .sort((a: { relevanceScore: number }, b: { relevanceScore: number }) => b.relevanceScore - a.relevanceScore)
    // Take top N results
    .slice(0, limit);

  // Generate explanations for each match
  const matches = await Promise.all(
    scoredMatches.map(async (match: { row: { id: string, profile_id: string, headline: string | null, skills: string[] | null, similarity: number, description: string }, hasExactAvailability: boolean, hasLocationMatch: boolean, location: Record<string, unknown> | null }) => {
      const explanation = await generateMatchExplanation(
        job.description || '',
        match.row.description || '',
        match.row.skills || []
      );

      // Get profile data (full_name and profile_photo) from the profile_id
      const profileInfo = profileDataMap.get(match.row.profile_id);
      // Get location from the scored match (already fetched and stored)
      const locationData = match.location;

      return {
        freelancerProfileId: match.row.id,
        headline: match.row.headline,
        skills: match.row.skills,
        similarity: match.row.similarity,
        explanation,
        hasExactAvailabilityMatch: match.hasExactAvailability,
        hasLocationMatch: match.hasLocationMatch,
        profilePhoto: profileInfo?.profile_photo || null,
        fullName: profileInfo?.full_name || null,
        location: locationData,
      };
    })
  );

  return matches;
}

