import prisma from '@/lib/server/db';
import { requireClinician } from '@/lib/server/auth';
import { json, str, withErrors } from '@/lib/server/http';
import { formatMinor } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/// The clinician's own list - never the whole patient book.
export const GET = withErrors(async (req: Request) =>
  requireClinician(async (clinician) => {
    const scope = str(new URL(req.url).searchParams.get('scope'), 20) || 'upcoming';

    const where: any = { clinicianId: clinician.id };
    if (scope === 'upcoming') {
      where.status = 'CONFIRMED';
      where.startsAt = { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) };
    } else if (scope === 'past') {
      where.status = { in: ['CONFIRMED', 'COMPLETED'] };
      where.startsAt = { lt: new Date() };
    } else {
      // "all" still excludes bookings that were never paid for.
      where.status = { in: ['CONFIRMED', 'COMPLETED', 'CANCELLED'] };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true, note: true, intakeSession: { include: { summary: true } } },
      orderBy: { startsAt: scope === 'past' ? 'desc' : 'asc' },
      take: 100,
    });

    return json({
      scope,
      cases: appointments.map((a) => ({
        id: a.id,
        reference: a.reference,
        patientName: a.patient.fullName,
        serviceName: a.serviceName,
        startsAt: a.startsAt.toISOString(),
        durationMin: a.durationMin,
        mode: a.mode,
        priceLabel: formatMinor(a.priceMinor),
        status: a.status,
        riskLevel: a.intakeSession?.summary?.riskLevel ?? null,
        hasSummary: Boolean(a.intakeSession?.summary),
        hasLink: Boolean(a.joinUrl),
        hasNote: Boolean(a.note),
        noteSigned: Boolean(a.note?.signedAt),
      })),
    });
  })
);
