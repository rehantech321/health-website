import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';
import { formatMinor } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/// The patient's own bookings and vouchers, for their profile page.
///
/// Deliberately NOT returned: the AI clinical summary and the clinician's
/// notes. Both are clinician-facing records written for the consultation, and
/// a patient reading a risk assessment of themselves out of context is a
/// clinical harm, not a feature. Patients see what they booked and what they
/// answered - never what was written about them.
export const GET = withErrors(async () =>
  requirePatient(async (patient) => {
    const [appointments, vouchers] = await Promise.all([
      prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: { clinician: true, payment: true, intakeSession: true },
        orderBy: { startsAt: 'desc' },
        take: 100,
      }),
      prisma.voucher.findMany({
        where: { patientId: patient.id },
        include: { payment: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const now = Date.now();

    return json({
      patient: {
        fullName: patient.fullName,
        email: patient.email,
        country: patient.country,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth.toISOString().slice(0, 10),
        memberSince: patient.createdAt.toISOString(),
      },
      appointments: appointments.map((a) => ({
        id: a.id,
        reference: a.reference,
        serviceName: a.serviceName,
        clinicianName: a.clinician.displayName,
        startsAt: a.startsAt.toISOString(),
        durationMin: a.durationMin,
        mode: a.mode,
        priceLabel: formatMinor(a.priceMinor),
        discountLabel: a.discountMinor ? formatMinor(a.discountMinor) : null,
        promoCode: a.promoCode,
        status: a.status,
        paymentStatus: a.payment?.status ?? null,
        paymentMethod: a.payment?.method ?? null,
        // Only once paid and not yet over - nothing to join otherwise.
        joinUrl: a.status === 'CONFIRMED' && a.startsAt.getTime() > now - 60 * 60 * 1000 ? a.joinUrl : null,
        upcoming: a.startsAt.getTime() > now && !['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(a.status),
        intakeCompleted: Boolean(a.intakeSession?.completedAt),
      })),
      vouchers: vouchers.map((v) => ({
        id: v.id,
        code: v.code,
        serviceName: v.serviceName,
        priceLabel: formatMinor(v.priceMinor),
        status: v.status,
        paymentStatus: v.payment?.status ?? null,
        paymentMethod: v.payment?.method ?? null,
        createdAt: v.createdAt.toISOString(),
        redeemedAt: v.redeemedAt?.toISOString() ?? null,
      })),
    });
  })
);
