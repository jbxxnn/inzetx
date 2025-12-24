import { z } from 'zod';

/**
 * Job data structure extracted from conversation
 */
export interface JobData {
  description?: string;
  details?: string;
  location?: {
    city?: string;
    postcode?: string;
    address?: string;
  };
  timeWindow?: {
    date?: string;
    time?: string;
    notes?: string;
  };
  budget?: string;
  estimatedDuration?: string;
}

/**
 * Conversation phase tracking
 */
export type ConversationPhase = 'understanding' | 'logistics' | 'confirmation' | 'complete';

/**
 * Conversation state
 */
export interface ConversationState {
  phase: ConversationPhase;
  jobData: JobData;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * Zod schema for structured job data extraction
 * Uses .nullish() to allow both null and undefined values
 */
export const JobDataSchema = z.object({
  description: z.string().nullish(),
  details: z.string().nullish(),
  location: z.object({
    city: z.string().nullish(),
    postcode: z.string().nullish(),
    address: z.string().nullish(),
  }).nullish(),
  timeWindow: z.object({
    date: z.string().nullish(),
    time: z.string().nullish(),
    notes: z.string().nullish(),
  }).nullish(),
  budget: z.string().nullish(),
  estimatedDuration: z.string().nullish(),
});

/**
 * System prompt for understanding phase
 */
export const UNDERSTANDING_PHASE_PROMPT = `You are a helpful assistant helping clients describe their job needs in Almere, Netherlands.

Your role in the "understanding" phase:
1. Ask friendly, conversational questions to understand what exactly needs to be done
2. Ask about any specific details or requirements
3. Ask about estimated duration (e.g., "1 hour", "2-3 hours")
4. Ask about tools or skills needed

Keep questions short and natural. Don't ask everything at once. Be conversational and human-like.
Once you have a clear understanding of the task, you can move to logistics (location, date, time, budget).`;

/**
 * System prompt for logistics phase
 */
export const LOGISTICS_PHASE_PROMPT = `You are a helpful assistant helping clients provide logistics for their job in Almere, Netherlands.

Your role in the "logistics" phase:
1. Ask about location in Almere (city is always "Almere", ask for postcode/area)
2. Ask about preferred date (today, tomorrow, or specific date)
3. Ask about time window (morning 8-12, afternoon 12-17, evening 17-21, or specific time)
4. Ask about budget (optional, can be a range like "around €30-€50")

If the user gives partial info (e.g., "this weekend"), clarify it (e.g., "Would Saturday afternoon work, or Sunday is better?").
Once you have location, date/time, and optionally budget, move to confirmation.`;

/**
 * System prompt for confirmation phase
 */
export const CONFIRMATION_PHASE_PROMPT = `
You are finalizing a job request.

Your task:
1. Summarize all collected job details clearly
2. Ask the user to confirm if everything is correct

IMPORTANT RULES:
- Do NOT suggest searching online
- Do NOT recommend external platforms
- Do NOT ask new questions
- Do NOT continue the conversation beyond confirmation

End your message by asking: "Is this correct?"
`;


/**
 * Detects the current conversation phase based on job data
 */
export function detectPhase(jobData: JobData): ConversationPhase {
  // If we have description and details, move to logistics
  if (jobData.description || jobData.details) {
    // If we have location and time window, move to confirmation
    if (jobData.location?.city && jobData.timeWindow?.date) {
      return 'confirmation';
    }
    return 'logistics';
  }
  return 'understanding';
}

/**
 * Gets the appropriate system prompt for the current phase
 */
export function getSystemPromptForPhase(phase: ConversationPhase): string {
  switch (phase) {
    case 'understanding':
      return UNDERSTANDING_PHASE_PROMPT;
    case 'logistics':
      return LOGISTICS_PHASE_PROMPT;
    case 'confirmation':
      return CONFIRMATION_PHASE_PROMPT;
    default:
      return UNDERSTANDING_PHASE_PROMPT;
  }
}

/**
 * Builds conversation context from messages
 */
export function buildConversationContext(messages: Array<{ role: 'user' | 'assistant'; content: string }>): string {
  return messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');
}

