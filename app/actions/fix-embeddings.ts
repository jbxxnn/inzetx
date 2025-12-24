'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { embed } from 'ai';
import { embeddingModel } from '@/lib/ai';

/**
 * Fixes embeddings for existing records by regenerating them using composite text.
 * This should be run if embeddings were stored incorrectly or need to be updated
 * to include additional fields (location, time window, etc.).
 */
export async function fixJobEmbeddings() {
  // Get all jobs with their full data
  const { data: jobs, error: jobsError } = await supabaseAdmin
    .from('job_requests')
    .select('id, description, location, time_window, budget')
    .not('description', 'is', null);

  if (jobsError) throw jobsError;

  const results = [];

  for (const job of jobs || []) {
    try {
      // Build composite text (same logic as createJobRequest)
      const compositeTextParts: string[] = [];
      compositeTextParts.push(job.description.trim());
      
      if (job.time_window && typeof job.time_window === 'object') {
        const timeParts: string[] = [];
        const tw = job.time_window as Record<string, any>;
        if (tw.date) timeParts.push(`date: ${tw.date}`);
        if (tw.start) timeParts.push(`start: ${tw.start}`);
        if (tw.end) timeParts.push(`end: ${tw.end}`);
        if (tw.time) timeParts.push(`time: ${tw.time}`);
        if (tw.timeOfDay) timeParts.push(`time: ${tw.timeOfDay}`);
        if (tw.flexible) timeParts.push('flexible timing');
        if (tw.notes) timeParts.push(`notes: ${tw.notes}`);
        if (timeParts.length > 0) {
          compositeTextParts.push(`When: ${timeParts.join(', ')}`);
        }
      }
      
      if (job.location && typeof job.location === 'object') {
        const locParts: string[] = [];
        const loc = job.location as Record<string, any>;
        if (loc.postcode) locParts.push(`postcode ${loc.postcode}`);
        if (loc.address) locParts.push(loc.address);
        if (locParts.length > 0) {
          compositeTextParts.push(`Location: ${locParts.join(', ')}`);
        }
      }
      
      if (job.budget) {
        compositeTextParts.push(`Budget: ${job.budget}`);
      }
      
      const compositeText = compositeTextParts.join('. ');
      
      // Regenerate embedding from composite text
      const { embedding } = await embed({
        model: embeddingModel,
        value: compositeText,
      });

      // Update with proper array format
      const { error: updateError } = await supabaseAdmin
        .from('job_requests')
        .update({ embedding: Array.isArray(embedding) ? embedding : embedding })
        .eq('id', job.id);

      if (updateError) {
        results.push({ jobId: job.id, success: false, error: updateError.message });
      } else {
        results.push({ jobId: job.id, success: true });
      }
    } catch (err) {
      results.push({
        jobId: job.id,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return results;
}

export async function fixFreelancerEmbeddings() {
  // Get all freelancer profiles with their full data
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('freelancer_profiles')
    .select('id, description, skills, availability, location, example_tasks, pricing_style, hourly_rate')
    .not('description', 'is', null);

  if (profilesError) throw profilesError;

  const results = [];

  for (const profile of profiles || []) {
    try {
      // Build composite text (same logic as upsertFreelancerProfile)
      const compositeTextParts: string[] = [];
      compositeTextParts.push(profile.description.trim());
      
      if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
        compositeTextParts.push(`Skills: ${profile.skills.join(', ')}`);
      }
      
      if (profile.example_tasks && Array.isArray(profile.example_tasks) && profile.example_tasks.length > 0) {
        compositeTextParts.push(`Can help with: ${profile.example_tasks.join(', ')}`);
      }
      
      if (profile.availability && typeof profile.availability === 'object') {
        const availParts: string[] = [];
        const avail = profile.availability as Record<string, any>;
        if (avail.days && typeof avail.days === 'object') {
          const days = avail.days as Record<string, string[]>;
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
        if (avail.shortNotice) {
          availParts.push('available on short notice');
        }
        if (availParts.length > 0) {
          compositeTextParts.push(`Available: ${availParts.join('; ')}`);
        }
      }
      
      if (profile.location && typeof profile.location === 'object') {
        const locParts: string[] = [];
        const loc = profile.location as Record<string, any>;
        if (loc.postcode) locParts.push(`postcode ${loc.postcode}`);
        if (loc.travelRadius) {
          const radiusLabels: Record<string, string> = {
            nearby: 'within 2 km',
            city: 'whole city of Almere',
            city_plus: 'city and surroundings',
          };
          locParts.push(`travels ${radiusLabels[loc.travelRadius as string] || loc.travelRadius}`);
        }
        if (locParts.length > 0) {
          compositeTextParts.push(`Location: ${locParts.join(', ')}`);
        }
      }
      
      if (profile.pricing_style) {
        if (profile.pricing_style === 'hourly' && profile.hourly_rate) {
          compositeTextParts.push(`Pricing: €${profile.hourly_rate} per hour`);
        } else if (profile.pricing_style === 'per_task') {
          compositeTextParts.push('Pricing: per task');
        }
      }
      
      const compositeText = compositeTextParts.join('. ');
      
      // Regenerate embedding from composite text
      const { embedding } = await embed({
        model: embeddingModel,
        value: compositeText,
      });

      // Update with proper array format
      const { error: updateError } = await supabaseAdmin
        .from('freelancer_profiles')
        .update({ embedding: Array.isArray(embedding) ? embedding : embedding })
        .eq('id', profile.id);

      if (updateError) {
        results.push({
          profileId: profile.id,
          success: false,
          error: updateError.message,
        });
      } else {
        results.push({ profileId: profile.id, success: true });
      }
    } catch (err) {
      results.push({
        profileId: profile.id,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return results;
}


