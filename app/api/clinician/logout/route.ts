import { destroySession, CLINICIAN_COOKIE } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';

export const POST = withErrors(async () => {
  await destroySession(CLINICIAN_COOKIE);
  return json({ ok: true });
});
