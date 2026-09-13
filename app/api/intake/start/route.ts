import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { generateQuestions } from '@/lib/server/claude/intake';
import { MOCK_MODEL } from '@/lib/server/anthropic';
import { findService } from '@/lib/server/services';

/// Opens an intake session and returns the first AI-generated question set.
export const POST = withErrors(async (req: Request) =>
  requirePatient(async (patient) => {
    const body = await readJson(req);
    const specialty = str(body.specialty, 120);
    const concern = str(body.concern, 4000);

    if (!specialty || !findService(specialty)) return fail('Choose a service from the list.');
    if (concern.length < 10) return fail('Tell us a little more about what you would like help with.');

    const { intro, questions, model, degraded } = await generateQuestions({ specialty, concern });

    const session = await prisma.intakeSession.create({
      data: { patientId: patient.id, specialty, concern, questions, answers: {} },
    });

    return json(
      {
        intakeId: session.id,
        intro,
        questions,
        round: 0,
        // So the UI can say "standard questions" rather than pass off the
        // fallback as AI-tailored.
        aiGenerated: model !== MOCK_MODEL,
        degraded: degraded ?? null,
      },
      201
    );
  })
);
