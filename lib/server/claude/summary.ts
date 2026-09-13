import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { getClient, isLive, BASE_PARAMS, EFFORT, MODEL, MOCK_MODEL, describeError } from '../anthropic';
import type { Question, Answers } from './intake';

// Turns a completed intake into the briefing the clinician reads before the
// call. Clinician-facing only - never shown to the patient.

const SummarySchema = z.object({
  presentingComplaint: z.string().describe('2-3 sentences: why this patient is here, in clinical register'),
  historySummary: z.string().describe('A short paragraph covering duration, prior assessment, medication and family history'),
  suggestedFocus: z.array(z.string()).describe('3-6 concise areas worth probing during the consultation'),
  riskFlags: z.array(z.string()).describe('Safety or urgency signals; empty array if none'),
  riskLevel: z.enum(['routine', 'elevated', 'urgent']),
});

export type DigestEntry = { question: string; answer: string; category: string };

export type Summary = {
  presentingComplaint: string;
  historySummary: string;
  suggestedFocus: string[];
  riskFlags: string[];
  riskLevel: 'routine' | 'elevated' | 'urgent';
  answerDigest: DigestEntry[];
  model: string;
  degraded?: string;
};

const SYSTEM = `You are writing a pre-consultation briefing for a licensed clinician at Eldava Health. The clinician reads it in the minutes before meeting the patient.

Write for a clinician, not a patient. Be concise and specific.

Hard rules:
- Do NOT diagnose. Do not name a likely condition, offer a differential, or rank possibilities.
- Do NOT recommend medication, treatment or management.
- Report only what the patient actually said. Never infer facts they did not state, and never fill gaps with plausible detail.
- Where the patient's answers are vague or contradictory, say so plainly rather than smoothing it over.
- "suggestedFocus" means areas to ASK ABOUT, phrased as lines of enquiry, never as conclusions.

Risk level:
- "urgent" only for a disclosure of current thoughts of self-harm or harm to others.
- "elevated" for significant distress, marked functional impairment, or a concerning history.
- "routine" otherwise.`;

function buildDigest(questions: Question[], answers: Answers): DigestEntry[] {
  const out: DigestEntry[] = [];
  for (const q of questions) {
    const raw = answers[q.id];
    if (raw == null || raw === '') continue;
    out.push({ question: q.prompt, answer: Array.isArray(raw) ? raw.join(', ') : String(raw), category: q.category });
  }
  return out;
}

export function computeAge(dob: Date | string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export async function generateSummary(args: {
  specialty: string;
  concern: string;
  questions: Question[];
  answers: Answers;
  dateOfBirth?: Date | null;
  redFlag: boolean;
  redFlagReason: string | null;
}): Promise<Summary> {
  const answerDigest = buildDigest(args.questions, args.answers);
  const fallback = () => mockSummary(args.specialty, args.concern, answerDigest, args.redFlag, args.redFlagReason);

  if (!isLive()) return fallback();

  const age = args.dateOfBirth ? computeAge(args.dateOfBirth) : null;
  const content = [
    `Service booked: ${args.specialty}`,
    age != null ? `Patient age: ${age}` : null,
    `\nPatient's own description of the concern:\n"""\n${args.concern}\n"""`,
    `\nStructured intake answers:\n${answerDigest.map((d) => `[${d.category}] ${d.question}\n  -> ${d.answer}`).join('\n\n')}`,
    args.redFlag ? `\nAUTOMATED SAFETY FLAG RAISED: ${args.redFlagReason}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await getClient().messages.parse({
      ...BASE_PARAMS,
      system: SYSTEM,
      messages: [{ role: 'user', content }],
      output_config: { effort: EFFORT, format: zodOutputFormat(SummarySchema) },
    });

    if (response.stop_reason === 'refusal' || !response.parsed_output) return fallback();

    const parsed = response.parsed_output;
    // The deterministic safety net outranks the model: a flagged intake can
    // never be filed as routine.
    let riskLevel = parsed.riskLevel;
    let riskFlags = parsed.riskFlags ?? [];
    if (args.redFlag) {
      if (riskLevel === 'routine') riskLevel = 'urgent';
      if (!riskFlags.some((f) => /self-harm|harm|safety|suicid/i.test(f))) {
        riskFlags = [args.redFlagReason || 'Automated safety flag raised during intake.', ...riskFlags];
      }
    }

    return {
      presentingComplaint: parsed.presentingComplaint,
      historySummary: parsed.historySummary,
      suggestedFocus: parsed.suggestedFocus ?? [],
      riskFlags,
      riskLevel,
      answerDigest,
      model: MODEL,
    };
  } catch (error) {
    console.error('[summary] generation failed:', error);
    return { ...fallback(), degraded: describeError(error) };
  }
}

/// Built entirely from verbatim answers - no interpretation. The clinician
/// still gets every answer, clearly marked as not AI-summarised.
function mockSummary(
  specialty: string,
  concern: string,
  answerDigest: DigestEntry[],
  redFlag: boolean,
  redFlagReason: string | null
): Summary {
  const history = answerDigest.filter((d) => d.category === 'history').map((d) => `${d.question} ${d.answer}`);
  return {
    presentingComplaint: `Patient booked ${specialty}. In their own words: "${(concern || '').trim() || 'No description provided.'}"`,
    historySummary: history.length ? `Reported history: ${history.join(' ')}` : 'No structured history was captured during intake.',
    suggestedFocus: [
      'Review the verbatim intake answers below in full.',
      'Clarify the timeline and onset directly with the patient.',
      'Confirm current medication and any previous assessment.',
    ],
    riskFlags: redFlag ? [redFlagReason || 'Safety flag raised during intake.'] : [],
    riskLevel: redFlag ? 'urgent' : 'routine',
    answerDigest,
    model: MOCK_MODEL,
  };
}
