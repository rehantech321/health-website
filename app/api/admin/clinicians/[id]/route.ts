import prisma from '@/lib/server/db';
import { requireAdmin, hashPassword } from '@/lib/server/auth';
import { json, fail, readJson, str, isEmail, withErrors } from '@/lib/server/http';
import { audit } from '@/lib/server/admin';
import { CATEGORIES, formatMinor } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/// Full view: details, availability, and every appointment.
export const GET = withErrors(async (_req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async () => {
    const now = new Date();
    const c = await prisma.clinician.findUnique({
      where: { id: params.id },
      include: {
        appointments: { include: { patient: true, note: true }, orderBy: { startsAt: 'desc' }, take: 200 },
        slots: { where: { startsAt: { gte: now } }, include: { appointment: { select: { id: true } } }, orderBy: { startsAt: 'asc' } },
      },
    });
    if (!c) return fail('Clinician not found.', 404);
    return json({
      clinician: {
        id: c.id, displayName: c.displayName, email: c.email, specialty: c.specialty, specialtyLabel: CATEGORIES[c.specialty] ?? c.specialty,
        regulator: c.regulator, regNumber: c.regNumber, bio: c.bio, active: c.active, createdAt: c.createdAt.toISOString(),
      },
      categories: CATEGORIES,
      appointments: c.appointments.map((a) => ({
        id: a.id, reference: a.reference, patient: a.patient.fullName, patientId: a.patientId, service: a.serviceName,
        startsAt: a.startsAt.toISOString(), mode: a.mode, status: a.status, priceLabel: formatMinor(a.priceMinor),
        hasLink: Boolean(a.joinUrl), noteSigned: Boolean(a.note?.signedAt),
      })),
      slots: c.slots.map((s) => ({ id: s.id, startsAt: s.startsAt.toISOString(), durationMin: s.durationMin, mode: s.mode, booked: Boolean(s.appointment) })),
    });
  })
);

/// Edit identity, credentialing and status. This is the admin's counterpart to
/// the clinician's own profile page, which deliberately cannot change these.
export const PATCH = withErrors(async (req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const c = await prisma.clinician.findUnique({ where: { id: params.id } });
    if (!c) return fail('Clinician not found.', 404);
    const b = await readJson(req);
    const data: any = {};
    if (typeof b.displayName === 'string') data.displayName = str(b.displayName, 120) || c.displayName;
    if (typeof b.email === 'string') {
      const email = str(b.email, 200).toLowerCase();
      if (!isEmail(email)) return fail('Enter a valid email address.');
      if (email !== c.email && (await prisma.clinician.findUnique({ where: { email } }))) return fail('That email is already in use.', 409);
      data.email = email;
    }
    if (typeof b.specialty === 'string') {
      if (!CATEGORIES[b.specialty] || b.specialty === 'founding') return fail('Choose a valid service category.');
      data.specialty = b.specialty;
    }
    if (typeof b.regulator === 'string') data.regulator = str(b.regulator, 60) || null;
    if (typeof b.regNumber === 'string') data.regNumber = str(b.regNumber, 60) || null;
    if (typeof b.bio === 'string') data.bio = str(b.bio, 600) || null;
    if (typeof b.active === 'boolean') data.active = b.active;
    if (typeof b.newPassword === 'string' && b.newPassword) {
      if (b.newPassword.length < 10) return fail('Password must be at least 10 characters.');
      data.passwordHash = hashPassword(b.newPassword);
    }
    if (!Object.keys(data).length) return fail('Nothing to update.');

    const updated = await prisma.clinician.update({ where: { id: c.id }, data });
    // Deactivating (or resetting the password) ends every session they hold.
    if (data.active === false || data.passwordHash) await prisma.session.deleteMany({ where: { clinicianId: c.id } });

    const { passwordHash, ...safe } = data;
    await audit(admin, 'clinician.update', c.id, { ...safe, passwordReset: Boolean(passwordHash) });
    return json({ ok: true, active: updated.active });
  })
);

/// Delete. Refused while any appointment references this clinician - those are
/// clinical and financial records. Deactivate instead, which hides them from
/// booking and blocks sign-in while keeping history intact.
export const DELETE = withErrors(async (_req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const c = await prisma.clinician.findUnique({ where: { id: params.id }, include: { _count: { select: { appointments: true } } } });
    if (!c) return fail('Clinician not found.', 404);
    if (c._count.appointments > 0) {
      return fail(`This clinician has ${c._count.appointments} appointment record(s), which must be kept. Deactivate the account instead.`, 409);
    }
    await prisma.clinician.delete({ where: { id: c.id } }); // cascades free slots + sessions
    await audit(admin, 'clinician.delete', c.id, { email: c.email });
    return json({ deleted: true });
  })
);
