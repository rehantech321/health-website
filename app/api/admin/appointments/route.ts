import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';
import { paging } from '@/lib/server/admin';
import { formatMinor } from '@/lib/server/services';
import { releaseExpiredHolds } from '@/lib/server/holds';

export const dynamic = 'force-dynamic';

/// Every booking, filterable by status, clinician, and date window; searchable
/// by reference, patient or clinician name.
export const GET = withErrors(async (req: Request) =>
  requireAdmin(async () => {
    await releaseExpiredHolds();
    const url = new URL(req.url);
    const { page, size, skip, take } = paging(url);
    const where: any = {};
    const status = url.searchParams.get('status');
    if (status && status !== 'all') where.status = status;
    const clinicianId = url.searchParams.get('clinicianId');
    if (clinicianId) where.clinicianId = clinicianId;
    const from = url.searchParams.get('from'), to = url.searchParams.get('to');
    if (from || to) where.startsAt = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };
    const q = (url.searchParams.get('q') || '').trim();
    if (q) where.OR = [
      { reference: { contains: q, mode: 'insensitive' } },
      { patient: { fullName: { contains: q, mode: 'insensitive' } } },
      { patient: { email: { contains: q, mode: 'insensitive' } } },
      { clinician: { displayName: { contains: q, mode: 'insensitive' } } },
    ];
    const upcomingOnly = url.searchParams.get('upcoming') === 'true';
    if (upcomingOnly) where.startsAt = { ...(where.startsAt || {}), gte: new Date() };

    const [total, rows, clinicians] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where, orderBy: { startsAt: upcomingOnly ? 'asc' : 'desc' }, skip, take,
        // Narrow selects: intake sessions carry the full transcript and the
        // list only needs a few flags from each relation.
        include: {
          patient: { select: { fullName: true } }, clinician: { select: { displayName: true } },
          payment: { select: { status: true, method: true } }, note: { select: { signedAt: true } },
          intakeSession: { select: { summary: { select: { riskLevel: true } } } },
        },
      }),
      prisma.clinician.findMany({ select: { id: true, displayName: true }, orderBy: { displayName: 'asc' } }),
    ]);
    return json({
      page, size, total, clinicians,
      rows: rows.map((a) => ({
        id: a.id, reference: a.reference, patient: a.patient.fullName, patientId: a.patientId, clinician: a.clinician.displayName, clinicianId: a.clinicianId,
        service: a.serviceName, startsAt: a.startsAt.toISOString(), durationMin: a.durationMin, mode: a.mode, status: a.status,
        priceLabel: formatMinor(a.priceMinor), paymentStatus: a.payment?.status ?? null, paymentMethod: a.payment?.method ?? null,
        hasLink: Boolean(a.joinUrl), hasSummary: Boolean(a.intakeSession?.summary), riskLevel: a.intakeSession?.summary?.riskLevel ?? null,
        noteSigned: Boolean(a.note?.signedAt), createdAt: a.createdAt.toISOString(),
      })),
    });
  })
);
