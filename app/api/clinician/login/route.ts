import prisma from '@/lib/server/db';
import { verifyPassword, createSession, publicClinician } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';

export const POST = withErrors(async (req: Request) => {
  const body = await readJson(req);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) return fail('Enter your email and password.');

  const clinician = await prisma.clinician.findUnique({ where: { email } });
  if (!clinician) {
    // An applicant whose password is right deserves to know where they stand,
    // rather than being told their credentials are wrong. Only when the
    // password matches, so this cannot be used to probe for applications.
    const app = await prisma.clinicianApplication.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } });
    if (app && verifyPassword(password, app.passwordHash)) {
      if (app.status === 'DECLINED') return fail('Your application was not approved. Reply to the email you received if you think this is a mistake.', 403);
      return fail('Your application is still under review. You will receive an email as soon as it has been approved.', 403);
    }
    return fail('Email or password is incorrect.', 401);
  }
  if (!verifyPassword(password, clinician.passwordHash)) {
    return fail('Email or password is incorrect.', 401);
  }
  if (!clinician.active) return fail('This account is not active. Contact the clinical team.', 403);

  await createSession({ clinicianId: clinician.id });
  return json({ clinician: publicClinician(clinician) });
});
