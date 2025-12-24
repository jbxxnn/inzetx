import { generateObject } from 'ai';
import { textModel } from '@/lib/ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

const SkillsSchema = z.object({
  skills: z.array(z.string()).min(6).max(12),
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

    const { input, existingSkills } = await req.json();

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return new Response('Input string is required', { status: 400 });
    }

    const systemPrompt = `You are a helpful assistant that generates relevant skill suggestions for freelancers.
Generate 6-12 specific, relevant skills based on the user's input keyword or skill.
Skills should be:
- Directly related to the input keyword
- Specific and actionable (e.g., "Kitchen Tiling" not just "Tiling")
- Common skills that freelancers in this field would have
- Varied but related (different aspects of the same field)
- Maximum 2-3 words each
- Written in clear, simple language

Avoid generic skills. Focus on specific, real-world skills that are relevant to the input.`;

    const existingContext = existingSkills && Array.isArray(existingSkills) && existingSkills.length > 0
      ? `\n\nUser already has these skills: ${existingSkills.join(', ')}. Generate different but related skills.`
      : '';

    const prompt = `A freelancer has entered this skill/keyword: "${input}"${existingContext}

Generate 6-12 specific, relevant skills that are related to this input. Make them concrete and varied, but all related to the same field or area of expertise.`;

    const { object } = await generateObject({
      model: textModel,
      system: systemPrompt,
      prompt,
      schema: SkillsSchema,
    });

    // Post-process to ensure all skills are 2-3 words max
    const processedSkills = object.skills.map((skill: string) => {
      const words = skill.trim().split(/\s+/);
      if (words.length > 3) {
        return words.slice(0, 3).join(' ');
      }
      return skill.trim();
    });

    return Response.json({ skills: processedSkills });
  } catch (error) {
    console.error('Skills generation API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

