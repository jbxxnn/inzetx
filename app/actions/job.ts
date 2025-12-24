'use server';

import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Parameters for creating a job request.
 */
export interface CreateJobRequestParams {
  clientProfileId: string;
  description: string;
  location: Record<string, any>;
  timeWindow: Record<string, any>;
  budget?: string;
}

/**
 * Creates a new job request with AI-generated embedding.
 * 
 * This function:
 * 1. Inserts the job request with basic data
 * 2. Generates an embedding from the description
 * 3. Updates the job request with the embedding
 * 
 * @param params - Job request data
 * @returns The created job request with embedding
 * @throws Error if description is empty, embedding generation fails, or database operation fails
 */
export async function createJobRequest(params: CreateJobRequestParams) {
  const { clientProfileId, description, location, timeWindow, budget } = params;

  // Validate description is not empty
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required');
  }

  // Insert job request first (without embedding)
  const { data: job, error: insertError } = await supabaseAdmin
    .from('job_requests')
    .insert({
      client_profile_id: clientProfileId,
      description: description.trim(),
      location,
      time_window: timeWindow,
      budget: budget?.trim() || null,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Build composite text for embedding that includes all relevant information
  const compositeTextParts: string[] = [];
  
  // Add description (most important)
  compositeTextParts.push(description.trim());
  
  // Add time window information
  if (timeWindow && typeof timeWindow === 'object') {
    const timeParts: string[] = [];
    // Handle different time window structures
    if (timeWindow.date) {
      timeParts.push(`date: ${timeWindow.date}`);
    }
    if (timeWindow.start) {
      timeParts.push(`start: ${timeWindow.start}`);
    }
    if (timeWindow.end) {
      timeParts.push(`end: ${timeWindow.end}`);
    }
    if (timeWindow.time) {
      timeParts.push(`time: ${timeWindow.time}`);
    }
    if (timeWindow.timeOfDay) {
      timeParts.push(`time: ${timeWindow.timeOfDay}`);
    }
    if (timeWindow.flexible) {
      timeParts.push('flexible timing');
    }
    if (timeWindow.notes) {
      timeParts.push(`notes: ${timeWindow.notes}`);
    }
    if (timeParts.length > 0) {
      compositeTextParts.push(`When: ${timeParts.join(', ')}`);
    }
  }
  
  // Add location information
  if (location && typeof location === 'object') {
    const locParts: string[] = [];
    if (location.postcode) {
      locParts.push(`postcode ${location.postcode}`);
    }
    if (location.address) {
      locParts.push(location.address);
    }
    if (locParts.length > 0) {
      compositeTextParts.push(`Location: ${locParts.join(', ')}`);
    }
  }
  
  // Add budget if provided
  if (budget) {
    compositeTextParts.push(`Budget: ${budget}`);
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

  // Update job request with embedding
  // Supabase will automatically convert the array to vector type
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('job_requests')
    .update({ embedding: embeddingArray })
    .eq('id', job.id)
    .select()
    .single();

  if (updateError) throw updateError;
  return updated;
}

/**
 * Gets a job request by ID.
 * 
 * @param jobId - The job request ID
 * @returns The job request or null if not found
 */
export async function getJobRequest(jobId: string) {
  const { data, error } = await supabaseAdmin
    .from('job_requests')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Gets all job requests for a client.
 * 
 * @param clientProfileId - The client's profile ID
 * @returns Array of job requests
 */
export async function getClientJobRequests(clientProfileId: string) {
  const { data, error } = await supabaseAdmin
    .from('job_requests')
    .select('*')
    .eq('client_profile_id', clientProfileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

