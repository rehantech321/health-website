import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { audit } from '@/lib/server/admin';

export const PATCH = withErrors(async (req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const b = await readJson(req);
    const status = str(b.status, 20);
    if (!['NEW', 'IN_PROGRESS', 'CLOSED'].includes(status)) return fail('Status must be NEW, IN_PROGRESS or CLOSED.');
    const e = await prisma.enquiry.findUnique({ where: { id: params.id } });
    if (!e) return fail('Enquiry not found.', 404);
    await prisma.enquiry.update({ where: { id: e.id }, data: { status: status as any } });
    await audit(admin, 'enquiry.status', e.id, { status });
    return json({ status });
  })
);

export const DELETE = withErrors(async (_req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const e = await prisma.enquiry.findUnique({ where: { id: params.id } });
    if (!e) return fail('Enquiry not found.', 404);
    await prisma.enquiry.delete({ where: { id: e.id } });
    await audit(admin, 'enquiry.delete', e.id, { email: e.email, kind: e.kind });
    return json({ deleted: true });
  })
);
