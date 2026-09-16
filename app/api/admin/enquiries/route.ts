import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';
import { paging, searchWhere } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

export const GET = withErrors(async (req: Request) =>
  requireAdmin(async () => {
    const url = new URL(req.url);
    const { page, size, skip, take } = paging(url);
    const where: any = { ...searchWhere(url.searchParams.get('q'), ['name', 'email', 'kind']) };
    const status = url.searchParams.get('status');
    if (status && status !== 'all') where.status = status;
    const [total, rows] = await Promise.all([
      prisma.enquiry.count({ where }),
      prisma.enquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    ]);
    return json({ page, size, total, rows: rows.map((e) => ({ id: e.id, kind: e.kind, name: e.name, email: e.email, routedTo: e.routedTo, fields: e.fields, status: e.status, notifiedAt: e.notifiedAt?.toISOString() ?? null, createdAt: e.createdAt.toISOString() })) });
  })
);
