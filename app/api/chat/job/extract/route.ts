import { generateObject } from 'ai';
import { textModel } from '@/lib/ai';
import { JobDataSchema, type JobData } from '@/lib/chat/job-conversation';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { conversation, currentJobData } = await req.json();

    if (!conversation || typeof conversation !== 'string') {
      return new Response('Conversation text is required', { status: 400 });
    }

    // Extract job data from conversation using structured output
    const { object } = await generateObject({
      model: textModel,
      system: `Extract job-related information from this conversation. Return structured data including:
- description: Main task description
- details: Additional details about the task
- location: City (always "Almere"), postcode, address if mentioned
- timeWindow: Date, time preference, notes
- budget: Budget mentioned by user
- estimatedDuration: Estimated duration if mentioned

Only extract information that is explicitly mentioned. Don't make assumptions.
For fields that are not mentioned, use null (not empty strings).`,
      prompt: `Extract job data from this conversation:\n\n${conversation}`,
      schema: JobDataSchema,
    });

    // Helper function to remove null values and convert to undefined
    const cleanNulls = <T>(obj: T): T => {
      if (obj === null || obj === undefined) return obj as T;
      if (typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj as T;
      
      const cleaned = {} as T;
      for (const [key, value] of Object.entries(obj)) {
        if (value === null) {
          // Skip null values (treat as undefined)
          continue;
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedNested = cleanNulls(value);
          if (Object.keys(cleanedNested as object).length > 0) {
            (cleaned as Record<string, unknown>)[key] = cleanedNested;
          }
        } else {
          (cleaned as Record<string, unknown>)[key] = value;
        }
      }
      return cleaned;
    };

    // Clean null values from extracted object
    const cleanedObject = cleanNulls(object);

    // Merge with existing job data
    const mergedJobData: JobData = {
      ...(currentJobData || {}),
      ...cleanedObject,
      // Merge nested objects, only including non-null values
      location: {
        ...(currentJobData?.location || {}),
        ...(cleanedObject.location || {}),
      },
      timeWindow: {
        ...(currentJobData?.timeWindow || {}),
        ...(cleanedObject.timeWindow || {}),
      },
    };

    return Response.json({ jobData: mergedJobData });
  } catch (error) {
    console.error('Job extraction error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to extract job data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

