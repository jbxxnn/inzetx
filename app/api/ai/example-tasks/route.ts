import { generateObject } from 'ai';
import { textModel } from '@/lib/ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

const TasksSchema = z.object({
  tasks: z.array(z.string()).min(3).max(3),
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

    const { skills, description } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return new Response('Skills array is required', { status: 400 });
    }

    const systemPrompt = `You are a helpful assistant that generates specific, actionable example tasks for freelancers.
Generate exactly 3 concrete, specific tasks that a freelancer with these skills could help with.
CRITICAL: Each task must be MAXIMUM 5 WORDS. Keep them short and concise.
Tasks should be:
- Specific and actionable (e.g., "Mount TV on wall" not "TV installation")
- Relevant to the skills provided
- Common tasks that clients might need help with
- Varied in complexity and type
- Written in clear, simple language
- Maximum 5 words each (count words carefully)

Avoid generic tasks. Focus on specific, real-world tasks that clients would actually request.`;

    const descriptionContext = description && description.trim().length > 0
      ? `\n\nFreelancer description: ${description}`
      : '';

    const prompt = `A freelancer has these skills: ${skills.join(', ')}${descriptionContext}

Generate exactly 3 specific, actionable example tasks that this freelancer could help clients with. Make them concrete and varied.
IMPORTANT: Each task must be exactly 5 words or fewer.`;

    const { object } = await generateObject({
      model: textModel,
      system: systemPrompt,
      prompt,
      schema: TasksSchema,
    });

    // Post-process to ensure all tasks are 5 words or less and limit to 3
    const processedTasks = object.tasks
      .slice(0, 3) // Ensure we only return 3 tasks
      .map((task: string) => {
        const words = task.trim().split(/\s+/);
        if (words.length > 5) {
          return words.slice(0, 5).join(' ');
        }
        return task.trim();
      });

    return Response.json({ tasks: processedTasks });
  } catch (error) {
    console.error('Example tasks API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

