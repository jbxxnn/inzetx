import { generateObject } from 'ai';
import { textModel } from '@/lib/ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

const QuestionsSchema = z.object({
  questions: z.array(z.string()).min(2).max(4),
});

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

    const { skills } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return new Response('Skills array is required', { status: 400 });
    }

    const systemPrompt = `You are a helpful assistant that generates targeted questions to help freelancers create better profile descriptions.
Generate 2-4 specific, concise questions based on the selected skills. Questions should help understand:
- What types of jobs/projects they prefer
- Their experience level or notable projects
- Their work style or specialties
- Any unique strengths or approaches

Keep questions conversational and easy to answer.`;

    const prompt = `A freelancer has selected these skills: ${skills.join(', ')}.

Generate 2-4 targeted questions that will help create a compelling profile description. Focus on understanding their experience, preferences, and specialties related to these skills.`;

    const { object } = await generateObject({
      model: textModel,
      system: systemPrompt,
      prompt,
      schema: QuestionsSchema,
    });

    return Response.json({ questions: object.questions });
  } catch (error) {
    console.error('Description questions API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

