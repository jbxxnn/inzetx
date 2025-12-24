import { streamText } from 'ai';
import { textModel } from '@/lib/ai';
import {
  getSystemPromptForPhase,
  detectPhase,
  // type JobData,
} from '@/lib/chat/job-conversation';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export const maxDuration = 30; // Allow up to 30 seconds for AI responses

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

    // useChat sends messages in a specific format
    const { messages, jobData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 });
    }

    // Convert messages format to AI SDK format
    interface Message {
      role: 'user' | 'assistant';
      content: string;
    }
    
    const aiMessages: Message[] = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Simple job data extraction (will be improved in later phases)
    // const existingJobData: JobData = {};
    const phase = detectPhase(jobData ?? {});
    
    // Detect phase
    // const phase = detectPhase(existingJobData);
    const systemPrompt = getSystemPromptForPhase(phase);

    // Create a streaming response
    const result = await streamText({
      model: textModel,
      system: systemPrompt,
      messages: aiMessages,
    });

    // Return streaming response as text stream
    // The client will parse this as plain text chunks
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

