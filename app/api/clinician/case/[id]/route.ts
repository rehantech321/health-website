import prisma from '@/lib/server/db';
import { requireClinician } from '@/lib/server/auth';
import { json, fail, withErrors } from '@/lib/server/http';
import { formatMinor } from '@/lib/server/services';
import { computeAge } from '@/lib/server/claude/summary';

export const dynamic = 'force-dynamic';

/// The full case a clinician opens before the consultation: patient details,
/// the AI-written intake summary, every verbatim answer, and any note so far.
export const GET = withErrors(async (_req: Request, { params }: { params: { id: string } }) =>
  requireClinician(async (clinician) => {
    const a = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { patient: true, note: true, payment: true, intakeSession: { include: { summary: true } } },
    });

    // Same 404 for "does not exist" and "not yours", so this cannot be used to
    // probe for other clinicians' appointments.
    if (!a || a.clinicianId !== clinician.id) return fail('Case not found.', 404);

    const s = a.intakeSession?.summary ?? null;

    return json({
      id: a.id,
      reference: a.reference,
      status: a.status,
      serviceName: a.serviceName,
      startsAt: a.startsAt.toISOString(),
      durationMin: a.durationMin,
      mode: a.mode,
      joinUrl: a.joinUrl,
      priceLabel: formatMinor(a.priceMinor),
      paymentStatus: a.payment?.status ?? null,
      paymentMethod: a.payment?.method ?? null,
      patient: {
        fullName: a.patient.fullName,
        email: a.patient.email,
        phone: a.patient.phone,
        age: computeAge(a.patient.dateOfBirth),
        dateOfBirth: a.patient.dateOfBirth.toISOString().slice(0, 10),
        country: a.patient.country,
      },
      intake: a.intakeSession
        ? {
            specialty: a.intakeSession.specialty,
            concern: a.intakeSession.concern,
            completedAt: a.intakeSession.completedAt?.toISOString() ?? null,
            redFlag: a.intakeSession.redFlag,
            redFlagReason: a.intakeSession.redFlagReason,
          }
        : null,
      summary: s
        ? {
            presentingComplaint: s.presentingComplaint,
            historySummary: s.historySummary,
            suggestedFocus: s.suggestedFocus,
            riskFlags: s.riskFlags,
            riskLevel: s.riskLevel,
            answerDigest: s.answerDigest,
            // So a clinician always knows whether this is a model's summary or
            // the raw-answer fallback.
            model: s.model,
            generatedAt: s.generatedAt.toISOString(),
          }
        : null,
      note: a.note
        ? {
            subjective: a.note.subjective,
            objective: a.note.objective,
            assessment: a.note.assessment,
            plan: a.note.plan,
            signedAt: a.note.signedAt?.toISOString() ?? null,
            updatedAt: a.note.updatedAt.toISOString(),
          }
        : null,
    });
  })
);
