import prisma from '@/lib/server/db';
import { hashPassword, createSession, publicPatient } from '@/lib/server/auth';
import { json, fail, readJson, str, isEmail, withErrors } from '@/lib/server/http';

const MIN_PASSWORD = 10;

export const POST = withErrors(async (req: Request) => {
  const body = await readJson(req);
  const fullName = str(body.fullName, 120);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const country = str(body.country, 80);
  const dobRaw = str(body.dateOfBirth, 30);
  const phone = str(body.phone, 40) || null;

  if (!fullName || !email || !country || !dobRaw) return fail('Please fill in every field.');
  if (!isEmail(email)) return fail('Enter a valid email address.');
  if (password.length < MIN_PASSWORD) return fail(`Password must be at least ${MIN_PASSWORD} characters.`);

  const dateOfBirth = new Date(dobRaw);
  if (Number.isNaN(dateOfBirth.getTime())) return fail('Enter a valid date of birth.');
  if (dateOfBirth > new Date()) return fail('Date of birth cannot be in the future.');

  if (await prisma.patient.findUnique({ where: { email } })) {
    return fail('An account with that email already exists. Try signing in.', 409);
  }

  const patient = await prisma.patient.create({
    data: { email, passwordHash: hashPassword(password), fullName, dateOfBirth, country, phone },
  });

  await createSession({ patientId: patient.id });
  return json({ patient: publicPatient(patient) }, 201);
});
