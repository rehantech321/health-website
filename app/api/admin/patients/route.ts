import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';
import { paging, searchWhere } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

export const GET = withErrors(async (req: Request) =>
  requireAdmin(async () => {
    const url = new URL(req.url);
    const { page, size, skip, take } = paging(url);
    const where = searchWhere(url.searchParams.get('q'), ['fullName', 'email', 'phone']);
    const [total, rows] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take,
        include: { _count: { select: { appointments: true, vouchers: true } }, appointments: { orderBy: { startsAt: 'desc' }, take: 1, select: { startsAt: true, status: true } } },
      }),
    ]);
    return json({
      page, size, total,
      rows: rows.map((p) => ({
        id: p.id, fullName: p.fullName, email: p.email, phone: p.phone, country: p.country,
        dateOfBirth: p.dateOfBirth.toISOString().slice(0, 10), createdAt: p.createdAt.toISOString(),
        appointments: p._count.appointments, vouchers: p._count.vouchers,
        lastAppointment: p.appointments[0] ? { startsAt: p.appointments[0].startsAt.toISOString(), status: p.appointments[0].status } : null,
      })),
    });
  })
);
