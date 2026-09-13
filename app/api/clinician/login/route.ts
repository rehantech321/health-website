import prisma from '@/lib/server/db';
import { verifyPassword, createSession, publicClinician } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';

export const POST = withErrors(async (req: Request) => {
  const body = await readJson(req);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) return fail('Enter your email and password.');

  const clinician = await prisma.clinician.findUnique({ where: { email } });
  if (!clinician || !verifyPassword(password, clinician.passwordHash)) {
    return fail('Email or password is incorrect.', 401);
  }
  if (!clinician.active) return fail('This account is not active. Contact the clinical team.', 403);

  await createSession({ clinicianId: clinician.id });
  return json({ clinician: publicClinician(clinician) });
});
