import prisma from '@/lib/server/db';
import { verifyPassword, createSession, publicPatient } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';

export const POST = withErrors(async (req: Request) => {
  const body = await readJson(req);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) return fail('Enter your email and password.');

  const patient = await prisma.patient.findUnique({ where: { email } });

  // Same message either way, so this cannot be used to discover which email
  // addresses have accounts.
  if (!patient || !verifyPassword(password, patient.passwordHash)) {
    return fail('Email or password is incorrect.', 401);
  }

  await createSession({ patientId: patient.id });
  return json({ patient: publicPatient(patient) });
});
