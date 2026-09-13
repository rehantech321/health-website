import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { getClient, isLive, BASE_PARAMS, EFFORT, MODEL, MOCK_MODEL, describeError } from '../anthropic';

// Claude generates the structured triage question set the patient answers
// before booking. It asks questions; it never diagnoses, never suggests
// treatment, never tells the patient what it thinks is wrong. That is the
// clinician's job, at the consultation.

const QuestionSchema = z.object({
  id: z.string().describe('Short stable snake_case identifier for this question'),
  prompt: z.string().describe('The question as the patient will read it'),
  helpText: z.string().describe('One short clarifying line, or an empty string'),
  type: z.enum(['single_select', 'multi_select', 'scale', 'text']),
  options: z.array(z.string()).describe('Choices for select types; empty array for scale/text'),
  required: z.boolean(),
  category: z.enum(['presenting', 'history', 'impact', 'safety', 'context']),
});

const QuestionSetSchema = z.object({
  intro: z.string().describe('Two sentences telling the patient what these questions are for'),
  questions: z.array(QuestionSchema),
});

export type Question = z.infer<typeof QuestionSchema>;
export type QuestionSet = { intro: string; questions: Question[]; model: string; degraded?: string };
export type Answers = Record<string, string | string[]>;

export const MAX_ROUNDS = 2;

const SYSTEM = `You are the intake assistant for Eldava Health, a global online clinic offering specialist assessments across mental health, neurodevelopmental, women's health, dementia and memory, men's health, children's and SEND, physical and general health specialties.

Your only job is to gather structured information from a patient BEFORE they meet a licensed clinician, so the clinician arrives informed. You are not a diagnostic tool.

Hard rules:
- Never state, imply, rank or hint at a possible diagnosis.
- Never recommend, adjust or comment on medication or treatment.
- Never tell the patient what their answers might mean.
- Only produce questions. The clinician interprets them.

Question design:
- 6 to 9 questions, ordered: presenting concern, then history, then impact on daily life, then safety, then context.
- Tailor them specifically to the stated service and the patient's own description. Generic questions that ignore what they wrote are a failure.
- Exactly one safety question, phrased with care, covering thoughts of self-harm or of harming others. Make it single_select.
- Prefer single_select and scale over free text; use at most two text questions.
- For scale questions, leave options empty; the UI renders 0-10.
- Plain UK English, second person, no clinical jargon, no leading phrasing.
- Every question must be answerable by a patient with no medical training.`;

type PriorAnswer = { prompt: string; answer: string };

function userPrompt(specialty: string, concern: string, prior: PriorAnswer[]): string {
  let text = `Service the patient selected: ${specialty}\n\nWhat the patient wrote about their concern:\n"""\n${concern}\n"""`;
  if (prior.length) {
    text +=
      `\n\nThey have already answered the questions below. Generate 3 to 5 FOLLOW-UP questions only: ` +
      `probe what is ambiguous, incomplete, or clinically important to pin down before the consultation. ` +
      `Do not repeat anything already covered.\n\n` +
      prior.map((a) => `Q: ${a.prompt}\nA: ${a.answer}`).join('\n\n');
  }
  return text;
}

/// Generates the initial question set, or a follow-up round when priorAnswers
/// is supplied.
export async function generateQuestions(args: {
  specialty: string;
  concern: string;
  priorAnswers?: PriorAnswer[];
}): Promise<QuestionSet> {
  const prior = args.priorAnswers ?? [];
  if (!isLive()) return mockQuestions(args.specialty, prior);

  try {
    const response = await getClient().messages.parse({
      ...BASE_PARAMS,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt(args.specialty, args.concern, prior) }],
      output_config: { effort: EFFORT, format: zodOutputFormat(QuestionSetSchema) },
    });

    if (response.stop_reason === 'refusal') {
      // Almost always the free-text concern tripping a safety classifier. Fall
      // back to the standard set rather than blocking the patient being seen.
      return { ...mockQuestions(args.specialty, prior), degraded: 'refusal' };
    }

    const parsed = response.parsed_output;
    if (!parsed?.questions?.length) {
      return { ...mockQuestions(args.specialty, prior), degraded: 'unparsed' };
    }

    return { intro: parsed.intro, questions: parsed.questions.map(normalise), model: MODEL };
  } catch (error) {
    console.error('[intake] question generation failed:', error);
    return { ...mockQuestions(args.specialty, prior), degraded: describeError(error) };
  }
}

function normalise(q: Question): Question {
  return {
    id: q.id,
    prompt: q.prompt,
    helpText: q.helpText || '',
    type: q.type,
    options: q.type === 'scale' || q.type === 'text' ? [] : q.options || [],
    required: q.required !== false,
    category: q.category,
  };
}

// ------------------------------------------------------------------ fallback

/// Deterministic set used with no API key, on refusal, or when the API is
/// down. Clinically conservative and generic by design; always includes the
/// safety item.
function mockQuestions(specialty: string, prior: PriorAnswer[]): QuestionSet {
  if (prior.length) {
    return {
      intro: 'A few follow-up questions based on what you told us.',
      model: MOCK_MODEL,
      questions: [
        { id: 'followup_change', prompt: 'Has any of this changed noticeably in the last month?', helpText: '', type: 'single_select', options: ['Got worse', 'About the same', 'Got better', 'It varies a lot'], required: true, category: 'history' },
        { id: 'followup_priority', prompt: 'What would you most like to get out of this appointment?', helpText: 'In your own words.', type: 'text', options: [], required: true, category: 'context' },
      ],
    };
  }

  return {
    intro: `A few questions about ${specialty || 'your concern'} so your clinician can prepare before you meet.`,
    model: MOCK_MODEL,
    questions: [
      { id: 'main_concern', prompt: 'In your own words, what is the main thing you would like help with?', helpText: 'A sentence or two is plenty.', type: 'text', options: [], required: true, category: 'presenting' },
      { id: 'duration', prompt: 'How long has this been going on?', helpText: '', type: 'single_select', options: ['Less than a month', '1 to 6 months', '6 to 12 months', '1 to 5 years', 'More than 5 years', 'As long as I can remember'], required: true, category: 'history' },
      { id: 'prior_assessment', prompt: 'Have you been assessed or treated for this before?', helpText: '', type: 'single_select', options: ['No, never', 'Yes, assessed but not diagnosed', 'Yes, and I received a diagnosis', 'I am not sure'], required: true, category: 'history' },
      { id: 'current_medication', prompt: 'Are you currently taking any medication?', helpText: 'Including anything prescribed for another condition.', type: 'single_select', options: ['No', 'Yes, for this concern', 'Yes, for something else', 'Yes, for both'], required: true, category: 'history' },
      { id: 'daily_impact', prompt: 'How much is this affecting your day-to-day life right now?', helpText: '0 means not at all, 10 means severely.', type: 'scale', options: [], required: true, category: 'impact' },
      { id: 'affected_areas', prompt: 'Which parts of your life does this affect most?', helpText: 'Choose all that apply.', type: 'multi_select', options: ['Work or study', 'Relationships', 'Sleep', 'Physical health', 'Mood', 'Finances', 'Daily tasks'], required: false, category: 'impact' },
      { id: 'family_history', prompt: 'Does anyone in your family have a related diagnosis?', helpText: '', type: 'single_select', options: ['No', 'Yes', 'I do not know'], required: true, category: 'context' },
      { id: 'safety_check', prompt: 'In the last two weeks, have you had thoughts of harming yourself or someone else?', helpText: 'This helps us make sure you get the right kind of support. Answer honestly.', type: 'single_select', options: ['No', 'Yes, fleeting thoughts', 'Yes, and they have been persistent', 'I would rather not say'], required: true, category: 'safety' },
    ],
  };
}

// -------------------------------------------------------------- safety net

/// Deterministic backstop over the patient's own words, run regardless of
/// what the model concluded. A model miss must never silently drop a crisis
/// disclosure, so this only ever escalates - it can raise a flag, never clear one.
const CRISIS_PATTERNS = [
  /\bkill (?:myself|my self)\b/i,
  /\bend (?:my|it all|my own) life\b/i,
  /\btake my own life\b/i,
  /\bsuicid/i,
  /\bself[- ]?harm/i,
  /\bharm (?:myself|others|someone)\b/i,
  /\bhurt (?:myself|someone else)\b/i,
  /\bdon'?t want to (?:be here|live|go on)\b/i,
  /\bbetter off dead\b/i,
  /\bcut(?:ting)? myself\b/i,
];

export function detectRedFlag(args: { concern: string; answers: Answers; questions: Question[] }) {
  const haystacks = [args.concern || ''];

  for (const q of args.questions) {
    const answer = args.answers[q.id];
    if (answer == null) continue;
    const text = Array.isArray(answer) ? answer.join(' ') : String(answer);

    // An affirmative on the safety question is a flag regardless of wording.
    if (q.category === 'safety' && /^yes/i.test(text.trim())) {
      return { redFlag: true, reason: `Safety question answered: "${text}"` };
    }
    haystacks.push(text);
  }

  for (const text of haystacks) {
    for (const pattern of CRISIS_PATTERNS) {
      if (pattern.test(text)) {
        return { redFlag: true, reason: 'Patient free text referenced self-harm or harm to others.' };
      }
    }
  }
  return { redFlag: false, reason: null as string | null };
}
