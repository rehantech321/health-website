import { destroySession, PATIENT_COOKIE } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';

export const POST = withErrors(async () => {
  await destroySession(PATIENT_COOKIE);
  return json({ ok: true });
});
