import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, readJson, str, withErrors } from '@/lib/server/http';
import { paging, audit } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

export const GET = withErrors(async (req: Request) =>
  requireAdmin(async () => {
    const url = new URL(req.url);
    const { page, size, skip, take } = paging(url);
    const target = url.searchParams.get('target');
    const where = target ? { target } : {};
    const [total, rows] = await Promise.all([
      prisma.adminAuditLog.count({ where }),
      prisma.adminAuditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, include: { admin: { select: { name: true, email: true } } } }),
    ]);
    return json({ page, size, total, rows: rows.map((r) => ({ id: r.id, action: r.action, target: r.target, meta: r.meta, admin: r.admin.name, createdAt: r.createdAt.toISOString() })) });
  })
);

/// Read-access logging: the admin UI posts here when it opens a record that
/// carries clinical content, so "who looked at this patient's summary" is
/// answerable later.
export const POST = withErrors(async (req: Request) =>
  requireAdmin(async (admin) => {
    const b = await readJson(req);
    const action = str(b.action, 60), target = str(b.target, 60);
    if (!/^[a-z]+\.view$/.test(action) || !target) return json({ ok: false });
    await audit(admin, action, target);
    return json({ ok: true });
  })
);
