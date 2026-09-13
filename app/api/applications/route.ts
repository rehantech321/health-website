import prisma from '@/lib/server/db';
import { hashPassword } from '@/lib/server/auth';
import { json, fail, readJson, str, isEmail, withErrors } from '@/lib/server/http';
import { sendApplicationToTeam } from '@/lib/server/mail';

const REQUIRED = ['fullName', 'email', 'specialty', 'country', 'qualification', 'regulator', 'regNumber', 'experience', 'hoursPerWeek', 'languages'] as const;

/// A clinician applying to join the network. Stored for credentialing review.
/// Nothing here creates a Clinician account - approval does, after the
/// regulator registration has actually been checked.
export const POST = withErrors(async (req: Request) => {
  const body = await readJson(req);
  const data: Record<string, string> = {};
  for (const key of REQUIRED) data[key] = str(body[key], key === 'email' ? 200 : 300);
  const password = typeof body.password === 'string' ? body.password : '';

  if (REQUIRED.some((k) => !data[k])) return fail('Please complete every field.');
  if (!isEmail(data.email)) return fail('Enter a valid email address.');
  if (password.length < 10) return fail('Password must be at least 10 characters.');
  data.email = data.email.toLowerCase();

  const existing = await prisma.clinicianApplication.findFirst({
    where: { email: data.email, status: { in: ['RECEIVED', 'UNDER_REVIEW'] } },
  });
  if (existing) return fail('We already have an application from this email under review.', 409);

  const application = await prisma.clinicianApplication.create({
    data: { ...(data as any), passwordHash: hashPassword(password) },
  });

  await sendApplicationToTeam({ ...data, id: application.id } as any).catch((e) => console.error('[mail] application notification failed:', e));

  return json({ received: true, id: application.id }, 201);
});
