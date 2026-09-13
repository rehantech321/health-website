import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, fail, str, withErrors } from '@/lib/server/http';
import { findService, isVoucher } from '@/lib/server/services';
import { releaseExpiredHolds } from '@/lib/server/holds';

export const dynamic = 'force-dynamic';
const DAYS_AHEAD = 28;

/// Free slots for the clinicians who cover a service, grouped by clinician.
/// A slot is free when nothing references it in Appointment.
export const GET = withErrors(async (req: Request) =>
  requirePatient(async () => {
    const url = new URL(req.url);
    const service = findService(str(url.searchParams.get('service'), 120));
    if (!service) return fail('Unknown service.');
    if (isVoucher(service)) return fail('Vouchers are prepaid - no appointment slot is chosen at purchase.');

    // Free any slots whose unpaid hold has run out before we list what is free.
    await releaseExpiredHolds();

    const from = new Date(Date.now() + 60 * 60 * 1000); // no same-hour bookings
    const to = new Date(Date.now() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

    const slots = await prisma.appointmentSlot.findMany({
      where: {
        startsAt: { gte: from, lte: to },
        appointment: null,
        clinician: { active: true, specialty: service.cat },
      },
      include: { clinician: true },
      orderBy: { startsAt: 'asc' },
      take: 400,
    });

    const byClinician = new Map<string, any>();
    for (const slot of slots) {
      if (!byClinician.has(slot.clinicianId)) {
        byClinician.set(slot.clinicianId, {
          clinicianId: slot.clinicianId,
          displayName: slot.clinician.displayName,
          bio: slot.clinician.bio,
          regulator: slot.clinician.regulator,
          slots: [],
        });
      }
      byClinician.get(slot.clinicianId).slots.push({
        id: slot.id,
        startsAt: slot.startsAt.toISOString(),
        durationMin: slot.durationMin,
        mode: slot.mode,
      });
    }

    return json({
      service: { name: service.name, priceMinor: service.priceMinor, durationLabel: service.durationLabel },
      clinicians: [...byClinician.values()],
    });
  })
);
