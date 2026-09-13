import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, fail, str, withErrors } from '@/lib/server/http';
import { formatMinor } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/// Polled by the confirmation screen after the browser returns from checkout.
/// The webhook is what confirms a purchase; this only reports state. Handles
/// both booking references (ELDAVA-xxxxxx) and voucher codes (F500-xxxx-xxxx).
export const GET = withErrors(async (req: Request) =>
  requirePatient(async (patient) => {
    const reference = str(new URL(req.url).searchParams.get('reference'), 40);
    if (!reference) return fail('Missing reference.');

    if (reference.startsWith('F500-')) {
      const v = await prisma.voucher.findUnique({ where: { code: reference }, include: { payment: true } });
      if (!v || v.patientId !== patient.id) return fail('Voucher not found.', 404);
      return json({
        kind: 'voucher',
        reference: v.code,
        status: v.status,
        paymentStatus: v.payment?.status ?? null,
        paymentMethod: v.payment?.method ?? null,
        lastError: v.payment?.lastError ?? null,
        serviceName: v.serviceName,
        priceLabel: formatMinor(v.priceMinor),
      });
    }

    const a = await prisma.appointment.findUnique({ where: { reference }, include: { payment: true, clinician: true } });
    if (!a || a.patientId !== patient.id) return fail('Booking not found.', 404);
    return json({
      kind: 'appointment',
      reference: a.reference,
      status: a.status,
      paymentStatus: a.payment?.status ?? null,
      paymentMethod: a.payment?.method ?? null,
      lastError: a.payment?.lastError ?? null,
      serviceName: a.serviceName,
      priceLabel: formatMinor(a.priceMinor),
      discountLabel: a.discountMinor ? formatMinor(a.discountMinor) : null,
      promoCode: a.promoCode,
      startsAt: a.startsAt.toISOString(),
      durationMin: a.durationMin,
      mode: a.mode,
      clinicianName: a.clinician.displayName,
      joinUrl: a.joinUrl,
    });
  })
);
