import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, fail, withErrors } from '@/lib/server/http';
import { formatMinor } from '@/lib/server/services';
import { computeAge } from '@/lib/server/claude/summary';

export const dynamic = 'force-dynamic';

/// Everything about one booking. The admin sees the clinical summary and the
/// signed note too - "all access" - and every such read is what the audit log
/// exists for, so the detail view is logged on the client side by the page
/// that opens it (see the audit route).
export const GET = withErrors(async (_req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async () => {
    const a = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { patient: true, clinician: true, payment: true, note: true, slot: true, intakeSession: { include: { summary: true } } },
    });
    if (!a) return fail('Appointment not found.', 404);
    const s = a.intakeSession?.summary ?? null;
    return json({
      appointment: {
        id: a.id, reference: a.reference, service: a.serviceName, serviceCat: a.serviceCat, startsAt: a.startsAt.toISOString(), durationMin: a.durationMin,
        mode: a.mode, status: a.status, joinUrl: a.joinUrl, listLabel: formatMinor(a.listMinor), discountLabel: a.discountMinor ? formatMinor(a.discountMinor) : null,
        promoCode: a.promoCode, priceLabel: formatMinor(a.priceMinor), createdAt: a.createdAt.toISOString(), slotHeld: Boolean(a.slotId),
      },
      patient: { id: a.patient.id, fullName: a.patient.fullName, email: a.patient.email, phone: a.patient.phone, country: a.patient.country, age: computeAge(a.patient.dateOfBirth) },
      clinician: { id: a.clinician.id, displayName: a.clinician.displayName, email: a.clinician.email },
      payment: a.payment ? { status: a.payment.status, method: a.payment.method, amountLabel: formatMinor(a.payment.amountMinor), provider: a.payment.stripePaymentIntentId, mock: a.payment.mock, lastError: a.payment.lastError, updatedAt: a.payment.updatedAt.toISOString() } : null,
      intake: a.intakeSession ? { concern: a.intakeSession.concern, redFlag: a.intakeSession.redFlag, redFlagReason: a.intakeSession.redFlagReason, completedAt: a.intakeSession.completedAt?.toISOString() ?? null } : null,
      summary: s ? { presentingComplaint: s.presentingComplaint, historySummary: s.historySummary, suggestedFocus: s.suggestedFocus, riskFlags: s.riskFlags, riskLevel: s.riskLevel, answerDigest: s.answerDigest, model: s.model } : null,
      note: a.note ? { subjective: a.note.subjective, objective: a.note.objective, assessment: a.note.assessment, plan: a.note.plan, signedAt: a.note.signedAt?.toISOString() ?? null } : null,
    });
  })
);
