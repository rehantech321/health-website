import prisma from '@/lib/server/db';
import { verifyPassword, createSession, publicAdmin } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';

export const POST = withErrors(async (req: Request) => {
  const body = await readJson(req);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) return fail('Enter your email and password.');

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !verifyPassword(password, admin.passwordHash)) return fail('Email or password is incorrect.', 401);
  if (!admin.active) return fail('This admin account is disabled.', 403);

  await createSession({ adminId: admin.id });
  return json({ admin: publicAdmin(admin) });
});
