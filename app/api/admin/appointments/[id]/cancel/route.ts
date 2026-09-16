import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { audit } from '@/lib/server/admin';
import { sendCancellation } from '@/lib/server/mail';

/// Cancels a booking: releases the slot, tells both parties. Refunds are NOT
/// issued automatically - that is a deliberate manual step in Stripe, since a
/// cancellation may be the patient's fault and non-refundable under the
/// practice's terms. The email tells the patient a refund "will be" processed
/// only when the booking was paid.
export const POST = withErrors(async (req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const b = await readJson(req);
    const reason = str(b.reason, 500);
    const a = await prisma.appointment.findUnique({ where: { id: params.id }, include: { patient: true, clinician: true, payment: true } });
    if (!a) return fail('Appointment not found.', 404);
    if (['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(a.status)) return fail(`This appointment is already ${a.status.toLowerCase()}.`, 409);

    const wasPaid = a.payment?.status === 'PAID';
    await prisma.appointment.update({ where: { id: a.id }, data: { status: 'CANCELLED', slotId: null } });
    await audit(admin, 'appointment.cancel', a.id, { reference: a.reference, reason, wasPaid, notify: b.notify !== false });

    let notified = false;
    if (b.notify !== false) notified = await sendCancellation(a, reason).catch(() => false);

    return json({ status: 'CANCELLED', slotReleased: true, notified, refundNeeded: wasPaid, providerRef: a.payment?.stripePaymentIntentId ?? null });
  })
);
