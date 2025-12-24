import { z } from 'zod';
import { generateText, generateObject } from 'ai';
import {
  textModel,
  FREELANCER_ANALYSIS_SYSTEM_PROMPT,
  MATCH_EXPLANATION_SYSTEM_PROMPT,
} from './ai';

/**
 * Generates a short, compelling headline for a freelancer profile.
 * 
 * @param description - The freelancer's profile description
 * @returns A headline (max 10 words)
 */
export async function generateFreelancerHeadline(
  description: string
): Promise<string> {
  const { text } = await generateText({
    model: textModel,
    system: FREELANCER_ANALYSIS_SYSTEM_PROMPT,
    prompt: `Generate a short, punchy headline (max 10 words) for this freelancer profile:\n\n${description}`,
  });

  return text.trim();
}

/**
 * Zod schema for skill tags extraction.
 */
const SkillsSchema = z.object({
  skills: z.array(z.string()).min(1).max(5),
});

/**
 * Extracts 1–5 skill tags from a freelancer profile description.
 * 
 * @param description - The freelancer's profile description
 * @returns An array of skill tags (1–5 items)
 */
export async function generateSkillTags(
  description: string
): Promise<string[]> {
  const { object } = await generateObject({
    model: textModel,
    system: FREELANCER_ANALYSIS_SYSTEM_PROMPT,
    prompt: `Extract 1–5 concise skill tags (as an array of short strings) for this freelancer profile:\n\n${description}`,
    schema: SkillsSchema,
  });

  return object.skills.map((s: string) => s.trim());
}

/**
 * Generates an explanation of why a freelancer is a good match for a job.
 * 
 * @param jobDescription - The client's job description
 * @param freelancerDescription - The freelancer's profile description
 * @param skills - Array of freelancer's skill tags
 * @returns A 1–2 sentence explanation
 */
export async function generateMatchExplanation(
  jobDescription: string,
  freelancerDescription: string,
  skills: string[]
): Promise<string> {
  const { text } = await generateText({
    model: textModel,
    system: MATCH_EXPLANATION_SYSTEM_PROMPT,
    prompt: `Job description:\n${jobDescription}\n\nFreelancer description:\n${freelancerDescription}\n\nFreelancer skills: ${skills.join(
      ', '
    )}\n\nExplain ONLY in 15 words why this freelancer is a good match.`,
  });

  return text.trim();
}

