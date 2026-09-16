import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';
import { paging, searchWhere } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

export const GET = withErrors(async (req: Request) =>
  requireAdmin(async () => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const { page, size, skip, take } = paging(url);
    const where: any = { ...searchWhere(url.searchParams.get('q'), ['fullName', 'email', 'specialty', 'regNumber']) };
    if (status && status !== 'all') where.status = status;
    const [total, rows] = await Promise.all([
      prisma.clinicianApplication.count({ where }),
      prisma.clinicianApplication.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    ]);
    return json({
      page, size, total,
      rows: rows.map((a) => ({
        id: a.id, fullName: a.fullName, email: a.email, specialty: a.specialty, country: a.country,
        qualification: a.qualification, regulator: a.regulator, regNumber: a.regNumber, experience: a.experience,
        hoursPerWeek: a.hoursPerWeek, languages: a.languages, status: a.status, reviewNotes: a.reviewNotes,
        clinicianId: a.clinicianId, createdAt: a.createdAt.toISOString(), reviewedAt: a.reviewedAt?.toISOString() ?? null,
      })),
    });
  })
);
