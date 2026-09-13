import prisma from '@/lib/server/db';
import { requireClinician, verifyPassword, hashPassword, destroyOtherSessions, CLINICIAN_COOKIE } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { CATEGORIES } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

function profileOf(c: { id: string; email: string; displayName: string; specialty: string; regulator: string | null; regNumber: string | null; bio: string | null; createdAt: Date }, counts: { upcoming: number; completed: number }) {
  return {
    id: c.id,
    email: c.email,
    displayName: c.displayName,
    specialty: c.specialty,
    specialtyLabel: CATEGORIES[c.specialty] ?? c.specialty,
    regulator: c.regulator,
    regNumber: c.regNumber,
    bio: c.bio ?? '',
    memberSince: c.createdAt.toISOString(),
    counts,
  };
}

async function counts(clinicianId: string) {
  const [upcoming, completed] = await Promise.all([
    prisma.appointment.count({ where: { clinicianId, status: 'CONFIRMED', startsAt: { gte: new Date() } } }),
    prisma.appointment.count({ where: { clinicianId, status: 'COMPLETED' } }),
  ]);
  return { upcoming, completed };
}

/// The signed-in clinician's own profile.
export const GET = withErrors(async () =>
  requireClinician(async (clinician) => json({ profile: profileOf(clinician, await counts(clinician.id)) }))
);

/// Edits the parts a clinician may change themselves: their bio, and their
/// password. Identity and credentialing fields (name, specialty, regulator,
/// registration number) are deliberately NOT editable here - those are what
/// the credentialing review verified, and changing them is an admin action.
export const PATCH = withErrors(async (req: Request) =>
  requireClinician(async (clinician) => {
    const body = await readJson(req);
    const data: { bio?: string; passwordHash?: string } = {};

    if (typeof body.bio === 'string') data.bio = str(body.bio, 600);

    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (newPassword) {
      if (!verifyPassword(currentPassword, clinician.passwordHash)) return fail('Your current password is incorrect.', 401);
      if (newPassword.length < 10) return fail('New password must be at least 10 characters.');
      data.passwordHash = hashPassword(newPassword);
    }

    if (!Object.keys(data).length) return fail('Nothing to update.');

    const updated = await prisma.clinician.update({ where: { id: clinician.id }, data });

    if (data.passwordHash) {
      // A password change signs out every other browser this account is in.
      await destroyOtherSessions(CLINICIAN_COOKIE, { clinicianId: clinician.id });
    }

    return json({ profile: profileOf(updated, await counts(clinician.id)), passwordChanged: Boolean(data.passwordHash) });
  })
);
