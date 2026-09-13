import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { generateQuestions, detectRedFlag, MAX_ROUNDS, type Question, type Answers } from '@/lib/server/claude/intake';

/// Records answers for the current round. Returns the next round of follow-up
/// questions if the model has any, or reports the intake ready to complete.
export const POST = withErrors(async (req: Request) =>
  requirePatient(async (patient) => {
    const body = await readJson(req);
    const intakeId = str(body.intakeId, 40);
    const submitted = body.answers;
    if (!intakeId || typeof submitted !== 'object' || submitted === null) return fail('Missing intake answers.');

    const session = await prisma.intakeSession.findUnique({ where: { id: intakeId } });
    if (!session || session.patientId !== patient.id) return fail('Intake session not found.', 404);
    if (session.status !== 'IN_PROGRESS') return fail('This intake has already been completed.', 409);

    const questions = (Array.isArray(session.questions) ? session.questions : []) as Question[];
    const answers: Answers = { ...((session.answers as Answers) || {}) };

    // Only accept answers to questions we actually asked.
    const known = new Set(questions.map((q) => q.id));
    for (const [key, value] of Object.entries(submitted as Record<string, unknown>)) {
      if (!known.has(key)) continue;
      answers[key] = Array.isArray(value)
        ? value.map((v) => str(v, 200)).filter(Boolean)
        : str(String(value), 4000);
    }

    const missing = questions.filter((q) => {
      const a = answers[q.id];
      return q.required && (a == null || a === '' || (Array.isArray(a) && !a.length));
    });
    if (missing.length) {
      return fail('Please answer every required question.', 400, { missing: missing.map((q) => q.id) });
    }

    const flag = detectRedFlag({ concern: session.concern, answers, questions });
    const round = session.rounds + 1;

    // A safety disclosure stops the questionnaire; the UI shows crisis
    // signposting instead of continuing to interrogate.
    let followUp: Awaited<ReturnType<typeof generateQuestions>> | null = null;
    if (!flag.redFlag && round < MAX_ROUNDS) {
      const priorAnswers = questions
        .map((q) => ({ prompt: q.prompt, answer: Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).join(', ') : String(answers[q.id] ?? '') }))
        .filter((a) => a.answer);
      const generated = await generateQuestions({ specialty: session.specialty, concern: session.concern, priorAnswers });
      if (generated.questions.length) followUp = generated;
    }

    await prisma.intakeSession.update({
      where: { id: session.id },
      data: {
        answers,
        questions: followUp ? [...questions, ...followUp.questions] : questions,
        rounds: round,
        redFlag: flag.redFlag || session.redFlag,
        redFlagReason: flag.reason || session.redFlagReason,
      },
    });

    return json({
      intakeId: session.id,
      redFlag: flag.redFlag || session.redFlag,
      round,
      done: !followUp,
      questions: followUp ? followUp.questions : [],
      intro: followUp ? followUp.intro : null,
    });
  })
);
