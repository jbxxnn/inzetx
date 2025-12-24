import { generateText } from 'ai';
import { textModel } from '@/lib/ai';
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

    const { skills, answers } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return new Response('Skills array is required', { status: 400 });
    }

    if (!answers || typeof answers !== 'object') {
      return new Response('Answers object is required', { status: 400 });
    }

    const systemPrompt = `You are an expert marketplace profile writer. Create compelling, concise freelancer descriptions that:
- Highlight key skills and experience
- Are specific and concrete (mention tools, types of work, experience level)
- Are 2-4 sentences long
- Sound professional yet approachable
- Help clients understand what the freelancer can do
- Avoid generic fluff and clichés

Write in first person or third person, whichever sounds more natural.`;

    // Format answers into a readable string
    const answersText = Object.entries(answers)
      .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
      .join('\n\n');

    const prompt = `Create a professional freelancer profile description based on:

Skills: ${skills.join(', ')}

Answers to questions:
${answersText}

Generate a compelling 2-4 sentence description that highlights their expertise and helps clients understand what they can do.`;

    const { text } = await generateText({
      model: textModel,
      system: systemPrompt,
      prompt,
    });

    return Response.json({ description: text.trim() });
  } catch (error) {
    console.error('Description generation API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

