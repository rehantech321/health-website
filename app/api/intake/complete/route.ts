import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { generateSummary } from '@/lib/server/claude/summary';
import type { Question, Answers } from '@/lib/server/claude/intake';
import { findService, formatMinor, type Service } from '@/lib/server/services';

function recommendation(service: Service | null) {
  if (!service) return null;
  return {
    name: service.name,
    desc: service.desc,
    priceMinor: service.priceMinor,
    priceLabel: formatMinor(service.priceMinor),
    durationLabel: service.durationLabel,
  };
}

/// Closes the intake and writes the clinician's briefing - here, not when the
/// clinician opens the portal, so opening a case is a read, not a model call.
export const POST = withErrors(async (req: Request) =>
  requirePatient(async (patient) => {
    const body = await readJson(req);
    const intakeId = str(body.intakeId, 40);

    const session = await prisma.intakeSession.findUnique({ where: { id: intakeId }, include: { summary: true } });
    if (!session || session.patientId !== patient.id) return fail('Intake session not found.', 404);

    const service = findService(session.specialty);

    if (session.status === 'COMPLETE' && session.summary) {
      return json({ intakeId: session.id, redFlag: session.redFlag, recommendation: recommendation(service) });
    }

    const questions = (Array.isArray(session.questions) ? session.questions : []) as Question[];
    const summary = await generateSummary({
      specialty: session.specialty,
      concern: session.concern,
      questions,
      answers: (session.answers as Answers) || {},
      dateOfBirth: patient.dateOfBirth,
      redFlag: session.redFlag,
      redFlagReason: session.redFlagReason,
    });

    const fields = {
      presentingComplaint: summary.presentingComplaint,
      historySummary: summary.historySummary,
      suggestedFocus: summary.suggestedFocus,
      riskFlags: summary.riskFlags,
      riskLevel: summary.riskLevel,
      answerDigest: summary.answerDigest,
      model: summary.model,
    };

    await prisma.$transaction([
      prisma.intakeSummary.upsert({
        where: { intakeSessionId: session.id },
        create: { intakeSessionId: session.id, ...fields },
        update: { ...fields, generatedAt: new Date() },
      }),
      prisma.intakeSession.update({ where: { id: session.id }, data: { status: 'COMPLETE', completedAt: new Date() } }),
    ]);

    // The patient gets a neutral recap and the recommended service - never
    // the clinical summary, never anything resembling a diagnosis.
    return json({
      intakeId: session.id,
      redFlag: session.redFlag,
      answeredCount: Object.keys((session.answers as object) || {}).length,
      recommendation: recommendation(service),
    });
  })
);
