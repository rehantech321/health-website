import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';
import { paging } from '@/lib/server/admin';
import { formatMinor, FOUNDING_CAP } from '@/lib/server/services';
import { foundingClaimed } from '@/lib/server/vouchers';

export const dynamic = 'force-dynamic';

export const GET = withErrors(async (req: Request) =>
  requireAdmin(async () => {
    const url = new URL(req.url);
    const { page, size, skip, take } = paging(url);
    const [total, rows, claimed] = await Promise.all([
      prisma.voucher.count(),
      prisma.voucher.findMany({ orderBy: { createdAt: 'desc' }, skip, take, include: { patient: { select: { fullName: true, email: true } }, payment: { select: { method: true } } } }),
      foundingClaimed(),
    ]);
    return json({
      page, size, total, cap: FOUNDING_CAP, claimed, remaining: Math.max(0, FOUNDING_CAP - claimed),
      rows: rows.map((v) => ({ id: v.id, code: v.code, service: v.serviceName, patient: v.patient.fullName, patientId: v.patientId, email: v.patient.email, status: v.status, priceLabel: formatMinor(v.priceMinor), paymentMethod: v.payment?.method ?? null, createdAt: v.createdAt.toISOString(), redeemedAt: v.redeemedAt?.toISOString() ?? null })),
    });
  })
);
