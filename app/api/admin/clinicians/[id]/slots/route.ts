import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { audit } from '@/lib/server/admin';

/// Publishes availability for a clinician: every weekday in [from, to], at
/// each hour listed, skipping any that already exist. This is how a real
/// practice puts a doctor on the books.
export const POST = withErrors(async (req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const c = await prisma.clinician.findUnique({ where: { id: params.id } });
    if (!c) return fail('Clinician not found.', 404);

    const b = await readJson(req);
    const from = new Date(str(b.from, 20));
    const to = new Date(str(b.to, 20));
    const hours: number[] = Array.isArray(b.hours) ? b.hours.map(Number).filter((h: number) => Number.isInteger(h) && h >= 0 && h <= 23) : [];
    const durationMin = Math.min(240, Math.max(15, Number(b.durationMin) || 60));
    const mode = str(b.mode, 10) === 'phone' ? 'phone' : 'video';
    const weekdays: number[] = Array.isArray(b.weekdays) && b.weekdays.length ? b.weekdays.map(Number) : [1, 2, 3, 4, 5];

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return fail('Give a valid date range.');
    if ((to.getTime() - from.getTime()) / 86400000 > 92) return fail('Publish at most three months at a time.');
    if (!hours.length) return fail('Choose at least one start hour.');

    const rows: { clinicianId: string; startsAt: Date; durationMin: number; mode: string }[] = [];
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (!weekdays.includes(d.getDay())) continue;
      for (const h of hours) {
        const startsAt = new Date(d);
        startsAt.setHours(h, 0, 0, 0);
        if (startsAt <= new Date()) continue;
        rows.push({ clinicianId: c.id, startsAt, durationMin, mode });
      }
    }
    const result = await prisma.appointmentSlot.createMany({ data: rows, skipDuplicates: true });
    await audit(admin, 'clinician.slots.publish', c.id, { from: from.toISOString(), to: to.toISOString(), hours, created: result.count });
    return json({ created: result.count, considered: rows.length });
  })
);

/// Removes every FREE future slot in a date range (booked ones are untouched).
export const DELETE = withErrors(async (req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const b = await readJson(req);
    const from = new Date(str(b.from, 20) || new Date().toISOString());
    const to = b.to ? new Date(str(b.to, 20)) : new Date('2100-01-01');
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return fail('Give a valid date range.');
    const r = await prisma.appointmentSlot.deleteMany({
      where: { clinicianId: params.id, appointment: null, startsAt: { gte: from, lte: to } },
    });
    await audit(admin, 'clinician.slots.remove', params.id, { from: from.toISOString(), to: to.toISOString(), removed: r.count });
    return json({ removed: r.count });
  })
);
