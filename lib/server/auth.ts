import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { Patient, Clinician } from '@prisma/client';
import prisma from './db';
import { fail } from './http';

// ---------------------------------------------------------------- passwords
//
// scrypt with a per-password random salt. Stored as
// `scrypt$<N>$<saltHex>$<hashHex>` so the cost can be raised later without
// invalidating existing hashes.

const SCRYPT_COST = 16384;
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEYLEN, { N: SCRYPT_COST, r: 8, p: 1 });
  return `scrypt$${SCRYPT_COST}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, costStr, saltHex, hashHex] = String(stored).split('$');
    if (scheme !== 'scrypt') return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const N = Number(costStr);
    const actual = crypto.scryptSync(password, salt, expected.length, {
      N,
      r: 8,
      p: 1,
      maxmem: 128 * N * 8 * 2,
    });
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------ sessions

export const PATIENT_COOKIE = 'eldava_patient';
export const CLINICIAN_COOKIE = 'eldava_clinician';
const SESSION_DAYS = 14;

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

/// Creates a DB-backed session and sets the matching httpOnly cookie.
export async function createSession(who: { patientId?: string; clinicianId?: string }) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      patientId: who.patientId ?? null,
      clinicianId: who.clinicianId ?? null,
      expiresAt,
    },
  });

  const name = who.patientId ? PATIENT_COOKIE : CLINICIAN_COOKIE;
  cookies().set(name, token, cookieOptions(SESSION_DAYS * 24 * 60 * 60));
}

async function resolveSession(cookieName: string) {
  const token = cookies().get(cookieName)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { patient: true, clinician: true },
  });
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    // Expired sessions are cleaned up lazily, on the next attempt to use them.
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session;
}

export async function getPatient(): Promise<Patient | null> {
  const session = await resolveSession(PATIENT_COOKIE);
  return session?.patient ?? null;
}

export async function getClinician(): Promise<Clinician | null> {
  const session = await resolveSession(CLINICIAN_COOKIE);
  const clinician = session?.clinician ?? null;
  return clinician && clinician.active ? clinician : null;
}

export async function destroySession(cookieName: string) {
  const token = cookies().get(cookieName)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookies().set(cookieName, '', cookieOptions(0));
}

/// After a password change: sign out every other browser this account is in,
/// keeping only the session that made the change.
export async function destroyOtherSessions(cookieName: string, who: { patientId?: string; clinicianId?: string }) {
  const token = cookies().get(cookieName)?.value;
  const keep = token ? hashToken(token) : '';
  await prisma.session.deleteMany({
    where: {
      ...(who.patientId ? { patientId: who.patientId } : {}),
      ...(who.clinicianId ? { clinicianId: who.clinicianId } : {}),
      tokenHash: { not: keep },
    },
  });
}

/// Runs the handler only for a signed-in patient; otherwise 401.
export async function requirePatient<T>(
  handler: (patient: Patient) => Promise<T>
): Promise<T | Response> {
  const patient = await getPatient();
  if (!patient) return fail('Please sign in to continue.', 401);
  return handler(patient);
}

/// Runs the handler only for a signed-in, active clinician; otherwise 401.
export async function requireClinician<T>(
  handler: (clinician: Clinician) => Promise<T>
): Promise<T | Response> {
  const clinician = await getClinician();
  if (!clinician) return fail('Clinician sign-in required.', 401);
  return handler(clinician);
}

/// Strip secrets before a record is sent to the browser.
export function publicPatient(p: Patient) {
  return { id: p.id, fullName: p.fullName, email: p.email, country: p.country };
}

export function publicClinician(c: Clinician) {
  return { id: c.id, displayName: c.displayName, email: c.email, specialty: c.specialty };
}
