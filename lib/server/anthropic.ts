import Anthropic from '@anthropic-ai/sdk';

// The app runs with or without an Anthropic key. With a key, real calls;
// without, each caller falls back to a deterministic stub so the whole patient
// journey stays exercisable. `isLive()` is what callers branch on, and every
// AI-derived record stores which model produced it, so mock output is never
// mistaken for clinical output.

export const MODEL = 'claude-opus-5';
export const MOCK_MODEL = 'mock-no-api-key';

let cached: Anthropic | null = null;

export function isLive(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getClient(): Anthropic {
  if (!cached) cached = new Anthropic();
  return cached;
}

/// Shared request defaults. Adaptive thinking is on because triage question
/// design and clinical summarisation both benefit from it.
export const BASE_PARAMS = {
  model: MODEL,
  max_tokens: 16000,
  thinking: { type: 'adaptive' as const },
};

export const EFFORT = 'high' as const;

/// Normalises SDK errors into something an API route can safely return.
export function describeError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return 'AI service credentials are invalid.';
  if (error instanceof Anthropic.RateLimitError) return 'AI service is rate limited, please retry shortly.';
  if (error instanceof Anthropic.BadRequestError) return `AI request rejected: ${error.message}`;
  if (error instanceof Anthropic.APIError) return `AI service error (${error.status}).`;
  return 'AI service is unavailable.';
}
