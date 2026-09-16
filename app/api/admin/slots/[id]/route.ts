import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, fail, withErrors } from '@/lib/server/http';
import { audit } from '@/lib/server/admin';

/// Removes one slot, only if nobody has booked it.
export const DELETE = withErrors(async (_req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const s = await prisma.appointmentSlot.findUnique({ where: { id: params.id }, include: { appointment: true } });
    if (!s) return fail('Slot not found.', 404);
    if (s.appointment) return fail('That slot is booked. Cancel the appointment first.', 409);
    await prisma.appointmentSlot.delete({ where: { id: s.id } });
    await audit(admin, 'slot.delete', s.id, { clinicianId: s.clinicianId, startsAt: s.startsAt.toISOString() });
    return json({ deleted: true });
  })
);
