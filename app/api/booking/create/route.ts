import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { findService, formatMinor, isVoucher } from '@/lib/server/services';
import { applyPromo } from '@/lib/server/promo';
import { makeReference } from '@/lib/server/booking-state';
import { releaseExpiredHolds } from '@/lib/server/holds';

/// Reserves a slot and creates the appointment in PENDING_PAYMENT. Nothing is
/// confirmed until payment succeeds; an unpaid booking simply expires.
export const POST = withErrors(async (req: Request) =>
  requirePatient(async (patient) => {
    const body = await readJson(req);
    const slotId = str(body.slotId, 40);
    const intakeId = str(body.intakeId, 40) || null;
    const promoCode = str(body.promoCode, 40) || null;

    const service = findService(str(body.serviceName, 120));
    if (!service) return fail('Unknown service.');
    if (isVoucher(service)) return fail('Use the voucher endpoint for Founding 500 purchases.');
    if (!slotId) return fail('Choose an appointment time.');

    // An unpaid hold that has run out must not block this booking.
    await releaseExpiredHolds();

    const slot = await prisma.appointmentSlot.findUnique({ where: { id: slotId }, include: { clinician: true, appointment: true } });
    if (!slot) return fail('That appointment time is no longer listed.', 404);
    if (slot.startsAt < new Date()) return fail('That time is in the past.', 409);

    if (slot.appointment) {
      const existing = slot.appointment;
      if (existing.patientId !== patient.id) {
        return fail('That time has just been taken. Please pick another.', 409);
      }
      if (existing.status === 'PENDING_PAYMENT') {
        // The same patient is coming back to a time they already hold - hand
        // them their existing booking so they can finish paying for it, rather
        // than telling them their own hold is "taken".
        return json({
          appointmentId: existing.id,
          reference: existing.reference,
          serviceName: existing.serviceName,
          listMinor: existing.listMinor,
          discountMinor: existing.discountMinor,
          priceMinor: existing.priceMinor,
          priceLabel: formatMinor(existing.priceMinor),
          promo: existing.promoCode ? { code: existing.promoCode, percentOff: null } : null,
          promoError: null,
          startsAt: existing.startsAt.toISOString(),
          durationMin: existing.durationMin,
          mode: existing.mode,
          clinician: { displayName: slot.clinician.displayName },
          resumed: true,
        });
      }
      // CONFIRMED or COMPLETED by this same patient: a genuine double-booking.
      return fail('You already have this appointment booked. See it under My profile.', 409);
    }
    if (slot.clinician.specialty !== service.cat) return fail('That clinician does not offer this service.');

    if (intakeId) {
      const intake = await prisma.intakeSession.findUnique({ where: { id: intakeId } });
      if (!intake || intake.patientId !== patient.id) return fail('Intake session not recognised.');
    }

    // Price comes from the server catalogue and the promo table - never from
    // the request body.
    const listMinor = service.priceMinor;
    const promo = await applyPromo(promoCode, listMinor);
    const discountMinor = promo.ok ? promo.discountMinor ?? 0 : 0;
    // Only report a rejection when the patient actually typed a code.
    const promoError = !promo.ok && promoCode ? promo.reason ?? null : null;

    let appointment;
    try {
      appointment = await prisma.appointment.create({
        data: {
          reference: makeReference(),
          patientId: patient.id,
          clinicianId: slot.clinicianId,
          slotId: slot.id,
          intakeSessionId: intakeId,
          serviceName: service.name,
          serviceCat: service.cat,
          listMinor,
          discountMinor,
          promoCode: promo.ok ? promo.code : null,
          priceMinor: listMinor - discountMinor,
          mode: slot.mode,
          startsAt: slot.startsAt,
          durationMin: slot.durationMin,
        },
      });
    } catch (error: any) {
      // P2002 on slotId: another request won the race for this slot.
      if (error?.code === 'P2002') return fail('That time has just been taken. Please pick another.', 409);
      throw error;
    }

    return json(
      {
        appointmentId: appointment.id,
        reference: appointment.reference,
        serviceName: appointment.serviceName,
        listMinor,
        discountMinor,
        priceMinor: appointment.priceMinor,
        priceLabel: formatMinor(appointment.priceMinor),
        promo: promo.ok ? { code: promo.code, percentOff: promo.percentOff } : null,
        promoError,
        startsAt: appointment.startsAt.toISOString(),
        durationMin: appointment.durationMin,
        mode: appointment.mode,
        clinician: { displayName: slot.clinician.displayName },
      },
      201
    );
  })
);
