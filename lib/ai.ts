import { openai } from '@ai-sdk/openai';

/**
 * AI Provider: OpenAI via Vercel AI SDK
 */
export const aiProvider = openai;

/**
 * Embedding model for converting text to vector embeddings.
 * Uses OpenAI's text-embedding-3-small model (1536 dimensions).
 */
export const embeddingModel = aiProvider.textEmbeddingModel(
  'text-embedding-3-small'
);

/**
 * Text generation model for AI-powered content generation.
 * Uses OpenAI's gpt-4o-mini for cost-effective text generation.
 */
export const textModel = aiProvider('gpt-4o-mini');

/**
 * System prompt for analyzing freelancer profiles.
 * Guides the AI to extract skills, generate headlines, and suggest tags.
 */
export const FREELANCER_ANALYSIS_SYSTEM_PROMPT = `You are an expert marketplace assistant that analyzes freelancer profiles.
Your role is to:
1. Extract key skills and expertise
2. Generate concise, compelling headlines (max 10 words)
3. Suggest relevant skill tags (1–5 tags)
Be precise and remove redundancy.`;

/**
 * System prompt for explaining why a freelancer matches a job.
 * Guides the AI to provide clear, concise match explanations.
 */
export const MATCH_EXPLANATION_SYSTEM_PROMPT = `You explain why a freelancer is a good match for a job in 1–2 sentences, focusing on relevant skills and experience.`;

